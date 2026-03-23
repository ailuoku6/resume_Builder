import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { observer } from 'kisstate';

import { authStore } from '@/entities/auth/model/auth-store';
import type { CloudDraftSummary } from '@/entities/auth/model/types';
import { AccountDrawer } from '@/features/auth/ui/AccountDrawer';
import { AuthDialog } from '@/features/auth/ui/AuthDialog';
import { CloudDraftDrawer } from '@/features/auth/ui/CloudDraftDrawer';
import { resumeStore } from '@/entities/resume/model/resume-store';
import GeneratedResumeDocument from '@/features/resume-preview/ui/GeneratedResumeDocument';
import { GeneratedResumePreview } from '@/features/resume-preview/ui/GeneratedResumePreview';
import { loadAuthSession } from '@/shared/api/auth';
import {
  deleteCloudResumeDraft,
  loadCloudResumeDraft,
  saveCloudResumeDraft,
} from '@/shared/api/cloudResume';
import { ApiRequestError } from '@/shared/api/http';

import { AddSectionDrawer } from './AddSectionDrawer';
import { BaseInfoForm } from './BaseInfoForm';
import { SectionListEditor } from './SectionListEditor';
import './ResumeBuilderPage.css';

const sanitizeFileName = (value: string): string => {
  const normalized = value.trim().replace(/[\\/:*?"<>|]/g, '');

  return normalized || 'resume';
};

const buildNavigationItems = (): string[] => {
  const labels = ['个人信息', ...resumeStore.items.map((section) => section.itemName.trim())].filter(Boolean);

  return labels.slice(0, 5);
};

const ResumeBuilderPageBase: React.FC = () => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [saveLabel, setSaveLabel] = React.useState('保存草稿');
  const navigationItems = buildNavigationItems();
  const saveLabelTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!authStore.token) {
      return;
    }

    let cancelled = false;

    const verifySession = async (): Promise<void> => {
      try {
        const user = await loadAuthSession();

        if (cancelled) {
          return;
        }

        authStore.setSession(authStore.token as string, user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiRequestError && error.status === 401) {
          authStore.clearSession();
          resumeStore.setCloudDraftId(null);
        }
      }
    };

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (saveLabelTimerRef.current !== null) {
        window.clearTimeout(saveLabelTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const draftId = params.get('draft');

    if (!draftId) {
      return;
    }

    if (!authStore.isAuthenticated) {
      authStore.openAuthDialog();
      return;
    }

    let cancelled = false;

    const syncDraftFromCloud = async (): Promise<void> => {
      try {
        const draft = await loadCloudResumeDraft(draftId);

        if (cancelled) {
          return;
        }

        resumeStore.applyResumeData(draft.data);
        resumeStore.setCloudDraftId(draft.draftId);
        setSaveLabel('已加载云端草稿');
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          authStore.clearSession();
          authStore.openAuthDialog();
        }

        console.warn('Failed to load cloud resume draft.', error);
      } finally {
        if (cancelled) {
          return;
        }

        if (saveLabelTimerRef.current !== null) {
          window.clearTimeout(saveLabelTimerRef.current);
        }

        saveLabelTimerRef.current = window.setTimeout(() => {
          setSaveLabel('保存草稿');
        }, 2400);
      }
    };

    void syncDraftFromCloud();

    return () => {
      cancelled = true;
    };
  }, [authStore.isAuthenticated]);

  const updateSaveLabel = (value: string, timeout = 2400): void => {
    setSaveLabel(value);

    if (saveLabelTimerRef.current !== null) {
      window.clearTimeout(saveLabelTimerRef.current);
    }

    saveLabelTimerRef.current = window.setTimeout(() => {
      setSaveLabel('保存草稿');
    }, timeout);
  };

  const syncDraftUrl = (draftId: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('draft', draftId);
    window.history.replaceState({}, '', url.toString());
  };

  const clearDraftUrl = (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('draft');
    window.history.replaceState({}, '', url.toString());
  };

  const handleCreateBlankResume = (): void => {
    resumeStore.resetToDefault();
    resumeStore.setCloudDraftId(null);
    clearDraftUrl();
    updateSaveLabel('已新建空白简历');
    authStore.closeDraftsDrawer();
  };

  const handleLoadDraft = async (draftId: string): Promise<void> => {
    try {
      const draft = await loadCloudResumeDraft(draftId);

      resumeStore.applyResumeData(draft.data);
      resumeStore.setCloudDraftId(draft.draftId);
      syncDraftUrl(draft.draftId);
      updateSaveLabel('已切换云端草稿');
      authStore.closeDraftsDrawer();
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        authStore.clearSession();
        authStore.openAuthDialog();
      }

      window.alert(error instanceof Error ? error.message : '加载云端草稿失败。');
    }
  };

  const handleSaveAsNewDraft = async (): Promise<void> => {
    if (!authStore.isAuthenticated) {
      authStore.openAuthDialog();
      return;
    }

    if (isSavingDraft) {
      return;
    }

    resumeStore.saveToStorage();
    setIsSavingDraft(true);
    setSaveLabel('另存中...');

    try {
      const draft = await saveCloudResumeDraft(resumeStore.resumeData, null);
      resumeStore.setCloudDraftId(draft.draftId);
      syncDraftUrl(draft.draftId);
      updateSaveLabel('已另存为新草稿');
      authStore.closeDraftsDrawer();
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        authStore.clearSession();
        authStore.openAuthDialog();
      }

      window.alert(error instanceof Error ? error.message : '另存为新草稿失败。');
      updateSaveLabel('已保存到本地');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDeleteDraft = async (draft: CloudDraftSummary): Promise<void> => {
    const confirmed = window.confirm(`确定要删除“${draft.name}”吗？删除后无法恢复。`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteCloudResumeDraft(draft.draftId);
      authStore.setDrafts(authStore.drafts.filter((item) => item.draftId !== draft.draftId));

      if (resumeStore.cloudDraftId === draft.draftId) {
        resumeStore.setCloudDraftId(null);
        clearDraftUrl();
        updateSaveLabel('当前云端草稿已删除，本地内容已保留');
      } else {
        updateSaveLabel('草稿已删除');
      }
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        authStore.clearSession();
        authStore.openAuthDialog();
      }

      window.alert(error instanceof Error ? error.message : '删除草稿失败。');
    }
  };

  const handleExport = async (): Promise<void> => {
    if (isExporting) {
      return;
    }

    const data = resumeStore.resumeData;
    const exportFileName = `${sanitizeFileName(data.name)}-resume.pdf`;

    setIsExporting(true);

    try {
      const blob = await pdf(<GeneratedResumeDocument data={data} />).toBlob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = blobUrl;
      anchor.download = exportFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error('Failed to export resume PDF.', error);
      window.alert('导出 PDF 失败，请稍后重试。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (isSavingDraft) {
      return;
    }

    resumeStore.saveToStorage();

    if (!authStore.isAuthenticated) {
      updateSaveLabel('已保存到本地');
      authStore.openAuthDialog();
      return;
    }

    setIsSavingDraft(true);
    setSaveLabel('保存中...');

    try {
      const draft = await saveCloudResumeDraft(resumeStore.resumeData, resumeStore.cloudDraftId);

      resumeStore.setCloudDraftId(draft.draftId);
      syncDraftUrl(draft.draftId);
      updateSaveLabel('已保存到云端');
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        authStore.clearSession();
        authStore.openAuthDialog();
      }

      console.warn('Failed to save resume draft to Cloudflare backend.', error);
      updateSaveLabel('已保存到本地');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleLogout = (): void => {
    authStore.clearSession();
    resumeStore.setCloudDraftId(null);
    clearDraftUrl();
    updateSaveLabel('已退出登录');
  };

  return (
    <div className="builder-shell">
      <AddSectionDrawer store={resumeStore} />
      <AuthDialog />
      <AccountDrawer
        onLogout={() => {
          handleLogout();
        }}
      />
      <CloudDraftDrawer
        activeDraftId={resumeStore.cloudDraftId}
        onSelectDraft={(draft: CloudDraftSummary) => {
          void handleLoadDraft(draft.draftId);
        }}
        onDeleteDraft={(draft: CloudDraftSummary) => {
          void handleDeleteDraft(draft);
        }}
        onCreateBlankDraft={() => {
          handleCreateBlankResume();
        }}
        onSaveAsNewDraft={() => {
          void handleSaveAsNewDraft();
        }}
      />

      <header className="builder-topbar">
        <div className="builder-branding">
          <div className="builder-brand">Resume Atelier</div>
          <div className="builder-brand-subtitle">左侧编辑，右侧实时预览</div>
        </div>

        <nav className="builder-nav" aria-label="简历分区">
          {navigationItems.map((label, index) => {
            return (
              <span key={`${label}-${index}`} className="builder-nav__item">
                {label}
              </span>
            );
          })}
        </nav>

        <div className="builder-actions">
          {authStore.isAuthenticated ? (
            <>
              <button
                type="button"
                className="topbar-button topbar-button--account"
                onClick={() => {
                  authStore.openAccountDrawer();
                }}
              >
                {authStore.user?.displayName || authStore.user?.email}
              </button>

              <button
                type="button"
                className="topbar-button topbar-button--ghost"
                onClick={() => {
                  authStore.openDraftsDrawer();
                }}
              >
                我的草稿
              </button>
            </>
          ) : (
            <button
              type="button"
              className="topbar-button topbar-button--ghost"
              onClick={() => {
                authStore.openAuthDialog();
              }}
            >
              登录 / 注册
            </button>
          )}

          <button
            type="button"
            className="topbar-button topbar-button--ghost"
            onClick={() => {
              resumeStore.toggleDrawer();
            }}
          >
            模板分区
          </button>

          <button
            type="button"
            className="topbar-button topbar-button--subtle"
            onClick={() => {
              void handleSave();
            }}
            disabled={isSavingDraft}
          >
            {saveLabel}
          </button>

          <button
            type="button"
            className="topbar-button topbar-button--primary"
            onClick={() => {
              void handleExport();
            }}
            disabled={isExporting}
          >
            {isExporting ? '生成中...' : '导出 PDF'}
          </button>
        </div>
      </header>

      <main className="builder-workspace">
        <section className="editor-pane">
          <div className="editor-pane__inner">
            <BaseInfoForm store={resumeStore} />
            <SectionListEditor store={resumeStore} />
          </div>
        </section>

        <section className="preview-pane">
          <div className="preview-surface">
            <div className="preview-surface__header">
              <div>
                <p className="preview-surface__eyebrow">Live Preview</p>
                <h2 className="preview-surface__title">实时预览</h2>
              </div>
              <p className="preview-surface__hint">生成简历采用单列排版，便于打印和导出。</p>
            </div>

            <div className="preview-frame">
              <GeneratedResumePreview data={resumeStore.resumeData} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export const ResumeBuilderPage = observer(ResumeBuilderPageBase);
