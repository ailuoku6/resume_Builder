import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { observer } from 'kisstate';

import { PRESET_SECTIONS } from '@/entities/resume/model/constants';
import type { ResumeStore } from '@/entities/resume/model/resume-store';

interface AddSectionDrawerProps {
  store: ResumeStore;
}

const AddSectionDrawerBase: React.FC<AddSectionDrawerProps> = ({ store }) => {
  return (
    <Drawer
      style={{ width: 240 }}
      variant="persistent"
      anchor="left"
      open={store.open}
      onClose={() => {
        store.closeDrawer();
      }}
    >
      <div style={{ width: 240 }}>
        <List>
          {PRESET_SECTIONS.map((itemName) => {
            return (
              <ListItem
                button
                key={itemName}
                onClick={() => {
                  if (!store.edit) {
                    return;
                  }

                  store.addPresetSection(itemName);
                }}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={itemName} />
              </ListItem>
            );
          })}
        </List>
      </div>
    </Drawer>
  );
};

export const AddSectionDrawer = observer(AddSectionDrawerBase);
