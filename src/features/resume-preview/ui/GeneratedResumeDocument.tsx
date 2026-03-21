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
import type { ResumeData, ResumeSection } from '@/entities/resume/model/types';

import fontL from '@/font/Font-OPPOSans/OPPOSans-L.ttf';
import fontM from '@/font/Font-OPPOSans/OPPOSans-M.ttf';
import fontR from '@/font/Font-OPPOSans/OPPOSans-R.ttf';

import CustomPdfText, { buildCopySafePdfTextChildren } from './CustomPdfText';

Font.register({
  family: 'oppoFont',
  fonts: [
    { src: fontM, fontStyle: 'normal', fontWeight: 'bold' },
    { src: fontR, fontStyle: 'normal', fontWeight: 'normal' },
    { src: fontL, fontStyle: 'normal', fontWeight: 'light' },
  ],
});

Font.registerHyphenationCallback((word) => {
  if (word.length === 1) {
    return [word];
  }

  return Array.from(word).map((char) => char);
});

const pt = (px: number): number => {
  return Number((px * 0.75).toFixed(2));
};

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

const splitLines = (text: string): string[] => {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const normalizeBulletLine = (line: string): string => {
  return line.replace(/^[•·\-\*]\s*/, '');
};

const isBulletLine = (line: string): boolean => {
  return /^[•·\-\*]\s*/.test(line);
};

const renderLines = (lines: string[], keyPrefix: string): React.ReactNode => {
  return lines.map((line, index) => {
    const bullet = isBulletLine(line);
    const content = normalizeBulletLine(line);
    const text = bullet ? `• ${content}` : content;

    return (
      <View key={`${keyPrefix}-${index}`} style={styles.paragraph}>
        <CustomPdfText text={text} style={styles.paragraphText as never} />
      </View>
    );
  });
};

const renderSection = (section: ResumeSection): React.ReactNode => {
  const hasEntries = section.entry.length > 0;
  const hasSubEntries = section.subEntry.length > 0;

  return (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{buildCopySafePdfTextChildren(section.itemName)}</Text>

      <View style={styles.sectionBody}>
        {hasEntries
          ? section.entry.map((entryItem) => {
              const detailLines = splitLines(entryItem.detail || '');

              return (
                <View key={entryItem.id} style={styles.entryBlock}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {buildCopySafePdfTextChildren(entryItem.title || '未命名条目')}
                    </Text>
                    <Text style={styles.entryMark}>{buildCopySafePdfTextChildren(entryItem.mark)}</Text>
                  </View>
                  {detailLines.length > 0 ? renderLines(detailLines, entryItem.id) : null}
                </View>
              );
            })
          : null}

        {hasSubEntries ? (
          <View style={styles.subEntryBlock}>
            {section.subEntry.map((subEntryItem) => {
              return renderLines(splitLines(subEntryItem.name || ''), subEntryItem.id);
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

const hasSectionContent = (section: ResumeSection): boolean => {
  const hasEntryContent = section.entry.some((entryItem) => {
    return Boolean(entryItem.title.trim() || entryItem.mark.trim() || entryItem.detail.trim());
  });

  const hasSubEntryContent = section.subEntry.some((subEntryItem) => {
    return Boolean(subEntryItem.name.trim());
  });

  return hasEntryContent || hasSubEntryContent;
};

const GeneratedResumeDocument: React.FC<GeneratedResumeDocumentProps> = ({ data }) => {
  const summaryLines = splitLines(data.summary);
  const visibleSections = data.items.filter(hasSectionContent);
  const pageFontFamily =
    FONT_PRESET_CONFIG[data.fontPreset]?.pdfFontFamily ?? FONT_PRESET_CONFIG.oppo.pdfFontFamily;
  const contactItems = [
    { label: 'Phone', value: data.phoneNum },
    { label: 'Email', value: data.email },
    { label: 'Location', value: data.liveAddress },
    { label: 'Gender', value: data.sex },
  ].filter((item) => item.value.trim());

  return (
    <Document>
      <Page size="A4" style={[styles.page, { fontFamily: pageFontFamily }]}>
        <View style={styles.hero}>
          <View style={styles.heroMain}>
            {data.avatar ? <Image src={data.avatar} style={styles.avatar} /> : null}

            <View style={styles.heroContent}>
              <Text style={styles.name}>{buildCopySafePdfTextChildren(data.name || '未命名候选人')}</Text>
              {data.headline.trim() ? (
                <Text style={styles.headline}>{buildCopySafePdfTextChildren(data.headline)}</Text>
              ) : null}

              {contactItems.length > 0 ? (
                <View style={styles.contactRow}>
                  {contactItems.map((item) => {
                    return (
                      <View key={item.label} style={styles.contactItem}>
                        <Text style={styles.contactLabel}>{buildCopySafePdfTextChildren(item.label)}</Text>
                        <Text style={styles.contactValue}>{buildCopySafePdfTextChildren(item.value)}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {summaryLines.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitlePlain]}>
              {buildCopySafePdfTextChildren('Profile / 个人简介')}
            </Text>
            <View style={styles.summaryWrap}>
              {summaryLines.map((line, index) => {
                return (
                  <View key={`summary-${index}`} style={styles.paragraph}>
                    <CustomPdfText text={line} style={styles.summaryLine as never} />
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {visibleSections.map(renderSection)}
      </Page>
    </Document>
  );
};

export default GeneratedResumeDocument;
