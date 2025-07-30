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

const TermsAndConditionsModal = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>📜 Seeb - Terms & Conditions</Text>
                        <Text style={styles.policyDate}>Last Updated: 01/03/2025</Text>
                    </View>

                    {/* Terms & Conditions Content */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.policyTitle}>1. Definitions</Text>
                        <Text style={styles.policyText}>
                            • “Seeb” refers to the company providing interior design, execution, and related services.{"\n"}
                            • “User” or “Client” refers to any person or entity using our services.{"\n"}
                            • “Service” includes all offerings by Seeb, such as AI-generated designs, execution, furniture, and custom interiors.
                        </Text>

                        <Text style={styles.policyTitle}>2. Service Agreement</Text>
                        <Text style={styles.policyText}>
                            • Our services are based on project scope, design requirements, and execution feasibility.{"\n"}
                            • A project will begin only after final approval and payment confirmation from the client.{"\n"}
                            • Changes to the project scope may result in additional charges and an extended timeline.
                        </Text>

                        <Text style={styles.policyTitle}>3. Pricing & Payments</Text>
                        <Text style={styles.policyText}>
                            • Prices are based on the chosen service and will be communicated before confirmation.{"\n"}
                            • Full or partial payment is required to confirm a booking. Payment schedules will be outlined in the agreement.{"\n"}
                            • All payments must be made via approved methods (bank transfer, UPI, credit/debit card, etc.).{"\n"}
                            • Taxes, if applicable, will be added to the final amount.
                        </Text>

                        <Text style={styles.policyTitle}>4. Cancellation & Refunds</Text>
                        <Text style={styles.policyText}>
                            • Refer to our Cancellation Policy for details. Key points include:{"\n"}
                            • Cancellations within 10 hours (if no team is assigned) are eligible for a full refund.{"\n"}
                            • Once execution has started or materials are purchased, cancellations are not allowed, and no refunds will be provided.{"\n"}
                            • Seeb reserves the right to cancel a service due to unforeseen circumstances, with a full refund issued.
                        </Text>

                        <Text style={styles.policyTitle}>5. User Responsibilities</Text>
                        <Text style={styles.policyText}>
                            • Users must provide accurate information regarding design preferences, space dimensions, and other details.{"\n"}
                            • Any delays caused by the user may affect the project timeline and cost.{"\n"}
                            • Clients must ensure that work areas are accessible and safe for our execution team.
                        </Text>

                        <Text style={styles.policyTitle}>6. Warranty & Liability</Text>
                        <Text style={styles.policyText}>
                            • Seeb provides a [X]-year warranty on specific services and products.{"\n"}
                            • We are not liable for damages caused by improper use, third-party modifications, or external factors.{"\n"}
                            • Any post-installation service requests will be handled as per the service agreement and may be chargeable.
                        </Text>

                        <Text style={styles.policyTitle}>7. Intellectual Property Rights</Text>
                        <Text style={styles.policyText}>
                            • All AI-generated designs, custom interior plans, and project documents remain the property of Seeb.{"\n"}
                            • Users may not reproduce, distribute, or modify Seeb’s designs without permission.
                        </Text>

                        <Text style={styles.policyTitle}>8. Privacy & Data Protection</Text>
                        <Text style={styles.policyText}>
                            • User data is collected and processed as per our Privacy Policy.{"\n"}
                            • We do not sell or share personal information except as necessary for service execution.
                        </Text>

                        <Text style={styles.policyTitle}>9. Dispute Resolution</Text>
                        <Text style={styles.policyText}>
                            • In case of a dispute, we encourage clients to contact us first for resolution.{"\n"}
                            • Any legal disputes will be handled under the jurisdiction of Pune, Maharashtra, India.
                        </Text>

                        <Text style={styles.policyTitle}>10. Amendments & Updates</Text>
                        <Text style={styles.policyText}>
                            • Seeb reserves the right to update these terms at any time.{"\n"}
                            • Users will be notified of major changes. Continued use of our services after updates indicates acceptance.
                        </Text>

                        <Text style={styles.policyTitle}>11. Contact Information</Text>
                        <Text style={styles.policyText}>
                            • For any questions regarding these Terms & Conditions, please contact us.
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
        // justifyContent: 'flex-end',
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: '88%',
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

export default TermsAndConditionsModal;
