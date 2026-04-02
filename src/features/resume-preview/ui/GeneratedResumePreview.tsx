import React from 'react';

import { FONT_PRESET_CONFIG } from '@/entities/resume/model/font-presets';
import {
  getVisibleResumeEntries,
  getVisibleResumeSubEntries,
} from '@/entities/resume/model/visibility';
import type { ResumeData } from '@/entities/resume/model/types';
import {
  CONTACT_ITEM_HORIZONTAL_PADDING_PT,
  ENTRY_TITLE_GAP_PT,
  MIN_ENTRY_TITLE_WIDTH_PT,
  PAGE_CONTENT_WIDTH_PT,
  RESUME_LAYOUT_PX,
  createResumePreviewStyles,
  getHeroTextWidthPt,
  getResumeBlockWrapperMarginTopPx,
  getSectionBodyMarginTopPx,
  pxToPt,
} from '@/features/resume-preview/model/layout';
import {
  buildResumeContactItems,
  buildResumeSectionBlocks,
  buildResumeSummaryLines,
} from '@/features/resume-preview/model/render-model';

import { ensurePdfMeasurementFontsReady, measurePdfTextWidth, wrapPdfTextToString } from './pdf-text-layout';

interface GeneratedResumePreviewProps {
  data: ResumeData;
}

