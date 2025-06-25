import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert, FlatList, TouchableWithoutFeedback, Keyboard,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GOOGLE_API_KEY } from '@env'; // Ensure you have your API Key set up

const NewAddressModal = ({ visible, onClose, onSave }) => {
    const [houseNumber, setHouseNumber] = useState('');
    const [landmark, setLandmark] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [houseError, setHouseError] = useState('');
    const [serachVisiabble, setSearchVisiabble] = useState(false);
    const addressLabels = ["Home", "Office", "Other"];
    const [selectedLabel, setSelectedLabel] = useState('Home');
    const [searchTimer, setSearchTimer] = useState(null);


    useEffect(() => {
        if (visible) {
            fetchCurrentLocation();
            setHouseNumber('');
            setSelectedLabel('Home');
            setLandmark('');
        }
    }, [visible]);

    const fetchCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                fetchAddressFromCoords(latitude, longitude);
            },
            error => {
                Alert.alert("Location Error", "Failed to fetch current location.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const fetchAddressFromCoords = async (latitude, longitude) => {
        try {
            // const response = await fetch(
            //     `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            // );
            // const data = await response.json();
            // if (data.address) {
            //     const address = `${data.address.road || ''}, ${data.address.city || ''}, ${data.address.state || ''}, ${data.address.postcode || ''}`;
            //     setFullAddress(address);
            // } else {
            //     Alert.alert("Error", "Unable to fetch address details.");
            // }
            console.log("Fetching address from coordinates:", latitude, longitude, "API Key:", GOOGLE_API_KEY);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
            );
            const data = await response.json();
            console.log("Geocoding response:", data);
            if (data.status === "OK" && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setFullAddress(address);
            } else {
                Alert.alert("Error", "Unable to fetch address details.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to get address from location.");
        }
        setLoading(false);
    };

    // const searchLocation = async (query) => {
    //     setSearchQuery(query);
    //     if (query.length < 3) {
    //         setSearchResults([]);
    //         return;
    //     }

    //     try {
    //         setSearching(true);
    //         const response = await fetch(
    //             `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=IN`
    //         );
    //         const data = await response.json();

    //         if (data.length > 0) {
    //             const filteredResults = data.filter((item) =>
    //                 item.display_name.includes("Maharashtra") ||
    //                 item.display_name.includes("Pune")
    //             );

    //             setSearchResults(filteredResults.map((item) => ({
    //                 place_id: item.place_id,
    //                 description: item.display_name,
    //                 lat: item.lat,
    //                 lon: item.lon,
    //             })));
    //         } else {
    //             setSearchResults([]);
    //         }
    //     } catch (error) {
    //         Alert.alert("Error", "Failed to fetch search results.");
    //     } finally {
    //         setSearching(false);
    //     }
    // };

    const searchLocation = async (query) => {
        // setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        // console.log('Searching for:', query);

        try {
            setSearching(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&components=country:in`
            );
            const data = await response.json();
            console.log('Places API response:', data);

            if (data.status === 'OK') {
                const results = data.predictions.map((place) => ({
                    place_id: place.place_id,
                    description: place.description,
                }));

                setSearchResults(results);
            } else {
                console.warn('Google Places API returned status:', data.status);
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Google Places error:', error);
            Alert.alert('Error', 'Failed to fetch Google search results.');
        } finally {
            setSearching(false);
        }
    };



    // 📌 Select Address from Search
    const selectAddress = (description) => {
        setFullAddress(description);
        setSearchResults([]);
        setSearchQuery('');
        setSearchVisiabble(false);
    };


    const handleSaveAddress = () => {
        let isValid = true;

        if (!houseNumber.trim()) {
            setHouseError("House/Flat Number is required.");
            isValid = false;
        } else {
            setHouseError("");
        }

        if (!isValid) return;

        onSave({ houseNumber, landmark, fullAddress, label: selectedLabel });
        // onClose();
    };

    const handleInputChange = (text) => {
        setSearchQuery(text);

        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        const newTimer = setTimeout(() => {
            searchLocation(text);
        }, 500); // wait 500ms after user stops typing

        setSearchTimer(newTimer);
    };





    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>

            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        {/* Close Icon */}

                        {/* Header */}
                        <Text style={styles.headerTitle}>📍 Add New Address</Text>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}
                            style={{ marginBottom: Platform.OS === "ios" ? 120 : 0 }}
                        >
                            <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                                {serachVisiabble &&
                                    <>
                                        <Text style={styles.label}>🔍 Search Location</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Search for a location"
                                            value={searchQuery}
                                            onChangeText={handleInputChange}
                                            placeholderTextColor="gray"
                                        />

                                        {/* Search Results */}
                                        <View style={styles.searchContainer}>
                                            {searchResults.length > 0 && (
                                                <FlatList
                                                    data={searchResults}
                                                    keyExtractor={(item) => item.place_id.toString()}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={styles.searchItem}
                                                            onPress={() => selectAddress(item.description)}
                                                        >
                                                            <Icon name="location-on" size={20} color="#007BFF" />
                                                            <Text style={styles.searchText}>{item.description}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            )}
                                        </View>

                                    </>
                                }

                                {/* Current Location Display */}
                                <View style={styles.locationBox}>
                                    <Icon name="location-on" size={24} color="#007BFF" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.locationTitle}>Current Location</Text>
                                        <Text style={styles.locationText}>{loading ? 'Fetching location...' : fullAddress || 'No address found'}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setSearchVisiabble(true)} style={styles.changeButton}>
                                        <Text style={styles.changeButtonText}>Change</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>🏷️ Address Type</Text>
                                <View style={styles.labelContainer}>
                                    {addressLabels.map((label) => (
                                        <TouchableOpacity
                                            key={label}
                                            style={[styles.labelButton, selectedLabel === label && styles.selectedLabel]}
                                            onPress={() => setSelectedLabel(label)}
                                        >
                                            <Text style={[styles.labelText, selectedLabel === label && styles.selectedLabelText]}>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* House/Flat Number */}
                                <Text style={styles.label}>🏠 House/Flat Number</Text>
                                <TextInput
                                    style={[styles.input, houseError ? styles.inputError : null]}
                                    placeholder="Enter House/Flat Number"
                                    value={houseNumber}
                                    onChangeText={setHouseNumber}
                                    placeholderTextColor="gray"
                                />
                                {houseError ? <Text style={styles.errorText}>{houseError}</Text> : null}

                                {/* Landmark (Optional) */}
                                <Text style={styles.label}>📍 Landmark (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Landmark (Optional)"
                                    value={landmark}
                                    onChangeText={setLandmark}
                                    placeholderTextColor="gray"
                                />

                                {/* Save Address Button */}
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                                    <Text style={styles.saveButtonText}>Save Address</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
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
        // flex:1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        height: '90%',
        elevation: 10,
        paddingBottom: 50
    },
    closeIcon: {
        bottom: 10,
        alignSelf: 'flex-end',
        right: 18,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: "#333",
    },
    searchContainer: {
        maxHeight: '50%',
        backgroundColor: "#fff",
        borderRadius: 10,
        marginVertical: 10,
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    searchItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    searchText: {
        fontSize: 14,
        marginLeft: 10,
        color: "#333",
        flex: 1, // Ensures text takes up remaining space
    },
    locationBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f3f3",
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    locationTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    locationText: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    changeButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    changeButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: "#333",
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: "#f3f3f3",
        borderRadius: 10,
        padding: 5,
    },

    labelButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: "#ddd",
    },

    selectedLabel: {
        backgroundColor: '#007BFF',
        borderColor: "#007BFF",
    },

    labelText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },

    selectedLabelText: {
        color: '#fff',
        fontWeight: "bold",
    },
    input: {
        backgroundColor: '#f3f3f3',
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
        color: '#000',
    },
    saveButton: {
        backgroundColor: "#ff5733",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
    },
    inputError: {
        borderColor: 'red',
    },
});

export default NewAddressModal;
