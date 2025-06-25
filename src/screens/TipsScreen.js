import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiRequest } from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import RoomSelectionModal from '../component/model/RoomSelectionModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Top } from '../utils/constent';

const TipsScreen = () => {
    const [roomsData, setRoomsData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTipType, setSelectedTipType] = useState('image');
    const navigation = useNavigation();
    // Fetch room data from API
    const fetchRoomData = async () => {
        try {
            const response = await apiRequest('GET', 'rooms');
            if (response.status === 200) {
                setRoomsData(response.data)
            }
        } catch (error) {
            console.error('Error fetching room data:', error);
        }
    }
    useEffect(() => {
        fetchRoomData();
    }, [])

    const onRoomSelectRoom = (roomId) => {
        switch (selectedTipType) {
            case 'image':
                navigation.navigate('ImageTipDetails', { roomId: roomId });
                break;
            case 'video':
                navigation.navigate('VideoTipDetails', { roomId: roomId });
                break;
            case 'howseebworks':
                navigation.navigate('HowSeebWorksTipDetails', { roomId: roomId });
                break;
            default:
        }
    }
    return (
        // <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                 <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={styles.headerTitle}>💡 Interior Design Tips</Text>

                    {/* Three Buttons with Descriptions */}
                    <View style={styles.buttonContainer}>
                        {/* Image Tips */}
                        <TouchableOpacity style={styles.optionButton} onPress={() => {
                            setModalVisible(true);
                            setSelectedTipType('image');
                        }} >
                            <Icon name="image" size={28} color="#fff" />
                            <Text style={styles.buttonText}>Image Tips</Text>
                        </TouchableOpacity>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionTitle}>📌 What it does:</Text>
                            <Text style={styles.descriptionText}>
                                Explore a gallery of curated interior design images with before-and-after transformations.
                            </Text>
                            <Text style={styles.descriptionTitle}>📌 How to use it:</Text>
                            <Text style={styles.descriptionText}>
                                Click "Image" to browse design images, swipe to enlarge, and save your favorites.
                            </Text>
                        </View>

                        {/* Video Tips */}
                        <TouchableOpacity style={styles.optionButton} onPress={() => {
                            setModalVisible(true);
                            setSelectedTipType('video');
                        }} >
                            <Icon name="video" size={28} color="#fff" />
                            <Text style={styles.buttonText}>Video Tips</Text>
                        </TouchableOpacity>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionTitle}>📌 What it does:</Text>
                            <Text style={styles.descriptionText}>
                                Watch step-by-step tutorials, DIY décor tips, and real project walkthroughs.
                            </Text>
                            <Text style={styles.descriptionTitle}>📌 How to use it:</Text>
                            <Text style={styles.descriptionText}>
                                Click "Video" to explore tutorials, choose categories, and watch styling guides.
                            </Text>
                        </View>

                        {/* How Seeb Works */}
                        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('HowSeebWorksTipDetails')} >
                            <Icon name="home-city" size={28} color="#fff" />
                            <Text style={styles.buttonText}>How Seeb Works</Text>
                        </TouchableOpacity>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionTitle}>📌 What it does:</Text>
                            <Text style={styles.descriptionText}>
                                Learn how Seeb’s AI-powered designs and expert team create dream interiors.
                            </Text>
                            <Text style={styles.descriptionTitle}>📌 How to use it:</Text>
                            <Text style={styles.descriptionText}>
                                Click "How Seeb Works" to understand our workflow and contact us for a consultation.
                            </Text>
                        </View>
                    </View>
                    <RoomSelectionModal
                        roomsData={roomsData}
                        onRoomSelectRoom={onRoomSelectRoom}
                        roomType="Commercial"  // Fixed type
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        title='References Design Spacewise'
                    />

                    {/* Explore More Button */}
                    {/* <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>Explore More Tips</Text>
                <Icon name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity> */}
                </ScrollView>
            </View>
        // </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
        // padding: 15,
        paddingTop: Top 
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginVertical: 15,
    },
    buttonContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 10,
        width: "90%",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    descriptionContainer: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginVertical: 5,
        width: "90%",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    descriptionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 3,
    },
    descriptionText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    exploreButton: {
        flexDirection: "row",
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    exploreButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginRight: 8,
    }
});

export default TipsScreen;
