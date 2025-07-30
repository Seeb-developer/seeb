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
import { SafeAreaView } from "react-native-safe-area-context";
import { apiRequest } from "../../utils/api";
import { UserContext } from "../../hooks/context/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const PreviousTicketsScreen = ({ navigation }) => {
    const { userId } = useContext(UserContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchTickets();
        }, [])
    );

    const fetchTickets = async () => {
        try {
            const res = await apiRequest("GET", `tickets/user/${userId}`);
            setTickets(res.data || []);
        } catch (err) {
            console.error("Failed to load tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderTicket = ({ item }) => (
        <TouchableOpacity
            style={styles.ticketCard}
            onPress={() => navigation.navigate("ChatTicket", { ticketId: item.id })}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.ticketTitle}>#{item.ticket_uid}</Text>
                <Text style={styles.ticketText}>Subject: {item.subject}</Text>
                <Text style={styles.ticketText}>
                    Date: {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.ticketRight}>
                <Text
                    style={[
                        styles.status,
                        item.status === "resolved" ? styles.resolved : styles.open,
                    ]}
                >
                    {item.status}
                </Text>

                {item.unread_user_messages > 0 && (
                    <View style={styles.messageBadgeRow}>
                        <MaterialCommunityIcons name="message-reply-text" size={16} color="#007BFF" />
                        <Text style={styles.messageCountText}>{item.unread_user_messages} new</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            {/* 🔹 Header */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>All Tickets</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 30 }} />
            ) : tickets.length === 0 ? (
                <Text style={styles.emptyText}>No tickets found.</Text>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTicket}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
};

export default PreviousTicketsScreen;

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
        marginRight: 24, // For symmetry with back arrow
    },
    list: { padding: 20 },
    ticketCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        elevation: 2,
    },
    ticketTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
    ticketText: { fontSize: 14, color: "#555", marginTop: 2 },
    status: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
    resolved: { color: "green" },
    open: { color: "red" },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#999",
    },
    ticketRight: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    messageBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        backgroundColor: "#E3F2FD",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    messageCountText: {
        fontSize: 12,
        color: "#007BFF",
        fontWeight: "500",
        marginLeft: 4,
    },


});
