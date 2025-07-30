import React, { useState, useEffect, useContext } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../../hooks/context/UserContext";
import { apiRequest } from "../../utils/api";
import { useFocusEffect } from "@react-navigation/native";

const SupportContact = ({ navigation }) => {
    const { userId } = useContext(UserContext);
    const [booking, setBooking] = useState(null);
    const [openTicket, setOpenTicket] = useState(null);
    const [faqCategories, setFaqCategories] = useState([]);

    useEffect(() => {
        fetchFaqCategories();
    }, []);

    const fetchFaqCategories = async () => {
        try {
            const response = await apiRequest("GET", "faqs-category");
            setFaqCategories(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch FAQ categories:", err);
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            fetchLatestBooking();
            fetchOpenTicket();
        }, [])
    );


    const fetchLatestBooking = async () => {
        try {
            const response = await apiRequest("GET", `/booking/user/${userId}`);
            console.log("Latest Booking Response:", response);
            setBooking(response?.data?.[0] || null);
        } catch (err) {
            console.log("Booking fetch error:", err);
        }
    };

    const fetchOpenTicket = async () => {
        try {
            const response = await apiRequest("GET", `tickets/user/${userId}`);
            console.log("Open Ticket Response:", response);
            const open = response?.data?.find(t => t.status === "open" || t.status === "in_progress");
            if (open) setOpenTicket(open);
        } catch (err) {
            console.log("Ticket fetch error:", err);
        }
    };

    const contactOptions = [
        { title: "Call Us", icon: "phone", action: () => Linking.openURL("tel:+919876543210") },
        { title: "Email Us", icon: "email", action: () => Linking.openURL("mailto:support@example.com") },
    ];


    return (
        <SafeAreaView style={styles.container}>
            {/* 🔹 Header */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>Support & Help</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {openTicket && (
                    <>
                        <Text style={styles.sectionTitle}>Ongoing Support</Text>
                        <View style={styles.bookingCard}>
                            {/* Top Row: Ticket ID + Status + Message Count */}
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.ticketIdText}>#{openTicket.ticket_uid}</Text>
                                <View style={styles.headerRight}>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            openTicket.status === 'open' || openTicket.status === 'in_progress'
                                                ? styles.statusOpen
                                                : styles.statusClosed,
                                        ]}
                                    >
                                        <Text style={styles.statusText}>{openTicket.status}</Text>
                                    </View>

                                    {openTicket.unread_user_messages > 0 && (
                                        <View style={styles.messageBadgeRow}>
                                            <MaterialCommunityIcons name="message-reply-text" size={16} color="#007BFF" />
                                            <Text style={styles.messageCountText}>{openTicket.unread_user_messages} new</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Subject */}
                            <Text style={styles.bookingText}>Subject: {openTicket.subject}</Text>

                            {/* Action */}
                            <View style={styles.bookingActions}>
                                <TouchableOpacity onPress={() => navigation.navigate("ChatTicket", { ticketId: openTicket.id })}>
                                    <Text style={styles.bookingActionText}>Go to Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
                {/* 🔹 Recent Booking */}
                <Text style={styles.sectionTitle}>Recent Booking</Text>
                {booking ? (
                    <View style={styles.bookingCard} >
                        <View style={styles.bookingGrid}>
                            <Text style={styles.bookingText}>#{booking.booking_id}</Text>
                            <Text style={styles.bookingText}>Date: {new Date(booking.created_at).toLocaleDateString()}</Text>
                            <Text style={styles.bookingText}>₹{booking.final_amount}</Text>
                            <Text style={styles.bookingText}>Status: {booking.status}</Text>
                        </View>
                        {booking.services && booking.services.map((service, index) => (
                            <Text key={index} style={styles.bookingText}>{service.name}</Text>
                        ))}
                        <View style={styles.bookingActions}>
                            <TouchableOpacity onPress={() => navigation.navigate("BookingSupportReasonScreen", { booking })}>
                                <Text style={styles.bookingActionText}>Report an Issue?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.bookingText}>No bookings found</Text>
                )}
                <TouchableOpacity
                    style={styles.faqItem}
                    onPress={() => navigation.navigate("PreviousBookings")}
                >
                    <Text style={styles.faqQuestion}>Issue with previous bookings ?</Text>
                    <MaterialCommunityIcons name='chevron-right' size={22} />
                </TouchableOpacity>

                {/* 🔹 Contact Options */}
                <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Contact Us</Text>
                {contactOptions.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.contactItem} onPress={option.action}>
                        <MaterialCommunityIcons name={option.icon} size={22} color="#007BFF" />
                        <Text style={styles.contactText}>{option.title}</Text>
                    </TouchableOpacity>
                ))}

                {/* 🔹 Help / FAQ */}
                <Text style={styles.sectionTitle}>HELP WITH OTHER QUERIES</Text>
                {faqCategories.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.faqItem}
                        onPress={() => navigation.navigate("HelpFAQList", { categoryId: item.id, categoryTitle: item.name })}
                    >
                        <Text style={styles.faqQuestion}>{item.name}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} />
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: 15 }]}>PREVIOUS TICKETS</Text>
                <TouchableOpacity
                    style={styles.faqItem}
                    onPress={() => navigation.navigate("PreviousTickets")}
                >
                    <Text style={styles.faqQuestion}>Previous all tickets</Text>
                    <MaterialCommunityIcons name='chevron-right' size={22} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportContact;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    navbar: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff" },
    header: { fontSize: 18, fontWeight: "bold", textAlign: "center", flex: 1, color: "#333" },
    content: { padding: 20 },
    sectionTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10, color: "#333" },

    bookingCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    bookingGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 6,
    },
    bookingText: {
        fontSize: 15,
        color: "#333",
        marginBottom: 4,
        // width: "50%", // Each item takes about half the row
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    ticketIdText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },

    statusOpen: {
        backgroundColor: '#FFA000', // amber
    },

    statusClosed: {
        backgroundColor: '#4CAF50', // green
    },

    messageBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    messageCountText: {
        fontSize: 12,
        color: "#007BFF",
        fontWeight: "500",
        marginLeft: 4,
    },


    contactItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 },
    contactText: { fontSize: 16, marginLeft: 10, color: "#333" },
    faqItem: {
        flexDirection: "row",
        alignItems: "center", // ✅ Vertically center items
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 16, // ✅ Give proper side padding
        borderRadius: 8,
        marginBottom: 10, // Optional spacing between items
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
        flexShrink: 1, // ✅ Prevents overflow
    },

    // faqQuestion: { fontSize: 14, fontWeight: '500', color: "#000" },
    faqAnswerContainer: { backgroundColor: "#eef5ff", marginTop: 10, padding: 10, borderRadius: 10 },
    faqAnswer: { fontSize: 14, color: "#555" },
    bookingActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
    bookingActionText: { color: "#007BFF", fontSize: 14, fontWeight: "500", textDecorationLine: "underline" },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
   

});
