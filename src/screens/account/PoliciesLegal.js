import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CancellationPolicyModal from "../../component/model/CancellationPolicyModal";
import TermsAndConditionsModal from "../../component/model/TermsAndConditionsModal";
import PrivacyPolicyModal from "../../component/model/PrivacyPolicyModal";
import { SafeAreaView } from "react-native-safe-area-context";

const PoliciesLegal = ({ navigation }) => {
    const [isTermsModalVisible, setTermsModalVisible] = useState(false);
    const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [isRefundModalVisible, setRefundModalVisible] = useState(false);
    const [isGuidelinesModalVisible, setGuidelinesModalVisible] = useState(false);
    const [isIPRModalVisible, setIPRModalVisible] = useState(false);
    const [isSecurityModalVisible, setSecurityModalVisible] = useState(false);
    

    return (
        <SafeAreaView style={styles.container}>
            {/* ✅ Seeb Full-Width Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Policies & Legal</Text>
            </View>


            {/* ✅ Policy List */}
            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.policyItem} onPress={() => setTermsModalVisible(true)}>
                    <MaterialIcons name="article" size={22} color="#007BFF" />
                    <Text style={styles.policyText}>Terms & Conditions</Text>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.policyItem} onPress={() => setPrivacyModalVisible(true)}>
                    <MaterialCommunityIcons name="shield-lock" size={22} color="#007BFF" />
                    <Text style={styles.policyText}>Privacy Policy</Text>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.policyItem} onPress={() => setRefundModalVisible(true)}>
                    <MaterialCommunityIcons name="credit-card-off" size={22} color="#007BFF" />
                    <Text style={styles.policyText}>Cancellation & Refund Policy</Text>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.policyItem} onPress={() => setGuidelinesModalVisible(true)}>
                    <MaterialIcons name="info-outline" size={22} color="#007BFF" />
                    <Text style={styles.policyText}>User Guidelines</Text>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.policyItem} onPress={() => setIPRModalVisible(true)}>
                    <MaterialCommunityIcons name="copyright" size={22} color="#007BFF" />
                    <Text style={styles.policyText}>Intellectual Property Rights</Text>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.policyItem} onPress={() => setPrivacyModalVisible(true)}>
                    <MaterialIcons name="security" size={22} color="#007BFF" />
                    <Text style={styles.policyText}>Data Protection & Security</Text>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>
            </ScrollView>
            <CancellationPolicyModal visible={isRefundModalVisible} onClose={() => setRefundModalVisible(false)} />
            <TermsAndConditionsModal visible={isTermsModalVisible} onClose={() => setTermsModalVisible(false)} />
            <PrivacyPolicyModal visible={isPrivacyModalVisible} onClose={() => setPrivacyModalVisible(false)} />
        </SafeAreaView>
    );
};

export default PoliciesLegal;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    navbar: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff", elevation: 3 },
    backButton: { marginRight: 10 },
    headerText: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1, textAlign: "center" },
    content: { padding: 20, flexGrow: 1 },
    policyItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 3,
    },
    policyText: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1, marginLeft: 10 },
});
