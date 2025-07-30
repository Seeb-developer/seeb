import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
    ScrollView,
    Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../../hooks/context/UserContext';
import Toast from 'react-native-toast-message';

const ReferAndEarnScreen = () => {
    const { userData } = useContext(UserContext);
    const referralCode = userData?.referral_code || 'SEEB1234';
    const referralLink = `https://seeb.in/referral/${referralCode}`;

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: `Get ₹200 OFF your first booking on Seeb!\nUse my referral code: ${referralCode}\nJoin now 👉 ${referralLink}`,
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navbar}>
                <Text style={styles.header}>Refer & Earn</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.banner}>
                    <Text style={styles.bannerText}>
                        🎉 We are working hard on bringing referral rewards to you soon!
                    </Text>
                </View>

                {/* 🎁 Bonus Card */}
                <View style={styles.card}>
                    <Icon name="gift-outline" size={40} color="#2563eb" />
                    <Text style={styles.title}>Invite Friends & Earn Rewards</Text>
                    <Text style={styles.subtitle}>
                        Share your referral code and earn ₹200 when they complete their first booking!
                    </Text>
                </View>

                {/* 🔠 Referral Code */}
                <View style={styles.referralBox}>
                    <Text style={styles.label}>Your Referral Code</Text>
                    <TouchableOpacity style={styles.referralCodeBox} onPress={() => {
                        Clipboard.setString(referralCode)
                        Toast.show({
                            type: 'success',
                            text1: 'Code Copied!',
                            text2: 'Share it with your friends to earn rewards.',
                        });
                    }}>
                        <Text style={styles.code}>{referralCode}</Text>
                        <Icon name="content-copy" size={20} color="#333" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                        <Icon name="share-variant" size={18} color="#fff" />
                        <Text style={styles.shareText}>Share Code</Text>
                    </TouchableOpacity>
                </View>

                {/* 📜 How it Works */}
                <View style={styles.steps}>
                    <Text style={styles.stepsTitle}>How it works?</Text>
                    <Text style={styles.step}>1. Share your code with friends.</Text>
                    <Text style={styles.step}>2. They sign up using your link/code.</Text>
                    <Text style={styles.step}>3. You get ₹200 after their first booking!</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ReferAndEarnScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7fb' },
    navbar: {
        padding: 16,
        backgroundColor: '#fff',
        elevation: 2,
        alignItems: 'center',
    },
    header: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    content: { padding: 20 },
    banner: {
        backgroundColor: '#E3F2FD', // Light blue
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3', // Blue accent
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerText: {
        color: '#0D47A1',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },

    card: {
        backgroundColor: '#e8f0ff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        color: '#1e40af',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginTop: 6,
        textAlign: 'center',
    },
    referralBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 1,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    code: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2563eb',
        letterSpacing: 2,
        marginBottom: 10,
    },
    shareBtn: {
        flexDirection: 'row',
        backgroundColor: '#2563eb',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 6,
    },

    referralCodeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#007BFF',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#f9f9ff',
    },

    code: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
    },

    shareText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    steps: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        elevation: 1,
    },
    stepsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    step: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },
});
