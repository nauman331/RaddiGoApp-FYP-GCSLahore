import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import ProfilePic from "../assets/logo.png"
import { Bell } from "lucide-react-native"
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

const Header: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { username?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);

    return (
        <View className='w-full bg-transparent py-4 px-4 flex-row items-center justify-between'>
            <View className='flex-row items-center'>
                <Image
                    source={ProfilePic}
                    accessibilityLabel="Profile Picture"
                    className='w-12 h-12 rounded-full border-2 border-gray-300'
                />
                <View className='ml-2'>
                    <Text className='text-lg font-semibold'>Hi {userdata?.username || "User"}</Text>
                    <Text className={`text-sm font-bold ${isConnected ? "text-green-500" : "text-red-500"}    `}>{isConnected ? "Online" : "Offline"}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => console.log("Notifications")}
                className='bg-gray-100 border-2 border-gray-300 p-2 rounded-full relative'>
                <Bell size={16} color="#4B5563" />
                <View className='absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center'>
                    <Text className='text-white text-xs font-bold'>3</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default Header