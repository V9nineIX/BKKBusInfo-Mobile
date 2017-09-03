import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Platform,
  ListView,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  TabBarIOS,
  Dimensions,
  Animated,
  Easing
} from 'react-native';

import MapView, { PROVIDER_GOOGLE, MAP_TYPES } from 'react-native-maps';
import { getRealm } from './Connect';
import { Badge, Button, Header, ListItem, Tabs, Tab } from 'react-native-elements'
import { INBOUND_COLOR, 
        OUTBOUND_COLOR, 
        INBOUND_LINE_COLOR,
        TAB_BAR_COLOR,
        TAB_BUTTON_ICON_SIZE
      } from './StyleConstant';

import Icon from 'react-native-vector-icons/MaterialIcons'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import { compareDistance, cleanArray, getDistanceFromLatLonInKm } from './Util';
import TabBottomMenu  from './TabBottomMenu'


const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const THAILAND =[
  {
    latitude: 15.870032,
    longitudeDelta: 10.0,
    name: 'Thailand',
    longitude: 100.992541,
    latitudeDelta: 10.0,
  }
]



const earthRadiusInKM = 6371;
// you can customize these two values based on your needs
const radiusInKM = 0.5;
const aspectRatio = 1;

 const LATITUDE =  15.870032;
 const LONGITUDE = 100.992541;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const ZOOM_LATITUDE_DELTA = (0.0922 * 0.1);
const ZOOM_LONGITUDE_DELTA = (0.0421 * 0.1);

const PLAY_BUTTON_COLOR = "#25FEB2";
const PLAY_BUTTON_ICON_SIZE= 50
const FONT_SIZE = 28;




export default class MapPage extends Component {


  static navigationOptions = ({ navigation }) => ({
    title: `เส้นทางเดินรถสาย ${navigation.state.params.busLine}`
  });
  realm = null;
  _mapView = null
  busStopMaker = [];
  isPlayed = true;
  busMarkerOpacity = 0.0

  constructor(props) {
    super(props);

    //  this.onChangeBottomNav = this.onChangeBottomNav.bind(this);
    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.navToBusStop = this.navToBusStop.bind(this);
    this.playRouting = this.playRouting.bind(this);
    this.goToSeachPage = this.goToSeachPage.bind(this);
    this.clearPlayTimer = this.clearPlayTimer.bind(this);
    this.pauseRoute = this.pauseRoute.bind(this);
    this.continuePlayRoute = this.continuePlayRoute.bind(this);

    this.state = {
      text: "",
      line: [],
      lineIndex : 0,
      busName: this.props.busName,
      startPoint: {},
      endPoint: {},
      region: {},
      busStop: [],
      showPlayerMenu : false,
      curretBusStopPoint: -1,
      busStopMaker : {}
    };


  } // end constructor

  getBusLine(direction = "Inbound") {



    const { state } = this.props.navigation;
    realm = state.params.realm;
    searchParam = state.params.selectBusObj;


    let directionLine = realm.objects(direction)
      .filtered('busId =' + searchParam.id);

    let busObj = searchParam;
    let result = directionLine.map(item => { return { latitude: item.latitude, longitude: item.longitude } });

    let region = result[0];
    // region.latitudeDelta = (0.0922);
    // region.longitudeDelta = (0.0421);

    // region.latitudeDelta = LATITUDE_DELTA;
    // region.longitudeDelta = LONGITUDE_DELTA;

    let busName = busObj.busStartTh + "-" + busObj.busStopTh;
    return {
      busName: busName,
      //region: region,
      region: new MapView.AnimatedRegion({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta:LONGITUDE_DELTA
      }),
      startPoint: result[0],
      endPoint: result[result.length - 1],
      line: result,
      direction: direction,
      busMarkerRegion: new MapView.AnimatedRegion({
        latitude: region.latitude,
        longitude: region.longitude
      })

    }
  }


