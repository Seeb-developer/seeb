import React from "react";
import {
    View,
    Text,
    Modal,
    ActivityIndicator,
    StyleSheet
} from "react-native";

const LoadingModal = ({ visible, message = "Please wait..." }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "80%",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
        fontWeight: "bold",
    },
});

export default LoadingModal;
