import React from 'react';
import { observer } from 'kisstate';

import { FONT_PRESET_OPTIONS } from '@/entities/resume/model/constants';
import type { ResumeStore } from '@/entities/resume/model/resume-store';
import { ImeInput, ImeTextarea } from '@/shared/ui/ImeInput';

import { ImagePicker } from './ImagePicker';

interface BaseInfoFormProps {
  store: ResumeStore;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

const Field: React.FC<FieldProps> = ({ label, children, className, hint }) => {
  return (
    <label className={`editor-field${className ? ` ${className}` : ''}`}>
      <span className="editor-field__label">{label}</span>
      {children}
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
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
              <ImeInput
                className="editor-input"
                placeholder="陈默"
                value={store.name}
                onValueChange={(value) => {
                  store.setBasicField('name', value);
                }}
              />
            </Field>

            <Field label="目标岗位">
              <ImeInput
                className="editor-input"
                placeholder="高级产品设计师"
                value={store.headline}
                onValueChange={(value) => {
                  store.setBasicField('headline', value);
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

            <Field label="简历字体" hint="当前仅保留稳定可导出的 OPPOSans，后续新增字体只需扩展字体预设配置。">
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
              <ImeInput
                className="editor-input"
                placeholder="北京 / 上海 / 远程"
                value={store.liveAddress}
                onValueChange={(value) => {
                  store.setBasicField('liveAddress', value);
                }}
              />
            </Field>

            <Field label="联系电话">
              <ImeInput
                className="editor-input"
                placeholder="+86 138 0000 0000"
                value={store.phoneNum}
                onValueChange={(value) => {
                  store.setBasicField('phoneNum', value);
                }}
              />
            </Field>

            <Field label="电子邮箱">
              <ImeInput
                className="editor-input"
                placeholder="name@example.com"
                value={store.email}
                onValueChange={(value) => {
                  store.setBasicField('email', value);
                }}
              />
            </Field>
          </div>

          <Field label="个人简介" className="editor-field--full">
            <ImeTextarea
              className="editor-input editor-textarea"
              rows={5}
              placeholder="用 2-4 句话概括你的方向、优势和代表成果。"
              value={store.summary}
              onValueChange={(value) => {
                store.setBasicField('summary', value);
              }}
            />
          </Field>
        </div>
      </div>
    </section>
  );
};

export const BaseInfoForm = observer(BaseInfoFormBase);
