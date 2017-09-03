import { Header, FormLabel, FormInput, Button, 
        List, ListItem, Divider, Avatar ,SearchBar,
        Tabs, Tab 
     }
    from 'react-native-elements'
import React, { Component } from 'react';
import {
    View, ListView, Text, StyleSheet,  Platform,FlatList,
    TextInput, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { getRealm } from './Connect';

import dismissKeyboard from 'react-native-dismiss-keyboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TAB_BAR_COLOR  ,  TAB_BUTTON_ICON_SIZE } from './StyleConstant';
import Autocomplete from 'react-native-autocomplete-input';


const rowHasChanged = (r1, r2) => {
    if (r1.busNameTh !== r2.busNameTh) return true;
    if (r1.busNo !== r2.busNo) return true;
}

export default class Home extends Component {


    static navigationOptions = {
        title: 'ค้นหาสายรถเมล์',
    };


    ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    showLoading = true;
    // ds = new ListView.DataSource({ rowHasChanged: rowHasChanged});
    constructor(props) {
        super(props);

        this.updateInputValue = this.updateInputValue.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.getAllResult = this.getAllResult.bind(this);
        this.onKeycomplete = this.onKeycomplete.bind(this);
        this.onClickLink = this.onClickLink.bind(this)
        this.setRenderRowComplete = this.setRenderRowComplete.bind(this);
        this.setSearchForm = this.setSearchForm.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {
            busLine: "",
            startPoint :"",
            endPoint : "",
            showBusLine: "",
            loadComplete: false,
            realm: null,
            searhResultItem: [],
            activeSection: true,
            isSearching: false,
            showData: [],
            clickLink : false,
           // dataSource: this.ds.cloneWithRows([{}]),
            showLoading: true,
            styleOpacity : 0.1,
            searchFormType : 1,
            films: [],
            query: '',
            hideResults : false ,
            topList : 0,
            disabledBtn : false

        }


    }



    componentWillMount() {

      
       
     console.disableYellowBox = true;  

      const {state} = this.props.navigation;

      let realm = state.params.realm;
      let searchFormType  = state.params.searchFormType || 1;
    let  showLoading = true;
    let styleOpacity =  0.1;


      if(state.params.busNo != "" && state.params.busNo != undefined){
        busItem = realm.objects('Bus').filtered('busNo ='+state.params.busNo);
        showLoading = false;
        styleOpacity = 1
      }else{
       busItem = realm.objects('Bus');
      }

        //     busItem = realm.objects('Bus');
      //.filtered('id = 1');
     // let busNameArray = busItem.map((item) => item.busNameTh);



      this.setState({
          loadComplete: true,
          realm: realm,
          searhResultItem: busItem,
          busItem : busItem,
          showData: busItem,
          showLoading: showLoading,
          styleOpacity : styleOpacity,
          searchFormType: searchFormType,
        //  dataSource: this.ds.cloneWithRows(busItem)
      });
     

     return  true;


    }


    updateInputValue(evt) {

        this.setState({ busLine: evt.target.value });
    }


   onKeycomplete(){
         dismissKeyboard();
            if (this.state.busLine == "") return false;
            let busItem = this.state.busItem
                .filter((item) => item.busNo == this.state.busLine);
            this.setState({
               // dataSource: this.ds.cloneWithRows(busItem),
                searhResultItem :  busItem
            });
   }

    handleKeyDown(e) {
        if (e.nativeEvent.key == "Enter") {
            
            dismissKeyboard();
            if (this.state.busLine == "") return false;

            let busItem = this.state.busItem
                .filter((item) => item.busNo == this.state.busLine);
            this.setState({
               // dataSource: this.ds.cloneWithRows(busItem),
                  searhResultItem :  busItem
            });
        }
    }

    getAllResult() {

        this.setState({
             searhResultItem :  this.state.busItem,
       //     dataSource: this.ds.cloneWithRows(this.state.busItem),
             busLine: '',
            // showLoading: true,
            // styleOpacity:0.1
        });

    }

    onSelectLinkItem = param =>{
         this.setState({clickLink : param});

    }


    onClickLink(item){
        

           const { navigate } = this.props.navigation;
           const  navState  = this.props.navigation.state;
           

        this.setState({disabledBtn:true});

         navigate('Map', {
             busLine: item.busNo,
             busName: item.busStartTh + "-" + item.busStopTh,
             selectBusObj: item,
             realm: this.state.realm,
             onSelectLinkItem : this.onSelectLinkItem
         }     
        );

       setTimeout( () => {  this.setState({ disabledBtn:false })},2000 )

    }



    resetRenderRow(){
           this.setState({
            showLoading:  true, 
            styleOpacity : 0.1
        });
    
    }

    setRenderRowComplete(){
        this.setState({
            showLoading: false, 
            styleOpacity : 1.0
        });
    
    }

    setSearchForm(type){
        this.setState({searchFormType:  type})
    }


    searchBusName(){

        let data = this.state.busItem;
        let results =[];


        if(this.state.startPoint == "" && this.state.endPoint != ""){
          for (var i = 0; i < data.length; i++) 
            if (data[i].busStopTh.includes(this.state.endPoint))
                results.push(data[i]);
        }else if(this.state.startPoint != "" && this.state.endPoint == ""){
         for (var i = 0; i < data.length; i++) 
            if (data[i].busStartTh.includes(this.state.startPoint))
                results.push(data[i]);
        }else if(this.state.startPoint != "" && this.state.endPoint != ""){
             for (var i = 0; i < data.length; i++) 
            if (data[i].busStartTh.includes(this.state.startPoint) && data[i].busStopTh.includes(this.state.endPoint))
                results.push(data[i]);
        }else{
            results =[];
        }
    

          return  results;
    }


    onSearch(e,text){


        if (Platform.OS === 'ios') {
            if (e.nativeEvent.key != "Enter"){
                      
            if(this.state.hideResults){
                this.setState({ hideResults: false});
            }

                return true;
            }
        }



        let results = [];

    if(text != "") {

         results = this.searchBusName();

        this.setState({
          //  dataSource: this.ds.cloneWithRows(results),
            searhResultItem : results,
            hideResults: true,
            topList:0,
            styleOpacity:1 
        });

    } else {

        this.setState({
          //  dataSource: this.ds.cloneWithRows(data),
            searhResultItem : results,
            hideResults: true ,
            topList:0,
            styleOpacity:1
        });
    }

    }


    getBusTypeIcon(type){
        if(type == "รถธรรมดา")
            return 'white-balance-sunny';
        else
            return 'waves';

    }

    getBusTypeIconColor(type){
             if(type == "รถธรรมดา")
            return '#D40D52';
        else
            return '#36E4CB';
    }

    getBusOwnerTypeIconColor(type){
        if(type=="bmta bus"){
            return "#FF6600"
        }else if(type=="affiliated bus"){
            return "#74C4A9"
        }else{
            return "#438FFF"
        }


    }


    uniqueBusName(arr , keyName){
       // a.sort();
        for(var i = 1; i < arr.length; ){
            if(arr[i-1][keyName] == arr[i][keyName]){
                arr.splice(i, 1);
            } else {
                i++;
            }
        }
        return arr;
    }

    findBusName(query ,keyName = "busStartTh") {
        if (query === '') {
            return [];
        }

        let  busItem = this.state.searhResultItem;
       // const regex = new RegExp(`${query.trim()}`, 'i');
   //      let  result =   busItem.filter(bus => bus[keyName].search(regex) >= 0);
        let   result = busItem.filter(bus => bus[keyName].includes(query));

         return  this.uniqueBusName(result, keyName );
    }


    renderForm() {

        const { navigate } = this.props.navigation;
        const { startPoint , endPoint } = this.state;
        const busName = this.findBusName(startPoint);
        const endBusName = this.findBusName(endPoint , 'busStopTh');
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

        if (this.state.loadComplete) {

            if(this.state.searchFormType != 1){

                return (  
                <View>

                        <Autocomplete
                            autoCapitalize="none"
                            autoCorrect={false}
                             containerStyle={styles.autocompleteContainer}
                            data={busName.length === 1 && comp(startPoint, busName[0].busStartTh) ? [] : busName}
                            defaultValue={this.state.startPoint}
                             onChangeText={text => this.setState({ startPoint: text })}
                         //    onKeyPress={ this.onSearch}
                            hideResults={ this.state.hideResults }
                          //    onFocus={()=> this.setState({ hideResults:false , styleOpacity:0.1 })}
                            renderTextInput={(props) => (
                             <SearchBar
                                  lightTheme
                                    onChangeText={text => this.setState({ startPoint: text })}
                                    placeholder="ต้นทาง"
                                    value={this.state.startPoint}
                                    onKeyPress={(e) =>  this.onSearch( e, this.state.startPoint)}
                                    onFocus={()=> 
                                            this.setState({ hideResults:false ,
                                                          styleOpacity:0.1 ,
                                                          topList:800
                                                     //     dataSource: this.ds.cloneWithRows([{}]),
                                                        })}
                                     onBlur={() => this.setState({styleOpacity: 1,topList: 1})}
                                    onSubmitEditing={(e) => this.onSearch(e ,this.state.startPoint)}
                                />

                            )}
                            renderItem={(bus) => (
                                <TouchableOpacity 
                             //   style={{  position:'absolute' ,left:0 , right:0,  backgroundColor:"red" ,zIndex:4 }}
                                    onPress={() => this.setState({ startPoint: bus.busStartTh })}>
                                    <Text style={styles.itemText}>
                                     {bus.busStartTh}
                                    </Text>
                                </TouchableOpacity>

                            )}
                        />


                        <Autocomplete
                            autoCapitalize="none"
                            autoCorrect={false}
                            containerStyle={styles.autocompleteContainer2}
                            data={endBusName.length === 1 && comp(endPoint, endBusName[0].busStopTh) ? [] : endBusName}
                            defaultValue={this.state.endPoint}
                             onChangeText={text => this.setState({ endPoint: text })}
                           //  onKeyPress={ this.onSearch}
                            hideResults={ this.state.hideResults }                            
                            renderTextInput={(props) => (
                                <SearchBar
                                    lightTheme
                                    onChangeText={(endPoint) => this.setState({ endPoint })}
                                    placeholder='ปลายทาง'
                                    value={this.state.endPoint}
                                    onKeyPress={(e) => this.onSearch(e , this.state.endPoint)}
                                    onFocus={() =>
                                        this.setState({
                                            hideResults: false,
                                            styleOpacity: 0.1,
                                            topList: 800
                                            //  dataSource: this.ds.cloneWithRows([{}]),
                                        })}
                                    onBlur={() => this.setState({styleOpacity: 1,topList: 1})}
                                    onSubmitEditing={(e) => this.onSearch(e , this.state.endPoint)}
                                    inputStyle={{ color: "#FF6600" }}
                                />


                            )}
                            renderItem={(bus) => (
                                <TouchableOpacity 
                                    onPress={() => this.setState({ endPoint: bus.busStopTh })}>
                                    <Text style={styles.itemText}>
                                     {bus.busStopTh}
                                    </Text>
                                </TouchableOpacity>

                            )}
                        />
                 
                        
                             <SearchBar
                                    lightTheme
                                />

                                 <SearchBar
                                    lightTheme
                                />
                            

         
                </View>
  
              )

            }else{
            
            return (
                <View>


                     <SearchBar
                        lightTheme
                        onChangeText={(busLine) => this.setState({ busLine })}
                        placeholder='ค้นหาสายรถเมล์' 
                        value={this.state.busLine}
                        maxLength={3}
                        keyboardType={"numeric"}
                        onKeyPress={ this.handleKeyDown}
                        onSubmitEditing={(e) => this.onKeycomplete(e)}
                        inputStyle={{ color: "#FF6600"}}
                        />

                    {/*
                    <FormLabel>สายรถเมล์</FormLabel>
                    <FormInput
                        inputStyle={styles.textInputStyle}
                        onChangeText={(busLine) => this.setState({ busLine })}
                        value={this.state.busLine}
                        maxLength={3}
                        keyboardType={"numeric"}
                        onKeyPress={this.handleKeyDown}
                    />
                    */}

                    {/*
                   <TouchableOpacity >
                        <Button
                            buttonStyle={styles.buttonStyle}
                            large
                            onPress={() => this.getAllResult()}
                            icon={{ name: 'search', type: 'EvilIcons' }}
                            title='ดูข้อมูลทังหมด' />
                    </TouchableOpacity>
                    */}

                </View>

            );
            }
        } else {
            return (
                <ActivityIndicator
                    animating={true}
                    color='#bc2b78'
                    size="large"
                    style={styles.activityIndicator}
                />
            );


        }

    }


    renderIndicator(){

        return(

            <ActivityIndicator
                animating={this.state.showLoading}
                color='#bc2b78'
                size="large"
                style={styles.activityIndicator}
            />
        )


    }

 

    render() {
        const { navigate , goBack} = this.props.navigation;


        if (this.state.loadComplete) {
            return (
                <View style={styles.container} >

                    <View style={styles.fromStyle} >
                        {this.renderForm()}
                    </View>
                 
                
                    <View style={{ flex:10 ,opacity:1  , zIndex:1 ,top:this.state.topList }}>
                   
                        <ScrollView styles={{ flex: 1, height: 200 }}>

                        <FlatList
                         data={this.state.searhResultItem}
                          renderItem={({item , idx}) => 
                                 <TouchableOpacity
                                     key={idx}
                                     disabled={this.state.disabledBtn}
                                     onPress={() =>  this.onClickLink(item)  }
                                    >
                                    <ListItem
                                        containerStyle={styles.listItemStyle}
                                        key={item.id}
                                        title={item.busNo + " " + item.busStartTh + "-" + item.busStopTh + " " + "(" + item.busOwnerTh + ")"}
                                        leftIcon={{ name: 'directions-bus', color: this.getBusOwnerTypeIconColor(item.busOwnerEn) }}
                                        rightIcon={{ name: this.getBusTypeIcon(item.busTypeTh),  
                                                    type:'material-community', color: this.getBusTypeIconColor(item.busTypeTh) , size:15 }}
                                    />
                                    </TouchableOpacity>

                           }
                        >


                        </FlatList>

                          {/*
                            <ListView
                                dataSource={this.state.dataSource}
                                onEndReached={() => this.setRenderRowComplete()}
                                renderRow={(item) =>
                                
                                    <TouchableOpacity
                                            onPress={() =>  this.onClickLink(item)  }
                                    >
                                    <ListItem
                                        containerStyle={styles.listItemStyle}
                                        key={item.id}
                                        title={item.busNo + " " + item.busStartTh + "-" + item.busStopTh + " " + "(" + item.busOwnerTh + ")"}
                                        leftIcon={{ name: 'directions-bus', color: this.getBusOwnerTypeIconColor(item.busOwnerEn) }}
                                        rightIcon={{ name: this.getBusTypeIcon(item.busTypeTh),  
                                                    type:'material-community', color: this.getBusTypeIconColor(item.busTypeTh) , size:15 }}
                                    />
                                    </TouchableOpacity>


                                } />
                                */}
                                  

                                    

                        </ScrollView>
                        
                    </View>


                    <View style={styles.quarterHeight} >
                       <Tabs
                       tabBarStyle={{backgroundColor:TAB_BAR_COLOR  }}
                        >

                        
                              <Tab
                                title={"หน้าหลัก"}
                                titleStyle={{ color: "#FFF" }}
                                renderIcon={() =>
                                    <Icon containerStyle={{
                                        justifyContent: 'center',
                                        alignItems: 'center', marginTop: 10
                                    }} color={'#FFF'}
                                        name='home' size={TAB_BUTTON_ICON_SIZE} />}
                                renderSelectedIcon={() => <Icon color={'#FFF'} name="home" size={TAB_BUTTON_ICON_SIZE} />}
                                onPress={() => goBack()}
                            >

                            </Tab>    


                              <Tab
                                title={"ค้นหาจากเลข"}
                                titleStyle={{ color: "#FFF" }}
                                renderIcon={() =>
                                    <Icon containerStyle={{
                                        justifyContent: 'center',
                                        alignItems: 'center', marginTop: 10
                                    }} color={'#FFF'}
                                        name='directions-bus' size={TAB_BUTTON_ICON_SIZE} />}
                                renderSelectedIcon={() => <Icon color={'#FFF'} name="directions-bus" size={TAB_BAR_COLOR} />}
                                onPress={() => this.setSearchForm(1) }
                              
                            />
                            
                            <Tab
                                title={"ค้นหาจากชื่อ"}
                                titleStyle={{ color: "#FFF" }}
                                renderIcon={() =>
                                    <Icon containerStyle={{
                                        justifyContent: 'center',
                                        alignItems: 'center', 
                                    }} color={'#FFF'}
                                        name='local-library' size={TAB_BUTTON_ICON_SIZE} />}
                                renderSelectedIcon={() => <Icon color={'#FFF'} name="local-library" size={TAB_BUTTON_ICON_SIZE} />}
                                onPress={() => this.setSearchForm(2) }
                              
                            />



                            <Tab
                                title={"ค้นหาทั้งหมด"}
                                titleStyle={{ color: "#FFF" }}
                                renderIcon={() =>
                                    <Icon containerStyle={{
                                        justifyContent: 'center',
                                        alignItems: 'center', 
                                    }} color={'#FFF'}
                                        name='search' size={TAB_BUTTON_ICON_SIZE} />}
                                renderSelectedIcon={() => <Icon color={'#FFF'} name="search" size={TAB_BUTTON_ICON_SIZE} />}
                                onPress={() => this.getAllResult()}
                            >

                            </Tab>
              

                       </Tabs>

                    </View>




                </View>
            );

        }
        else {
            return (
                <View />

            )
        }
    }
} // end class



// style
const styles = StyleSheet.create({

    container: {
        flex: 1,
        flexDirection: 'column'
    },
    halfHeight: {
        flex: 10,
       // backgroundColor: '#FF3366'
    },
    quarterHeight: {
        flex: 1.3,
       // backgroundColor: '#000'
    },
    formStyle: {
        flex:5,
        backgroundColor:"blue"

        // justifyContent: 'center',
        // alignItems: 'center',
        // flexDirection: 'row',
        // marginBottom: 10,
        // bottom: 15,
        // backgroundColor: 'blue'
    },
    buttonStyle: {
        flex: 1,
        backgroundColor: "#FF5D5E",
        backgroundColor: "#FD9F61",
        marginTop: 10
    },

    textInputStyle: {
        //   backgroundColor: "#FEFEFE",
    },
    activityIndicator: {
        position:'absolute',
        left:0,
        right:0,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80,
        top: 120
    },
    avatarStyle: {
        // flex:1 ,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#C3DCB4',
        backgroundColor: "#FF5D5E",
        marginTop: 5
    },
    listItemStyle: {
        backgroundColor: '#F1F1F1',
    },
    detailSection: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 15,
        paddingTop: 5,
        paddingBottom: 5

    },
    gotoMapButtonStyle: {
        backgroundColor: "#A8DBA8"
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
        margin: 2,
        borderColor: '#2a4944',
        borderWidth: 1,
        backgroundColor: '#d2f7f1'
    },
   autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 4,
  },
   autocompleteContainer2: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 3,
    top:52
  },
  itemText: {
    fontSize: 15,
    margin: 2
  },


});

