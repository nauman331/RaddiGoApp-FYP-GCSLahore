import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Bell } from "lucide-react-native"
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import profileimg from "../assets/profile.png"

const Header: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { username?: string, role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const role = userdata?.role || 'customer';

    const themeColors = {
        primary: role === 'collector' ? '#d97706' : '#10b981',
        primaryLight: role === 'collector' ? '#fbbf24' : '#34d399',
    };

    return (
        <View className='w-full bg-transparent py-4 px-4 flex-row items-center justify-between'>
            <View className='flex-row items-center'>
                <Image
                    source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg}
                    alt="Profile Picture"
                    className='w-12 h-12 rounded-full border-2 border-gray-300'
                />
                <View className='ml-2'>
                    <Text className='text-lg font-semibold'>Hi {userdata?.username || "User"}</Text>
                    <Text className={`text-sm font-bold ${isConnected ? "text-green-500" : "text-red-500"}    `}>{isConnected ? "Online" : "Offline"}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => console.log("Notifications")}
                style={{
                    backgroundColor: '#f3f4f6',
                    borderWidth: 2,
                    borderColor: themeColors.primaryLight,
                    padding: 8,
                    borderRadius: 9999,
                    position: 'relative'
                }}>
                <Bell size={16} color="#4B5563" />
                <View style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    width: 15,
                    height: 15,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text className='text-white text-xs font-bold'>3</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default Header