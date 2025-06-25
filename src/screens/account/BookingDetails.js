import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert,
    PermissionsAndroid,
    Platform,
    Image
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { UserContext } from "../../hooks/context/UserContext";
import { apiRequest } from "../../utils/api";
import { showToast } from "../../utils/constent";
import { API_URL } from "@env"; // Ensure API_URL is set
import RNFetchBlob from 'react-native-blob-util';
import Swiper from "react-native-swiper";
import { SafeAreaView } from "react-native-safe-area-context";

const BookingDetails = () => {
    const { userId } = useContext(UserContext);
    const route = useRoute();
    const { bookingId } = route.params;
    const navigation = useNavigation();

    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
    }, []);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("GET", `/booking/${bookingId}`);
            if (response.status === 200) {
                // console.log("Booking Data:", response.data);
                setBookingDetails(response.data);
            } else {
                showToast("error", "Failed to fetch booking details");
            }
        } catch (error) {
            showToast("error", "Error fetching booking details");
        } finally {
            setLoading(false);
        }
    };
    const downloadInvoice = async () => {
        const invoiceUrl = `${API_URL}/invoice/${bookingId}`;

        try {
            const { dirs } = RNFetchBlob.fs;
            const path = Platform.OS === "ios"
                ? `${dirs.DocumentDir}/Invoice_${bookingId}.pdf`  // iOS: Save inside Documents
                : `${dirs.DownloadDir}/Invoice_${bookingId}.pdf`; // Android: Save in Downloads

            const res = await RNFetchBlob.config({
                fileCache: true,
                path: path,
                addAndroidDownloads: Platform.OS === "android"
                    ? {
                        useDownloadManager: true,
                        notification: true,
                        title: `Invoice_${bookingId}.pdf`,
                        description: "Downloading invoice...",
                        mime: "application/pdf",
                        mediaScannable: true,
                    }
                    : undefined,  // iOS does not need this
            }).fetch("GET", invoiceUrl);

            if (Platform.OS === "ios") {
                // Open file immediately after download
                RNFetchBlob.ios.openDocument(path);
            } else {
                showToast("success", "Invoice downloaded successfully.");
            }
        } catch (error) {
            console.error("Download Error:", error);
            Alert.alert("Error", "Failed to download invoice.");
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />;
    }

    if (!bookingDetails) {
        return <Text style={styles.errorText}>Booking details not found.</Text>;
    }


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
            <View style={styles.headerContainer}>
                {/* 🔙 Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#007BFF" />
                </TouchableOpacity>

                {/* 📌 Booking ID & Status */}
                <View style={styles.headerTitleContainer}>
                    {/* <Text style={styles.headerTitle}>📌 Booking ID</Text> */}
                    <Text style={styles.headerTitle}>#{bookingDetails.booking.booking_id}</Text>
                    <Text style={[styles.status, { backgroundColor: "#007BFF" }]}>
                        ✅ {bookingDetails.booking.status}
                    </Text>
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>📅 Booking Details</Text>
                    <Text style={styles.detailText}><Text style={styles.boldText}>Booking Date:</Text> {bookingDetails.booking.slot_date}</Text>
                    <Text style={styles.detailText}><Text style={styles.boldText}>Payment Type:</Text> {bookingDetails.booking.payment_type.replace("_", " ")}</Text>
                    <Text style={styles.detailText}><Text style={styles.boldText}>Payment Status:</Text> {bookingDetails.booking.payment_status}</Text>
                    {bookingDetails.booking.applied_coupon ? (
                        <Text style={styles.detailText}><Text style={styles.boldText}>Applied Coupon:</Text> {bookingDetails.booking.applied_coupon}</Text>
                    ) : null}
                </View>
                <View style={styles.servicesContainer}>
                    {/* 📆 Booking Details */}
                    <Text style={styles.sectionTitle}>🛠 Services</Text>
                    {bookingDetails.services?.map((service, index) => {
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
                                {/* {images.length > 0 && (
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
                                )} */}
                                <View style={styles.itemDetails}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text
                                            style={[styles.itemName, { flex: 1 }]}
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                        >
                                            {service.service_name}
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
                                                    + {addon.name}: ₹{parseFloat(addon.total).toFixed(2)} ({addon.qty}*{addon.price})
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </View>

                            </View>
                        );
                    })}
                </View>

                <View style={styles.summaryContainer}>
                    <Text style={styles.sectionTitle}>💰 Payment Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Amount:</Text>
                        <Text style={styles.summaryValue}>₹{bookingDetails.booking.total_amount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>CGST (9%):</Text>
                        <Text style={styles.summaryValue}>₹{bookingDetails.booking.cgst}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>SGST (9%):</Text>
                        <Text style={styles.summaryValue}>₹{bookingDetails.booking.sgst}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Final Amount:</Text>
                        <Text style={styles.summaryValue}>₹{bookingDetails.booking.final_amount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Paid Amount:</Text>
                        <Text style={styles.summaryValue}>₹{bookingDetails.booking.paid_amount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Amount Due:</Text>
                        <Text style={styles.summaryValue}>₹{bookingDetails.booking.amount_due}</Text>
                    </View>
                    {/* {bookingDetails.booking.payment_status.toLowerCase() === "pending" && (
                        <TouchableOpacity style={styles.payNowButton} onPress={() => handlePayment()}>
                            <Text style={styles.payNowButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                    )} */}
                </View>
                <View style={styles.downloadContainer}>
                    <Text style={styles.downloadTitle}>📄 Invoice Available</Text>
                    <TouchableOpacity onPress={() => downloadInvoice()}>
                        <Text style={styles.downloadLink}>Download Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f6f7fb",
        paddingHorizontal: 15,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // Centers the Booking ID & status
        paddingVertical: 12,
        // backgroundColor: "#fff",
        // elevation: 3, // Adds shadow for a clean UI
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    backButton: {
        position: "absolute",
        left: 10, // Positions back button on the left
        padding: 5,
    },
    headerTitleContainer: {
        alignItems: "center", // Ensures Booking ID & Status are centered
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    status: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        marginTop: 3,
    },
    servicesContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
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
    summaryContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 13,
        color: "#555",
        fontWeight: "500",
    },
    summaryValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
    },
    sectionContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" },
    detailText: { fontSize: 14, color: "#555", marginBottom: 5 },
    downloadContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 10, alignItems: "center" },
    downloadLink: { fontSize: 14, color: "#007BFF", fontWeight: "600", textDecorationLine: "underline" },
    payNowButton: {
        backgroundColor: "#ff5733",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    payNowButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    boldText: {
        fontWeight: "bold",
        color: "#333",
    },
    downloadTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 6,
    },

});

export default BookingDetails;
