import { View, Text, TouchableOpacity, Image, Alert, ScrollView, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import RNFS from 'react-native-fs';
import NavBar from '../../component/header/NavBar';
import AntDesign from 'react-native-vector-icons/AntDesign'
import ViewStyleSelector from '../../component/floorplan/ViewStyleSelector';

const GeminiAi = ({ route }) => {
    const { floorPlanImage } = route.params || {};
    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('');
    const [accentColor, setAccentColor] = useState('');
    const [selectedCorner, setSelectedCorner] = useState("Eye Level");
    const [selectedStyle, setSelectedStyle] = useState("Modern");




    const handleGenerateFloorplan = async () => {
        const planPrompt = `Generate a photorealistic 1024x1024 square interior design image based on the uploaded floor plan layout.

Requirements:
- Use the floor plan image strictly as the layout reference (do not change furniture placement or proportions).
- Design Style: ${selectedStyle}
- Viewpoint: ${selectedCorner}
- Primary Color: ${primaryColor}
- Accent Color: ${accentColor}

Ensure realistic lighting, accurate element positioning, and a natural camera perspective. Do not add or remove elements beyond what's visible in the floor plan.`;

        try {
            setLoading(true);
            const ai = new GoogleGenAI({ apiKey: "AIzaSyBoRLoPfkHAhloH1rFP2fFc-wHHNa5lDAM" });

            // Read image as base64
            let path = '';
            if (typeof floorPlanImage === 'string' && floorPlanImage.startsWith('file://')) {
                path = floorPlanImage.replace('file://', '');
            } else if (typeof floorPlanImage === 'string') {
                path = floorPlanImage;
            } else {
                Alert.alert("No floor plan image", "Please provide a valid floor plan image.");
                setLoading(false);
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
                setGeneratedImage(`data:image/png;base64,${foundImage}`);
            } else {
                Alert.alert("No image generated", "Gemini did not return an image.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to generate image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View>
                <NavBar title="AI Floor Plan" />
            </View>
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={styles.container}>
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

                    <View style={{ backgroundColor: '#fff' }}>
                        <TouchableOpacity
                            style={{ padding: 10, backgroundColor: '#00E676', margin: 5, borderRadius: 5 }}
                            onPress={handleGenerateFloorplan}
                            disabled={loading}
                        >
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                                {loading ? "Generating..." : "Generate Design"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, gap: 10 }}>
                        {floorPlanImage && (
                            <View style={{ flex: 1 }}>
                                <Image
                                    source={{ uri: floorPlanImage }}
                                    style={{ width: 250, height: 250, resizeMode: 'contain', alignSelf: 'center' }}
                                />
                            </View>
                        )}
                    </View>
                    {generatedImage && (
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>Generated Image</Text>
                            <Image
                                source={{ uri: generatedImage }}
                                style={{ width: 300, height: 300, resizeMode: 'contain', alignSelf: 'center' }}
                            />
                        </View>
                    )}

                </View>
            </ScrollView>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10
    },
    viewsContainer: {
        width: 80,
        justifyContent: 'space-between',
        padding: 10,
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        borderColor: '#000',
        // borderBottomWidth: 1,
        //  borderTopWidth: 1, 
        //  borderRightWidth: 1,
        marginTop: 4,
        borderWidth: 1,
        borderRadius: 5
    }
})

export default GeminiAi;