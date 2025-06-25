import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const CustomToast = ({ message, visible }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 2000);
            });
        }
    }, [visible]);

    return (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        // top: 10,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 8,
        marginHorizontal:20,
        zIndex: 9999,
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CustomToast;
