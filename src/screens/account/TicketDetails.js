import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {  API_URL, PROD_API_URL } from '@env';
import { apiRequest } from "../../utils/api";
import { SafeAreaView } from "react-native-safe-area-context";
const TicketDetails = ({ route, navigation }) => {
    const { ticket } = route.params;
    const updateTicketStatus = async (status) => {
        try {
            const res = await apiRequest("POST", `tickets/update-status/${ticket.id}`, {
                status: status,
            });

            if (res.status === 200) {
                alert("Ticket status updated successfully.");
                navigation.goBack(); // or refresh ticket list if needed
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error("Update status error:", error);
            alert("Error updating ticket status.");
        }
    };

    // const timeString = ticket.created_at
    //     ? `${ticket.created_at.toLocaleDateString()} ${ticket.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    //     : '';
    return (
        <SafeAreaView style={styles.container}>
            {/* ✅ Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Ticket Details</Text>
            </View>

            {/* ✅ Ticket Info */}
            <View style={styles.ticketContainer}>
                <Text style={styles.ticketId}>Ticket ID: {ticket.ticket_uid}</Text>
                <Text style={styles.ticketSubject}>Subject: {ticket.subject}</Text>
                <Text style={styles.ticketStatus}>
                    Status: <Text style={ticket.status === "Resolved" ? styles.resolvedStatus : styles.pendingStatus}>{ticket.status}</Text>
                </Text>
                <Image
                    source={{ uri: API_URL + ticket.file }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                />
                {/* <Text style={styles.ticketDescription}>
                    Description: {"\n"}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ticket details and issue description.
                </Text> */}
                <Text style={styles.ticketDate}>Date Raised: {ticket.created_at}</Text>
            </View>

            {/* ✅ Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => updateTicketStatus("closed")}>
                    <Text style={styles.closeButtonText}>Close Ticket</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentButton} onPress={() => navigation.navigate("ChatTicket", { data: ticket || {} })}>
                    <Text style={styles.commentButtonText}>Add Comment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default TicketDetails;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb", },
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
        elevation: 3
    },

    backButton: { marginRight: 10 },

    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
        textAlign: "center"
    },
    ticketContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 3, marginTop: 20, margin: 20 },
    ticketId: { fontSize: 14, fontWeight: "bold", color: "#555" },
    ticketSubject: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 5 },
    ticketStatus: { fontSize: 14, fontWeight: "bold", marginTop: 5, textTransform: 'capitalize' },
    resolvedStatus: { color: "green" },
    pendingStatus: { color: "red" },
    ticketDescription: { fontSize: 14, color: "#555", marginTop: 10 },
    ticketDate: { fontSize: 12, color: "#777", marginTop: 10 },

    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, margin: 20 },
    closeButton: { backgroundColor: "red", padding: 12, borderRadius: 10, flex: 1, alignItems: "center", marginRight: 10 },
    closeButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    commentButton: { backgroundColor: "#007BFF", padding: 12, borderRadius: 10, flex: 1, alignItems: "center" },
    commentButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
        marginTop: 20,
    },
});
