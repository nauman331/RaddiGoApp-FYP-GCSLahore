import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import initialscreenimage from "../../assets/initialscreen.png"

const InitialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    return (
        <View className='flex-1 items-center justify-center bg-white rounded-lg p-2'>
            <Image
                source={initialscreenimage}
                accessibilityLabel="RaddiGo hero image"
                resizeMode="contain"
                className="w-full h-64"
            />
            <Text className='font-bold text-xl mt-16'>Collect Raddi and Earn on Every Pickup</Text>
            <Text className='text-slate-500 text-center mt-4 mx-5'>View nearby pickup requests, accept jobs, manage routes, and track your earnings.</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('SignIn')}
                className='bg-emerald-600 px-6 py-3 w-full rounded-full mt-20 mb-4'>
                <Text className='text-white font-semibold text-center'>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                className='bg-gray-200 px-6 py-3 w-full rounded-full'>
                <Text className='text-black font-semibold text-center'>Request Account</Text>
            </TouchableOpacity>
        </View>
    )
}

export default InitialScreen