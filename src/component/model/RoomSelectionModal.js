import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { API_URL } from '@env';
import AntDesign from 'react-native-vector-icons/AntDesign';

const RoomSelectionModal = ({ roomsData, onRoomSelectRoom, modalVisible, setModalVisible, title = "Pick a Space to Get Started" }) => {
    const [selectedType, setSelectedType] = useState('residential');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomSize, setRoomSize] = useState({ width: '', height: '' });

    const filteredRooms = roomsData?.filter(room => room.type.toLowerCase() === selectedType) || [];

    useEffect(() => {
       setSelectedType('residential');
    }
    , [modalVisible]);

    return (
        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <AntDesign name="close" size={24} color="red" />
                </TouchableOpacity>

                <View style={[styles.modalContent]}>
                    {!selectedRoom ? (
                        <>
                            <View style={styles.fixedHeader}>
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
                            </View>

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
                                        onPress={() => onRoomSelectRoom(item.id, item.name)}
                                    >
                                        <Image source={{ uri: `${API_URL}/${item.image}` }} style={styles.roomImage} />
                                        <Text style={styles.roomText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </>
                    ) : (
                        <View style={styles.selectedRoomContainer}>
                            <TouchableOpacity onPress={() => setSelectedRoom(null)} style={styles.backButton}>
                                <AntDesign name="arrowleft" size={24} color="#000" />
                                <Text style={styles.backText}>Back</Text>
                            </TouchableOpacity>

                            <Image source={{ uri: `${API_URL}/${selectedRoom.image}` }} style={styles.selectedRoomImage} />
                            <Text style={styles.selectedRoomText}>{selectedRoom.name}</Text>

                            {/* Room Size Input */}
                            <Text style={styles.roomSizeText}>Room & Element Size (in ft):</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    // placeholder="Width"
                                    placeholderTextColor={'#000'}
                                    value={roomSize.width}
                                    maxLength={4}
                                    onChangeText={(text) => setRoomSize({ ...roomSize, width: text })}
                                />
                                <Text style={{ textAlign: 'center', fontSize: 18, marginHorizontal: 5 }}>X</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    // placeholder="Height"
                                    placeholderTextColor={'#000'}
                                    value={roomSize.height}
                                    maxLength={4}
                                    onChangeText={(text) => setRoomSize({ ...roomSize, height: text })}
                                />
                            </View>

                            {/* Total Square Feet Calculation */}
                            <Text style={styles.totalSqFtText}>
                                Total Area: {roomSize.width && roomSize.height ? (parseFloat(roomSize.width) * parseFloat(roomSize.height)).toFixed(2) : '0'} sq. ft.
                            </Text>
                        </View>

                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        paddingBottom: 20,
    },
    selectedRoomContent: {
        // height: '50%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        // position: 'absolute',
        bottom: 10,
        alignSelf: 'flex-end',
        right: 18,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
    },
    fixedHeader: {
        paddingTop: 30,
        paddingBottom: 10,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color:'#000'
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
        paddingHorizontal: 10,
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
    noRooms: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    selectedRoomContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: 20,
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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 10,
        left: 10,
    },
    backText: {
        fontSize: 16,
        marginLeft: 5,
        color: '#000',
    },
    roomSizeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        textAlign: 'center',
    },
    totalSqFtText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff5733',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default RoomSelectionModal;
