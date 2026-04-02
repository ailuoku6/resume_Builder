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
  CONTACT_ITEM_HORIZONTAL_PADDING_PT,
  ENTRY_TITLE_GAP_PT,
  MIN_ENTRY_TITLE_WIDTH_PT,
  PAGE_CONTENT_WIDTH_PT,
  RESUME_LAYOUT_PX,
  createResumePdfStyles,
  getHeroTextWidthPt,
  getResumeBlockWrapperMarginTopPt,
  getSectionBodyMarginTopPt,
  pxToPt,
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

interface GeneratedResumeDocumentProps {
  data: ResumeData;
}

const renderLines = (
  lines: ResumeTextLineModel[],
  pageFontFamily: string,
  paragraphStyle: Record<string, string | number>,
  paragraphTextStyle: Record<string, string | number>,
): React.ReactNode => {
  return lines.map((line, index) => {
    const wrappedText = wrapPdfTextToString(line.text, {
      maxWidth: PAGE_CONTENT_WIDTH_PT,
      fontFamily: pageFontFamily,
      fontSize: pxToPt(RESUME_LAYOUT_PX.paragraphFontSize),
    });
    const lineWrapperStyle = index === 0 ? [paragraphStyle, { marginTop: 0 }] : paragraphStyle;

    return (
      <View key={line.id} style={lineWrapperStyle}>
        <CustomPdfText text={wrappedText} style={paragraphTextStyle as never} />
      </View>
    );
  });
};

const renderSectionBlock = (
  block: ResumeSectionBlockModel,
  previousBlock: ResumeSectionBlockModel | null,
  pageFontFamily: string,
  pdfStyles: ReturnType<typeof createResumePdfStyles>,
): React.ReactNode => {
  const wrapperStyle =
    previousBlock !== null
      ? { marginTop: getResumeBlockWrapperMarginTopPt(previousBlock, block) }
      : undefined;

  if (block.kind === 'subEntry') {
    return (
      <View key={block.id} style={wrapperStyle}>
        {renderLines(block.lines, pageFontFamily, pdfStyles.paragraph, pdfStyles.paragraphText)}
      </View>
    );
  }

  const entryMarkWidth = block.mark
    ? measurePdfTextWidth(block.mark, {
        fontFamily: pageFontFamily,
        fontSize: pxToPt(RESUME_LAYOUT_PX.entryMarkFontSize),
      })
    : 0;
  const entryTitleText = wrapPdfTextToString(block.title, {
    maxWidth: block.mark
      ? Math.max(PAGE_CONTENT_WIDTH_PT - entryMarkWidth - ENTRY_TITLE_GAP_PT, MIN_ENTRY_TITLE_WIDTH_PT)
      : PAGE_CONTENT_WIDTH_PT,
    fontFamily: pageFontFamily,
    fontSize: pxToPt(RESUME_LAYOUT_PX.entryTitleFontSize),
    fontWeight: 'bold',
  });

  return (
    <View key={block.id} style={wrapperStyle}>
      <View style={pdfStyles.entryHeader}>
        <CustomPdfText text={entryTitleText} style={pdfStyles.entryTitle as never} />
        {block.mark ? <Text style={pdfStyles.entryMark}>{buildCopySafePdfTextChildren(block.mark)}</Text> : null}
      </View>
      {block.lines.length > 0
        ? renderLines(block.lines, pageFontFamily, pdfStyles.paragraph, pdfStyles.paragraphText)
        : null}
    </View>
  );
};

