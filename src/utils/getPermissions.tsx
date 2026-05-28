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

export const getCurrentLocation = () => {
    const tryGet = (opts: { enableHighAccuracy: boolean; timeout: number; maximumAge?: number }) => new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            opts
        );
    });

    return tryGet({ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }).catch(async (err1) => {
        console.warn('First location attempt failed, retrying with longer timeout', err1);
        try {
            return await tryGet({ enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 });
        } catch (err2) {
            console.warn('Second location attempt failed, trying low-accuracy fallback', err2);
            try {
                return await tryGet({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
            } catch (err3) {
                console.warn('Low-accuracy attempt failed, trying watchPosition as last resort', err3);
                 return new Promise((resolve, reject) => {
                    let didRespond = false;
                    const watchId = Geolocation.watchPosition(
                        (pos) => {
                            if (!didRespond) {
                                didRespond = true;
                                Geolocation.clearWatch(watchId);
                                resolve(pos);
                            }
                        },
                        (err) => {
                            if (!didRespond) {
                                didRespond = true;
                                Geolocation.clearWatch(watchId);
                                reject(err);
                            }
                        },
                        { enableHighAccuracy: false, distanceFilter: 0, interval: 5000, fastestInterval: 2000 }
                    );

                    // safety timeout
                    setTimeout(() => {
                        if (!didRespond) {
                            didRespond = true;
                            Geolocation.clearWatch(watchId);
                            reject({ code: 3, message: 'Location request timed out (watch fallback).' });
                        }
                    }, 20000);
                });
            }
        }
    });
};