import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ProceedToPayModal = ({ visible, onClose, totalAmount, onConfirmPayment }) => {
    const [selectedPayment, setSelectedPayment] = useState(null);

    const paymentMethods = [
        { id: "online", name: "Pay Online (Razorpay)", icon: "credit-card" },
        { id: "pay_later", name: "Pay Later (Cash or Online)", icon: "event-note" }
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>

                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>💳 Proceed to Pay</Text>
                    </View>

                    {/* Total Amount Display */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.totalText}>Total Payable: ₹{totalAmount.toFixed(2)}</Text>
                    </View>

                    {/* Payment Method Selection */}
                    <Text style={styles.paymentTitle}>Select Payment Method</Text>
                    <ScrollView>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentOption,
                                    selectedPayment === method.id && styles.selectedPayment
                                ]}
                                onPress={() => setSelectedPayment(method.id)}
                            >
                                <Icon name={method.icon} size={22} color="#007BFF" />
                                <Text style={styles.paymentText}>{method.name}</Text>
                                {selectedPayment === method.id && <Icon name="check-circle" size={20} color="#007BFF" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Confirm Button */}
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            !selectedPayment && styles.disabledButton // Disable style if no payment selected
                        ]}
                        disabled={!selectedPayment} // Disable if no selection
                        onPress={() => {
                            if (selectedPayment) {
                                onConfirmPayment(selectedPayment);
                                onClose();
                            }
                        }}
                    >
                        <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    closeIcon: {
        bottom: 10,
        alignSelf: "flex-end",
        right: 18,
        zIndex: 10,
        backgroundColor: "#fff",
        padding: 6, // Reduced padding
        borderRadius: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 18, // Slightly reduced padding
        maxHeight: "85%",
        elevation: 10,
        minHeight: "60%",
    },
    header: {
        alignItems: "center",
        marginVertical: 10, // Reduced margin
    },
    headerTitle: {
        fontSize: 18, // Reduced from 18
        fontWeight: "bold",
        color: "#333",
    },
    amountContainer: {
        backgroundColor: "#f9f9f9",
        padding: 10, // Reduced padding
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 12, // Reduced margin
    },
    totalText: {
        fontSize: 16, // Reduced from 18
        fontWeight: "bold",
        color: "#000",
    },
    paymentTitle: {
        fontSize: 14, // Reduced from 16
        fontWeight: "bold",
        marginBottom: 8, // Reduced margin
        color: "#333",
    },
    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f3f3",
        padding: 10, // Reduced padding
        borderRadius: 8,
        marginBottom: 8, // Reduced margin
    },
    selectedPayment: {
        borderWidth: 2,
        borderColor: "#007BFF",
        backgroundColor: "#E3F2FD",
    },
    paymentText: {
        flex: 1,
        fontSize: 14, // Reduced from 16
        color: "#333",
        marginLeft: 8, // Reduced margin
    },
    confirmButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 10, // Reduced padding
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8, // Reduced margin
    },
    disabledButton: {
        backgroundColor: "#ddd", // Light gray when disabled
    },
    confirmButtonText: {
        fontSize: 14, // Reduced from 16
        fontWeight: "bold",
        color: "#fff",
    },
});




export default ProceedToPayModal;
