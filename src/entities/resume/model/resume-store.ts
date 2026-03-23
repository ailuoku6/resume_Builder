import { ObservableClass, computed } from 'kisstate';

import { reorder } from '@/shared/lib/reorder';

import {
  CLOUD_DRAFT_ID_STORAGE_KEY,
  CUSTOM_SECTION_PLACEHOLDER,
  DEFAULT_FONT_PRESET,
  DEFAULT_RESUME_DATA,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  isResumeFontPreset,
} from './constants';
import type {
  ResumeData,
  ResumeEntry,
  ResumeFontPreset,
  ResumeSection,
  ResumeState,
  ResumeSubEntry,
} from './types';

type EditableBasicField =
  | 'name'
  | 'headline'
  | 'summary'
  | 'fontPreset'
  | 'sex'
  | 'liveAddress'
  | 'phoneNum'
  | 'email';

type LegacyResumeData = Partial<
  ResumeState & {
    Email: string;
  }
>;

const createId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const toSafeString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const normalizeEntry = (value: unknown): ResumeEntry => {
  const payload = (value ?? {}) as Partial<ResumeEntry>;

  return {
    id: toSafeString(payload.id, createId()),
    title: toSafeString(payload.title),
    detail: toSafeString(payload.detail),
    mark: toSafeString(payload.mark),
    hidden: typeof payload.hidden === 'boolean' ? payload.hidden : false,
  };
};

const normalizeSubEntry = (value: unknown): ResumeSubEntry => {
  const payload = (value ?? {}) as Partial<ResumeSubEntry>;

  return {
    id: toSafeString(payload.id, createId()),
    name: toSafeString(payload.name),
    hidden: typeof payload.hidden === 'boolean' ? payload.hidden : false,
  };
};

const normalizeSection = (value: unknown): ResumeSection => {
  const payload = (value ?? {}) as Partial<ResumeSection>;

  return {
    id: toSafeString(payload.id, createId()),
    itemName: toSafeString(payload.itemName, CUSTOM_SECTION_PLACEHOLDER),
    entry: Array.isArray(payload.entry) ? payload.entry.map(normalizeEntry) : [],
    subEntry: Array.isArray(payload.subEntry)
      ? payload.subEntry.map(normalizeSubEntry)
      : [],
    hidden: typeof payload.hidden === 'boolean' ? payload.hidden : false,
  };
};

const createEntry = (): ResumeEntry => {
  return {
    id: createId(),
    title: '大条目标题',
    detail: '大条目详情',
    mark: '2018-01 至 2020-3',
    hidden: false,
  };
};

const createSubEntry = (): ResumeSubEntry => {
  return {
    id: createId(),
    name: '小条目',
    hidden: false,
  };
};

const createSection = (itemName = CUSTOM_SECTION_PLACEHOLDER): ResumeSection => {
  return {
    id: createId(),
    itemName,
    entry: [],
    subEntry: [],
    hidden: false,
  };
};

@ObservableClass
export class ResumeStore implements ResumeState {
  cloudDraftId: string | null = null;

  avatar: string | null = DEFAULT_RESUME_DATA.avatar;

  name = DEFAULT_RESUME_DATA.name;

  headline = DEFAULT_RESUME_DATA.headline;

  summary = DEFAULT_RESUME_DATA.summary;

  fontPreset = DEFAULT_RESUME_DATA.fontPreset;

  sex = DEFAULT_RESUME_DATA.sex;

  liveAddress = DEFAULT_RESUME_DATA.liveAddress;

  phoneNum = DEFAULT_RESUME_DATA.phoneNum;

  email = DEFAULT_RESUME_DATA.email;

  items: ResumeSection[] = DEFAULT_RESUME_DATA.items;

  edit = true;

  open = false;

  constructor() {
    this.loadFromStorage();
    this.loadCloudDraftId();
  }

  @computed(
    'avatar',
    'name',
    'headline',
    'summary',
    'fontPreset',
    'sex',
    'liveAddress',
    'phoneNum',
    'email',
    'items',
  )
  get resumeData(): ResumeData {
    return {
      avatar: this.avatar,
      name: this.name,
      headline: this.headline,
      summary: this.summary,
      fontPreset: this.fontPreset,
      sex: this.sex,
      liveAddress: this.liveAddress,
      phoneNum: this.phoneNum,
      email: this.email,
      items: this.items,
    };
  }

  setBasicField<K extends EditableBasicField>(field: K, value: ResumeStore[K]): void {
    this[field] = value as this[K];
  }

  setAvatar(value: string | null): void {
    this.avatar = value;
  }

  setCloudDraftId(value: string | null): void {
    this.cloudDraftId = value;

    if (typeof window === 'undefined') {
      return;
    }

    if (value) {
      localStorage.setItem(CLOUD_DRAFT_ID_STORAGE_KEY, value);
      return;
    }

    localStorage.removeItem(CLOUD_DRAFT_ID_STORAGE_KEY);
  }

