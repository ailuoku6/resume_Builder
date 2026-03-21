import React from 'react';
import {
  Button,
  ButtonGroup,
  IconButton,
  TextField,
} from '@material-ui/core';
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
  return (
    <div className="section-wrap">
      <div className="section-name">
        <div className="inline-actions">
          <TextField
            value={section.itemName}
            onChange={(event) => {
              store.updateSectionName(section.id, event.target.value);
            }}
          />
          <IconButton
            aria-label="删除模块"
            onClick={() => {
              store.removeSection(section.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      <div className="content">
        <ReactSortable
          onChange={(_order, _sortable, evt) => {
            const indexes = getSortIndexes(evt);

            if (!indexes) {
              return;
            }

            store.reorderEntry(section.id, indexes[0], indexes[1]);
          }}
          options={{
            animation: 150,
            easing: 'cubic-bezier(1, 0, 0, 1)',
            ghostClass: 'sortable-ghost',
            disabled: !store.edit,
          }}
        >
          {section.entry.map((entryItem) => {
            return (
              <div key={entryItem.id} className="entry-item">
                <div className="entry-title">
                  <TextField
                    value={entryItem.title}
                    onChange={(event) => {
                      store.updateEntry(section.id, entryItem.id, {
                        title: event.target.value,
                      });
                    }}
                  />
                  <TextField
                    value={entryItem.mark}
                    onChange={(event) => {
                      store.updateEntry(section.id, entryItem.id, {
                        mark: event.target.value,
                      });
                    }}
                  />
                </div>

                <div>
                  <TextField
                    className="full-input"
                    value={entryItem.detail}
                    multiline
                    onChange={(event) => {
                      store.updateEntry(section.id, entryItem.id, {
                        detail: event.target.value,
                      });
                    }}
                  />
                  <IconButton
                    aria-label="删除大条目"
                    onClick={() => {
                      store.removeEntry(section.id, entryItem.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
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
            animation: 150,
            easing: 'cubic-bezier(1, 0, 0, 1)',
            ghostClass: 'sortable-ghost',
            disabled: !store.edit,
          }}
        >
          {section.subEntry.map((subEntryItem) => {
            return (
              <div key={subEntryItem.id}>
                <TextField
                  style={{ width: '70%' }}
                  value={subEntryItem.name}
                  onChange={(event) => {
                    store.updateSubEntry(section.id, subEntryItem.id, event.target.value);
                  }}
                />
                <IconButton
                  aria-label="删除小条目"
                  onClick={() => {
                    store.removeSubEntry(section.id, subEntryItem.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            );
          })}
        </ReactSortable>

        <div>
          <ButtonGroup variant="contained" color="primary" aria-label="添加条目">
            <Button
              disabled={section.subEntry.length > 0}
              onClick={() => {
                store.addEntry(section.id);
              }}
            >
              添加大条目
            </Button>
            <Button
              onClick={() => {
                store.addSubEntry(section.id);
              }}
            >
              添加小条目
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
};

export const SectionEditor = observer(SectionEditorBase);
