import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useCallback } from 'react'
import Header from '../../components/Header'
import EmptyPic from "../../assets/homeempty.png"
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

const Home: React.FC = ({ navigation }: any) => {
    const { isConnected } = useSelector((state: RootState) => state.socket);


    return (
        <View className='bg-white rounded-2xl p-2 flex-1'>
            <Header />
            {/* two boxes above */}
            <View className='flex-row justify-between my-4 px-2'>
                <View className='bg-white border-2 border-emerald-600 rounded-2xl p-4 flex-1 mr-2 shadow-sm'>
                    <Text className='text-emerald-600 text-lg font-bold mb-2'>Total Orders</Text>
                    <Text className='text-gray-800 text-2xl font-bold'>24</Text>
                    <Text className='text-gray-600 text-sm mt-1'>This month</Text>
                </View>
                <View className='bg-white border-2 border-amber-600 rounded-2xl p-4 flex-1 ml-2 shadow-sm'>
                    <Text className='text-amber-600 text-lg font-bold mb-2'>Earnings</Text>
                    <Text className='text-gray-800 text-2xl font-bold'>PKR 450</Text>
                    <Text className='text-gray-600 text-sm mt-1'>This month</Text>
                </View>
            </View>

            <TouchableOpacity
                className={`bg-emerald-600 rounded-2xl p-4 mx-2 my-4 shadow-sm ${!isConnected ? "opacity-80" : ""}`}
                onPress={() => navigation.navigate('Riders')}
            >
                <Text className='text-white text-center font-bold text-lg'>{isConnected ? "New Order" : "Connecting..."}</Text>
            </TouchableOpacity>

            <View className='border-b border-gray-300 my-4 mx-2' />

            <View className='flex-1 justify-center items-center px-2 mb-16'>
                <View className='flex-row justify-between w-full px-2 mb-4'>
                    <Text className='font-bold text-gray-800 text-lg'>Current Orders</Text>
                    <Text className='text-emerald-600 font-semibold'>See All</Text>
                </View>
                <View className='border border-gray-200 rounded-2xl p-6 w-full items-center'>
                    <Image source={EmptyPic} className='w-40 h-40 my-5' />
                    <Text className='text-gray-600 text-lg font-semibold'>No Orders Available</Text>
                    <Text className='text-gray-400 text-sm mt-2'>Your active orders will appear here</Text>
                </View>
            </View>
        </View>
    )
}

export default Home