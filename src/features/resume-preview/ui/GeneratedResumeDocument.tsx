import React from 'react';
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import { FONT_PRESET_CONFIG } from '@/entities/resume/model/font-presets';
import {
  getVisibleResumeSections,
  isBulletLine,
  normalizeBulletLine,
  splitResumeTextLines,
} from '@/entities/resume/model/visibility';
import type { ResumeData, ResumeSection } from '@/entities/resume/model/types';

import fontL from '@/font/Font-OPPOSans/OPPOSans-L.ttf';
import fontM from '@/font/Font-OPPOSans/OPPOSans-M.ttf';
import fontR from '@/font/Font-OPPOSans/OPPOSans-R.ttf';

import CustomPdfText, { buildCopySafePdfTextChildren } from './CustomPdfText';
import { measurePdfTextWidth, wrapPdfTextToString } from './pdf-text-layout';

Font.register({
  family: 'oppoFont',
  fonts: [
    { src: fontM, fontStyle: 'normal', fontWeight: 'bold' },
    { src: fontR, fontStyle: 'normal', fontWeight: 'normal' },
    { src: fontL, fontStyle: 'normal', fontWeight: 'light' },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const pt = (px: number): number => {
  return Number((px * 0.75).toFixed(2));
};

const A4_PAGE_WIDTH = 595.28;
const PAGE_HORIZONTAL_PADDING = pt(40);
const PAGE_CONTENT_WIDTH = A4_PAGE_WIDTH - PAGE_HORIZONTAL_PADDING * 2;
const HERO_AVATAR_WIDTH = pt(78);
const HERO_AVATAR_GAP = pt(20);
const HERO_CONTENT_WIDTH_WITH_AVATAR = PAGE_CONTENT_WIDTH - HERO_AVATAR_WIDTH - HERO_AVATAR_GAP;
const CONTACT_ITEM_HORIZONTAL_PADDING = pt(20);
const ENTRY_TITLE_GAP = pt(14);
const MIN_ENTRY_TITLE_WIDTH = pt(160);

const PDF_PREVIEW_COLORS = {
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

const styles = StyleSheet.create({
  page: {
    paddingTop: pt(36),
    paddingRight: pt(40),
    paddingBottom: pt(42),
    paddingLeft: pt(40),
    fontFamily: 'oppoFont',
    backgroundColor: '#ffffff',
    color: PDF_PREVIEW_COLORS.pageText,
  },
  hero: {
    paddingBottom: pt(18),
  },
  heroWithDivider: {
    borderBottomWidth: pt(1),
    borderBottomColor: PDF_PREVIEW_COLORS.heroDivider,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroContent: {
    flex: 1,
  },
  avatar: {
    width: pt(78),
    height: pt(104),
    marginRight: pt(20),
    borderRadius: pt(4),
  },
  name: {
    fontSize: pt(36),
    fontWeight: 'bold',
    color: PDF_PREVIEW_COLORS.primary,
  },
  headline: {
    marginTop: pt(6),
    fontSize: pt(12),
    fontWeight: 'bold',
    color: PDF_PREVIEW_COLORS.accent,
    letterSpacing: 1.6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: pt(14),
  },
  contactItem: {
    marginRight: pt(8),
    marginBottom: pt(8),
    paddingTop: pt(7),
    paddingRight: pt(10),
    paddingBottom: pt(7),
    paddingLeft: pt(10),
    borderRadius: pt(4),
    backgroundColor: PDF_PREVIEW_COLORS.contactBackground,
  },
  contactLabel: {
    fontSize: pt(9),
    fontWeight: 'bold',
    color: PDF_PREVIEW_COLORS.contactLabel,
    letterSpacing: 1.2,
  },
  contactValue: {
    marginTop: pt(2),
    fontSize: pt(12),
    color: PDF_PREVIEW_COLORS.strongText,
  },
  section: {
    marginTop: pt(14),
  },
  sectionTitle: {
    paddingBottom: pt(8),
    borderBottomWidth: pt(1),
    borderBottomColor: PDF_PREVIEW_COLORS.sectionDivider,
    fontSize: pt(12),
    fontWeight: 'bold',
    color: PDF_PREVIEW_COLORS.primary,
    letterSpacing: 1.1,
  },
  sectionTitlePlain: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  summaryWrap: {
    marginTop: pt(12),
  },
  summaryLine: {
    fontSize: pt(12),
    color: PDF_PREVIEW_COLORS.body,
  },
  sectionBody: {
    marginTop: pt(14),
  },
  entryBlock: {
    marginBottom: pt(14),
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: pt(4),
  },
  entryTitle: {
    flex: 1,
    paddingRight: pt(14),
    fontSize: pt(14),
    fontWeight: 'bold',
    color: PDF_PREVIEW_COLORS.strongText,
  },
  entryMark: {
    fontSize: pt(11),
    color: PDF_PREVIEW_COLORS.muted,
  },
  paragraph: {
    marginTop: pt(4),
  },
  paragraphText: {
    fontSize: pt(12),
    color: PDF_PREVIEW_COLORS.body,
  },
  subEntryBlock: {
    marginTop: pt(10),
  },
  emptyText: {
    marginTop: pt(12),
    fontSize: pt(12),
    color: PDF_PREVIEW_COLORS.muted,
  },
});

interface GeneratedResumeDocumentProps {
  data: ResumeData;
}

const getHeroTextWidth = (hasAvatar: boolean): number => {
  return hasAvatar ? HERO_CONTENT_WIDTH_WITH_AVATAR : PAGE_CONTENT_WIDTH;
};

const renderLines = (
  lines: string[],
  keyPrefix: string,
  pageFontFamily: string,
): React.ReactNode => {
  return lines.map((line, index) => {
    const bullet = isBulletLine(line);
    const content = normalizeBulletLine(line);
    const text = bullet ? `• ${content}` : content;
    const wrappedText = wrapPdfTextToString(text, {
      maxWidth: PAGE_CONTENT_WIDTH,
      fontFamily: pageFontFamily,
      fontSize: pt(12),
    });

    return (
      <View key={`${keyPrefix}-${index}`} style={styles.paragraph}>
        <CustomPdfText text={wrappedText} style={styles.paragraphText as never} />
      </View>
    );
  });
};

const renderSection = (section: ResumeSection, pageFontFamily: string): React.ReactNode => {
  const hasEntries = section.entry.length > 0;
  const hasSubEntries = section.subEntry.length > 0;
  const wrappedSectionTitle = wrapPdfTextToString(section.itemName, {
    maxWidth: PAGE_CONTENT_WIDTH,
    fontFamily: pageFontFamily,
    fontSize: pt(12),
    fontWeight: 'bold',
    letterSpacing: 1.1,
  });

  return (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{buildCopySafePdfTextChildren(wrappedSectionTitle)}</Text>

      <View style={styles.sectionBody}>
        {hasEntries
          ? section.entry.map((entryItem) => {
              const detailLines = splitResumeTextLines(entryItem.detail || '');
              const entryMark = entryItem.mark.trim();
              const entryMarkWidth = entryMark
                ? measurePdfTextWidth(entryMark, {
                    fontFamily: pageFontFamily,
                    fontSize: pt(11),
                  })
                : 0;
              const entryTitleText = wrapPdfTextToString(entryItem.title || '未命名条目', {
                maxWidth: entryMark
                  ? Math.max(PAGE_CONTENT_WIDTH - entryMarkWidth - ENTRY_TITLE_GAP, MIN_ENTRY_TITLE_WIDTH)
                  : PAGE_CONTENT_WIDTH,
                fontFamily: pageFontFamily,
                fontSize: pt(14),
                fontWeight: 'bold',
              });

              return (
                <View key={entryItem.id} style={styles.entryBlock}>
                  <View style={styles.entryHeader}>
                    <CustomPdfText text={entryTitleText} style={styles.entryTitle as never} />
                    {entryMark ? (
                      <Text style={styles.entryMark}>{buildCopySafePdfTextChildren(entryMark)}</Text>
                    ) : null}
                  </View>
                  {detailLines.length > 0 ? renderLines(detailLines, entryItem.id, pageFontFamily) : null}
                </View>
              );
            })
          : null}

        {hasSubEntries ? (
          <View style={styles.subEntryBlock}>
            {section.subEntry.map((subEntryItem) => {
              return renderLines(splitResumeTextLines(subEntryItem.name || ''), subEntryItem.id, pageFontFamily);
            })}
          </View>
        ) : null}

        {!hasEntries && !hasSubEntries ? (
          <Text style={styles.emptyText}>{buildCopySafePdfTextChildren('暂无内容')}</Text>
        ) : null}
      </View>
    </View>
  );
};

const GeneratedResumeDocument: React.FC<GeneratedResumeDocumentProps> = ({ data }) => {
  const summaryLines = splitResumeTextLines(data.summary);
  const hasSummary = summaryLines.length > 0;
  const visibleSections = getVisibleResumeSections(data.items);
  const pageFontFamily =
    FONT_PRESET_CONFIG[data.fontPreset]?.pdfFontFamily ?? FONT_PRESET_CONFIG.oppo.pdfFontFamily;
  const heroTextWidth = getHeroTextWidth(Boolean(data.avatar));
  const wrappedName = wrapPdfTextToString(data.name || '未命名候选人', {
    maxWidth: heroTextWidth,
    fontFamily: pageFontFamily,
    fontSize: pt(36),
    fontWeight: 'bold',
  });
  const wrappedHeadline = data.headline.trim()
    ? wrapPdfTextToString(data.headline, {
        maxWidth: heroTextWidth,
        fontFamily: pageFontFamily,
        fontSize: pt(12),
        fontWeight: 'bold',
        letterSpacing: 1.6,
      })
    : '';
  const contactItems = [
    { label: 'Phone', value: data.phoneNum },
    { label: 'Email', value: data.email },
    { label: 'Location', value: data.liveAddress },
    { label: 'Gender', value: data.sex },
  ]
    .filter((item) => item.value.trim())
    .map((item) => ({
      ...item,
      wrappedValue: wrapPdfTextToString(item.value, {
        maxWidth: heroTextWidth - CONTACT_ITEM_HORIZONTAL_PADDING,
        fontFamily: pageFontFamily,
        fontSize: pt(12),
      }),
    }));

  return (
    <Document>
      <Page size="A4" style={[styles.page, { fontFamily: pageFontFamily }]}>
        <View style={hasSummary ? [styles.hero, styles.heroWithDivider] : styles.hero}>
          <View style={styles.heroMain}>
            {data.avatar ? <Image src={data.avatar} style={styles.avatar} /> : null}

            <View style={styles.heroContent}>
              <CustomPdfText text={wrappedName} style={styles.name as never} />
              {data.headline.trim() ? (
                <CustomPdfText text={wrappedHeadline} style={styles.headline as never} />
              ) : null}

              {contactItems.length > 0 ? (
                <View style={styles.contactRow}>
                  {contactItems.map((item) => {
                    return (
                      <View key={item.label} style={styles.contactItem}>
                        <Text style={styles.contactLabel}>{buildCopySafePdfTextChildren(item.label)}</Text>
                        <CustomPdfText text={item.wrappedValue} style={styles.contactValue as never} />
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {hasSummary ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitlePlain]}>
              {buildCopySafePdfTextChildren('Profile / 个人简介')}
            </Text>
            <View style={styles.summaryWrap}>
              {summaryLines.map((line, index) => {
                const wrappedLine = wrapPdfTextToString(line, {
                  maxWidth: PAGE_CONTENT_WIDTH,
                  fontFamily: pageFontFamily,
                  fontSize: pt(12),
                });

                return (
                  <View key={`summary-${index}`} style={styles.paragraph}>
                    <CustomPdfText text={wrappedLine} style={styles.summaryLine as never} />
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {visibleSections.map((section) => renderSection(section, pageFontFamily))}
      </Page>
    </Document>
  );
};

export default GeneratedResumeDocument;
