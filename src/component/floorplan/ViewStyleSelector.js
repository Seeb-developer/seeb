import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { apiRequest } from '../../utils/api';
import { API_URL } from "@env";

const ViewStyleSelector = ({
    selectedCorner,
    setSelectedCorner,
    selectedStyle,
    setSelectedStyle,
    setSelectedView,
    selectedView,
    selectedCategory,
    setSelectedCategory,
}) => {
    // const [selectedView, setSelectedView] = useState('');
    const [activeTab, setActiveTab] = useState('style'); // 'view' or 'style'

    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);

    const cornerOptions = ['Corner A-C', 'Corner C-B', 'Corner B-D', 'Corner D-A'];
    const viewOptions = ['Top View', 'Corner View', 'Eye Level'];

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
        <View style={styles.container}>
            {/* Toggle Tabs */}
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.toggleBtn, activeTab === 'view' && styles.activeToggleBtn]}
                    onPress={() => setActiveTab('view')}
                >
                    <AntDesign name="camerao" size={18} color={activeTab === 'view' ? '#fff' : '#000'} />
                    <Text style={[styles.toggleText, activeTab === 'view' && { color: '#fff' }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, activeTab === 'style' && styles.activeToggleBtn]}
                    onPress={() => setActiveTab('style')}
                >
                    <AntDesign name="appstore-o" size={18} color={activeTab === 'style' ? '#fff' : '#000'} />
                    <Text style={[styles.toggleText, activeTab === 'style' && { color: '#fff' }]}>Style</Text>
                </TouchableOpacity>
            </View>

            {/* View Options */}
            {activeTab === 'view' && (
                <>
                    <View style={styles.optionsRow}>
                        {viewOptions.map((view) => (
                            <TouchableOpacity
                                key={view}
                                style={[
                                    styles.optionBtn,
                                    selectedView === view && styles.optionBtnSelected,
                                ]}
                                onPress={() => {
                                    setSelectedView(view)
                                    setSelectedCorner(view)
                                }}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedView === view && styles.optionTextSelected,
                                    ]}
                                >
                                    {view}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Corner View Sub-options */}
                    {selectedView === 'Corner View' && (
                        <View style={styles.cornersGrid}>
                            {cornerOptions.map((corner) => (
                                <TouchableOpacity
                                    key={corner}
                                    style={[
                                        styles.cornerBtn,
                                        selectedCorner === corner && styles.cornerBtnSelected,
                                    ]}
                                    onPress={() => setSelectedCorner(corner)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedCorner === corner && styles.optionTextSelected,
                                        ]}
                                    >
                                        {corner}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </>
            )}

            {/* Style Categories & Styles */}
            {activeTab === 'style' && (
                <>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginVertical: 10 }}
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

                    {loading ? (
                        <ActivityIndicator size="large" color="#6366F1" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                            <View style={styles.horizontalScrollContent}>
                                {selectedCategories?.styles.map((style) => (
                                    <TouchableOpacity
                                        key={style.id}
                                        style={[
                                            styles.styleCard,
                                            selectedStyle?.id === style.id && styles.activeStyleCard,
                                        ]}
                                        onPress={() => setSelectedStyle(style)}
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

                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#F9FAFB',
    },
    toggleRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    activeToggleBtn: {
        backgroundColor: '#6366F1',
    },
    toggleText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    optionBtn: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    cornersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    cornerBtn: {
        width: '48%',
        backgroundColor: '#E5E7EB',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
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
        paddingVertical: 6,
        borderRadius: 20,
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
});


export default ViewStyleSelector;
