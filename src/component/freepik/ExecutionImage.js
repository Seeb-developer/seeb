import { View, FlatList, TouchableOpacity, StyleSheet, Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import FastImage from 'react-native-fast-image';
import Ionicons from "react-native-vector-icons/Ionicons";
import { apiRequest, downloadImageUrl } from '../../utils/api';
import { API_URL } from "@env";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../hooks/context/UserContext';

const ExecutionImage = ({ setIsViewerVisible, setSelectedImage, setIndex }) => {
    const navigation = useNavigation();
    const [executionData, setExecutionData] = useState([]);
    const { userId } = useContext(UserContext);

    const getSaveData = async () => {
        try {
            const response = await apiRequest('GET', `selected-design/${userId}`);
            if (response.status === 200) {
                setExecutionData(response.data);  // Store the full response
            } else {
                console.warn("No saved data found.");
            }
        } catch (error) {
            console.error("Error fetching saved data:", error);
        }
    };

    useEffect(() => {
        getSaveData();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={executionData}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No designs available</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => navigation.navigate('DesignDetailsScreen', { designData: item })} // Pass full item
                    >
                        {/* Image Display */}
                        <FastImage source={{ uri: API_URL+ item.image_path }} style={styles.historyImage} />

                        {/* Download Button */}
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => downloadImageUrl(API_URL + item.image_path)}
                        >
                            <Ionicons name="cloud-download-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
    },
    listContainer: {
        paddingBottom: 100,
    },
    imageContainer: {
        flex: 1,
        margin: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 3,
        position: "relative",
    },
    historyImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        resizeMode: "cover"
    },
    downloadButton: {
        position: "absolute",
        bottom: 8,
        right: 10,
        padding: 8,
        backgroundColor: "#007bff",
        borderRadius: 20
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#888", // Light gray text for better readability
        fontStyle: "italic",
    },
});

export default ExecutionImage;
