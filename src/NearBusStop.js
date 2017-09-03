import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    Dimensions,
    ScrollView
} from 'react-native';

import {
    Header,
    Avatar,
    Grid,
    Row,
    Button,
    List,
    Icon,
    ListItem,
    Tabs,
    Tab
} from 'react-native-elements';
import {
    INBOUND_COLOR,
    OUTBOUND_COLOR,
    INBOUND_LINE_COLOR,
    TAB_BAR_COLOR,
    TAB_BUTTON_ICON_SIZE
} from './StyleConstant';
import MapView, { PROVIDER_GOOGLE, MAP_TYPES } from 'react-native-maps';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 15.870032;
const LONGITUDE = 100.992541;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0421;
const ZOOM_LATITUDE_DELTA = (0.0922 * 0.1);
const ZOOM_LONGITUDE_DELTA = (0.0421 * 0.1);

const API_KEY = 60992094;


const THAILAND = [
    {
        latitude: 15.870032,
        longitudeDelta: 10.0,
        name: 'Thailand',
        longitude: 100.992541,
        latitudeDelta: 10.0,
    }
]


class NearBusStop extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: `ค้นหาป้ายรถเมล์บริเวณใกล้`
    });

    mapView = null
    busStopDialog = null
    constructor(props) {
        super(props);

        this.getNearBusInfo = this.getNearBusInfo.bind(this);
        this.onSelectBusStop = this.onSelectBusStop.bind(this);
        this.navToBusSearch = this.navToBusSearch.bind(this);
        this.initLocation = this.initLocation.bind(this);


        this.state = {
            busStop: [],
            loadingComplete: false,
            error: '',
            realm: null,
            busItem: [],
            selectBusStop: [],
            region: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            }
        }




    } //  end constructor


    initLocation() {

        this.mapView.animateToRegion(this.state.region);

    }


    onSelectBusStop(selectbusStop) {


        let { state } = this.props.navigation;
        let busNo = "";
        let regex = /(\d+)/g;

        let busItem = state.params.busItem;
        let realm = state.params.realm;
        let busStopArray = [];



        let busStop = selectbusStop.bus_line_list.map((item) => {

            if (item.bus_line != null && item.bus_line != "") {
                busNo = item.bus_line.split("-")[1];
                busNo = busNo.match(regex);

                if (realm.objects("Bus").filtered('busNo =' + busNo).length > 0) {


                    item.bus_no = busNo,
                        item.bus_name = busNo + " " + item.start + "-" + item.end;

                    busStopArray.push(item);
                }
            }
            return item;
        })

        this.setState({ selectBusStop: busStopArray });
        this.busStopDialog.show();



    }


    getNearBusInfo(lat, lag) {

        //   let lat = this.state.region.latitude;
        //   let lag = this.state.region.longitude;
        let url = 'http://cloud.traffy.in.th/apis/apitraffy.php?api=find_bus_stop_info&appid=' + API_KEY + '&latitude=' + lat + '&longitude=' + lag + '&radius=1000'
        let returnArray = [];

        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {

                let busStopArray = responseJson;

                busStopArray.map((item, idx) => {
                    item.latitude = parseFloat(item.latitude);
                    item.longitude = parseFloat(item.longitude);

                    if(item.bus_line_list[0].bus_line != null && item.bus_line_list[0].bus_line != undefined){
                     returnArray.push(item);
                    }
                })

                this.setState({ busStop: returnArray });

            })
            .catch((error) => {
                console.error(error);
            });


    }





    navToBusSearch(busNo) {

        const { state, navigate } = this.props.navigation;

        let realm = state.params.realm;

        navigate("Home", {
            realm: realm,
            busNo: busNo
        })


    }


    componentDidMount() {





        navigator.geolocation.getCurrentPosition(
            (position) => {

                this.setState({
                    region: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,

                    },
                    loadingComplete: true,
                    error: null
                });

                this.getNearBusInfo(position.coords.latitude, position.coords.longitude);



            },
            (error) => this.setState({ error: error.message }),
            // { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );



    }

    render() {
        let { goBack } = this.props.navigation;

        return (
            <View style={styles.container}>

                <View style={styles.mapViewStyle}>
                    <MapView
                        style={{ flex: 1 }}
                        // style={{  width:width, height:height,  left: 0, right: 0, top: 0, bottom: 0,zIndex:2 }}
                        region={this.state.region}
                        ref={(mapView) => { this.mapView = mapView; }}
                        //  cacheEnabled={true}
                        showsScale
                        showsCompass
                        zoomEnabled
                        scrollingEnabled
                        toolbarEnabled={true}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        loadingIndicatorColor="#666666"
                        loadingBackgroundColor="#eeeeee"

                    >

                        {this.state.busStop.map((item, idx) => (
                            <MapView.Marker
                                key={item.stop_id}
                                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                            //title={ "ป้ายรถเมล์ : " +item.busStopNameTh}
                            //ref={(maker) => { this.busStopMaker[item.stop_id] = maker; }}
                            // description={ item.latitude + " "+ item.longitude }
                            // image ={require('./bus.png') }        
                            >

                                <Icon
                                    color="#1171A1"
                                    size={18}
                                    underlayColor="#88BDC3"
                                    name='directions-bus' />

                                <MapView.Callout
                                    onPress={() => this.onSelectBusStop(item)}
                                >
                                    <Text style={{ width: 200, height: 20, zIndex: 3 }}>{"ป้ายรถเมล์ : " + item.stop_name}</Text>
                                    <Button
                                        raised
                                        buttonStyle={{ flex: 1 }}
                                        backgroundColor={"#0D4398"}
                                        icon={{ name: 'place' }}
                                        title="ดูสายรถเมล์"

                                    />

                                </MapView.Callout>


                            </MapView.Marker>

                        ))
                        }

                    </MapView>
                </View>

                <View style={styles.bottomMenu}>

                    <Tabs tabBarStyle={{ backgroundColor: TAB_BAR_COLOR }}>

                        <Tab
                            title={"หน้าหลัก"}
                            titleStyle={{ color: "#FFF" }}
                            renderIcon={() =>
                                <Icon containerStyle={styles.iconBtnStyle}
                                    color={'#FFF'}
                                    name='home' size={TAB_BUTTON_ICON_SIZE} />}
                            renderSelectedIcon={() => <Icon color={'#FFF'} name="home" size={TAB_BUTTON_ICON_SIZE} />}
                            onPress={() => goBack()}
                        >

                        </Tab>

                        <Tab
                            title={"ตำแหน่งเริ่มต้น"}
                            titleStyle={{ color: "#FFF" }}
                            renderIcon={() =>
                                <Icon containerStyle={styles.iconBtnStyle}
                                    color={'#FFF'}
                                    name='location-searching' size={TAB_BUTTON_ICON_SIZE} />}
                            renderSelectedIcon={() => <Icon color={'#FFF'} name="location-searching" size={TAB_BUTTON_ICON_SIZE} />}
                            onPress={() => this.initLocation()}
                        >

                        </Tab>







                    </Tabs>




                </View>




                <PopupDialog
                    width={250}
                    height={500}
                    dialogStyle={styles.busStopDialogStyle}
                    ref={(popupDialog) => { this.busStopDialog = popupDialog; }}
                    dialogTitle={<DialogTitle
                        titleStyle={{ backgroundColor: "#A8DBA8" }}
                        titleTextStyle={{ color: "#66708F" }}
                        title="สายรถเมล์ที่ผ่าน" />}
                >
                    <View style={styles.detailSection}>
                        <ScrollView style={{ padding: 0 }} >
                            {this.state.selectBusStop.map((item, idx) => (
                                <ListItem
                                    containerStyle={styles.listItemStyle}
                                    titleContainerStyle={{ marginLeft: 0, left: 0 }}
                                    titleStyle={{ fontSize: 14, marginLeft: 0, padding: 0, flex: 1, flexDirection: 'column' }}
                                    key={idx}
                                    title={item.bus_name}
                                    rightIcon={{ name: 'map-marker', type: 'font-awesome', color: "#FD9F61" }}
                                    onPress={() => this.navToBusSearch(item.bus_no)}


                                />

                            ))
                            }
                        </ScrollView>
                    </View>
                </PopupDialog>





            </View>


        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    topMenu: {
        flex: 1.4,
    },
    mapViewStyle: {
        flex: 10,
        backgroundColor: '#FFF'
    },
    bottomMenu: {
        flex: 1.2,
        color: '#000',
    },
    busStopDialogStyle: {
        flex: 1,
        position: 'absolute',
        right: 0,
        top: 0,
        //flexDirection: 'column'
    },
});


export default NearBusStop;