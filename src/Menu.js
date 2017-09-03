import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';

import {
    Header,
    Avatar,
    Grid,
    Row,
    Button,
    List
} from 'react-native-elements';
import businfo_icon from '../image/businfo_icon.png';
import { getRealm } from './Connect';



class Menu extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: 'Bangkok bus information'
    });

    constructor(props) {
        super(props);
        this.state ={
            realm:null,
            loadComplete:false,
            disabled: false,
            busItem : []
        }

        this.navTo =this.navTo.bind(this);

    }
    componentWillMount() {
        console.disableYellowBox = true;

          if (!this.state.realm) {
            getRealm.then((realm) => {

              let busItem = realm.objects('Bus')
                this.setState({
                    loadComplete: true,
                    realm: realm,
                    busItem : busItem
                });


            });
        } else {

            this.setState({
                loadComplete: true
            })

        }
    }

    navTo(buttonIndex){
      const { navigate } = this.props.navigation;

    this.setState({disabled:true});

   
    if(buttonIndex == 1) {

      navigate("Home", {
          realm: this.state.realm,
          busItem: this.state.busItem,
          searchFormType: 1
      });
    }else if(buttonIndex == 2){
        navigate("Home", {
            realm: this.state.realm,
            busItem: this.state.busItem,
            searchFormType: 2
        })
    }else{
        navigate("NearBusStop",{
                            realm: this.state.realm,
                            busItem: this.state.busItem
        });
    }
        
      setTimeout( () =>  this.setState({ disabled:false }),2000 )

    }
    

    render() {
       const { navigate } = this.props.navigation;
  
       if(this.state.loadComplete) {
        return (
            <Grid>

                <Row containerStyle={{
                    backgroundColor: "#FFF", height: 250
                }}>
                 <View style={{ flex:1  ,justifyContent:'center' ,alignItems: 'center' }} >
                    <Image
                        source={businfo_icon}
                    />
                  </View>
                </Row>

                <Row containerStyle={{padding:0 }}
                    size={50}
                >
                <View style={{flex:1 ,top:10, padding:0 , left:0 , right:0}} >


                    <TouchableOpacity>
                    <Button
                        large
                        raised
                        buttonStyle={{ justifyContent: 'flex-start', }}
                        containerViewStyle={{ backgroundColor:"red"  }}
                        backgroundColor={"#329EFD"}
                        icon={{ name:'directions-bus' }}
                        title='ค้นหาสายรถเมล์' 
                        disabled={this.state.disabled}
                        onPress={() => this.navTo(1) } 
                    >


                    </Button>
                    </TouchableOpacity>
 

                     <TouchableOpacity>
                        <Button
                        large
                        raised
                         buttonStyle={{ justifyContent: 'flex-start', }}
                        backgroundColor={ "#0D4398"}
                        icon={{ name: 'local-library' }}
                        title='ค้นหารถเมล์จากต้นทาง-ปลายทาง'
                         disabled={this.state.disabled}
                        onPress={() => this.navTo(2) } 
                    
                        />
                     </TouchableOpacity>
                      <TouchableOpacity>

                    <Button
                        large
                        raised
                         buttonStyle={{ justifyContent: 'flex-start', }}
                        backgroundColor={"#00796B"}
                        icon={{ name: 'place' }}
                        title='ค้นหาป้ายรถเมล์บริเวณใกล้'
                          disabled={this.state.disabled}
                         onPress={() => this.navTo(3)} 
                        />
                 </TouchableOpacity>




                </View>
                </Row>
            
            </Grid>

        )
       }else{
           return (<View/>)
       }
    }


} //  end class


export default Menu;


