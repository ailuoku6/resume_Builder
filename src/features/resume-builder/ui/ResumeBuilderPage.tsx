import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { observer } from 'kisstate';

import { resumeStore } from '@/entities/resume/model/resume-store';
import GeneratedResumeDocument from '@/features/resume-preview/ui/GeneratedResumeDocument';
import { GeneratedResumePreview } from '@/features/resume-preview/ui/GeneratedResumePreview';

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
  const fileName = `${sanitizeFileName(resumeStore.name)}-resume.pdf`;
  const navigationItems = buildNavigationItems();

  return (
    <div className="builder-shell">
      <AddSectionDrawer store={resumeStore} />

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
              resumeStore.saveToStorage();
            }}
          >
            保存草稿
          </button>

          <PDFDownloadLink
            document={<GeneratedResumeDocument data={resumeStore.resumeData} />}
            fileName={fileName}
            className="topbar-button topbar-button--primary"
          >
            {({ loading }: { loading: boolean }) => {
              return loading ? '生成中...' : '导出 PDF';
            }}
          </PDFDownloadLink>
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
