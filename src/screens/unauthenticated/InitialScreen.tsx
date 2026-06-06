import React, { useState, useRef, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    Animated,
    Dimensions,
    StyleSheet,
    Platform,
} from 'react-native'
import { DollarSign, Package, Zap, Home, Recycle, Truck, ArrowRight, Leaf, MapPin } from 'lucide-react-native'
import Logo from "../../assets/half-logo.jpeg"

const { width, height } = Dimensions.get('window')

const InitialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [role, setRole] = useState<'customer' | 'collector'>('customer')
    const slideAnim = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const cardScale = useRef(new Animated.Value(0.96)).current
    const pillAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const handleRoleSwitch = (newRole: 'customer' | 'collector') => {
        if (newRole === role) return
        setRole(newRole)

        Animated.sequence([
            Animated.timing(pillAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(pillAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const isCustomer = role === 'customer'

    // Theme colors
    const theme = {
        primary: isCustomer ? '#0A7A4A' : '#C85A00',
        primaryLight: isCustomer ? '#E8F5EE' : '#FEF3E7',
        primaryMid: isCustomer ? '#1AA061' : '#F07520',
        accent: isCustomer ? '#05C26B' : '#FF8C3A',
        bg: isCustomer ? '#F0FAF5' : '#FFF8F0',
        pillBg: isCustomer ? '#D1EDE0' : '#FFE4C4',
        pillText: isCustomer ? '#0A7A4A' : '#9A3D00',
        pillIcon: isCustomer ? '#0A7A4A' : '#C85A00',
    }

    const customerFeatures = [
        { icon: DollarSign, text: 'Earn Instantly', sub: 'Get paid same day' },
        { icon: Package, text: 'Easy Listing', sub: 'List in 60 seconds' },
        { icon: Zap, text: 'Fast Pickup', sub: 'Within 2 hours' },
    ]

    const collectorFeatures = [
        { icon: MapPin, text: 'Doorstep Service', sub: 'We come to you' },
        { icon: Leaf, text: 'Go Green', sub: 'Reduce waste daily' },
        { icon: Zap, text: 'Quick & Easy', sub: 'Zero hassle' },
    ]

    const features = isCustomer ? customerFeatures : collectorFeatures

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: '#FFFFFF' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Top accent bar */}
            <View style={[styles.topAccent, { backgroundColor: theme.primary }]} />

            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoWrap}>
                        <Image source={Logo} style={styles.logo} resizeMode="contain" />
                    </View>
                    <View>
                        <Text style={styles.brandName}>Raddi</Text>
                        <Text style={styles.brandTag}>Recycle. Earn. Repeat.</Text>
                    </View>
                </View>

                {/* Hero Card */}
                <Animated.View style={[
                    styles.heroCard,
                    { backgroundColor: theme.primaryLight, transform: [{ scale: cardScale }] }
                ]}>
                    {/* Decorative circle */}
                    <View style={[styles.decorCircle, { backgroundColor: theme.accent, opacity: 0.08 }]} />
                    <View style={[styles.decorCircleSmall, { backgroundColor: theme.primary, opacity: 0.06 }]} />

                    <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
                        {isCustomer
                            ? <Home size={22} color="#fff" strokeWidth={2} />
                            : <Truck size={22} color="#fff" strokeWidth={2} />
                        }
                    </View>

                    <Text style={styles.heroTitle}>
                        {isCustomer
                            ? 'Sell Your Raddi\nWithout Leaving Home'
                            : 'Schedule a Raddi\nPickup Anytime'
                        }
                    </Text>
                    <Text style={[styles.heroSub, { color: '#555' }]}>
                        {isCustomer
                            ? 'List your scrap, our rider arrives at your door. Fast, contactless, and rewarding.'
                            : 'Request a doorstep pickup — we handle sorting, you save the planet.'}
                    </Text>

                    {/* Feature pills */}
                    <View style={styles.pillRow}>
                        {features.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <View key={i} style={[styles.pill, { backgroundColor: theme.pillBg }]}>
                                    <Icon size={13} color={theme.pillIcon} strokeWidth={2.5} />
                                    <Text style={[styles.pillText, { color: theme.pillText }]}>{f.text}</Text>
                                </View>
                            )
                        })}
                    </View>
                </Animated.View>

                {/* Role Toggle */}
                <View style={styles.toggleSection}>
                    <Text style={styles.toggleLabel}>Who are you?</Text>
                    <View style={styles.toggleBar}>
                        {/* Sliding indicator */}
                        <Animated.View
                            style={[
                                styles.toggleIndicator,
                                {
                                    backgroundColor: isCustomer ? '#0A7A4A' : '#C85A00',
                                    left: isCustomer ? 4 : '50%',
                                }
                            ]}
                        />
                        <TouchableOpacity
                            style={styles.toggleBtn}
                            onPress={() => handleRoleSwitch('customer')}
                            activeOpacity={0.8}
                        >
                            <Home size={16} color={isCustomer ? '#fff' : '#888'} strokeWidth={2} />
                            <Text style={[styles.toggleBtnText, isCustomer && styles.toggleBtnActive]}>
                                Seller
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.toggleBtn}
                            onPress={() => handleRoleSwitch('collector')}
                            activeOpacity={0.8}
                        >
                            <Truck size={16} color={!isCustomer ? '#fff' : '#888'} strokeWidth={2} />
                            <Text style={[styles.toggleBtnText, !isCustomer && styles.toggleBtnActive]}>
                                Collector
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaSection}>
                    {/* Primary CTA */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignUp', { role })}
                        activeOpacity={0.85}
                        style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                    >
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                        <View style={[styles.arrowCircle, { backgroundColor: theme.primaryMid }]}>
                            <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>

                    {/* Login CTA */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignIn', { role })}
                        activeOpacity={0.7}
                        style={styles.loginBtn}
                    >
                        <Text style={styles.loginText}>
                            Already have an account?{' '}
                            <Text style={[styles.loginLink, { color: theme.primary }]}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>🇵🇰 Made in Pakistan · Eco-first</Text>

            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    topAccent: {
        height: 3,
        width: '100%',
    },
    container: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    logoWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    logo: {
        width: 46,
        height: 46,
    },
    brandName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        letterSpacing: -0.5,
    },
    brandTag: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
        letterSpacing: 0.2,
        marginTop: 1,
    },

    // Hero Card
    heroCard: {
        borderRadius: 24,
        padding: 24,
        paddingTop: 28,
        overflow: 'hidden',
        position: 'relative',
        marginTop: 4,
    },
    decorCircle: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: -60,
        right: -60,
    },
    decorCircleSmall: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        bottom: -30,
        left: 20,
    },
    iconBadge: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
        lineHeight: 32,
        letterSpacing: -0.6,
        marginBottom: 10,
    },
    heroSub: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '400',
        marginBottom: 18,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 100,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.1,
    },

    // Role Toggle
    toggleSection: {
        marginTop: 8,
    },
    toggleLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 10,
        textAlign: 'center',
    },
    toggleBar: {
        flexDirection: 'row',
        backgroundColor: '#F3F3F3',
        borderRadius: 16,
        padding: 4,
        position: 'relative',
        height: 52,
    },
    toggleIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        width: '49%',
        borderRadius: 13,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        zIndex: 1,
    },
    toggleBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    toggleBtnActive: {
        color: '#FFFFFF',
    },

    // CTA
    ctaSection: {
        gap: 0,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingLeft: 28,
        paddingRight: 16,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    arrowCircle: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginBtn: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    loginText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    loginLink: {
        fontWeight: '700',
    },

    // Footer
    footer: {
        textAlign: 'center',
        fontSize: 11,
        color: '#BBBBBB',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
})

export default InitialScreen