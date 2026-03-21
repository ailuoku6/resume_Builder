import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import { observer } from 'kisstate';
import ReactSortable from 'react-sortablejs';

import type { ResumeStore } from '@/entities/resume/model/resume-store';
import type { ResumeSection } from '@/entities/resume/model/types';

interface SectionEditorProps {
  store: ResumeStore;
  section: ResumeSection;
}

const getSortIndexes = (evt: {
  oldIndex?: number;
  newIndex?: number;
}): [number, number] | null => {
  if (typeof evt.oldIndex !== 'number' || typeof evt.newIndex !== 'number') {
    return null;
  }

  if (evt.oldIndex === evt.newIndex) {
    return null;
  }

  return [evt.oldIndex, evt.newIndex];
};

const SectionEditorBase: React.FC<SectionEditorProps> = ({ store, section }) => {
  const hasContent = section.entry.length > 0 || section.subEntry.length > 0;

  return (
    <section className="section-editor">
      <div className="section-editor__header">
        <div className="section-editor__title-row">
          <span className="section-editor__drag">⋮⋮</span>
          <input
            className="section-editor__title-input"
            value={section.itemName}
            placeholder="输入分区标题"
            onChange={(event) => {
              store.updateSectionName(section.id, event.target.value);
            }}
          />
        </div>

        <button
          type="button"
          className="section-editor__delete"
          aria-label="删除模块"
          onClick={() => {
            store.removeSection(section.id);
          }}
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      {!hasContent ? (
        <div className="section-editor__empty">
          这个分区还是空的，可以添加“经历条目”或“列表项”来组织内容。
        </div>
      ) : null}

      <ReactSortable
        onChange={(_order, _sortable, evt) => {
          const indexes = getSortIndexes(evt);

          if (!indexes) {
            return;
          }

          store.reorderEntry(section.id, indexes[0], indexes[1]);
        }}
        options={{
          animation: 180,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          ghostClass: 'sortable-ghost',
        }}
      >
        {section.entry.map((entryItem) => {
          return (
            <div key={entryItem.id} className="entry-editor-card">
              <div className="entry-editor-card__top">
                <span className="entry-editor-card__badge">经历条目</span>
                <button
                  type="button"
                  className="entry-editor-card__remove"
                  onClick={() => {
                    store.removeEntry(section.id, entryItem.id);
                  }}
                >
                  删除
                </button>
              </div>

              <div className="editor-form-grid editor-form-grid--two">
                <label className="editor-field">
                  <span className="editor-field__label">标题</span>
                  <input
                    className="editor-input"
                    placeholder="公司 / 学校 / 项目名称"
                    value={entryItem.title}
                    onChange={(event) => {
                      store.updateEntry(section.id, entryItem.id, {
                        title: event.target.value,
                      });
                    }}
                  />
                </label>

                <label className="editor-field">
                  <span className="editor-field__label">时间 / 标记</span>
                  <input
                    className="editor-input"
                    placeholder="2021.06 - 至今"
                    value={entryItem.mark}
                    onChange={(event) => {
                      store.updateEntry(section.id, entryItem.id, {
                        mark: event.target.value,
                      });
                    }}
                  />
                </label>
              </div>

              <label className="editor-field editor-field--full">
                <span className="editor-field__label">描述内容</span>
                <textarea
                  className="editor-input editor-textarea"
                  rows={4}
                  placeholder="描述职责、项目结果或关键亮点。支持多行输入。"
                  value={entryItem.detail}
                  onChange={(event) => {
                    store.updateEntry(section.id, entryItem.id, {
                      detail: event.target.value,
                    });
                  }}
                />
              </label>
            </div>
          );
        })}
      </ReactSortable>

      <ReactSortable
        onChange={(_order, _sortable, evt) => {
          const indexes = getSortIndexes(evt);

          if (!indexes) {
            return;
          }

          store.reorderSubEntry(section.id, indexes[0], indexes[1]);
        }}
        options={{
          animation: 180,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          ghostClass: 'sortable-ghost',
        }}
      >
        {section.subEntry.map((subEntryItem) => {
          return (
            <div key={subEntryItem.id} className="entry-editor-card entry-editor-card--compact">
              <div className="entry-editor-card__top">
                <span className="entry-editor-card__badge entry-editor-card__badge--secondary">
                  列表项
                </span>
                <button
                  type="button"
                  className="entry-editor-card__remove"
                  onClick={() => {
                    store.removeSubEntry(section.id, subEntryItem.id);
                  }}
                >
                  删除
                </button>
              </div>

              <label className="editor-field editor-field--full">
                <span className="editor-field__label">列表内容</span>
                <textarea
                  className="editor-input editor-textarea"
                  rows={3}
                  placeholder="适合填写技能清单、项目亮点、奖项列表等简短内容。"
                  value={subEntryItem.name}
                  onChange={(event) => {
                    store.updateSubEntry(section.id, subEntryItem.id, event.target.value);
                  }}
                />
              </label>
            </div>
          );
        })}
      </ReactSortable>

      <div className="section-editor__actions">
        <button
          type="button"
          className="section-editor__action section-editor__action--primary"
          onClick={() => {
            store.addEntry(section.id);
          }}
        >
          + 添加经历条目
        </button>

        <button
          type="button"
          className="section-editor__action section-editor__action--secondary"
          onClick={() => {
            store.addSubEntry(section.id);
          }}
        >
          + 添加列表项
        </button>
      </div>
    </section>
  );
};

export const SectionEditor = observer(SectionEditorBase);
