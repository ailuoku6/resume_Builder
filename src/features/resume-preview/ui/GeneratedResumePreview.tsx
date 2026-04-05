import React from 'react';

import { FONT_PRESET_CONFIG } from '@/entities/resume/model/font-presets';
import {
  getVisibleResumeEntries,
  getVisibleResumeSubEntries,
} from '@/entities/resume/model/visibility';
import type { ResumeData } from '@/entities/resume/model/types';
import {
  createResumePreviewStyles,
  getResumeBlockWrapperMarginTopPx,
  getResumeSectionMarginTopPx,
  getSectionBodyMarginTopPx,
} from '@/features/resume-preview/model/layout';
import {
  buildResumeContactItems,
  buildResumeSectionBlocks,
  buildResumeSummaryLines,
} from '@/features/resume-preview/model/render-model';

interface GeneratedResumePreviewProps {
  data: ResumeData;
}

export const GeneratedResumePreview: React.FC<GeneratedResumePreviewProps> = ({ data }) => {
  const summaryLines = buildResumeSummaryLines(data.summary);
  const hasSummary = summaryLines.length > 0;
  let visibleSectionIndex = 0;
  const previewFontFamily =
    FONT_PRESET_CONFIG[data.fontPreset]?.previewFontFamily ?? FONT_PRESET_CONFIG.oppo.previewFontFamily;
  const previewStyles = createResumePreviewStyles(previewFontFamily);
  const contactItems = buildResumeContactItems(data);
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
            <h1 style={previewStyles.name}>{data.name || '未命名候选人'}</h1>
            {data.headline.trim() ? <p style={previewStyles.headline}>{data.headline}</p> : null}

            {contactItems.length > 0 ? (
              <div style={previewStyles.contactRow}>
                {contactItems.map((item) => {
                  return (
                    <div key={item.label} style={previewStyles.contactItem}>
                      <span style={previewStyles.contactLabel}>{item.label}</span>
                      <span style={previewStyles.contactValue}>{item.value}</span>
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
          <h2 style={{ ...previewStyles.sectionTitle, ...previewStyles.sectionTitlePlain }}>Profile / 个人简介</h2>
          <div style={previewStyles.sectionBody}>
            {summaryLines.map((line, index) => {
              return (
                <p key={line.id} style={getParagraphStyle(index)}>{line.text}</p>
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

        const sectionBodyStyle = {
          ...previewStyles.sectionBody,
          marginTop: getSectionBodyMarginTopPx(visibleBlocks[0] ?? null),
        };
        const sectionStyle = {
          ...previewStyles.section,
          marginTop: getResumeSectionMarginTopPx(visibleSectionIndex, hasSummary),
        };
        visibleSectionIndex += 1;

        return (
          <section key={section.id} data-preview-section-id={section.id} style={sectionStyle}>
            <h2 style={previewStyles.sectionTitle}>{section.itemName}</h2>

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
                  return (
                    <div key={block.id} data-preview-entry-id={block.id} style={wrapperStyle}>
                      <div style={previewStyles.entryHeader}>
                        <h3 style={previewStyles.entryTitle}>{block.title}</h3>
                        {block.mark ? <span style={previewStyles.entryMark}>{block.mark}</span> : null}
                      </div>

                      {block.lines.map((line, lineIndex) => {
                        return (
                          <p key={line.id} style={getParagraphStyle(lineIndex)}>{line.text}</p>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div key={block.id} data-preview-sub-entry-id={block.id} style={wrapperStyle}>
                    {block.lines.map((line, lineIndex) => {
                      return (
                        <p key={line.id} style={getParagraphStyle(lineIndex)}>{line.text}</p>
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
