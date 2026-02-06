import { View, Linking, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import LiveMap from '../../components/LiveMap'
import PlaceOrder from '../../components/PlaceOrder'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import BottomSheet from '../../components/BottomSheet'
import Header from '../../components/Header'
import { Truck } from 'lucide-react-native'


const Riders = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const pickupLocation = { latitude: 31.5204, longitude: 74.3587 }; // Fortress Stadium, Lahore
    const dropoffLocation = { latitude: 31.4695, longitude: 74.2645 }; // Packages Mall, Lahore
    // add a ref to control the BottomSheet
    const bottomSheetRef = useRef<any>(null);
    const [locating, setLocating] = useState(false);

    const locationHandler = async () => {
        try {
            setLocating(true);
            const granted = await getLocationPermission();

            if (!granted) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Permission Denied',
                    textBody: 'Location permission is required.',
                });
                Linking.openSettings();
                return;
            }
            const position = await getCurrentLocation();
            const { latitude, longitude } = (position as { coords: { latitude: number; longitude: number } }).coords;
            setCoordinates({
                longitude: longitude,
                latitude: latitude
            });
        } catch (error) {

        } finally {
            setLocating(false);
        }
    };

    useEffect(() => {
        locationHandler();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Header />
            <LiveMap pickupLocation={pickupLocation} dropoffLocation={dropoffLocation} />

            {/* Locating overlay */}
            {locating && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 60 }}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            )}

            <TouchableOpacity
                activeOpacity={0.9}
                className="absolute bottom-28 self-center flex-row items-center bg-emerald-600 border border-white px-8 py-5 rounded-full shadow-lg z-50"
                onPress={() => bottomSheetRef.current?.present?.()}
            >
                <Truck color="#fff" size={20} strokeWidth={2} style={{ marginRight: 8 }} />
                <Text className="font-bold text-white">Place Order</Text>
            </TouchableOpacity>

            <BottomSheet ref={bottomSheetRef}>
                <PlaceOrder coordinates={coordinates} />
            </BottomSheet>
        </View>
    )
}

export default Riders