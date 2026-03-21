import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@material-ui/core';
import { observer } from 'kisstate';

import type { ResumeStore } from '@/entities/resume/model/resume-store';

interface BaseInfoFormProps {
  store: ResumeStore;
}

const BaseInfoFormBase: React.FC<BaseInfoFormProps> = ({ store }) => {
  return (
    <Paper style={{ marginBottom: 20 }} elevation={3} square className="resume-paper">
      <form>
        <div>
          <TextField
            label="姓名"
            value={store.name}
            onChange={(event) => {
              store.setBasicField('name', event.target.value);
            }}
          />
          <FormControl>
            <InputLabel>性别</InputLabel>
            <Select
              value={store.sex}
              onChange={(event) => {
                store.setBasicField('sex', String(event.target.value));
              }}
            >
              <MenuItem value="男">男</MenuItem>
              <MenuItem value="女">女</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <TextField
            style={{ width: '45%' }}
            label="居住地"
            value={store.liveAddress}
            onChange={(event) => {
              store.setBasicField('liveAddress', event.target.value);
            }}
          />
          <TextField
            style={{ width: '45%' }}
            label="手机"
            value={store.phoneNum}
            onChange={(event) => {
              store.setBasicField('phoneNum', event.target.value);
            }}
          />
        </div>
        <div>
          <TextField
            style={{ width: '45%' }}
            label="邮箱"
            value={store.email}
            onChange={(event) => {
              store.setBasicField('email', event.target.value);
            }}
          />
        </div>
      </form>
    </Paper>
  );
};

export const BaseInfoForm = observer(BaseInfoFormBase);
