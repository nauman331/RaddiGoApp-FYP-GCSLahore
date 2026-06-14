import React, { useEffect, useRef } from 'react'
import { View, Text, Image, Animated, StatusBar } from 'react-native'
import Logo from "../../assets/half-logo.jpeg"

const SplashScreen: React.FC = ({ navigation }: any) => {
    // Logo Animations
    const logoOpacity = useRef(new Animated.Value(0)).current
    const logoScale = useRef(new Animated.Value(0.4)).current
    
    // Typography Animations
    const textOpacity = useRef(new Animated.Value(0)).current
    const textTranslateY = useRef(new Animated.Value(20)).current

    useEffect(() => {
        // Sequence: Pop the logo first, then slide up the text
        Animated.sequence([
            // 1. Logo Entrance
            Animated.parallel([
                Animated.timing(logoOpacity, { 
                    toValue: 1, 
                    duration: 600, 
                    useNativeDriver: true 
                }),
                Animated.spring(logoScale, { 
                    toValue: 1, 
                    friction: 6, 
                    tension: 40, 
                    useNativeDriver: true 
                })
            ]),
            // 2. Text Entrance
            Animated.parallel([
                Animated.timing(textOpacity, { 
                    toValue: 1, 
                    duration: 500, 
                    useNativeDriver: true 
                }),
                Animated.timing(textTranslateY, { 
                    toValue: 0, 
                    duration: 500, 
                    useNativeDriver: true 
                })
            ])
        ]).start(() => {
            // Navigate to the next screen after a brief pause so the user can read the text
            setTimeout(() => {
                navigation.replace('InitialScreen');
            }, 1200);
        });
    }, [])

    return (
        <View className="flex-1 bg-white items-center justify-center">
            {/* Make the status bar blend seamlessly into the white background */}
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent />

            {/* Subtle background decoration to make the white feel less empty */}
            <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center overflow-hidden opacity-[0.03] pointer-events-none">
                <View className="w-[150%] aspect-square rounded-full border-[60px] border-emerald-600 absolute -top-1/4" />
                <View className="w-[150%] aspect-square rounded-full border-[60px] border-emerald-600 absolute -bottom-1/4" />
            </View>

            {/* Logo Wrapper */}
            <Animated.View
                style={{
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                }}
                className="items-center justify-center z-10 mb-8"
            >
                {/* Wrapping the JPEG in a white padded box gives it an 'App Icon' feel and hides harsh edges */}
                <View className="bg-white rounded-[32px] p-2 shadow-2xl border border-gray-50">
                    <Image 
                        source={Logo} 
                        className="w-36 h-36 rounded-3xl" 
                        resizeMode="cover"
                    />
                </View>
            </Animated.View>

            {/* Typography Wrapper */}
            <Animated.View
                style={{
                    opacity: textOpacity,
                    transform: [{ translateY: textTranslateY }],
                }}
                className="items-center z-10"
            >
                <Text className="text-gray-900 text-4xl font-black tracking-tight">RaddiGo</Text>
                
                {/* Modern Pill-shaped Subtitle */}
                <View className="mt-3 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100 shadow-sm">
                    <Text className="text-emerald-700 text-xs font-extrabold uppercase tracking-widest">
                        Apke Darwazay Tak
                    </Text>
                </View>
            </Animated.View>
        </View>
    )
}

export default SplashScreen