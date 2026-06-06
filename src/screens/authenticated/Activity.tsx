import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Header from '../../components/Header'
import { MapPin, CalendarClock, Package, CheckCircle2, XCircle } from 'lucide-react-native'

const Activity: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const rideState = useSelector((state: RootState) => state.ride);
    const role = userdata?.role || 'customer';
    const isCollector = role === 'collector';

    const primaryColorHex = isCollector ? '#d97706' : '#059669'; 
    const primaryLightHex = isCollector ? '#fef3c7' : '#dcfce7'; 

    const [activeTab, setActiveTab] = useState<'All' | 'Completed' | 'Cancelled'>('All');
    const tabs = ['All', 'Completed', 'Cancelled'] as const;

    // ULTRA-SAFE FILTER LOGIC
    // Added optional chaining (?.) and fallbacks to prevent crashes if data is malformed
    const filteredOrders = (rideState?.orderHistory || []).filter(order => {
        if (!order || !order.status) return false; // Skip invalid entries
        
        const status = order.status.toLowerCase();
        
        if (activeTab === 'All') return true;
        if (activeTab === 'Completed' && status === 'completed') return true;
        if (activeTab === 'Cancelled' && status === 'cancelled') return true;
        
        return false;
    });

    const getStatusDetails = (status?: string) => {
        const lowerStatus = status?.toLowerCase() || 'pending';
        if (lowerStatus === 'completed') return { color: '#059669', bg: '#dcfce7', icon: CheckCircle2 };
        if (lowerStatus === 'cancelled') return { color: '#dc2626', bg: '#fee2e2', icon: XCircle };
        return { color: primaryColorHex, bg: primaryLightHex, icon: Package }; 
    };

    return (
        <View className="bg-gray-50 flex-1">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Header />

            <View className="px-5 pt-4 pb-2">
                <Text className="text-2xl font-extrabold text-gray-900 mb-4">
                    {isCollector ? 'Pickup History' : 'Order History'}
                </Text>

                {/* BULLETPROOF TABS */}
                <View className="flex-row bg-gray-200 p-1 rounded-2xl mb-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.8}
                                // We keep static layout classes in Tailwind
                                className="flex-1 py-2.5 items-center rounded-xl"
                                // We put dynamic visual changes in inline styles so it NEVER fails to update
                                style={isActive ? {
                                    backgroundColor: '#ffffff',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2, // Required for Android shadow
                                } : {
                                    backgroundColor: 'transparent'
                                }}
                            >
                                <Text 
                                    className="font-bold text-sm"
                                    style={{ color: isActive ? '#111827' : '#6b7280' }} // gray-900 vs gray-500
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, idx) => {
                        const statusConfig = getStatusDetails(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <TouchableOpacity 
                                key={order.orderId || `order-${idx}`} 
                                className="bg-white mt-4 p-4 rounded-3xl border border-gray-100 shadow-sm"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <View className="p-2.5 rounded-full mr-3" style={{ backgroundColor: statusConfig.bg }}>
                                            <StatusIcon size={20} color={statusConfig.color} />
                                        </View>
                                        <View>
                                            <Text className="font-extrabold text-gray-900 text-base" numberOfLines={1}>
                                                Order #{order.orderId?.substring(0,6) || 'N/A'}
                                            </Text>
                                            <Text className="text-xs font-bold mt-0.5" style={{ color: statusConfig.color }}>
                                                {(order.status || 'Unknown').charAt(0).toUpperCase() + (order.status || 'unknown').slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="items-end">
                                        <Text className="font-bold text-gray-900 text-base">
                                            {order.price ? `Rs ${order.price}` : '--'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="bg-gray-50 rounded-2xl p-3 space-y-2">
                                    <View className="flex-row items-center">
                                        <MapPin size={14} color="#6b7280" />
                                        <Text className="text-gray-600 text-xs ml-2 flex-1 font-medium" numberOfLines={1}>
                                            {order.pickupAddress || 'Address not available'}
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-row items-center mt-1.5">
                                        <CalendarClock size={14} color="#6b7280" />
                                        <Text className="text-gray-500 text-xs ml-2 font-medium">
                                            {order.date ? new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not available'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                ) : (
                    <View className="mt-20 items-center justify-center px-6">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Package size={40} color="#9ca3af" />
                        </View>
                        <Text className="text-gray-900 text-lg font-bold text-center">No {activeTab.toLowerCase()} orders found</Text>
                        <Text className="text-gray-500 text-sm mt-2 text-center leading-relaxed">
                            Looks like there are no records matching this filter at the moment.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default Activity