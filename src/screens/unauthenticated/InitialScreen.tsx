import React, { useState, useRef, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Animated,
    StyleSheet,
    Dimensions,
    Image,                // <-- Import Image
} from 'react-native'
import { Home, Truck, ArrowRight, Zap, Clock, Leaf, MapPin, DollarSign } from 'lucide-react-native'
import LogoImage from '../../assets/half-logo.jpeg'  // <-- Import the logo

const InitialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [role, setRole] = useState<'customer' | 'collector'>('customer')
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start()
    }, [])

    const isCustomer = role === 'customer'
    const accent = isCustomer ? '#059669' : '#d97706'
    const accentLight = isCustomer ? '#ecfdf5' : '#fffbeb'

    const customerContent = {
        eyebrow: 'SELLERS KE LIYE',
        titleLine1: 'Ghar baithe',
        titleAccent: 'raddi becho',
        sub: 'Apna scrap list karo, hum rider bhejtay hain. Same day payment, zero jhanjhat.',
        features: [
            { icon: Zap, label: 'Aaj payment' },
            { icon: Clock, label: '2 ghante mein' },
            { icon: Leaf, label: 'Mahaul bachao' },
        ],
    }

    const collectorContent = {
        eyebrow: 'COLLECTORS KE LIYE',
        titleLine1: 'Apna schedule',
        titleAccent: 'pickup lo',
        sub: 'Apne ilaaké mein pickups lo, paisa kamao. Flexible timings, full support.',
        features: [
            { icon: Clock, label: 'Apna time chuno' },
            { icon: MapPin, label: 'Map se dhundo' },
            { icon: DollarSign, label: 'Daily kamao' },
        ],
    }

    const content = isCustomer ? customerContent : collectorContent

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            <View style={[styles.topBar, { backgroundColor: accent }]} />

            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

                <View style={styles.header}>
                        <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
                    <View>
                        <Text style={styles.brandName}>RaddiGo</Text>
                        <Text style={[styles.brandUrdu, { color: accent }]}>بیچو۔ کماؤ۔ دہراؤ</Text>
                    </View>
                    <View style={styles.countryBadge}>
                        <Text style={styles.countryText}>🇵🇰 Pakistan</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACCOUNT TYPE</Text>
                    <View style={styles.toggleBar}>
                        {(['customer', 'collector'] as const).map((r) => {
                            const active = role === r
                            const Icon = r === 'customer' ? Home : Truck
                            return (
                                <TouchableOpacity
                                    key={r}
                                    style={[
                                        styles.toggleBtn,
                                        active && { backgroundColor: accent, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
                                    ]}
                                    onPress={() => setRole(r)}
                                    activeOpacity={0.8}
                                >
                                    <Icon
                                        size={16}
                                        color={active ? '#ffffff' : '#64748b'}
                                        strokeWidth={2.5}
                                    />
                                    <Text style={[styles.toggleBtnText, { color: active ? '#ffffff' : '#64748b' }]}>
                                        {r === 'customer' ? 'Customer' : 'Collector'}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                <View style={styles.heroCard}>
                    <View style={[styles.heroCornerAccent, { backgroundColor: accent }]} />
                    <View style={styles.heroTop}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.heroEyebrow, { color: accent }]}>{content.eyebrow}</Text>
                            <Text style={styles.heroTitle}>
                                {content.titleLine1}{'\n'}
                                <Text style={{ color: accent }}>{content.titleAccent}</Text>
                            </Text>
                        </View>
                        <View style={[styles.heroIcon, { backgroundColor: accent }]}>
                            {isCustomer
                                ? <Home size={24} color="#ffffff" strokeWidth={2.5} />
                                : <Truck size={24} color="#ffffff" strokeWidth={2.5} />
                            }
                        </View>
                    </View>
                    <Text style={styles.heroSub}>{content.sub}</Text>
                    <View style={styles.pillRow}>
                        {content.features.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <View key={i} style={styles.pill}>
                                    <Icon size={14} color={accent} strokeWidth={2.5} />
                                    <Text style={styles.pillText}>{f.label}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg. Earning</Text>
                        <Text style={[styles.statValue, { color: accent }]}>Rs 850</Text>
                        <Text style={styles.statSub}>per pickup</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Cities</Text>
                        <Text style={styles.statValueDark}>12+</Text>
                        <Text style={styles.statSub}>KHI · LHR · ISB</Text>
                    </View>
                </View>

                <View style={styles.ctaSection}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignUp', { role })}
                        style={[styles.primaryBtn, { backgroundColor: accent }]}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.primaryBtnText}>Shuru karo</Text>
                        <ArrowRight size={20} color="#ffffff" strokeWidth={3} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('SignIn', { role })}
                        activeOpacity={0.7}
                        style={styles.loginBtn}
                    >
                        <Text style={styles.loginText}>
                            Pehle se account hai?{' '}
                            <Text style={[styles.loginLink, { color: accent }]}>Sign in karo</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    topBar: {
        height: 4,
        width: '100%',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoImage: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    brandName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    brandUrdu: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    countryBadge: {
        marginLeft: 'auto',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    countryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    section: {
        gap: 10,
    },
    sectionLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    toggleBar: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    toggleBtnText: {
        fontSize: 14,
        fontWeight: '800',
    },
    heroCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    heroCornerAccent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 120,
        height: 120,
        borderBottomLeftRadius: 120,
        opacity: 0.05,
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    heroEyebrow: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    heroSub: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 20,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    pillText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '700',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    statValueDark: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    statSub: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
    },
    ctaSection: {
        marginTop: 'auto',
        gap: 6,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    primaryBtnText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#ffffff',
    },
    loginBtn: {
        alignItems: 'center',
        paddingVertical: 18,
    },
    loginText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    loginLink: {
        fontWeight: '900',
    },
})

export default InitialScreen