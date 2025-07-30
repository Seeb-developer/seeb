// src/utils/NotificationHelper.js

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, PermissionsAndroid, Platform, Linking} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { GOOGLE_API_KEY } from '@env';

/** 🔐 Request permission + get token */
export async function requestUserPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('❌ Notification permission denied on Android 13+');
            return;
        } else {
            console.log('✅ Android 13+ notification permission granted');
        }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('✅ Firebase permission granted');
        await registerFCMToken();
    } else {
        console.warn('❌ Firebase permission denied');
    }
}

/** 📲 Get + store FCM token */
export async function registerFCMToken() {
    try {
        let token = await AsyncStorage.getItem('fcmtoken');
        if (!token) {
            if (Platform.OS === 'ios') {
                await messaging().registerDeviceForRemoteMessages();
            }
            token = await messaging().getToken();
            if (token) {
                console.log('📱 New FCM Token:', token);
                await AsyncStorage.setItem('fcmtoken', token);
            }
        } else {
            console.log('🔁 Existing FCM Token:', token);
        }
    } catch (err) {
        console.error('❌ Error fetching token:', err);
    }
}

export function setupNotificationListeners(navigation) {
    // 1. Foreground message
    messaging().onMessage(async message => {
        console.log('📥 Foreground message:', message);

        const { screen, id, title, body } = message.data || {};

        // Get current route name
        const currentRoute = navigation.getCurrentRoute?.()?.name;

        // If on TicketChat screen and same ticketId, skip notification
        if (screen === 'TicketChat' && currentRoute === 'TicketChat') {
            console.log('🟡 Already on TicketChat — skipping notification');
            return;
        }

        // Otherwise show notification
        await displayNotification(message);
    });

    // 2. When user taps a notification while app is in background
    messaging().onNotificationOpenedApp(message => {
        console.log('📲 Opened from background:', message?.data);
        const { screen, id } = message.data || {};
        if (screen === 'TicketChat' && id) {
            navigation.navigate('TicketChat', { ticketId: id });
        }
    });

    // 3. When app launches from quit state due to tap
    messaging()
        .getInitialNotification()
        .then(message => {
            if (message) {
                console.log('🛑 Opened from quit:', message?.data);
                const { screen, id } = message.data || {};
                if (screen === 'TicketChat' && id) {
                    navigation.navigate('TicketChat', { ticketId: id });
                }
            }
        });

    // 4. Notifee tap while app in foreground
    notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            const { screen, id } = detail.notification?.data || {};
            console.log('👆 Notifee foreground press:', detail.notification?.data);
            if (screen === 'TicketChat' && id) {
                navigation.navigate('TicketChat', { ticketId: id });
            }
        }
    });
}

/** 🛠 Background message handler (in index.js) */
export const backgroundMessageHandler = async remoteMessage => {
    console.log('📤 Background message:', remoteMessage);

    const { title, body } = remoteMessage.data || remoteMessage.notification || {};

    await displayNotification(remoteMessage);

    const existing = await AsyncStorage.getItem('notifications');
    const parsed = existing ? JSON.parse(existing) : [];

    // const newNotification = {
    //   id: Date.now(),
    //   title: title || 'Seeb Notification',
    //   message: body || 'You got a new message!',
    //   time: new Date().toISOString(),
    //   icon: 'notifications-outline',
    //   read: false,
    // };

    // await AsyncStorage.setItem('notifications', JSON.stringify([newNotification, ...parsed]));
};


export async function displayNotification(remoteMessage) {
    try {
        const { title, body } =
            remoteMessage.data || remoteMessage.notification || {};

        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });

        await notifee.displayNotification({
            title: title || 'Seeb Notification',
            body: body || 'You have a new message!',
            android: {
                channelId,
                sound: 'default',
                pressAction: { id: 'default' },
                smallIcon: 'ic_launcher',
            },
            ios: {
                sound: 'default',
            },
            data: remoteMessage.data || {}, // important for onForegroundEvent
        });
    } catch (err) {
        console.error('❌ displayNotification error:', err);
    }
}


export const getLocation = async () => {
    try {
        Geolocation.requestAuthorization('whenInUse'); // ✅ Required for iOS

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("📍 Location:", latitude, longitude);

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                    );
                    const data = await response.json();

                    let address = 'Unknown Location';
                    if (data.status === "OK" && data.results.length > 0) {
                        address = data.results[0].formatted_address;
                    }

                    const locationData = { latitude, longitude, address };
                    await AsyncStorage.setItem("user_location", JSON.stringify(locationData));

                    console.log("📫 Location Saved:", locationData);
                } catch (error) {
                    console.error("❌ Reverse Geocoding Error:", error);
                    await AsyncStorage.setItem("user_location", JSON.stringify({ latitude, longitude }));
                }
            },
            async (error) => {
                console.log("❌ Location Error:", error);
                Alert.alert(
                    "Location Error",
                    "Please enable location access in settings.",
                    [
                        {
                            text: "Open Settings",
                            onPress: () => Linking.openSettings(),
                        },
                        { text: "Cancel", style: "cancel" }
                    ]
                );
                await AsyncStorage.setItem("user_location", JSON.stringify({ error: error.message }));
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 10000,
                forceRequestLocation: true,
                showLocationDialog: true,
            }
        );
    } catch (err) {
        console.error("❌ Unexpected Error in getLocation:", err);
    }
};


