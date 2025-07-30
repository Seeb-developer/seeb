import React, { useEffect, useState, useContext, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiRequest } from "../../utils/api";
import { UserContext } from "../../hooks/context/UserContext";
import { useFocusEffect } from "@react-navigation/native";

const PreviousBookingsScreen = ({ navigation }) => {
    const { userId } = useContext(UserContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const fetchBookings = async () => {
        try {
            const res = await apiRequest("GET", `/booking/user/${userId}`);
            setBookings(res?.data || []);
        } catch (err) {
            console.error("Failed to load bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderBooking = ({ item }) => (
        <TouchableOpacity
            style={styles.bookingCard}
            onPress={() => navigation.navigate("BookingSupportReasonScreen", { booking: item })}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.bookingTitle}>#{item.booking_id}</Text>
                <Text style={styles.bookingText}>
                    Date: {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.bookingText}>Amount: ₹{item.final_amount}</Text>
                <Text style={styles.bookingText}>Status: {item.status}</Text>
                {item.services?.map((service, idx) => (
                    <Text key={idx} style={styles.serviceText}>• {service.name}</Text>
                ))}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#555" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>All Bookings</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 30 }} />
            ) : bookings.length === 0 ? (
                <Text style={styles.emptyText}>No bookings found.</Text>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.booking_id.toString()}
                    renderItem={renderBooking}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
};

export default PreviousBookingsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
        color: "#333",
        marginRight: 24,
    },
    list: { padding: 20 },
    bookingCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        elevation: 2,
    },
    bookingTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
    bookingText: { fontSize: 14, color: "#555", marginTop: 2 },
    serviceText: { fontSize: 13, color: "#777", marginLeft: 6 },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#999",
    },
});