  getBusStop(directionLine = "Inbound") {

    let direction = "BusStopInbound";
    if (directionLine == "Outbound") {
      direction = "BusStopOutbound"
    }

    const { state } = this.props.navigation;
    let realm = state.params.realm;
    let searchParam = state.params.selectBusObj;
     state.params.onSelectLinkItem(false);

  

    let busStop = realm.objects(direction)
      .filtered('busId =' + searchParam.id);

    return busStop;

  }


  setBusDirection(directionLine = "Inbound") {

    let { busName, region, startPoint, endPoint, line, direction , busMarkerRegion} =
      this.getBusLine(directionLine);
    let busStop = this.getBusStop(directionLine);

    this.setState({
      busName: busName,
      line: line,
      startPoint: startPoint,
      endPoint: endPoint,
      region: region,
      selectedIndex: 0,
      direction: direction,
      busStop: busStop,
      playTimer: "",
      busMarkerRegion:  busMarkerRegion
    });



  }

   deg2rad (angle) {
        return angle * 0.017453292519943295 // (angle / 180) * Math.PI;
    }

    rad2deg (angle) {
        return angle * 57.29577951308232 // angle / Math.PI * 180
    }

       showRegion(locationCoords) {
        if (locationCoords && locationCoords.latitude && locationCoords.longitude) {
            var radiusInRad = radiusInKM / earthRadiusInKM;
            var longitudeDelta = this.rad2deg(radiusInRad / Math.cos(this.deg2rad(locationCoords.latitude)));
            var latitudeDelta = aspectRatio * this.rad2deg(radiusInRad);

            this.setState({
              region: { latitude: locationCoords.latitude, longitude: locationCoords.longitude, latitudeDelta: latitudeDelta, longitudeDelta: longitudeDelta }
            });
        }
    }
                                                                                           

  componentWillMount() {
    this.setBusDirection();
    this.animatedValue =  new Animated.Value();          
  }


  handleIndexChange = (index) => {



    if (index == 1) {
      this.setBusDirection('Outbound');
    } else {
      this.setBusDirection('Inbound');
    }

    this.setMapInit();

    this.setState({
      selectedIndex: index
    })

  }


  setMapInit() {

     this.clearPlayTimer();
     this.busMarkerOpacity = 0.0;

    let startRegion = {
      latitude: this.state.startPoint.latitude,
      longitude: this.state.startPoint.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }
    this.state.region.timing(startRegion).start();
  }


  navToBusStop(item) {

    this.busStopDialog.dismiss();
    this.clearPlayTimer();


    let region = {
      latitude: item.latitude,
      longitude: item.longitude,
      latitudeDelta: (0.0022 * 0.0001),
      longitudeDelta: (0.0021 * 0.0001)
    }

    this.state.region.timing(region).start();

    try {
      this.busStopMaker[item.pointNo].showCallout();
    } catch (ex) {

    }

  }




  index = 0;

  playAnimate(){

  this.animatedValue.setValue(0);
  this.index++;

    Animated.timing(
      this.animatedValue,
      {
        toValue: 1,
        duration: 500,
        easing: Easing.linear
      }
    ).start(() => {
        
       this.state.region.timing({
          latitude: this.state.line[this.index].latitude,
          longitude: this.state.line[this.index].longitude,
        }).start(() => {
              
              //     this.state.busMarkerRegion.timing({
              //       latitude: this.state.line[this.index].latitude,
              //   longitude: this.state.line[this.index].longitude,
              //  }).start(() => this.nearBusStopInRoute(this.state.line[this.index]));
          
               this.nearBusStopInRoute(this.state.line[this.index]);
             this.playAnimate()

          });


  
    });

  }


