import {
  DEFAULT_FONT_PRESET,
  FONT_PRESET_OPTIONS,
  isResumeFontPreset,
} from './font-presets';
import type { ResumeData } from './types';

export { DEFAULT_FONT_PRESET, FONT_PRESET_OPTIONS, isResumeFontPreset } from './font-presets';

export const STORAGE_KEY = 'resume-builder:data:v2';
export const LEGACY_STORAGE_KEY = 'data';
export const CLOUD_DRAFT_ID_STORAGE_KEY = 'resume-builder:cloud-draft-id';

export const CUSTOM_SECTION_PLACEHOLDER = '请输入大项名称，如教育背景';

export const PRESET_SECTIONS: string[] = [
  '在校经历',
  '竞赛经历',
  '获奖经历',
  '论文期刊',
  '兴趣爱好',
  '考研信息',
  '求职意向',
  '项目经历',
  '职业技能',
  '资格证书',
  '教育背景',
];

export const DEFAULT_RESUME_DATA: ResumeData = {
  avatar: null,
  name: '张三',
  headline: '',
  summary: '',
  fontPreset: DEFAULT_FONT_PRESET,
  sex: '男',
  liveAddress: '广西省玉林市',
  phoneNum: '17235653225',
  email: 'xxx',
  items: [],
};
