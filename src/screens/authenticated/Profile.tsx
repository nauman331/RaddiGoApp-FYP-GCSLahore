import { View, Text, Image, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { logout } from '../../store/slices/authSlice'
import { resetRide } from '../../store/slices/rideSlice'
import { User } from '../../types/map'
import profileimg from "../../assets/profile.png"
import { useSubmit } from "../../apiHooks/useSubmit"
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Profile = () => {
    const dispatch = useDispatch();
    const userdata = useSelector((state: RootState) => state.auth.userdata) as User | null;
    const role = userdata?.role || 'customer';

    const iscollector = role === 'collector';
    const primaryColorHex = iscollector ? '#d97706' : '#059669';

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const { mutateAsync: deleteAccountMutate, isPending: isDeleting } = useSubmit({
        method: 'DELETE',
        endpoint: 'auth/api/v1/me/delete',
        isAuth: true, 
    });

    useEffect(() => {
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetRide());
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteAccountMutate({});
            
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Deleted',
                textBody: 'Your account has been permanently deleted.',
            });
            
            setIsDeleteModalVisible(false);
            
            dispatch(logout());
            dispatch(resetRide());
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Failed to delete account',
            });
        }
    }

    return (
        <View className='bg-white rounded-2xl p-2 flex-1'>
            <Header />
            {/* Profile Banner and Profile Picture */}
            <View className='h-40 justify-center items-center rounded-2xl' style={{ backgroundColor: primaryColorHex }}>
                <Text className='text-white text-2xl font-bold'>{userdata?.phone ?? "No phone number"}</Text>
                <Text className='text-white/80 text-sm mt-1 capitalize'>{role || 'User'} Account</Text>
            </View>
            <View className='-mt-12 justify-center items-center'>
                <View className='w-24 h-24 bg-white rounded-full border-4 border-white justify-center items-center shadow-lg'>
                    <Image
                        source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg}
                        className='w-24 h-24 rounded-full border-4'
                        style={{ borderColor: primaryColorHex }}
                    />
                </View>
            </View>
            {/* Profile Information */}
            <View className='mt-4 px-4 bg-gray-200 mx-2 p-4 rounded-2xl'>
                <Text className='text-2xl font-bold text-gray-800'>{userdata?.username ?? "User"}</Text>
                <Text className='font-semibold' style={{ color: primaryColorHex }}>{userdata?.email ?? "No Email"}</Text>
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
                        
                        {/* Open Delete Modal Button */}
                        <TouchableOpacity 
                            onPress={() => setIsDeleteModalVisible(true)}
                            className='bg-red-100 border-2 border-red-800 p-4 rounded-full justify-center items-center'>
                            <Text className='text-red-800 font-bold text-base'>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => {
                    if (!isDeleting) setIsDeleteModalVisible(false);
                }}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <Text className="text-xl font-bold text-gray-900 mb-2">Delete Account?</Text>
                        <Text className="text-gray-600 mb-6">
                            Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
                        </Text>
                        
                        <View className="flex-row gap-3">
                            {/* Cancel Button */}
                            <TouchableOpacity 
                                onPress={() => setIsDeleteModalVisible(false)}
                                disabled={isDeleting}
                                className="flex-1 bg-gray-200 py-3 rounded-xl items-center justify-center"
                            >
                                <Text className="font-bold text-gray-700">Cancel</Text>
                            </TouchableOpacity>

                            {/* Confirm Delete Button */}
                            <TouchableOpacity 
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 py-3 rounded-xl items-center justify-center flex-row"
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="font-bold text-white">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Profile