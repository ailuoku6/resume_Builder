import type { CSSProperties } from 'react';

import type { ResumeSectionBlockModel } from './render-model';

export const RESUME_PREVIEW_COLORS = {
  pageText: '#191c1e',
  primary: '#091426',
  strongText: '#0f172a',
  accent: '#2170e4',
  body: '#455163',
  muted: '#7b8494',
  contactLabel: '#72809a',
  contactBackground: '#f3f6fb',
  heroDivider: '#dbe5f2',
  sectionDivider: '#ebecef',
} as const;

export const RESUME_LAYOUT_PX = {
  pagePaddingTop: 36,
  pagePaddingHorizontal: 40,
  pagePaddingBottom: 42,
  heroPaddingBottom: 18,
  heroGap: 20,
  avatarWidth: 78,
  avatarHeight: 104,
  avatarRadius: 4,
  nameFontSize: 36,
  nameLetterSpacing: -2.16,
  headlineMarginTop: 6,
  headlineFontSize: 12,
  headlineLetterSpacing: 2.16,
  contactRowMarginTop: 14,
  contactGap: 8,
  contactPaddingY: 7,
  contactPaddingX: 10,
  contactRadius: 4,
  contactLabelFontSize: 9,
  contactLabelLetterSpacing: 1.26,
  contactValueFontSize: 12,
  contactValueMarginTop: 2,
  sectionMarginTop: 14,
  sectionTitlePaddingBottom: 8,
  sectionTitleFontSize: 12,
  sectionTitleLetterSpacing: 1.2,
  sectionBodyMarginTop: 14,
  subEntrySectionBodyMarginTop: 10,
  entryToEntryGap: 14,
  entryToSubEntryGap: 8,
  subEntryToSubEntryGap: 4,
  entryHeaderGap: 16,
  entryHeaderMarginBottom: 4,
  entryTitleFontSize: 14,
  entryMarkFontSize: 11,
  paragraphMarginTop: 4,
  paragraphFontSize: 12,
  paragraphLineHeight: 1.6,
  emptyTextMarginTop: 12,
} as const;

export const pxToPt = (value: number): number => {
  return Number((value * 0.75).toFixed(2));
};

export const A4_PAGE_WIDTH_PT = 595.28;
export const PAGE_HORIZONTAL_PADDING_PT = pxToPt(RESUME_LAYOUT_PX.pagePaddingHorizontal);
export const PAGE_CONTENT_WIDTH_PT = A4_PAGE_WIDTH_PT - PAGE_HORIZONTAL_PADDING_PT * 2;
export const HERO_AVATAR_WIDTH_PT = pxToPt(RESUME_LAYOUT_PX.avatarWidth);
export const HERO_AVATAR_GAP_PT = pxToPt(RESUME_LAYOUT_PX.heroGap);
export const HERO_CONTENT_WIDTH_WITH_AVATAR_PT =
  PAGE_CONTENT_WIDTH_PT - HERO_AVATAR_WIDTH_PT - HERO_AVATAR_GAP_PT;
export const CONTACT_ITEM_HORIZONTAL_PADDING_PT = pxToPt(RESUME_LAYOUT_PX.contactPaddingX * 2);
export const ENTRY_TITLE_GAP_PT = pxToPt(RESUME_LAYOUT_PX.entryHeaderGap);
export const MIN_ENTRY_TITLE_WIDTH_PT = pxToPt(160);

type PdfStyle = Record<string, string | number>;

export interface ResumePreviewStyles {
  page: CSSProperties;
  hero: CSSProperties;
  heroWithDivider: CSSProperties;
  heroMain: CSSProperties;
  heroContent: CSSProperties;
  avatar: CSSProperties;
  name: CSSProperties;
  headline: CSSProperties;
  contactRow: CSSProperties;
  contactItem: CSSProperties;
  contactLabel: CSSProperties;
  contactValue: CSSProperties;
  section: CSSProperties;
  anchor: CSSProperties;
  sectionTitle: CSSProperties;
  sectionTitlePlain: CSSProperties;
  sectionBody: CSSProperties;
  entryHeader: CSSProperties;
  entryTitle: CSSProperties;
  entryMark: CSSProperties;
  paragraph: CSSProperties;
  emptyText: CSSProperties;
}