  toggleDrawer(): void {
    this.open = !this.open;
  }

  closeDrawer(): void {
    this.open = false;
  }

  toggleEdit(): void {
    this.edit = !this.edit;
  }

  addPresetSection(name: string): void {
    this.items = [...this.items, createSection(name)];
    this.closeDrawer();
  }

  addCustomSection(): void {
    this.items = [...this.items, createSection()];
  }

  removeSection(sectionId: string): void {
    this.items = this.items.filter((section) => section.id !== sectionId);
  }

  updateSectionName(sectionId: string, itemName: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      itemName,
    }));
  }

  toggleSectionHidden(sectionId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      hidden: !section.hidden,
    }));
  }

  reorderSections(oldIndex: number, newIndex: number): void {
    this.items = reorder(this.items, oldIndex, newIndex);
  }

  addEntry(sectionId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      entry: [...section.entry, createEntry()],
    }));
  }

  updateEntry(sectionId: string, entryId: string, patch: Partial<Omit<ResumeEntry, 'id'>>): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      entry: section.entry.map((item) => {
        if (item.id !== entryId) {
          return item;
        }

        return {
          ...item,
          ...patch,
        };
      }),
    }));
  }

  toggleEntryHidden(sectionId: string, entryId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      entry: section.entry.map((item) => {
        if (item.id !== entryId) {
          return item;
        }

        return {
          ...item,
          hidden: !item.hidden,
        };
      }),
    }));
  }

  removeEntry(sectionId: string, entryId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      entry: section.entry.filter((item) => item.id !== entryId),
    }));
  }

  reorderEntry(sectionId: string, oldIndex: number, newIndex: number): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      entry: reorder(section.entry, oldIndex, newIndex),
    }));
  }

  addSubEntry(sectionId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      subEntry: [...section.subEntry, createSubEntry()],
    }));
  }

  updateSubEntry(sectionId: string, subEntryId: string, name: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      subEntry: section.subEntry.map((item) => {
        if (item.id !== subEntryId) {
          return item;
        }

        return {
          ...item,
          name,
        };
      }),
    }));
  }

  toggleSubEntryHidden(sectionId: string, subEntryId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      subEntry: section.subEntry.map((item) => {
        if (item.id !== subEntryId) {
          return item;
        }

        return {
          ...item,
          hidden: !item.hidden,
        };
      }),
    }));
  }

  removeSubEntry(sectionId: string, subEntryId: string): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      subEntry: section.subEntry.filter((item) => item.id !== subEntryId),
    }));
  }

  reorderSubEntry(sectionId: string, oldIndex: number, newIndex: number): void {
    this.updateSection(sectionId, (section) => ({
      ...section,
      subEntry: reorder(section.subEntry, oldIndex, newIndex),
    }));
  }

  saveToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.resumeData));
  }

  applyResumeData(payload: ResumeData): void {
    this.hydrate(payload);
    this.saveToStorage();
  }

  resetToDefault(): void {
    this.hydrate(DEFAULT_RESUME_DATA);
    this.saveToStorage();
  }

  loadFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const payload = JSON.parse(raw) as LegacyResumeData;
      this.hydrate(payload);
    } catch (error) {
      console.warn('Failed to parse saved resume data.', error);
    }
  }

  private loadCloudDraftId(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.cloudDraftId = localStorage.getItem(CLOUD_DRAFT_ID_STORAGE_KEY);
  }

  private hydrate(payload: LegacyResumeData): void {
    this.avatar = typeof payload.avatar === 'string' ? payload.avatar : null;
    this.name = toSafeString(payload.name, DEFAULT_RESUME_DATA.name);
    this.headline = toSafeString(payload.headline, DEFAULT_RESUME_DATA.headline);
    this.summary = toSafeString(payload.summary, DEFAULT_RESUME_DATA.summary);
    this.fontPreset = isResumeFontPreset(payload.fontPreset) ? payload.fontPreset : DEFAULT_FONT_PRESET;
    this.sex = toSafeString(payload.sex, DEFAULT_RESUME_DATA.sex);
    this.liveAddress = toSafeString(payload.liveAddress, DEFAULT_RESUME_DATA.liveAddress);
    this.phoneNum = toSafeString(payload.phoneNum, DEFAULT_RESUME_DATA.phoneNum);
    this.email = toSafeString(payload.email ?? payload.Email, DEFAULT_RESUME_DATA.email);
    this.items = Array.isArray(payload.items) ? payload.items.map(normalizeSection) : [];
    this.edit = typeof payload.edit === 'boolean' ? payload.edit : true;
    this.open = typeof payload.open === 'boolean' ? payload.open : false;
  }

  private updateSection(sectionId: string, updater: (section: ResumeSection) => ResumeSection): void {
    this.items = this.items.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }

      return updater(section);
    });
  }
}

export const resumeStore = new ResumeStore();
