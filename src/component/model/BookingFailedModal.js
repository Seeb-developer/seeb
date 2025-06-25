import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BookingFailedModal = ({ visible, onClose, reason, bookingId, amount, onRetry }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    {/* <Image source={require('../../assets/failed.png')} style={styles.failedImage} /> */}
                    <Text style={styles.failedText}>Payment Failed</Text>
                    <Text style={styles.errorMessage}>{reason || "Something went wrong, please try again."}</Text>

                    {bookingId && <Text style={styles.orderDetails}>Booking ID: {bookingId}</Text>}
                    {amount && <Text style={styles.orderDetails}>Amount: ₹{amount}</Text>}

                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryButtonText}>Retry Payment</Text>
                        <Icon name="refresh" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    failedImage: {
        width: 120,
        height: 120,
        marginBottom: 15,
    },
    failedText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    orderDetails: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 15,
        width: '90%',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    cancelButton: {
        marginTop: 10,
        padding: 10,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#007BFF',
    },
});

export default BookingFailedModal;
