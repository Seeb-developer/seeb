import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Top, width } from '../utils/constent';
import { UserContext } from '../hooks/context/UserContext';
import Header from '../component/header/Header';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { API_URL } from "@env";
import RoomSelectionModal from '../component/model/RoomSelectionModal';
import CartModal from '../component/model/CartModal';
import { CartContext } from '../hooks/context/CartContext';
import { apiRequest } from '../utils/api';
import SeebProcess from '../component/SeebProcess';

const HomeMain = ({ navigation }) => {
    const { isLoggedIn } = useContext(UserContext);
    const { cart, updateCart } = useContext(CartContext);
    const modalizeRef = useRef(null);
    const [selectedType, setSelectedType] = useState('residential');
    const [modalVisible, setModalVisible] = useState(false);
    const [cartModalVisible, setCartModalVisible] = useState(false);

    const [servicesData, setServicesData] = useState([]);
    const [roomsData, setRoomsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [roomModalVisible, setRoomModalVisible] = useState(false);
    const [roomModalVisible1, setRoomModalVisible1] = useState(false);
    const [servicesName, setServicesName] = useState(null);

    const getAllRooms = async () => {
        const response = await apiRequest('GET', 'rooms');
        if (response.status === 200) {
            setRooms(response.data);
        } else {
            setRooms([]);
        }
    }

    const getServices = async () => {
        try {
            const response = await fetch(`${API_URL}services-type`);
            const result = await response.json();
            console.log("Services Data:", result);
            if (result.status === 200) {
                setServicesData(result.data);
            } else {
                Alert.alert("Error", result.message || "");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
            Alert.alert("Error", "Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const getRooms = async (id) => {
        try {
            const response = await fetch(`${API_URL}services-type/${id}/rooms`);
            const result = await response.json();
            if (result.status === 200) {
                setRoomsData(result.data);
            } else {
                Alert.alert("Error", result.message || "");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
            Alert.alert("Error", "Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getServices();
        // getRooms();
        getAllRooms();
        const unsubscribe = navigation.addListener('focus', () => {
            updateCart();
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        setCartModalVisible(cart.length > 0);
    }, [cart.length]);

    const openSheet = (service) => {
        setSelectedService(service.id);
        setModalVisible(true);
        getRooms(service.id)
        setServicesName(service.name);
    };

    const onRoomSelectRoom = (roomId) => {
        setModalVisible(false);
        navigation.navigate('Services', { roomId: roomId, serviceId: selectedService, title: servicesName });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openSheet(item)}>
            <Image source={{ uri: API_URL + item.image }} resizeMode='cover' style={styles.imageStyle} />
            <Text style={styles.textStyle}>{item.name}</Text>
        </TouchableOpacity>
    );

    const filteredRooms = roomsData?.filter(room => room.type.toLowerCase() === selectedType) || [];

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingTop:10 }}>
                {/* AI Section */}
                <TouchableOpacity style={styles.aiSection} onPress={() => navigation.navigate('AIHomeDesign')}>
                    {/* <Image source={require('../asset/web-1.jpg')} style={styles.aiImage} resizeMode="cover" /> */}
                    <View style={styles.aiOverlay}>
                        <Image source={require('../asset/ai.png')} style={{ width: 100, height: 100 }} resizeMode='contain' />
                        <Text style={styles.aiTitle}>Design Smarter - Free Room Design With SEEB.</Text>
                        <Text style={styles.aiSubtitle}>
                            Instantly generate design ideas for your home, office, sofa and more with AI-powered creativity.
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#FACC15', padding: 10, borderRadius: 15, marginTop: 10 }}
                            onPress={() => navigation.navigate('AIHomeDesign')}>
                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                {/* <Text style={styles.title}>Create a Free Floor Plan - </Text> */}
                <TouchableOpacity style={styles.aiSection} onPress={() => setRoomModalVisible(true)}>
                    {/* <Image source={require('../asset/web-2.jpg')} style={styles.aiImage} resizeMode="cover" /> */}
                    <View style={styles.aiOverlay}>
                        <Image source={require('../asset/floorplan.png')} style={{ width: 100, height: 100 }} resizeMode='contain' />
                        <Text style={styles.aiTitle}>Create A Free Floor Plan - Design Smarter, Spend Smarter</Text>
                        <Text style={styles.aiSubtitle}>
                            Draw floor plans for any space. Enter dimensions and customize every space with ease.
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#FACC15', padding: 10, borderRadius: 15, marginTop: 10 }}
                            onPress={() => setRoomModalVisible(true)}>
                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Create Now</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                {/*                 
                <TouchableOpacity style={styles.aiSection} onPress={() => setRoomModalVisible(true)}>
                    <Image source={require('../asset/interiorhome.webp')} style={styles.aiImage} resizeMode="cover" />
                    <View style={styles.aiOverlay}>
                        <Text style={styles.aiTitle}>Get Interior Designs with AI</Text>
                        <Text style={styles.aiSubtitle}>
                            Instantly generate design ideas for your home, office, sofa, and more with AI-powered creativity.
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiSection} onPress={() => setRoomModalVisible(true)}>
                    <Image source={require('../asset/interiorhome.webp')} style={styles.aiImage} resizeMode="cover" />
                    <View style={styles.aiOverlay}>
                        <Text style={styles.aiTitle}>Floor Plan Testing</Text>
                        <Text style={styles.aiSubtitle}>
                        </Text>
                    </View>
                </TouchableOpacity> */}
                <Text style={styles.title}>Book Your Interior Services Easily Full Budget Control in Your Hands.</Text>

                {/* Skeleton Loader */}
                {loading ? (
                    <View style={styles.listContainer}>
                        {[1, 2, 3, 4, 5, 6].map((_, index) => (
                            <SkeletonPlaceholder key={index}>
                                <View style={styles.skeletonCard}>
                                    <View style={styles.skeletonImage} />
                                    <View style={styles.skeletonText} />
                                </View>
                            </SkeletonPlaceholder>
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={servicesData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={3}
                        scrollEnabled={false}
                    />
                )}

                <SeebProcess />

                {/* Interior Image */}
                {/* <TouchableOpacity onPress={() => navigation.navigate('interior')}>
                    <Image source={require('../asset/interior.webp')} resizeMode="cover" style={{ width: width, height: width, marginTop: 20 }} />
                </TouchableOpacity> */}
            </ScrollView>

            {/* Modal for Showing Room List */}
            <RoomSelectionModal
                roomsData={roomsData}
                onRoomSelectRoom={onRoomSelectRoom}
                roomType="Commercial"  // Fixed type
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
            <RoomSelectionModal
                roomsData={rooms}
                onRoomSelectRoom={(roomId, name) => {
                    setRoomModalVisible(false);
                    navigation.navigate('FloorPlan', { id: roomId, name: name });
                }}
                roomType="Commercial"  // Fixed type
                modalVisible={roomModalVisible}
                setModalVisible={setRoomModalVisible}
            />
            <RoomSelectionModal
                roomsData={rooms}
                onRoomSelectRoom={(roomId, name) => {
                    setRoomModalVisible1(false);
                    navigation.navigate('FloorPlan', { id: roomId, name: name });
                }}
                roomType="Commercial"  // Fixed type
                modalVisible={roomModalVisible1}
                setModalVisible={setRoomModalVisible1}
            />
            <CartModal visible={cartModalVisible} />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
        // paddingTop: Top,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginVertical: 5,
        textAlign: 'center',
        color: '#000'
    },
    aiSection: {
        width: '95%',
        alignSelf: 'center',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
        // height: 240,
        paddingVertical: 5,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    aiImage: {
        width: '100%',
        height: 240,
    },
    aiOverlay: {
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        // backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        // padding: 15,
    },
    aiTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    aiSubtitle: {
        fontSize: 14,
        color: '#000',
        textAlign: 'center',
        marginTop: 5,
    },
    listContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '29%',
        alignItems: 'center',
        // borderWidth: 1,
        padding: 5,
        borderRadius: 20,
        // borderColor: '#ccc',
        margin: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageStyle: {
        width: '100%',
        height: 90,
        borderRadius: 10,
        resizeMode: 'contain',
        backgroundColor: '#fff'
    },
    textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 5,
        textAlign: 'center',
    },
    /* Skeleton Styles */
    skeletonCard: {
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        padding: 10,
        borderRadius: 20,
        borderColor: '#eee',
        backgroundColor: '#f0f0f0',
        marginTop: 5,
    },
    skeletonImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: '#ddd',
    },
    skeletonText: {
        width: 80,
        height: 15,
        backgroundColor: '#ddd',
        marginTop: 10,
        borderRadius: 5,
    },
    /* Modal Styles */
    modalContent: {
        flex: 1,
        paddingTop: 100, // To prevent overlap with fixed header
    },
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    roomItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    roomText: {
        fontSize: 16,
        color: '#333',
    },
    noRooms: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 10,
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
        marginBottom: 5,
    },
    roomText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    activeTab: {
        backgroundColor: '#ff5733',
        borderColor: '#ff5733',
    },
    tabText: {
        fontSize: 14,
        color: '#333',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default HomeMain;
