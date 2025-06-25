import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OfferModal = ({ visible, onClose, offers, onApplyOffer }) => {
    const [couponCode, setCouponCode] = useState('');

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    {/* Close Icon */}
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Icon name="close" size={24} color="red" />
                    </TouchableOpacity>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContainer}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>🎁 Available Offers</Text>
                            </View>

                            {/* Coupon Code Input */}
                            <View style={styles.couponContainer}>
                                <TextInput
                                    style={styles.couponInput}
                                    placeholder="Enter Coupon Code"
                                    placeholderTextColor="#888"
                                    value={couponCode}
                                    onChangeText={setCouponCode}
                                />
                                <TouchableOpacity
                                    style={styles.applyCouponButton}
                                    onPress={() => {
                                        onApplyOffer(couponCode);
                                        setCouponCode('');
                                    }}
                                >
                                    <Text style={styles.applyText}>Apply</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Offers List */}
                            <FlatList
                                data={offers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.offerItem}>
                                        <View style={styles.offerIcon}>
                                            <Icon name="local-offer" size={20} color="#fff" />
                                        </View>
                                        <View style={styles.offerDetails}>
                                            <Text style={styles.offerTitle}>{item.coupon_name}</Text>
                                            <Text style={styles.offerDescription}>{item.description}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.applyButton} onPress={() => onApplyOffer(item.coupon_code)}>
                                            <Text style={styles.applyText}>Apply</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />

                            {/* Close Button */}
                            {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity> */}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: '90%', // Limit height to 90% of screen
        elevation: 10,
        minHeight:'50%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    couponContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 15,
    },
    couponInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 8,
    },
    applyCouponButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
    },
    applyText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    offerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    offerIcon: {
        backgroundColor: '#007BFF',
        padding: 8,
        borderRadius: 5,
        marginRight: 10,
    },
    offerDetails: {
        flex: 1,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    offerDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    applyButton: {
        backgroundColor: '#ff5733',
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 6,
    },
    closeButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    closeIcon: {
        bottom: 10,
        alignSelf: 'flex-end',
        right: 18,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
    },
});

export default OfferModal;
