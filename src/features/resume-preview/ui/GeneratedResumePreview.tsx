import React from 'react';

import type { ResumeData, ResumeSection } from '@/entities/resume/model/types';

interface GeneratedResumePreviewProps {
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

const hasSectionContent = (section: ResumeSection): boolean => {
  const hasEntryContent = section.entry.some((entryItem) => {
    return Boolean(entryItem.title.trim() || entryItem.mark.trim() || entryItem.detail.trim());
  });

  const hasSubEntryContent = section.subEntry.some((subEntryItem) => {
    return Boolean(subEntryItem.name.trim());
  });

  return hasEntryContent || hasSubEntryContent;
};

export const GeneratedResumePreview: React.FC<GeneratedResumePreviewProps> = ({ data }) => {
  const summaryLines = splitLines(data.summary);
  const visibleSections = data.items.filter(hasSectionContent);
  const contactItems = [
    { label: 'Phone', value: data.phoneNum },
    { label: 'Email', value: data.email },
    { label: 'Location', value: data.liveAddress },
    { label: 'Gender', value: data.sex },
  ].filter((item) => item.value.trim());

  return (
    <article className="resume-preview-page">
      <header className="resume-preview-hero">
        {data.avatar ? (
          <img className="resume-preview-avatar" src={data.avatar} alt={data.name || 'resume avatar'} />
        ) : null}

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
      </header>

      {summaryLines.length > 0 ? (
        <section className="resume-preview-section">
          <h2 className="resume-preview-section-title">Profile / 个人简介</h2>
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

      {visibleSections.map((section) => {
        return (
          <section key={section.id} className="resume-preview-section">
            <h2 className="resume-preview-section-title">{section.itemName}</h2>

            <div className="resume-preview-section-body">
              {section.entry.map((entryItem) => {
                const detailLines = splitLines(entryItem.detail);

                if (!entryItem.title.trim() && !entryItem.mark.trim() && detailLines.length === 0) {
                  return null;
                }

                return (
                  <div key={entryItem.id} className="resume-preview-entry">
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

              {section.subEntry.map((subEntryItem) => {
                const lines = splitLines(subEntryItem.name);

                if (lines.length === 0) {
                  return null;
                }

                return (
                  <div key={subEntryItem.id} className="resume-preview-entry resume-preview-entry--compact">
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
            </div>
          </section>
        );
      })}
    </article>
  );
};
