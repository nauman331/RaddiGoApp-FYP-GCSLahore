import { View, Text, TouchableOpacity, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Bell, MapPin, ChevronDown } from "lucide-react-native"
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getCurrentLocation, getLocationPermission } from '../utils/getPermissions'

const FALLBACK_ADDRESS = "Lahore, Pakistan";

const Header: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { address?: string, role?: string } };
    const rideState = useSelector((state: RootState) => state.ride) as any;
    const role = userdata?.role || 'customer';

    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const primaryColorHex = role === 'collector' ? '#d97706' : '#059669';
    const primaryLightHex = role === 'collector' ? '#fffbeb' : '#ecfdf5';

    const [displayAddress, setDisplayAddress] = useState<string>('Location dhoondh rahe hain...');

    const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                { headers: { 'User-Agent': 'RaddiGoApp/1.0' } }
            );
            const data = await response.json();
            
            if (data && data.address) {
                const street = data.address.road || data.address.suburb || data.address.neighbourhood || '';
                const city = data.address.city || data.address.town || data.address.village || '';
                const finalAddress = [street, city].filter(Boolean).join(', ');
                setDisplayAddress(finalAddress || FALLBACK_ADDRESS);
            } else {
                setDisplayAddress(FALLBACK_ADDRESS);
            }
        } catch (error) {
            setDisplayAddress(FALLBACK_ADDRESS);
        }
    };

    useEffect(() => {
        const getLiveAddress = async () => {
            const reduxLocation = role === 'collector' ? rideState?.collectorLocation : rideState?.customerLocation;
            
            if (reduxLocation?.latitude && reduxLocation?.longitude) {
                await fetchAddressFromCoords(reduxLocation.latitude, reduxLocation.longitude);
                return;
            }

            if (userdata?.address) {
                setDisplayAddress(userdata.address);
                return;
            }

            try {
                const granted = await getLocationPermission();
                if (!granted) {
                    setDisplayAddress("Location ki ijazat nahi mili");
                    return;
                }

                const locationPromise = getCurrentLocation();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
                
                const position = await Promise.race([locationPromise, timeoutPromise]) as any;
                const { latitude, longitude } = position.coords;
                
                await fetchAddressFromCoords(latitude, longitude);
            } catch (error) {
                setDisplayAddress(FALLBACK_ADDRESS);
            }
        };

        getLiveAddress();
    }, [rideState?.customerLocation, rideState?.collectorLocation]);

    return (
        <View 
            style={{ paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 10 : 20) }} 
            className="w-full bg-transparent pb-2 px-6 flex-row items-center justify-between"
        >
            <TouchableOpacity 
                activeOpacity={0.7}
                className="flex-row items-center flex-1 pr-4"
            >
                <View 
                    className="w-12 h-12 rounded-[16px] items-center justify-center mr-3 shadow-sm"
                    style={{ backgroundColor: primaryLightHex }}
                >
                    <MapPin size={22} color={primaryColorHex} strokeWidth={2.5} />
                </View>
                
                <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-0.5">
                        <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mr-1">
                            Mojooda Jagah
                        </Text>
                        <ChevronDown size={14} color="#94a3b8" strokeWidth={3} />
                    </View>
                    <Text className="text-gray-900 font-black text-sm tracking-tight" numberOfLines={1}>
                        {displayAddress}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Notifications')}
                className="bg-white w-12 h-12 items-center justify-center rounded-[16px] border border-[#f1f5f9] shadow-sm relative"
            >
                <Bell size={22} color="#0f172a" strokeWidth={2.5} />
                <View className="absolute top-2.5 right-3 w-3 h-3 bg-red-500 rounded-full border-[2.5px] border-white shadow-sm" />
            </TouchableOpacity>
        </View>
    )
}

export default Header