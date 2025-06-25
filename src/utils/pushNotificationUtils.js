import messaging from "@react-native-firebase/messaging"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native";
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from 'react-native-geolocation-service';

const GOOGLE_API_KEY = "AIzaSyCL4WKtPMGh93MPjMLRB4sqaKsEH29AwdI";

export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
        console.log("Auth status=>", authStatus);
    }
}

async function GetFCMToken() {
    let fcmtoken = await AsyncStorage.getItem("fcmtoken");
    console.log("fcm token old", fcmtoken);
    if (!fcmtoken) {
        try {
            const fcmtoken = await messaging().getToken();
            if (fcmtoken) {
                console.log("fcm token new", JSON.stringify(fcmtoken));
                await AsyncStorage.setItem("fcmtoken", fcmtoken);
            }
        } catch (error) {
            console.log("error in generating fcmtoken=>", error);
        }
    }
}
export async function DisplayNotification(remoteMessage) {
    const channelId = await notifee
}
export const NotificationListener = () => {
    GetFCMToken()
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log("Notification caused app to open from background:", remoteMessage.notification);

    });
    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log("Notiifcation caused the app to open from quit state:", remoteMessage.notification);

        }

    })

    messaging().onMessage(async remoteMessage => {
        console.log("notification on foreground state:", remoteMessage);
        if (Platform.OS == "ios") {

            PushNotificationIOS.addNotificationRequest({
                id: "specialid",
                body: remoteMessage.notification.body,
                title: remoteMessage.notification.title,
                sound: 'default'
            });

        } else {
            
            PushNotification.createChannel(
                {
                    channelId: "specialid", // (required)
                    channelName: "Special messasge", // (required)
                    channelDescription: "Notification for special message", // (optional) default: undefined.
                    importance: 4, // (optional) default: 4. Int value of the Android notification importance
                    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
                },
                (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
            );
            PushNotification.localNotification({
                channelId: "specialid",
                channelName: "Special message",
                title: remoteMessage.notification.title,
                message: remoteMessage.notification.body
            })
        }
    })
}

export async function requestLocationPermission() {
    const permission = Platform.OS === "android" 
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION 
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
        console.log("Location permission granted");
        getLocation();
    } else {
        Alert.alert("Permission Denied", "Please enable location permission to use this feature.");
    }
}

// Fetch user location
// async function getLocation() {
//     Geolocation.getCurrentPosition(
//         async (position) => {
//             const { latitude, longitude } = position.coords;
//             console.log("User Location:", latitude, longitude);
//             await AsyncStorage.setItem("user_location", JSON.stringify({ latitude, longitude }));
//         },
//         (error) => {
//             console.log("Location Error:", error);
//         },
//         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//     );
// }

const getLocation = async () => {
    try {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Latitude:", latitude, "Longitude:", longitude);

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                    );
                    const data = await response.json();

                    let address = 'Pune, Maharashtra'; // Default location
                    if (data.status === "OK" && data.results.length > 0) {
                        address = data.results[0].formatted_address;
                    }

                    console.log("Accurate Location:", address);
                    await AsyncStorage.setItem("user_location", JSON.stringify({ latitude, longitude, address }));

                } catch (error) {
                    console.error("Geocoding Error:", error);
                    await AsyncStorage.setItem("user_location", JSON.stringify({ latitude, longitude }));
                }
            },
            async (error) => {
                console.log("Location Error:", error);
                await AsyncStorage.setItem("user_location", JSON.stringify({ error: "Unable to fetch location" }));
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
        );
    } catch (error) {
        console.log("Unexpected Error:", error);
    }
};