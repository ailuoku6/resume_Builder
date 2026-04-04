import React from 'react';
import { Text } from '@react-pdf/renderer';

interface CustomPdfTextProps {
  text: string;
  style?: Record<string, unknown>;
}

export const PDF_NO_HYPHENATION_CALLBACK = (word: string | null): string[] => {
  return [word ?? ''];
};

const normalizePdfText = (text: string): string => {
  return text.replace(/\r\n?/gu, '\n');
};

const CustomPdfText: React.FC<CustomPdfTextProps> = ({ text, style }) => {
  return (
    <Text style={style as never} hyphenationCallback={PDF_NO_HYPHENATION_CALLBACK}>
      {normalizePdfText(text)}
    </Text>
  );
};

export default CustomPdfText;
