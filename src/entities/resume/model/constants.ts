import type { ResumeData, ResumeFontPreset } from './types';

export const STORAGE_KEY = 'resume-builder:data:v2';
export const LEGACY_STORAGE_KEY = 'data';

export const CUSTOM_SECTION_PLACEHOLDER = '请输入大项名称，如教育背景';

export const DEFAULT_FONT_PRESET: ResumeFontPreset = 'oppo';

export const FONT_PRESET_OPTIONS: Array<{
  value: ResumeFontPreset;
  label: string;
}> = [
  { value: 'oppo', label: 'OPPOSans' },
  { value: 'hiragino', label: '系统黑体' },
  { value: 'songti', label: '系统宋体' },
];

export const isResumeFontPreset = (value: unknown): value is ResumeFontPreset => {
  return FONT_PRESET_OPTIONS.some((option) => option.value === value);
};

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
  name: '潜伏',
  headline: '',
  summary: '',
  fontPreset: DEFAULT_FONT_PRESET,
  sex: '男',
  liveAddress: '广西省玉林市',
  phoneNum: '17235653225',
  email: 'xxx',
  items: [],
};
