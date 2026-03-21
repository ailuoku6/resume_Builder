import type { ResumeData } from './types';

export const STORAGE_KEY = 'resume-builder:data:v2';
export const LEGACY_STORAGE_KEY = 'data';

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
  name: '潜伏',
  sex: '男',
  liveAddress: '广西省玉林市',
  phoneNum: '17235653225',
  email: 'xxx',
  items: [],
};
