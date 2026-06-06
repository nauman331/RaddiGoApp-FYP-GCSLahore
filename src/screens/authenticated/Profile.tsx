import { View, Text, Image, ScrollView, TouchableOpacity, Modal, ActivityIndicator, StatusBar } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { logout } from '../../store/slices/authSlice'
import { resetRide } from '../../store/slices/rideSlice'
import { User } from '../../types/map'
import profileimg from "../../assets/profile.png"
import { useSubmit } from "../../apiHooks/useSubmit"
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { Mail, MapPin, Phone, LogOut, Trash2, ChevronRight, Facebook, Instagram, Youtube, ShieldCheck } from 'lucide-react-native'

const Profile = () => {
    const dispatch = useDispatch();
    const userdata = useSelector((state: RootState) => state.auth.userdata) as User | null;
    const role = userdata?.role || 'customer';

    const iscollector = role === 'collector';
    
    // Theme Colors
    const primaryColorHex = iscollector ? '#d97706' : '#059669';
    const primaryLightHex = iscollector ? '#fef3c7' : '#dcfce7';

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const { mutateAsync: deleteAccountMutate, isPending: isDeleting } = useSubmit({
        method: 'DELETE',
        endpoint: 'auth/api/v1/me/delete',
        isAuth: true, 
    });

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
        <View className='flex-1 bg-gray-50'>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                
                {/* 1. Profile Hero Section - Resized and Smoothed */}
                <View className='bg-white pt-2 pb-6 items-center border-b border-gray-100 shadow-sm rounded-b-3xl'>
                    <View className='relative mt-2'>
                        {/* Scaled down container (w-24 = 96px) */}
                        <View className='w-24 h-24 rounded-full items-center justify-center' style={{ backgroundColor: primaryLightHex }}>
                            {/* Scaled down image (w-20 = 80px) */}
                            <Image
                                source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg}
                                className='w-20 h-20 rounded-full border-2 border-white bg-white'
                                resizeMode="cover"
                            />
                        </View>
                        {/* Verified Badge */}
                        <View className='absolute bottom-0 right-1 p-1 rounded-full border-2 border-white' style={{ backgroundColor: primaryColorHex }}>
                            <ShieldCheck size={14} color="#ffffff" />
                        </View>
                    </View>

                    <Text className='mt-3 text-xl font-extrabold text-gray-900'>
                        {userdata?.username ?? "User"}
                    </Text>
                    
                    <View className='mt-1.5 px-3 py-1 rounded-full' style={{ backgroundColor: primaryLightHex }}>
                        <Text className='font-bold text-[10px] uppercase tracking-widest' style={{ color: primaryColorHex }}>
                            {role}
                        </Text>
                    </View>
                </View>

                {/* 2. Personal Information Card */}
                <View className='px-5 mt-6'>
                    <Text className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1'>Personal Details</Text>
                    
                    <View className='bg-white rounded-3xl px-2 py-1 border border-gray-100 shadow-sm'>
                        <View className='flex-row items-center py-3.5 px-3 border-b border-gray-50'>
                            <View className='p-2.5 bg-gray-50 rounded-full mr-3'>
                                <Phone size={18} color="#4b5563" />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5'>Phone</Text>
                                <Text className='text-gray-900 font-bold text-sm'>{userdata?.phone ?? "Not provided"}</Text>
                            </View>
                        </View>

                        <View className='flex-row items-center py-3.5 px-3 border-b border-gray-50'>
                            <View className='p-2.5 bg-gray-50 rounded-full mr-3'>
                                <Mail size={18} color="#4b5563" />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5'>Email</Text>
                                <Text className='text-gray-900 font-bold text-sm'>{userdata?.email ?? "Not provided"}</Text>
                            </View>
                        </View>

                        <View className='flex-row items-center py-3.5 px-3'>
                            <View className='p-2.5 bg-gray-50 rounded-full mr-3'>
                                <MapPin size={18} color="#4b5563" />
                            </View>
                            <View className='flex-1 pr-2'>
                                <Text className='text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5'>Address</Text>
                                <Text className='text-gray-900 font-bold text-sm leading-tight' numberOfLines={2}>
                                    {userdata?.address ?? "No address added yet"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 3. Social Integration */}
                <View className='px-5 mt-6'>
                    <Text className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1'>Social Accounts</Text>
                    
                    <View className='bg-white rounded-3xl p-1.5 border border-gray-100 shadow-sm'>
                        {[
                            { name: 'Facebook', icon: Facebook, color: '#1877F2' },
                            { name: 'Instagram', icon: Instagram, color: '#E4405F' },
                            { name: 'YouTube', icon: Youtube, color: '#FF0000' }
                        ].map((social, index) => (
                            <TouchableOpacity 
                                key={social.name} 
                                activeOpacity={0.6}
                                className={`flex-row items-center justify-between p-3.5 ${index !== 2 ? 'border-b border-gray-50' : ''}`}
                            >
                                <View className='flex-row items-center'>
                                    <View className='p-2 rounded-full mr-3' style={{ backgroundColor: `${social.color}15` }}>
                                        <social.icon size={18} color={social.color} />
                                    </View>
                                    <Text className='text-gray-800 font-bold text-sm'>{social.name}</Text>
                                </View>
                                <ChevronRight size={18} color="#d1d5db" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 4. Danger Zone */}
                <View className='px-5 mt-8 space-y-3 mb-6'>
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        className='bg-red-50 py-3.5 rounded-2xl flex-row justify-center items-center'
                    >
                        <LogOut size={18} color="#dc2626" />
                        <Text className='text-red-600 font-extrabold text-sm ml-2'>Log Out</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => setIsDeleteModalVisible(true)}
                        activeOpacity={0.7}
                        className='bg-white border border-red-100 py-3.5 rounded-2xl flex-row justify-center items-center shadow-sm mt-3'
                    >
                        <Trash2 size={18} color="#991b1b" />
                        <Text className='text-red-800 font-bold text-sm ml-2'>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* 5. Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => { if (!isDeleting) setIsDeleteModalVisible(false); }}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-5">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl items-center">
                        <View className='w-14 h-14 bg-red-100 rounded-full items-center justify-center mb-4'>
                            <Trash2 size={24} color="#dc2626" />
                        </View>
                        
                        <Text className="text-xl font-extrabold text-gray-900 mb-2 text-center">Delete Account?</Text>
                        <Text className="text-gray-500 text-center text-sm leading-relaxed mb-6 px-2">
                            Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all your data.
                        </Text>
                        
                        <View className="flex-row gap-3 w-full">
                            <TouchableOpacity 
                                onPress={() => setIsDeleteModalVisible(false)}
                                disabled={isDeleting}
                                className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center justify-center"
                            >
                                <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 py-3.5 rounded-2xl items-center justify-center flex-row"
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="font-bold text-white text-sm">Delete</Text>
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