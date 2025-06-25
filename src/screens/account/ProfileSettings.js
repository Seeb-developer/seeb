import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, FlatList, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { UserContext } from "../../hooks/context/UserContext";
import { apiRequest } from "../../utils/api";
import { showToast } from "../../utils/constent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useFetchAddresses from "../../hooks/address/useFetchAddresses";
import NewAddressModal from "../../component/model/NewAddressModal";
import useAddAddress from "../../hooks/address/useAddAddress";
import useDeleteAddress from "../../hooks/address/useDeleteAddress";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileSettings = ({ navigation }) => {
    const { userId, username, mobileNo, setUserName, setMobileNo, setIsLoggedIn } = useContext(UserContext);
    const [name, setName] = useState(username);
    const [phone, setPhone] = useState(mobileNo);
    const { addresses, fetchAddresses } = useFetchAddresses(userId);
    const { addAddress } = useAddAddress();
    const { deleteAddress } = useDeleteAddress();

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [newAddressModalVisible, setNewAddressModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim() || !phone.trim()) {
            showToast("error", "Name and phone cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            const response = await apiRequest("POST", "/seeb-user/updateProfile", {
                user_id: userId,
                name,
                mobileNo: phone,
            });

            if (response.status === 200) {
                setUserName(name);
                setMobileNo(phone);
                showToast("success", "Profile updated successfully!");
            } else {
                showToast("error", response.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Profile Update Error:", error);
            showToast("error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    setLoading(true);
                    await AsyncStorage.removeItem("@user");
                    setIsLoggedIn(false);
                    setUserName(null);
                    setMobileNo(null);
                    setLoading(false);
                    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                },
            },
        ]);
    };

    const confirmDelete = (id, event) => {
        event.stopPropagation(); // Prevent parent touch event
        Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => handleDeleteAddress(id) },
        ]);
    };

    const handleDeleteAddress = (id) => {
        deleteAddress(id, () => {
            fetchAddresses();
        });
       
    };

    useEffect(() => {
        if (addresses.length > 0) {
            const defaultAddress = addresses.find(address => address.is_default) || addresses[0]; // Choose default or first
            setSelectedAddressId(defaultAddress.id);
        }
    }, [addresses]);

    return (
        <SafeAreaView style={styles.container}>
            {/* ✅ Simple Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Profile Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* ✅ Profile Info Card */}
                <View style={styles.profileCard}>
                    <Text style={styles.userName}>{username}</Text>
                    <Text style={styles.userPhone}>{mobileNo}</Text>
                </View>

                {/* ✅ Form Fields */}
                <View style={styles.form}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        keyboardType="numeric"
                    />
                </View>

                {/* ✅ Save Address Section */}
                <Text style={styles.label}>Saved Addresses</Text>

                {/* "Add New Address" Button */}
                <TouchableOpacity style={styles.addAddressButton} onPress={() => setNewAddressModalVisible(true)}>
                    <Icon name="add-location-alt" size={22} color="#007BFF" />
                    <Text style={styles.addAddressText}>Add New Address</Text>
                </TouchableOpacity>

                {/* Address List */}
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.addressWrapper}>
                            <TouchableOpacity
                                style={styles.addressItem}
                                onPress={() => setSelectedAddressId(item?.id)}
                            >
                                <View style={[styles.circle, selectedAddressId === item?.id && styles.circleSelected]}>
                                    {selectedAddressId === item?.id && <Icon name="check" size={14} color="#fff" />}
                                </View>
                                <View style={styles.addressDetails}>
                                    <Text style={styles.addressTitle}>{item?.address_label}</Text>
                                    <Text style={styles.addressText}>{item?.house}, {item?.address}</Text>
                                </View>
                                <TouchableOpacity onPress={(event) => confirmDelete(item?.id, event)} style={{ }}>
                                    <Icon name="more-vert" size={24} color="#007BFF" />
                                </TouchableOpacity>

                            </TouchableOpacity>
                        </View>
                    )}
                />

                {/* ✅ Save Changes Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
                    <Text style={styles.saveButtonText}>{loading ? "Updating..." : "Save Changes"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                    <Feather name="log-out" size={22} color="#d9534f" />
                    <Text style={styles.menuText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
            <NewAddressModal
                visible={newAddressModalVisible}
                onClose={() => setNewAddressModalVisible(false)}
                onSave={(addressData) => {
                    addAddress(userId, { ...addressData }, () => {
                        // console.log("New address saved");
                        fetchAddresses();
                        setNewAddressModalVisible(false)
                    });
                }}
            />

        </SafeAreaView>
    );
};

export default ProfileSettings;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    navbar: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff", elevation: 3 },
    backButton: { marginRight: 10 },
    headerText: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1, textAlign: "center" },
    content: { padding: 20, flexGrow: 1 },
    profileCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20, elevation: 5 },
    userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
    userPhone: { fontSize: 14, color: "#666", marginTop: 5 },
    label: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 5 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, backgroundColor: "#f9f9f9" },
    addAddressButton: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#E3F2FD", borderRadius: 8, marginBottom: 10 },
    addAddressText: { fontSize: 16, color: "#007BFF", marginLeft: 8 },
   
    addressWrapper: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#f9f9f9',
        // padding: 12,
        borderRadius: 8,
    },
    addressDetails: {
        flex: 1,
        marginLeft: 10,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#007BFF", alignItems: "center", justifyContent: "center" },
    circleSelected: { backgroundColor: "#007BFF" },
    saveButton: {
        backgroundColor: "#ff5733",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        marginTop: 10
    },
    menuText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#d9534f",
        marginLeft: 10,
    },

});
