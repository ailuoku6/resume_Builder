import React from 'react';
import { Text, View } from '@react-pdf/renderer';

const isCjkChar = (char: string): boolean => {
  return /[\u4e00-\u9fa5]/.test(char);
};

const splitText = (text: string): string[] => {
  const chunks: string[] = [];
  let latinChunk = '';

  for (const char of text) {
    if (isCjkChar(char) || char === ' ') {
      if (latinChunk) {
        chunks.push(latinChunk);
        latinChunk = '';
      }

      chunks.push(char);
      continue;
    }

    latinChunk += char;
  }

  if (latinChunk) {
    chunks.push(latinChunk);
  }

  return chunks;
};

interface CustomPdfTextProps {
  text: string;
  style?: Record<string, unknown>;
}

const CustomPdfText: React.FC<CustomPdfTextProps> = ({ text, style }) => {
  const textArray = splitText(text);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {textArray.map((item, index) => {
        return (
          <Text key={`${item}-${index}`} style={style as never}>
            {item}
          </Text>
        );
      })}
    </View>
  );
};

export default CustomPdfText;
