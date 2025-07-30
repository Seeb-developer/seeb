import React, { useContext, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from '../../hooks/context/UserContext';
import { auth } from '../../../firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { apiRequest } from '../../utils/api';
import Toast from 'react-native-toast-message';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

const BookingSupportReasonScreen = ({ route }) => {
    const navigation = useNavigation();
    const { booking } = route.params || {};
    const [selectedReason, setSelectedReason] = useState(null);
    const { userId } = useContext(UserContext);

    const reasons = [
        {
            id: 'payment',
            title: 'Payment Issue',
            description: 'There was a problem related to payment, such as overcharging, double payment, or refund issues.'
        },
        {
            id: 'service',
            title: 'Service not delivered as expected',
            description: 'The quality or scope of the service did not meet expectations or what was promised.'
        },
        {
            id: 'delay',
            title: 'Service was delayed',
            description: 'The service was not delivered on the scheduled time or date, causing inconvenience.'
        },
        {
            id: 'communication',
            title: 'No communication from partner',
            description: 'You didn’t receive any updates or responses from the assigned service partner.'
        },
        {
            id: 'other',
            title: 'Other Issue',
            description: 'You faced a different issue not listed above. Please provide more details when you chat with us.'
        }
    ];


    const handleProceed = async () => {
        const email = `customer_${userId}@seeb.in`;
        const password = 'seeb@chat123';

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Firebase user registered');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    console.log('✅ Firebase user logged in');
                } catch (loginErr) {
                    console.error('❌ Firebase login failed:', loginErr.code, loginErr.message);
                }
            } else {
                console.error('❌ Firebase registration failed:', err.code, err.message);
            }
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('✅ Firebase user UID:', user.uid);
                await AsyncStorage.setItem('firebase_uid', user.uid);
                // navigation.replace('DashboardStack');
            } else {
                console.log('❌ Firebase user not ready yet');
            }
        });

        if (selectedReason) {

            const payload = {
                user_type: 'customer',
                user_id: userId,
                booking_id: booking?.id,
                subject: `Issue with Booking #${booking?.booking_id}`,
                priority: 'high',
                category: selectedReason.id,
                assigned_admin_id: null,
                message: null,
                file: null
            };

            try {
                const res = await apiRequest('POST', 'tickets/create', payload); // adjust API endpoint if needed
                console.log(res.data)
                const newTicketId = res.data?.ticket_uid;
                const ticket_id = res.data?.ticket_id;
                Toast.show({ type: 'success', text1: 'Ticket created successfully' });
                const db = getFirestore();
                await addDoc(collection(db, 'tickets', newTicketId, 'messages'), {
                    user_id: auth.currentUser?.uid,
                    ticket_id: newTicketId,
                    sender_id: userId,
                    sender_type: 'admin',
                    message: `Your support ticket for booking #${booking?.booking_id} has been created under: ${selectedReason.title}. Our executive will reach out soon. Meanwhile, feel free to share more details here.`,
                    image: null, // You can also upload image if needed
                    timestamp: serverTimestamp(),
                    is_read_by_admin: false,
                    is_read_by_user: false,
                });

                navigation.navigate('ChatTicket', { ticketId: ticket_id });

            } catch (err) {
                Toast.show({ type: 'error', text1: 'Failed to create ticket' + err });

                console.error('Error submitting ticket:', err);
            }
            finally {
                // setLoading(false)
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>

                <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.header}>What's the issue with this booking?</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* 🔹 Booking Summary */}
                    <View style={styles.bookingCard}>
                        <Text style={styles.bookingText}>Booking ID: #{booking?.booking_id}</Text>
                        <Text style={styles.bookingText}>Date: {new Date(booking?.created_at).toLocaleDateString()}</Text>
                        <Text style={styles.bookingText}>Amount: ₹{booking?.final_amount}</Text>
                        <Text style={[styles.bookingText, { textTransform: "capitalize" }]}>Status: {booking?.status}</Text>
                    </View>

                    {/* 🔹 Reason List */}
                    <Text style={styles.sectionTitle}>Select a Reason</Text>
                    {reasons.map((reason) => {
                        const isSelected = selectedReason?.id === reason.id;
                        return (
                            <TouchableOpacity
                                key={reason.id}
                                style={[
                                    styles.reasonItem,
                                    isSelected && styles.reasonItemSelected
                                ]}
                                onPress={() =>
                                    setSelectedReason(isSelected ? null : reason)
                                }
                            >
                                <View style={styles.rowBetween}>
                                    <Text style={styles.reasonText}>{reason.title}</Text>
                                    <MaterialCommunityIcons
                                        name={isSelected ? "chevron-up" : "chevron-down"}
                                        size={22}
                                        color="#333"
                                    />
                                </View>

                                {isSelected && (
                                    <View style={styles.reasonExpanded}>
                                        <Text style={styles.reasonDesc}>{reason.description}</Text>

                                        <TouchableOpacity style={styles.chatButton} onPress={handleProceed}>
                                            <Text style={styles.chatButtonText}>Need Help ?</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                    {/* <Text style={styles.sectionTitle}>Past Tickets</Text>
                    <TouchableOpacity
                        style={styles.faqItem}
                        onPress={() => navigation.navigate("PreviousTickets")}
                    >
                        <Text style={styles.faqQuestion}>View Past Support Tickets</Text>
                        <MaterialCommunityIcons name='chevron-right' size={22} />
                    </TouchableOpacity> */}
                </ScrollView>
            </View>
            {/* 🔹 Header */}
        </SafeAreaView>
    );
};

export default BookingSupportReasonScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    navbar: {
        flexDirection: "row", alignItems: "center",
        padding: 15, backgroundColor: "#fff"
    },
    header: {
        fontSize: 16, fontWeight: "bold", flex: 1, textAlign: "center", color: "#333"
    },
    content: { padding: 20 },
    bookingCard: {
        backgroundColor: "#fff", padding: 15,
        borderRadius: 10, marginBottom: 20, elevation: 2
    },
    bookingText: { fontSize: 14, color: "#333", marginBottom: 5 },
    sectionTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10, color: "#333" },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reasonItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
        marginBottom: 14,
        borderRadius: 8,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.2,
        // shadowRadius: 2,
        // elevation: 3,
    },

    reasonItemSelected: {
        backgroundColor: '#f9f9f9',
        borderColor: '#007BFF',
        borderWidth: 1,
    },

    reasonText: {
        fontSize: 14,
        fontWeight: '500',
    },

    reasonExpanded: {
        marginTop: 8,
    },

    reasonDesc: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },

    chatButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },

    chatButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    faqItem: {
        flexDirection: "row", justifyContent: "space-between",
        backgroundColor: "#fff", padding: 12, borderRadius: 8,
        marginBottom: 10
    },
    faqQuestion: {
        fontSize: 14, fontWeight: '500', color: "#000"
    },

});
