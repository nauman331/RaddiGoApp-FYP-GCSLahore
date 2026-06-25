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
    const isCustomer = role === 'customer';
    
    const primaryColorHex = isCustomer ? '#059669' : '#d97706';
    const primaryLightHex = isCustomer ? '#ecfdf5' : '#fffbeb';

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
                title: 'Khatam',
                textBody: 'Aapka account hamesha ke liye delete kar diya gaya hai.',
            });
            setIsDeleteModalVisible(false);
            dispatch(logout());
            dispatch(resetRide());
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Account delete karne mein masla aya',
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
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            
            <View className="bg-[#f8fafc] z-20 pb-4 border-b border-gray-100">
                <Header />
                
                <View className="items-center mt-6">
                    <View className="relative">
                        <View className="w-28 h-28 rounded-full items-center justify-center border-2 border-white shadow-sm" style={{ backgroundColor: primaryLightHex }}>
                            <Image
                                source={userdata?.profilePicture ? { uri: userdata.profilePicture } : profileimg}
                                className="w-[104px] h-[104px] rounded-full bg-white"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="absolute bottom-1 right-1 p-1.5 rounded-full border-[3px] border-[#f8fafc] shadow-sm" style={{ backgroundColor: primaryColorHex }}>
                            <ShieldCheck size={16} color="#ffffff" strokeWidth={3} />
                        </View>
                    </View>

                    <Text className="mt-5 text-2xl font-black text-gray-900 tracking-tight">
                        {userdata?.username ?? "User"}
                    </Text>
                    
                    <View className="flex-row items-center mt-1.5">
                        <Text className="text-gray-500 font-bold text-sm tracking-wide">
                            {userdata?.phone ?? "Number nahi hai"}
                        </Text>
                        <View className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2" />
                        <Text className="font-extrabold text-xs uppercase tracking-widest" style={{ color: primaryColorHex }}>
                            {isCustomer ? 'Customer' : 'Collector'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}>
                
                <View className="px-5">
                    <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 px-2">
                        Account Ki Tafseel
                    </Text>
                    
                    <View className="bg-white rounded-[28px] border border-[#f1f5f9] shadow-sm overflow-hidden">
                        <View className="flex-row items-center p-5 border-b border-[#f1f5f9]">
                            <View className="p-3 bg-[#f8fafc] rounded-[16px] mr-4">
                                <UserIcon size={20} color="#475569" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Pura Naam</Text>
                                <Text className="text-gray-900 font-black text-base">{userdata?.username ?? "User"}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center p-5 border-b border-[#f1f5f9]">
                            <View className="p-3 bg-[#f8fafc] rounded-[16px] mr-4">
                                <Mail size={20} color="#475569" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Email Address</Text>
                                <Text className="text-gray-900 font-black text-base">{userdata?.email ?? "Nahi diya gaya"}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center p-5">
                            <View className="p-3 bg-[#f8fafc] rounded-[16px] mr-4">
                                <MapPin size={20} color="#475569" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1 pr-2">
                                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Pata (Address)</Text>
                                <Text className="text-gray-700 font-bold text-sm leading-relaxed" numberOfLines={2}>
                                    {userdata?.address ?? "Abhi koi pata darj nahi kiya"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-5 mt-8">
                    <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 px-2">
                        Hamare Sath Juriye
                    </Text>
                    
                    <View className="bg-white rounded-[28px] border border-[#f1f5f9] shadow-sm overflow-hidden">
                        {socialLinks.map((social, index) => (
                            <TouchableOpacity 
                                key={social.name} 
                                activeOpacity={0.6}
                                className={`flex-row items-center justify-between p-5 ${index !== socialLinks.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    <View className="p-2.5 rounded-[14px] mr-4" style={{ backgroundColor: `${social.color}15` }}>
                                        <social.icon size={20} color={social.color} />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-base">{social.name}</Text>
                                </View>
                                <ChevronRight size={18} color="#cbd5e1" strokeWidth={2.5} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-5 mt-10 mb-6">
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        className="bg-white py-4 rounded-[24px] flex-row justify-center items-center border border-[#e2e8f0] shadow-sm mb-4"
                    >
                        <LogOut size={20} color="#475569" strokeWidth={2.5} />
                        <Text className="text-gray-700 font-extrabold text-base ml-2.5">Sign Out karein</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => setIsDeleteModalVisible(true)}
                        activeOpacity={0.7}
                        className="bg-[#fef2f2] py-4 rounded-[24px] flex-row justify-center items-center border border-[#fee2e2]"
                    >
                        <Trash2 size={20} color="#dc2626" strokeWidth={2.5} />
                        <Text className="text-red-600 font-extrabold text-base ml-2.5">Account Delete Karein</Text>
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
                    <View className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl items-center border border-[#f1f5f9]">
                        <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-5">
                            <Trash2 size={28} color="#dc2626" strokeWidth={2.5} />
                        </View>
                        
                        <Text className="text-2xl font-black text-gray-900 mb-3 text-center tracking-tight">Account Delete Karein?</Text>
                        <Text className="text-gray-500 text-center text-sm leading-relaxed mb-8 px-1 font-bold">
                            Kya aap waqai apna account hamesha ke liye delete karna chahte hain? Aapki tamam maloomat zaya ho jayengi.
                        </Text>
                        
                        <View className="flex-row gap-3 w-full">
                            <TouchableOpacity 
                                onPress={() => setIsDeleteModalVisible(false)}
                                disabled={isDeleting}
                                className="flex-1 bg-[#f1f5f9] py-4 rounded-[20px] items-center justify-center border border-[#e2e8f0]"
                            >
                                <Text className="font-extrabold text-gray-700 text-base">Wapis</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 py-4 rounded-[20px] items-center justify-center flex-row shadow-md shadow-red-500/30"
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