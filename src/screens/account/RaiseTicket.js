import React, { useContext, useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Image,
    StyleSheet, Alert, Platform,
    ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { launchImageLibrary } from "react-native-image-picker";
import { UserContext } from "../../hooks/context/UserContext";
import { API_URL } from "@env";
import { apiRequest } from "../../utils/api";
import { SafeAreaView } from "react-native-safe-area-context";
const RaiseTicket = ({ navigation }) => {
    const [subject, setSubject] = useState("");
    const [image, setImage] = useState(null);
    const { userId } = useContext(UserContext)
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        launchImageLibrary(
            { mediaType: "photo", quality: 0.5 },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert("Error", response.errorMessage);
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    setImage(response.assets[0]);
                }
            }
        );
    };

    const uploadImages = async (img) => {
        const formData = new FormData();

        formData.append("file", {
            uri: img.uri,
            name: `image_${Date.now()}.jpg`,
            type: "image/jpeg",
        });


        try {
            const response = await fetch(API_URL + "tickets/upload-image", {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const result = await response.json();
            if (response.status === 201) {
                return result.file_path; // This should be an array of URLs
            } else {
                console.log("Upload failed", result);
                return '';
            }
        } catch (error) {
            console.error("Image upload error:", error);
            return [];
        }
    };

    const submitTicket = async () => {
        if (!subject.trim()) {
            Alert.alert("Missing Info", "Please enter the subject.");
            return;
        }

        setLoading(true);
        try {
            // Upload the image
            let uploadedImageUrls = '';
            if (image?.uri) {
                uploadedImageUrls = await uploadImages(image);
            }

            const payload = {
                user_id: userId, // Replace with actual user id
                subject: subject,
                file: uploadedImageUrls,
                status: "Open",
            };

            const response = await apiRequest("POST", "/tickets/create", payload);

            console.log(response);

            if (response.status === 201) {
                // Alert.alert("Success", "Your ticket has been submitted.");
                setSubject("");
                setImage(null);
                navigation.navigate("ChatTicket", { data: response.data || "default_id" }); // Adjust if needed
            } else {
                Alert.alert("Error", response.message || "Submission failed");
            }
        } catch (err) {
            console.error("Ticket submission failed:", err);
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Raise a Ticket</Text>
            </View>

            {/* Subject Input */}
            <TextInput
                style={styles.input}
                placeholder="Enter Subject"
                placeholderTextColor="#888"
                value={subject}
                onChangeText={setSubject}
            />

            {/* Image Preview */}
            {image && (
                <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                />
            )}

            {/* Pick Image Button */}
            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                <Text style={styles.pickImageText}>
                    {image ? "Change Screenshot" : "Attach Screenshot (Optional)"}
                </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={submitTicket}
                disabled={loading} // optional to prevent double taps
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.submitText}>Submit Ticket</Text>
                )}
            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default RaiseTicket;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f6f7fb" },

    navbar: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    backButton: { marginRight: 10 },
    headerText: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1, textAlign: "center" },

    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        color: "#333",
        marginBottom: 20,
        elevation: 2,
    },

    pickImageButton: {
        backgroundColor: "#ddd",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },

    pickImageText: { fontSize: 16, fontWeight: "bold", color: "#333" },

    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },

    submitButton: {
        backgroundColor: "#007BFF",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: "auto",
    },

    submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
