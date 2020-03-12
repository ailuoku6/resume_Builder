import React from "react";
import { Text, View,Font } from '@react-pdf/renderer';
//解决中文换行多出'-'的问题

const pattern = /[\u4e00-\u9fa5]+/g;
const fenci = (text)=>{
    let result = [];
    let cache = '';
    for (let i in text){
        let char_ = text[i];

        if (pattern.test(char_)||char_===' '){
            if (cache) result[result.length] = cache;
            result[result.length] = char_;
            cache = '';
        }else {
            cache+=char_;
        }
    }
    if (cache) result[result.length] = cache;
    return result;
};

class CustomText extends React.Component{
    constructor(props){
        super(props);
        this.state = {}
    }

    render() {

        let textArray = fenci(this.props.text);

        return (
            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                {textArray.map((item,index)=> <Text key={item+index} style={this.props.style}>{item}</Text>)}
            </View>
        )
    }
}

export default CustomText;
