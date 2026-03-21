import React from 'react';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { observer } from 'kisstate';
import ReactSortable from 'react-sortablejs';

import type { ResumeStore } from '@/entities/resume/model/resume-store';

import { SectionEditor } from './SectionEditor';

interface SectionListEditorProps {
  store: ResumeStore;
}

const SectionListEditorBase: React.FC<SectionListEditorProps> = ({ store }) => {
  return (
    <div className="section-list-wrap">
      <ReactSortable
        onChange={(_order, _sortable, evt) => {
          if (typeof evt.oldIndex !== 'number' || typeof evt.newIndex !== 'number') {
            return;
          }

          store.reorderSections(evt.oldIndex, evt.newIndex);
        }}
        options={{
          animation: 150,
          easing: 'cubic-bezier(1, 0, 0, 1)',
          ghostClass: 'sortable-ghost',
          disabled: !store.edit,
        }}
      >
        {store.items.map((section) => {
          return <SectionEditor key={section.id} store={store} section={section} />;
        })}
      </ReactSortable>

      <div className="floating-add">
        <Fab
          color="primary"
          aria-label="添加大项"
          onClick={() => {
            store.addCustomSection();
          }}
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};

export const SectionListEditor = observer(SectionListEditorBase);
