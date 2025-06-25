import React, { useEffect, useState, useContext } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../hooks/context/UserContext';
import { showToast, width } from '../utils/constent';
import { apiRequest } from '../utils/api';
import { API_URL } from "@env";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Feather';
import { CartContext } from '../hooks/context/CartContext';
import Swiper from 'react-native-swiper';
import UpdateCartModal from '../component/model/UpdateCartModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const Cart = () => {
    const { userId } = useContext(UserContext);
    const { setCart } = useContext(CartContext);
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [cartItem, setCartItem] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            fetchCartItems(true);
        }, [])
    );

    const fetchCartItems = async (loading) => {
        try {
            setLoading(loading);
            const response = await apiRequest("GET", `seeb-cart/getCart/${userId}`);
            if (response.status === 200) {
                console.log("Cart items fetched successfully:", response.data);
                setCartItems(response.data);
                setCart(response.data);
                setTotalAmount(response.data.reduce((sum, item) => sum + parseFloat(item.amount), 0));
            } else {
                setCartItems([]);
                setCart([]);
                setTotalAmount(0);
            }
        } catch (error) {
            showToast("error", "Failed to fetch cart items");
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (cartId) => {
        try {
            await apiRequest("DELETE", `/seeb-cart/${cartId}`);
            showToast("success", "Item removed from cart");
            fetchCartItems(false);
        } catch (error) {
            showToast("error", "Failed to remove item");
        }
    };

    const handleEdit = (item) => {
        navigation.navigate("EditCartScreen", { cartItem: item });
    };

    const handleCheckout = () => {
        navigation.navigate("CheckoutScreen");
    };

    const getRateTypeLabel = (rateType) => {
        switch (rateType) {
            case "square_feet":
                return { label: "Sq. ft", unit: "Sq. ft" };
            case "running_feet":
                return { label: "Running Feet", unit: "ft" };
            case "running_meter":
                return { label: "Running Meter", unit: "m" };
            case "points":
                return { label: "Points", unit: "Points" };
            case "unit":
                return { label: "Units", unit: "unit" };
            default:
                return { label: rateType.replace("_", " "), unit: rateType.replace("_", " ") };
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>🛒 My Cart</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            ) : cartItems.length === 0 ? (
                <Text style={styles.emptyText}>Your cart is empty.</Text>
            ) : (
                <>
                    <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            {cartItems.map((item, idx) => {
                                // Parse addons if it's a string
                                let addons = [];
                                if (typeof item.addons === "string") {
                                    try {
                                        addons = JSON.parse(item.addons);
                                    } catch {
                                        addons = [];
                                    }
                                } else if (Array.isArray(item.addons)) {
                                    addons = item.addons;
                                }

                                // Get image (adjust property if needed)
                                let images = [];
                                try {
                                    images = JSON.parse(item.service_image); // Parse JSON string
                                    if (!Array.isArray(images)) images = [images]; // Ensure it's an array
                                } catch (error) {
                                    images = [`${API_URL}/${item.service_image}`]; // Fallback to single image
                                }

                                return (
                                    <View
                                        key={item.id}
                                        style={[
                                            styles.cartItemInCard,
                                            // idx === cartItems.length - 1 && { borderBottomWidth: 0 } // Remove border for last item
                                        ]}
                                    >
                                        {/* Image Slider */}
                                        {images.length > 0 && (
                                            <View style={{ width: 70, height: 70, marginRight: 8 }}>
                                                <Swiper
                                                    style={{ borderRadius: 8 }}
                                                    showsPagination={false}
                                                    autoplay={false}
                                                    loop={false}
                                                >
                                                    {images.map((img, imgIdx) => (
                                                        <Image
                                                            key={imgIdx}
                                                            source={{ uri: img.startsWith('http') ? img : `${API_URL}/${img}` }}
                                                            style={{ width: 70, height: 70, borderRadius: 8 }}
                                                            resizeMode="cover"
                                                        />
                                                    ))}
                                                </Swiper>
                                            </View>
                                        )}
                                        <View style={styles.itemDetails}>
                                            <Text
                                                style={styles.itemName}
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                            >
                                                {item.service_name}
                                            </Text>
                                            <View style={styles.tagContainer}>
                                                <Text style={styles.tag}>
                                                    {getRateTypeLabel(item.rate_type).label}: {item.value} | ₹{item.rate} per {getRateTypeLabel(item.rate_type).unit}
                                                </Text>
                                            </View>
                                            {addons.length > 0 && (
                                                <View style={styles.addonBox}>
                                                    {addons.map((addon, idx) => (
                                                        <Text key={idx} style={styles.addonText}>
                                                            + {addon.name}: ₹{parseFloat(addon.total).toFixed(2)}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        {/* Remove & Edit Icons */}
                                        <View style={styles.iconContainer}>
                                            <Text style={styles.itemPrice}>₹{item.amount}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                                                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.iconButton}>
                                                    <Icon name="delete" size={20} color="red" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => {
                                                    setCartItem(item);
                                                    setServiceId(item.service_id);
                                                    setModalVisible(true);
                                                }} style={styles.iconButton}>
                                                    <Icon2 name="edit" size={20} color="#007BFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {/* Update Cart Modal */}
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {isModalVisible && (
                        <UpdateCartModal
                            service_id={serviceId}
                            cart_item={cartItem}
                            visible={isModalVisible}
                            onClose={() => setModalVisible(false)}
                            fetchCartItems={fetchCartItems}
                        />
                    )}

                    {cartItems.length > 0 && (
                        <View style={styles.checkoutBar}>
                            <Text style={styles.totalText}>Total: ₹{totalAmount.toFixed(2)}</Text>
                            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                                <Text style={styles.checkoutButtonText}>Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7fb',
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: "#333",
    },
    loader: {
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
    },
    cartList: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,

    },
    cartItemInCard: {
        flexDirection: 'row',
        // alignItems: 'center',
        paddingTop: 10,
        position: 'relative',
        paddingRight: 50,
        backgroundColor: 'transparent', // No background, so it blends with card
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#333",
        marginRight: 10,
    },
    tagContainer: {
        flexDirection: "row",
        marginVertical: 5,
    },
    tag: {
        color: "#000",
        fontSize: 12,
        borderRadius: 10,
        marginRight: 4,
        fontWeight: "400",
        marginLeft: 10,
    },
    totalSqFtText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#555",
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ff5733', // highlight
        marginLeft: 10,
    },
    refImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 5,
        marginTop: 5,
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'column',
        // alignItems: 'center',
    },
    iconButton: {
        marginVertical: 5,
    },
    checkoutBar: {
        backgroundColor: "#fff",
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        elevation: 2,
        marginBottom: 10,
        borderRadius: 10,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#000",
    },
    checkoutButton: {
        backgroundColor: '#ff5733',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addonBox: {
        marginTop: 4,
        marginLeft: 4,
        backgroundColor: '#f6f7fb',
        borderRadius: 6,
        padding: 6,
    },
    addonText: {
        fontSize: 12,
        color: '#555',
        marginBottom: 2,
        fontWeight: '500',
    },
});

export default Cart;
