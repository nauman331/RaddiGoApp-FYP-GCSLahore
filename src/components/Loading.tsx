import { View, Text, ActivityIndicator, Image, Animated, Easing, StatusBar, StyleSheet } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import LOGO_URI from '../assets/logo.jpeg';

const Loading: React.FC = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.8)).current;

    const authState = useSelector((state: RootState) => state?.auth);
    const role = authState?.userdata?.role || 'customer';

    const isCollector = role === 'collector';
    const primaryColor = isCollector ? '#d97706' : '#059669';
    const primaryLight = isCollector ? '#fef3c7' : '#d1fae5';

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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent />

            <View style={styles.logoWrapper}>
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

                <View style={styles.logoBox}>
                    <Image
                        source={LOGO_URI}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.textWrapper}>
                <ActivityIndicator size="small" color={primaryColor} />
                <Text style={styles.loadingText}>
                    Please Wait
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    logoBox: {
        backgroundColor: '#ffffff',
        borderRadius: 50,
        width: 96,
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#f9fafb',
        zIndex: 10,
    },
    logoImage: {
        width: 56,
        height: 56,
    },
    textWrapper: {
        marginTop: 48,
        alignItems: 'center',
    },
    loadingText: {
        color: '#9ca3af',
        fontWeight: '800',
        fontSize: 12,
        marginTop: 16,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

export default Loading;