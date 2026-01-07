import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const requestUserPermission = async () => {
    try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            console.log('Android notification permission:', granted);
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            await getFCMToken();
            subscribeToTopic();
        } else {
            console.log('Notification permission denied');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
};

const getFCMToken = async () => {
    try {
        const token = await messaging().getToken();
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
    }
};

const subscribeToTopic = async () => {
    messaging()
        .subscribeToTopic('all_users')
        .then(() => console.log('Subscribed to topic: all_users'));
};

export const notificationListener = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage.notification);
            }
        });

    messaging().onMessage(async remoteMessage => {
        if (remoteMessage.notification) {
            Alert.alert('New Notification', remoteMessage.notification.body);
        }
    });
};

export const getLocationPermission = async () => {
    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (info) => {
                console.log("Location found:", info);
                // Permission works and we have location
                resolve(true);
            },
            (error) => {
                console.error('Error requesting location:', error);
                // Permission denied or GPS off
                resolve(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000
            }
        );
    });
}

export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (position) => {
                // Successfully got location
                resolve(position);
            },
            (error) => {
                // Failed to get location
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000
            }
        );
    });
};