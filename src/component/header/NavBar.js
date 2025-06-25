//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { Component, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from "react-native-vector-icons/AntDesign"
// create a component
const NavBar = ({ title, press, color }) => {
    const navigation = useNavigation();
    return (

        <TouchableOpacity
            // activeOpacity={0.7} 
            onPress={() => {
                console.log("Back Pressed");
                press ? press() : navigation.goBack();
            }}
        >
            <View style={styles.container}>
                <AntDesign name='arrowleft' size={20} color={color ? color : '#000'} />
                <Text style={[styles.title, { color: color ? color : "#000" }]}>{title}</Text>
            </View>
            <View style={[styles.line, { borderColor: color ? color : "#000" }]}></View>
        </TouchableOpacity>

    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        // marginBottom: 10,
        // padding:15
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
        color: "#000",
        marginLeft: 15,
    },
    line: {
        borderWidth: 0.4,
        borderColor: "#000",
    },
    icon: {
        color: "#000"
    }
});

//make this component available to the app
export default NavBar;
