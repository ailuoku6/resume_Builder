import React from 'react';
import { observer } from 'kisstate';
import ReactSortable from 'react-sortablejs';

import type { ResumeStore } from '@/entities/resume/model/resume-store';

import { SectionEditor } from './SectionEditor';

interface SectionListEditorProps {
  store: ResumeStore;
}

const SectionListEditorBase: React.FC<SectionListEditorProps> = ({ store }) => {
  return (
    <section className="editor-card editor-card--sections">
      <div className="editor-card__header">
        <div>
          <p className="editor-card__eyebrow">Structured Sections</p>
          <h2 className="editor-card__title">内容分区</h2>
        </div>
        <p className="editor-card__description">支持拖拽排序，按模块组织你的经历、教育和项目内容。</p>
      </div>

      {store.items.length === 0 ? (
        <div className="empty-state-panel">
          <p className="empty-state-panel__title">还没有分区内容</p>
          <p className="empty-state-panel__copy">
            先添加一个自定义分区，或者从模板里快速插入“项目经历”“教育背景”等常用模块。
          </p>
        </div>
      ) : null}

      <ReactSortable
        onChange={(_order, _sortable, evt) => {
          if (typeof evt.oldIndex !== 'number' || typeof evt.newIndex !== 'number') {
            return;
          }

          store.reorderSections(evt.oldIndex, evt.newIndex);
        }}
        options={{
          animation: 180,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          ghostClass: 'sortable-ghost',
        }}
      >
        {store.items.map((section) => {
          return <SectionEditor key={section.id} store={store} section={section} />;
        })}
      </ReactSortable>

      <div className="section-list-actions">
        <button
          type="button"
          className="section-list-button section-list-button--primary"
          onClick={() => {
            store.addCustomSection();
          }}
        >
          + 添加自定义分区
        </button>

        <button
          type="button"
          className="section-list-button section-list-button--secondary"
          onClick={() => {
            store.toggleDrawer();
          }}
        >
          从模板添加
        </button>
      </div>
    </section>
  );
};

export const SectionListEditor = observer(SectionListEditorBase);
