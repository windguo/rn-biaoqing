import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    Text,
    Linking,
    View,
    Dimensions,
    Animated,
    Easing,
    PanResponder,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    InteractionManager,
    BackHandler,
    ScrollView,
    TouchableWithoutFeedback,
    RefreshControl,
    DeviceEventEmitter,
    LayoutAnimation,
    NativeModules,
    ImageBackground,
    FlatList,
    WebView,
    TextInput,
} from 'react-native';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
import { ifIphoneX } from '../../utils/iphoneX';
import IconSimple from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import urlConfig from '../../utils/urlConfig';
import PureModalUtil from '../../utils/PureModalUtil';
import * as WeChat from 'react-native-wechat';
import HttpUtil from '../../utils/HttpUtil';
import storageKeys from '../../utils/storageKeyValue'
import ScrollTabView from "../ScrollTabView";
import ImageProgress from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Bar';
let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;

export default class Me extends Component {
    static navigationOptions = {
        tabBarLabel: 'DIY表情',
        tabBarIcon: ({ tintColor, focused }) => (
            <IconSimple name="user" size={22} color={focused ? "#f60" : 'black'} />
        ),
        header: ({ navigation }) => {
            return (
                <ImageBackground style={{ ...header }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        navigation.goBack(null);
                    }}>
                        <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7, width: 20 }}>
                            <IconSimple name="arrow-left" size={25} color='#282828' />
                        </View>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, textAlign: 'center', lineHeight: 43.7, color: '#282828' }}>DIY表情生成</Text>
                    <View style={{ justifyContent: 'center', marginRight: 10, alignItems: 'center', height: 43.7 }}></View>
                </ImageBackground>
            )
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            visible: false,
            ViewHeight: new Animated.Value(0),
            username: '',
            userpwd: '',
            userName: null,
            top: parseInt(this.props.navigation.state.params.y),
            left: parseInt(this.props.navigation.state.params.x),
            bg:'',
            trueWidth: 150,
            trueHeight: 150,
            text: this.props.navigation.state.params.title,
            fontSize:14,
            width: 100,
            height:100
        };
    }
    componentWillMount() {
        this._ViewHeight = new Animated.Value(0);
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                this._top = this.state.top
                this._left = this.state.left
                this.setState({ bg: 'red' })
            },
            onPanResponderMove: (evt, gs) => {
                console.log(gs.dx + ' ' + gs.dy)
                this.setState({
                    top: this._top + gs.dy,
                    left: this._left + gs.dx
                })
            },
            onPanResponderRelease: (evt, gs) => {
                this.setState({
                    bg: 'white',
                    top: this._top + gs.dy,
                    left: this._left + gs.dx
                })
            }
        })
    }
    componentWillUnmount() {
        this.subscription.remove();
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                this._top = this.state.top
                this._left = this.state.left
                this.setState({ bg: 'red' })
            },
            onPanResponderMove: (evt, gs) => {
                console.log(gs.dx + ' ' + gs.dy)
                this.setState({
                    top: this._top + gs.dy,
                    left: this._left + gs.dx
                })
            },
            onPanResponderRelease: (evt, gs) => {
                this.setState({
                    bg: 'white',
                    top: this._top + gs.dy,
                    left: this._left + gs.dx
                })
            }
        })
    }
    componentDidMount() {
        this.loadContentData();
        this.subscription = DeviceEventEmitter.addListener('LoginSuccess', this.LoginSuccess);
        setTimeout(() => { GLOBAL.userInfo && this.setState({ username: GLOBAL.userInfo.username }) }, 500);
        this.viewDidAppear = this.props.navigation.addListener(
            'didFocus',
            (obj) => {
                this.getImagesSize();
            }
        );
    }

    getImagesSize = () =>{
        Image.getSize(this.state.data.nurl, (width, height) => {
            //width 图片的宽度 Math.floor向下取整
            //height 图片的高度
            let proportion = screenWidth;
            let myHeight = Math.floor(screenWidth / width * height);
            console.log('trueWidthtrueWidthtrueWidth', width);
            this.setState({ width: proportion, height: myHeight,trueWidth:width,trueHeight:height });
        })
    }
    LoginSuccess = () => {
        this.setState({ username: GLOBAL.userInfo.username });
    }
    pushToWeb = (params) => {
        let url = '';
        if (params === 'yjfk') {
            url = urlConfig.suggestURL;
        } else if (params === 'yhsyxy') {
            url = urlConfig.agreementURL;
        }
        this.props.navigation.navigate('Web', { url: url });
    }
    renderSpinner = (text) => {
        return (
            <TouchableWithoutFeedback
                onPress={() => { this.setState({ visible: false }); }}>
                <View key="spinner" style={styles.spinner}>
                    <Animated.View style={{
                        justifyContent: 'center',
                        width: WIDTH,
                        height: this._ViewHeight,
                        backgroundColor: '#fcfcfc',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'hidden'
                    }}>
                        <View style={styles.shareParent}>
                            <TouchableOpacity
                                style={styles.base}
                                onPress={() => this.clickToShare('Session')}
                            >
                                <View style={styles.shareContent}>
                                    <Image style={styles.shareIcon} source={require('../../assets/share_icon_wechat.png')} />
                                    <Text style={styles.spinnerTitle}>微信好友</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.base}
                                onPress={() => this.clickToShare('TimeLine')}
                            >
                                <View style={styles.shareContent}>
                                    <Image style={styles.shareIcon} source={require('../../assets/share_icon_moments.png')} />
                                    <Text style={styles.spinnerTitle}>微信朋友圈</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 10, backgroundColor: '#f5f5f5' }}></View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 16, color: 'black', textAlign: 'center' }}>取消</Text>
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    };
    show = () => {
        this._ViewHeight.setValue(0);
        this.setState({
            visible: true
        }, Animated.timing(this._ViewHeight, {
            fromValue: 0,
            toValue: 140, // 目标值
            duration: 200, // 动画时间
            easing: Easing.linear // 缓动函数
        }).start());
    };
    close = () => {
        this.setState({
            visible: false
        });
    };
    loadContentData = async (resolve) => {
        let url = urlConfig.DetailUrl + '&id=' + this.props.navigation.state.params.id;
        console.log('loadUrlloadUrlloadUrlloadUrlloadUrl', url);
        let res = await HttpUtil.GET(url);
        console.log(res);
        resolve && resolve();
        if (this.props.index !== 0) { this.isNotfirstFetch = true };
        let result = res.result ? res.result : [];
        console.log('result===', result);
        this.setState({
            data: result,
        });
        console.log('res', res);
    };

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Color.f5f5f5 }}>
                <View style={{ width: WIDTH, height: 10, backgroundColor: Color.f5f5f5 }} />
                <View style={{alignItems:'center'}}>
                    <View style={{ marginTop: 10, marginBottom: 10 }}>
                        <ImageProgress
                            source={{ uri: this.state.data.nurl }}
                            resizeMode={'cover'}
                            indicatorProps={{
                                size: 30,
                                borderWidth: 1,
                                color: 'rgba(255, 160, 0, 0.8)',
                                unfilledColor: 'rgba(200, 200, 200, 0.1)'
                            }}
                            indicator={ProgressBar}
                            style={{ width: this.state.trueWidth, height: this.state.trueHeight }} />
                    </View>
                    <View
                        {...this._panResponder.panHandlers}
                        style={[styles.rect, {
                            position: 'absolute',
                            top: this.state.top,
                            left: this.state.left,
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            padding: 4
                        }]}>
                        <Text style={{ fontSize: 18 }}>{this.state.text}</Text>
                    </View>
                    <TextInput
                        style={styles.textInputStyle}
                        clearTextOnFocus={true}
                        defaultValue={this.state.text}
                        onChangeText={(text) => this.setState({ text })}
                    >
                    </TextInput>
                </View>
                <TouchableOpacity style={{alignItems: 'center', marginTop: 20}} activeOpacity={0.8} onPress={() => {
                    this.props.navigation.navigate('creatBiaoqingResult', { 
                        id: this.state.data.id, 
                        title: this.state.text, 
                        nurl: this.state.data.nurl, 
                        x: this.state.left - (screenWidth - this.state.trueWidth) / 2,
                        y: this.state.top+10,
                        fontSize: this.state.fontSize,
                        width: this.state.trueWidth,
                        height: this.state.trueHeight,
                        classid: this.state.data.classid 
                    });
                }}>
                    <View style={{ width: '90%', padding: 15, backgroundColor: '#f60',borderRadius: 8}}>
                        <Text style={{ textAlign: 'center',color:'#fff',fontSize:16}}>立即生成表情</Text>
                    </View>
                </TouchableOpacity>
                <PureModalUtil
                    visible={this.state.visible}
                    close={this.close}
                    contentView={this.renderSpinner} />
            </View>
        );
    }

}
const header = {
    backgroundColor: '#fff',
    ...ifIphoneX({
        paddingTop: 44,
        height: 88
    }, {
            paddingTop: Platform.OS === "ios" ? 20 : SCALE(StatusBarHeight()),
            height: 64,
        }),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
}
const styles = StyleSheet.create({
    textInputStyle:{
        borderWidth:StyleSheet.hairlineWidth,
        borderColor:'#ccc',
        width:'90%',
        marginTop:15,
        borderRadius:8,
        padding:10,
        backgroundColor: '#FFF',
        fontSize:16
    },
    base: {
        flex: 1
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFF'
    },
    spinner: {
        width: WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)'
    },
    spinnerContent: {
        justifyContent: 'center',
        width: WIDTH,
        backgroundColor: '#fcfcfc',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    spinnerTitle: {
        fontSize: 14,
        color: '#313131',
        textAlign: 'center',
        marginTop: 5
    },
    shareParent: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10
    },
    shareContent: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareIcon: {
        width: 40,
        height: 40
    },
});