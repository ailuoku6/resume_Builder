import {
  DEFAULT_FONT_PRESET,
  FONT_PRESET_OPTIONS,
  isResumeFontPreset,
} from './font-presets';
import type { ResumeData, ResumeEntry, ResumeSubEntry } from './types';

export { DEFAULT_FONT_PRESET, FONT_PRESET_OPTIONS, isResumeFontPreset } from './font-presets';

export const STORAGE_KEY = 'resume-builder:data:v2';
export const LEGACY_STORAGE_KEY = 'data';
export const CLOUD_DRAFT_ID_STORAGE_KEY = 'resume-builder:cloud-draft-id';

export const CUSTOM_SECTION_PLACEHOLDER = '请输入大项名称，如教育背景';

export const PRESET_SECTIONS: string[] = [
  '教育背景',
  '项目经历',
  '在校经历',
  '职业技能',
  '竞赛经历',
  '获奖经历',
  '资格证书',
  '求职意向',
  '论文期刊',
  '考研信息',
  '兴趣爱好',
];

type EntryTemplate = Omit<ResumeEntry, 'id' | 'hidden'>;
type SubEntryTemplate = Omit<ResumeSubEntry, 'id' | 'hidden'>;

type SectionTemplate = {
  matches: string[];
  entry: EntryTemplate;
  subEntry: SubEntryTemplate;
};

const DEFAULT_ENTRY_TEMPLATE: EntryTemplate = {
  title: '条目标题',
  detail: '请填写与该模块相关的职责、成果或补充说明。',
  mark: '起止时间 / 补充信息',
};

const DEFAULT_SUB_ENTRY_TEMPLATE: SubEntryTemplate = {
  name: '请填写与该模块相关的关键要点',
};

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    matches: ['教育背景', '教育', '学历', '学校', 'education'],
    entry: {
      title: 'XX大学 · XX专业',
      detail:
        '学历：本科\n主修课程：数据结构、操作系统、数据库原理\n成绩 / 荣誉：GPA 3.8 / 4.0，连续两年获得奖学金',
      mark: '2020.09 - 2024.06',
    },
    subEntry: {
      name: '主修课程：数据结构、计算机网络、操作系统',
    },
  },
  {
    matches: ['项目经历', '项目', 'project'],
    entry: {
      title: 'XX项目',
      detail: '项目简介：...\n负责内容：...\n项目成果：...',
      mark: '2023.03 - 2023.06',
    },
    subEntry: {
      name: '负责核心功能设计与落地，推动项目按期上线',
    },
  },
  {
    matches: ['在校经历', '校园', '学生组织', '社团'],
    entry: {
      title: 'XX学生组织 / 校园项目',
      detail: '担任角色：...\n主要工作：...\n结果产出：...',
      mark: '2022.09 - 2023.06',
    },
    subEntry: {
      name: '组织策划校园活动，协调 20+ 名同学完成执行',
    },
  },
  {
    matches: ['竞赛经历', '竞赛', '比赛', 'contest'],
    entry: {
      title: 'XX竞赛',
      detail: '参赛方向：...\n承担职责：...\n比赛结果：...',
      mark: '2023.05',
    },
    subEntry: {
      name: '负责方案设计与答辩展示，获得省级二等奖',
    },
  },
  {
    matches: ['获奖经历', '获奖', '奖项', 'award'],
    entry: {
      title: 'XX奖项',
      detail: '获奖级别：校级 / 省级 / 国家级\n获奖原因：...\n证明成果：...',
      mark: '2023.12',
    },
    subEntry: {
      name: '2023 年国家奖学金',
    },
  },
  {
    matches: ['论文期刊', '论文', '期刊', 'paper', 'publication'],
    entry: {
      title: '《论文标题》',
      detail: '发表期刊 / 会议：...\n作者排序：...\n研究方向与成果：...',
      mark: '2024.01',
    },
    subEntry: {
      name: '研究方向：自然语言处理 / 推荐系统',
    },
  },
  {
    matches: ['兴趣爱好', '兴趣', '爱好', 'hobby'],
    entry: {
      title: '兴趣方向',
      detail: '例如：阅读、羽毛球、摄影\n相关特点：长期投入、持续输出、可体现个人特质',
      mark: '长期保持',
    },
    subEntry: {
      name: '羽毛球，校队训练两年',
    },
  },
  {
    matches: ['考研信息', '考研', '升学', '读研'],
    entry: {
      title: '报考院校 / 专业',
      detail: '目标院校：...\n初试成绩：...\n复试情况：...',
      mark: '初试时间：2024.12',
    },
    subEntry: {
      name: '英语一 / 政治 / 数学 / 专业课，总分 380+',
    },
  },
  {
    matches: ['求职意向', '求职', '意向', 'job'],
    entry: {
      title: '目标岗位',
      detail: '期望岗位：前端开发工程师\n期望城市：上海 / 杭州\n可到岗时间：一个月内',
      mark: '期望城市 / 到岗时间',
    },
    subEntry: {
      name: '期望岗位：产品经理，期望城市：上海',
    },
  },
  {
    matches: ['职业技能', '专业技能', '技能', 'skill'],
    entry: {
      title: '专业技能',
      detail:
        '技能栈：React、TypeScript、Node.js\n工具：Git、Figma、Notion\n能力说明：可独立完成需求拆解与上线',
      mark: '熟练度 / 使用年限',
    },
    subEntry: {
      name: '熟悉 React、TypeScript、Vite 与组件化开发',
    },
  },
  {
    matches: ['资格证书', '证书', 'cert'],
    entry: {
      title: 'XX证书',
      detail: '证书等级 / 成绩：...\n相关能力说明：...',
      mark: '获证时间：2023.06',
    },
    subEntry: {
      name: '大学英语六级 CET-6，550 分',
    },
  },
  {
    matches: ['工作经历', '实习经历', '实习', '工作', 'intern'],
    entry: {
      title: 'XX公司 · XX岗位',
      detail: '岗位职责：...\n核心工作：...\n结果产出：...',
      mark: '2023.06 - 2023.09',
    },
    subEntry: {
      name: '独立负责需求跟进与上线，协同产品和研发推进交付',
    },
  },
];

const normalizeSectionName = (value: string): string => {
  return value.trim().replace(/\s+/g, '').toLowerCase();
};

const getTemplateForSection = (sectionName: string): SectionTemplate | null => {
  const normalizedSectionName = normalizeSectionName(sectionName);

  if (!normalizedSectionName) {
    return null;
  }

  return (
    SECTION_TEMPLATES.find((template) => {
      return template.matches.some((match) =>
        normalizedSectionName.includes(normalizeSectionName(match)),
      );
    }) ?? null
  );
};

export const getDefaultEntryForSection = (sectionName: string): EntryTemplate => {
  const template = getTemplateForSection(sectionName);

  return template ? { ...template.entry } : { ...DEFAULT_ENTRY_TEMPLATE };
};

export const getDefaultSubEntryForSection = (sectionName: string): SubEntryTemplate => {
  const template = getTemplateForSection(sectionName);

  return template ? { ...template.subEntry } : { ...DEFAULT_SUB_ENTRY_TEMPLATE };
};

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
