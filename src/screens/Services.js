import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, TextInput, Alert, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "@env";
import { width } from '../utils/constent';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // For star icons
import BookingModal from '../component/model/BookingModal';
import Swiper from 'react-native-swiper';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CartModal from '../component/model/CartModal';
import { CartContext } from '../hooks/context/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
const Services = ({ route }) => {
    const { roomId, serviceId } = route.params;
    const modalizeRef = useRef(null);
    const navigation = useNavigation();
    const [servicesData, setServicesData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const { cart } = useContext(CartContext);
    const [cartModalVisible, setCartModalVisible] = useState(true);
    const [visible, setVisible] = useState(false);

    const getServices = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}services/service-type/${serviceId}/room/${roomId}`);
            const result = await response.json();
            // console.log(result);
            if (result.status === 200) {
                setServicesData(result.data);
            } else {
                Alert.alert("Error", result.message || "Failed to fetch services.");
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
    }, []);



    const handleRefresh = async () => {
        setRefreshing(true);
        await getServices();
        setRefreshing(false);
    };

    // Filter services based on search query
    const filteredServices = servicesData.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Function to render star ratings
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating) ? Math.floor(rating) : 4;
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        const stars = [];

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" />);
        }

        // Half star
        if (halfStar) {
            stars.push(<FontAwesome key="half" name="star-half-full" size={16} color="#FFD700" />);
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesome key={`empty-${i}`} name="star-o" size={16} color="#FFD700" />);
        }

        return stars;
    };

    const getFilteredServices = () => {
        let sortedServices = [...servicesData];

        if (filter === "topRated") {
            sortedServices.sort((a, b) => b.rating - a.rating);
        } else if (filter === "priceLowToHigh") {
            sortedServices.sort((a, b) => a.rate - b.rate);
        } else if (filter === "priceHighToLow") {
            sortedServices.sort((a, b) => b.rate - a.rate);
        } else if (filter === "topBooked") {
            sortedServices.sort((a, b) => b.totalBookings - a.totalBookings);
        }

        return sortedServices.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const MAX_LENGTH = 75;
    // Render each service item
    const renderServiceItem = ({ item }) => {
        let images = [];
        try {
            images = JSON.parse(item.image); // Parse JSON string
            if (!Array.isArray(images)) images = [images]; // Ensure it's an array
        } catch (error) {
            images = [`${API_URL}/${item.image}`]; // Fallback to single image
        }

        const truncatedText = item.description.length > MAX_LENGTH
            ? item.description.substring(0, MAX_LENGTH) + "..."
            : item.description;

        return (
            <View style={styles.card}>
                {/* Background Swiper */}
                {images.length > 0 ? (
                    <Swiper style={styles.swiper} showsPagination={true} autoplay={false}>
                        {images.map((img, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate('ServiceDetail', { service_id: item.id, roomId })}
                            >
                                <ImageBackground
                                    key={index}
                                    source={{ uri: `${API_URL}/${img}` }}
                                    style={styles.imageBackground}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </Swiper>
                ) : (
                    <ImageBackground
                        source={{ uri: API_URL + images[0] }}
                        style={styles.imageBackground}
                        resizeMode="cover"
                    />
                )}

                {/* Content Overlay */}
                <View style={styles.overlay}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <View style={styles.row}>
                        <View style={{ width: width * 0.6 }}>
                            <Text style={styles.rate}>₹{item.rate} {item.rate_type?.replaceAll("_", " ")}</Text>
                            <View style={styles.rating}>
                                {renderStars(item.rating)}
                                <Text style={styles.ratingText}> {item?.rating?.toFixed(1)}</Text>
                            </View>
                            {/* <Text style={styles.bookingCount}>{item.totalBookings} Bookings</Text> */}
                        </View>

                        <TouchableOpacity
                            style={styles.bookButton}
                            onPress={() => {
                                setSelectedService(item);
                                setVisible(true);
                                setCartModalVisible(false);
                            }}
                        >
                            <Text style={styles.bookButtonText}> Add</Text>
                            <FontAwesome name="plus" size={16} color="#fff" style={styles.plusIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const SkeletonServiceItem = () => {
        return (
            <View style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonText} />
                <View style={styles.skeletonTextSmall} />
                <View style={styles.skeletonTextSmall} />
                <View style={styles.skeletonButton} />
            </View>
        );
    };

    const filters = [
        { label: 'Top Rated', value: 'topRated' },
        { label: 'Price: Low to High', value: 'priceLowToHigh' },
        { label: 'Price: High to Low', value: 'priceHighToLow' },
        { label: 'Top Booked', value: 'topBooked' },
    ];
    return (
        <SafeAreaView style={styles.container}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e0e0e0',
                    backgroundColor: '#fff',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowOffset: { width: 2, height: 2 },
                    marginBottom: 10,
                }}
            >
                {/* 🔙 Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                {/* Title & Search */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 2 }}>
                        {route.params.title} Services
                    </Text>
                    {/* <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    /> */}
                </View>
            </View>


            {/* <View>
                <FlatList
                    data={filters}
                    horizontal
                    keyExtractor={(item) => item.value}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.filterButton, filter === item.value && styles.selectedFilter]}
                            onPress={() => setFilter(item.value)}
                        >
                            <Text style={[styles.filterText, filter === item.value && styles.selectedFilterText]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View> */}


            {loading ? (
                <FlatList
                    data={[1, 2, 3, 4, 5]} // Dummy data to render multiple skeletons
                    keyExtractor={(item, index) => `skeleton-${index}`}
                    renderItem={() => <SkeletonServiceItem />}
                />
            ) : (
                <FlatList
                    data={getFilteredServices()}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    key={filter} // Forces re-render when filter changes
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderServiceItem}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.noResults}>No matching services found.</Text>}
                />
            )}
            <BookingModal service={selectedService} visible={visible} roomId={roomId} onClose={() => {
                setVisible(false);
                setCartModalVisible(true);
            }} />
            {cartModalVisible &&
                <CartModal visible={cart.length > 0} />
            }

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 10,
    },
    backButton: {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
    },
    card: {
        height: width * 0.7,
        borderRadius: 15,
        overflow: "hidden",
        marginBottom: 20,
    },
    swiper: {
        height: 250,
    },
    imageBackground: {
        width: "100%",
        height: "100%",
        justifyContent: "flex-end",
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 5,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent overlay
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    image: {
        width: '100%',
        height: width * 0.45,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
    serviceDesc: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333',
        marginTop: 5,
    },
    rate: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginTop: 3,
        textTransform: 'capitalize'
    },
    bookButton: {
        flexDirection: 'row',
        backgroundColor: '#ff5733',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        margin: 5,
    },
    bookButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    // Rating & Booking
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
    },
    bookingCount: {
        fontSize: 14,
        color: '#fff',
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    bookButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    plusIcon: {
        marginLeft: 5,
    },
    // Skeleton styles
    skeletonCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    skeletonImage: {
        width: '100%',
        height: width * 0.45,
        backgroundColor: '#ddd',
        borderRadius: 8,
    },
    skeletonText: {
        width: '70%',
        height: 16,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginVertical: 5,
    },
    skeletonTextSmall: {
        width: '50%',
        height: 14,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginVertical: 3,
    },
    skeletonButton: {
        width: '30%',
        height: 35,
        backgroundColor: '#ccc',
        borderRadius: 8,
        marginTop: 10,
    },
    noResults: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 5,
    },
    selectedFilter: {
        backgroundColor: '#ff5733',
    },
    filterText: {
        fontSize: 14,
        color: '#333',
    },
    selectedFilterText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    readMore: {
        color: '#ff5733',
        fontWeight: 'bold',
        marginTop: 5,
    },
    pagination: {
        alignSelf: "center",
        marginTop: -20,
    },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    swiper: {
        height: width
    },

});

export default Services;