  playRouting(pointIndex = 1,delay = 2000) {


       let radiusInRad = radiusInKM / earthRadiusInKM;
       let longitudeDelta = this.rad2deg(radiusInRad / Math.cos(this.deg2rad(this.state.startPoint.latitude)));
       let latitudeDelta = aspectRatio * this.rad2deg(radiusInRad);



    let region = {
      latitude: this.state.startPoint.latitude,
      longitude: this.state.startPoint.longitude,
      latitudeDelta : latitudeDelta,
      longitudeDelta : longitudeDelta
      // latitudeDelta: (0.0922 * 0.15),
      // longitudeDelta: (0.0421 * 0.15)
    }



    if (pointIndex == 1) {
        this.state.region.timing(region).start();
        this.setState({
          showPlayerMenu: true
        });
    }


    let index = pointIndex;
    this.busMarkerOpacity = 1.0;
    
  
    setTimeout(() => {
      let timer = setInterval(() => {
        
        //if(index % 5 == 0) {

        this.state.region.timing({
          latitude: this.state.line[index].latitude,
          longitude: this.state.line[index].longitude,
        }, {
          //  delay: 1000,
          //  easing: Easing.cubic,
          //  duration: 1000
          })//.start();
           .start(() => this.nearBusStopInRoute(this.state.line[index]));
       
       // }

        this.state.busMarkerRegion.timing({
               latitude: this.state.line[index].latitude,
                longitude: this.state.line[index].longitude,
        })//.start(() => this.nearBusStopInRoute(this.state.line[index]));
        .start();
        index++;
       
        this.setState({ lineIndex : index });
        if (index == this.state.line.length - 1) {
         //  clearInterval(timer);
          this.clearPlayTimer();
          this.busMarkerOpacity=0.0;
         }
      },1000); // 

      this.setState({ playTimer: timer });

    }, delay); // end set timeout



  }

  clearPlayTimer( showPlayerMenu = false ) {
    try {
      clearInterval(this.state.playTimer);
    } catch (ex) {

    }
      
      this.setState({ 
           playTimer : false,
            showPlayerMenu : showPlayerMenu
          })
   


  }

  nearBusStopInRoute(target) {


    stopPoint = this.state.busStop.map((stopSign) => {
      distance = getDistanceFromLatLonInKm(target.latitude, target.longitude,
        stopSign.latitude, stopSign.longitude)
      if (distance <= 0.05) // 50M
      {
        return stopSign;
      }

    });
    let result = cleanArray(stopPoint);
    result = result.sort(compareDistance);

    if (result.length > 0) {
      //if (this.state.calPoint != result[0].pointNo) {

        try {
          if (this.state.curretBusStopPoint != result[0].pointNo) {
            this.busStopMaker[result[0].pointNo].showCallout();

            this.setState({
              curretBusStopPoint: result[0].pointNo
            });
          }
        } catch (ex) {

        }

      //}
    }
  }


  goToSeachPage() {
    const { goBack  ,state } = this.props.navigation;
    this.clearPlayTimer();
    goBack();

   //navigate('Home');
  }

continuePlayRoute(){
   this.playRouting(this.state.lineIndex , 10);
    this.isPlayed = true;
}

pauseRoute(){
   this.clearPlayTimer(true);
   this.isPlayed = false;
}


renderPlayButton() {

 if(this.state.showPlayerMenu){
    return (
     <View style={{ backgroundColor:"#FFF"   }}> 
      <View
        style={{
          flexDirection: "row", justifyContent: "center",
          alignItems: "center"
        }}
      >
       {this.showPlayButton()}
       {this.showPauseButton()}

     
    

      </View>
    </View>

    )
  }


  }

  showPauseButton(){
    if(this.isPlayed){
       return(
        <TouchableOpacity>
        <Icon
          name='pause'
          size={PLAY_BUTTON_ICON_SIZE}
          color={PLAY_BUTTON_COLOR}
          onPress={ () => this.pauseRoute()  }
          />
        </TouchableOpacity>

       )

    }


  }