export const GeneratedResumePreview: React.FC<GeneratedResumePreviewProps> = ({ data }) => {
  const [, forceFontRefresh] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    const prepareFonts = async (): Promise<void> => {
      try {
        await ensurePdfMeasurementFontsReady();
      } catch (error) {
        console.warn('Failed to prepare preview measurement fonts.', error);
      } finally {
        if (!cancelled) {
          forceFontRefresh((value) => value + 1);
        }
      }
    };

    void prepareFonts();

    return () => {
      cancelled = true;
    };
  }, [data.fontPreset]);

  const summaryLines = buildResumeSummaryLines(data.summary);
  const hasSummary = summaryLines.length > 0;
  const previewFontFamily =
    FONT_PRESET_CONFIG[data.fontPreset]?.previewFontFamily ?? FONT_PRESET_CONFIG.oppo.previewFontFamily;
  const pdfFontFamily =
    FONT_PRESET_CONFIG[data.fontPreset]?.pdfFontFamily ?? FONT_PRESET_CONFIG.oppo.pdfFontFamily;
  const previewStyles = createResumePreviewStyles(previewFontFamily);
  const heroTextWidth = getHeroTextWidthPt(Boolean(data.avatar));
  const wrappedName = wrapPdfTextToString(data.name || '未命名候选人', {
    maxWidth: heroTextWidth,
    fontFamily: pdfFontFamily,
    fontSize: pxToPt(RESUME_LAYOUT_PX.nameFontSize),
    fontWeight: 'bold',
    letterSpacing: pxToPt(RESUME_LAYOUT_PX.nameLetterSpacing),
  });
  const wrappedHeadline = data.headline.trim()
    ? wrapPdfTextToString(data.headline, {
        maxWidth: heroTextWidth,
        fontFamily: pdfFontFamily,
        fontSize: pxToPt(RESUME_LAYOUT_PX.headlineFontSize),
        fontWeight: 'bold',
        letterSpacing: pxToPt(RESUME_LAYOUT_PX.headlineLetterSpacing),
      })
    : '';
  const contactItems = buildResumeContactItems(data).map((item) => ({
    ...item,
    wrappedValue: wrapPdfTextToString(item.value, {
      maxWidth: heroTextWidth - CONTACT_ITEM_HORIZONTAL_PADDING_PT,
      fontFamily: pdfFontFamily,
      fontSize: pxToPt(RESUME_LAYOUT_PX.contactValueFontSize),
    }),
  }));
  const rootHeroStyle = hasSummary
    ? { ...previewStyles.hero, ...previewStyles.heroWithDivider }
    : previewStyles.hero;
  const getParagraphStyle = (index: number): React.CSSProperties => {
    return index === 0 ? { ...previewStyles.paragraph, marginTop: 0 } : previewStyles.paragraph;
  };

  return (
    <article data-preview-id="base-info" style={previewStyles.page}>
      <header style={rootHeroStyle}>
        <div style={previewStyles.heroMain}>
          {data.avatar ? <img style={previewStyles.avatar} src={data.avatar} alt={data.name || 'resume avatar'} /> : null}

          <div style={previewStyles.heroContent}>
            <h1 style={previewStyles.name}>{wrappedName}</h1>
            {data.headline.trim() ? <p style={previewStyles.headline}>{wrappedHeadline}</p> : null}

            {contactItems.length > 0 ? (
              <div style={previewStyles.contactRow}>
                {contactItems.map((item) => {
                  return (
                    <div key={item.label} style={previewStyles.contactItem}>
                      <span style={previewStyles.contactLabel}>{item.label}</span>
                      <span style={previewStyles.contactValue}>{item.wrappedValue}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {hasSummary ? (
        <section style={previewStyles.section}>
          <h2 style={{ ...previewStyles.sectionTitle, ...previewStyles.sectionTitlePlain }}>
            {wrapPdfTextToString('Profile / 个人简介', {
              maxWidth: PAGE_CONTENT_WIDTH_PT,
              fontFamily: pdfFontFamily,
              fontSize: pxToPt(RESUME_LAYOUT_PX.sectionTitleFontSize),
              fontWeight: 'bold',
              letterSpacing: pxToPt(RESUME_LAYOUT_PX.sectionTitleLetterSpacing),
            })}
          </h2>
          <div style={previewStyles.sectionBody}>
            {summaryLines.map((line, index) => {
              return (
                <p key={line.id} style={getParagraphStyle(index)}>
                  {wrapPdfTextToString(line.text, {
                    maxWidth: PAGE_CONTENT_WIDTH_PT,
                    fontFamily: pdfFontFamily,
                    fontSize: pxToPt(RESUME_LAYOUT_PX.paragraphFontSize),
                  })}
                </p>
              );
            })}
          </div>
        </section>
      ) : null}

      {data.items.map((section) => {
        const visibleEntries = getVisibleResumeEntries(section);
        const visibleSubEntries = getVisibleResumeSubEntries(section);
        const visibleBlocks = buildResumeSectionBlocks(section);
        const hiddenEntryAnchors = section.entry.filter(
          (entryItem) => !visibleEntries.some((visibleItem) => visibleItem.id === entryItem.id),
        );
        const hiddenSubEntryAnchors = section.subEntry.filter(
          (subEntryItem) => !visibleSubEntries.some((visibleItem) => visibleItem.id === subEntryItem.id),
        );
        const showVisibleSection = !section.hidden && visibleBlocks.length > 0;

        if (!showVisibleSection) {
          return (
            <div key={section.id} data-preview-section-id={section.id} style={previewStyles.anchor}>
              {section.entry.map((entryItem) => {
                return <div key={entryItem.id} data-preview-entry-id={entryItem.id} style={previewStyles.anchor} />;
              })}

              {section.subEntry.map((subEntryItem) => {
                return (
                  <div key={subEntryItem.id} data-preview-sub-entry-id={subEntryItem.id} style={previewStyles.anchor} />
                );
              })}
            </div>
          );
        }

        const wrappedSectionTitle = wrapPdfTextToString(section.itemName, {
          maxWidth: PAGE_CONTENT_WIDTH_PT,
          fontFamily: pdfFontFamily,
          fontSize: pxToPt(RESUME_LAYOUT_PX.sectionTitleFontSize),
          fontWeight: 'bold',
          letterSpacing: pxToPt(RESUME_LAYOUT_PX.sectionTitleLetterSpacing),
        });
        const sectionBodyStyle = {
          ...previewStyles.sectionBody,
          marginTop: getSectionBodyMarginTopPx(visibleBlocks[0] ?? null),
        };

        return (
          <section key={section.id} data-preview-section-id={section.id} style={previewStyles.section}>
            <h2 style={previewStyles.sectionTitle}>{wrappedSectionTitle}</h2>

            {hiddenEntryAnchors.length > 0 || hiddenSubEntryAnchors.length > 0 ? (
              <div style={previewStyles.anchor}>
                {hiddenEntryAnchors.map((entryItem) => {
                  return <div key={entryItem.id} data-preview-entry-id={entryItem.id} style={previewStyles.anchor} />;
                })}

                {hiddenSubEntryAnchors.map((subEntryItem) => {
                  return (
                    <div
                      key={subEntryItem.id}
                      data-preview-sub-entry-id={subEntryItem.id}
                      style={previewStyles.anchor}
                    />
                  );
                })}
              </div>
            ) : null}

            <div style={sectionBodyStyle}>
              {visibleBlocks.map((block, index) => {
                const previousBlock = index > 0 ? visibleBlocks[index - 1] : null;
                const wrapperStyle =
                  previousBlock !== null
                    ? { marginTop: getResumeBlockWrapperMarginTopPx(previousBlock, block) }
                    : undefined;

                if (block.kind === 'entry') {
                  const entryMarkWidth = block.mark
                    ? measurePdfTextWidth(block.mark, {
                        fontFamily: pdfFontFamily,
                        fontSize: pxToPt(RESUME_LAYOUT_PX.entryMarkFontSize),
                      })
                    : 0;
                  const wrappedEntryTitle = wrapPdfTextToString(block.title, {
                    maxWidth: block.mark
                      ? Math.max(PAGE_CONTENT_WIDTH_PT - entryMarkWidth - ENTRY_TITLE_GAP_PT, MIN_ENTRY_TITLE_WIDTH_PT)
                      : PAGE_CONTENT_WIDTH_PT,
                    fontFamily: pdfFontFamily,
                    fontSize: pxToPt(RESUME_LAYOUT_PX.entryTitleFontSize),
                    fontWeight: 'bold',
                  });

                  return (
                    <div key={block.id} data-preview-entry-id={block.id} style={wrapperStyle}>
                      <div style={previewStyles.entryHeader}>
                        <h3 style={previewStyles.entryTitle}>{wrappedEntryTitle}</h3>
                        {block.mark ? <span style={previewStyles.entryMark}>{block.mark}</span> : null}
                      </div>

                      {block.lines.map((line, lineIndex) => {
                        return (
                          <p key={line.id} style={getParagraphStyle(lineIndex)}>
                            {wrapPdfTextToString(line.text, {
                              maxWidth: PAGE_CONTENT_WIDTH_PT,
                              fontFamily: pdfFontFamily,
                              fontSize: pxToPt(RESUME_LAYOUT_PX.paragraphFontSize),
                            })}
                          </p>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div key={block.id} data-preview-sub-entry-id={block.id} style={wrapperStyle}>
                    {block.lines.map((line, lineIndex) => {
                      return (
                        <p key={line.id} style={getParagraphStyle(lineIndex)}>
                          {wrapPdfTextToString(line.text, {
                            maxWidth: PAGE_CONTENT_WIDTH_PT,
                            fontFamily: pdfFontFamily,
                            fontSize: pxToPt(RESUME_LAYOUT_PX.paragraphFontSize),
                          })}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </article>
  );
};
