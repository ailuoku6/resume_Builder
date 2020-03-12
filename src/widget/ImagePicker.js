import React from "react";
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';


class ImagePicker extends React.Component{
    constructor(props){
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div style={{width:this.props.width,height:this.props.height,backgroundColor:'#F0F0F0',borderColor:'#C8C8C8',position:'relative',display:'flex',justifyContent:'center','alignItems':'center'}}>
                <img style={{width:this.props.width,height:this.props.height,zIndex:0,position:'absolute'}} src={this.props.img} alt={this.props.alt??''}/>
                <input accept={'image/*'} type={'file'} style={{zIndex:2,width:this.props.width,height:this.props.height,opacity:0,top:0,right:0,bottom:0,left:0,position:'absolute'}} onChange={(event)=>{
                    console.log(event);
                    let reads= new FileReader();
                    let file = event.target.files[0];
                    if (!file) return;
                    reads.readAsDataURL(file);
                    reads.onload = (e)=>{
                        // this.setState({
                        //     avatar:e.target.result
                        // })
                        if (this.props.onChange){
                            this.props.onChange(e.target.result)
                        }
                    }
                }}/>
                {this.props.img?(
                    <Fab size="small" style={{zIndex:3}} color="secondary" aria-label="add" onClick={()=>{
                        this.props.onChange(null)
                    }}>
                        <DeleteIcon />
                    </Fab>
                ):(
                    <Fab size="small" style={{zIndex:1}} color="primary" aria-label="add">
                        <AddIcon />
                    </Fab>
                )}
            </div>
        )
    }
}

export default ImagePicker;
