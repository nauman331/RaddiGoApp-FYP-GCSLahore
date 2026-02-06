import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect } from 'react'
import Header from '../../components/Header'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { logout } from '../../store/slices/authSlice'
import { User } from '../../types/map'
import profileimg from "../../assets/profile.png"

const Profile = () => {
    const dispatch = useDispatch();
    const userdata = useSelector((state: RootState) => state.auth.userdata) as User | null;

    useEffect(() => {
    }, []);
    const handleLogout = () => {
        dispatch(logout());
    }
    return (
        <View className='bg-white rounded-2xl p-2 flex-1'>
            <Header />
            {/* Profile Banner and Profile Picture */}
            <View className='h-40 bg-emerald-600 justify-center items-center rounded-2xl'>
                <Text className='text-white text-2xl font-bold'>{userdata?.phone ?? "No phone number"}</Text>
            </View>
            <View className='-mt-12 justify-center items-center'>
                <View className='w-24 h-24 bg-white rounded-full border-4 border-white justify-center items-center shadow-lg'>
                    <Image source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg} className="w-24 h-24 rounded-full border-4 border-emerald-600" />
                </View>
            </View>
            {/* Profile Information */}
            <View className='mt-4 px-4 bg-gray-200 mx-2 p-4 rounded-2xl'>
                <Text className='text-2xl font-bold text-gray-800'>{userdata?.username ?? "User"}</Text>
                <Text className='text-emerald-600 font-semibold'>{userdata?.email ?? "No Email"}</Text>
                <Text className='mt-2 text-gray-600'>{userdata?.address ?? "No address"}</Text>
            </View>

            <View className='border-b border-gray-300 mt-6 mx-2' />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className='mb-16 px-2'>
                    <Text className='text-xl font-bold my-4 text-gray-800'>Social Links</Text>
                    <View className='flex-row flex-wrap gap-3'>
                        <View className='bg-white border-2 border-gray-300 p-4 rounded-2xl justify-center items-center flex-1 min-w-[30%] shadow-sm'>
                            <Text className='font-semibold text-gray-700'>Facebook</Text>
                        </View>
                        <View className='bg-white border-2 border-gray-300 p-4 rounded-2xl justify-center items-center flex-1 min-w-[30%] shadow-sm'>
                            <Text className='font-semibold text-gray-700'>Instagram</Text>
                        </View>
                        <View className='bg-white border-2 border-gray-300 p-4 rounded-2xl justify-center items-center flex-1 min-w-[30%] shadow-sm'>
                            <Text className='font-semibold text-gray-700'>YouTube</Text>
                        </View>
                    </View>

                    <View className='mt-6 gap-3'>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className='bg-white border-2 border-red-600 p-4 rounded-full justify-center items-center'>
                            <Text className='text-red-600 font-bold text-base'>Logout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='bg-red-100 border-2 border-red-800 p-4 rounded-full justify-center items-center'>
                            <Text className='text-red-800 font-bold text-base'>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Profile