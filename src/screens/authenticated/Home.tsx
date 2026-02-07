import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import Header from '../../components/Header'
import EmptyPic from "../../assets/homeempty.png"
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

const Home: React.FC = ({ navigation }: any) => {
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'seller'; // Default to seller if role not set

    // Role-based theme colors
    const isBuyer = role === 'buyer';
    const primaryColor = isBuyer ? 'amber' : 'emerald';
    const secondaryColor = isBuyer ? 'emerald' : 'amber';
    const primaryColorHex = isBuyer ? '#d97706' : '#059669';


    return (
        <View className='bg-white rounded-2xl p-2 flex-1'>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Header />
            {/* two boxes above */}
            <View className='flex-row justify-between my-4 px-2'>
                <View className='bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border-2' style={{ borderColor: primaryColorHex }}>
                    <Text className='text-lg font-bold mb-2' style={{ color: primaryColorHex }}>
                        {isBuyer ? 'Total Requests' : 'Total Orders'}
                    </Text>
                    <Text className='text-gray-800 text-2xl font-bold'>0</Text>
                    <Text className='text-gray-600 text-sm mt-1'>This month</Text>
                </View>
                <View className='bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border-2' style={{ borderColor: isBuyer ? '#10b981' : '#f59e0b' }}>
                    <Text className='text-lg font-bold mb-2' style={{ color: isBuyer ? '#10b981' : '#f59e0b' }}>
                        {isBuyer ? 'Saved Money' : 'Earnings'}
                    </Text>
                    <Text className='text-gray-800 text-2xl font-bold'>PKR 0</Text>
                    <Text className='text-gray-600 text-sm mt-1'>This month</Text>
                </View>
            </View>

            <TouchableOpacity
                className='rounded-2xl p-4 mx-2 my-4 shadow-sm'
                style={{ backgroundColor: primaryColorHex, opacity: isConnected ? 1 : 0.8 }}
                onPress={() => navigation.navigate('Ride')}
            >
                <Text className='text-white text-center font-bold text-lg'>
                    {isConnected
                        ? (isBuyer ? "Request Pickup" : "View Orders")
                        : "Connecting..."}
                </Text>
            </TouchableOpacity>

            <View className='border-b border-gray-300 my-4 mx-2' />

            <View className='flex-1 justify-center items-center px-2 mb-16'>
                <View className='flex-row justify-between w-full px-2 mb-4'>
                    <Text className='font-bold text-gray-800 text-lg'>
                        {isBuyer ? 'My Requests' : 'My Orders'}
                    </Text>
                    <Text className='font-semibold' style={{ color: primaryColorHex }}>See All</Text>
                </View>
                <View className='border border-gray-200 rounded-2xl p-6 w-full items-center'>
                    <Image source={EmptyPic} className='w-40 h-40 my-5' />
                    <Text className='text-gray-600 text-lg font-semibold'>
                        {isBuyer ? 'No Requests Available' : 'No Orders Available'}
                    </Text>
                    <Text className='text-gray-400 text-sm mt-2'>
                        {isBuyer
                            ? 'Your pickup requests will appear here'
                            : 'Your active orders will appear here'}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default Home