import React, { useContext, useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, Image, ScrollView, Alert, StyleSheet, FlatList, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Top, width } from "../utils/constent";
import NavBar from "../component/header/NavBar";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import RNFS from 'react-native-fs';
import { API_URL } from "@env";
import { UserContext } from "../hooks/context/UserContext";
import mime from "mime";
import RNFetchBlob from 'react-native-blob-util';
import ImageViewerModal from "../component/imagezoom/ImageViewerModal";
import Inspiration from "../component/freepik/Inspiration";
import ImageGenerater from "../component/freepik/ImageGenerater";
import HistoryComponent from "../component/freepik/HistoryComponent";
import CustomToast from "../component/model/CustomToast";
import ExecutionImage from "../component/freepik/ExecutionImage";
import { apiRequest } from "../utils/api";
import { SafeAreaView } from "react-native-safe-area-context";

const FreepikAIImageGenerator = (props) => {

    const { text } = props.route?.params || ''
    const [prompt, setPrompt] = useState(text);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { userId } = useContext(UserContext)
    const navigation = useNavigation();
    const [visibleSection, setVisibleSection] = useState('inspriration')
    const [toastVisible, setToastVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [index, setIndex] = useState(0)
    const [executionData, setExecutionData] = useState([]);

    const [imageCount, setImageCount] = useState(null); // Store request count

    const showToast = () => {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    };

    const generateImage = async (append = false) => {
        setVisibleSection('aiimages');
        if (!prompt.trim()) {
            Alert.alert("Error", "Please enter a prompt.");
            return;
        }
        setLoading(true);
        try {
            const response = await apiRequest("POST", "freepik-api/image-generate", {
                user_id: userId,
                prompt: prompt,
                type: "search"
            });

            if (response.status === 201 && response.data?.images) {
                const storedImages = response.data.images.map(imgPath => ({
                    url: `${API_URL}${imgPath}`
                }));
                setImages(append ? prevImages => [...prevImages, ...storedImages] : storedImages);
                setImageCount(prev => (prev !== null ? prev + storedImages.length : storedImages.length));
            } else if (response.status === 403) {
                Alert.alert("Error", "You have reached the maximum number of requests. Please try again later.");
            } else {
                Alert.alert("Error", response.message || "Failed to generate images.");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            Alert.alert("Error", "Something went wrong!");
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        if (text) generateImage()
    }, [])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <NavBar title="AI Design Generator" press={() => navigation.goBack(null)} />
                <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={[styles.optionButton, visibleSection == 'inspriration' && styles.selectedButton]}
                                onPress={() => {
                                    setVisibleSection('inspriration')
                                }}>
                                <Ionicons name="bulb-outline" size={20} color="#fff" />
                                <Text style={styles.optionText}>Prompt</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.optionButton, visibleSection === 'aiimages' && styles.selectedButton]}
                                onPress={() => {
                                    setVisibleSection('aiimages');
                                }}>
                                <Ionicons name="sparkles-outline" size={20} color="#fff" />
                                <Text style={styles.optionText}>AI Design</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton, visibleSection == 'execution' && styles.selectedButton]}
                                onPress={() => {
                                    setVisibleSection('execution')
                                }}>
                                <Ionicons name="time-outline" size={20} color="#fff" />
                                <Text style={styles.optionText}>Saved Designs</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton, visibleSection == 'history' && styles.selectedButton]}
                                onPress={() => {
                                    setVisibleSection('history')
                                }}>
                                <Ionicons name="document-text-outline" size={20} color="#fff" />
                                <Text style={styles.optionText}>History</Text>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </View>

                {/* ScrollView for Images */}
                <View style={{ marginBottom: 100 }}>
                    {visibleSection == 'inspriration' &&
                        <Inspiration
                            // // saveData={saveData}
                            // executionData={executionData}
                            setIndex={setIndex}
                            setSelectedImage={setSelectedImage}
                            setIsViewerVisible={setIsViewerVisible}
                            setVisibleSection={setVisibleSection}
                            setPrompt={setPrompt}
                        />
                    }
                    {visibleSection == 'aiimages' &&
                        <ImageGenerater
                            // saveData={saveData}
                            // executionData={executionData}
                            generateImage={generateImage}
                            images={images}
                            loading={loading}
                            setSelectedImage={setSelectedImage}
                            setIsViewerVisible={setIsViewerVisible}
                            setIndex={setIndex}
                        />
                    }
                    {visibleSection == 'history' &&
                        <HistoryComponent
                            // saveData={saveData}
                            // executionData={executionData}
                            setSelectedImage={setSelectedImage}
                            setIsViewerVisible={setIsViewerVisible}
                            setIndex={setIndex}
                        />
                    }

                    {visibleSection == 'execution' &&
                        <ExecutionImage
                            // saveData={saveData}
                            // executionData={executionData}
                            setSelectedImage={setSelectedImage}
                            setIsViewerVisible={setIsViewerVisible}
                            setIndex={setIndex}
                        />
                    }

                </View>
                {toastVisible &&
                    <CustomToast message="Great choice! Your selected design is now locked for execution." visible={toastVisible} />
                }
                {/* Image Viewer Modal */}
                <ImageViewerModal isViewerVisible={isViewerVisible} setIsViewerVisible={setIsViewerVisible} images={selectedImage} index={index} />

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Enter prompt..."
                        value={prompt}
                        onChangeText={setPrompt}
                        style={styles.input}
                        placeholderTextColor="#888" // Add placeholder color for better visibility
                    />
                    <TouchableOpacity onPress={() => generateImage()} style={{ marginLeft: 10 }}>
                        {loading ? (
                            <Ionicons name="refresh" size={28} color="#007bff" />
                        ) : (
                            <Ionicons name="send" size={28} color="#007bff" />
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingTop: Top,
    },
    optionsContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        marginHorizontal: 10
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ADD8E6',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 8,
        marginRight: 10,
    },
    optionText: { color: "#fff", fontSize: 12, fontWeight: 'bold', marginLeft: 5 },

    inputContainer: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 5,
        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Offset for shadow
        shadowOpacity: 0.1, // Shadow opacity (opacity is 0 for no shadow)
        shadowRadius: 4, // Blur radius for shadow
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,  // Increase padding to make TextInput taller
        paddingHorizontal: 10, // Make sure there's padding inside the input
        backgroundColor: '#fff', // Optional: Background color for input
        borderRadius: 8, // Rounded corners for input
        color: '#000', //
    },
    selectedButton: {
        backgroundColor: "#007AFF", // Highlight color for selected button
    },
});

export default FreepikAIImageGenerator;