export interface ResumePdfStyles {
  page: PdfStyle;
  hero: PdfStyle;
  heroWithDivider: PdfStyle;
  heroMain: PdfStyle;
  heroContent: PdfStyle;
  avatar: PdfStyle;
  name: PdfStyle;
  headline: PdfStyle;
  contactRow: PdfStyle;
  contactItem: PdfStyle;
  contactLabel: PdfStyle;
  contactValue: PdfStyle;
  section: PdfStyle;
  sectionTitle: PdfStyle;
  sectionTitlePlain: PdfStyle;
  sectionBody: PdfStyle;
  entryHeader: PdfStyle;
  entryTitle: PdfStyle;
  entryMark: PdfStyle;
  paragraph: PdfStyle;
  paragraphText: PdfStyle;
  emptyText: PdfStyle;
}

export const getHeroTextWidthPt = (hasAvatar: boolean): number => {
  return hasAvatar ? HERO_CONTENT_WIDTH_WITH_AVATAR_PT : PAGE_CONTENT_WIDTH_PT;
};

export const getResumeBlockWrapperMarginTopPx = (
  previousBlock: ResumeSectionBlockModel | null,
  currentBlock: ResumeSectionBlockModel,
): number => {
  if (!previousBlock) {
    return 0;
  }

  if (previousBlock.kind === 'subEntry' && currentBlock.kind === 'subEntry') {
    return RESUME_LAYOUT_PX.subEntryToSubEntryGap;
  }

  if (previousBlock.kind === 'entry' && currentBlock.kind === 'subEntry') {
    return RESUME_LAYOUT_PX.entryToSubEntryGap;
  }

  return RESUME_LAYOUT_PX.entryToEntryGap;
};

export const getResumeBlockWrapperMarginTopPt = (
  previousBlock: ResumeSectionBlockModel | null,
  currentBlock: ResumeSectionBlockModel,
): number => {
  return pxToPt(getResumeBlockWrapperMarginTopPx(previousBlock, currentBlock));
};

export const getSectionBodyMarginTopPx = (firstBlock: ResumeSectionBlockModel | null): number => {
  if (firstBlock?.kind === 'subEntry') {
    return RESUME_LAYOUT_PX.subEntrySectionBodyMarginTop;
  }

  return RESUME_LAYOUT_PX.sectionBodyMarginTop;
};

export const getSectionBodyMarginTopPt = (firstBlock: ResumeSectionBlockModel | null): number => {
  return pxToPt(getSectionBodyMarginTopPx(firstBlock));
};

