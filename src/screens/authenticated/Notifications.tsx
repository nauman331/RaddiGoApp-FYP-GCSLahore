import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, CheckCheck, Package, Sparkles, BellRing, Wallet, MapPin } from 'lucide-react-native'
import EmptyPic from "../../assets/homeempty.png"

const Notifications: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';
    const isCollector = role === 'collector';

    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const primaryColorHex = isCollector ? '#d97706' : '#059669';
    const primaryLightHex = isCollector ? '#fffbeb' : '#ecfdf5';

    const initialNotifications = [
        {
            id: '1',
            type: 'order',
            title: 'Collector Arriving Soon!',
            message: 'Your rider is 5 minutes away. Please keep your Raddi ready.',
            time: '2 mins ago',
            isRead: false,
        },
        {
            id: '2',
            type: 'wallet',
            title: 'Payment Received',
            message: 'PKR 1,250 has been successfully added to your wallet.',
            time: '1 hour ago',
            isRead: false,
        },
        {
            id: '3',
            type: 'promo',
            title: 'Invite & Earn PKR 500',
            message: 'Invite your friends to RaddiGo and earn bonus rewards on their first pickup.',
            time: 'Yesterday',
            isRead: true,
        },
        {
            id: '4',
            type: 'system',
            title: 'System Update Completed',
            message: 'We have optimized our matching algorithm for faster pickups.',
            time: '2 days ago',
            isRead: true,
        }
    ];

    const [notifications, setNotifications] = useState(initialNotifications);

    const handleMarkAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const getNotificationDetails = (type: string, isRead: boolean) => {
        switch (type) {
            case 'order':
                return { icon: MapPin, color: primaryColorHex, bg: primaryLightHex };
            case 'wallet':
                return { icon: Wallet, color: '#059669', bg: '#ecfdf5' };
            case 'promo':
                return { icon: Sparkles, color: '#d97706', bg: '#fffbeb' };
            default:
                return { icon: BellRing, color: '#4b5563', bg: '#f3f4f6' };
        }
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            
            <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-4 flex-row items-center justify-between">
                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm"
                >
                    <ArrowLeft size={24} color="#111827" strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleMarkAllRead}
                    className="bg-gray-200/80 px-4 py-2.5 rounded-full flex-row items-center"
                >
                    <CheckCheck size={16} color="#4b5563" strokeWidth={2.5} />
                    <Text className="text-gray-600 font-extrabold text-xs ml-1.5">Mark all read</Text>
                </TouchableOpacity>
            </View>

            <View className="px-6 pt-2 pb-6">
                <Text className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-1">
                    Stay Updated
                </Text>
                <Text className="text-gray-900 font-black text-3xl tracking-tight">
                    Notifications
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                {notifications.length > 0 ? (
                    notifications.map((notification) => {
                        const { icon: Icon, color, bg } = getNotificationDetails(notification.type, notification.isRead);
                        
                        return (
                            <TouchableOpacity 
                                key={notification.id}
                                activeOpacity={0.7}
                                className={`w-full bg-white rounded-[28px] p-5 mb-3 flex-row items-start border shadow-sm ${notification.isRead ? 'border-gray-100/50 opacity-80' : 'border-gray-200 shadow-md'}`}
                            >
                                <View className="p-3.5 rounded-[18px] mr-4 mt-1" style={{ backgroundColor: bg }}>
                                    <Icon size={22} color={color} strokeWidth={2.5} />
                                </View>
                                
                                <View className="flex-1 pr-2">
                                    <View className="flex-row items-start justify-between mb-1">
                                        <Text className="text-gray-900 font-black text-base flex-1 pr-2" numberOfLines={1}>
                                            {notification.title}
                                        </Text>
                                        {!notification.isRead && (
                                            <View className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: primaryColorHex }} />
                                        )}
                                    </View>
                                    
                                    <Text className="text-gray-600 font-medium text-xs leading-relaxed mb-3">
                                        {notification.message}
                                    </Text>
                                    
                                    <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest">
                                        {notification.time}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                ) : (
                    <View className="bg-white rounded-[32px] p-8 w-full items-center border border-gray-100 shadow-sm mt-4">
                        <View className="bg-gray-50 w-24 h-24 rounded-full items-center justify-center mb-6">
                            <Image source={EmptyPic} className="w-14 h-14 opacity-50" resizeMode="contain" />
                        </View>
                        <Text className="text-gray-900 text-xl font-black text-center mb-2 tracking-tight">
                            All Caught Up!
                        </Text>
                        <Text className="text-gray-500 text-sm text-center leading-relaxed font-medium px-4">
                            You have no new notifications. When something important happens, we will let you know right here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default Notifications