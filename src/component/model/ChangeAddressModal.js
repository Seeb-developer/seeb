import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert
} from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChangeAddressModal = ({ visible, onClose, onAddressSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [region, setRegion] = useState({
        latitude: 18.5204,
        longitude: 73.8567,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // 📌 Fetch search results from Google Places API
    const searchLocation = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
    
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
            );
            const data = await response.json();
            if (data.length > 0) {
                setSearchResults(data.map((item) => ({
                    place_id: item.place_id,
                    description: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                })));
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch search results.");
        }
    };
    
    // 📌 Select Address from Search
    const selectAddress = async (placeId, lat, lon, description) => {
        setSelectedAddress(description);
        setRegion({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setSearchResults([]);
        setSearchQuery('');
    };
    

    // 📌 Handle Map Pin Drag
    const onRegionChange = (newRegion) => {
        setRegion(newRegion);
    };

    const confirmAddress = () => {
        if (!selectedAddress) {
            Alert.alert("Error", "Please select an address.");
            return;
        }
        onAddressSelect(selectedAddress);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Icon name="close" size={26} color="#FF5733" />
                    </TouchableOpacity>

                    {/* Header */}
                    <Text style={styles.headerTitle}>📍 Change Address</Text>

                    {/* Search Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Search for location"
                        value={searchQuery}
                        onChangeText={searchLocation}
                    />

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.place_id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.searchResult}
                                    onPress={() => selectAddress(item.place_id)}
                                >
                                    <Text>{item.description}</Text>
                                </TouchableOpacity>
                            )}
                            style={styles.searchResultsContainer}
                        />
                    )}

                    {/* Map View */}
                    {/* <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            region={region}
                            onRegionChangeComplete={onRegionChange}
                        >
                            <Marker
                                coordinate={{
                                    latitude: region.latitude,
                                    longitude: region.longitude,
                                }}
                                draggable
                                onDragEnd={(e) => {
                                    setRegion({
                                        ...region,
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    });
                                }}
                            />
                        </MapView>
                    </View> */}

                    {/* Confirm Address */}
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmAddress}>
                        <Text style={styles.confirmButtonText}>Confirm Address</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: '85%',
        elevation: 10,
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: "#333",
    },
    input: {
        backgroundColor: '#f3f3f3',
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
    },
    searchResultsContainer: {
        maxHeight: 150,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    searchResult: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    mapContainer: {
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    confirmButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default ChangeAddressModal;
