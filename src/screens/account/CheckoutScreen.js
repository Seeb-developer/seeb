import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { API_URL } from "@env";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../hooks/context/UserContext';
import { apiRequest } from '../../utils/api';
import OfferModal from '../../component/model/OfferModal';
import AddressModal from '../../component/model/AddressModal';
import NewAddressModal from '../../component/model/NewAddressModal';
import ChangeAddressModal from '../../component/model/ChangeAddressModal';
import { showToast } from '../../utils/constent';
import useFetchAddresses from '../../hooks/address/useFetchAddresses';
import useAddAddress from '../../hooks/address/useAddAddress';
import useDeleteAddress from '../../hooks/address/useDeleteAddress';
import useFetchDefaultAddress from '../../hooks/address/useFetchDefaultAddress';
import useSetDefaultAddress from '../../hooks/address/useSetDefaultAddress';
import DateSlotModal from '../../component/model/DateSlotModal';
import CancellationPolicyModal from '../../component/model/CancellationPolicyModal';
import TermsAndConditionsModal from '../../component/model/TermsAndConditionsModal';
import PrivacyPolicyModal from '../../component/model/PrivacyPolicyModal';
import ProceedToPayModal from '../../component/model/ProceedToPayModal';
import useFetchActiveCoupons from '../../hooks/coupon/useFetchActiveCoupons';
import useApplyCoupon from '../../hooks/coupon/useApplyCoupon';
import useCreateRazorpayOrder from '../../hooks/razorpay/useCreateRazorpayOrder';
import LoadingModal from '../../component/model/LoadingModal';
import RazorpayCheckout from 'react-native-razorpay';
import useCreateBookingOrder from '../../hooks/booking/useCreateBookingOrder';
import useVerifyPayment from '../../hooks/booking/useVerifyPayment';
import BookingFailedModal from '../../component/model/BookingFailedModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-swiper';
import Icon2 from 'react-native-vector-icons/Feather';
import UpdateCartModal from '../../component/model/UpdateCartModal';
import { CartContext } from '../../hooks/context/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const CheckoutScreen = () => {
    const { userId, username, mobileNo } = useContext(UserContext);
    const { updateCart } = useContext(CartContext);

    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const taxRate = 0.18; // 5% tax
    // const deliveryCharge = 50; // Fixed delivery charge

    const [offerModalVisible, setOfferModalVisible] = useState(false);
    const [isAddressModalVisible, setAddressModalVisible] = useState(false);

    const [isNewAddressModalVisible, setNewAddressModalVisible] = useState(false);
    const [cancellationVisiable, setCancellationVisiable] = useState(false);
    const [termsAndConditionsVisible, setTermsAndConditionsVisible] = useState(false);
    const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState('');

    const { addresses, fetchAddresses } = useFetchAddresses(userId);
    const { addAddress } = useAddAddress();
    const { deleteAddress } = useDeleteAddress();
    const { defaultAddress, fetchDefaultAddress } = useFetchDefaultAddress(userId);
    const { coupons, fetchActiveCoupons } = useFetchActiveCoupons();
    const { applyCoupon, discountAmount, setDiscountAmount } = useApplyCoupon();
    const { createBookingOrder, orderDetails, loading: bookingsLoading, setLoading: setBookingLoading } = useCreateBookingOrder();

    const { setDefaultAddress } = useSetDefaultAddress();

    // Call this function when deleting an address
    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const { verifyPayment, loading: paymentLoading } = useVerifyPayment();
    const [failedModal, setFailedModal] = useState(false);
    const [email, setEmail] = useState('');
    const [cartItem, setCartItem] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const [updateCartModalVisible, setUpdateCartModalVisible] = useState(false);

    const fetchUserData = useCallback(async () => {
        try {
            const value = await AsyncStorage.getItem('@user');
            if (value) {
                const data = JSON.parse(value);
                setEmail(data.email);
            }
        } catch (e) {
            console.error('Error fetching user data:', e);
        }
    }, []);
    useEffect(() => {
        fetchUserData();
    }, [])

    const proceedToRazorpay = (data) => {

        const options = {
            description: "Seeb Payment",
            image: "https://arrangefree.com/logo.png", // Seeb logo or brand image
            currency: "INR",
            amount: Math.floor(data.amount), // Amount in paise
            order_id: data.razopay_order,
            // key: 'rzp_test_eTfaszfoCN5VRr', //test
            // key: 'rzp_test_nGZ7MKLB0EL5YO', //test
            // key: 'rzp_live_MqCCiEsogC0ybf', // live
            key: 'rzp_live_ei4nrKDnI7Xjrt', // live
            name: "SEEB",
            prefill: {
                email: email,
                contact: mobileNo,
                name: username
            },
            theme: { color: "#007BFF" }
        };

        RazorpayCheckout.open(options)
            .then((paymentData) => {
                console.log("Payment Success:", paymentData);
                const optionsdata = {
                    ...paymentData,
                    booking_id: data.id,
                    user_id: userId,
                }

                verifyPayment(optionsdata, (verifiedData) => {
                    console.log("Payment Verified:", verifiedData);
                    // Redirect to Booking Success Screen
                    navigation.navigate("BookingSuccess", {
                        bookingId: verifiedData.booking_id,
                        amount: verifiedData.amount,
                        paymentStatus: verifiedData.payment_status
                    });
                });
            })
            .catch((error) => {
                setFailedModal(true)
                console.error("Payment Failed:", error);
                showToast("error", "Payment Failed. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleConfirmPayment = (paymentMethod) => {
        setLoading(true);
        // setModalVisible(false);
        setSelectedPaymentMethod(paymentMethod);

        const bookingData = {
            user_id: userId,
            payment_type: paymentMethod,
            applied_coupon: appliedCoupon,
            address_id: defaultAddress.id,
            slot_date: selectedDate,
        };

        createBookingOrder(bookingData, (data) => {
            console.log("Booking Order:", data);
            if (paymentMethod === 'online') {
                proceedToRazorpay(data);
            } else {
                navigation.navigate("BookingSuccess", {
                    bookingId: data.booking_id,
                    amount: data.amount,
                    slotDate: selectedDate,
                    paymentStatus: "pending" // Since it's cash payment
                });
            }
        });
    };


    const applyOffer = (couponCode) => {

        if (!couponCode.trim()) {
            return;
        }
        applyCoupon(userId, couponCode, totalAmount, (data) => {
            // setFinalAmount(totalAmount - data.discount_amount);
            setAppliedCoupon(data.coupon_code)
            setOfferModalVisible(false);
        });
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCartItems();
        }, [])
    );

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("GET", `/seeb-cart/getCart/${userId}`);
            if (response.status === 200) {
                setCartItems(response.data);
                const total = response.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
                setTotalAmount(total);
            } else {
                setCartItems([]);
                setTotalAmount(0);
            }
        } catch (error) {
            showToast("error", "Failed to fetch cart items");
        } finally {
            setLoading(false);
        }
    };



    const removeFromCart = async (cartId) => {
        try {
            await apiRequest("DELETE", `/seeb-cart/${cartId}`);
            applyOffer(appliedCoupon);
            // showToast("success", "Item removed from cart");
            fetchCartItems(false);
            updateCart();
        } catch (error) {
            showToast("error", "Failed to remove item");
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        showToast("info", "Coupon removed successfully");

        // Update total immediately
        // setFinalTotal(totalWithTax);
    };

    const discountedAmount = totalAmount - discountAmount; // Apply discount

    const cgst = discountedAmount * 0.09; // 9% CGST
    const sgst = discountedAmount * 0.09; // 9% SGST
    const totalTax = cgst + sgst;

    const finalTotal = Math.max(0, discountedAmount + totalTax);


    const getRateTypeLabel = (rateType) => {
        switch (rateType) {
            case "square_feet":
                return { label: "Sq. ft", unit: "Sq. ft" };
            case "running_feet":
                return { label: "Running Feet", unit: "ft" };
            case "running_meter":
                return { label: "Running Meter", unit: "m" };
            case "points":
                return { label: "Points", unit: "Points" };
            case "unit":
                return { label: "Units", unit: "unit" };
            default:
                return { label: rateType.replace("_", " "), unit: rateType.replace("_", " ") };
        }
    };

    // if (loading) {
    //     return (
    //         <SafeAreaView style={styles.container}>
    //             <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
    //         </SafeAreaView>
    //     );
    // }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                {/* 🔙 Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#007BFF" />
                </TouchableOpacity>

                {/* 🛍️ Checkout Title */}
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>🛍️ Checkout</Text>
                    <Text style={styles.amountText}>💰 ₹{finalTotal.toFixed(2)}</Text>
                </View>
            </View>


            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            ) : cartItems.length === 0 ? (
                <Text style={styles.emptyText}>Your cart is empty.</Text>
            ) : (
                <>
                    <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            {cartItems.map((item, idx) => {
                                // Parse addons if it's a string
                                let addons = [];
                                if (typeof item.addons === "string") {
                                    try {
                                        addons = JSON.parse(item.addons);
                                    } catch {
                                        addons = [];
                                    }
                                } else if (Array.isArray(item.addons)) {
                                    addons = item.addons;
                                }

                                // Get image (adjust property if needed)
                                let images = [];
                                try {
                                    images = JSON.parse(item.service_image); // Parse JSON string
                                    if (!Array.isArray(images)) images = [images]; // Ensure it's an array
                                } catch (error) {
                                    images = [`${API_URL}/${item.service_image}`]; // Fallback to single image
                                }

                                return (
                                    <View
                                        key={item.id}
                                        style={[
                                            styles.cartItemInCard,
                                            // idx === cartItems.length - 1 && { borderBottomWidth: 0 } // Remove border for last item
                                        ]}
                                    >
                                        {/* Image Slider */}
                                        {images.length > 0 && (
                                            <View style={{ width: 70, height: 70, marginRight: 8 }}>
                                                <Swiper
                                                    style={{ borderRadius: 8 }}
                                                    showsPagination={false}
                                                    autoplay={false}
                                                    loop={false}
                                                >
                                                    {images.map((img, imgIdx) => (
                                                        <Image
                                                            key={imgIdx}
                                                            source={{ uri: img.startsWith('http') ? img : `${API_URL}/${img}` }}
                                                            style={{ width: 70, height: 70, borderRadius: 8 }}
                                                            resizeMode="cover"
                                                        />
                                                    ))}
                                                </Swiper>
                                            </View>
                                        )}
                                        <View style={styles.itemDetails}>
                                            <View style={{marginRight:50}}>
                                                <Text
                                                    style={styles.itemName}
                                                    numberOfLines={2}
                                                    ellipsizeMode="tail"
                                                >
                                                    {item.service_name}
                                                </Text>
                                                <View style={styles.tagContainer}>
                                                    <Text style={styles.tag}>
                                                        {getRateTypeLabel(item.rate_type).label}: {item.value} | ₹{item.rate} per {getRateTypeLabel(item.rate_type).unit}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View>
                                                {addons.length > 0 && (
                                                    <View style={styles.addonBox}>
                                                        {addons.map((addon, idx) => (
                                                            <Text key={idx} style={styles.addonText}>
                                                                + {addon.name}: ₹{parseFloat(addon.total).toFixed(2)} ({addon.qty}*{addon.price})
                                                            </Text>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {/* Remove & Edit Icons */}
                                        <View style={styles.iconContainer}>
                                            <Text style={styles.itemPrice}>₹{item.amount}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                                                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.iconButton}>
                                                    <Icon name="delete" size={20} color="red" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => {
                                                    setCartItem(item);
                                                    setServiceId(item.service_id);
                                                    setUpdateCartModalVisible(true);
                                                }} style={styles.iconButton}>
                                                    <Icon2 name="edit" size={20} color="#007BFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {/* Update Cart Modal */}
                                    </View>
                                );
                            })}
                        </View>
                        {updateCartModalVisible && (
                            <UpdateCartModal
                                service_id={serviceId}
                                cart_item={cartItem}
                                visible={updateCartModalVisible}
                                onClose={() => setUpdateCartModalVisible(false)}
                                fetchCartItems={fetchCartItems}
                            />
                        )}

                        <TouchableOpacity onPress={() => setOfferModalVisible(true)} style={styles.couponRow}>
                            <Icon name="local-offer" size={24} color="#FF5733" />
                            <Text style={styles.couponText}>Coupons & Offers</Text>
                            <View style={styles.flexSpacer} />
                            <Text style={styles.offerCount}>{coupons.length} Offers</Text>
                            <Icon name="keyboard-arrow-right" size={24} color="#FF5733" />
                        </TouchableOpacity>

                        {/* Order Summary */}
                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryTitle}>📋 Booking Summary</Text>

                            {/* 💵 Service Cost (Previously Subtotal) */}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryText}>Service Cost</Text>
                                <Text style={styles.summaryText}>₹{totalAmount.toFixed(2)}</Text>
                            </View>

                            {/* 🏛 Tax Breakdown */}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryText}>SGST (9%)</Text>
                                <Text style={styles.summaryText}>₹{(totalAmount * 0.09).toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryText}>CGST (9%)</Text>
                                <Text style={styles.summaryText}>₹{(totalAmount * 0.09).toFixed(2)}</Text>
                            </View>

                            {/* 🎁 Coupon Applied */}
                            {appliedCoupon && (
                                <>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.couponAppliedText}>🎉 Coupon Applied: {appliedCoupon}</Text>
                                        <TouchableOpacity onPress={handleRemoveCoupon}>
                                            <Icon name="cancel" size={22} color="#FF5733" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.discountText}>Coupon Discount</Text>
                                        <Text style={styles.discountText}>- ₹{discountAmount}</Text>
                                    </View>

                                    {/* 🎯 You Saved Message - Highlight Savings */}
                                    <View style={{ alignItems: "center", marginVertical: 8 }}>
                                        <Text style={styles.savingsText}>
                                            🎯 You saved ₹{discountAmount} on this order!
                                        </Text>
                                    </View>
                                </>
                            )}

                            {/* 🔹 Divider */}
                            <View style={styles.summaryDivider} />

                            {/* 💵 Final Total Payable */}
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalText}>💰 Total Payable</Text>
                                <Text style={styles.totalText}>₹{finalTotal.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.policyContainer}>
                            <Text style={styles.policyTitle}>🔄 Cancellation Policy</Text>
                            <Text style={styles.policyText}>
                                Flexible & Hassle-Free!
                                Cancel within 10 hours at no cost if a team hasn’t been assigned to you—your peace of mind comes first.
                            </Text>

                            <TouchableOpacity onPress={() => setCancellationVisiable(true)}>
                                <Text style={styles.readMoreText}>
                                    Read More
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Place Order Button */}
                    </ScrollView>
                    {addresses.length === 0 &&
                        <TouchableOpacity style={styles.placeOrderButton} onPress={() => setNewAddressModalVisible(true)}>
                            <Text style={styles.placeOrderText}>Add Address & Slot</Text>
                        </TouchableOpacity>
                    }
                    {addresses.length > 0 &&
                        <>

                            <View style={styles.addressRow}>
                                <Icon name="home" size={24} color="#007BFF" />
                                <Text style={styles.addressText}>{defaultAddress?.address_label}</Text>
                                <Text style={styles.fullAddress} numberOfLines={2} ellipsizeMode="tail">
                                    {defaultAddress?.house}, {defaultAddress?.address}
                                </Text>
                                <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                                    <Icon name="edit" size={22} color="#007BFF" />
                                </TouchableOpacity>
                            </View>
                            {selectedDate && (
                                <View style={styles.dateRow}>
                                    <Icon name="event" size={22} color="#FF5733" />
                                    <Text style={styles.selectedDateText}>Selected Date: {selectedDate}</Text>
                                    <TouchableOpacity onPress={() => setDateModalVisible(true)}>
                                        <Icon name="edit" size={22} color="#007BFF" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {selectedDate ?
                                <>
                                    <TouchableOpacity style={styles.placeOrderButton} onPress={() => setModalVisible(true)}>
                                        <Text style={styles.placeOrderText}>💳 Proceed to Pay</Text>
                                    </TouchableOpacity>
                                    <View style={styles.termsContainer}>
                                        <Text style={styles.termsText}>
                                            By continuing, you accept our{" "}
                                            <TouchableOpacity onPress={() => setTermsAndConditionsVisible(true)}>
                                                <Text style={styles.linkText}>T&C</Text>
                                            </TouchableOpacity>,{" "}
                                            <TouchableOpacity onPress={() => setPrivacyPolicyVisible(true)}>
                                                <Text style={styles.linkText}>Privacy</Text>
                                            </TouchableOpacity>, and{" "}
                                            <TouchableOpacity onPress={() => setCancellationVisiable(true)}>
                                                <Text style={styles.linkText}>Cancellation Policies</Text>
                                            </TouchableOpacity>.
                                        </Text>
                                    </View>


                                </>
                                :
                                <TouchableOpacity style={styles.placeOrderButton} onPress={() => setDateModalVisible(true)}>
                                    <Text style={styles.placeOrderText}>Select Date to Start</Text>
                                </TouchableOpacity>

                            }
                        </>

                    }
                    {/* <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
                        <Text style={styles.placeOrderText}>Place Order</Text>
                    </TouchableOpacity> */}
                </>
            )}
            <OfferModal
                visible={offerModalVisible}
                onClose={() => setOfferModalVisible(false)}
                offers={coupons}
                onApplyOffer={applyOffer}

            />
            <AddressModal
                visible={isAddressModalVisible}
                onClose={() => setAddressModalVisible(false)}
                addresses={addresses}
                onProceed={(addressId) => {
                    setDefaultAddress(userId, addressId, () => {
                        fetchDefaultAddress();
                        fetchAddresses();
                        setAddressModalVisible(false);
                        setTimeout(() => setDateModalVisible(true), 300); // Delayed transition
                    });
                }}

                onDeleteAddress={(addressId) => {
                    deleteAddress(addressId, () => {
                        fetchDefaultAddress();
                        fetchAddresses();
                    })
                }}
                setNewAddressModalVisible={setNewAddressModalVisible}
            />
            <NewAddressModal
                visible={isNewAddressModalVisible}
                onClose={() => setNewAddressModalVisible(false)}
                onSave={(addressData) => {
                    addAddress(userId, { ...addressData }, () => {
                        // console.log("New address saved");
                        fetchDefaultAddress();
                        fetchAddresses();
                        setAddressModalVisible(false)
                        setNewAddressModalVisible(false)
                    });
                }}
            />

            <DateSlotModal
                visible={dateModalVisible}
                onClose={() => setDateModalVisible(false)}
                onSelectDate={(date) => {
                    setSelectedDate(date);
                    setDateModalVisible(false)
                    setModalVisible(true);
                }}
            />
            {/* <ProceedToPayModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                totalAmount={totalAmount + totalAmount * taxRate}
                onConfirmPayment={handleConfirmPayment}
            /> */}
            {modalVisible &&
                <ProceedToPayModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    totalAmount={totalAmount + totalAmount * taxRate}
                    onConfirmPayment={handleConfirmPayment}
                />

            }

            <CancellationPolicyModal visible={cancellationVisiable} onClose={() => setCancellationVisiable(false)} />
            <TermsAndConditionsModal visible={termsAndConditionsVisible} onClose={() => setTermsAndConditionsVisible(false)} />
            <PrivacyPolicyModal visible={privacyPolicyVisible} onClose={() => setPrivacyPolicyVisible(false)} />
            {/* <LoadingModal visible={bookingsLoading} /> */}

            <BookingFailedModal
                visible={failedModal}
                onClose={() => setFailedModal(false)}
                reason="Transaction Timeout"
                bookingId="123456"
                amount="5000"
                onRetry={() => {
                    setFailedModal(false);
                    proceedToRazorpay(orderDetails)
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7fb',
        paddingHorizontal: 15,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // Centering the title
        paddingVertical: 10,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 1, // Positions back button at left
        padding: 5,
    },
    headerTitleContainer: {
        alignItems: "center", // Ensures "Checkout" and amount are centered
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    amountText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#28A745", // Green for emphasis
        marginTop: 3, // Adds spacing between title & amount
    },
    loader: {
        marginTop: 50,
    },
    emptyText: {
        fontSize: 14, // Reduced from 16
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
    },
    cartList: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,

    },
    cartItemInCard: {
        flexDirection: 'row',
        // alignItems: 'center',
        paddingTop: 10,
        position: 'relative',
        // paddingRight: 50,
        backgroundColor: 'transparent', // No background, so it blends with card
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#333",
        marginRight: 10,
    },
    tagContainer: {
        flexDirection: "row",
        marginVertical: 5,
    },
    tag: {
        color: "#000",
        fontSize: 12,
        borderRadius: 10,
        marginRight: 4,
        fontWeight: "400",
        marginLeft: 10,
    },
    totalSqFtText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#555",
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ff5733', // highlight
        marginLeft: 10,
    },
    addonBox: {
        marginTop: 4,
        marginLeft: 4,
        backgroundColor: '#f6f7fb',
        borderRadius: 6,
        padding: 6,
    },
    addonText: {
        fontSize: 12,
        color: '#555',
        marginBottom: 2,
        fontWeight: '500',
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'column',
        // alignItems: 'center',
    },
    iconButton: {
        marginVertical: 5,
    },

    couponRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12, // Reduced from 15
        borderRadius: 10, // Reduced from 12
    },
    couponText: {
        fontSize: 14, // Reduced from 16
        fontWeight: "bold",
        color: "#333",
        marginLeft: 8, // Reduced margin
    },
    flexSpacer: {
        flex: 1,
    },
    offerCount: {
        fontSize: 12, // Reduced from 14
        color: "#555",
        marginRight: 8,
    },
    summaryContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 5,
    },
    summaryText: {
        fontSize: 14,
        color: "#555",
    },
    couponAppliedText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#28A745",
    },
    discountText: {
        fontSize: 14,
        color: "#DC3545",
    },
    summaryDivider: {
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginVertical: 10,
    },
    totalText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    savingsText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#28A745", // Green color for success
    },
    placeOrderButton: {
        backgroundColor: '#ff5733',
        padding: 12, // Reduced from 15
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8, // Reduced from 10
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16, // Reduced from 18
        fontWeight: 'bold',
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12, // Reduced from 15
        borderRadius: 10, // Reduced from 12
        marginBottom: 10,
        justifyContent: "space-between"
    },
    addressText: {
        fontSize: 14, // Reduced from 16
        fontWeight: "bold",
        color: "#333",
        marginLeft: 8,
    },
    fullAddress: {
        fontSize: 12, // Reduced from 14
        color: "#555",
        flex: 1,
        marginLeft: 8,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12, // Reduced from 15
        borderRadius: 10, // Reduced from 12
        marginBottom: 10,
    },
    selectedDateText: {
        fontSize: 14, // Reduced from 16
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    termsContainer: {
        marginVertical: 6, // Reduced from 8
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 15 // Reduced padding
    },
    termsText: {
        fontSize: 10, // Reduced from 12
        color: "#666",
        textAlign: "center",
        flexWrap: "wrap",
    },
    linkText: {
        fontSize: 10, // Reduced from 12
        color: "#007BFF",
        fontWeight: "bold",
    },
    policyContainer: {
        backgroundColor: "#f9f9f9",
        padding: 12, // Reduced from 15
        borderRadius: 10, // Reduced from 12
        marginVertical: 10,
        elevation: 2,
    },
    policyTitle: {
        fontSize: 14, // Reduced from 16
        fontWeight: "bold",
        marginBottom: 4, // Reduced margin
        color: "#333",
    },
    policyText: {
        fontSize: 12, // Reduced from 14
        color: "#666",
        lineHeight: 18, // Reduced line height
    },
    readMoreText: {
        fontSize: 12, // Reduced from 14
        color: "#007BFF",
        fontWeight: "bold",
        marginTop: 4, // Reduced margin
    },
    couponAppliedText: {
        fontSize: 12, // Reduced from 14
        fontWeight: "bold",
        color: "#007BFF"
    },
    removeCouponText: {
        fontSize: 12, // Reduced from 14
        color: "#FF5733",
        fontWeight: "bold"
    },
});


export default CheckoutScreen;
