import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Header from '../../components/Header'
import { DollarSign, CheckCircle, Clock, MapPin } from 'lucide-react-native'


const Activity: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const rideState = useSelector((state: RootState) => state.ride);
    const role = userdata?.role || 'customer';
    const isCollector = role === 'collector';

    const primary = isCollector ? '#d97706' : '#059669';

    return (
        <View className="bg-white flex-1">
            <Header />
            <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                <View style={{ backgroundColor: primary, padding: 18, borderRadius: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{isCollector ? 'Collector Dashboard' : 'Your Activity'}</Text>
                    <Text style={{ color: '#fff', marginTop: 6 }}>{isCollector ? 'Manage pickups, earnings and your active jobs.' : 'Track your orders and pickups.'}</Text>
                </View>

                <View className="mt-4 flex-row justify-between">
                    <View style={{ flex: 1, marginRight: 8, backgroundColor: '#fff', padding: 14, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05 }}>
                        <Text style={{ color: '#6b7280', fontWeight: '700' }}>Earnings</Text>
                        <View className="mt-2" style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <DollarSign color={primary} size={24} />
                            <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '700' }}>PKR {rideState.totalEarnings || 0}</Text>
                        </View>
                    </View>

                    <View style={{ width: 120, backgroundColor: '#fff', padding: 14, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05 }}>
                        <Text style={{ color: '#6b7280', fontWeight: '700' }}>Pickups</Text>
                        <Text style={{ marginTop: 8, fontSize: 20, fontWeight: '700' }}>{rideState.totalOrders || 0}</Text>
                    </View>
                </View>

                <View className="mt-4">
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Recent Orders</Text>
                    {rideState.orderHistory && rideState.orderHistory.length > 0 ? (
                        rideState.orderHistory.map((o, idx) => (
                            <View key={o.orderId + idx} style={{ marginTop: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: primary }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontWeight: '700' }}>{o.pickupAddress || 'Pickup'}</Text>
                                    <Text style={{ color: '#6b7280' }}>{o.status}</Text>
                                </View>
                                <Text style={{ color: '#6b7280', marginTop: 6 }}>{new Date(o.date).toLocaleString()}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={{ marginTop: 12, alignItems: 'center' }}>
                            <Text style={{ color: '#9CA3AF' }}>No activity yet</Text>
                        </View>
                    )}
                </View>

                <View className="mt-6">
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Quick Actions</Text>
                    <View style={{ flexDirection: 'row', marginTop: 12 }}>
                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, marginRight: 8, alignItems: 'center' }}>
                            <Clock color={primary} size={20} />
                            <Text style={{ marginTop: 8, fontWeight: '700' }}>History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' }}>
                            <MapPin color={primary} size={20} />
                            <Text style={{ marginTop: 8, fontWeight: '700' }}>{isCollector ? 'Nearby' : 'Track'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Activity