export const createResumePreviewStyles = (previewFontFamily: string): ResumePreviewStyles => {
  return {
    page: {
      width: 'min(100%, 210mm)',
      minHeight: 'calc(297mm - 8px)',
      margin: '0 auto',
      paddingTop: RESUME_LAYOUT_PX.pagePaddingTop,
      paddingRight: RESUME_LAYOUT_PX.pagePaddingHorizontal,
      paddingBottom: RESUME_LAYOUT_PX.pagePaddingBottom,
      paddingLeft: RESUME_LAYOUT_PX.pagePaddingHorizontal,
      background: '#ffffff',
      color: RESUME_PREVIEW_COLORS.pageText,
      fontFamily: previewFontFamily,
      boxSizing: 'border-box',
    },
    hero: {
      paddingBottom: RESUME_LAYOUT_PX.heroPaddingBottom,
    },
    heroWithDivider: {
      borderBottom: `1px solid ${RESUME_PREVIEW_COLORS.heroDivider}`,
    },
    heroMain: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: RESUME_LAYOUT_PX.heroGap,
    },
    heroContent: {
      flex: 1,
      minWidth: 0,
    },
    avatar: {
      display: 'block',
      flexShrink: 0,
      width: RESUME_LAYOUT_PX.avatarWidth,
      height: RESUME_LAYOUT_PX.avatarHeight,
      borderRadius: RESUME_LAYOUT_PX.avatarRadius,
      objectFit: 'cover',
    },
    name: {
      margin: 0,
      color: RESUME_PREVIEW_COLORS.primary,
      fontSize: RESUME_LAYOUT_PX.nameFontSize,
      fontWeight: 800,
      letterSpacing: RESUME_LAYOUT_PX.nameLetterSpacing,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    headline: {
      margin: `${RESUME_LAYOUT_PX.headlineMarginTop}px 0 0`,
      color: RESUME_PREVIEW_COLORS.accent,
      fontSize: RESUME_LAYOUT_PX.headlineFontSize,
      fontWeight: 800,
      letterSpacing: RESUME_LAYOUT_PX.headlineLetterSpacing,
      textTransform: 'uppercase',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    contactRow: {
      display: 'flex',
      flexWrap: 'wrap',
      marginTop: RESUME_LAYOUT_PX.contactRowMarginTop,
    },
    contactItem: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: RESUME_LAYOUT_PX.contactGap,
      marginBottom: RESUME_LAYOUT_PX.contactGap,
      paddingTop: RESUME_LAYOUT_PX.contactPaddingY,
      paddingRight: RESUME_LAYOUT_PX.contactPaddingX,
      paddingBottom: RESUME_LAYOUT_PX.contactPaddingY,
      paddingLeft: RESUME_LAYOUT_PX.contactPaddingX,
      borderRadius: RESUME_LAYOUT_PX.contactRadius,
      background: RESUME_PREVIEW_COLORS.contactBackground,
    },
    contactLabel: {
      color: RESUME_PREVIEW_COLORS.contactLabel,
      fontSize: RESUME_LAYOUT_PX.contactLabelFontSize,
      fontWeight: 800,
      letterSpacing: RESUME_LAYOUT_PX.contactLabelLetterSpacing,
      textTransform: 'uppercase',
      whiteSpace: 'pre-wrap',
    },
    contactValue: {
      marginTop: RESUME_LAYOUT_PX.contactValueMarginTop,
      color: RESUME_PREVIEW_COLORS.strongText,
      fontSize: RESUME_LAYOUT_PX.contactValueFontSize,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    section: {
      marginTop: RESUME_LAYOUT_PX.sectionMarginTop,
    },
    anchor: {
      height: 0,
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    },
    sectionTitle: {
      margin: 0,
      paddingBottom: RESUME_LAYOUT_PX.sectionTitlePaddingBottom,
      borderBottom: `1px solid ${RESUME_PREVIEW_COLORS.sectionDivider}`,
      color: RESUME_PREVIEW_COLORS.primary,
      fontSize: RESUME_LAYOUT_PX.sectionTitleFontSize,
      fontWeight: 800,
      letterSpacing: RESUME_LAYOUT_PX.sectionTitleLetterSpacing,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    sectionTitlePlain: {
      paddingBottom: 0,
      borderBottom: 'none',
    },
    sectionBody: {
      marginTop: RESUME_LAYOUT_PX.sectionBodyMarginTop,
    },
    entryHeader: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: RESUME_LAYOUT_PX.entryHeaderGap,
      marginBottom: RESUME_LAYOUT_PX.entryHeaderMarginBottom,
    },
    entryTitle: {
      margin: 0,
      flex: 1,
      color: RESUME_PREVIEW_COLORS.strongText,
      fontSize: RESUME_LAYOUT_PX.entryTitleFontSize,
      fontWeight: 700,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    entryMark: {
      color: RESUME_PREVIEW_COLORS.muted,
      fontSize: RESUME_LAYOUT_PX.entryMarkFontSize,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      textAlign: 'right',
    },
    paragraph: {
      margin: `${RESUME_LAYOUT_PX.paragraphMarginTop}px 0 0`,
      color: RESUME_PREVIEW_COLORS.body,
      fontSize: RESUME_LAYOUT_PX.paragraphFontSize,
      lineHeight: RESUME_LAYOUT_PX.paragraphLineHeight,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    emptyText: {
      marginTop: RESUME_LAYOUT_PX.emptyTextMarginTop,
      fontSize: RESUME_LAYOUT_PX.paragraphFontSize,
      color: RESUME_PREVIEW_COLORS.muted,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
  };
};

export const createResumePdfStyles = (pdfFontFamily: string): ResumePdfStyles => {
  return {
    page: {
      paddingTop: pxToPt(RESUME_LAYOUT_PX.pagePaddingTop),
      paddingRight: pxToPt(RESUME_LAYOUT_PX.pagePaddingHorizontal),
      paddingBottom: pxToPt(RESUME_LAYOUT_PX.pagePaddingBottom),
      paddingLeft: pxToPt(RESUME_LAYOUT_PX.pagePaddingHorizontal),
      backgroundColor: '#ffffff',
      color: RESUME_PREVIEW_COLORS.pageText,
      fontFamily: pdfFontFamily,
    },
    hero: {
      paddingBottom: pxToPt(RESUME_LAYOUT_PX.heroPaddingBottom),
    },
    heroWithDivider: {
      borderBottomWidth: pxToPt(1),
      borderBottomColor: RESUME_PREVIEW_COLORS.heroDivider,
    },
    heroMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    heroContent: {
      flex: 1,
    },
    avatar: {
      width: pxToPt(RESUME_LAYOUT_PX.avatarWidth),
      height: pxToPt(RESUME_LAYOUT_PX.avatarHeight),
      marginRight: pxToPt(RESUME_LAYOUT_PX.heroGap),
      borderRadius: pxToPt(RESUME_LAYOUT_PX.avatarRadius),
    },
    name: {
      fontSize: pxToPt(RESUME_LAYOUT_PX.nameFontSize),
      fontWeight: 'bold',
      color: RESUME_PREVIEW_COLORS.primary,
      letterSpacing: pxToPt(RESUME_LAYOUT_PX.nameLetterSpacing),
    },
    headline: {
      marginTop: pxToPt(RESUME_LAYOUT_PX.headlineMarginTop),
      fontSize: pxToPt(RESUME_LAYOUT_PX.headlineFontSize),
      fontWeight: 'bold',
      color: RESUME_PREVIEW_COLORS.accent,
      letterSpacing: pxToPt(RESUME_LAYOUT_PX.headlineLetterSpacing),
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: pxToPt(RESUME_LAYOUT_PX.contactRowMarginTop),
    },
    contactItem: {
      marginRight: pxToPt(RESUME_LAYOUT_PX.contactGap),
      marginBottom: pxToPt(RESUME_LAYOUT_PX.contactGap),
      paddingTop: pxToPt(RESUME_LAYOUT_PX.contactPaddingY),
      paddingRight: pxToPt(RESUME_LAYOUT_PX.contactPaddingX),
      paddingBottom: pxToPt(RESUME_LAYOUT_PX.contactPaddingY),
      paddingLeft: pxToPt(RESUME_LAYOUT_PX.contactPaddingX),
      borderRadius: pxToPt(RESUME_LAYOUT_PX.contactRadius),
      backgroundColor: RESUME_PREVIEW_COLORS.contactBackground,
    },
    contactLabel: {
      fontSize: pxToPt(RESUME_LAYOUT_PX.contactLabelFontSize),
      fontWeight: 'bold',
      color: RESUME_PREVIEW_COLORS.contactLabel,
      letterSpacing: pxToPt(RESUME_LAYOUT_PX.contactLabelLetterSpacing),
    },
    contactValue: {
      marginTop: pxToPt(RESUME_LAYOUT_PX.contactValueMarginTop),
      fontSize: pxToPt(RESUME_LAYOUT_PX.contactValueFontSize),
      color: RESUME_PREVIEW_COLORS.strongText,
    },
    section: {
      marginTop: pxToPt(RESUME_LAYOUT_PX.sectionMarginTop),
    },
    sectionTitle: {
      paddingBottom: pxToPt(RESUME_LAYOUT_PX.sectionTitlePaddingBottom),
      borderBottomWidth: pxToPt(1),
      borderBottomColor: RESUME_PREVIEW_COLORS.sectionDivider,
      fontSize: pxToPt(RESUME_LAYOUT_PX.sectionTitleFontSize),
      fontWeight: 'bold',
      color: RESUME_PREVIEW_COLORS.primary,
      letterSpacing: pxToPt(RESUME_LAYOUT_PX.sectionTitleLetterSpacing),
    },
    sectionTitlePlain: {
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    sectionBody: {
      marginTop: pxToPt(RESUME_LAYOUT_PX.sectionBodyMarginTop),
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: pxToPt(RESUME_LAYOUT_PX.entryHeaderMarginBottom),
    },
    entryTitle: {
      flex: 1,
      paddingRight: pxToPt(RESUME_LAYOUT_PX.entryHeaderGap),
      fontSize: pxToPt(RESUME_LAYOUT_PX.entryTitleFontSize),
      fontWeight: 'bold',
      color: RESUME_PREVIEW_COLORS.strongText,
    },
    entryMark: {
      fontSize: pxToPt(RESUME_LAYOUT_PX.entryMarkFontSize),
      color: RESUME_PREVIEW_COLORS.muted,
    },
    paragraph: {
      marginTop: pxToPt(RESUME_LAYOUT_PX.paragraphMarginTop),
    },
    paragraphText: {
      fontSize: pxToPt(RESUME_LAYOUT_PX.paragraphFontSize),
      lineHeight: RESUME_LAYOUT_PX.paragraphLineHeight,
      color: RESUME_PREVIEW_COLORS.body,
    },
    emptyText: {
      marginTop: pxToPt(RESUME_LAYOUT_PX.emptyTextMarginTop),
      fontSize: pxToPt(RESUME_LAYOUT_PX.paragraphFontSize),
      color: RESUME_PREVIEW_COLORS.muted,
    },
  };
};
