import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image, ScrollView } from 'react-native'
import React from 'react'
import { width } from '../../utils/constent';
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { API_URL } from "@env";
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { Platform, Alert, PermissionsAndroid } from 'react-native';

const ImageGenerater = ({ images, generateImage, loading, saveData, executionData, setIsViewerVisible, setSelectedImage, setIndex }) => {
   const navigation = useNavigation();

    const downloadImage = async (imageUrl) => {
        try {
            // Get file extension
            const extension = imageUrl.split('.').pop().split(/\#|\?/)[0];
            const fileName = `image_${Date.now()}.${extension}`;

            let downloadDest = '';
            if (Platform.OS === 'android') {
                // Request permission for Android 13+
                // if (Platform.Version >= 33) {
                //     const granted = await PermissionsAndroid.request(
                //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                //     );
                //     if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                //         Alert.alert('Permission Denied', 'Cannot save image without permission.');
                //         return;
                //     }
                // }
                downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            } else {
                downloadDest = `${RNFS.CachesDirectoryPath}/${fileName}`;
            }

            // Download the image
            const downloadResult = await RNFS.downloadFile({
                fromUrl: imageUrl,
                toFile: downloadDest,
            }).promise;

            if (downloadResult.statusCode === 200) {
                if (Platform.OS === 'ios') {
                    await CameraRoll.saveAsset(`file://${downloadDest}`, { type: 'photo' });
                    Alert.alert('Success', 'Image saved to Photos!');
                } else {
                    // Alert.alert('Success', `Image downloaded to ${downloadDest}`);
                }
            } else {
                throw new Error('Failed to download image');
            }
        } catch (err) {
            console.log('Download error:', err);
            Alert.alert('Error', 'Failed to download image!');
        }
    };
    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
            {loading && <ActivityIndicator size='large' color='#007bff' />}
            <FlatList
                data={images}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.imageContainer}>
                        {console.log(item)}

                        {/* Image Click to View */}
                        <TouchableOpacity onPress={() => {
                            const formattedImages = images.map(img => ({ url: img.url }));
                            setSelectedImage(formattedImages);
                            setIsViewerVisible(true);
                            setIndex(index);
                        }}>
                            <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
                        </TouchableOpacity>

                        {/* Bottom Background Container */}
                        <View style={styles.bottomContainer}>
                            {/* AI Analyze Button */}
                            <TouchableOpacity
                                style={styles.analyzeButton}
                                onPress={() => navigation.navigate('OpenAIIntegration', { imageUrl: item.url })}>
                                <Text style={styles.analyzeText}>Analyze Design with AI</Text>
                                <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                            </TouchableOpacity>

                            {/* Download Button */}
                            <TouchableOpacity
                                style={styles.downloadButton}
                                onPress={() => downloadImage(item.url)}>
                                <Ionicons name="cloud-download-outline" size={25} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {images.length > 0 && (
                <TouchableOpacity style={styles.generateMoreButton} onPress={() => generateImage(true)}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Generate More</Text>
                    )}
                </TouchableOpacity>
            )}
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    imageContainer: { marginHorizontal: 10, marginVertical: 10, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3, },
    image: { width: '100%', height: width * 0.7, },
    generateMoreButton: { backgroundColor: "#007bff", paddingVertical: 12, marginHorizontal: 20, borderRadius: 8, alignItems: "center", marginTop: 20 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",  // Semi-transparent background
        paddingVertical: 10,
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
   
});
export default ImageGenerater