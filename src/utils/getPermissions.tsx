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
    try {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs access to your location to provide live tracking.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
            // iOS: request authorization if available
            try {
                const auth = (Geolocation as any).requestAuthorization?.();
                if (auth) {
                    return auth === 'granted' || auth === 'always' || auth === 'whenInUse';
                }
            } catch (e) {
                // fallthrough
            }
            // If requestAuthorization not available, assume permission will be requested when getting location
            return true;
        }
    } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
    }
}

export const getCurrentLocation = async (): Promise<any> => {
    const tryGet = (opts: { enableHighAccuracy: boolean; timeout: number; maximumAge?: number }) =>
        new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error),
                opts
            );
        });

    // Attempt 1: Fast Network/Cell location + Cached location (Instant <200ms on Android)
    try {
        return await tryGet({ enableHighAccuracy: false, timeout: 3000, maximumAge: 120000 });
    } catch (err1) {
        // Attempt 2: High accuracy GPS provider (if network fix failed)
        try {
            return await tryGet({ enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 });
        } catch (err2) {
            // Attempt 3: Any cached position within last 10 minutes
            return await tryGet({ enableHighAccuracy: false, timeout: 2000, maximumAge: 600000 });
        }
    }
};