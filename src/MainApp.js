import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Platform,
  ListView
} from 'react-native';

import { StackNavigator } from 'react-navigation';
import Home from './Home';
import MapPage from './Map';
import Menu  from './Menu';
import  NearBusStop from './NearBusStop';


export default class Main extends Component {
  static navigationOptions = {
    title: 'Main'
  }
};


export  const mainApp = StackNavigator({
  Menu : { screen: Menu },
  Home: { screen: Home },
  Map: { screen: MapPage },
  NearBusStop: { screen : NearBusStop  }
});


