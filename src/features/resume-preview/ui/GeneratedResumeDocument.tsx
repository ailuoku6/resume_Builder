import React from 'react';
import {
  Document,
  Font,
  Image,
  Page,
  Text,
  View,
} from '@react-pdf/renderer';

import { FONT_PRESET_CONFIG } from '@/entities/resume/model/font-presets';
import type { ResumeData, ResumeSection } from '@/entities/resume/model/types';
import {
  createResumePdfStyles,
  getResumeBlockWrapperMarginTopPt,
  getResumeSectionMarginTopPt,
  getSectionBodyMarginTopPt,
} from '@/features/resume-preview/model/layout';
import {
  buildResumeContactItems,
  buildResumeSectionBlocks,
  buildResumeSummaryLines,
  type ResumeSectionBlockModel,
  type ResumeTextLineModel,
} from '@/features/resume-preview/model/render-model';

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

Font.registerHyphenationCallback((word) => [word]);

interface GeneratedResumeDocumentProps {
  data: ResumeData;
}

const renderLines = (
  lines: ResumeTextLineModel[],
  paragraphStyle: Record<string, string | number>,
  paragraphTextStyle: Record<string, string | number>,
): React.ReactNode => {
  return lines.map((line, index) => {
    const lineWrapperStyle = index === 0 ? [paragraphStyle, { marginTop: 0 }] : paragraphStyle;

    return (
      <View key={line.id} style={lineWrapperStyle}>
        <CustomPdfText text={line.text} style={paragraphTextStyle as never} />
      </View>
    );
  });
};

const renderSectionBlock = (
  block: ResumeSectionBlockModel,
  previousBlock: ResumeSectionBlockModel | null,
  pdfStyles: ReturnType<typeof createResumePdfStyles>,
): React.ReactNode => {
  const wrapperStyle =
    previousBlock !== null
      ? { marginTop: getResumeBlockWrapperMarginTopPt(previousBlock, block) }
      : undefined;

  if (block.kind === 'subEntry') {
    return (
      <View key={block.id} style={wrapperStyle}>
        {renderLines(block.lines, pdfStyles.paragraph, pdfStyles.paragraphText)}
      </View>
    );
  }

  return (
    <View key={block.id} style={wrapperStyle}>
      <View style={pdfStyles.entryHeader}>
        <CustomPdfText text={block.title} style={pdfStyles.entryTitle as never} />
        {block.mark ? <Text style={pdfStyles.entryMark}>{buildCopySafePdfTextChildren(block.mark)}</Text> : null}
      </View>
      {block.lines.length > 0
        ? renderLines(block.lines, pdfStyles.paragraph, pdfStyles.paragraphText)
        : null}
    </View>
  );
};

const renderSection = (
  section: ResumeSection,
  blocks: ResumeSectionBlockModel[],
  sectionIndex: number,
  hasSummary: boolean,
  pdfStyles: ReturnType<typeof createResumePdfStyles>,
): React.ReactNode => {
  const sectionBodyStyle = [pdfStyles.sectionBody, { marginTop: getSectionBodyMarginTopPt(blocks[0] ?? null) }];
  const sectionStyle = [pdfStyles.section, { marginTop: getResumeSectionMarginTopPt(sectionIndex, hasSummary) }];

  return (
    <View key={section.id} style={sectionStyle}>
      <Text style={pdfStyles.sectionTitle}>{buildCopySafePdfTextChildren(section.itemName)}</Text>

      <View style={sectionBodyStyle}>
        {blocks.map((block, index) => renderSectionBlock(block, index > 0 ? blocks[index - 1] : null, pdfStyles))}

        {blocks.length === 0 ? (
          <Text style={pdfStyles.emptyText}>{buildCopySafePdfTextChildren('暂无内容')}</Text>
        ) : null}
      </View>
    </View>
  );
};

const GeneratedResumeDocument: React.FC<GeneratedResumeDocumentProps> = ({ data }) => {
  const summaryLines = buildResumeSummaryLines(data.summary);
  const hasSummary = summaryLines.length > 0;
  const visibleSections = data.items
    .map((section) => ({
      section,
      blocks: buildResumeSectionBlocks(section),
    }))
    .filter(({ section, blocks }) => !section.hidden && blocks.length > 0);
  const pageFontFamily =
    FONT_PRESET_CONFIG[data.fontPreset]?.pdfFontFamily ?? FONT_PRESET_CONFIG.oppo.pdfFontFamily;
  const pdfStyles = createResumePdfStyles(pageFontFamily);
  const contactItems = buildResumeContactItems(data);
  const heroStyle = hasSummary ? [pdfStyles.hero, pdfStyles.heroWithDivider] : pdfStyles.hero;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={heroStyle}>
          <View style={pdfStyles.heroMain}>
            {data.avatar ? <Image src={data.avatar} style={pdfStyles.avatar} /> : null}

            <View style={pdfStyles.heroContent}>
              <CustomPdfText text={data.name || '未命名候选人'} style={pdfStyles.name as never} />
              {data.headline.trim() ? (
                <CustomPdfText text={data.headline} style={pdfStyles.headline as never} />
              ) : null}

              {contactItems.length > 0 ? (
                <View style={pdfStyles.contactRow}>
                  {contactItems.map((item) => {
                    return (
                      <View key={item.label} style={pdfStyles.contactItem}>
                        <Text style={pdfStyles.contactLabel}>{buildCopySafePdfTextChildren(item.label)}</Text>
                        <CustomPdfText text={item.value} style={pdfStyles.contactValue as never} />
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {hasSummary ? (
          <View style={pdfStyles.section}>
            <Text style={[pdfStyles.sectionTitle, pdfStyles.sectionTitlePlain]}>
              {buildCopySafePdfTextChildren('Profile / 个人简介')}
            </Text>
            <View style={pdfStyles.sectionBody}>
              {renderLines(summaryLines, pdfStyles.paragraph, pdfStyles.paragraphText)}
            </View>
          </View>
        ) : null}

        {visibleSections.map(({ section, blocks }, index) => renderSection(section, blocks, index, hasSummary, pdfStyles))}
      </Page>
    </Document>
  );
};

export default GeneratedResumeDocument;
