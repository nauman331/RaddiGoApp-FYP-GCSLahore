import { View, Text, Image, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { Bell } from "lucide-react-native"
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import profileimg from "../assets/profile.png"
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Header: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { username?: string, role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const role = userdata?.role || 'customer';

    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const themeColors = {
        primary: role === 'collector' ? '#d97706' : '#10b981',
    };

    return (
        <View 
            style={{ paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 10 : 20) }} 
            className='w-full bg-white pb-4 px-5 flex-row items-center justify-between border-b border-gray-100'
        >
            <View className='flex-row items-center'>
                {/* Profile Picture with Status Indicator */}
                <View className='relative'>
                    <Image
                        // source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg}
                        source={profileimg}
                        alt="Profile Picture"
                        className='w-12 h-12 rounded-full bg-gray-100'
                    />
                    <View 
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                    />
                </View>
                
                {/* Greeting */}
                <View className='ml-3'>
                    <Text className='text-xs text-gray-500 font-medium mb-0.5'>Welcome back,</Text>
                    <Text className='text-lg font-extrabold text-gray-800 leading-tight'>
                        {userdata?.username || "User"}
                    </Text>
                </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                className='bg-gray-50 p-2.5 rounded-full relative'
            >
                <Bell size={22} color="#374151" strokeWidth={2} />
                {/* Unread Badge */}
                <View className='absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white' />
            </TouchableOpacity>
        </View>
    )
}

export default Header