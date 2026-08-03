import { View, Linking, TouchableOpacity, Text, ActivityIndicator, StatusBar } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import LiveMap from '../../components/LiveMap'
import PlaceOrder from '../../components/PlaceOrder'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import BottomSheet from '../../components/BottomSheet'
import Header from '../../components/Header'
import { Truck } from 'lucide-react-native'

const Riders = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; role?: string } };

    const role = userdata?.role || 'customer';
    const isCustomer = role === 'customer';
    const primaryColorHex = isCustomer ? '#059669' : '#d97706';

    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const bottomSheetRef = useRef<any>(null);

    useEffect(() => {
        const fetchLocationFast = async () => {
            try {
                setLocating(true);
                const granted = await getLocationPermission();

                if (!granted) {
                    Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: 'Permission Chahiye',
                        textBody: 'Location permission settings mein on karein.',
                    });
                    Linking.openSettings();
                    return;
                }

                const locationPromise = getCurrentLocation();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000));

                const position = await Promise.race([locationPromise, timeoutPromise]) as any;
                const { latitude, longitude } = position.coords;

                setCoordinates({ latitude, longitude });
            } catch (error: any) {
                Toast.show({ type: ALERT_TYPE.WARNING, title: 'Location Nahi Mili', textBody: 'GPS on karein aur dobara try karein.' });
            } finally {
                setLocating(false);
            }
        };

        fetchLocationFast();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

            <View className="bg-white shadow-sm z-20 pb-2 rounded-b-[32px] border-b border-[#f1f5f9]">
                <Header />
            </View>

            <View style={{ flex: 1, position: 'relative' }}>
                {/* Pass real device location — no hardcoded Lahore coords */}
                <LiveMap coordinates={coordinates} pickupLocation={null} dropoffLocation={null} />

                {locating && (
                    <View className="absolute inset-0 justify-center items-center bg-black/20 z-50 backdrop-blur-sm">
                        <View className="bg-white p-6 rounded-[28px] items-center shadow-2xl border border-[#f1f5f9]">
                            <ActivityIndicator size="large" color={primaryColorHex} />
                            <Text className="text-gray-900 mt-4 font-black text-lg tracking-tight">Location mil rahi hai...</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={0.9}
                    className="absolute bottom-12 self-center flex-row items-center px-8 py-5 rounded-full shadow-2xl z-40"
                    style={{ backgroundColor: primaryColorHex, shadowColor: primaryColorHex }}
                    onPress={() => bottomSheetRef.current?.present?.()}
                >
                    <Truck color="#ffffff" size={22} strokeWidth={2.5} style={{ marginRight: 10 }} />
                    <Text className="font-black text-white text-lg tracking-wide">Naya Order</Text>
                </TouchableOpacity>

                <BottomSheet ref={bottomSheetRef}>
                    <View className="bg-white w-full rounded-t-[40px] pt-4 pb-8 px-6 flex-1">
                        <View className="w-12 h-1.5 bg-[#e2e8f0] rounded-full self-center mb-6" />
                        <PlaceOrder coordinates={coordinates} />
                    </View>
                </BottomSheet>
            </View>
        </View>
    )
}

export default Riders