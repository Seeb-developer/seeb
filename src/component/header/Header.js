import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { width } from '../../utils/constent';
import { GOOGLE_API_KEY } from '@env';

const Header = () => {
    const navigation = useNavigation();
    const [location, setLocation] = useState('Fetching location...');

    useEffect(() => {
        // fetchStoredLocation();
    }, []);



    const fetchStoredLocation = async () => {
        try {
            const storedLocation = await AsyncStorage.getItem("user_location");
            if (storedLocation) {
                const { address } = JSON.parse(storedLocation);
                setLocation(address || "Fetching location...");
            } else {
                getLocation();
            }
        } catch (error) {
            console.error("Error fetching location from storage:", error);
            // getLocation(); // Fetch location if retrieval fails
        }
    };

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Latitude:", latitude, "Longitude:", longitude);

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                    );
                    const data = await response.json();

                    let address = 'Pune, Maharashtra'; // Default location
                    if (data.status === "OK" && data.results.length > 0) {
                        address = data.results[0].formatted_address;
                    }

                    console.log("Accurate Location:", address);
                    setLocation(address);
                    await AsyncStorage.setItem("user_location", JSON.stringify({ latitude, longitude, address }));

                } catch (error) {
                    console.error("Geocoding Error:", error);
                    setLocation("Location not found");
                }
            },
            (error) => {
                console.log("Location Error:", error);
                setLocation('Set Location');
                Alert.alert("Location Error", "Unable to fetch location. Please enable GPS and try again.");
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
        );
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
                <FastImage
                    source={require('../../asset/logo.png')}
                    style={styles.logo}
                    resizeMode={FastImage.resizeMode.contain}
                />
                {/* <TouchableOpacity >
                <Text style={styles.logotext}>SEEB</Text>
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => navigation.navigate('LocationScreen')}>
                    <Text style={styles.locationText}>Pune Maharashtra</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.logotext}>Designing Dreams, Crafting Space.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // flexDirection: 'row',
        backgroundColor: '#000',
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        shadowOpacity: 0.2,
        paddingHorizontal: 10,
        // marginBottom: 10,
        // alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 40 : 10, // Adjust for iOS notchApp
    },
    logo: {
        width: width * 0.3,
        height: width * 0.15,
        marginLeft: 10,
    },
    logotext: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    locationText: {
        marginLeft: width * 0.04,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',

    },
});

export default Header;
