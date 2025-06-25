import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';
import { apiRequest } from '../../utils/api';
import { UserContext } from '../../hooks/context/UserContext';
import { showToast } from '../../utils/constent';
import { API_URL } from "@env";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CartContext } from '../../hooks/context/CartContext';

const CartModal = ({ visible }) => {
    const { cart } = useContext(CartContext);
    const [totalAmount, setTotalAmount] = useState(0);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const navigation = useNavigation()


    useEffect(() => {
        // fetchCartSummary();
        setTotalAmount(cart.reduce((sum, item) => sum + Number(item.amount), 0));
        // 🔥 Smooth Fade + Scale Animation
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, cart]);

    const totalCount = cart.length;
    const displayedItems = cart.slice(0, 3); // ✅ Show only first 3 images

    return (
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
            {/* ✅ Entire Modal Clickable */}
            <TouchableOpacity onPress={() =>  navigation.navigate("CheckoutScreen")} style={styles.cartContainer} activeOpacity={0.8} onPressOut={() => {}}>
                {/* 🔥 Fixed Image Stack (Now Perfectly Centered) */}
                <View style={[styles.imageWrapper, { width: displayedItems.length == 1 ? 50 : displayedItems.length * 36 }]}>
                    {totalCount > 0 ? (
                        displayedItems.map((item, index) => {
                            let serviceImages = [];
                            try {
                                serviceImages = JSON.parse(item.service_image);
                                if (!Array.isArray(serviceImages)) {
                                    serviceImages = [serviceImages];
                                }
                            } catch (error) {
                                console.error("Error parsing service_image:", error);
                                serviceImages = [API_URL + item.service_image];
                            }
                            return (
                                <Image
                                    key={index}
                                    source={{ uri: API_URL + serviceImages[0] }}
                                    style={[styles.serviceImage, { left: index * 22 }]} // ✅ Fixed center alignment
                                />
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No Items</Text>
                    )}
                </View>

                {/* ✅ Cart Info & Amount */}
                <View style={styles.cartInfo}>
                    <Text style={styles.cartText}>{totalCount} Services</Text>
                    <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 20,
        zIndex: 9999,
        backgroundColor: '#ff5733', // ✅ Solid background for clean UI
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    cartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        flexDirection: "row",
        alignItems: "center", // ✅ Ensures images stay centered
        justifyContent: "center",
        // width: 95,
        // marginRight: 12,
        // position: "relative",
    },
    serviceImage: {
        width: 45,
        height: 45,
        borderRadius: 50,
        position: "absolute",
        borderWidth: 2,
        borderColor: "#fff",
    },
    cartInfo: {
        justifyContent: "center",
    },
    cartText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff", // ✅ White text for contrast
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFD700", // ✅ Gold for premium look
        marginTop: 2,
    },
});

export default CartModal;
