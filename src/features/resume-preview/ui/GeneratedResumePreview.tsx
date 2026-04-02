import React from 'react';

import { FONT_PRESET_CONFIG } from '@/entities/resume/model/font-presets';
import {
  getVisibleResumeEntries,
  getVisibleResumeSubEntries,
  isBulletLine,
  normalizeBulletLine,
  splitResumeTextLines,
} from '@/entities/resume/model/visibility';
import type { ResumeData } from '@/entities/resume/model/types';

interface GeneratedResumePreviewProps {
  data: ResumeData;
}

export const GeneratedResumePreview: React.FC<GeneratedResumePreviewProps> = ({ data }) => {
  const summaryLines = splitResumeTextLines(data.summary);
  const hasSummary = summaryLines.length > 0;
  const previewFontClassName =
    FONT_PRESET_CONFIG[data.fontPreset]?.previewClassName ?? FONT_PRESET_CONFIG.oppo.previewClassName;
  const contactItems = [
    { label: 'Phone', value: data.phoneNum },
    { label: 'Email', value: data.email },
    { label: 'Location', value: data.liveAddress },
    { label: 'Gender', value: data.sex },
  ].filter((item) => item.value.trim());

  return (
    <article className={`resume-preview-page ${previewFontClassName}`} data-preview-id="base-info">
      <header className={`resume-preview-hero${hasSummary ? ' resume-preview-hero--with-divider' : ''}`}>
        <div className="resume-preview-hero-main">
          {data.avatar ? (
            <img className="resume-preview-avatar" src={data.avatar} alt={data.name || 'resume avatar'} />
          ) : null}

          <div className="resume-preview-hero-content">
            <h1 className="resume-preview-name">{data.name || '未命名候选人'}</h1>
            {data.headline.trim() ? <p className="resume-preview-headline">{data.headline}</p> : null}

            {contactItems.length > 0 ? (
              <div className="resume-preview-contact-list">
                {contactItems.map((item) => {
                  return (
                    <div key={item.label} className="resume-preview-contact-item">
                      <span className="resume-preview-contact-label">{item.label}</span>
                      <span className="resume-preview-contact-value">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {hasSummary ? (
        <section className="resume-preview-section">
          <h2 className="resume-preview-section-title resume-preview-section-title--plain">
            Profile / 个人简介
          </h2>
          <div className="resume-preview-section-body">
            {summaryLines.map((line, index) => {
              return (
                <p key={`summary-${index}`} className="resume-preview-paragraph">
                  {line}
                </p>
              );
            })}
          </div>
        </section>
      ) : null}

      {data.items.map((section) => {
        const visibleEntries = getVisibleResumeEntries(section);
        const visibleSubEntries = getVisibleResumeSubEntries(section);
        const hiddenEntryAnchors = section.entry.filter(
          (entryItem) => !visibleEntries.some((visibleItem) => visibleItem.id === entryItem.id),
        );
        const hiddenSubEntryAnchors = section.subEntry.filter(
          (subEntryItem) => !visibleSubEntries.some((visibleItem) => visibleItem.id === subEntryItem.id),
        );
        const showVisibleSection =
          !section.hidden && (visibleEntries.length > 0 || visibleSubEntries.length > 0);

        if (!showVisibleSection) {
          return (
            <div key={section.id} className="resume-preview-anchor-group" data-preview-section-id={section.id}>
              {section.entry.map((entryItem) => {
                return (
                  <div
                    key={entryItem.id}
                    className="resume-preview-anchor"
                    data-preview-entry-id={entryItem.id}
                  />
                );
              })}

              {section.subEntry.map((subEntryItem) => {
                return (
                  <div
                    key={subEntryItem.id}
                    className="resume-preview-anchor"
                    data-preview-sub-entry-id={subEntryItem.id}
                  />
                );
              })}
            </div>
          );
        }

        return (
          <section key={section.id} className="resume-preview-section" data-preview-section-id={section.id}>
            <h2 className="resume-preview-section-title">{section.itemName}</h2>

            <div className="resume-preview-section-body">
              {visibleEntries.map((entryItem) => {
                const detailLines = splitResumeTextLines(entryItem.detail);

                return (
                  <div key={entryItem.id} className="resume-preview-entry" data-preview-entry-id={entryItem.id}>
                    <div className="resume-preview-entry-header">
                      <h3 className="resume-preview-entry-title">{entryItem.title || '未命名条目'}</h3>
                      {entryItem.mark.trim() ? (
                        <span className="resume-preview-entry-mark">{entryItem.mark}</span>
                      ) : null}
                    </div>

                    {detailLines.map((line, index) => {
                      const bullet = isBulletLine(line);
                      const content = normalizeBulletLine(line);

                      return (
                        <p
                          key={`${entryItem.id}-${index}`}
                          className={`resume-preview-paragraph${
                            bullet ? ' resume-preview-paragraph--bullet' : ''
                          }`}
                        >
                          {bullet ? `• ${content}` : content}
                        </p>
                      );
                    })}
                  </div>
                );
              })}

              {hiddenEntryAnchors.map((entryItem) => {
                return (
                  <div
                    key={entryItem.id}
                    className="resume-preview-anchor"
                    data-preview-entry-id={entryItem.id}
                  />
                );
              })}

              {visibleSubEntries.map((subEntryItem) => {
                const lines = splitResumeTextLines(subEntryItem.name);

                return (
                  <div
                    key={subEntryItem.id}
                    className="resume-preview-entry resume-preview-entry--compact"
                    data-preview-sub-entry-id={subEntryItem.id}
                  >
                    {lines.map((line, index) => {
                      const bullet = isBulletLine(line);
                      const content = normalizeBulletLine(line);

                      return (
                        <p
                          key={`${subEntryItem.id}-${index}`}
                          className={`resume-preview-paragraph${
                            bullet ? ' resume-preview-paragraph--bullet' : ''
                          }`}
                        >
                          {bullet ? `• ${content}` : content}
                        </p>
                      );
                    })}
                  </div>
                );
              })}

              {hiddenSubEntryAnchors.map((subEntryItem) => {
                return (
                  <div
                    key={subEntryItem.id}
                    className="resume-preview-anchor"
                    data-preview-sub-entry-id={subEntryItem.id}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </article>
  );
};
