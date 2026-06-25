import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft, CheckCheck, Package, Sparkles, BellRing, Wallet, MapPin } from 'lucide-react-native'
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
            title: isCollector ? 'Naya Pickup Agaya!' : 'Collector Pohnchne Wala Hai!',
            message: isCollector ? 'Aapke ilaqay mein ek naya raddi pickup dastiyab hai.' : 'Aapka rider 5 minute door hai. Raddi tayyar rakhein.',
            time: '2 minute pehle',
            isRead: false,
        },
        {
            id: '2',
            type: 'wallet',
            title: 'Paise Mil Gaye',
            message: 'PKR 1,250 aapke wallet mein jama kar diye gaye hain.',
            time: '1 ghanta pehle',
            isRead: false,
        },
        {
            id: '3',
            type: 'promo',
            title: 'Doston Ko Bulayen, PKR 500 Kamayen',
            message: 'Apne doston ko RaddiGo par invite karein aur pehle pickup par bonus kamayen.',
            time: 'Kal',
            isRead: true,
        },
        {
            id: '4',
            type: 'system',
            title: 'System Update Mukammal',
            message: 'Humne app ko mazeed behtar aur tez bana diya hai taake aapko asani ho.',
            time: '2 din pehle',
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
                return { icon: BellRing, color: '#4b5563', bg: '#f1f5f9' };
        }
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            
            <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-4 flex-row items-center justify-between">
                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 bg-white rounded-[16px] items-center justify-center border border-[#f1f5f9] shadow-sm"
                >
                    <ChevronLeft size={24} color="#0f172a" strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleMarkAllRead}
                    className="bg-[#f1f5f9] px-4 py-2.5 rounded-[14px] flex-row items-center border border-[#e2e8f0]"
                >
                    <CheckCheck size={16} color="#475569" strokeWidth={2.5} />
                    <Text className="text-gray-700 font-extrabold text-[10px] ml-1.5 uppercase tracking-widest">Sab Parh Lein</Text>
                </TouchableOpacity>
            </View>

            <View className="px-6 pt-2 pb-6">
                <Text className="text-gray-400 font-extrabold text-[11px] uppercase tracking-widest mb-1">
                    Bakhabar Rahein
                </Text>
                <Text className="text-gray-900 font-black text-3xl tracking-tight leading-none">
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
                                className={`w-full bg-white rounded-[24px] p-5 mb-4 flex-row items-start border ${notification.isRead ? 'border-[#f8fafc] opacity-70' : 'border-[#f1f5f9] shadow-sm'}`}
                            >
                                <View className="p-3.5 rounded-[16px] mr-4 mt-0.5" style={{ backgroundColor: bg }}>
                                    <Icon size={22} color={color} strokeWidth={2.5} />
                                </View>
                                
                                <View className="flex-1 pr-1">
                                    <View className="flex-row items-start justify-between mb-1.5">
                                        <Text className="text-gray-900 font-black text-base flex-1 pr-2 tracking-tight" numberOfLines={1}>
                                            {notification.title}
                                        </Text>
                                        {!notification.isRead && (
                                            <View className="w-2.5 h-2.5 rounded-full mt-1.5 shadow-sm" style={{ backgroundColor: primaryColorHex }} />
                                        )}
                                    </View>
                                    
                                    <Text className="text-gray-600 font-bold text-xs leading-relaxed mb-3">
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
                    <View className="bg-white rounded-[32px] p-8 w-full items-center border border-[#f1f5f9] shadow-sm mt-4">
                        <View className="bg-[#f8fafc] w-24 h-24 rounded-full items-center justify-center mb-5">
                            <Image source={EmptyPic} className="w-14 h-14 opacity-50" resizeMode="contain" />
                        </View>
                        <Text className="text-gray-900 text-xl font-black text-center mb-2 tracking-tight">
                            Sab Parh Liya!
                        </Text>
                        <Text className="text-gray-500 text-sm text-center leading-relaxed font-bold px-2">
                            Aapke paas koi naya notification nahi hai. Kuch naya aane par hum aapko yahan aagah karenge.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default Notifications