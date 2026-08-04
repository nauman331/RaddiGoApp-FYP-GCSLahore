import React, { useEffect, useRef } from 'react'
import { View, Text, Image, Animated, StatusBar, StyleSheet } from 'react-native'
import Logo from "../../assets/half-logo.jpeg"

const SplashScreen: React.FC = ({ navigation }: any) => {
    const logoOpacity = useRef(new Animated.Value(0)).current
    const logoScale = useRef(new Animated.Value(0.4)).current

    const textOpacity = useRef(new Animated.Value(0)).current
    const textTranslateY = useRef(new Animated.Value(20)).current

    useEffect(() => {
        Animated.sequence([
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
            setTimeout(() => {
                navigation.replace('InitialScreen');
            }, 1200);
        });
    }, [])

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent />

            <Animated.View
                style={[
                    styles.logoWrapper,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    }
                ]}
            >
                <View style={styles.logoBox}>
                    <Image
                        source={Logo}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>
            </Animated.View>

            <Animated.View
                style={[
                    styles.textWrapper,
                    {
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }],
                    }
                ]}
            >
                <Text style={styles.brandTitle}>RaddiGo</Text>
                <View style={styles.subPill}>
                    <Text style={styles.subPillText}>
                        Apke Darwazay Tak
                    </Text>
                </View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        marginBottom: 32,
    },
    logoBox: {
        backgroundColor: '#ffffff',
        borderRadius: 32,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    logoImage: {
        width: 144,
        height: 144,
        borderRadius: 24,
    },
    textWrapper: {
        alignItems: 'center',
        zIndex: 10,
    },
    brandTitle: {
        color: '#111827',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subPill: {
        marginTop: 12,
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1fae5',
    },
    subPillText: {
        color: '#047857',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
})

export default SplashScreen