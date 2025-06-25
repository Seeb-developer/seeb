import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

import Swiper from 'react-native-swiper';
import FastImage from 'react-native-fast-image';
import BookingModal from '../component/model/BookingModal';
import ImageViewerModal from '../component/imagezoom/ImageViewerModal';
import { API_URL } from "@env";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CartContext } from '../hooks/context/CartContext';
import CartModal from '../component/model/CartModal';
import { apiRequest } from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
const ServiceDetail = ({ route }) => {
    const { service_id, roomId } = route.params;
    const modalizeRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const navigation = useNavigation();
    const { cart } = useContext(CartContext);
    const [cartModalVisible, setCartModalVisible] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [faqsLoading, setFaqsLoading] = useState(true);
    const [faqOpen, setFaqOpen] = useState({}); // Add this state at the top of your componen
    const [service, setService] = useState({});
    const [serviceImages, setServiceImages] = useState([]); // State to hold service images
    const [loading, setLoading] = useState(false);
    const [bookingModalVisible, setBookingModalVisible] = useState(false);

    // Collapsible state for "View More Section Details"
    // const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        setCartModalVisible(cart.length > 0);
    }, [cart]);

    useEffect(() => {
        // Fetch FAQs for this service_id
        const fetchFaqs = async () => {
            setFaqsLoading(true);
            try {
                const res = await apiRequest('GET', `/faqs/service/${service_id}`);
                setFaqs(res.data || []);
            } catch (err) {
                setFaqs([]);
            }
            setFaqsLoading(false);
        };
        fetchServiceDetails();
        fetchFaqs();
    }, [service_id]);

    const fetchServiceDetails = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('GET', `/services/${service_id}`);
            if (res.data) {
                setService(res.data);
                // Check if the service has images
                let images = [];
                const parsedImages = JSON.parse(res.data.image);
                if (Array.isArray(parsedImages)) {
                    images = parsedImages.map((img) => ({ url: `${API_URL}/${img}` }));
                } else {
                    images = [{ url: `${API_URL}/${parsedImages}` }];
                }
                setServiceImages(images);
                // Set the first image as the default index
                setIndex(0);

            }
        } catch (error) {
            console.error("Error fetching service details:", error);
        } finally {
            setLoading(false);
        }
    }


    return (
        <SafeAreaView style={styles.container}>
            {loading ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF5733" />
                    <Text style={{ marginTop: 10, fontSize: 16, color: '#333' }}>Loading service details...</Text>
                </View>
                : (
                    <>
                        <View style={styles.topNav}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Icon name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{service?.name}</Text>
                                {/* <Text style={[styles.rate, { marginTop: 0 }]}>
                        ₹{service.rate} {service.rate_type.replaceAll("_", " ")}
                    </Text> */}
                            </View>
                        </View>
                        {/* 🔹 Fixed Swiper at the Top */}

                        {/* 🔹 Scrollable Content */}
                        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.swiperContainer}>
                                <Swiper
                                    autoplay={false}
                                    showsPagination={true}
                                    dotStyle={styles.dot}
                                    activeDotStyle={styles.activeDot}
                                >
                                    {serviceImages.map((item, index) => (
                                        <TouchableOpacity key={index} style={styles.imageContainer} onPress={() => setIsViewerVisible(true)}>
                                            <FastImage source={{ uri: item.url }} style={styles.image} />
                                        </TouchableOpacity>
                                    ))}
                                </Swiper>
                            </View>
                            <View style={styles.content}>
                                <View style={styles.card}>
                                    <Text style={styles.serviceName}>{service?.name}</Text>
                                    <Text style={styles.rate}>
                                        ₹{service?.rate}
                                        <Text style={{ color: '#000', fontWeight: '500', fontSize: 14 }}>
                                            {" Per "}{service?.rate_type?.replaceAll("_", " ")}
                                        </Text>
                                    </Text>

                                    {service?.description && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Description</Text>
                                            <Text style={styles.sectionText}>{service?.description}</Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.cardBookButton}
                                        onPress={() => {
                                            setBookingModalVisible(true);
                                            setCartModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.cardBookButtonText}>Book Now</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.card}>
                                    <Text style={styles.serviceName}>Service Details</Text>
                                    {service?.materials && (
                                        <View style={styles.section}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <Icon name="layers" size={20} color="#FF9800" style={{ marginRight: 6 }} />
                                                <Text style={styles.sectionTitle}>Materials Used</Text>
                                            </View>
                                            {service?.materials
                                                .split('\n')
                                                .map(item =>
                                                    item
                                                        .replace(/[\r\n]+/g, ' ')
                                                        .replace(/\s+/g, ' ')
                                                        .replace(/[^a-zA-Z0-9 ,.-]/g, '')
                                                        .trim()
                                                )
                                                .filter(item => item.length > 0)
                                                .map((item, idx) => (
                                                    <Text key={idx} style={styles.sectionText}>
                                                        • {item}
                                                    </Text>
                                                ))
                                            }
                                        </View>
                                    )}

                                    {/* Collapsible Section */}
                                    {/* <TouchableOpacity
                            style={styles.viewMoreBtn}
                            onPress={() => setShowMore(!showMore)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.viewMoreText}>
                                {showMore ? "Hide Additional Service Details" : "View More Additional Service Details"}
                            </Text>
                            <Icon
                                name={showMore ? "expand-less" : "expand-more"}
                                size={22}
                                color="#888"
                                style={{ marginLeft: 6 }}
                            />
                        </TouchableOpacity> */}

                                    {/* {showMore && ( */}
                                    <>
                                        {service?.features && (
                                            <View style={styles.section}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                    <Icon name="star-outline" size={20} color="#FFB300" style={{ marginRight: 6 }} />
                                                    <Text style={styles.sectionTitle}>Features</Text>
                                                </View>
                                                {service?.features
                                                    .split('\n')
                                                    .map(item =>
                                                        item
                                                            .replace(/[\r\n]+/g, ' ')
                                                            .replace(/\s+/g, ' ')
                                                            .replace(/[^a-zA-Z0-9 ,.-]/g, '')
                                                            .trim()
                                                    )
                                                    .filter(item => item.length > 0)
                                                    .map((item, idx) => (
                                                        <Text key={idx} style={styles.sectionText}>
                                                            • {item}
                                                        </Text>
                                                    ))
                                                }
                                            </View>
                                        )}

                                        {service?.care_instructions && (
                                            <View style={styles.section}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                    <Icon name="cleaning-services" size={20} color="#4CAF50" style={{ marginRight: 6 }} />
                                                    <Text style={styles.sectionTitle}>Care Instructions</Text>
                                                </View>
                                                {service?.care_instructions
                                                    .split('\n')
                                                    .map(item =>
                                                        item
                                                            .replace(/[\r\n]+/g, ' ')
                                                            .replace(/\s+/g, ' ')
                                                            .replace(/[^a-zA-Z0-9 ,.-]/g, '')
                                                            .trim()
                                                    )
                                                    .filter(item => item.length > 0)
                                                    .map((item, idx) => (
                                                        <Text key={idx} style={styles.sectionText}>
                                                            • {item}
                                                        </Text>
                                                    ))
                                                }
                                            </View>
                                        )}

                                        {service?.warranty_details && (
                                            <View style={styles.section}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                    <Icon name="verified-user" size={20} color="#1976D2" style={{ marginRight: 6 }} />
                                                    <Text style={styles.sectionTitle}>Warranty Details</Text>
                                                </View>
                                                {service?.warranty_details
                                                    .split('\n')
                                                    .map(item =>
                                                        item
                                                            .replace(/[\r\n]+/g, ' ')
                                                            .replace(/\s+/g, ' ')
                                                            .replace(/[^a-zA-Z0-9 ,.-]/g, '')
                                                            .trim()
                                                    )
                                                    .filter(item => item.length > 0)
                                                    .map((item, idx) => (
                                                        <Text key={idx} style={styles.sectionText}>
                                                            • {item}
                                                        </Text>
                                                    ))
                                                }
                                            </View>
                                        )}

                                        {service?.quality_promise && (
                                            <View style={styles.section}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                    <Icon name="thumb-up-off-alt" size={20} color="#43A047" style={{ marginRight: 6 }} />
                                                    <Text style={styles.sectionTitle}>Quality Promise</Text>
                                                </View>
                                                {service?.quality_promise
                                                    .split('\n')
                                                    .map(item =>
                                                        item
                                                            .replace(/[\r\n]+/g, ' ')
                                                            .replace(/\s+/g, ' ')
                                                            .replace(/[^a-zA-Z0-9 ,.-]/g, '')
                                                            .trim()
                                                    )
                                                    .filter(item => item.length > 0)
                                                    .map((item, idx) => (
                                                        <Text key={idx} style={styles.sectionText}>
                                                            • {item}
                                                        </Text>
                                                    ))
                                                }
                                            </View>
                                        )}
                                    </>
                                    {/* )} */}
                                </View>

                                {/* FAQs Section */}
                                <Text style={{ fontWeight: 'bold', fontSize: 18, color: "#000", marginVertical: 10, textAlign: 'center' }}>Frequently Asked Questions</Text>
                                {faqsLoading ? (
                                    <View style={styles.card}>
                                        <Text style={styles.sectionText}>Loading...</Text>
                                    </View>
                                ) : faqs.length > 0 ? (
                                    <View style={styles.card}>
                                        {faqs.map((faq, idx) => (
                                            <View key={idx} style={{ marginTop: 2 }}>
                                                <TouchableOpacity
                                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                                    onPress={() => setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15, flex: 1 }}>
                                                        Q: {faq.question}
                                                    </Text>
                                                    <Icon
                                                        name={faqOpen[idx] ? "expand-less" : "expand-more"}
                                                        size={24}
                                                        color="#000"
                                                    />
                                                </TouchableOpacity>
                                                {faqOpen[idx] && (
                                                    <Text style={{ color: '#333', fontSize: 14, marginTop: 6, marginLeft: 4 }}>
                                                        A: {faq.answer}
                                                    </Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.card}>
                                        <Text style={styles.sectionText}>No FAQs available.</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </>
                )}

            {/* 🔹 Book Now Button */}

            <BookingModal visible={bookingModalVisible} service={service} modalizeRef={modalizeRef} roomId={roomId} onClose={() => {
                setBookingModalVisible(false);
                setCartModalVisible(cart.length > 0);
            }} />
            <ImageViewerModal isViewerVisible={isViewerVisible} setIsViewerVisible={setIsViewerVisible} images={serviceImages} index={index} />
            <CartModal visible={cartModalVisible} />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#f0f0f0',
        elevation: 3,
        borderRadius: 10,
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
        // marginRight: 10,
    },
    titleContainer: {
        flex: 1,
        // marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    swiperContainer: {
        height: 250,
        marginHorizontal: 10, // Fixed height for Swiper
    },
    dot: {
        backgroundColor: 'rgba(0,0,0,.2)',
        width: 8,
        height: 8,
        borderRadius: 4,
        margin: 3,
    },
    activeDot: {
        backgroundColor: '#FF5733',
        width: 10,
        height: 10,
        borderRadius: 5,
        margin: 3,
    },
    image: {
        width: "100%",
        height: 250,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    contentContainer: {
        flex: 1,
        paddingBottom: 100
    },
    content: {
        paddingHorizontal: 15,
        marginBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 5,
        elevation: 2,
        marginTop: 10,
        shadowColor: '#000',
    },
    serviceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        // marginTop: 8
    },
    rate: {
        fontSize: 16,
        color: '#ff5733',
        fontWeight: '600',
        marginTop: 5,
        textTransform: 'capitalize'
    },
    section: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    sectionText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '400',
        marginTop: 5,
        lineHeight: 20,
    },
    cardBookButton: {
        backgroundColor: '#ff5733',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 10,
    },
    cardBookButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 14,
        marginBottom: 2,
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 6,
        backgroundColor: '#f5f5f5',
    },
    viewMoreText: {
        color: '#ff5733',
        fontWeight: 'bold',
        fontSize: 15,
    },

});

export default ServiceDetail;
