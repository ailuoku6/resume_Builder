export type { ResumeFontPreset } from './font-presets';

import type { ResumeFontPreset } from './font-presets';

export interface ResumeEntry {
  id: string;
  title: string;
  detail: string;
  mark: string;
  hidden: boolean;
}

export interface ResumeSubEntry {
  id: string;
  name: string;
  hidden: boolean;
}

export interface ResumeSection {
  id: string;
  itemName: string;
  entry: ResumeEntry[];
  subEntry: ResumeSubEntry[];
  hidden: boolean;
}

export interface ResumeData {
  avatar: string | null;
  name: string;
  headline: string;
  summary: string;
  fontPreset: ResumeFontPreset;
  sex: string;
  liveAddress: string;
  phoneNum: string;
  email: string;
  items: ResumeSection[];
}

export interface ResumeState extends ResumeData {
  edit: boolean;
  open: boolean;
}
