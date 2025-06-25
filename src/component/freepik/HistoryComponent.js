import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image';
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { downloadImageUrl } from '../../utils/api';
import { API_URL } from "@env";
import { width } from '../../utils/constent';
import { UserContext } from '../../hooks/context/UserContext';
import { useNavigation } from '@react-navigation/native';

const HistoryComponent = ({ saveData, setSelectedImage, setIsViewerVisible, setIndex, executionData }) => {

    const [history, setHistory] = useState([]);
    const { userId } = useContext(UserContext)
    const [loadingHistory, setLoadingHistory] = useState(false);
      const navigation = useNavigation();

    const getHistory = async () => {
        setLoadingHistory(true);
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        try {
            const response = await fetch(`${API_URL}freepik-api/user/${userId}`, requestOptions);
            const result = await response.json();  // Convert response to JSO

            // Ensure result is an array and update history state
            if (Array.isArray(result.data)) {
                const formattedHistory = result.data.map(item => ({
                    ...item,
                    images: JSON.parse(item.images)  // Parse the 'images' string as JSON
                }));
                setHistory(formattedHistory);
            } else {
                console.warn("Unexpected response format", result);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
        finally {
            setLoadingHistory(false);
        }
    };


    useEffect(() => {
        getHistory()
    }, [])
    return (
        <View style={{}}>
            {loadingHistory ? <ActivityIndicator size='large' color='#007bff' /> : (
                <FlatList
                    data={history}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View >
                            <Text style={{ color: "#000", fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 5 }}>{item.prompt}</Text>
                            <FlatList
                                data={item.images}
                                // horizontal
                                keyExtractor={(img, imgIndex) => imgIndex.toString()}
                                renderItem={({ item: img, index }) => (
                                    <TouchableOpacity
                                        style={styles.imageContainer}
                                        onPress={() => {
                                            const formattedImages = item.images.map(img => ({ url: API_URL + img }));
                                            setSelectedImage(formattedImages);
                                            setIsViewerVisible(true);
                                            setIndex(index);
                                        }}
                                    >
                                        <FastImage source={{ uri: API_URL + img }} style={styles.historyImage} />

                                        {/* Bottom Background Container */}
                                        <View style={styles.bottomContainer}>
                                            {/* AI Analyze Button */}
                                            <TouchableOpacity
                                                style={styles.analyzeButton}
                                                onPress={() =>  navigation.navigate('OpenAIIntegration', { imageUrl:  img })}
                                            >
                                                <Text style={styles.analyzeText}>Analyze Design with AI</Text>
                                                <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                                            </TouchableOpacity>

                                            {/* Download Button */}
                                            <TouchableOpacity
                                                style={styles.downloadButton}
                                                onPress={() => downloadImageUrl(API_URL + img)}
                                            >
                                                <Ionicons name="cloud-download-outline" size={24} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>


                                )}
                            />
                        </View>
                    )}
                />
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    imageContainer: { marginHorizontal: 10, marginVertical: 10, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3, position: "relative" },
    image: { width: '100%', height: width, },
    historyTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 5 },
    historyImage: { width: '100%', height: width * 0.65, marginRight: 5, borderRadius: 8, resizeMode: 'contain' },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",  // Semi-transparent background
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    analyzeButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    analyzeText: {
        color: "#fff",
        fontSize: 14,
        marginRight: 5,
    },
    downloadButton: {
        padding: 8,
        backgroundColor: "#007bff", 
        borderRadius: 20
    },
    // downloadButton: { position: "absolute", bottom: 8, right: 10, padding: 8, backgroundColor: "#007bff", borderRadius: 20 },
});

export default HistoryComponent