import { View, Text, ActivityIndicator, Image, Animated, Easing, StatusBar } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import LOGO_URI from '../assets/logo.png';

const Loading: React.FC = () => {
    // We will animate both scale and opacity for a smooth "ripple/breathing" effect
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.8)).current;
    
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { role?: string } };
    const role = userdata?.role || 'customer';

    const isCollector = role === 'collector';
    const primaryColor = isCollector ? '#d97706' : '#059669'; // Amber vs Emerald
    const primaryLight = isCollector ? '#fef3c7' : '#d1fae5'; // Soft Amber vs Soft Emerald

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.3,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0.2,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.8,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ])
        ).start();
    }, [scaleAnim, opacityAnim]);

    return (
        <View className="flex-1 justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-50 bg-white/95 backdrop-blur-md">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            <View className="items-center justify-center relative">
                {/* Animated Pulsing Background Ring */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: 130,
                        height: 130,
                        borderRadius: 65,
                        backgroundColor: primaryLight,
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }}
                />
                
                {/* Static Floating Logo Container */}
                <View className="bg-white rounded-full w-24 h-24 items-center justify-center shadow-xl border border-gray-50 z-10">
                    <Image
                        source={LOGO_URI}
                        className="w-14 h-14"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Clean, modern typography and subtle indicator */}
            <View className="mt-12 items-center">
                <ActivityIndicator size="small" color={primaryColor} />
                <Text className="text-gray-400 font-extrabold text-xs mt-4 tracking-[0.2em] uppercase">
                    Please Wait
                </Text>
            </View>
        </View>
    );
};

export default Loading;