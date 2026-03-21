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

import type { ResumeData, ResumeSection } from '@/entities/resume/model/types';

import fontL from '@/font/Font-OPPOSans/OPPOSans-L.ttf';
import fontM from '@/font/Font-OPPOSans/OPPOSans-M.ttf';
import fontR from '@/font/Font-OPPOSans/OPPOSans-R.ttf';

import CustomPdfText from './CustomPdfText';

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

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingRight: 40,
    paddingBottom: 42,
    paddingLeft: 40,
    fontFamily: 'oppoFont',
    backgroundColor: '#ffffff',
    color: '#191c1e',
  },
  hero: {
    marginBottom: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe5f2',
  },
  avatar: {
    width: 78,
    height: 104,
    marginBottom: 14,
    borderRadius: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#091426',
  },
  headline: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2170e4',
    letterSpacing: 1.6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  contactItem: {
    marginRight: 8,
    marginBottom: 8,
    paddingTop: 7,
    paddingRight: 10,
    paddingBottom: 7,
    paddingLeft: 10,
    borderRadius: 4,
    backgroundColor: '#f3f6fb',
  },
  contactLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#72809a',
    letterSpacing: 1.2,
  },
  contactValue: {
    marginTop: 2,
    fontSize: 10,
    color: '#0f172a',
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(9, 20, 38, 0.08)',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#091426',
    letterSpacing: 1.1,
  },
  summaryWrap: {
    marginTop: 12,
  },
  summaryLine: {
    fontSize: 10.5,
    color: '#455163',
  },
  sectionBody: {
    marginTop: 14,
  },
  entryBlock: {
    marginBottom: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  entryTitle: {
    flex: 1,
    paddingRight: 14,
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  entryMark: {
    fontSize: 8.5,
    color: '#7b8494',
  },
  paragraph: {
    marginTop: 4,
  },
  paragraphText: {
    fontSize: 10,
    color: '#455163',
  },
  subEntryBlock: {
    marginTop: 10,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 10,
    color: '#7b8494',
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
      <Text style={styles.sectionTitle}>{section.itemName}</Text>

      <View style={styles.sectionBody}>
        {hasEntries
          ? section.entry.map((entryItem) => {
              const detailLines = splitLines(entryItem.detail || '');

              return (
                <View key={entryItem.id} style={styles.entryBlock}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{entryItem.title || '未命名条目'}</Text>
                    <Text style={styles.entryMark}>{entryItem.mark}</Text>
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

        {!hasEntries && !hasSubEntries ? <Text style={styles.emptyText}>暂无内容</Text> : null}
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
  const contactItems = [
    { label: 'Phone', value: data.phoneNum },
    { label: 'Email', value: data.email },
    { label: 'Location', value: data.liveAddress },
    { label: 'Gender', value: data.sex },
  ].filter((item) => item.value.trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          {data.avatar ? <Image src={data.avatar} style={styles.avatar} /> : null}
          <Text style={styles.name}>{data.name || '未命名候选人'}</Text>
          {data.headline.trim() ? <Text style={styles.headline}>{data.headline}</Text> : null}

          {contactItems.length > 0 ? (
            <View style={styles.contactRow}>
              {contactItems.map((item) => {
                return (
                  <View key={item.label} style={styles.contactItem}>
                    <Text style={styles.contactLabel}>{item.label}</Text>
                    <Text style={styles.contactValue}>{item.value}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        {summaryLines.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile / 个人简介</Text>
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
