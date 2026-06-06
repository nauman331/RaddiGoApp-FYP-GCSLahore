import { View, Text, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import React from 'react'
import Header from '../../components/Header'
import EmptyPic from "../../assets/homeempty.png"
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ArrowRight, Activity, Wallet, Clock, HelpCircle, Settings, MapPin, Gift } from 'lucide-react-native'

const Home: React.FC = ({ navigation }: any) => {
    // Assuming you have a ride slice managing the current active order status
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    // MOCK: Replace with actual active ride state from your Redux store
    const activeRideStatus = 'idle'; // e.g., 'idle', 'pending', 'on_way'
    
    const role = userdata?.role || 'customer'; 
    const iscollector = role === 'collector';
    
    // Theme Colors
    const primaryColorHex = iscollector ? '#d97706' : '#059669'; 
    const primaryLightHex = iscollector ? '#fef3c7' : '#dcfce7'; 
    const secondaryLightHex = iscollector ? '#dcfce7' : '#fef3c7'; 

    // Quick Actions Data
    const quickActions = [
        { id: 1, label: 'Wallet', icon: Wallet, route: 'Wallet' },
        { id: 2, label: 'History', icon: Clock, route: 'Activity' },
        { id: 3, label: 'Support', icon: HelpCircle, route: 'Support' },
        { id: 4, label: 'Settings', icon: Settings, route: 'Profile' },
    ];

    return (
        <View className='flex-1 bg-gray-50'>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Header />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
                
                {/* 1. DYNAMIC ACTIVE RIDE BANNER */}
                {activeRideStatus !== 'idle' && (
                    <TouchableOpacity 
                        className='mx-5 mt-5 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex-row items-center'
                        onPress={() => navigation.navigate('Ride')}
                    >
                        <View className='bg-blue-50 p-3 rounded-full mr-4'>
                            <MapPin size={24} color="#3b82f6" />
                        </View>
                        <View className='flex-1'>
                            <Text className='text-sm text-gray-500 font-bold uppercase tracking-wider mb-0.5'>Current Order</Text>
                            <Text className='text-gray-900 font-extrabold text-lg'>Collector is on the way</Text>
                            <Text className='text-gray-500 text-xs mt-1'>Arriving in ~5 mins</Text>
                        </View>
                        <ArrowRight size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}

                {/* 2. STATS GRID */}
                <View className='flex-row justify-between mt-5 px-5'>
                    <View className='rounded-3xl p-4 flex-1 mr-2 justify-between' style={{ backgroundColor: primaryLightHex, height: 110 }}>
                        <View className='flex-row justify-between items-start'>
                            <Text className='text-sm font-bold text-gray-800 w-2/3 leading-tight'>
                                {iscollector ? 'Total Requests' : 'Total Orders'}
                            </Text>
                            <View className='bg-white/60 p-1.5 rounded-full'>
                                <Activity size={16} color={primaryColorHex} />
                            </View>
                        </View>
                        <View>
                            <Text className='text-2xl font-black text-gray-900'>12</Text>
                            <Text className='text-xs text-gray-600 font-medium mt-0.5'>This month</Text>
                        </View>
                    </View>

                    <View className='rounded-3xl p-4 flex-1 ml-2 justify-between' style={{ backgroundColor: secondaryLightHex, height: 110 }}>
                        <View className='flex-row justify-between items-start'>
                            <Text className='text-sm font-bold text-gray-800 w-2/3 leading-tight'>
                                {iscollector ? 'Saved Money' : 'Earnings'}
                            </Text>
                            <View className='bg-white/60 p-1.5 rounded-full'>
                                <Wallet size={16} color={iscollector ? '#059669' : '#d97706'} />
                            </View>
                        </View>
                        <View>
                            <Text className='text-2xl font-black text-gray-900'>Rs 4,200</Text>
                            <Text className='text-xs text-gray-600 font-medium mt-0.5'>This month</Text>
                        </View>
                    </View>
                </View>

                {/* 3. MAIN ACTION CTA */}
                <TouchableOpacity
                    className='rounded-3xl p-5 mx-5 mt-5 flex-row justify-between items-center shadow-sm'
                    style={{ backgroundColor: primaryColorHex, opacity: isConnected ? 1 : 0.7 }}
                    onPress={() => navigation.navigate('Ride')}
                    activeOpacity={0.8}
                >
                    <View>
                        <Text className='text-white/80 text-sm font-medium mb-1'>
                            {isConnected ? 'Ready to go?' : 'Connecting to server...'}
                        </Text>
                        <Text className='text-white font-extrabold text-xl'>
                            {isConnected 
                                ? (iscollector ? "Open Collector Dashboard" : "Request a Pickup Now") 
                                : "Connecting..."}
                        </Text>
                    </View>
                    <View className='bg-white/20 p-3 rounded-full'>
                        <ArrowRight size={24} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                {/* 4. QUICK ACTIONS ROW */}
                <View className='flex-row justify-between mt-6 px-7'>
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <TouchableOpacity 
                                key={action.id} 
                                className='items-center'
                                onPress={() => {
                                    // Make sure these routes exist in your navigator, or fallback to Home
                                    if(action.route === 'Activity' || action.route === 'Profile') {
                                        navigation.navigate(action.route);
                                    }
                                }}
                            >
                                <View className='w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100 mb-2'>
                                    <Icon size={22} color="#4b5563" strokeWidth={2} />
                                </View>
                                <Text className='text-xs font-semibold text-gray-600'>{action.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* 5. PROMO / INFO BANNER */}
                <View className='mx-5 mt-8 bg-blue-50 rounded-3xl p-5 flex-row items-center justify-between border border-blue-100'>
                    <View className='flex-1 pr-4'>
                        <Text className='text-blue-900 font-extrabold text-base mb-1'>Invite Friends</Text>
                        <Text className='text-blue-700 text-xs leading-relaxed'>
                            Earn Rs 500 in your wallet for every friend who completes their first pickup.
                        </Text>
                    </View>
                    <View className='bg-blue-100 p-3 rounded-full'>
                        <Gift size={28} color="#2563eb" />
                    </View>
                </View>

                {/* 6. RECENT ACTIVITY SECTION */}
                <View className='mt-8 px-5'>
                    <View className='flex-row justify-between items-end mb-4'>
                        <Text className='font-extrabold text-gray-900 text-lg'>
                            {iscollector ? 'Recent Requests' : 'Recent Orders'}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                            <Text className='font-bold text-sm' style={{ color: primaryColorHex }}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className='bg-white rounded-3xl p-8 w-full items-center shadow-sm border border-gray-100'>
                        <Image source={EmptyPic} className='w-32 h-32 mb-4 opacity-80' resizeMode="contain" />
                        <Text className='text-gray-800 text-lg font-bold text-center'>
                            {iscollector ? 'No Requests Yet' : 'No Orders Yet'}
                        </Text>
                        <Text className='text-gray-500 text-sm mt-2 text-center leading-relaxed px-4'>
                            {iscollector
                                ? 'When you create pickup requests, they will appear right here.'
                                : 'When you receive active orders, you will see them here.'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Home