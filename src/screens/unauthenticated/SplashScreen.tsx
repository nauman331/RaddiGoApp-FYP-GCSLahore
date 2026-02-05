import React, { useEffect, useRef } from 'react'
import { View, Text, Image, ImageBackground, Animated, StatusBar } from 'react-native'
import Logo from "../../assets/half-logo.jpeg"

const SplashScreen: React.FC = ({ navigation }: any) => {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(18)).current
    const scale = useRef(new Animated.Value(0.88)).current
    const subtitleOpacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 700, useNativeDriver: true }),
            Animated.sequence([
                Animated.spring(scale, { toValue: 1.04, useNativeDriver: true, friction: 6 }),
                Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
            ]),
            Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 500, useNativeDriver: true }),
        ]).start(() => {
            setTimeout(() => {
                navigation.replace('InitialScreen');
            }, 1500);
        })
    }, [])

    return (
        <ImageBackground source={Logo} style={{ flex: 1 }} blurRadius={18} resizeMode="cover">
            <StatusBar barStyle="light-content" />
            <View className="flex-1 bg-black/40 items-center justify-center">
                <Animated.View
                    style={{
                        opacity,
                        transform: [{ translateY }],
                    }}
                    className="bg-white/6 p-6 rounded-2xl items-center shadow-md"
                >
                    <Image source={Logo} className="w-44 h-44 rounded-2xl" />
                    <Text className="text-white text-3xl font-extrabold mt-4">RaddiGo</Text>
                    <Text className="text-white/80 text-sm mt-1">Recycle smarter — pickup to doorstep</Text>
                </Animated.View>
            </View>
        </ImageBackground>
    )
}

export default SplashScreen