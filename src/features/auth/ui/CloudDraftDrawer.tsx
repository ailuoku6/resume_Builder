import React from 'react';
import { Drawer, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RefreshIcon from '@material-ui/icons/Refresh';
import { observer } from 'kisstate';

import { authStore } from '@/entities/auth/model/auth-store';
import type { CloudDraftSummary } from '@/entities/auth/model/types';
import { listCloudResumeDrafts } from '@/shared/api/cloudResume';

interface CloudDraftDrawerProps {
  activeDraftId: string | null;
  onSelectDraft: (draft: CloudDraftSummary) => void;
}

const CloudDraftDrawerBase: React.FC<CloudDraftDrawerProps> = ({ activeDraftId, onSelectDraft }) => {
  const [errorText, setErrorText] = React.useState('');

  const loadDrafts = React.useCallback(async (): Promise<void> => {
    if (!authStore.isAuthenticated) {
      return;
    }

    authStore.setDraftsLoading(true);
    setErrorText('');

    try {
      const drafts = await listCloudResumeDrafts();
      authStore.setDrafts(drafts);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '加载草稿失败。');
    } finally {
      authStore.setDraftsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!authStore.draftsDrawerOpen) {
      return;
    }

    void loadDrafts();
  }, [loadDrafts, authStore.draftsDrawerOpen]);

  return (
    <Drawer
      anchor="right"
      open={authStore.draftsDrawerOpen}
      onClose={() => {
        authStore.closeDraftsDrawer();
      }}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ className: 'cloud-drafts-drawer-paper' }}
    >
      <div className="cloud-drafts-drawer">
        <div className="cloud-drafts-drawer__header">
          <div>
            <p className="template-drawer__eyebrow">My Drafts</p>
            <h2 className="template-drawer__title">我的云端草稿</h2>
          </div>

          <div className="cloud-drafts-drawer__header-actions">
            <IconButton
              aria-label="刷新草稿列表"
              onClick={() => {
                void loadDrafts();
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="关闭草稿抽屉"
              onClick={() => {
                authStore.closeDraftsDrawer();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <p className="template-drawer__description">
          当前账号下的草稿会按用户隔离展示，数据库中仅保存加密后的内容。
        </p>

        {errorText ? <p className="cloud-drafts-drawer__error">{errorText}</p> : null}

        <div className="cloud-drafts-drawer__list">
          {authStore.draftsLoading ? (
            <p className="cloud-drafts-drawer__empty">正在加载草稿...</p>
          ) : null}

          {!authStore.draftsLoading && authStore.drafts.length === 0 ? (
            <p className="cloud-drafts-drawer__empty">还没有云端草稿，先保存一次当前简历吧。</p>
          ) : null}

          {!authStore.draftsLoading
            ? authStore.drafts.map((draft) => {
                const isActive = draft.draftId === activeDraftId;

                return (
                  <button
                    type="button"
                    key={draft.draftId}
                    className={`cloud-drafts-drawer__item${
                      isActive ? ' cloud-drafts-drawer__item--active' : ''
                    }`}
                    onClick={() => {
                      onSelectDraft(draft);
                    }}
                  >
                    <span className="cloud-drafts-drawer__item-name">{draft.name}</span>
                    <span className="cloud-drafts-drawer__item-meta">
                      {new Date(draft.updatedAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </button>
                );
              })
            : null}
        </div>
      </div>
    </Drawer>
  );
};

export const CloudDraftDrawer = observer(CloudDraftDrawerBase);
