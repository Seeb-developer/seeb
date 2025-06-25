import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookingSuccess = ({ route }) => {
    const navigation = useNavigation();
    const { bookingId, amount, slotDate, paymentStatus } = route.params || {};

    return (
        <SafeAreaView style={styles.container}>
            {/* <Image source={require('../../assets/success.png')} style={styles.successImage} /> */}
            <Text style={styles.successText}>Booking Confirmed!</Text>
            <Text style={styles.orderDetails}>Booking ID: {bookingId}</Text>
            <Text style={styles.orderDetails}>Amount: ₹{amount}</Text>
            <Text style={styles.orderDetails}>Payment Status: ₹{paymentStatus}</Text>
            <Text style={styles.orderDetails}>Slot Date: {slotDate}</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('/home')}>
                <Text style={styles.buttonText}>Go to Home</Text>
                <Icon name="home" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("BookingScreen", { screen: "Bookings" })}>
                <Text style={styles.secondaryButtonText}>View My Bookings</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    successImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    successText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
    },
    orderDetails: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 20,
        width: '80%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    secondaryButton: {
        marginTop: 10,
        padding: 10,
    },
    secondaryButtonText: {
        fontSize: 16,
        color: '#007BFF',
    },
});

export default BookingSuccess;