const renderSection = (
  section: ResumeSection,
  blocks: ResumeSectionBlockModel[],
  pageFontFamily: string,
  pdfStyles: ReturnType<typeof createResumePdfStyles>,
): React.ReactNode => {
  const wrappedSectionTitle = wrapPdfTextToString(section.itemName, {
    maxWidth: PAGE_CONTENT_WIDTH_PT,
    fontFamily: pageFontFamily,
    fontSize: pxToPt(RESUME_LAYOUT_PX.sectionTitleFontSize),
    fontWeight: 'bold',
    letterSpacing: pxToPt(RESUME_LAYOUT_PX.sectionTitleLetterSpacing),
  });
  const sectionBodyStyle = [pdfStyles.sectionBody, { marginTop: getSectionBodyMarginTopPt(blocks[0] ?? null) }];

  return (
    <View key={section.id} style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>{buildCopySafePdfTextChildren(wrappedSectionTitle)}</Text>

      <View style={sectionBodyStyle}>
        {blocks.map((block, index) =>
          renderSectionBlock(block, index > 0 ? blocks[index - 1] : null, pageFontFamily, pdfStyles),
        )}

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
  const heroTextWidth = getHeroTextWidthPt(Boolean(data.avatar));
  const wrappedName = wrapPdfTextToString(data.name || '未命名候选人', {
    maxWidth: heroTextWidth,
    fontFamily: pageFontFamily,
    fontSize: pxToPt(RESUME_LAYOUT_PX.nameFontSize),
    fontWeight: 'bold',
    letterSpacing: pxToPt(RESUME_LAYOUT_PX.nameLetterSpacing),
  });
  const wrappedHeadline = data.headline.trim()
    ? wrapPdfTextToString(data.headline, {
        maxWidth: heroTextWidth,
        fontFamily: pageFontFamily,
        fontSize: pxToPt(RESUME_LAYOUT_PX.headlineFontSize),
        fontWeight: 'bold',
        letterSpacing: pxToPt(RESUME_LAYOUT_PX.headlineLetterSpacing),
      })
    : '';
  const contactItems = buildResumeContactItems(data).map((item) => ({
    ...item,
    wrappedValue: wrapPdfTextToString(item.value, {
      maxWidth: heroTextWidth - CONTACT_ITEM_HORIZONTAL_PADDING_PT,
      fontFamily: pageFontFamily,
      fontSize: pxToPt(RESUME_LAYOUT_PX.contactValueFontSize),
    }),
  }));
  const heroStyle = hasSummary ? [pdfStyles.hero, pdfStyles.heroWithDivider] : pdfStyles.hero;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={heroStyle}>
          <View style={pdfStyles.heroMain}>
            {data.avatar ? <Image src={data.avatar} style={pdfStyles.avatar} /> : null}

            <View style={pdfStyles.heroContent}>
              <CustomPdfText text={wrappedName} style={pdfStyles.name as never} />
              {data.headline.trim() ? (
                <CustomPdfText text={wrappedHeadline} style={pdfStyles.headline as never} />
              ) : null}

              {contactItems.length > 0 ? (
                <View style={pdfStyles.contactRow}>
                  {contactItems.map((item) => {
                    return (
                      <View key={item.label} style={pdfStyles.contactItem}>
                        <Text style={pdfStyles.contactLabel}>{buildCopySafePdfTextChildren(item.label)}</Text>
                        <CustomPdfText text={item.wrappedValue} style={pdfStyles.contactValue as never} />
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
              {buildCopySafePdfTextChildren(
                wrapPdfTextToString('Profile / 个人简介', {
                  maxWidth: PAGE_CONTENT_WIDTH_PT,
                  fontFamily: pageFontFamily,
                  fontSize: pxToPt(RESUME_LAYOUT_PX.sectionTitleFontSize),
                  fontWeight: 'bold',
                  letterSpacing: pxToPt(RESUME_LAYOUT_PX.sectionTitleLetterSpacing),
                }),
              )}
            </Text>
            <View style={pdfStyles.sectionBody}>
              {renderLines(summaryLines, pageFontFamily, pdfStyles.paragraph, pdfStyles.paragraphText)}
            </View>
          </View>
        ) : null}

        {visibleSections.map(({ section, blocks }) => renderSection(section, blocks, pageFontFamily, pdfStyles))}
      </Page>
    </Document>
  );
};

export default GeneratedResumeDocument;
