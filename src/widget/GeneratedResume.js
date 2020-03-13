import React from "react";
import { Page, Text, View, Document, StyleSheet,Image,Font } from '@react-pdf/renderer';

import CustomText from "./CustomText";

import fontR from '../font/Font-OPPOSans/OPPOSans-R.ttf'
// import fontB from '../font/Font-OPPOSans/OPPOSans-B.ttf'
// import fontH from '../font/Font-OPPOSans/OPPOSans-H.ttf'
import fontL from '../font/Font-OPPOSans/OPPOSans-L.ttf'
import fontM from '../font/Font-OPPOSans/OPPOSans-M.ttf'
// Font.register({ family: 'oppoFontR', src: fontR });
// // Font.register({family:'oppoFontB',src:fontB});
// // Font.register({family:'oppoFontH',src:fontH});
// Font.register({family:'oppoFontL',src:fontL});
// Font.register({family:'oppoFontM',src:fontM});

Font.register({ family: 'oppoFont', fonts: [
        { src: fontM,fontStyle: 'normal', fontWeight: 'bold' }, // font-style: normal, font-weight: normal
        { src: fontR, fontStyle: 'normal',fontWeight:'normal' },
        { src: fontL, fontStyle: 'normal', fontWeight: 'light' },
    ]});

//
Font.registerHyphenationCallback(word => word.length === 1 ? [word] : Array.from(word).map(char => char));


const styles = StyleSheet.create({
    page:{
        // flexDirection:'row',
        // backgroundColor:'#e4e4e4',
        // width:'100%',
        padding:50,
        fontFamily:'oppoFont'
    },
    baseInfoWrap:{
        flexDirection:'row'
    },
    image:{
        width:'25mm',
        height:'35mm',
        marginRight:20,
    },
    infoDetail:{
        // marginLeft: 20,
        marginTop: 5,
        flexDirection: 'column',
        fontWeight: 'bold',
    },
    aline:{
        flexDirection: 'row',
        alignItems: 'baseline',
        // alignItems:'end',
    },
    name:{
        // fontFamily:'oppoFontM',
        fontWeight:'bold',
        fontSize: '18',
    },
    sex:{
        // fontFamily:'oppoFontL',
        marginLeft: 20,
        fontSize: '11',
        fontWeight:'light'
    },
    address:{
        // fontFamily:'oppoFontL',
        marginBottom: 15,
        fontSize: '11',
        fontWeight:'light'
    },
    phone:{
        // fontFamily:'oppoFontL',
        fontSize: '11',
        fontWeight:'light'
    },
    email:{
        // fontFamily:'oppoFontL',
        marginLeft: 50,
        fontSize: '11',
        fontWeight:'light'
    },
    itemWrap:{
        marginTop: 15,
    },
    itemName:{
        paddingLeft: 18,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#e8e8e8',
    },
    content:{
        paddingTop:16,
        paddingLeft:20,
    },
    entryItem:{
        marginBottom: 20,
    },
    entryTitle:{
        flexDirection:'row',
        justifyContent: 'space-between',
        // paddingRight:8,
    },
    fontBigBold:{//最大加粗字体
        // fontFamily:'oppoFontM',
        fontWeight: 'bold',
        fontSize: '15',
    },
    fontBig:{//最大常规字体
        // fontFamily:'oppoFontR',
        fontSize:'15',
        fontWeight:'normal'
    },
    fontBigLight:{
        // fontFamily:'oppoFontL',
        fontSize:'15',
        fontWeight:'light'
    },
    fontMidBold:{
        // fontFamily:'oppoFontM',
        fontSize:'13',
        fontWeight: 'bold',
    },
    fontMid:{
        // fontFamily:'oppoFontR',
        fontSize:'13',
        fontWeight:'normal'
    },
    fontMidLight:{
        // fontFamily:'oppoFontL',
        fontSize:'13',
        fontWeight:'light'
    },
    fontSmaBold:{
        // fontFamily:'oppoFontM',
        fontSize:'11',
        fontWeight: 'bold',
    },
    fontSma:{
        // fontFamily:'oppoFontR',
        fontSize:'11',
        fontWeight:'normal'
    },
    fontSmaLight:{
        // fontFamily:'oppoFontL',
        fontSize:'11',
        fontWeight:'light'
    }
});

class GeneratedResume extends React.Component{
    constructor(props){
        super(props);
        this.state = {}
    }

    render() {
        const data = this.props.data;
        console.log(data.avatar);
        return (
            <Document>
                <Page size={'A4'} style={styles.page}>
                    <View style={styles.baseInfoWrap}>
                        {data.avatar&&(<View style={styles.image}>
                            <Image src={data.avatar??''}/>
                        </View>)}
                        <View style={styles.infoDetail}>
                            <View style={styles.aline}>
                                <Text style={styles.name}>{data.name}</Text>
                                <Text style={styles.sex}>{data.sex}</Text>
                            </View>
                            <Text style={styles.address}>{'居住地：'+data.liveAddress}</Text>
                            <View style={styles.aline}>
                                <Text style={styles.phone}>{'手机：'+data.phoneNum}</Text>
                                <Text style={styles.email}>{'邮箱：'+data.Email}</Text>
                            </View>
                        </View>
                    </View>

                    {data.items.map((item,index)=>{
                        return (
                            <View key={JSON.stringify(item)+index} style={styles.itemWrap}>
                                <View style={styles.itemName}>
                                    <Text style={styles.fontMidBold}>{item.itemName}</Text>
                                </View>
                                <View style={styles.content}>
                                    {item.entry.map((entryItem,entryIndex)=>{
                                        return (
                                            <View key={JSON.stringify(entryItem)+entryIndex} style={styles.entryItem}>
                                                <View style={styles.entryTitle}>
                                                    <Text style={styles.fontMid}>{entryItem.title}</Text>
                                                    <Text style={styles.fontSmaLight}>{entryItem.mark}</Text>
                                                </View>
                                                <View>
                                                    <CustomText text={entryItem.detail??''} style={styles.fontSmaLight}/>
                                                    {/*<Text style={styles.fontSmaLight}>{entryItem.detail??''}</Text>*/}
                                                </View>
                                            </View>
                                        )
                                    })}
                                    {item.subEntry.map((subEntryItem,subEntryIndex)=>{
                                        return (
                                            <View key={JSON.stringify(subEntryItem)+subEntryIndex}>
                                                <Text style={styles.fontSmaLight}>{subEntryItem.name}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        )
                    })}

                </Page>
            </Document>
        )
    }

}

export default GeneratedResume;
