import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Header from '../../components/Header'
import EmptyPic from "../../assets/homeempty.png"
import { MapPin, CalendarClock, Package, CheckCircle2, XCircle } from 'lucide-react-native'

const Activity: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const rideState = useSelector((state: RootState) => state.ride);
    
    const role = userdata?.role || 'customer';
    const isCustomer = role === 'customer';

    const primaryColorHex = isCustomer ? '#059669' : '#d97706'; 
    const primaryLightHex = isCustomer ? '#ecfdf5' : '#fffbeb'; 

    const [activeTab, setActiveTab] = useState<'Sab' | 'Pura Hua' | 'Cancel Hua'>('Sab');
    const tabs = ['Sab', 'Pura Hua', 'Cancel Hua'] as const;

    const filteredOrders = (rideState?.orderHistory || []).filter(order => {
        if (!order || !order.status) return false; 
        const status = order.status.toLowerCase();
        if (activeTab === 'Sab') return true;
        if (activeTab === 'Pura Hua' && status === 'completed') return true;
        if (activeTab === 'Cancel Hua' && status === 'cancelled') return true;
        return false;
    });

    const getStatusDetails = (status?: string) => {
        const lowerStatus = status?.toLowerCase() || 'pending';
        if (lowerStatus === 'completed') return { color: '#059669', bg: '#ecfdf5', icon: CheckCircle2, label: 'Pura Hua' };
        if (lowerStatus === 'cancelled') return { color: '#dc2626', bg: '#fef2f2', icon: XCircle, label: 'Cancel Hua' };
        return { color: primaryColorHex, bg: primaryLightHex, icon: Package, label: 'Jari Hai' }; 
    };

    return (
        <View className="bg-[#f8fafc] flex-1">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            
            <View className="bg-[#f8fafc] z-20 pb-2">
                <Header />
                <View className="px-6 mt-2">
                    <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                        Aapki Tafseel
                    </Text>
                    <Text className="text-gray-900 font-black text-3xl tracking-tight leading-none">
                        {isCustomer ? 'Orders ki History' : 'Pickups ki History'}
                    </Text>
                </View>
            </View>

            <View className="px-5 pt-4 pb-2 z-10">
                <View className="flex-row bg-[#f1f5f9] p-1.5 rounded-full border border-[#e2e8f0]">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.8}
                                className="flex-1 py-3 items-center rounded-full"
                                style={isActive ? {
                                    backgroundColor: '#ffffff',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                    elevation: 2,
                                } : {
                                    backgroundColor: 'transparent'
                                }}
                            >
                                <Text 
                                    className="font-black text-xs"
                                    style={{ color: isActive ? '#0f172a' : '#64748b' }} 
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, idx) => {
                        const statusConfig = getStatusDetails(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <TouchableOpacity 
                                key={order.orderId || `order-${idx}`} 
                                className="bg-white mt-4 p-5 rounded-[24px] border border-[#f1f5f9] shadow-sm"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <View className="p-3 rounded-[16px] mr-3" style={{ backgroundColor: statusConfig.bg }}>
                                            <StatusIcon size={22} color={statusConfig.color} strokeWidth={2.5} />
                                        </View>
                                        <View>
                                            <Text className="font-black text-gray-900 text-lg tracking-tight" numberOfLines={1}>
                                                Order #{order.orderId?.substring(0,6).toUpperCase() || 'N/A'}
                                            </Text>
                                            <Text className="text-[10px] font-extrabold uppercase tracking-widest mt-0.5" style={{ color: statusConfig.color }}>
                                                {statusConfig.label}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="items-end">
                                        <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-0.5">Raqam</Text>
                                        {order.price ? (
                                            <View className="flex-row items-baseline">
                                                <Text className="text-gray-900 font-black text-xs mr-1">Rs</Text>
                                                <Text className="font-black text-gray-900 text-xl">{order.price}</Text>
                                            </View>
                                        ) : (
                                            <Text className="font-black text-gray-400 text-xl">--</Text>
                                        )}
                                    </View>
                                </View>

                                <View className="bg-[#f8fafc] rounded-[16px] p-4 border border-[#f1f5f9] space-y-3">
                                    <View className="flex-row items-start">
                                        <MapPin size={16} color="#64748b" className="mt-0.5" strokeWidth={2.5} />
                                        <View className="ml-2.5 flex-1">
                                            <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-0.5">Pata (Location)</Text>
                                            <Text className="text-gray-700 text-xs font-bold leading-relaxed" numberOfLines={2}>
                                                {order.pickupAddress || 'Pata faraham nahi kiya gaya'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="h-[1.5px] w-full bg-[#f1f5f9] my-2" />
                                    
                                    <View className="flex-row items-center">
                                        <CalendarClock size={16} color="#64748b" strokeWidth={2.5} />
                                        <Text className="text-gray-600 text-xs ml-2.5 font-bold">
                                            {order.date ? new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Tareekh mojood nahi'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                ) : (
                    <View className='bg-white rounded-[32px] p-8 mt-6 w-full items-center border border-[#f1f5f9] shadow-sm'>
                        <View className="bg-[#f8fafc] w-24 h-24 rounded-full items-center justify-center mb-5">
                            <Image source={EmptyPic} className='w-14 h-14 opacity-50' resizeMode="contain" />
                        </View>
                        <Text className='text-gray-900 text-xl font-black text-center mb-2 tracking-tight'>
                            Koi order nahi mila
                        </Text>
                        <Text className='text-gray-500 text-sm text-center leading-relaxed font-bold px-2'>
                            Is filter ke mutabiq aapki history mein koi record nahi hai.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default Activity