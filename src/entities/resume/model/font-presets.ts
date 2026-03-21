// Add future font presets here. The selector UI, preview class, and PDF export
// family all derive from this registry.
export const FONT_PRESET_CONFIG = {
  oppo: {
    label: 'OPPOSans',
    previewClassName: 'resume-preview-page--oppo',
    pdfFontFamily: 'oppoFont',
  },
} as const;

export type ResumeFontPreset = keyof typeof FONT_PRESET_CONFIG;

export const DEFAULT_FONT_PRESET: ResumeFontPreset = 'oppo';

export const FONT_PRESET_OPTIONS: Array<{
  value: ResumeFontPreset;
  label: string;
}> = (Object.keys(FONT_PRESET_CONFIG) as ResumeFontPreset[]).map((value) => ({
  value,
  label: FONT_PRESET_CONFIG[value].label,
}));

export const isResumeFontPreset = (value: unknown): value is ResumeFontPreset => {
  return typeof value === 'string' && value in FONT_PRESET_CONFIG;
};
