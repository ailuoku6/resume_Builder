import React from 'react';
import { observer } from 'kisstate';

import type { ResumeStore } from '@/entities/resume/model/resume-store';

import { ImagePicker } from './ImagePicker';

interface ResumeIdentityCardProps {
  store: ResumeStore;
}

const ResumeIdentityCardBase: React.FC<ResumeIdentityCardProps> = ({ store }) => {
  return (
    <div className="base-info-wrap">
      <ImagePicker
        width="25mm"
        height="35mm"
        alt="也可以不传入照片"
        img={store.avatar}
        onChange={(value) => {
          store.setAvatar(value);
        }}
      />

      <div className="info-detail">
        <div className="aline">
          <div className="name">{store.name}</div>
          <div className="sex">{store.sex}</div>
        </div>
        <div className="address">{'居住地：' + store.liveAddress}</div>
        <div className="aline">
          <div className="phone">{'手机  ' + store.phoneNum}</div>
          <div className="email">{'邮箱  ' + store.email}</div>
        </div>
      </div>
    </div>
  );
};

export const ResumeIdentityCard = observer(ResumeIdentityCardBase);
