import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { showToast, width } from '../../utils/constent';
import { UserContext } from '../../hooks/context/UserContext';
import { apiRequest } from '../../utils/api';
import {  API_URL, PROD_API_URL } from '@env';
import { CartContext } from '../../hooks/context/CartContext';
import AddonGroup from '../booking/AddonGroup';

const UpdateCartModal = ({ service_id, cart_item, visible, onClose, fetchCartItems }) => {
    const { userId } = useContext(UserContext);
    const { updateCart: contextUpdateCart } = useContext(CartContext);

    const [widthValue, setWidthValue] = useState("0");
    const [heightValue, setHeightValue] = useState("0");
    const [otherValue, setOtherValue] = useState("");
    const [totalSqFt, setTotalSqFt] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [service, setService] = useState([]);
    const [serviceLoading, setServiceLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [selectedAddons, setSelectedAddons] = useState({});

    useEffect(() => {
        if (service_id) {
            setServiceLoading(true);
            const fetchServiceDetails = async () => {
                const response = await apiRequest("GET", `services/${service_id}`);
                if (response.status === 200) {
                    setService(response.data);
                } else {
                    setService(null);
                }
                // setTimeout(() => {
                //     setServiceLoading(false);
                // }, 2000); // Simulate loading time
                setServiceLoading(false);
            };
            fetchServiceDetails();
        }
    }, [service_id]);

    useEffect(() => {
        setSelectedAddons(prev => {
            const updated = { ...prev };
            (service?.addons || []).forEach(addon => {
                const isRequired = addon.is_required === "1";
                const wasSelected = prev?.[addon.id]?.selected;

                updated[addon.id] = {
                    ...addon,
                    ...prev[addon.id],
                    selected: isRequired || wasSelected ? true : false,
                    qty: addon.price_type === "unit"
                        ? parseInt(addon.qty)
                        : calculateSqftQty(addon)
                };
            });
            return updated;
        });
    }, [service, totalSqFt]);

    const calculateSqftQty = (addon) => {
        const percent = parseFloat(addon.qty) || 0;
        return Math.ceil((percent / 100) * totalSqFt);
    };


    const errorMessages = {
        square_feet: "Please enter both width and height values.",
        running_feet: "Please enter the total running feet.",
        running_meter: "Please enter the total running meter.",
        points: "Please enter the total number of points.",
        unit: "Please enter the number of units.",
        default: "Please enter a valid value."
    };



    useEffect(() => {
        let calculatedQuantity = 0;

        if (cart_item?.rate_type === "square_feet") {
            const widthNum = parseFloat(widthValue) || 0;
            const heightNum = parseFloat(heightValue) || 0;
            calculatedQuantity = widthNum * heightNum;
            setOtherValue(widthNum + "X" + heightNum);
        } else {
            calculatedQuantity = parseFloat(otherValue) || 0;
        }

        setTotalSqFt(calculatedQuantity);
        setTotalPrice(calculatedQuantity * (cart_item?.rate || 0));
    }, [widthValue, heightValue, otherValue]);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, (response) => {
            if (response.assets) {
                setImages(prevImages => [
                    ...prevImages,
                    ...response.assets.map(asset => asset.uri)
                ]);
            }
        });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        // Detect local images (file:// or /var/ for iOS)
        const localImages = images.filter(
            uri =>
                uri.startsWith('file:') ||
                uri.startsWith('/var/')
        );
        // Already uploaded images (http or server path)
        const uploadedImages = images.filter(
            uri =>
                uri.startsWith('http') ||
                (!uri.startsWith('file:') && !uri.startsWith('/var/'))
        );

        if (localImages.length === 0) return images;

        const formData = new FormData();
        localImages.forEach((uri, idx) => {
            formData.append("images[]", {
                uri,
                name: `image_${Date.now()}_${idx}.jpg`,
                type: "image/jpeg",
            });
        });

        try {
            const response = await fetch(API_URL + "seeb-cart/uploadImages", {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const result = await response.json();
            if (result.status === 201 && Array.isArray(result.data.images)) {
                // Merge uploaded URLs with already uploaded images
                return [...uploadedImages, ...result.data.images];
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        }
        // If upload fails, return all images (so user doesn't lose selection)
        return images;
    };
    const validateInput = () => {
        if (service?.rate_type === "square_feet" && (!widthValue || !heightValue)) {
            setErrorMessage(errorMessages.square_feet);
            return false;
        } else if (service?.rate_type !== "square_feet" && !otherValue) {
            setErrorMessage(errorMessages[service?.rate_type] || errorMessages.default);
            return false;
        }

        setErrorMessage(""); // Clear error if input is valid
        return true;
    };

    const handleUpdateCart = async () => {
        if (!validateInput()) return;
        setLoading(true);
        try {
            const uploadedImageUrls = await uploadImages();
            setImages(uploadedImageUrls); // Update state with uploaded URLs

            const addonsArray = Object.values(selectedAddons)
                .filter(a => a.selected)
                .map(a => ({
                    id: a.id,
                    qty: a.qty,
                    price: a.price,
                    total: (a.qty * a.price).toFixed(2),
                    name: a.name,
                    price_type: a.price_type,
                    group_name: a.group_name,
                    description: a.description,
                }));


            const payload = {
                cart_id: cart_item.id, // Make sure you have the cart item id
                user_id: userId,
                service_id: service?.id,
                service_type_id: service?.service_type_id,
                room_id: cart_item.room_id,
                rate_type: service?.rate_type,
                value: otherValue,
                rate: service?.rate,
                amount: totalPrice,
                reference_image: JSON.stringify(uploadedImageUrls),
                addons: JSON.stringify(addonsArray),
            };

            const response = await apiRequest("PUT", `/seeb-cart/update/${cart_item.id}`, payload);

            if (response.status === 200) {
                showToast("success", "Cart updated successfully");
                onClose();
                contextUpdateCart();
                fetchCartItems();
            }
        } catch (error) {
            showToast("error", "Failed to update cart");
            console.error("Error updating cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const groupAddonsByGroupName = (addons) => {
        return addons.reduce((acc, addon) => {
            const group = addon.group_name || "Others";
            if (!acc[group]) acc[group] = [];
            acc[group].push(addon);
            return acc;
        }, {});
    };

    const groupedAddons = groupAddonsByGroupName(service?.addons || []);

    const totalAddonAmount = Object.values(selectedAddons)
        .filter(a => a.selected)
        .reduce((sum, addon) => {
            const qty = addon.qty || 1;
            return sum + (parseFloat(addon.price) * qty);
        }, 0);



    useEffect(() => {
        if (cart_item) {
            if (
                typeof cart_item.value === "string" &&
                cart_item.value.includes("X")
            ) {
                const [w, h] = cart_item.value.split("X").map(Number);
                // console.log("w, h", w, h);
                setWidthValue(w ? w.toString() : "");
                setHeightValue(h ? h.toString() : "");
                setTotalSqFt(w * h);
                setOtherValue(cart_item.value || "");
                // setTotalPrice( || 0);

            } else {
                // setWidthValue("");
                // setHeightValue("");
                setOtherValue(cart_item.value || "");
            }
            // setTotalPrice(cart_item.amount || 0);
            setImages(cart_item.reference_image ? JSON.parse(cart_item.reference_image) : []);
            // Pre-fill selectedAddons if needed
            if (cart_item.addons) {
                let parsedAddons = Array.isArray(cart_item.addons) ? cart_item.addons : [];
                if (typeof cart_item.addons === "string") {
                    try {
                        parsedAddons = JSON.parse(cart_item.addons);
                    } catch { parsedAddons = []; }
                }
                const addonsObj = {};
                parsedAddons.forEach(a => {
                    addonsObj[a.id] = { ...a, selected: true };
                });
                setSelectedAddons(addonsObj);
            }
        }
    }, [cart_item, visible]);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <View style={styles.modalContainer}>
                    {serviceLoading ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 200 }}>
                            <ActivityIndicator size="large" color="#007BFF" />
                            <Text style={{ marginTop: 16, color: '#333' }}>Loading service...</Text>
                        </View>
                    ) : !service ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 200 }}>
                            <Icon name="error-outline" size={40} color="#FF5733" />
                            <Text style={{ marginTop: 16, color: '#FF5733', fontWeight: 'bold' }}>
                                Service not found.
                            </Text>
                        </View>
                    ) : (
                        // ...existing modal content here...
                        <ScrollView showsVerticalScrollIndicator={false} style={{}}>
                            <Text style={styles.modalTitle}>Book : {service?.name}</Text>
                            <Text style={styles.inputLabel}>
                                {service?.rate_type?.replace("_", " ").toUpperCase()}:
                            </Text>
                            {service?.rate_type === "square_feet" ? (
                                <View style={styles.inputRow}>
                                    <View style={{ width: '45%' }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Width (ft)"
                                            keyboardType="numeric"
                                            value={widthValue}
                                            onChangeText={setWidthValue}
                                            placeholderTextColor="#808080"
                                        />
                                    </View>
                                    <Text style={styles.cross}>X</Text>
                                    <View style={{ width: '45%' }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Height (ft)"
                                            keyboardType="numeric"
                                            value={heightValue}
                                            onChangeText={setHeightValue}
                                            placeholderTextColor="#808080"
                                        />
                                    </View>
                                </View>
                            ) :
                                (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter value"
                                        keyboardType="numeric"
                                        value={otherValue}
                                        onChangeText={setOtherValue}
                                        placeholderTextColor="#808080"
                                    />
                                )}
                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                            <View style={styles.priceContainer}>
                                {/* {totalSqFt > 0 && ( */}
                                <>
                                    <Text style={styles.priceText}>
                                        {service?.rate_type === "square_feet" && `Total Sq. ft: ${totalSqFt}`}
                                        {service?.rate_type === "running_feet" && `Total: ${totalSqFt} ft`}
                                        {service?.rate_type === "running_meter" && `Total: ${totalSqFt} m`}
                                        {service?.rate_type === "points" && `Total: ${totalSqFt} Points`}
                                        {service?.rate_type === "unit" && `Total: ${totalSqFt} Units`}
                                    </Text>

                                    <Text style={styles.priceText}>Rate: ₹{service?.rate}</Text>

                                    {/* <Text style={styles.priceText}>=</Text>

                                    <Text style={styles.totalPriceText}>
                                        ₹{Number(totalPrice || 0).toFixed(2)}
                                    </Text> */}
                                </>
                                {/* )} */}
                            </View>

                            <AddonGroup
                                groupedAddons={groupedAddons}
                                selectedAddons={selectedAddons}
                                setSelectedAddons={setSelectedAddons}
                                totalSqFt={totalSqFt}
                            />
                            <Text style={styles.inputLabel}>Reference Images:</Text>
                            <TouchableOpacity style={styles.dottedUploadBox} onPress={pickImage}>
                                <Icon name="add-a-photo" size={30} color="#007BFF" />
                                <Text style={styles.uploadBoxText}>Tap to Upload Reference Images</Text>
                            </TouchableOpacity>

                            {images.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                                    {images.map((uri, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image
                                                source={{
                                                    uri:
                                                        uri.startsWith('http') ||
                                                            uri.startsWith('file:') ||
                                                            uri.startsWith('/var/')
                                                            ? uri
                                                            : `${API_URL}/${uri}`
                                                }}
                                                style={styles.image}
                                            />
                                            <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeButton}>
                                                <Icon name="close" size={18} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                            <View>
                                <Text style={styles.sectionTitle}>Base: ₹{totalPrice}</Text>
                                <Text style={styles.sectionTitle}>Addons: ₹{totalAddonAmount}</Text>
                                <Text style={styles.totalPriceText}>Total: ₹{(totalPrice + totalAddonAmount).toFixed(2)}</Text>
                            </View>

                            {loading ? <TouchableOpacity style={styles.addButton}>
                                <ActivityIndicator size="small" color="#007BFF" />
                            </TouchableOpacity> :

                                <TouchableOpacity style={styles.addButton} onPress={() => handleUpdateCart()}>
                                    <Icon name="shopping-cart" size={20} color="#000" style={{ marginRight: 4 }} />
                                    <Text style={styles.addButtonText}>
                                        Update ₹ {(Number(totalPrice || 0) + Number(totalAddonAmount || 0)).toFixed(2)}
                                    </Text>

                                </TouchableOpacity>

                            }
                        </ScrollView>
                    )}
                </View>
            </View>
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
        maxHeight: '90%',
        elevation: 10,
        // paddingBottom: 70,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 5,
        fontSize: 16,
        padding: 8,
        width: '100%',
        color: '#000',
    },
    cross: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 10,
        alignContent: 'center',
    },
    priceContainer: {
        marginBottom: 10,
        // flexDirection: 'row',
        // alignItems: 'center',
        // padding: 10,
    },
    priceText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginRight: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        // marginBottom: 10,
        color: '#111',
    },
    totalPriceText: {
        fontSize: 15,
        color: '#007aff',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    dottedUploadBox: {
        borderWidth: 2,
        borderColor: '#007BFF',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    uploadBoxText: {
        fontSize: 14,
        color: '#007BFF',
        marginTop: 5,
    },
    imageContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    imageWrapper: {
        marginRight: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        right: 0,
        backgroundColor: '#ff0000',
        borderRadius: 15,
        padding: 5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FACC15',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
    },
});

export default UpdateCartModal;
