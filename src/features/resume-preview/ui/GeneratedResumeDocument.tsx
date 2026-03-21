import React from 'react';
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import type { ResumeData } from '@/entities/resume/model/types';

import fontL from '@/font/Font-OPPOSans/OPPOSans-L.ttf';
import fontM from '@/font/Font-OPPOSans/OPPOSans-M.ttf';
import fontR from '@/font/Font-OPPOSans/OPPOSans-R.ttf';

import CustomPdfText from './CustomPdfText';

Font.register({
  family: 'oppoFont',
  fonts: [
    { src: fontM, fontStyle: 'normal', fontWeight: 'bold' },
    { src: fontR, fontStyle: 'normal', fontWeight: 'normal' },
    { src: fontL, fontStyle: 'normal', fontWeight: 'light' },
  ],
});

Font.registerHyphenationCallback((word) => {
  if (word.length === 1) {
    return [word];
  }

  return Array.from(word).map((char) => char);
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'oppoFont',
  },
  baseInfoWrap: {
    flexDirection: 'row',
  },
  image: {
    width: '25mm',
    height: '35mm',
    marginRight: 20,
  },
  infoDetail: {
    marginTop: 5,
    flexDirection: 'column',
    fontWeight: 'bold',
  },
  aline: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    fontWeight: 'bold',
    fontSize: '18',
  },
  sex: {
    marginLeft: 20,
    fontSize: '11',
    fontWeight: 'light',
  },
  address: {
    marginBottom: 15,
    fontSize: '11',
    fontWeight: 'light',
  },
  phone: {
    fontSize: '11',
    fontWeight: 'light',
  },
  email: {
    marginLeft: 50,
    fontSize: '11',
    fontWeight: 'light',
  },
  itemWrap: {
    marginTop: 15,
  },
  itemName: {
    paddingLeft: 18,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#e8e8e8',
  },
  content: {
    paddingTop: 16,
    paddingLeft: 20,
  },
  entryItem: {
    marginBottom: 10,
  },
  entryTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fontMidBold: {
    fontSize: '13',
    fontWeight: 'bold',
  },
  fontMid: {
    fontSize: '13',
    fontWeight: 'normal',
  },
  fontSmaLight: {
    fontSize: '11',
    fontWeight: 'light',
    lineHeight: 15,
  },
});

interface GeneratedResumeDocumentProps {
  data: ResumeData;
}

const GeneratedResumeDocument: React.FC<GeneratedResumeDocumentProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.baseInfoWrap}>
          {data.avatar ? (
            <View style={styles.image}>
              <Image src={data.avatar} />
            </View>
          ) : null}

          <View style={styles.infoDetail}>
            <View style={styles.aline}>
              <Text style={styles.name}>{data.name}</Text>
              <Text style={styles.sex}>{data.sex}</Text>
            </View>
            <Text style={styles.address}>{`居住地：${data.liveAddress}`}</Text>
            <View style={styles.aline}>
              <Text style={styles.phone}>{`手机：${data.phoneNum}`}</Text>
              <Text style={styles.email}>{`邮箱：${data.email}`}</Text>
            </View>
          </View>
        </View>

        {data.items.map((item) => {
          return (
            <View key={item.id} style={styles.itemWrap}>
              <View style={styles.itemName}>
                <Text style={styles.fontMidBold}>{item.itemName}</Text>
              </View>

              <View style={styles.content}>
                {item.entry.map((entryItem, entryIndex) => {
                  return (
                    <View
                      key={entryItem.id}
                      style={entryIndex === item.entry.length - 1 ? {} : styles.entryItem}
                    >
                      <View style={styles.entryTitle}>
                        <Text style={styles.fontMid}>{entryItem.title}</Text>
                        <Text style={styles.fontSmaLight}>{entryItem.mark}</Text>
                      </View>
                      <CustomPdfText text={entryItem.detail} style={styles.fontSmaLight as never} />
                    </View>
                  );
                })}

                {item.subEntry.map((subEntryItem, subEntryIndex) => {
                  return (
                    <View
                      key={subEntryItem.id}
                      style={{ marginBottom: subEntryIndex === item.subEntry.length - 1 ? 0 : 8 }}
                    >
                      <CustomPdfText text={subEntryItem.name} style={styles.fontSmaLight as never} />
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default GeneratedResumeDocument;
