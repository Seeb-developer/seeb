import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../hooks/context/UserContext';
import { ModalInfo } from '../../component/model/ModalInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../../component/header/NavBar';
import { Top } from '../../utils/constent';
import DeviceInfo from 'react-native-device-info';

const Profile = () => {
    const navigation = useNavigation();
    const user = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [appVersion, setAppVersion] = useState('');

    const handleLogout = async () => {
        setLoading(true);
        await AsyncStorage.removeItem('@user');
        user.setIsLoggedIn(false);
        user.setUserId(null);
        user.setUserName(null);
        user.setMobileNo(null);
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleDeleteAccount = async () => {
        setModalVisible(true);
    };

    const menuItems = [
        { title: 'Bookings', icon: 'shopping-cart', navigateTo: 'Bookings' },
        { title: 'My Cart', icon: 'shopping-bag', navigateTo: 'Cart' },
        { title: 'Saved Floor Plans', icon: 'save', navigateTo: 'SavedFloorPlans' },
        // { title: 'Projects', icon: 'layout', navigateTo: 'Projects' },
        { title: 'Profile Settings', icon: 'user', navigateTo: 'ProfileSettings' },
        { title: 'Refer & Earn', icon: 'gift', navigateTo: 'ReferEarn' },
        { title: 'Support & Contact Us', icon: 'headphones', navigateTo: 'SupportContact' },
        // { title: 'FAQ', icon: 'help-circle', navigateTo: 'FAQ' },
        { title: 'Terms & Policies', icon: 'file-text', navigateTo: 'PoliciesLegal' },
    ];

    useEffect(() => {
        const fetchVersion = async () => {
            const version = DeviceInfo.getVersion(); // e.g. "1.3"
            setAppVersion(version);
        };

        fetchVersion();
    }, []);



    return (
        <View style={styles.container}>
            <NavBar title="Profile" />
            {/* <View style={styles.profileHeader}>
                <Feather name="user" size={60} color="#fff" style={styles.avatar} />
                <View style={styles.userInfo}>

                    <Text style={styles.userName}>{user.isLoggedIn ? user.username : 'Guest'}</Text>
                    <Text style={styles.userEmail}>{user.isLoggedIn ? user.mobileNo : 'Sign in to explore'}</Text>
                </View>
                <View style={styles.topRightIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                        <Feather name="bell" size={28} color={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View> */}

            <Text style={[styles.userName, { color: '#000', textAlign: 'center', padding: 10 }]}>Welcome to SEEB</Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {user.isLoggedIn ? (
                    <>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate(item.navigateTo)}
                                style={styles.menuItem}
                            >
                                <View style={styles.menuContent}>
                                    <Feather name={item.icon} size={22} color={'#000'} />
                                    <Text style={styles.menuText}>{item.title}</Text>
                                </View>
                                <MaterialIcons name="keyboard-arrow-right" size={24} color={'#000'} />
                            </TouchableOpacity>
                        ))}

                        <View style={styles.bottomSection}>
                            <View style={styles.versionContainer}>
                                <Text style={styles.versionText}>App Version: {appVersion}</Text>
                            </View>
                        </View>

                        <View style={styles.bottomContainer}>
                            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                                <Feather name="log-out" size={22} color={'#d9534f'} />
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                                <Feather name="trash-2" size={22} color={'#d9534f'} />
                                <Text style={styles.logoutText}>Delete My Account</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                        <Feather name="log-in" size={22} color={'#fff'} />
                        <Text style={styles.loginText}>Login to Your Account</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <ModalInfo setModalVisible={setModalVisible} modalVisible={modalVisible} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fa',
        paddingTop: Top
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingVertical: 25,
        paddingHorizontal: 20,
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        elevation: 5,
        paddingTop: Platform.OS === 'ios' ? 70 : 0, // Adjust for iOS notch
    },
    avatar: { width: 60, height: 60, borderRadius: 40, backgroundColor: '#000' },
    userInfo: { marginLeft: 15 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    userEmail: { fontSize: 16, color: '#d1cfe2', marginTop: 3 },
    scrollContainer: { padding: 15 },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    menuContent: { flexDirection: 'row', alignItems: 'center' },
    menuText: { fontSize: 18, color: '#4a4a4a', marginLeft: 12 },
    bottomSection: { marginTop: 20, paddingHorizontal: 15 },
    versionContainer: { alignItems: 'center', marginVertical: 10 },
    versionText: { fontSize: 14, color: '#777' },
    bottomContainer: { marginTop: 20, paddingHorizontal: 15 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdecea',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff4f4',
        paddingVertical: 12,
        borderRadius: 8,
    },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: '#d9534f', marginLeft: 10 },
    topRightIcons: {
        flexDirection: 'row',
        position: 'absolute',
        right: 18,
        top: Platform.OS === 'ios' ? 80 : 15,
    },
});

export default Profile;