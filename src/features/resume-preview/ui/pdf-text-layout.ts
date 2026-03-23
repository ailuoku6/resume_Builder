const PT_TO_PX = 4 / 3;
const DEFAULT_TEXT_WIDTH_RATIO = 0.56;
const MEASURE_TEXT_CACHE = new Map<string, number>();
const SEGMENTER_INTL = Intl as typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity?: 'grapheme' | 'word' | 'sentence' },
  ) => {
    segment(input: string): Iterable<{ segment: string }>;
  };
};

const PDF_FONT_FAMILY_TO_BROWSER_FONT: Record<string, string> = {
  oppoFont: '"ResumeOppo", "PingFang SC", "Microsoft YaHei", sans-serif',
};

const getMeasureContext = (): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');

  return canvas.getContext('2d');
};

const MEASURE_CONTEXT = getMeasureContext();

const WORD_SEGMENTER =
  typeof Intl !== 'undefined' && SEGMENTER_INTL.Segmenter
    ? new SEGMENTER_INTL.Segmenter(undefined, { granularity: 'word' })
    : null;

type PdfFontWeight = 'light' | 'normal' | 'bold';

interface MeasurePdfTextWidthOptions {
  fontFamily?: string;
  fontSize: number;
  fontWeight?: PdfFontWeight;
  letterSpacing?: number;
}

interface WrapPdfTextOptions extends MeasurePdfTextWidthOptions {
  maxWidth: number;
}

const resolveBrowserFontFamily = (fontFamily?: string): string => {
  if (!fontFamily) {
    return PDF_FONT_FAMILY_TO_BROWSER_FONT.oppoFont;
  }

  return PDF_FONT_FAMILY_TO_BROWSER_FONT[fontFamily] ?? PDF_FONT_FAMILY_TO_BROWSER_FONT.oppoFont;
};

const resolveFontWeight = (fontWeight: PdfFontWeight = 'normal'): number => {
  if (fontWeight === 'bold') {
    return 700;
  }

  if (fontWeight === 'light') {
    return 300;
  }

  return 400;
};

const getLetterSpacingWidth = (text: string, letterSpacing = 0): number => {
  if (!letterSpacing) {
    return 0;
  }

  return Math.max(Array.from(text).length - 1, 0) * letterSpacing;
};

const segmentText = (text: string): string[] => {
  if (!text) {
    return [];
  }

  if (WORD_SEGMENTER) {
    return Array.from(WORD_SEGMENTER.segment(text), (segment) => segment.segment);
  }

  return text.match(/\s+|[A-Za-z0-9@._:/+-]+|./gu) ?? Array.from(text);
};

export const measurePdfTextWidth = (
  text: string,
  { fontFamily, fontSize, fontWeight, letterSpacing }: MeasurePdfTextWidthOptions,
): number => {
  if (!text) {
    return 0;
  }

  const cacheKey = [fontFamily ?? '', fontSize, fontWeight ?? 'normal', letterSpacing ?? 0, text].join('|');
  const cachedWidth = MEASURE_TEXT_CACHE.get(cacheKey);

  if (cachedWidth !== undefined) {
    return cachedWidth;
  }

  const additionalSpacing = getLetterSpacingWidth(text, letterSpacing);

  if (!MEASURE_CONTEXT) {
    const fallbackWidth = Array.from(text).length * fontSize * DEFAULT_TEXT_WIDTH_RATIO + additionalSpacing;
    MEASURE_TEXT_CACHE.set(cacheKey, fallbackWidth);
    return fallbackWidth;
  }

  const fontSizeInPixels = fontSize * PT_TO_PX;
  const browserFontFamily = resolveBrowserFontFamily(fontFamily);
  const numericFontWeight = resolveFontWeight(fontWeight);

  MEASURE_CONTEXT.font = `${numericFontWeight} ${fontSizeInPixels}px ${browserFontFamily}`;

  const measuredWidthInPixels = MEASURE_CONTEXT.measureText(text).width;
  const measuredWidth = measuredWidthInPixels / PT_TO_PX + additionalSpacing;

  MEASURE_TEXT_CACHE.set(cacheKey, measuredWidth);

  return measuredWidth;
};

const splitOversizedToken = (token: string, options: WrapPdfTextOptions): string[] => {
  const parts: string[] = [];
  let current = '';

  for (const char of Array.from(token)) {
    const candidate = `${current}${char}`;

    if (!current || measurePdfTextWidth(candidate, options) <= options.maxWidth) {
      current = candidate;
      continue;
    }

    parts.push(current);
    current = char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
};

const wrapSingleLine = (line: string, options: WrapPdfTextOptions): string[] => {
  if (!line) {
    return [''];
  }

  if (measurePdfTextWidth(line, options) <= options.maxWidth) {
    return [line];
  }

  const wrappedLines: string[] = [];
  let current = '';

  for (const rawToken of segmentText(line)) {
    const token = current ? rawToken : rawToken.replace(/^[ \t]+/u, '');

    if (!token) {
      continue;
    }

    const candidate = `${current}${token}`;

    if (!current || measurePdfTextWidth(candidate, options) <= options.maxWidth) {
      current = candidate;
      continue;
    }

    const normalizedCurrent = current.replace(/[ \t]+$/u, '');

    if (normalizedCurrent) {
      wrappedLines.push(normalizedCurrent);
    }

    const nextToken = rawToken.replace(/^[ \t]+/u, '');

    if (!nextToken) {
      current = '';
      continue;
    }

    if (measurePdfTextWidth(nextToken, options) <= options.maxWidth) {
      current = nextToken;
      continue;
    }

    const splitTokenLines = splitOversizedToken(nextToken, options);

    wrappedLines.push(...splitTokenLines.slice(0, -1));
    current = splitTokenLines[splitTokenLines.length - 1] ?? '';
  }

  if (current) {
    wrappedLines.push(current.replace(/[ \t]+$/u, ''));
  }

  return wrappedLines.length > 0 ? wrappedLines : [''];
};

export const wrapPdfText = (text: string, options: WrapPdfTextOptions): string[] => {
  if (!text) {
    return [''];
  }

  return text
    .replace(/\r\n?/gu, '\n')
    .split('\n')
    .flatMap((line) => wrapSingleLine(line, options));
};

export const wrapPdfTextToString = (text: string, options: WrapPdfTextOptions): string => {
  return wrapPdfText(text, options).join('\n');
};

export const ensurePdfMeasurementFontsReady = async (): Promise<void> => {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return;
  }

  await Promise.allSettled([
    document.fonts.load('400 16px "ResumeOppo"'),
    document.fonts.load('700 16px "ResumeOppo"'),
  ]);

  await document.fonts.ready;
};
