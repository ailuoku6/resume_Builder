import React from 'react';
import { Text } from '@react-pdf/renderer';

interface CustomPdfTextProps {
  text: string;
  style?: Record<string, unknown>;
}

const CustomPdfText: React.FC<CustomPdfTextProps> = ({ text, style }) => {
  return <Text style={style as never}>{text}</Text>;
};

export default CustomPdfText;
