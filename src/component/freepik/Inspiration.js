import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { apiRequest, downloadImageUrl } from '../../utils/api';
import FastImage from 'react-native-fast-image';
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { API_URL } from "@env";
import { width } from '../../utils/constent';
import { useNavigation } from '@react-navigation/native';
const Inspiration = ({ setIndex, setSelectedImage, setIsViewerVisible, setVisibleSection, setPrompt }) => {
    const [promptData, setPromptData] = useState([]);
    const [loadingInspiration, setLoadingInspiration] = useState(false);
    const [stylesList, setStylesList] = useState([]);
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [selectedStyleName, setSelectedStyleName] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigation = useNavigation();

    const fetchPrompt = useCallback(async (styleId) => {
        setLoadingInspiration(true);
        try {
            const response = await apiRequest("GET", `prompts/style/${styleId}`);

            if (response.status === 200) {
                setPromptData(response.data);  // Directly storing the array
            } else {
                // Alert.alert("Error", "No inspiration found.");
            }
        } catch (error) {
            console.error("Error fetching inspiration:", error);
            // Alert.alert("Error", "Failed to load inspiration.");
        } finally {
            setLoadingInspiration(false);
        }

    }, []);

    const fetchStylesByCategory = async () => {
        try {
            const res = await apiRequest('GET', 'styles/by-category');
            // const json = await res.json();
            // console.log(json)
            if (res.status === 200) {
                setCategories(res.data);
                if (res.data.length > 0) {
                    setSelectedCategoryId(res.data[0].id);
                    setSelectedCategory(res.data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching styles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStylesByCategory();
    }, []);

    const selectedCategories = categories.find((cat) => cat.id === selectedCategoryId);



    return (
        <View style={{ marginBottom: 60 }}>
            <View style={{ paddingVertical: 10, marginLeft:10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>Select a style</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryBtn,
                                selectedCategoryId === cat.id && styles.optionBtnSelected,
                            ]}
                            onPress={() => {
                                setSelectedCategoryId(cat.id);
                                setSelectedCategory(cat.name);
                            }}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategoryId === cat.id && styles.activeCategoryText,
                                ]}
                            >
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.horizontalScrollContent}>
                    {selectedCategories?.styles.map((style) => (
                        <TouchableOpacity
                            key={style.id}
                            style={[
                                styles.styleCard,
                                selectedStyle?.id === style.id && styles.activeStyleCard,
                            ]}
                            onPress={() => {
                                setSelectedStyle(style)
                                fetchPrompt(style.id);
                            }}
                        >
                            <Image
                                source={{ uri: `${API_URL}${style.image}` }}
                                style={styles.styleImage}
                            />
                            <Text style={styles.styleText}>{style.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10, marginVertical: 10 }}>
                <Text style={{ color: "#000", fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                    {selectedStyleName} Designs
                </Text>
            </View>
            {loadingInspiration ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (

                <FlatList
                    data={promptData}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 240, marginTop: 10 }}
                    renderItem={({ item, index }) => (
                        <View style={{ marginBottom: 15, }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10, marginBottom: 5 }}>
                                <Text style={{ fontWeight: "bold", color: "#000", fontSize: 16 }}>
                                    Prompt:
                                </Text>
                                <Text style={{ color: "#000", fontSize: 16, fontWeight: "400", marginLeft: 6 }}>
                                    {item.prompt}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                {/* Image Click to View */}
                                <TouchableOpacity
                                    onPress={() => {
                                        const formattedImages = promptData.map(img => ({ url: API_URL + img.image_path }));
                                        setSelectedImage(formattedImages);
                                        setIsViewerVisible(true);
                                        setIndex(index);
                                    }}>
                                    <FastImage source={{ uri: API_URL + item.image_path }} style={styles.image} resizeMode="cover" />
                                </TouchableOpacity>

                                {/* Bottom Background Container */}
                                <View style={styles.bottomContainer}>
                                    {/* AI Analyze Button */}
                                    <TouchableOpacity
                                        style={styles.analyzeButton}
                                        // onPress={() => navigation.navigate('OpenAIIntegration', { imageUrl: item.image_path })}>
                                        onPress={() => setVisibleSection('aiimages') & setPrompt(item.prompt)}>
                                        <Text style={styles.analyzeText}>Generate designs with this prompt</Text>
                                        <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                                    </TouchableOpacity>

                                    {/* Download Button */}
                                    {/* <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={() => downloadImageUrl(API_URL + item.image_path)}>
                                        <Ionicons name="cloud-download-outline" size={25} color="#fff" />
                                    </TouchableOpacity> */}
                                </View>
                            </View>

                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                            <Text style={{ color: "#000", fontSize: 16 }}>No designs available in this category.</Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    imageContainer: { marginHorizontal: 10, marginVertical: 10, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3, },
    image: { width: '100%', height: width * 0.65, },
    checkbox: {
        position: 'absolute',
        bottom: 8,
        right: 55,
        padding: 8,
        backgroundColor: "#007bff",
        borderRadius: 20
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",  // Semi-transparent background
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    analyzeButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    analyzeText: {
        color: "#fff",
        fontSize: 14,
        marginRight: 5,
    },
    downloadButton: {
        padding: 8,
        backgroundColor: "#007bff",
        borderRadius: 20
    },
    filterContainer: {
        paddingHorizontal: 10,
        // paddingVertical: 10,
    },

    filterItem: {
        marginRight: 10,
        // paddingVertical: 14,
        paddingHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#FEF9C3',
    },

    activeFilterItem: {
        backgroundColor: '#EAB308',
    },

    filterText: {
        color: '#A16207',
        fontWeight: '600',
        margin: 15,
    },

    activeFilterText: {
        color: '#fff',
    },


    optionBtnSelected: {
        backgroundColor: '#10B981',
    },
    cornerBtnSelected: {
        backgroundColor: '#F59E0B',
    },
    optionText: {
        fontSize: 14,
        color: '#374151',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    categoryBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#E5E7EB',
        marginRight: 10,
    },
    activeCategoryBtn: {
        backgroundColor: '#6366F1',
    },
    categoryText: {
        color: '#111827',
        fontWeight: '600',
    },
    activeCategoryText: {
        color: '#fff',
    },
    horizontalScrollContent: {
        flexDirection: 'row',
        paddingLeft: 5,
        marginLeft: 10,
    },
    styleCard: {
        width: 100,
        alignItems: 'center',
        marginRight: 12,
        borderRadius: 10,
        padding: 6,
        backgroundColor: '#f3f4f6',
    },
    activeStyleCard: {
        backgroundColor: '#c7d2fe',
    },
    styleImage: {
        width: 80,
        height: 80,
        borderRadius: 6,
        marginBottom: 6,
    },
    styleText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#111827',
    },

    // downloadButton: {
    //     position: "absolute",
    //     bottom: 10,
    //     right: 10,
    //     backgroundColor: "rgba(0, 0, 0, 0.5)",
    //     padding: 8,
    //     borderRadius: 50,
    // },
    // downloadButton: { position: "absolute", bottom: 8, right: 10, padding: 8, backgroundColor: "#007bff", borderRadius: 20 },
})

export default Inspiration