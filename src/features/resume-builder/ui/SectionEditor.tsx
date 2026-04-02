import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import { observer } from 'kisstate';
import ReactSortable from 'react-sortablejs';

import type { ResumeStore } from '@/entities/resume/model/resume-store';
import type { ResumeSection } from '@/entities/resume/model/types';
import { ImeInput, ImeTextarea } from '@/shared/ui/ImeInput';

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
  const sectionCollapsed = section.hidden;

  return (
    <section
      className={`section-editor${section.hidden ? ' section-editor--hidden' : ''}`}
      data-section-id={section.id}
    >
      <div className="section-editor__header">
        <div className="section-editor__title-row">
          <span className="section-editor__drag">⋮⋮</span>
          <ImeInput
            className="section-editor__title-input"
            value={section.itemName}
            placeholder="输入分区标题"
            onValueChange={(value) => {
              store.updateSectionName(section.id, value);
            }}
          />
        </div>

        <div className="section-editor__header-actions">
          <button
            type="button"
            className={`visibility-toggle${section.hidden ? ' visibility-toggle--hidden' : ''}`}
            onClick={() => {
              store.toggleSectionHidden(section.id);
            }}
          >
            {section.hidden ? '显示分区' : '隐藏分区'}
          </button>

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
      </div>

      {section.hidden ? (
        <div className="section-editor__status">这个分区已隐藏，预览与导出都不会展示它的内容。</div>
      ) : null}

      {!sectionCollapsed && !hasContent ? (
        <div className="section-editor__empty">
          这个分区还是空的，可以添加“经历条目”或“列表项”来组织内容。
        </div>
      ) : null}

      {!sectionCollapsed ? (
        <>
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
              handle: '.entry-editor-card__drag',
              ghostClass: 'sortable-ghost',
            }}
          >
            {section.entry.map((entryItem) => {
              const entryCollapsed = entryItem.hidden;

              return (
                <div
                  key={entryItem.id}
                  className={`entry-editor-card${entryItem.hidden ? ' entry-editor-card--hidden' : ''}`}
                  data-entry-id={entryItem.id}
                >
                  <div className="entry-editor-card__top">
                    <div className="entry-editor-card__top-meta">
                      <span className="entry-editor-card__drag" aria-hidden="true">
                        ⋮⋮
                      </span>
                      <span className="entry-editor-card__badge">经历条目</span>
                      {entryItem.hidden ? (
                        <span className="entry-editor-card__visibility-state">已隐藏</span>
                      ) : null}
                    </div>
                    <div className="entry-editor-card__actions">
                      <button
                        type="button"
                        className={`visibility-toggle${entryItem.hidden ? ' visibility-toggle--hidden' : ''}`}
                        onClick={() => {
                          store.toggleEntryHidden(section.id, entryItem.id);
                        }}
                      >
                        {entryItem.hidden ? '显示条目' : '隐藏条目'}
                      </button>
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
                  </div>

                  {entryItem.hidden ? (
                    <div className="entry-editor-card__status">这个经历条目已隐藏，预览与导出不会展示。</div>
                  ) : null}

                  {!entryCollapsed ? (
                    <>
                      <div className="editor-form-grid editor-form-grid--two">
                        <label className="editor-field">
                          <span className="editor-field__label">标题</span>
                          <ImeInput
                            className="editor-input"
                            placeholder="公司 / 学校 / 项目名称"
                            value={entryItem.title}
                            onValueChange={(value) => {
                              store.updateEntry(section.id, entryItem.id, {
                                title: value,
                              });
                            }}
                          />
                        </label>

                        <label className="editor-field">
                          <span className="editor-field__label">时间 / 标记</span>
                          <ImeInput
                            className="editor-input"
                            placeholder="2021.06 - 至今"
                            value={entryItem.mark}
                            onValueChange={(value) => {
                              store.updateEntry(section.id, entryItem.id, {
                                mark: value,
                              });
                            }}
                          />
                        </label>
                      </div>

                      <label className="editor-field editor-field--full">
                        <span className="editor-field__label">描述内容</span>
                        <ImeTextarea
                          className="editor-input editor-textarea"
                          rows={4}
                          placeholder="描述职责、项目结果或关键亮点。支持多行输入。"
                          value={entryItem.detail}
                          onValueChange={(value) => {
                            store.updateEntry(section.id, entryItem.id, {
                              detail: value,
                            });
                          }}
                        />
                      </label>
                    </>
                  ) : null}
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
              handle: '.entry-editor-card__drag',
              ghostClass: 'sortable-ghost',
            }}
          >
            {section.subEntry.map((subEntryItem) => {
              const subEntryCollapsed = subEntryItem.hidden;

              return (
                <div
                  key={subEntryItem.id}
                  className={`entry-editor-card entry-editor-card--compact${
                    subEntryItem.hidden ? ' entry-editor-card--hidden' : ''
                  }`}
                  data-sub-entry-id={subEntryItem.id}
                >
                  <div className="entry-editor-card__top">
                    <div className="entry-editor-card__top-meta">
                      <span className="entry-editor-card__drag" aria-hidden="true">
                        ⋮⋮
                      </span>
                      <span className="entry-editor-card__badge entry-editor-card__badge--secondary">
                        列表项
                      </span>
                      {subEntryItem.hidden ? (
                        <span className="entry-editor-card__visibility-state">已隐藏</span>
                      ) : null}
                    </div>
                    <div className="entry-editor-card__actions">
                      <button
                        type="button"
                        className={`visibility-toggle${subEntryItem.hidden ? ' visibility-toggle--hidden' : ''}`}
                        onClick={() => {
                          store.toggleSubEntryHidden(section.id, subEntryItem.id);
                        }}
                      >
                        {subEntryItem.hidden ? '显示列表项' : '隐藏列表项'}
                      </button>
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
                  </div>

                  {subEntryItem.hidden ? (
                    <div className="entry-editor-card__status">这个列表项已隐藏，预览与导出不会展示。</div>
                  ) : null}

                  {!subEntryCollapsed ? (
                    <label className="editor-field editor-field--full">
                      <span className="editor-field__label">列表内容</span>
                      <ImeTextarea
                        className="editor-input editor-textarea"
                        rows={3}
                        placeholder="适合填写技能清单、项目亮点、奖项列表等简短内容。"
                        value={subEntryItem.name}
                        onValueChange={(value) => {
                          store.updateSubEntry(section.id, subEntryItem.id, value);
                        }}
                      />
                    </label>
                  ) : null}
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
        </>
      ) : null}
    </section>
  );
};

export const SectionEditor = observer(SectionEditorBase);
