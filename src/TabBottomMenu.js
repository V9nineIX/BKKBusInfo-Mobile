import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import { Tabs, Tab, Icon } from 'react-native-elements'
import { TAB_BAR_COLOR } from './StyleConstant';

const styles = StyleSheet.create({
    iconBtnStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    }
})

const FONT_SIZE = 28;

export default class TabBottomMenu extends Component {

    constructor(props) {
        super(props)
    }
    render() {
        return (
            <Tabs tabBarStyle={{ backgroundColor: TAB_BAR_COLOR }}
            >
                <Tab
                    title={"ค้นหาทั้งหมด"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='search' size={30} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="search" size={30} />}
                    onPress={() => this.props.onClickSearchBtn }
                >

                </Tab>

                <Tab
                    title={"จุดเริ่มต้น"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='place' size={FONT_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="place" size={FONT_SIZE} />}
                >

                </Tab>

                <Tab
                    title={"ป้าย"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='directions-bus' size={FONT_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="directions-bus" size={FONT_SIZE} />}
                >

                </Tab>

                <Tab
                    title={"รายละเอียด"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='view-list' size={FONT_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="view-list" size={FONT_SIZE} />}
                />

                <Tab
                    title={"ดูเส้นทาง"}
                    titleStyle={{ color: "#FFF" }}
                    renderIcon={() =>
                        <Icon containerStyle={styles.iconBtnStyle}
                            color={'#FFF'}
                            name='near-me' size={FONT_SIZE} />}
                    renderSelectedIcon={() => <Icon color={'#FFF'} name="near-me" size={FONT_SIZE} />}
                />

          


            </Tabs>

        )
    }


}
