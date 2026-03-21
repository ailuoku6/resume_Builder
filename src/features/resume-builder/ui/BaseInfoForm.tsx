import React from 'react';
import { observer } from 'kisstate';

import { FONT_PRESET_OPTIONS } from '@/entities/resume/model/constants';
import type { ResumeStore } from '@/entities/resume/model/resume-store';

import { ImagePicker } from './ImagePicker';

interface BaseInfoFormProps {
  store: ResumeStore;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const Field: React.FC<FieldProps> = ({ label, children, className }) => {
  return (
    <label className={`editor-field${className ? ` ${className}` : ''}`}>
      <span className="editor-field__label">{label}</span>
      {children}
    </label>
  );
};

const BaseInfoFormBase: React.FC<BaseInfoFormProps> = ({ store }) => {
  return (
    <section className="editor-card editor-card--hero">
      <div className="editor-card__header">
        <div>
          <p className="editor-card__eyebrow">Personal Profile</p>
          <h2 className="editor-card__title">个人信息</h2>
        </div>
        <p className="editor-card__description">先把头部信息补全，右侧预览会同步更新。</p>
      </div>

      <div className="identity-layout">
        <div className="identity-layout__media">
          <ImagePicker
            width="126px"
            height="168px"
            alt="简历头像"
            img={store.avatar}
            onChange={(value) => {
              store.setAvatar(value);
            }}
          />
          <p className="identity-layout__tip">建议上传清晰证件照，导出的 PDF 会直接使用这张图片。</p>
        </div>

        <div className="identity-layout__fields">
          <div className="editor-form-grid editor-form-grid--two">
            <Field label="姓名">
              <input
                className="editor-input"
                placeholder="陈默"
                value={store.name}
                onChange={(event) => {
                  store.setBasicField('name', event.target.value);
                }}
              />
            </Field>

            <Field label="目标岗位">
              <input
                className="editor-input"
                placeholder="高级产品设计师"
                value={store.headline}
                onChange={(event) => {
                  store.setBasicField('headline', event.target.value);
                }}
              />
            </Field>

            <Field label="性别">
              <select
                className="editor-input editor-select"
                value={store.sex}
                onChange={(event) => {
                  store.setBasicField('sex', event.target.value);
                }}
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </Field>

            <Field label="简历字体">
              <select
                className="editor-input editor-select"
                value={store.fontPreset}
                onChange={(event) => {
                  store.setBasicField('fontPreset', event.target.value as typeof store.fontPreset);
                }}
              >
                {FONT_PRESET_OPTIONS.map((option) => {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </select>
            </Field>

            <Field label="居住地">
              <input
                className="editor-input"
                placeholder="北京 / 上海 / 远程"
                value={store.liveAddress}
                onChange={(event) => {
                  store.setBasicField('liveAddress', event.target.value);
                }}
              />
            </Field>

            <Field label="联系电话">
              <input
                className="editor-input"
                placeholder="+86 138 0000 0000"
                value={store.phoneNum}
                onChange={(event) => {
                  store.setBasicField('phoneNum', event.target.value);
                }}
              />
            </Field>

            <Field label="电子邮箱">
              <input
                className="editor-input"
                placeholder="name@example.com"
                value={store.email}
                onChange={(event) => {
                  store.setBasicField('email', event.target.value);
                }}
              />
            </Field>
          </div>

          <Field label="个人简介" className="editor-field--full">
            <textarea
              className="editor-input editor-textarea"
              rows={5}
              placeholder="用 2-4 句话概括你的方向、优势和代表成果。"
              value={store.summary}
              onChange={(event) => {
                store.setBasicField('summary', event.target.value);
              }}
            />
          </Field>
        </div>
      </div>
    </section>
  );
};

export const BaseInfoForm = observer(BaseInfoFormBase);