  showPlayButton(){
    if(!this.isPlayed){
     return(

      <TouchableOpacity>
      <Icon
          name='play-arrow'
          size={PLAY_BUTTON_ICON_SIZE}
          color={PLAY_BUTTON_COLOR}
          onPress={() =>  this.continuePlayRoute() }
        />
      </TouchableOpacity>
       )
    }
  }

  render() {

    const { selectedTab } = this.state
    const busInfo = this.props.navigation.state.params.selectBusObj;


    return (
      <View style={styles.container}>

        <View style={styles.topMenu} >
     
            

          <SegmentedControlTab
            tabsContainerStyle={{ height: 40, padding: 1, zIndex: 2 }}
            values={['ขาเข้า', 'ขาออก']}
            selectedIndex={this.state.selectedIndex}
            onTabPress={this.handleIndexChange}
          />


          <Header
            outerContainerStyles={{ height: 25, marginTop: 40, padding: 1, zIndex: 2 }}
            backgroundColor={INBOUND_COLOR}
            centerComponent={{ text: busInfo.busNo +" "+this.state.busName + " " + busInfo.busOwnerTh, style: { color: '#66708F' } }}

          />



        </View>


        <View style={styles.mapViewStyle} >
          <MapView.Animated
            style={{ flex: 1 }}
            // style={{  width:width, height:height,  left: 0, right: 0, top: 0, bottom: 0,zIndex:2 }}
            region={this.state.region}
            ref={(mapView) => { this._mapView = mapView; }}
              //  cacheEnabled={true}
                zoomEnabled
                scrollingEnabled
                showsMyLocationButton={true}
                showsUserLocation={true}


                loadingIndicatorColor="#666666"
                loadingBackgroundColor="#eeeeee"

          >


            <MapView.Marker.Animated
               style={{ opacity:this.busMarkerOpacity  }}
               ref={(maker) => this.busMarker = maker}
               pinColor='#F91077'
              coordinate={this.state.busMarkerRegion}
            >
            <Icon
                  raised
                  color="#F91077"
                  size={30}
                  underlayColor="#F91077"
                  name='directions-bus' />


            </MapView.Marker.Animated>


              <MapView.Marker
              coordinate={this.state.startPoint}
             ref='startMarker'
              pinColor='#19DD89'
            >           
            </MapView.Marker>




            <MapView.Marker
              coordinate={this.state.endPoint}
            />

            {this.state.busStop.map((item, idx) => (
              <MapView.Marker
                key={item.pointNo}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                //title={ "ป้ายรถเมล์ : " +item.busStopNameTh}
                ref={(maker) => { this.busStopMaker[item.pointNo] = maker; }}
              // description={ item.latitude + " "+ item.longitude }
              // image ={require('./bus.png') }        
              >

                <Icon
                  reverse
                  raised
                  color="#1171A1"
                  size={18}
                  underlayColor="#88BDC3"
                  // iconStyle={{  flex:1, zIndex: 0,  }}
                  name='directions-bus' />

                <MapView.Callout>
                  <Text style={{ width: 200, zIndex: 3  , color:'#0D4398' }}>{"ป้ายรถเมล์ : " + item.busStopNameTh}</Text>

                </MapView.Callout>


              </MapView.Marker>

            ))
            }


            <MapView.Polyline
              strokeWidth={5}
              strokeColor={INBOUND_LINE_COLOR}
              coordinates={this.state.line}
            />

     
          </MapView.Animated>
        </View>



     { this.renderPlayButton()}

     <View style={styles.bottomMenu}>
  


       <Tabs tabBarStyle={{ backgroundColor: TAB_BAR_COLOR }}>
                 
                <Tab
                    title={"ค้นหาสายรถ"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='search' size={TAB_BUTTON_ICON_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="search" size={TAB_BUTTON_ICON_SIZE} />}
                 onPress={() => this.goToSeachPage()}
                >

                </Tab>

                <Tab
                    title={"จุดเริ่มต้น"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='place' size={TAB_BUTTON_ICON_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="place" size={TAB_BUTTON_ICON_SIZE} />}
                    onPress={() => this.setMapInit()}
                >

                </Tab>

                <Tab
                    title={"ป้าย"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='directions-bus' size={TAB_BUTTON_ICON_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="directions-bus" size={TAB_BUTTON_ICON_SIZE} />}
                    onPress={() => this.busStopDialog.show()}
                >

                </Tab>

                <Tab
                    title={"รายละเอียด"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='view-list' size={TAB_BUTTON_ICON_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="view-list" size={TAB_BUTTON_ICON_SIZE} />}
                     onPress={() => this.busDetailDialog.show()}
                />

                <Tab
                    title={"ดูเส้นทาง"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='near-me' size={TAB_BUTTON_ICON_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="near-me" size={TAB_BUTTON_ICON_SIZE} />}
                    onPress={() => this.playRouting()}
                />

          


            </Tabs>









        </View>



     
        <PopupDialog
          ref={(popupDialog) => { this.busDetailDialog = popupDialog; }}
          dialogTitle={<DialogTitle
            titleStyle={{ backgroundColor: "#A8DBA8" }}
            titleTextStyle={{ color: "#66708F" }}
            title="รายละเอียด" />}
        >
          <View style={styles.detailSection}>
            <Text>สายรถเมล์ :  {busInfo.busNo + " " + this.state.busName}</Text>
            <Text>ผู้ให้บริการ :  {busInfo.busOwnerTh}</Text>
            <Text>ประเภทรถ :  {busInfo.busTypeTh}</Text>
               <Text>ประเภทการวิ่ง :  {busInfo.busRunningTh}</Text>
            <Text>รายละเอียด :  {busInfo.busDescTh}</Text>
            <Text>ช่วงเวลาบริการ : {busInfo.busServiceTime}</Text>
          </View>
        </PopupDialog>


        <PopupDialog
          width={200}
          height={500}
          dialogStyle={styles.busStopDialogStyle}
          ref={(popupDialog) => { this.busStopDialog = popupDialog; }}
          dialogTitle={<DialogTitle
            titleStyle={{ backgroundColor: "#A8DBA8" }}
            titleTextStyle={{ color: "#66708F" }}
            title="ป้ายรถเมล์" />}
        >
          <View style={styles.detailSection}>
            <ScrollView style={{ padding: 0 }} >
              {this.state.busStop.map((item, idx) => (


                <ListItem
                  containerStyle={styles.listItemStyle}
                  titleContainerStyle={{ marginLeft: 0, left: 0 }}
                  titleStyle={{ fontSize: 14, marginLeft: 0, padding: 0, flex: 1, flexDirection: 'column' }}
                  key={item.id}
                  title={idx + 1 + " " + item.busStopNameTh}
                  rightIcon={{ name: 'map-marker', type: 'font-awesome', color: "#FD9F61" }}
                  onPress={() => this.navToBusStop(item)}

                />

              ))
              }
            </ScrollView>
          </View>
        </PopupDialog>
        

      </View>

    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  topMenu: {
    flex: 1.4,
    //  backgroundColor:"blue",

  },
  mapViewStyle: {
    flex: 10,
    backgroundColor: '#FFF'
  },
  bottomMenu: {
    flex: 1.2,
    color: '#000',
  
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 300,
    height: 250
  },
  detailSection: {
    flex: 1,
    // justifyContent: 'center',
    paddingLeft: 15,
    paddingTop: 1,
    paddingBottom: 5
  },
  busStopDialogStyle: {
    flex: 1,
    position: 'absolute',
    right: 0,
    top: 0,
    //flexDirection: 'column'
  },
  listItemStyle: {
    padding: 0,
    left: 0,
    marginLeft: 0
  },
  iconBtnStyle:{
    justifyContent: 'center',
   alignItems: 'center', 
   marginTop: 12
  }
});
