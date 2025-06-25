import React, { useContext, useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, FlatList
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { apiRequest } from "../../utils/api";
import { UserContext } from "../../hooks/context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

const SupportContact = ({ navigation }) => {
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const { userId } = useContext(UserContext)

    // Dummy Raised Tickets Data
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetchUserTickets();
    }, []);

    const fetchUserTickets = async () => {
        try {
            const response = await apiRequest("GET", `tickets/user/${userId}`);
            console.log(response);
            setTickets(response.data); // Adjust based on actual API response shape
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    // Contact Options
    const contactOptions = [
        { id: 1, title: "Call Us", icon: "phone", action: () => Linking.openURL("tel:+919876543210") },
        { id: 2, title: "Email Us", icon: "email", action: () => Linking.openURL("mailto:support@example.com") },
        { id: 3, title: "Visit Website", icon: "web", action: () => Linking.openURL("https://www.seeb.in") },
    ];

    // FAQ Data
    const faqs = [
        { id: 1, question: "How do I reset my password?", answer: "Go to Settings > Account > Reset Password." },
        { id: 2, question: "How can I contact support?", answer: "You can call, email, or use live chat." },
        { id: 3, question: "What payment methods are supported?", answer: "We accept credit cards, UPI, and PayPal." },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* ✅ Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Support & Contact Us</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* ✅ Contact Options */}
                <Text style={styles.sectionTitle}>Contact Us</Text>
                {contactOptions.map((option) => (
                    <TouchableOpacity key={option.id} style={styles.contactItem} onPress={option.action}>
                        <MaterialCommunityIcons name={option.icon} size={24} color="#007BFF" />
                        <Text style={styles.contactText}>{option.title}</Text>
                    </TouchableOpacity>
                ))}

                {/* ✅ FAQs Section */}
                <Text style={styles.sectionTitle}>FAQs</Text>
                {faqs.map((faq) => (
                    <View key={faq.id} style={styles.faqContainer}>
                        <TouchableOpacity style={styles.faqItem} onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <MaterialCommunityIcons name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} size={22} color="#333" />
                        </TouchableOpacity>
                        {expandedFAQ === faq.id && (
                            <View style={styles.faqAnswerContainer}>
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                <TouchableOpacity
                                    style={styles.raiseTicketButton}
                                    onPress={() => navigation.navigate("RaiseTicket")}
                                >
                                    <Text style={styles.raiseTicketText}>Raise a Ticket</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}

                {/* ✅ My Tickets Section */}
                <Text style={styles.sectionTitle}>My Tickets</Text>
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.ticketItem}
                            onPress={() => navigation.navigate("TicketDetails", { ticket: item })}
                        >
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.ticketSubject} numberOfLines={1} ellipsizeMode="tail">
                                    #{item.ticket_uid}
                                </Text>
                                <Text style={styles.ticketSubject} numberOfLines={1} ellipsizeMode="tail">
                                    {item.subject}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.ticketStatus,
                                    item.status === "Resolved" ? styles.resolvedStatus : styles.pendingStatus,
                                ]}
                                numberOfLines={1}
                            >
                                {item.status}
                            </Text>
                        </TouchableOpacity>

                    )}
                    scrollEnabled={false} // Disables scrolling inside FlatList (uses ScrollView)
                />

                {/* ✅ Raise Ticket Button */}
                <TouchableOpacity style={styles.mainRaiseTicketButton} onPress={() => navigation.navigate("RaiseTicket")}>
                    <Text style={styles.mainRaiseTicketText}>Raise a Support Ticket</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportContact;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    navbar: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff", elevation: 3 },
    backButton: { marginRight: 10 },
    headerText: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1, textAlign: "center" },
    content: { padding: 20, flexGrow: 1 },

    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },
    contactItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 12, elevation: 3 },
    contactText: { fontSize: 16, fontWeight: "bold", color: "#333", marginLeft: 10 },

    faqContainer: { marginBottom: 12 },
    faqItem: { backgroundColor: "#fff", padding: 15, borderRadius: 10, flexDirection: "row", justifyContent: "space-between", elevation: 3 },
    faqQuestion: { fontSize: 16, fontWeight: "bold", color: "#007BFF" },
    faqAnswerContainer: { backgroundColor: "#eef5ff", padding: 10, borderRadius: 10, marginTop: 5 },
    faqAnswer: { fontSize: 14, color: "#555" },

    raiseTicketButton: { backgroundColor: "#007BFF", padding: 8, borderRadius: 5, marginTop: 10, alignItems: "center" },
    raiseTicketText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

    mainRaiseTicketButton: { backgroundColor: "#007BFF", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
    mainRaiseTicketText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

    ticketItem: { backgroundColor: "#fff", padding: 15, borderRadius: 10, flexDirection: "row", justifyContent: "space-between", marginBottom: 10, elevation: 3 },
    ticketSubject: { fontSize: 16, fontWeight: "bold", color: "#333" },
    ticketStatus: { fontSize: 14, fontWeight: "bold", textTransform: 'capitalize' },
    resolvedStatus: { color: "green" },
    pendingStatus: { color: "red" },
});
