import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native';
import { width } from '../../utils/constent';
import { apiRequest } from '../../utils/api';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Step1PersonalInfo = ({ navigation, route }) => {
    const { user } = route.params;
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [referral, setReferral] = useState('');
    const [referralStatus, setReferralStatus] = useState('valid');

    const validateReferral = async () => {
        if (referral.length === 0) return;
        try {
            setReferralStatus('valid');
            // const res = await apiRequest('GET', `customer/validate-referral?code=${referral}`);
            // setReferralStatus(res?.valid ? 'valid' : 'invalid');
        } catch {
            // setReferralStatus('valid');
        }
    };

    const handleContinue = () => {
        if (!name.trim()) {
            alert('Please enter your full name.');
            return;
        }

        navigation.navigate('Step2LocationPreferences', {
            user: {
                ...user,
                name,
                email,
                referral_code: referral
            }
        });
    };

    return (
        <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.gradient}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Image source={require('../../asset/logofull.png')} style={styles.logo} />
                    <Text style={styles.heading}>Welcome, Complete Your Profile</Text>
                    <Text style={styles.subheading}>We just need a few more details.</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#aaa"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <View style={styles.referralContainer}>
                        <TextInput
                            style={styles.referralInput}
                            placeholder="Referral Code (Optional)"
                            placeholderTextColor="#aaa"
                            value={referral}
                            onChangeText={(text) => {
                                setReferral(text.toUpperCase());
                                setReferralStatus(null);
                            }}
                            onBlur={validateReferral}
                        />
                        {referral.length > 0 && referralStatus && (
                            <Icon
                                name={referralStatus === 'valid' ? 'check-circle' : 'cancel'}
                                size={20}
                                color={referralStatus === 'valid' ? '#00E676' : 'red'}
                                style={{ marginLeft: 8 }}
                            />
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        alignSelf: 'center',
        marginBottom: 10,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subheading: {
        fontSize: 14,
        color: '#bbb',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#1C2833',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        marginBottom: 15,
    },
    referralContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C2833',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    referralInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingVertical: 12,
    },
    button: {
        backgroundColor: '#00E676',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Step1PersonalInfo;
