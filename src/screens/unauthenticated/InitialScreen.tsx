import React, { useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native'
import { DollarSign, Package, Zap, Home, Recycle, Truck } from 'lucide-react-native'
import Logo from "../../assets/half-logo.jpeg"

const InitialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [role, setRole] = useState<'seller' | 'buyer'>('seller')

    const features = role === 'seller'
        ? [
            { icon: DollarSign, text: 'Instant Earnings', color: '#059669' },
            { icon: Package, text: 'Easy Listing', color: '#059669' },
            { icon: Zap, text: 'Fast Pickup', color: '#059669' }
        ]
        : [
            { icon: Home, text: 'Doorstep Service', color: '#d97706' },
            { icon: Recycle, text: 'Eco-Friendly', color: '#d97706' },
            { icon: Zap, text: 'Quick & Easy', color: '#d97706' }
        ]

    const headerTitle = role === 'seller'
        ? 'Sell Your Raddi Without Leaving Home'
        : "Get Pickup Service For Your Raddi"
    const headerSubtitle = role === 'seller'
        ? 'Our riders pick up raddi from customers — list items and earn.'
        : 'Request a rider to pick up your items — quick and contactless.'

    return (
        <SafeAreaView className="flex-1 bg-gradient-to-b from-white to-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            <View className="flex-1 justify-between px-5 pt-8 pb-6">
                {/* Logo Branding */}
                <View className="items-center">
                    <Image
                        source={Logo}
                        className="w-24 h-24 rounded-2xl"
                        resizeMode="contain"
                    />
                </View>

                {/* Hero Section */}
                <View className="items-center justify-center">
                    <View className={`w-full items-center rounded-3xl p-6 shadow-sm ${role === 'seller' ? 'bg-emerald-50/80' : 'bg-amber-50/80'
                        }`}>

                        <View className="mt-8 px-2 flex items-center">
                            <Text className="font-bold text-2xl text-center text-gray-900 leading-tight">
                                {headerTitle}
                            </Text>
                            <Text className="text-gray-600 text-center text-base mt-4 leading-relaxed px-2">
                                {headerSubtitle}
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap justify-center gap-2 mt-5">
                            {features.map((feature, index) => {
                                const IconComponent = feature.icon
                                return (
                                    <View
                                        key={`${index} - ${feature.text}`}
                                        className={`px-4 py-2 rounded-full flex-row items-center gap-1.5 ${role === 'seller' ? 'bg-emerald-200/60' : 'bg-amber-200/60'}`}
                                    >
                                        <IconComponent size={14} color={feature.color} strokeWidth={2.5} />
                                        <Text className="text-xs font-semibold text-gray-700">{feature.text}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>

                </View>

                {/* Action Section */}
                <View className="w-full pt-4">
                    <Text className="text-sm font-medium text-gray-500 text-center mb-5 tracking-wide uppercase">
                        Choose Your Role
                    </Text>

                    {/* Role Toggle */}
                    <View className="flex-row gap-3 mb-6">
                        <TouchableOpacity
                            onPress={() => setRole('seller')}
                            activeOpacity={0.7}
                            className={`flex-1 py-5 rounded-2xl items-center justify-center shadow-sm ${role === 'seller'
                                ? 'bg-emerald-600 shadow-emerald-200'
                                : 'bg-white border-2 border-emerald-100'
                                }`}
                        >
                            <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${role === 'seller' ? 'bg-emerald-500' : 'bg-emerald-50'
                                }`}>
                                <Home
                                    size={24}
                                    color={role === 'seller' ? '#ffffff' : '#059669'}
                                    strokeWidth={2}
                                />
                            </View>
                            <Text className={`font-bold text-base ${role === 'seller' ? 'text-white' : 'text-emerald-700'
                                }`}>
                                Seller
                            </Text>
                            <Text className={`text-xs mt-1 ${role === 'seller' ? 'text-emerald-50' : 'text-emerald-600'
                                }`}>
                                Pickup orders
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setRole('buyer')}
                            activeOpacity={0.7}
                            className={`flex-1 py-5 rounded-2xl items-center justify-center shadow-sm ${role === 'buyer'
                                ? 'bg-amber-600 shadow-amber-200'
                                : 'bg-white border-2 border-amber-100'
                                }`}
                        >
                            <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${role === 'buyer' ? 'bg-amber-500' : 'bg-amber-50'
                                }`}>
                                <Truck
                                    size={24}
                                    color={role === 'buyer' ? '#ffffff' : '#d97706'}
                                    strokeWidth={2}
                                />
                            </View>
                            <Text className={`font-bold text-base ${role === 'buyer' ? 'text-white' : 'text-amber-700'
                                }`}>
                                Buyer
                            </Text>
                            <Text className={`text-xs mt-1 ${role === 'buyer' ? 'text-amber-50' : 'text-amber-600'
                                }`}>
                                Request pickup
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Primary CTA */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignIn', { role })}
                        activeOpacity={0.8}
                        className={`py-5 rounded-2xl items-center justify-center shadow-lg ${role === 'seller'
                            ? 'bg-emerald-600 shadow-emerald-200'
                            : 'bg-amber-600 shadow-amber-200'
                            }`}
                    >
                        <Text className="text-white font-bold text-lg">
                            Continue as {role === 'seller' ? 'Seller' : 'Buyer'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default InitialScreen