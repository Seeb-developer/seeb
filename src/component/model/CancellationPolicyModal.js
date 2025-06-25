import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { height } from "../../utils/constent";

const CancellationPolicyModal = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>🔄 Seeb Services Cancellation Policy</Text>
                        <Text style={styles.policyDate}>Last Updated: 01/03/2025</Text>
                    </View>

                    {/* Policy Content */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.policyTitle}>1. Cancellation Before Service Initiation</Text>
                        <Text style={styles.policyText}>
                            • If you cancel within 10 hours of booking and no team has been assigned, you receive a full refund.{"\n"}
                            • If a team has been assigned but work has not begun, a cancellation fee may apply.
                        </Text>

                        <Text style={styles.policyTitle}>2. Cancellation After Service Has Started</Text>
                        <Text style={styles.policyText}>
                            • Cancellations are not permitted once execution begins.{"\n"}
                            • No refunds if site work has started, materials are purchased, or customized items are processed.{"\n"}
                            • You are responsible for material and labor costs incurred.
                        </Text>

                        <Text style={styles.policyTitle}>3. Cancellation by Seeb</Text>
                        <Text style={styles.policyText}>
                            • Seeb reserves the right to cancel due to unavailability, force majeure, or violation of terms.{"\n"}
                            • If Seeb cancels, you receive a full refund or an alternative service option.
                        </Text>

                        <Text style={styles.policyTitle}>4. Refund Policy</Text>
                        <Text style={styles.policyText}>
                            • Full refunds are only for cancellations within 10 hours if no team is assigned.{"\n"}
                            • Refunds take 7-14 business days via the original payment method.{"\n"}
                            • Non-refundable fees (e.g., consultation/design) are communicated upfront.
                        </Text>

                        <Text style={styles.policyTitle}>5. Service Modifications</Text>
                        <Text style={styles.policyText}>
                            • To modify a service, contact us at least [X] days in advance. Additional costs may apply.
                        </Text>

                        <Text style={styles.policyTitle}>6. Contact for Cancellations</Text>
                        <Text style={styles.policyText}>
                            • To cancel or modify a service, please reach out to our support team.
                        </Text>
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                        <Text style={styles.confirmButtonText}>Close</Text>
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
        height: height,
    },
    closeIcon: {
        bottom: 10,
        alignSelf: "flex-end",
        right: 18,
        zIndex: 10,
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: "90%",
        elevation: 10,
    },
    header: {
        alignItems: "center",
        marginVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    policyDate: {
        fontSize: 14,
        color: "#666",
        marginTop: 3,
    },
    policyTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10,
    },
    policyText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 10,
    },
    confirmButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default CancellationPolicyModal;
