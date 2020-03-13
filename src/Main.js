import React from "react";
import clsx from 'clsx';
import { Container,
    Paper,
    Fab,
    TextField,
    ButtonGroup,
    Button ,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    AppBar,
    Toolbar,
    Drawer,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ReactSortable from "react-sortablejs";
import ImagePicker from './widget/ImagePicker'
import GeneratedResume from "./widget/GeneratedResume";

import {PDFViewer} from '@react-pdf/renderer';

import './styles.css';

const AddList = [
    {name:'在校经历',},
    {name:'竞赛经历',},
    {name:'获奖经历'},
    {name:'论文期刊'},
    {name:'兴趣爱好'},
    {name:'考研信息'},
    {name:'求职意向'},
    {name:'项目经历'},
    {name:'职业技能'},
    {name:'资格证书'},
    {name:'教育背景'}
];

class Main extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            avatar:null,
            name:'潜伏',
            sex:'男',
            liveAddress:'广西省玉林市',
            phoneNum:'17235653225',
            Email:'xxx',
            items:[],
            edit:true,
            open:false
        }
    }

    render() {
        let fabColor = '#3388ff';
        // let classes = useStyles();
        return (
            <React.Fragment>

                <div style={{display:this.state.open?'flex':'block'}}>
                    <AppBar
                        position={'fixed'}
                        style={{width:this.state.open?`calc(100% - 240px)`:'100%'}}
                    >
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={()=>{
                                    this.setState({
                                        open:!this.state.open
                                    })
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" noWrap>
                                简历制作
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Drawer style={{width:240}} variant="persistent" anchor="left" open={this.state.open} onClose={()=>this.setState({open:false})}>
                        <div style={{width:240}}>
                            <List>
                                {AddList.map((item,index)=>{
                                    return (
                                        <ListItem button key={item.name} onClick={()=>{
                                            if (!this.state.edit) return;
                                            let newitem = {
                                                itemName:item.name,
                                                entry:[

                                                ],
                                                subEntry:[

                                                ]
                                            };
                                            let items = this.state.items;
                                            items[items.length] = newitem;
                                            this.setState({items:items})
                                        }}>
                                            <ListItemIcon><AddIcon/></ListItemIcon>
                                            <ListItemText primary={item.name}/>
                                        </ListItem>
                                    )
                                })}
                            </List>
                        </div>
                    </Drawer>

                    <Container className={'container'}>
                        {this.state.edit&&(
                            <Paper style={{marginBottom:20}} elevation={3} square className={'resume_paper'}>
                                <form>
                                    <div>
                                        <TextField label={'姓名'} value={this.state.name} onChange={(event)=>{
                                            this.setState({
                                                name:event.target.value
                                            })
                                        }}/>
                                        <FormControl>
                                            <InputLabel>性别</InputLabel>
                                            <Select
                                                value={this.state.sex}
                                                onChange={(event)=>{
                                                    this.setState({
                                                        sex:event.target.value
                                                    })
                                                }}
                                            >
                                                <MenuItem value={'男'}>男</MenuItem>
                                                <MenuItem value={'女'}>女</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div>
                                        <TextField style={{width:'45%'}} label={'居住地'} value={this.state.liveAddress} onChange={(event)=>{
                                            this.setState({
                                                liveAddress:event.target.value
                                            })
                                        }}/>
                                        <TextField style={{width:'45%'}} label={'手机'} value={this.state.phoneNum} onChange={(event)=>{
                                            this.setState({
                                                phoneNum:event.target.value
                                            })
                                        }}/>
                                    </div>
                                    <div>
                                        <TextField style={{width:'45%'}} label={'邮箱'} value={this.state.Email} onChange={(event)=>{
                                            this.setState({
                                                Email:event.target.value
                                            })
                                        }}/>

                                    </div>
                                </form>
                            </Paper>
                        )}
                        {this.state.edit&&(
                            <Paper elevation={3} square className={'resume_paper'}>
                                <div className={'baseInfoWrap'}>
                                    {/*<img className={'avatar'} src={this.state.avatar} alt={'也可以不传入照片'}/>*/}
                                    <ImagePicker className={'avatar'} alt={'也可以不传入照片'} height={'35mm'} width={'25mm'} img={this.state.avatar} onChange={(value)=>{
                                        this.setState({
                                            avatar:value
                                        })
                                    }}/>
                                    <div className={'infoDetail'}>
                                        <div className={'aline'}>
                                            <div className={'name'}>{this.state.name}</div>
                                            <div className={'sex'}>{this.state.sex}</div>
                                        </div>
                                        <div className={'address'}>{"居住地："+this.state.liveAddress}</div>
                                        <div className={'aline'}>
                                            <div className={'phone'}>{'手机  '+this.state.phoneNum}</div>
                                            <div className={'email'}>{'邮箱  '+this.state.Email}</div>
                                        </div>
                                    </div>
                                </div>

                                <ReactSortable
                                    onChange={(order,sortable,evt)=>{
                                        let newIndex = evt.newIndex;
                                        let oldIndex = evt.oldIndex;
                                        let items = this.state.items;
                                        let item = items[oldIndex];
                                        items.splice(oldIndex,1);
                                        items.splice(newIndex,0,item);
                                        this.setState({
                                            items:items
                                        })

                                    }}

                                    options={{
                                        animation: 150,
                                        easing: "cubic-bezier(1, 0, 0, 1)",
                                        ghostClass: "sortable-ghost",
                                        disabled:!this.state.edit,
                                    }}
                                >

                                    {this.state.items.map((item,index)=>{
                                        console.log(index,item);
                                        return (
                                            <div className={'itemWrap'}>
                                                <div className={'itemName'}>
                                                    {this.state.edit?(
                                                        <div>
                                                            <TextField value={item.itemName} onChange={(event)=>{
                                                                console.log(event.target.value);
                                                                console.log(index);
                                                                // item.itemName = event.target.value;
                                                                let items = this.state.items;
                                                                items[index].itemName = event.target.value;
                                                                this.setState({
                                                                    items:items
                                                                })
                                                            }}/>
                                                            <IconButton aria-label="delete" onClick={()=>{
                                                                let items = this.state.items;
                                                                items.splice(index,1);
                                                                this.setState({
                                                                    items:items
                                                                })
                                                            }}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </div>
                                                    ):(
                                                        <div>
                                                            {item.itemName}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={'content'}>

                                                    <ReactSortable
                                                        onChange={(order,sortable,evt)=>{
                                                            let newIndex = evt.newIndex;
                                                            let oldIndex = evt.oldIndex;
                                                            let items = this.state.items;

                                                            let entry = items[index].entry[oldIndex];
                                                            items[index].entry.splice(oldIndex,1);
                                                            items[index].entry.splice(newIndex,0,entry);
                                                            this.setState({
                                                                items:items
                                                            })

                                                        }}

                                                        options={{
                                                            animation: 150,
                                                            easing: "cubic-bezier(1, 0, 0, 1)",
                                                            ghostClass: "sortable-ghost",
                                                            disabled:!this.state.edit,
                                                        }}
                                                    >

                                                        {item.entry.map((entryItem,entryIndex)=>{
                                                            return(
                                                                <div className={'entryItem'}>
                                                                    <div className={'entryTitle'}>
                                                                        {/*<div>{entryItem.title}</div>*/}
                                                                        <TextField value={entryItem.title} onChange={(event)=>{
                                                                            let items = this.state.items;
                                                                            items[index].entry[entryIndex].title = event.target.value;
                                                                            this.setState({
                                                                                items:items
                                                                            })
                                                                        }} />
                                                                        {/*<div>{entryItem.mark}</div>*/}
                                                                        <TextField value={entryItem.mark} onChange={(event)=>{
                                                                            let items = this.state.items;
                                                                            items[index].entry[entryIndex].mark = event.target.value;
                                                                            this.setState({
                                                                                items:items
                                                                            })
                                                                        }} />
                                                                    </div>

                                                                    <div>
                                                                        <TextField className={'fulInput'} value={entryItem.detail} multiline onChange={(event)=>{
                                                                            let items = this.state.items;
                                                                            items[index].entry[entryIndex].detail = event.target.value;
                                                                            this.setState({
                                                                                items:items
                                                                            })
                                                                        }}/>

                                                                        <IconButton aria-label="delete" onClick={()=>{
                                                                            let items = this.state.items;
                                                                            items[index].entry.splice(entryIndex,1);
                                                                            this.setState({
                                                                                items:items
                                                                            })
                                                                        }}>
                                                                            <DeleteIcon />
                                                                        </IconButton>

                                                                    </div>
                                                                </div>
                                                            )
                                                        })}

                                                    </ReactSortable>


                                                    <ReactSortable
                                                        onChange={(order,sortable,evt)=>{
                                                            let newIndex = evt.newIndex;
                                                            let oldIndex = evt.oldIndex;
                                                            let items = this.state.items;

                                                            let subentry = items[index].subEntry[oldIndex];
                                                            items[index].subEntry.splice(oldIndex,1);
                                                            items[index].subEntry.splice(newIndex,0,subentry);
                                                            this.setState({
                                                                items:items
                                                            })

                                                        }}

                                                        options={{
                                                            animation: 150,
                                                            easing: "cubic-bezier(1, 0, 0, 1)",
                                                            ghostClass: "sortable-ghost",
                                                            disabled:!this.state.edit,
                                                        }}
                                                    >
                                                        {item.subEntry.map((subEntryItem,subEntryIndex)=>{
                                                            return(
                                                                <div>
                                                                    {/*{subEntryItem.name}*/}
                                                                    <TextField value={subEntryItem.name} onChange={(event)=>{
                                                                        let items = this.state.items;
                                                                        items[index].subEntry[subEntryIndex].name = event.target.value;
                                                                        this.setState({
                                                                            items:items
                                                                        })
                                                                    }}/>
                                                                    <IconButton aria-label="delete" onClick={()=>{
                                                                        let items = this.state.items;
                                                                        items[index].subEntry.splice(subEntryIndex,1);
                                                                        this.setState({
                                                                            items:items
                                                                        })
                                                                    }}>
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </div>
                                                            )
                                                        })}

                                                    </ReactSortable>



                                                    <div>
                                                        <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                                                            <Button disabled={item.subEntry.length>0} onClick={()=>{
                                                                let newEntry = {
                                                                    title:'大条目标题',
                                                                    detail:'大条目详情',
                                                                    mark:'2018-01 至 2020-3'
                                                                };

                                                                let items = this.state.items;
                                                                items[index].entry.push(newEntry);

                                                                this.setState({
                                                                    items:items
                                                                })

                                                            }}>添加大条目</Button>
                                                            <Button disabled={item.entry.length>0} onClick={()=>{
                                                                let newSubEntry = {name:'小条目'};
                                                                let items = this.state.items;
                                                                items[index].subEntry.push(newSubEntry);

                                                                this.setState({
                                                                    items:items
                                                                })
                                                            }}>添加小条目</Button>
                                                        </ButtonGroup>
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                    })}

                                </ReactSortable>

                                <div style={{right:'50%',bottom:6,display:"inline-block",position:"absolute"}} className={'addItem'}>
                                    <Fab color="primary" aria-label="add" onClick={()=>{
                                        let newItem = {
                                            itemName:'请输入大项名称，如教育背景',
                                            entry:[
                                                // {
                                                //     title:'',
                                                //     detail:'',
                                                //     mark:'2018-01 至 2020-3'
                                                // }
                                            ],
                                            subEntry:[
                                                // {name:''}
                                            ]
                                        };

                                        let items = this.state.items;
                                        items[items.length] = newItem;
                                        this.setState({
                                            items:items
                                        })

                                    }}>
                                        <AddIcon />
                                    </Fab>
                                </div>
                            </Paper>
                        )}

                        {!this.state.edit&&(
                            <PDFViewer className="pdf-viewer">
                                <GeneratedResume data={this.state}/>
                            </PDFViewer>
                        )}

                    </Container>
                </div>


                <Fab color="inherit" aria-label="add" size={'small'} style={{position:'fixed',right:30,bottom:30,backgroundColor:fabColor}} onClick={()=>{
                    let edit = !this.state.edit;
                    this.setState({
                        edit:edit
                    })
                }}>
                    {this.state.edit?(
                        <DoneIcon color={'inherit'} style={{color:'#fff'}}/>
                    ):(
                        <EditIcon color={'inherit'} style={{color:'#fff'}}/>
                    )}
                </Fab>
            </React.Fragment>
        )
    }
}

export default Main;
