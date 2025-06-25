import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { UserContext } from "../../hooks/context/UserContext";
import { apiRequest } from "../../utils/api";
import { showToast } from "../../utils/constent";
import Swiper from 'react-native-swiper';
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";

const Bookings = () => {
    const { userId } = useContext(UserContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            fetchUserBookings();
        }, [])
    );

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("GET", `/booking/user/${userId}`);
            if (response.status === 200) {

                setBookings(response.data);
            } else {
                setBookings([]);
                // showToast("error", "Failed to fetch bookings");
            }
        } catch (error) {
            showToast("error", "Error fetching bookings");
        } finally {
            setLoading(false);
        }
    };

    const renderBookingStatus = (status) => {
        switch (status) {
            case "completed":
                return <Text style={[styles.status, { color: "green" }]}>✔️ Completed</Text>;
            case "confirmed":
                return <Text style={[styles.status, { color: "#007BFF" }]}>✅ Confirmed</Text>;
            case "pending":
                return <Text style={[styles.status, { color: "#FFA500" }]}>⏳ Pending</Text>;
            case "ongoing":
                return <Text style={[styles.status, { color: "#FFCC00" }]}>🔄 Ongoing</Text>;
            case "canceled":
                return <Text style={[styles.status, { color: "red" }]}>❌ Canceled</Text>;
            default:
                return <Text style={styles.status}>⚪ Unknown</Text>;
        }
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

    const renderBookingItem = ({ item }) => (
        <TouchableOpacity
            key={item.booking_id}
            style={styles.bookingItem}
            onPress={() => navigation.navigate("BookingDetails", { bookingId: item.id })}
        >
            {/* Booking Header */}

            <View style={styles.card}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingId}>Booking ID: #{item.booking_id}</Text>
                    {renderBookingStatus(item.status)}
                </View>
                {item?.services?.map((service, idx) => {
                    // Parse addons if it's a string

                    let addons = [];
                    if (typeof service.addons === "string") {
                        try {
                            addons = JSON.parse(service.addons);
                        } catch {
                            addons = [];
                        }
                    } else if (Array.isArray(service.addons)) {
                        addons = service.addons;
                    }

                    // Get image (adjust property if needed)
                    let images = [];
                    try {
                        images = JSON.parse(service.service_image); // Parse JSON string
                        if (!Array.isArray(images)) images = [images]; // Ensure it's an array
                    } catch (error) {
                        images = [`${API_URL}/${service.service_image}`]; // Fallback to single image
                    }

                    return (
                        <View
                            key={service.id}
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
                                                source={{ uri: `${API_URL}/${img}` }}
                                                style={{ width: 70, height: 70, borderRadius: 8 }}
                                                resizeMode="cover"
                                            />
                                        ))}
                                    </Swiper>
                                </View>
                            )}
                            <View style={styles.itemDetails}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text
                                        style={[styles.itemName, { flex: 1 }]}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {service.name}
                                    </Text>
                                    <Text style={styles.itemPrice}>
                                        ₹{parseFloat(service.amount).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tag}>
                                        {getRateTypeLabel(service.rate_type).label}: {service.value} | ₹{service.rate} per {getRateTypeLabel(service.rate_type).unit}
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

                        </View>
                    );
                })}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total: ₹{item?.final_amount}</Text>
                    <Icon name="chevron-right" size={24} color="#007BFF" />
                </View>
            </View>

            {/* Service List */}
            {/* <View style={styles.servicesContainer}>
                {item.services?.map((service, index) => (
                    <View key={index} style={styles.serviceItem}>
                        <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">
                            {service.name}
                        </Text>

                        <Text style={styles.servicePrice}>₹{service.amount}</Text>
                    </View>
                ))}
            </View> */}

            {/* Total Price */}

        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>📅 My Bookings</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            ) : bookings.length === 0 ? (
                <Text style={styles.emptyText}>No bookings found.</Text>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.booking_id.toString()}
                    renderItem={renderBookingItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f6f7fb",
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        color: "#333",
    },
    loader: {
        marginTop: 50,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        color: "#999",
        marginTop: 50,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    bookingItem: {
        // backgroundColor: "#fff",
        // padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        // elevation: 3,
    },
    bookingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    bookingId: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },

    status: {
        fontSize: 14,
        fontWeight: "bold",
    },
    servicesContainer: {
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 8,
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
        marginTop: 15,
        position: 'relative',
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
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'column',
        // alignItems: 'center',
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        alignItems: "center",
        backgroundColor: "#f6f7fb",
        padding: 10,
    },
    totalText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
});

export default Bookings;
