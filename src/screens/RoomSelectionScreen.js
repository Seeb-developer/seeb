import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { API_URL } from '@env';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { apiRequest } from '../utils/api';
import NavBar from '../component/header/NavBar';
import { Top } from '../utils/constent';

const RoomSelectionScreen = () => {
    const navigation = useNavigation();

    const [roomsData, setRoomsData] = useState([]);
    const [title, setTitle] = useState("Pick a Space to Get Started");

    const [selectedType, setSelectedType] = useState('residential');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomSize, setRoomSize] = useState({ width: '', height: '' });

    const filteredRooms = roomsData.filter(room => room.type.toLowerCase() === selectedType) || [];

    useEffect(() => {
        setSelectedType('residential');
        getAllRooms();
    }, []);

    const getAllRooms = async () => {
        const response = await apiRequest('GET', 'rooms');
        if (response.status === 200) {
            setRoomsData(response.data);
        } else {
            setRoomsData([]);
        }
    }


    const onRoomSelectRoom = (id, name,) => {
        navigation.navigate('FloorPlan', { id: id, name: name });
    }

    return (
        <View style={styles.screen}>
         <NavBar title={"Back"} onPress={() => navigation.goBack()} />

            <Text style={styles.modalTitle}>{title}</Text>

            <View style={styles.tabContainer}>
                {['Residential', 'Commercial', 'Retail'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.tabButton, selectedType === type.toLowerCase() && styles.activeTab]}
                        onPress={() => setSelectedType(type.toLowerCase())}
                    >
                        <Text style={[styles.tabText, selectedType === type.toLowerCase() && styles.activeTabText]}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {!selectedRoom ? (
                <FlatList
                    data={filteredRooms}
                    keyExtractor={(room) => room.id.toString()}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.noRooms}>No {selectedType} rooms available</Text>}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.roomItem}
                            onPress={() => {
                                onRoomSelectRoom(item.id, item.name);
                            }}
                        >
                            <Image source={{ uri: `${API_URL}/${item.image}` }} style={styles.roomImage} />
                            <Text style={styles.roomText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View style={styles.selectedRoomContainer}>
                    <Image source={{ uri: `${API_URL}/${selectedRoom.image}` }} style={styles.selectedRoomImage} />
                    <Text style={styles.selectedRoomText}>{selectedRoom.name}</Text>

                    <Text style={styles.roomSizeText}>Room & Element Size (in ft):</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Width"
                            placeholderTextColor={'#999'}
                            value={roomSize.width}
                            maxLength={4}
                            onChangeText={(text) => setRoomSize({ ...roomSize, width: text })}
                        />
                        <Text style={{ textAlign: 'center', fontSize: 18, marginHorizontal: 5 }}>X</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Height"
                            placeholderTextColor={'#999'}
                            value={roomSize.height}
                            maxLength={4}
                            onChangeText={(text) => setRoomSize({ ...roomSize, height: text })}
                        />
                    </View>

                    <Text style={styles.totalSqFtText}>
                        Total Area: {roomSize.width && roomSize.height ? (parseFloat(roomSize.width) * parseFloat(roomSize.height)).toFixed(2) : '0'} sq. ft.
                    </Text>

                    <TouchableOpacity
                        style={[styles.tabButton, { marginTop: 20, backgroundColor: '#00C853' }]}
                        onPress={() => {
                            onRoomSelectRoom(selectedRoom.id, selectedRoom.name);
                        }}
                    >
                        <Text style={[styles.tabText, { color: '#fff', fontWeight: 'bold' }]}>Confirm & Continue</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Top,
        // paddingHorizontal: 15,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backText: {
        fontSize: 16,
        marginLeft: 5,
        color: '#000',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        color: '#000',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
    },
    activeTab: {
        backgroundColor: '#ff5733',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContent: {
        paddingTop: 20,
    },
    roomItem: {
        flex: 1,
        alignItems: 'center',
        margin: 5,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    roomImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    roomText: {
        marginTop: 5,
        fontSize: 14,
        textAlign: 'center',
        color: '#000',
    },
    selectedRoomContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
    selectedRoomImage: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    selectedRoomText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roomSizeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        width: 100,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        textAlign: 'center',
        marginHorizontal: 5,
    },
    totalSqFtText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff5733',
        marginTop: 10,
    },
});

export default RoomSelectionScreen;
