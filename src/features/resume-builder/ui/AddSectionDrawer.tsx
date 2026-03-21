import React from 'react';
import { Drawer, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'kisstate';

import { PRESET_SECTIONS } from '@/entities/resume/model/constants';
import type { ResumeStore } from '@/entities/resume/model/resume-store';

interface AddSectionDrawerProps {
  store: ResumeStore;
}

const AddSectionDrawerBase: React.FC<AddSectionDrawerProps> = ({ store }) => {
  return (
    <Drawer
      anchor="left"
      open={store.open}
      onClose={() => {
        store.closeDrawer();
      }}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ className: 'template-drawer-paper' }}
    >
      <div className="template-drawer">
        <div className="template-drawer__header">
          <div>
            <p className="template-drawer__eyebrow">Preset Sections</p>
            <h2 className="template-drawer__title">快速添加常用模块</h2>
          </div>
          <IconButton
            aria-label="关闭模板抽屉"
            onClick={() => {
              store.closeDrawer();
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <p className="template-drawer__description">
          点击即可插入分区，适合快速补齐教育背景、项目经历、获奖情况等内容。
        </p>

        <div className="template-drawer__list">
          {PRESET_SECTIONS.map((itemName) => {
            return (
              <button
                type="button"
                className="template-drawer__item"
                key={itemName}
                onClick={() => {
                  store.addPresetSection(itemName);
                }}
              >
                <span className="template-drawer__item-icon">
                  <AddIcon fontSize="small" />
                </span>
                <span className="template-drawer__item-text">{itemName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};

export const AddSectionDrawer = observer(AddSectionDrawerBase);
