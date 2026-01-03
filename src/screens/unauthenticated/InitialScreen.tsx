import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import initialscreenimage from "../../assets/initialscreen.png"

const InitialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    return (
        <View className='flex-1 items-center justify-center bg-white rounded-lg p-2'>
            <Image source={initialscreenimage} className="w-full h-64 object-contain" />
            <Text className='font-bold text-xl mt-16'>Sell Your Raddi Without Leaving Home</Text>
            <Text className='text-slate-500 text-center mt-4 mx-5'>Our riders come to you! Just place an order, sit back, and relax.</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('SignIn')}
                className='bg-emerald-600 px-6 py-3 w-full rounded-full mt-20 mb-4'>
                <Text className='text-white font-semibold text-center'>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity className='bg-gray-200 px-6 py-3 w-full rounded-full'>
                <Text className='text-black font-semibold text-center'>Learn More</Text>
            </TouchableOpacity>
        </View>
    )
}

export default InitialScreen