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

const PrivacyPolicyModal = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>🔒 Seeb - Privacy Policy</Text>
                        <Text style={styles.policyDate}>Last Updated: 01/03/2025</Text>
                    </View>

                    {/* Privacy Policy Content */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.policyTitle}>1. Information We Collect</Text>
                        <Text style={styles.policyText}>
                            We collect different types of information, including:
                        </Text>
                        
                        <Text style={styles.policySubtitle}>1.1 Personal Information</Text>
                        <Text style={styles.policyText}>
                            When you register, book a service, or interact with us, we may collect:{"\n"}
                            • Name{"\n"}
                            • Email address{"\n"}
                            • Phone number{"\n"}
                            • Address{"\n"}
                            • Payment information
                        </Text>

                        <Text style={styles.policySubtitle}>1.2 Non-Personal Information</Text>
                        <Text style={styles.policyText}>
                            We may collect non-identifiable data, such as:{"\n"}
                            {/* • Device information (IP address, browser type, operating system){"\n"} */}
                            • Usage data (pages visited, time spent on the website/app){"\n"}
                            • Cookies and tracking technologies
                        </Text>

                        <Text style={styles.policyTitle}>2. How We Use Your Information</Text>
                        <Text style={styles.policyText}>
                            We use your information to:{"\n"}
                            • Provide and improve our services{"\n"}
                            • Process transactions and payments{"\n"}
                            • Respond to inquiries and customer service requests{"\n"}
                            • Send updates, promotions, and service notifications{"\n"}
                            • Enhance security and prevent fraudulent activities{"\n"}
                            • Analyze usage patterns to improve our platform
                        </Text>

                        <Text style={styles.policyTitle}>3. How We Share Your Information</Text>
                        <Text style={styles.policyText}>
                            We do not sell or rent your personal data. However, we may share it with:{"\n"}
                            • <Text style={styles.boldText}>Service Providers:</Text> Third-party partners who assist in delivering services (e.g., payment processors, delivery partners).{"\n"}
                            • <Text style={styles.boldText}>Legal Authorities:</Text> If required by law, regulation, or to protect our rights and users.{"\n"}
                            • <Text style={styles.boldText}>Business Transfers:</Text> In case of a merger, acquisition, or business restructuring.
                        </Text>

                        <Text style={styles.policyTitle}>4. Data Security</Text>
                        <Text style={styles.policyText}>
                            We implement industry-standard security measures to protect your data. However, no online platform is 100% secure. We recommend using strong passwords and safeguarding your account credentials.
                        </Text>

                        <Text style={styles.policyTitle}>5. Cookies & Tracking Technologies</Text>
                        <Text style={styles.policyText}>
                            We use cookies and similar technologies to:{"\n"}
                            • Remember user preferences{"\n"}
                            • Analyze site traffic{"\n"}
                            • Improve user experience{"\n"}
                            You can disable cookies through your browser settings, but some features may not function properly.
                        </Text>

                        <Text style={styles.policyTitle}>6. Your Rights & Choices</Text>
                        <Text style={styles.policyText}>
                            Depending on your location, you may have the right to:{"\n"}
                            • Access, update, or delete your personal data{"\n"}
                            • Opt-out of marketing communications{"\n"}
                            • Request data portability{"\n"}
                            • Restrict data processing in certain cases{"\n"}
                            To exercise your rights, contact us at [Insert Contact Email].
                        </Text>

                        <Text style={styles.policyTitle}>7. Third-Party Links & Services</Text>
                        <Text style={styles.policyText}>
                            Our platform may contain links to third-party sites. We are not responsible for their privacy practices, and we encourage you to read their policies before interacting with them.
                        </Text>

                        <Text style={styles.policyTitle}>8. Children's Privacy</Text>
                        <Text style={styles.policyText}>
                            Our services are not intended for children under 13. We do not knowingly collect personal data from minors. If we discover such data, we will delete it immediately.
                        </Text>

                        <Text style={styles.policyTitle}>9. Changes to This Policy</Text>
                        <Text style={styles.policyText}>
                            We may update this policy periodically. Any changes will be posted on this page, and we encourage you to review it regularly.
                        </Text>

                        <Text style={styles.policyTitle}>10. Contact Us</Text>
                        <Text style={styles.policyText}>
                            For any questions or concerns about this Privacy Policy, contact us at [Insert Contact Email].
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
    policySubtitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#555",
        marginTop: 8,
    },
    policyText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 10,
    },
    boldText: {
        fontWeight: "bold",
        color: "#333",
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

export default PrivacyPolicyModal;
