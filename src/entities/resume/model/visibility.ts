import type { ResumeEntry, ResumeSection, ResumeSubEntry } from './types';

export const splitResumeTextLines = (text: string): string[] => {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

export const normalizeBulletLine = (line: string): string => {
  return line.replace(/^[•·\-\*]\s*/, '');
};

export const isBulletLine = (line: string): boolean => {
  return /^[•·\-\*]\s*/.test(line);
};

export const hasResumeEntryContent = (entryItem: ResumeEntry): boolean => {
  return Boolean(entryItem.title.trim() || entryItem.mark.trim() || entryItem.detail.trim());
};

export const hasResumeSubEntryContent = (subEntryItem: ResumeSubEntry): boolean => {
  return Boolean(subEntryItem.name.trim());
};

export const getVisibleResumeEntries = (section: ResumeSection): ResumeEntry[] => {
  return section.entry.filter((entryItem) => !entryItem.hidden && hasResumeEntryContent(entryItem));
};

export const getVisibleResumeSubEntries = (section: ResumeSection): ResumeSubEntry[] => {
  return section.subEntry.filter((subEntryItem) => !subEntryItem.hidden && hasResumeSubEntryContent(subEntryItem));
};

export const getVisibleResumeSections = (sections: ResumeSection[]): ResumeSection[] => {
  return sections
    .filter((section) => !section.hidden)
    .map((section) => {
      return {
        ...section,
        entry: getVisibleResumeEntries(section),
        subEntry: getVisibleResumeSubEntries(section),
      };
    })
    .filter((section) => section.entry.length > 0 || section.subEntry.length > 0);
};
