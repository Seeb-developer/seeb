import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    TextInput,
    ScrollView,
} from 'react-native';
import { apiRequest } from '../../utils/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import { CHAT_GPT_API_KEY, API_URL } from '@env';
import ImageViewerModal from '../../component/imagezoom/ImageViewerModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewStyleSelector from '../../component/floorplan/ViewStyleSelector';
import { GoogleGenAI, Modality } from "@google/genai";
import { UserContext } from '../../hooks/context/UserContext';
import mime from 'mime';




const PRIMARY = '#2563eb';      // Modern blue
const BG = '#f0f4fa';           // Soft blue-gray background
const CARD = '#f9fafb';         // Card background
const BORDER = '#e0e7ef';       // Subtle border
const TEXT = '#1e293b';         // Dark blue-gray text

// const LEONARDO_API_KEY = '0be138cc-f4f4-45be-aa16-db45d1af6ae3';

const ElementsDesign = ({ route, navigation }) => {
    const { elements = [], floorPlanImage, width, height, name } = route.params;

    const { userId } = useContext(UserContext);

    // Remove duplicates by title
    const uniqueElementsMap = {};
    elements.forEach((el) => {
        if (!uniqueElementsMap[el.title]) {
            uniqueElementsMap[el.title] = el;
        }
    });
    let uniqueElements = Object.values(uniqueElementsMap);

    // Add default elements if not already present
    const defaultElements = [
        { id: 'curtain-default', title: 'Curtain', src: 'https://seeb.in/curtains.png' },
        { id: 'ceiling-default', title: 'Ceiling', src: 'https://seeb.in/ceiling.png' }
    ];

    // Append default elements if not present by title
    defaultElements.forEach(def => {
        if (!uniqueElements.some(el => el.title.toLowerCase() === def.title.toLowerCase())) {
            uniqueElements.push(def);
        }
    });

    const [designs, setDesigns] = useState({});
    const [loadingId, setLoadingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState([]);
    const [index, setIndex] = useState(0);

    const [primaryColor, setPrimaryColor] = useState('');
    const [accentColor, setAccentColor] = useState('');

    const [selectedCorner, setSelectedCorner] = useState("Eye Level");
    const [selectedView, setSelectedView] = useState("front-view");
    const [selectedCategory, setSelectedCategory] = useState("Modern");
    const [selectedStyle, setSelectedStyle] = useState("Modern");
    const [designInstruction, setDesignInstruction] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);



    const generateItemImages = async (itemName) => {
        // if (!selectedStyle) {
        //   alert('Please select a style before generating AI images.');
        //   return;
        // }

        setLoadingId(itemName);

        try {
            const promptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${CHAT_GPT_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert prompt generator for interior design image AI tools. Create clear and concise prompts under 1500 characters using the provided item, style, and colors."
                        },
                        {
                            role: "user",
                            content: `Generate a photorealistic, isolated image of a ${itemName} in ${selectedStyle?.name} style, designed for a ${width} x ${height}ft ${name} with a room height of 10-12 ft.
            The ${itemName} should appear alone on a plain white background — no walls, no floor, no windows, and no surrounding decor or context. Focus entirely on the item itself.
            Use primary color ${primaryColor} and secondary color ${accentColor}. Apply realistic proportions, material finishes, and design details that reflect the ${selectedStyle?.name} aesthetic.
            Category: ${selectedCategory}  
            Design Notes: ${designInstruction}
            Keep it brief, clean, and suitable for AI image generation. Emphasize the item's style and function without adding any background elements.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            const chatData = await promptResponse.json();
            const prompt = chatData.choices?.[0]?.message?.content?.trim();
            // console.log("Prompt Response:", chatData);
            console.log("Generated Prompt:", prompt);

            if (!prompt) {
                Alert.alert("Failed to generate prompt.");
                return;
            }


            const res = await apiRequest('POST', 'freepik-api/image-generate', {
                user_id: userId,
                prompt,
                type: 'floorplan',
            });
            console.log("Freepik API Response:", res);
            if (res.status === 201 || res.status === 200) {
                const imageUrls = res.data?.images?.map((img) =>
                    img
                ) || [];

                if (!imageUrls.length) throw new Error("No final room image generated.");
                setDesigns((prev) => ({ ...prev, [itemName]: imageUrls }));
            } else if (res.status === 403) {
                Alert.alert("Error", res.message || "You have reached the maximum number of requests. Please try again later.");
            }
            else if (res.status === 500) {
                Alert.alert("Error", "Server error occurred. Please try again later.");
                if (res.error.status === 429) {
                    Alert.alert("Error", "Currently server is busy. Please try again later.");
                }
            }
            else {
                Alert.alert("Error", res.message || "Failed to generate images.");
            }
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to generate images.");
            console.error(err);
        } finally {
            setLoadingId(null);
        }
    };

    const generateFinalRoomImage = async () => {

        // if (!selectedStyle || !activeCategoryId) {
        //   alert("Please select a style first.");
        //   return;
        // }

        setIsLoading(true);

        const base64Only = await RNFS.readFile(floorPlanImage, 'base64');

        try {

            const finalPromptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${CHAT_GPT_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are a prompt generator for AI interior design tools. Create a single-room design prompt that combines multiple furniture items, a ceiling, and curtains."
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Generate a detailed prompt for a photorealistic interior image of a ${width} x ${height}ft ${name} using the attached floorplan as a strict layout reference.

          Layout Orientation (IMPORTANT):
          - Top of the image = North wall
          - Bottom = South wall
          - Left = West wall
          - Right = East wall

          Instructions:
          - Use the exact placement of each furniture item as shown in the floorplan image.
          - Mention the orientation and wall alignment of each item explicitly.
          - Describe the relative positions between items (e.g., "the sofa faces the TV", "the book rack is placed against the west wall").
          - Do NOT rearrange, skip, or generalize any furniture item.
          - Focus on spatial relationships and layout accuracy.

          Room Details:
          - Room Name: ${name}
          - Style: ${selectedStyle?.name}
          - Category: ${selectedCategory}
          - View: ${selectedView.replace("-", " ")}${selectedView === "Corner View" ? `from corner ${selectedCorner}` : ""}
            - Primary Color: ${primaryColor}
            - Secondary Color: ${accentColor}
            - Design Notes: ${designInstruction}
            - Items: ${uniqueElements.map((i) => i.title).join(', ')}

          Ensure the prompt is creative, under 1500 characters, and suitable for AI-based interior image generation.`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/png;base64,${base64Only}`
                                    }
                                }
                            ]
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            const chatData = await finalPromptResponse.json();
            const finalPrompt = chatData.choices?.[0]?.message?.content?.trim();
            // console.log("Final Prompt Response:", chatData);
            console.log("Final Prompt:", finalPrompt);

            if (!finalPrompt) throw new Error("Prompt generation failed");


            // freepik.ai

            const res = await apiRequest('POST', 'freepik-api/image-generate', {
                user_id: userId,
                prompt: finalPrompt,
                type: 'floorplan',
            });
            console.log("Freepik API Final Room Response:", res);
            if (res.status == 201 || res.status == 200) {
                const imageUrls = res.data?.images?.map((img) =>
                    img
                ) || [];

                if (!imageUrls.length) throw new Error("No final room image generated.");
                setDesigns((prev) => ({ ...prev, ["finalroom"]: imageUrls }));
            } else if (res.status === 403) {
                Alert.alert("Error", res.message || "You have reached the maximum number of requests. Please try again later.");
            } else {
                Alert.alert("Error", res.message || "Failed to generate images.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Final room image generation failed.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSavePress = async () => {
        setSaveLoading(true);

        try {
            let fileUri = floorPlanImage;
            if (!fileUri.startsWith('file://')) {
                fileUri = 'file://' + fileUri;
            }

            const formdata = new FormData();
            formdata.append('file', {
                uri: fileUri,
                type: mime.getType(fileUri) || 'image/png',
                name: 'floorplan.png',
            });

            const uploadRes = await fetch(`${API_URL}/floor-plans/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formdata,
            });

            const resJson = await uploadRes.json();

            // console.log("Floorplan Image Upload Response:", resJson);

            if (resJson.status !== 200 || !resJson.file_path) {
                Alert.alert('Error', 'Failed to upload floor plan image.');
                setSaveLoading(false);
                return;
            }

            const floorPlanImagePath = resJson.file_path;

            const res = await apiRequest('POST', '/floor-plans', {
                user_id: userId,
                room_name: name,
                room_size: `${width}x${height} ft`,
                name: designInstruction ?? `${name} Design`,
                primary_color: primaryColor,
                accent_color: accentColor,
                selected_name: selectedStyle,
                floorplan_image: floorPlanImagePath,
                floor3d_image: designs['finalroom'] ? JSON.stringify(designs['finalroom']) : '',
                elements_json: JSON.stringify(designs),
            });

            if (res.status === 201) {
                Alert.alert('Success', 'Design elements saved successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', res.message || 'Failed to save design elements.');
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Something went wrong while saving.');
        }

        setSaveLoading(false);
    };

    if (saveLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={{ marginTop: 16, color: PRIMARY }}>Saving your design...</Text>
            </View>
        );
    }

    // console.log("Designs:", designs);

    const renderItem = ({ item }) => (
        <View
            key={item.id}
            style={[
                styles.item,
                {
                    backgroundColor: '#fff',
                    borderColor: '#ddd',
                },
            ]}
        // onPress={() => setSelectedId(item.id)}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                <View style={{ width: '50%' }}>
                    {item.src && (
                        <Image source={{ uri: item.src }} style={styles.elementImage} resizeMode="contain" />
                    )}
                </View>
                <View style={{ width: '50%', }}>
                    <Text
                        style={{
                            color: '#222',
                            fontWeight: 'normal',
                            marginTop: 8,
                        }}
                    >
                        {item.title}
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={() => generateItemImages(item.title)}>
                        <Text style={styles.buttonText}>{designs[item.title] ? 'Generate More' : 'Generate Image'}</Text>
                    </TouchableOpacity>
                </View>

            </View>
            <>

                {designs[item.title] && designs[item.title].length > 0 ? (
                    <FlatList
                        data={designs[item.title]}
                        keyExtractor={(imgUrl, index) => `${item.title}-${index}`}
                        numColumns={2}
                        renderItem={({ item: imgUrl, index }) => (
                            <TouchableOpacity style={{ width: '50%' }} onPress={() => {
                                setImagePreviewUrl(designs[item.title].map((url) => API_URL + url));
                                setIndex(index);
                                setImagePreviewModalVisible(true);
                            }}>

                                <Image
                                    source={{ uri: API_URL + imgUrl }}
                                    style={styles.generatedImageGrid}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ marginTop: 10 }}
                    />
                ) : (
                    <Text style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' }}>No preview</Text>
                )}

            </>
            {loadingId === item.title && (
                <ActivityIndicator size="small" color="#FACC15" style={{ marginTop: 8, marginBottom: 8 }} />
            )}
        </View>
    );



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Icon name="arrow-back" size={26} color="#222" />
                </TouchableOpacity>

                <Text style={styles.headerText}>Design Elements</Text>

                <View style={{ flex: 1 }} />

                <TouchableOpacity onPress={handleSavePress} style={styles.saveButton}>
                    <Icon name="save" size={20} color={PRIMARY} style={{ marginRight: 4 }} />
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>



            <ScrollView
                contentContainerStyle={{ paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 10, gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ marginBottom: 4, fontWeight: '600', color: '#000' }}>Primary Color</Text>
                        <TextInput
                            value={primaryColor}
                            onChangeText={setPrimaryColor}
                            placeholder="e.g., Beige"
                            placeholderTextColor="gray"
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 5,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                            }}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ marginBottom: 4, fontWeight: '600', color: '#000' }}>Accent Color</Text>
                        <TextInput
                            value={accentColor}
                            onChangeText={setAccentColor}
                            placeholder="e.g., Accent"
                            placeholderTextColor="gray"
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 5,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                color: "#000"
                            }}
                        />
                    </View>
                </View>

                <ViewStyleSelector
                    selectedCorner={selectedCorner}
                    setSelectedCorner={setSelectedCorner}
                    selectedStyle={selectedStyle}
                    setSelectedStyle={setSelectedStyle}
                    selectedView={selectedView}
                    setSelectedView={setSelectedView}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 15, marginBottom: 8, paddingHorizontal: 20 }}>
                        Design Instructions
                    </Text>
                    <TextInput
                        value={designInstruction}
                        onChangeText={setDesignInstruction}
                        placeholder="Add any specific design instructions or notes"
                        placeholderTextColor="gray"
                        multiline
                        numberOfLines={3}
                        maxLength={100}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            marginHorizontal: 20,
                            color: "#000",
                        }}
                    />
                </View>
                {floorPlanImage && (
                    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                        <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>
                            Floor Plan
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Image
                                source={{ uri: floorPlanImage }}
                                style={{
                                    width: '40%',
                                    height: 120,
                                    borderRadius: 12,
                                    backgroundColor: '#e5e7eb',
                                }}
                                resizeMode="cover"
                            />

                            <View style={{ paddingHorizontal: 10, width: '55%' }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: PRIMARY,
                                        borderRadius: 8,
                                        paddingVertical: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        elevation: 2,
                                        shadowColor: '#000',
                                        shadowOpacity: 0.08,
                                        shadowRadius: 2,
                                        shadowOffset: { width: 0, height: 1 },
                                    }}
                                    onPress={() => generateFinalRoomImage()}
                                    disabled={isLoading}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                                        {isLoading ? 'Generating...' : 'Generate Floor Plan Design'}
                                    </Text>
                                </TouchableOpacity>
                                {isLoading && (
                                    <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 16 }} />
                                )}
                            </View>
                        </View>
                    </View>
                )}


                {!isLoading && designs['finalroom'] && designs['finalroom'].length > 0 && (
                    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                        <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>
                            Generated Floor Plan Images
                        </Text>
                        <FlatList
                            data={designs['finalroom']}
                            keyExtractor={(imgUrl, idx) => `finalroom-${idx}`}
                            numColumns={2}
                            renderItem={({ item: imgUrl, index }) => (
                                <TouchableOpacity
                                    style={{ width: '50%' }}
                                    onPress={() => {
                                        setImagePreviewUrl(designs['finalroom'].map((url) => API_URL + url));
                                        setIndex(index);
                                        setImagePreviewModalVisible(true);
                                    }}
                                >
                                    <Image
                                        source={{ uri: API_URL + imgUrl }}
                                        style={styles.generatedImageGrid}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ marginTop: 10 }}
                        />
                    </View>
                )}



                <Text style={styles.sectionTitle}>Design Your Space Elements</Text>
                <FlatList
                    data={uniqueElements}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    extraData={{ designs, loadingId }}
                    contentContainerStyle={{ padding: 16 }}
                />
                <ImageViewerModal
                    setIsViewerVisible={setImagePreviewModalVisible}
                    isViewerVisible={imagePreviewModalVisible}
                    images={imagePreviewUrl.map((url) => ({ url }))}
                    index={index}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 0,
        backgroundColor: CARD,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: PRIMARY,
        marginLeft: 4,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: PRIMARY,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: PRIMARY,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        letterSpacing: 0.2,
    },
    item: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 10,
        marginBottom: 18,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: BORDER,
    },
    button: {
        marginTop: 10,
        backgroundColor: PRIMARY,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        alignSelf: 'flex-start',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.2,
    },
    imagePreview: {
        marginTop: 12,
        height: 120,
        width: '100%',
        borderRadius: 12,
        borderWidth: 0,
        backgroundColor: '#e5e7eb',
    },
    elementImage: {
        width: '80%',
        height: 80,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#e5e7eb',
    },
    styleItem: {
        width: 100,
        marginRight: 16,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        padding: 4,
        backgroundColor: '#fff',
        borderColor: BORDER,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    styleImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: '#e0e7ef',
    },
    styleName: {
        fontSize: 13,
        color: TEXT,
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    generatedImageGrid: {
        width: '98%',
        height: 120,
        margin: '1%',
        borderRadius: 10,
        backgroundColor: '#e5e7eb',
    },
});



export default ElementsDesign;
