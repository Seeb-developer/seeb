import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons"; // Back button icon
import Markdown from "react-native-markdown-display";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";

const DesignDetailsScreen = ({ route }) => {
    const { designData } = route.params; // Get all details
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Navbar with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Design Details</Text>
            </View>

            {/* Display Image */}
            <Image source={{ uri: API_URL + designData.image_path }} style={styles.image} resizeMode="cover" />

            {/* Response Text */}
            <ScrollView style={styles.responseContainer}>
                <Markdown style={markdownStyles}>{designData.text}</Markdown>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DesignDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#000",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backButton: {
        marginRight: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    image: {
        width: "100%",
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    responseContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "#1C1C1E",
        borderRadius: 10,
    },
});

const markdownStyles = {
    body: {
        color: "#E0E0E0",
        fontSize: 16,
        lineHeight: 24,
    },
    heading1: {
        color: "#FFD700",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    heading2: {
        color: "#FFA500",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    bullet_list: {
        color: "#E0E0E0",
        fontSize: 16,
        marginLeft: 10,
    },
    bullet_list_icon: {
        color: "#FFD700",
    },
    link: {
        color: "#1E90FF",
        textDecorationLine: "underline",
    },
    strong: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
};
