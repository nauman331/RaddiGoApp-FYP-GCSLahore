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
import { Mail, MapPin, Phone, LogOut, Trash2, ChevronRight, Facebook, Instagram, Youtube, ShieldCheck, User as UserIcon } from 'lucide-react-native'

const Profile = () => {
    const dispatch = useDispatch();
    const userdata = useSelector((state: RootState) => state.auth.userdata) as User | null;
    const role = userdata?.role || 'customer';
    const isCollector = role === 'collector';
    
    const primaryColorHex = isCollector ? '#d97706' : '#059669';
    const primaryLightHex = isCollector ? '#fffbeb' : '#ecfdf5';

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

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, color: '#1877F2' },
        { name: 'Instagram', icon: Instagram, color: '#E4405F' },
        { name: 'YouTube', icon: Youtube, color: '#FF0000' }
    ];

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            
            <View className="bg-white pt-2 pb-8 items-center shadow-sm rounded-b-[32px] z-10 border-b border-gray-100">
                <Header />
                
                <View className="relative mt-6">
                    <View className="w-28 h-28 rounded-full items-center justify-center border-2 border-gray-50 shadow-sm" style={{ backgroundColor: primaryLightHex }}>
                        <Image
                            source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg}
                            className="w-[104px] h-[104px] rounded-full bg-white"
                            resizeMode="cover"
                        />
                    </View>
                    <View className="absolute bottom-1 right-1 p-1.5 rounded-full border-[3px] border-white shadow-sm" style={{ backgroundColor: primaryColorHex }}>
                        <ShieldCheck size={16} color="#ffffff" strokeWidth={3} />
                    </View>
                </View>

                <Text className="mt-5 text-2xl font-black text-gray-900 tracking-tight">
                    {userdata?.username ?? "User"}
                </Text>
                
                <View className="flex-row items-center mt-1.5">
                    <Text className="text-gray-500 font-bold text-sm tracking-wide">
                        {userdata?.phone ?? "No phone added"}
                    </Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2" />
                    <Text className="font-extrabold text-xs uppercase tracking-widest" style={{ color: primaryColorHex }}>
                        {isCollector ? 'Collector' : 'Customer'}
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}>
                
                <View className="px-5">
                    <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 px-2">
                        Account Details
                    </Text>
                    
                    <View className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                        <View className="flex-row items-center p-5 border-b border-gray-50">
                            <View className="p-3 bg-[#f8fafc] rounded-[16px] mr-4">
                                <UserIcon size={20} color="#4b5563" strokeWidth={2} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Full Name</Text>
                                <Text className="text-gray-900 font-black text-base">{userdata?.username ?? "User"}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center p-5 border-b border-gray-50">
                            <View className="p-3 bg-[#f8fafc] rounded-[16px] mr-4">
                                <Mail size={20} color="#4b5563" strokeWidth={2} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Email Address</Text>
                                <Text className="text-gray-900 font-black text-base">{userdata?.email ?? "Not provided"}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center p-5">
                            <View className="p-3 bg-[#f8fafc] rounded-[16px] mr-4">
                                <MapPin size={20} color="#4b5563" strokeWidth={2} />
                            </View>
                            <View className="flex-1 pr-2">
                                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Saved Address</Text>
                                <Text className="text-gray-700 font-bold text-sm leading-relaxed" numberOfLines={2}>
                                    {userdata?.address ?? "No address added yet"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-5 mt-8">
                    <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 px-2">
                        Connected Platforms
                    </Text>
                    
                    <View className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                        {socialLinks.map((social, index) => (
                            <TouchableOpacity 
                                key={social.name} 
                                activeOpacity={0.6}
                                className={`flex-row items-center justify-between p-5 ${index !== socialLinks.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    <View className="p-2.5 rounded-[14px] mr-4" style={{ backgroundColor: `${social.color}15` }}>
                                        <social.icon size={20} color={social.color} />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-base">{social.name}</Text>
                                </View>
                                <ChevronRight size={18} color="#d1d5db" strokeWidth={2.5} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-5 mt-10 mb-6">
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        className="bg-white py-4 rounded-[24px] flex-row justify-center items-center border border-gray-200 shadow-sm mb-3"
                    >
                        <LogOut size={20} color="#374151" strokeWidth={2.5} />
                        <Text className="text-gray-700 font-extrabold text-base ml-2.5">Sign Out</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => setIsDeleteModalVisible(true)}
                        activeOpacity={0.7}
                        className="bg-[#fef2f2] py-4 rounded-[24px] flex-row justify-center items-center border border-[#fee2e2]"
                    >
                        <Trash2 size={20} color="#dc2626" strokeWidth={2.5} />
                        <Text className="text-red-600 font-extrabold text-base ml-2.5">Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => { if (!isDeleting) setIsDeleteModalVisible(false); }}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-5">
                    <View className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl items-center border border-gray-100">
                        <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-5">
                            <Trash2 size={28} color="#dc2626" strokeWidth={2} />
                        </View>
                        
                        <Text className="text-2xl font-black text-gray-900 mb-3 text-center tracking-tight">Delete Account?</Text>
                        <Text className="text-gray-500 text-center text-sm leading-relaxed mb-8 px-1 font-medium">
                            Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all your data.
                        </Text>
                        
                        <View className="flex-row gap-3 w-full">
                            <TouchableOpacity 
                                onPress={() => setIsDeleteModalVisible(false)}
                                disabled={isDeleting}
                                className="flex-1 bg-gray-100 py-4 rounded-[20px] items-center justify-center"
                            >
                                <Text className="font-extrabold text-gray-700 text-base">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 py-4 rounded-[20px] items-center justify-center flex-row shadow-md"
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="font-extrabold text-white text-base">Delete</Text>
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