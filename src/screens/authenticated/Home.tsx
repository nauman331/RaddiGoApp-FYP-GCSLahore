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
    const isCustomer = role === 'customer'; 
    
    const primaryColor = isCustomer ? '#059669' : '#d97706'; 
    const primaryLight = isCustomer ? '#ecfdf5' : '#fffbeb'; 

    const quickActions = [
        { id: 1, label: 'Batwa', icon: Wallet, route: 'Wallet' },
        { id: 2, label: 'History', icon: Clock, route: 'Activity' },
        { id: 3, label: 'Madad', icon: HeadphonesIcon, route: 'Support' },
        { id: 4, label: 'Settings', icon: Settings, route: 'Profile' },
    ];

    return (
        <View className='flex-1 bg-[#f8fafc]'>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            
            <View className="bg-[#f8fafc] z-20 pb-2">
                <Header />
                <View className="px-6 mt-2 flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                            Assalam-o-Alaikum,
                        </Text>
                        <Text className="text-gray-900 font-black text-3xl tracking-tight leading-none">
                            {userdata?.username || 'User'}
                        </Text>
                    </View>
                    <View className="bg-emerald-50 flex-row items-center px-3 py-1.5 rounded-[12px] border border-emerald-100">
                        <ShieldCheck size={14} color="#059669" strokeWidth={2.5} />
                        <Text className="text-emerald-700 font-extrabold text-[10px] ml-1.5 uppercase tracking-wider">
                            Verified
                        </Text>
                    </View>
                </View>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
                
                <View className="px-5 mb-6">
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        style={{ backgroundColor: primaryColor }}
                        className="w-full rounded-[32px] p-6 shadow-lg shadow-black/10 relative overflow-hidden"
                    >
                        <View className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full" />
                        <View className="absolute right-12 -bottom-10 w-24 h-24 bg-black/10 rounded-full" />

                        <View className="flex-row items-start justify-between">
                            <View>
                                <Text className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1">
                                    {isCustomer ? 'Aapki Bachat' : 'Aapka Balance'}
                                </Text>
                                <View className="flex-row items-end mt-1">
                                    <Text className="text-white/90 font-bold text-xl mr-2 mb-1">Rs</Text>
                                    <Text className="text-white font-black text-5xl tracking-tight">4,250</Text>
                                </View>
                            </View>
                            <View className="bg-white/20 p-3.5 rounded-[20px] backdrop-blur-md">
                                <Wallet size={24} color="#ffffff" strokeWidth={2.5} />
                            </View>
                        </View>

                        <View className="flex-row items-center mt-8">
                            <View className="bg-black/10 px-3 py-1.5 rounded-[10px] flex-row items-center mr-3 backdrop-blur-md">
                                 <Text className="text-white font-black text-[11px] uppercase tracking-wider">
                                     12 {isCustomer ? 'Pickups' : 'Orders'}
                                 </Text>
                            </View>
                            <Text className="text-white/80 font-bold text-xs">Is mahinay</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {activeRideStatus !== 'idle' && (
                    <TouchableOpacity 
                        className='mx-5 mb-6 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex-row items-center'
                        onPress={() => navigation.navigate('Ride')}
                        activeOpacity={0.9}
                    >
                        <View className='p-3.5 rounded-[18px] mr-4' style={{ backgroundColor: primaryLight }}>
                            <MapPin size={24} color={primaryColor} strokeWidth={2.5} />
                        </View>
                        <View className='flex-1'>
                            <Text className='text-gray-900 font-black text-lg leading-tight mb-0.5'>Rider raste mein hai</Text>
                            <Text className='text-gray-500 font-bold text-xs'>5 minute mein pohnch raha hai</Text>
                        </View>
                        <View className="bg-gray-50 p-2.5 rounded-[14px]">
                            <ArrowRight size={20} color="#64748b" strokeWidth={3} />
                        </View>
                    </TouchableOpacity>
                )}

                <View className="px-5 mb-8">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Ride')}
                        activeOpacity={0.9}
                        className="w-full bg-white rounded-[32px] p-2.5 flex-row items-center shadow-md shadow-black/5 border border-gray-100"
                    >
                        <View className="flex-1 pl-5 py-4">
                            <View className="flex-row items-center mb-2">
                                <Zap size={16} color={primaryColor} className="mr-1.5" strokeWidth={3} />
                                <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest">NayA Order</Text>
                            </View>
                            <Text className="text-gray-900 font-black text-2xl tracking-tight">
                                {isCustomer ? "Pickup Bulao" : "Raddi Kharido"}
                            </Text>
                        </View>
                        
                        <View className="w-20 h-24 rounded-[24px] items-center justify-center" style={{ backgroundColor: primaryLight }}>
                            <ArrowRight size={32} color={primaryColor} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between px-6 mb-10">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <TouchableOpacity 
                                key={action.id} 
                                activeOpacity={0.7}
                                className="items-center"
                                onPress={() => {
                                    if(action.route === 'Activity' || action.route === 'Profile' || action.route === 'Wallet') {
                                        navigation.navigate(action.route);
                                    }
                                }}
                            >
                                <View className="w-16 h-16 bg-white rounded-[20px] items-center justify-center shadow-sm border border-gray-100 mb-2.5">
                                    <Icon size={24} color="#334155" strokeWidth={2} />
                                </View>
                                <Text className="text-[11px] font-extrabold text-gray-600 tracking-wide">{action.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View className='px-5'>
                    <View className='flex-row justify-between items-end mb-4 px-1'>
                        <Text className='font-black text-gray-900 text-xl tracking-tight'>
                            Pichlay Orders
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Activity')} className="flex-row items-center bg-gray-200/60 px-3 py-1.5 rounded-full">
                            <Text className='font-extrabold text-[11px] text-gray-700 mr-1 uppercase tracking-wider'>Sab Dekhein</Text>
                            <ChevronRight size={14} color="#374151" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    <View className='bg-white rounded-[32px] p-8 w-full items-center border border-gray-100 shadow-sm'>
                        <View className="bg-gray-50 w-24 h-24 rounded-full items-center justify-center mb-5">
                            <Image source={EmptyPic} className='w-14 h-14 opacity-40' resizeMode="contain" />
                        </View>
                        <Text className='text-gray-900 text-xl font-black text-center mb-2 tracking-tight'>
                            Koi order nahi hai
                        </Text>
                        <Text className='text-gray-500 text-sm text-center leading-relaxed font-medium px-4'>
                            {isCustomer
                                ? "Naya pickup schedule karein aur apni history yahan dekhein."
                                : "Order pura karein aur apni rozana ki kamai yahan track karein."}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    )
}

export default Home