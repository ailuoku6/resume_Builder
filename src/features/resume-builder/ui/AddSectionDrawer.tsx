import React from 'react';
import { Drawer, IconButton } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'kisstate';

import { PRESET_SECTIONS } from '@/entities/resume/model/constants';
import type { ResumeStore } from '@/entities/resume/model/resume-store';

interface AddSectionDrawerProps {
  store: ResumeStore;
}

const AddSectionDrawerBase: React.FC<AddSectionDrawerProps> = ({ store }) => {
  const closeTimerRef = React.useRef<number | null>(null);
  const isDesktopHoverMode = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 901px)');

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    if (!isDesktopHoverMode) {
      return;
    }

    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      store.closeDrawer();
    }, 140);
  }, [clearCloseTimer, isDesktopHoverMode, store]);

  React.useEffect(() => {
    if (!isDesktopHoverMode) {
      clearCloseTimer();
    }

    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer, isDesktopHoverMode]);

  const handleLauncherOpen = React.useCallback(() => {
    clearCloseTimer();
    store.openDrawer();
  }, [clearCloseTimer, store]);

  const handleLauncherClick = React.useCallback(() => {
    clearCloseTimer();

    if (isDesktopHoverMode) {
      store.openDrawer();
      return;
    }

    store.toggleDrawer();
  }, [clearCloseTimer, isDesktopHoverMode, store]);

  return (
    <>
      <button
        type="button"
        className={`template-drawer-launcher${
          isDesktopHoverMode ? ' template-drawer-launcher--desktop' : ' template-drawer-launcher--mobile'
        }${store.open ? ' template-drawer-launcher--active' : ''}`}
        aria-label="添加常用分区"
        aria-expanded={store.open}
        onClick={handleLauncherClick}
        onMouseEnter={() => {
          if (isDesktopHoverMode) {
            handleLauncherOpen();
          }
        }}
        onMouseLeave={() => {
          scheduleClose();
        }}
        onFocus={() => {
          if (isDesktopHoverMode) {
            handleLauncherOpen();
          }
        }}
      >
        <span className="template-drawer-launcher__icon">
          <AddIcon fontSize="small" />
        </span>
        <span className="template-drawer-launcher__content">
          <span className="template-drawer-launcher__title">常用分区</span>
        </span>
      </button>

      <Drawer
        anchor="left"
        open={store.open}
        onClose={() => {
          store.closeDrawer();
        }}
        hideBackdrop={isDesktopHoverMode}
        ModalProps={{
          keepMounted: true,
          disableAutoFocus: isDesktopHoverMode,
          disableEnforceFocus: isDesktopHoverMode,
          disableRestoreFocus: isDesktopHoverMode,
        }}
        PaperProps={{
          className: `template-drawer-paper${isDesktopHoverMode ? ' template-drawer-paper--hover' : ''}`,
        }}
      >
        <div
          className="template-drawer"
          onMouseEnter={() => {
            if (isDesktopHoverMode) {
              clearCloseTimer();
            }
          }}
          onMouseLeave={() => {
            scheduleClose();
          }}
        >
          <div className="template-drawer__header">
            <div>
              <p className="template-drawer__eyebrow">Preset Sections</p>
              <h2 className="template-drawer__title">快速添加常用模块</h2>
            </div>
            <IconButton
              aria-label="关闭模板抽屉"
              className={`template-drawer__close${isDesktopHoverMode ? ' template-drawer__close--desktop' : ''}`}
              onClick={() => {
                store.closeDrawer();
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <p className="template-drawer__description">
            直接插入教育背景、项目经历、职业技能等常用模块，省去从空白分区逐个搭建的步骤。
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
    </>
  );
};

export const AddSectionDrawer = observer(AddSectionDrawerBase);
