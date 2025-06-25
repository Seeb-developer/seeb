import React, { useEffect, useState } from 'react';
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
import { CHAT_GPT_API_KEY } from '@env';
import ImageViewerModal from '../../component/imagezoom/ImageViewerModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewStyleSelector from '../../component/floorplan/ViewStyleSelector';
import { GoogleGenAI, Modality } from "@google/genai";

const PRIMARY = '#2563eb';      // Modern blue
const BG = '#f0f4fa';           // Soft blue-gray background
const CARD = '#f9fafb';         // Card background
const BORDER = '#e0e7ef';       // Subtle border
const TEXT = '#1e293b';         // Dark blue-gray text

const LEONARDO_API_KEY = '0be138cc-f4f4-45be-aa16-db45d1af6ae3';

const ElementsDesign = ({ route, navigation }) => {
    const { elements = [], floorPlanImage, width, height, name } = route.params;

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

    const [selectedId, setSelectedId] = useState(null);
    const [designs, setDesigns] = useState({});
    const [loadingId, setLoadingId] = useState(null);
    const [styleTypes, setStyleTypes] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState([]);
    const [index, setIndex] = useState(0);

    const [primaryColor, setPrimaryColor] = useState('');
    const [accentColor, setAccentColor] = useState('');
    const [selectedCorner, setSelectedCorner] = useState("Eye Level");
    const [selectedStyle, setSelectedStyle] = useState("Modern");
    const [generatedImage, setGeneratedImage] = useState(null);

    useEffect(() => {
        fetchStyles();
    }, []);

    const fetchStyles = async () => {
        try {
            const response = await apiRequest('GET', '/styles');
            if (response.status === 200) {
                setStyleTypes(response.data);
            } else {
                console.error('Failed to fetch styles:', response.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDesign = async (element) => {
        if (!selectedStyle) {
            Alert.alert('Please select a style');
            return;
        }

        const roomName = element.room || 'living room'; // Default to 'living room' if not specified

        const prompt = `A photorealistic render of a single ${element.title} in ${selectedStyle} style, designed for a 10×15 ft ${roomName}. 
The ${element.title} must be shown completely isolated on a pure white background with no walls, floor, ceiling, decor, or room context.

➤ Use only the ${element.title} — no background, no other furniture, no human presence.
➤ Render as a front-facing catalog-style product photo.
➤ Use the following consistent color theme:
   → Primary color: ${primaryColor}
   → Accent color: ${accentColor}
➤ Apply Indian standard materials like fabric, laminate, veneer, or MDF, based on element type.
          ➤ Maintain perfect real-world proportions, soft shadow underneath the element (optional), and clean soft lighting with no visual noise.`;

        const API_KEY = '0be138cc-f4f4-45be-aa16-db45d1af6ae3'; // 🔐 Replace with your actual key
        const MODEL_ID = 'b24e16ff-06e3-43eb-8d33-4416c2d75876'; // 🔧 Replace with a valid Leonardo model ID

        setLoadingId(element.id);
        console.log('Generating image for:', prompt);

        try {
            // 1. Start Generation
            const startResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    prompt,
                    modelId: MODEL_ID,
                    width: 1024,                 // Increase resolution from 512 → 1024
                    height: 1024,                // Ensure it's square and high-res
                    guidance_scale: 15,         // Increase guidance for better prompt adherence (7 → 15 is ideal range)
                    num_images: 1,
                    // prompt_strength: 0.8,       // Optional: Controls prompt influence (0–1), higher = more accurate
                    // presetStyle: 'LEONARDO', // Optional: Use if you want a specific trained aesthetic
                })
            });

            const startData = await startResponse.json();
            const generationId = startData.sdGenerationJob.generationId;

            // 2. Poll until completed
            let imageUrl = null;
            for (let i = 0; i < 10; i++) {
                const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                    },
                });
                const pollData = await pollRes.json();
                const images = pollData.generations_by_pk?.generated_images;

                if (images && images.length > 0) {
                    imageUrl = images[0].url;
                    break;
                }
                await new Promise((res) => setTimeout(res, 3000)); // wait 3 seconds
            }

            if (!imageUrl) throw new Error('Image generation timeout');

            // 3. Update design preview
            setDesigns((prev) => ({
                ...prev,
                [element.id]: [...(prev[element.id] || []), imageUrl],
            }));
        } catch (error) {
            console.error('Leonardo API Error:', error);
            setDesigns((prev) => ({ ...prev, [element.id]: null }));
            Alert.alert('Generation Failed', 'Unable to generate image. Please try again.');
        } finally {
            setLoadingId(null);
        }
    };

    const getFloorPlanDesign = async () => {

        try {
            if (!selectedStyle || !floorPlanImage) {
                Alert.alert("Please select a style, color, and upload a floor plan image.");
                return;
            }
            setIsLoading(true);

            // Convert local image to base64
            let imageBase64 = floorPlanImage;
            if (!imageBase64.startsWith('data:') && !imageBase64.startsWith('http')) {
                const base64 = await uriToBase64(imageBase64);
                if (!base64) {
                    Alert.alert("Failed to read image file.");
                    return;
                }
                imageBase64 = base64;
            }
            const roomSize = "10×15 ft"; // Default room size
            const roomType = "Living Room"; // Default room type

            // Step 1: GPT-4o generates prompt
            const promptRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHAT_GPT_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert interior AI that analyzes floor plans and generates structured prompts for tools like Leonardo, DALL·E, or Freepik AI.',
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `Analyze the attached floor plan and generate a photorealistic rendering prompt for a ${roomSize} ${roomType.toLowerCase()}.

Style: "${selectedStyle}"
Primary Color: "${primaryColor}"
Accent Color: "${accentColor}"

The prompt must:
- Strictly follow the layout shown in the image
- Respect the proportions and structure from the plan
- Match the "${selectedStyle}" style in form, finish, and furnishing
- Use the specified color theme consistently
- Include room functions, furniture layout, and key detailing
- Exclude any extra elements, decor, or people not in the plan

The output prompt should be concise, suitable for AI image generation, and capture all realistic interior elements based on the floor plan.`,
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/png;base64,${imageBase64}`,
                                    },
                                },
                            ],
                        },
                    ],
                    temperature: 0.7,
                }),
            });

            const promptJson = await promptRes.json();
            const gptPrompt = promptJson.choices?.[0]?.message?.content;
            if (!gptPrompt) throw new Error("No prompt returned from GPT");

            console.log("Prompt for Leonardo:", gptPrompt);

            // Step 2: Call Leonardo API with prompt and request 2 images
            const leonardoRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${LEONARDO_API_KEY}`,
                },
                body: JSON.stringify({
                    prompt: gptPrompt,
                    modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Use your preferred model
                    width: 768,
                    height: 512,
                    guidance_scale: 7,
                    num_images: 2, // ✅ request 2 images
                }),
            });

            const leonardoData = await leonardoRes.json();
            const generationId = leonardoData?.sdGenerationJob?.generationId;

            // Step 3: Poll Leonardo until images are ready
            let imageUrls = [];
            for (let i = 0; i < 10; i++) {
                const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                    headers: { Authorization: `Bearer ${LEONARDO_API_KEY}` },
                });
                const pollData = await pollRes.json();
                const images = pollData?.generations_by_pk?.generated_images;
                if (images?.length >= 2) {
                    imageUrls = images.map((img) => img.url);
                    break;
                }
                await new Promise((res) => setTimeout(res, 3000));
            }

            if (imageUrls.length === 0) {
                Alert.alert("Leonardo generation timeout");
                return;
            }

            console.log("Generated Image URLs:", imageUrls);
            setDesigns((prev) => ({
                ...prev,
                floorplan: imageUrls,
            }));
            return imageUrls;

        } catch (error) {
            console.error('Design generation error:', error);
            Alert.alert("Error", "Failed to generate images.");
        } finally {
            setIsLoading(false);
        }
    };
    const generatePrompt = ({
        selectedStyle = "Modern",
        roomType = "Living Room",
        primaryColor = "black",
        accentColor = "gold",
        selectedCorner = "eye-level",
        roomHeight = 10,
        roomSize = "10×15 ft",
    }) => {
        return `Generate a photorealistic 1024×1024 interior render of a ${roomSize} ${roomType.toLowerCase()} in ${selectedStyle} style.

Strictly follow the attached floor plan for furniture layout and wall positioning. 
Use a realistic view with accurate proportions, natural lighting, and materials like walnut wood, matte laminate, or MDF.

Primary color: ${primaryColor}
Accent color: ${accentColor}
Ceiling height: ${roomHeight} ft


Do not add extra furniture, decor, or people. Show only what’s in the floor plan.`;
    };

    const handleGenerateFloorplan = async () => {
        const roomType = "living room"; // Default room type
        const planPrompt = generatePrompt({
            selectedStyle,
            roomType,
            primaryColor,
            accentColor,
            selectedCorner: selectedCorner.toLowerCase(),
            roomHeight: 10,
            roomSize: "10x15",
            cameraWalls: "top and left",
        });


        try {
            setIsLoading(true);
            const ai = new GoogleGenAI({ apiKey: "AIzaSyBoRLoPfkHAhloH1rFP2fFc-wHHNa5lDAM" });

            // Read image as base64
            let path = '';
            if (typeof floorPlanImage === 'string' && floorPlanImage.startsWith('file://')) {
                path = floorPlanImage.replace('file://', '');
            } else if (typeof floorPlanImage === 'string') {
                path = floorPlanImage;
            } else {
                Alert.alert("No floor plan image", "Please provide a valid floor plan image.");
                setIsLoading(false);
                return;
            }
            const base64Image = await RNFS.readFile(path, 'base64');

            const contents = [
                { text: planPrompt },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image,
                    },
                },
            ];

            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-preview-image-generation",
                contents: contents,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });

            // Find the generated image in the response
            const parts = response.candidates?.[0]?.content?.parts || [];
            let foundImage = null;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    foundImage = part.inlineData.data;
                    break;
                }
            }
            if (foundImage) {
                // setDesigns((prev) => ({
                //     ...prev,
                //     floorplan: `data:image/png;base64,${foundImage}`,
                // }));
                setGeneratedImage(`data:image/png;base64,${foundImage}`);
            } else {
                Alert.alert("No image generated", "Gemini did not return an image.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to generate image.");
        } finally {
            setIsLoading(false);
        }
    };


    // Converts a local file URI to base64
    const uriToBase64 = async (uri) => {
        try {
            // Remove "file://" if present
            const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
            return await RNFS.readFile(path, 'base64');
        } catch (e) {
            console.error('Failed to convert image to base64:', e);
            return null;
        }
    };


    const handleSavePress = async() => {
        const res = await apiRequest('POST', '/floor-plans', {
            user_id: 1,
            room_name: name,
            room_size: `${width}x${height} ft`,
            name,
            primary_color: primaryColor,
            accent_color: accentColor,
            selected_name: selectedStyle,
            floorplan_image: selectedCorner,
            floorplan3d_image: generatedImage,
            elements_json: [],
        });
        if (res.status === 200) {
            Alert.alert('Success', 'Design elements saved successfully!');
            navigation.goBack();
        } else {
            Alert.alert('Error', res.message || 'Failed to save design elements.');
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
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
                            fontWeight: selectedId === item.id ? 'bold' : 'normal',
                            marginTop: 8,
                        }}
                    >
                        {item.title}
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={() => fetchDesign(item)}>
                        <Text style={styles.buttonText}>{designs[item.id] ? 'Generate More' : 'Generate Image'}</Text>
                    </TouchableOpacity>
                </View>

            </View>
            <>

                {designs[item.id] && designs[item.id].length > 0 ? (
                    <FlatList
                        data={designs[item.id]}
                        keyExtractor={(imgUrl, index) => `${item.id}-${index}`}
                        numColumns={2}
                        renderItem={({ item: imgUrl }) => (
                            <TouchableOpacity style={{ width: '50%' }} onPress={() => {
                                setImagePreviewUrl(designs[item.id]);
                                setIndex(0);
                                setImagePreviewModalVisible(true);
                            }}>

                                <Image
                                    source={{ uri: imgUrl }}
                                    style={styles.generatedImageGrid}
                                    resizeMode="cover"
                                    onPress={() => {
                                        setImagePreviewUrl(designs[item.id]);
                                        setIndex(0);
                                        setImagePreviewModalVisible(true);
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ marginTop: 10 }}
                    />
                ) : (
                    <Text style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' }}>No preview</Text>
                )}

            </>
            {loadingId === item.id && (
                <ActivityIndicator size="small" color="#FACC15" style={{ marginTop: 8, marginBottom: 8 }} />
            )}
        </TouchableOpacity>
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
                />
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
                                    onPress={() => getFloorPlanDesign()}
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


                {!isLoading && designs['floorplan'] && designs['floorplan'].length > 0 && (
                    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                        <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>
                            Generated Floor Plan Images
                        </Text>
                        <FlatList
                            data={designs['floorplan']}
                            keyExtractor={(imgUrl, idx) => `floorplan-${idx}`}
                            numColumns={2}
                            renderItem={({ item: imgUrl }) => (
                                <TouchableOpacity style={{ width: '50%' }} onPress={() => {
                                    setImagePreviewUrl(designs['floorplan']);
                                    setIndex(0);
                                    setImagePreviewModalVisible(true);
                                }}>
                                    <Image
                                        source={{ uri: imgUrl }}
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
                    extraData={{ selectedId, designs, loadingId }}
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
