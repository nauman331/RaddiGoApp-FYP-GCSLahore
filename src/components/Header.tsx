import { View, Text, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { Bell, MapPin, ChevronDown } from "lucide-react-native"
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Header: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { address?: string, role?: string } };
    const role = userdata?.role || 'customer';

    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const primaryColorHex = role === 'collector' ? '#d97706' : '#059669';
    const primaryLightHex = role === 'collector' ? '#fffbeb' : '#ecfdf5';

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
                    className="w-11 h-11 rounded-[16px] items-center justify-center mr-3"
                    style={{ backgroundColor: primaryLightHex }}
                >
                    <MapPin size={20} color={primaryColorHex} strokeWidth={2.5} />
                </View>
                
                <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-0.5">
                        <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mr-1">
                            Current Location
                        </Text>
                        <ChevronDown size={12} color="#9ca3af" strokeWidth={3} />
                    </View>
                    <Text className="text-gray-900 font-black text-sm tracking-tight" numberOfLines={1}>
                        {userdata?.address || "Fetching your location..."}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Notifications')}
                className="bg-[#f8fafc] w-11 h-11 items-center justify-center rounded-[16px] border border-gray-100 shadow-sm relative"
            >
                <Bell size={20} color="#374151" strokeWidth={2.5} />
                <View className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-[2.5px] border-[#f8fafc]" />
            </TouchableOpacity>
        </View>
    )
}

export default Header