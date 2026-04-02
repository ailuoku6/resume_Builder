import type {
  ResumeData,
  ResumeSection,
} from '@/entities/resume/model/types';
import {
  getVisibleResumeEntries,
  getVisibleResumeSubEntries,
  isBulletLine,
  normalizeBulletLine,
  splitResumeTextLines,
} from '@/entities/resume/model/visibility';

export interface ResumeTextLineModel {
  id: string;
  bullet: boolean;
  text: string;
}

export interface ResumeEntryBlockModel {
  id: string;
  kind: 'entry';
  title: string;
  mark: string;
  lines: ResumeTextLineModel[];
}

export interface ResumeSubEntryBlockModel {
  id: string;
  kind: 'subEntry';
  lines: ResumeTextLineModel[];
}

export type ResumeSectionBlockModel = ResumeEntryBlockModel | ResumeSubEntryBlockModel;

export interface ResumeContactItemModel {
  label: string;
  value: string;
}

const buildResumeTextLineModels = (text: string, keyPrefix: string): ResumeTextLineModel[] => {
  return splitResumeTextLines(text).map((line, index) => {
    const bullet = isBulletLine(line);
    const content = normalizeBulletLine(line);

    return {
      id: `${keyPrefix}-${index}`,
      bullet,
      text: bullet ? `• ${content}` : content,
    };
  });
};

export const buildResumeSummaryLines = (text: string): ResumeTextLineModel[] => {
  return buildResumeTextLineModels(text, 'summary');
};

export const buildResumeContactItems = (
  data: Pick<ResumeData, 'phoneNum' | 'email' | 'liveAddress' | 'sex'>,
): ResumeContactItemModel[] => {
  return [
    { label: 'Phone', value: data.phoneNum },
    { label: 'Email', value: data.email },
    { label: 'Location', value: data.liveAddress },
    { label: 'Gender', value: data.sex },
  ].filter((item) => item.value.trim());
};

export const buildResumeSectionBlocks = (section: ResumeSection): ResumeSectionBlockModel[] => {
  const entryBlocks: ResumeEntryBlockModel[] = getVisibleResumeEntries(section).map((entryItem) => ({
    id: entryItem.id,
    kind: 'entry',
    title: entryItem.title || '未命名条目',
    mark: entryItem.mark.trim(),
    lines: buildResumeTextLineModels(entryItem.detail || '', entryItem.id),
  }));

  const subEntryBlocks: ResumeSubEntryBlockModel[] = getVisibleResumeSubEntries(section).map((subEntryItem) => ({
    id: subEntryItem.id,
    kind: 'subEntry',
    lines: buildResumeTextLineModels(subEntryItem.name || '', subEntryItem.id),
  }));

  return [...entryBlocks, ...subEntryBlocks];
};
