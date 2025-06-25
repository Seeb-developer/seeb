import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from 'react-native';

import { API_URL } from "@env";

const BookingScreen = ({ route, navigation }) => {
    const { service } = route.params;

    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [roomSize, setRoomSize] = useState('');
    const [totalCost, setTotalCost] = useState(service.rate);

    const handleBooking = async () => {
        if (!userName || !phone || !time || !address) {
            Alert.alert("Error", "Please fill in all details before booking.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: service.id,
                    name: userName,
                    phone,
                    date: date.toISOString().split('T')[0],
                    time,
                    address,
                    roomSize,
                    totalCost
                }),
            });

            const result = await response.json();
            if (result.status === 200) {
                Alert.alert("Success", "Booking confirmed!", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert("Error", result.message || "Booking failed.");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalCost = (size) => {
        let cost = service.rate;
        if (service.rate_type === 'points' || service.rate_type === 'unit') {
            cost *= parseInt(size) || 1;  // Multiply rate by input value
        }
        setRoomSize(size);
        setTotalCost(cost);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                        {/* Service Details */}
                        <View style={styles.serviceCard}>
                            <Image source={{ uri: `${API_URL}/${service.image}` }} style={styles.image} />
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.price}>₹{totalCost} {service.rate_type?.replaceAll("_", " ")}</Text>
                        </View>

                        {/* User Inputs */}
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Name"
                            value={userName}
                            onChangeText={setUserName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Enter Phone Number"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />

                        {/* Address Selection */}
                        <TouchableOpacity style={styles.addressPicker} onPress={() => setAddress("Selected Address")}>
                            <Text style={styles.addressText}>{address || "Select Address"}</Text>
                        </TouchableOpacity>

                        {/* Room Size Input */}
                        {(service.rate_type === 'points' || service.rate_type === 'unit') && (
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Room Size"
                                keyboardType="numeric"
                                value={roomSize}
                                onChangeText={calculateTotalCost}
                            />
                        )}
                    </ScrollView>

                    {/* Confirm Booking Button at Bottom */}
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity style={styles.bookButton} onPress={handleBooking} disabled={loading}>
                            <Text style={styles.bookButtonText}>{loading ? "Booking..." : "Confirm Booking"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    innerContainer: {
        flex: 1,
        padding: 15,
    },
    serviceCard: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 10,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    price: {
        fontSize: 16,
        color: '#ff5733',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 10,
    },
    addressPicker: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    addressText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 10,
        left: 15,
        right: 15,
    },
    bookButton: {
        backgroundColor: '#ff5733',
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
    },
    bookButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default BookingScreen;
