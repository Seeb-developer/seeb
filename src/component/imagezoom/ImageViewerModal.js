import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImageViewer from "react-native-image-zoom-viewer";
import { useNavigation } from "@react-navigation/native";

const ImageViewerModal = ({ images, setIsViewerVisible, isViewerVisible, index = 0 }) => {
    const navigation = useNavigation(); // Navigation hook
    // console.log("ImageViewerModal rendered with images:", images);
    return (
        <View>
            <Modal visible={isViewerVisible} transparent={true}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}>
                    <ImageViewer
                        imageUrls={images}
                        index={index}
                        enableSwipeDown={true}
                        onSwipeDown={() => setIsViewerVisible(false)}
                        backgroundColor="transparent"
                    />

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsViewerVisible(false)}>
                        <Ionicons name="close-circle" size={32} color="#fff" />
                    </TouchableOpacity>

                    {/* Analyze Design Button */}
                    {/* <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            style={styles.analyzeButton}
                            onPress={() => navigation.navigate("OpenAIIntegration", { imageUrl: images[index]?.url })}
                        >
                            <Text style={styles.analyzeText}>Analyze Design with AI</Text>
                            <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View> */}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    analyzeButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    analyzeText: {
        color: "#fff",
        fontSize: 16,
        marginRight: 8,
    },
});

export default ImageViewerModal;
