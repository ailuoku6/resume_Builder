import React from 'react';
import { Text } from '@react-pdf/renderer';

interface CustomPdfTextProps {
  text: string;
  style?: Record<string, unknown>;
}

const LIGATURE_SEQUENCE_PATTERN = /(ffi|ffl|ff|fi|fl)/g;

export const buildCopySafePdfTextChildren = (text: string): React.ReactNode => {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(LIGATURE_SEQUENCE_PATTERN)) {
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(text.slice(cursor, start));
    }

    for (const [charIndex, char] of Array.from(match[0]).entries()) {
      nodes.push(
        <Text key={`ligature-${matchIndex}-${charIndex}`}>
          {char}
        </Text>,
      );
    }

    cursor = start + match[0].length;
    matchIndex += 1;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  if (nodes.length === 0) {
    return text;
  }

  if (nodes.length === 1 && typeof nodes[0] === 'string') {
    return nodes[0];
  }

  return nodes;
};

const CustomPdfText: React.FC<CustomPdfTextProps> = ({ text, style }) => {
  return <Text style={style as never}>{buildCopySafePdfTextChildren(text)}</Text>;
};

export default CustomPdfText;
