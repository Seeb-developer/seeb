import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddressModal = ({ visible, onClose, addresses, onProceed, setNewAddressModalVisible, onDeleteAddress }) => {
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePosition, setDeletePosition] = useState({ top: 0, left: 0 });
    const [addressToDelete, setAddressToDelete] = useState(null);

    useEffect(() => {
        if (visible && addresses.length > 0) {
            const defaultAddress = addresses.find(address => address.is_default) || addresses[0]; // Choose default or first
            setSelectedAddressId(defaultAddress.id);
        }
    }, [visible, addresses]);
    // Open Delete Modal Below The Icon
    const confirmDelete = (id, event) => {
        setAddressToDelete(id);
        setDeleteModalVisible(true);
        setDeletePosition({
            top: event.nativeEvent.pageY + 15,
            left: event.nativeEvent.pageX - 70,
        });
    };

    const handleDelete = () => {
        onDeleteAddress(addressToDelete);
        setDeleteModalVisible(false);
        setAddressToDelete(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>📍 Select Address</Text>
                    </View>
                    <TouchableOpacity style={styles.addAddressButton} onPress={() => {
                        onClose();
                        setNewAddressModalVisible(true);
                    }}>
                        <Icon name="add-location-alt" size={22} color="#007BFF" />
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>

                    {/* Address List */}
                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.addressWrapper}>
                                <TouchableOpacity
                                    style={styles.addressItem}
                                    onPress={() => setSelectedAddressId(item?.id)}
                                >
                                    <View style={[styles.circle, selectedAddressId === item?.id && styles.circleSelected]}>
                                        {selectedAddressId === item?.id && <Icon name="check" size={14} color="#fff" />}
                                    </View>
                                    <View style={styles.addressDetails}>
                                        <Text style={styles.addressTitle}>{item?.address_label}</Text>
                                        <Text style={styles.addressText}>{item?.house},{item?.address}</Text>
                                    </View>
                                    <TouchableOpacity onPress={(event) => confirmDelete(item?.id, event)}>
                                        <Icon name="more-vert" size={24} color="#007BFF" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    {/* Add New Address */}
                  
                    <TouchableOpacity
                        style={[styles.proceedButton, !selectedAddressId && styles.disabledButton]}
                        onPress={() => selectedAddressId && onProceed(selectedAddressId)}
                        disabled={!selectedAddressId}
                    >
                        <Text style={styles.proceedButtonText}>
                            Proceed
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Delete Confirmation Modal Positioned Below Icon */}
            {deleteModalVisible && (
                <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
                    <TouchableOpacity style={styles.deleteModalOverlay} onPress={() => setDeleteModalVisible(false)}>
                        <View style={[styles.deleteModalContainer, { top: deletePosition.top, left: deletePosition.left }]}>
                            <TouchableOpacity style={styles.confirmButton} onPress={handleDelete}>
                                <Text style={styles.confirmButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: '80%',
        elevation: 10,
        paddingBottom: 70,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#333",
    },
    addressWrapper: {
        marginBottom: 10,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    addressDetails: {
        flex: 1,
        marginLeft: 10,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    addAddressButton: {
        flexDirection: "row",
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        // justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    addAddressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
        marginLeft: 12,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#007BFF",
        alignItems: "center",
        justifyContent: "center",
    },
    circleSelected: {
        backgroundColor: "#007BFF",
    },

    /* Proceed Button */
    proceedButton: {
        position: "absolute",
        bottom: 10,
        left: 20,
        right: 20,
        backgroundColor: "#ff5733",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    proceedButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },

    /* Delete Confirmation Modal Positioned Below Icon */
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: "transparent",
    },
    deleteModalContainer: {
        position: "absolute",
        backgroundColor: '#fff',
        // padding: 10,
        borderRadius: 8,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    confirmButton: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: "center",
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
});

export default AddressModal;
