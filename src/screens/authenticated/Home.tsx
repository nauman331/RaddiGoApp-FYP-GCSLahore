import { View, Text, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import React from 'react'
import Header from '../../components/Header'
import EmptyPic from "../../assets/homeempty.png"
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ArrowRight, Wallet, Clock, HeadphonesIcon, Settings, MapPin, ChevronRight, ShieldCheck, Zap } from 'lucide-react-native'

const Home: React.FC = ({ navigation }: any) => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string, username?: string } };
    
    const activeRideStatus = 'idle'; 
    
    const role = userdata?.role || 'customer'; 
    const isCollector = role === 'collector'; 
    
    const primaryColor = isCollector ? '#d97706' : '#059669'; 
    const primaryLight = isCollector ? '#fffbeb' : '#ecfdf5'; 

    const quickActions = [
        { id: 1, label: 'Wallet', icon: Wallet, route: 'Wallet' },
        { id: 2, label: 'History', icon: Clock, route: 'Activity' },
        { id: 3, label: 'Help', icon: HeadphonesIcon, route: 'Support' },
        { id: 4, label: 'Settings', icon: Settings, route: 'Profile' },
    ];

    return (
        <View className='flex-1 bg-[#f8fafc]'>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            
            <View className="bg-white shadow-sm z-20 pb-4 rounded-b-[32px]">
                <Header />
                <View className="px-6 mt-1 flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-0.5">Assalam-o-Alaikum,</Text>
                        <Text className="text-gray-900 font-black text-2xl">{userdata?.username || 'User'}</Text>
                    </View>
                    <View className="bg-emerald-50 flex-row items-center px-3 py-1.5 rounded-full border border-emerald-100">
                        <ShieldCheck size={14} color="#059669" />
                        <Text className="text-emerald-700 font-bold text-[11px] ml-1 uppercase">Verified</Text>
                    </View>
                </View>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}>
                
                <View className="px-5 mb-6 mt-2">
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        className="w-full bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 flex-row items-center justify-between"
                    >
                        <View>
                            <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">
                                {isCollector ? 'Total Savings' : 'Current Balance'}
                            </Text>
                            <View className="flex-row items-end">
                                <Text className="text-gray-400 font-bold text-lg mr-1.5 mb-1">Rs</Text>
                                <Text className="text-gray-900 font-black text-4xl tracking-tight">4,250</Text>
                            </View>
                            
                            <View className="flex-row items-center mt-3">
                                <View className="bg-gray-100 px-2 py-1 rounded-md flex-row items-center mr-2">
                                     <Text className="text-gray-700 font-bold text-[10px] uppercase tracking-wide">
                                         12 {isCollector ? 'Pickups' : 'Orders'}
                                     </Text>
                                </View>
                                <Text className="text-gray-400 font-semibold text-xs">This month</Text>
                            </View>
                        </View>

                        <View className="bg-gray-50 p-4 rounded-full border border-gray-100">
                            <Wallet size={28} color={primaryColor} />
                        </View>
                    </TouchableOpacity>
                </View>

                {activeRideStatus !== 'idle' && (
                    <TouchableOpacity 
                        className='mx-5 mb-6 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex-row items-center'
                        onPress={() => navigation.navigate('Ride')}
                        activeOpacity={0.9}
                    >
                        <View className='p-3.5 rounded-full mr-4' style={{ backgroundColor: primaryLight }}>
                            <MapPin size={24} color={primaryColor} />
                        </View>
                        <View className='flex-1'>
                            <Text className='text-gray-900 font-black text-lg leading-tight mb-0.5'>Rider is on the way</Text>
                            <Text className='text-gray-500 font-bold text-xs'>Arriving in 5 mins • Honda CD70</Text>
                        </View>
                        <View className="bg-gray-50 p-2 rounded-full">
                            <ArrowRight size={20} color="#9ca3af" strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                )}

                <View className="px-5 mb-8">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Ride')}
                        activeOpacity={0.9}
                        className="w-full bg-white rounded-[28px] p-2 flex-row items-center shadow-md border border-gray-100"
                    >
                        <View className="flex-1 pl-6 py-4">
                            <View className="flex-row items-center mb-1.5">
                                <Zap size={16} color={primaryColor} className="mr-1.5" />
                                <Text className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">Quick Action</Text>
                            </View>
                            <Text className="text-gray-900 font-black text-2xl">
                                {isCollector ? "Request Pickup" : "Find Raddi Orders"}
                            </Text>
                        </View>
                        
                        <View className={`w-20 h-24 rounded-[22px] items-center justify-center shadow-inner ${isCollector ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                            <ArrowRight size={32} color={primaryColor} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between gap-2 px-5 mb-8">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <TouchableOpacity 
                                key={action.id} 
                                activeOpacity={0.7}
                                className="flex-1 items-center"
                                onPress={() => {
                                    if(action.route === 'Activity' || action.route === 'Profile' || action.route === 'Wallet') {
                                        navigation.navigate(action.route);
                                    }
                                }}
                            >
                                <View className="w-16 h-16 bg-white rounded-[20px] items-center justify-center shadow-sm border border-gray-100 mb-2">
                                    <Icon size={24} color="#4b5563" strokeWidth={1.5} />
                                </View>
                                <Text className="text-[11px] font-extrabold text-gray-700">{action.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View className='px-5'>
                    <View className='flex-row justify-between items-center mb-4 px-1'>
                        <Text className='font-black text-gray-900 text-xl tracking-tight'>
                            {isCollector ? 'Recent Requests' : 'Recent Orders'}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Activity')} className="flex-row items-center">
                            <Text className='font-extrabold text-sm mr-1' style={{ color: primaryColor }}>See All</Text>
                            <ChevronRight size={16} color={primaryColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <View className='bg-white rounded-[28px] p-8 w-full items-center border border-gray-100 shadow-sm'>
                        <View className="bg-gray-50 w-20 h-20 rounded-full items-center justify-center mb-4">
                            <Image source={EmptyPic} className='w-12 h-12 opacity-40' resizeMode="contain" />
                        </View>
                        <Text className='text-gray-900 text-lg font-black text-center mb-1.5'>
                            No activity yet
                        </Text>
                        <Text className='text-gray-500 text-sm text-center leading-relaxed font-medium px-2'>
                            {isCollector
                                ? "Schedule a pickup to see your transaction history here."
                                : "Complete an order to start tracking your daily earnings."}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    )
}

export default Home