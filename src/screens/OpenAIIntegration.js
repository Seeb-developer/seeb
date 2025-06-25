import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, ScrollView, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons"; // For back button icon
import Markdown from "react-native-markdown-display";
import { apiRequest } from "../utils/api";
import { API_URL, CHAT_GPT_API_KEY } from "@env";
import { UserContext } from "../hooks/context/UserContext";
import { showToast } from "../utils/constent";
import { SafeAreaView } from "react-native-safe-area-context";
const OpenAIIntegration = ({ route }) => {
    const { userId } = useContext(UserContext);
    const { imageUrl } = route.params;
    const [responseText, setResponseText] = useState("");
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const fetchOpenAIResponse = async () => {
        setLoading(true);

        try {
            const payload = {
                user_id: userId,
                image_url: API_URL + imageUrl
            };

            const response = await apiRequest("POST", "ai-api-history/analyze-image", payload);

            if (response.status === 200 && response.data?.response) {
                setResponseText(response.data.response);
            } else {
                console.error("Unexpected response format:", response);
                setResponseText("No response received from the AI service.");
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setResponseText("Failed to load response.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenAIResponse();
    }, [imageUrl])
    const handleSaveDesign = async () => {
        try {
            // ✅ Sample payload to save design (Modify as needed)
            const data = {
                user_id: userId,
                image_path: imageUrl,
                design_text: responseText
            }


            const response = await apiRequest('POST', `selected-design/save`, data)
            if (response.status === 200) {
                showToast("success", "Design saved successfully!");
            } else {
                showToast("error", "Failed to save design. Please try again.");
            }

        } catch (error) {
            console.error("Error saving design:", error);
            showToast("error", "Something went wrong!");
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            {/* Navbar with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Image Analysis</Text>
            </View>

            {/* Display Image */}
            <Image
                source={{ uri: API_URL + imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Analyze Button */}
            {/* <Button title="Analyze Image" onPress={fetchOpenAIResponse} /> */}

            {/* Activity Indicator */}
            {loading && <ActivityIndicator size="large" color="blue" style={styles.loader} />}

            {/* Response Text */}
            <ScrollView style={styles.responseContainer}>
                <Markdown style={markdownStyles}>{responseText}</Markdown>
            </ScrollView>
            {/* ✅ Save Design Button */}
            <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSaveDesign}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>💾 Save Design</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default OpenAIIntegration;

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
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    loader: {
        marginTop: 20,
    },
    responseContainer: {
        marginTop: 20,
        padding: 15, // ✅ Adds padding inside Markdown container
        backgroundColor: "#1C1C1E", // ✅ Dark background for contrast
        borderRadius: 10, // ✅ Rounded edges
        // paddingBottom:20
    },
    saveButton: {
        backgroundColor: "#ff5733", // ✅ Green button
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
    disabledButton: {
        backgroundColor: "#444", // ✅ Grey when disabled
    },
});

const markdownStyles = {
    body: {
        color: "#E0E0E0", // ✅ Light gray text for readability
        fontSize: 16,
        lineHeight: 24,
    },
    heading1: {
        color: "#FFD700", // ✅ Gold color for main headings
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    heading2: {
        color: "#FFA500", // ✅ Orange for second-level headings
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
        color: "#FFD700", // ✅ Gold bullets
    },
    link: {
        color: "#1E90FF", // ✅ Bright blue for links
        textDecorationLine: "underline",
    },
    strong: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
};
