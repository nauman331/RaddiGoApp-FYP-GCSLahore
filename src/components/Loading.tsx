
import { View, Text, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import LOGO_URI from '../assets/logo.png';

const Loading: React.FC = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { role?: string } };
    const role = userdata?.role || 'seller';

    const themeColors = {
        primary: role === 'buyer' ? '#d97706' : '#059669',
    };

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.15,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [scaleAnim]);

    return (
        <View className="flex-1 justify-center items-center w-full h-full absolute top-0 left-0 right-0 bottom-0 z-50 bg-white">
            <Animated.View
                className="bg-gray-200 rounded-3xl p-8 mb-5 border-4 shadow-lg"
                style={{
                    transform: [{ scale: scaleAnim }],
                    borderColor: themeColors.primary
                }}
            >
                <Image
                    source={LOGO_URI}
                    className="w-24 h-24"
                    resizeMode="contain"
                />
            </Animated.View>
            <Text className="text-2xl font-bold mt-2 tracking-wide" style={{ color: themeColors.primary }}>Loading...</Text>
            <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 20 }} />
        </View>
    );
};



export default Loading;