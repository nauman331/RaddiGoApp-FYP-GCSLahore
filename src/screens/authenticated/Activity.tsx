import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Header from '../../components/Header'
import EmptyPic from "../../assets/homeempty.png"
import { MapPin, CalendarClock, Package, CheckCircle2, XCircle, ReceiptText } from 'lucide-react-native'

const Activity: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const rideState = useSelector((state: RootState) => state.ride);
    
    const role = userdata?.role || 'customer';
    const isCollector = role === 'collector';

    // Premium Theme Colors
    const primaryColorHex = isCollector ? '#d97706' : '#059669'; 
    const primaryLightHex = isCollector ? '#fffbeb' : '#ecfdf5'; 

    const [activeTab, setActiveTab] = useState<'All' | 'Completed' | 'Cancelled'>('All');
    const tabs = ['All', 'Completed', 'Cancelled'] as const;

    const filteredOrders = (rideState?.orderHistory || []).filter(order => {
        if (!order || !order.status) return false; 
        const status = order.status.toLowerCase();
        if (activeTab === 'All') return true;
        if (activeTab === 'Completed' && status === 'completed') return true;
        if (activeTab === 'Cancelled' && status === 'cancelled') return true;
        return false;
    });

    const getStatusDetails = (status?: string) => {
        const lowerStatus = status?.toLowerCase() || 'pending';
        if (lowerStatus === 'completed') return { color: '#059669', bg: '#ecfdf5', icon: CheckCircle2, label: 'Completed' };
        if (lowerStatus === 'cancelled') return { color: '#dc2626', bg: '#fef2f2', icon: XCircle, label: 'Cancelled' };
        return { color: primaryColorHex, bg: primaryLightHex, icon: Package, label: 'In Progress' }; 
    };

    return (
        <View className="bg-[#f8fafc] flex-1">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            
            {/* Header Area with Premium Curved Bottom */}
            <View className="bg-white shadow-sm z-20 pb-4 rounded-b-[32px]">
                <Header />
                <View className="px-6 mt-2">
                    <Text className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-1">
                        Your Log
                    </Text>
                    <Text className="text-gray-900 font-black text-3xl tracking-tight">
                        {isCollector ? 'Pickup History' : 'Order History'}
                    </Text>
                </View>
            </View>

            {/* Bulletproof Segmented Control */}
            <View className="px-5 pt-6 pb-2 z-10">
                <View className="flex-row bg-gray-200/80 p-1.5 rounded-full border border-gray-100">
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
                                    className="font-extrabold text-xs"
                                    style={{ color: isActive ? '#111827' : '#6b7280' }} 
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
                                className="bg-white mt-4 p-5 rounded-[28px] border border-gray-100 shadow-sm"
                                activeOpacity={0.7}
                            >
                                {/* Top Row: Status & Price */}
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <View className="p-3 rounded-[16px] mr-3" style={{ backgroundColor: statusConfig.bg }}>
                                            <StatusIcon size={22} color={statusConfig.color} strokeWidth={2.5} />
                                        </View>
                                        <View>
                                            <Text className="font-black text-gray-900 text-lg tracking-tight" numberOfLines={1}>
                                                Order #{order.orderId?.substring(0,6).toUpperCase() || 'N/A'}
                                            </Text>
                                            <Text className="text-[11px] font-extrabold uppercase tracking-wider mt-0.5" style={{ color: statusConfig.color }}>
                                                {statusConfig.label}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="items-end">
                                        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">Amount</Text>
                                        {order.price ? (
                                            <View className="flex-row items-baseline">
                                                <Text className="text-gray-900 font-bold text-xs mr-1">PKR</Text>
                                                <Text className="font-black text-gray-900 text-xl">{order.price}</Text>
                                            </View>
                                        ) : (
                                            <Text className="font-black text-gray-400 text-xl">--</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Bottom Row: Location & Date (Receipt Style) */}
                                <View className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 space-y-3">
                                    <View className="flex-row items-start">
                                        <MapPin size={16} color="#6b7280" className="mt-0.5" />
                                        <View className="ml-2.5 flex-1">
                                            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">Location</Text>
                                            <Text className="text-gray-700 text-xs font-semibold leading-relaxed" numberOfLines={2}>
                                                {order.pickupAddress || 'Address not available'}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="h-[1px] w-full bg-gray-200/60 my-2" />
                                    
                                    <View className="flex-row items-center">
                                        <CalendarClock size={16} color="#6b7280" />
                                        <Text className="text-gray-600 text-xs ml-2.5 font-bold">
                                            {order.date ? new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not available'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                ) : (
                    <View className='bg-white rounded-[28px] p-8 mt-6 w-full items-center border border-gray-100 shadow-sm'>
                        <View className="bg-gray-50 w-24 h-24 rounded-full items-center justify-center mb-5">
                            <Image source={EmptyPic} className='w-14 h-14 opacity-50' resizeMode="contain" />
                        </View>
                        <Text className='text-gray-900 text-xl font-black text-center mb-2'>
                            No {activeTab.toLowerCase()} orders
                        </Text>
                        <Text className='text-gray-500 text-sm text-center leading-relaxed font-medium px-2'>
                            Looks like there are no records matching this filter in your history at the moment.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default Activity