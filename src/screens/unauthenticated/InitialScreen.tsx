import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native'
import { ArrowRight, Sparkles, ShieldCheck, Zap, UserPlus, Clock, ChevronRight, FileText, Recycle, Boxes, Cpu } from 'lucide-react-native'
import LogoImage from '../../assets/half-logo.jpeg'

const { width } = Dimensions.get('window')

const InitialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const scrapRates = [
        { icon: FileText, name: 'Paper & Gatta', urdu: 'کاغذ و گتا', price: 'Rs 50/kg', color: '#059669', bg: '#ecfdf5' },
        { icon: Recycle, name: 'Plastic', urdu: 'پلاسٹک', price: 'Rs 60/kg', color: '#2563eb', bg: '#eff6ff' },
        { icon: Boxes, name: 'Iron & Steel', urdu: 'لوہا', price: 'Rs 120/kg', color: '#475569', bg: '#f8fafc' },
        { icon: Cpu, name: 'Copper', urdu: 'تانبا', price: 'Rs 1,800/kg', color: '#d97706', bg: '#fffbeb' },
    ]

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {/* Hero Top Container */}
                <View style={styles.heroContainer}>
                    <View style={styles.topHeader}>
                        <View style={styles.locationPill}>
                            <Text style={styles.flag}>🇵🇰</Text>
                            <Text style={styles.locationText}>Lahore & Pakistan</Text>
                        </View>
                        <View style={styles.onlineBadge}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Live Pickups Active</Text>
                        </View>
                    </View>

                    {/* Logo & Main Headline */}
                    <View style={styles.heroContent}>
                        <View style={styles.logoRing}>
                            <Image source={LogoImage} style={styles.logoImage} resizeMode="cover" />
                        </View>

                        <Text style={styles.heroBrandName}>RaddiGo</Text>
                        <Text style={styles.heroUrduTag}>بیچو۔ کماؤ۔ دہراؤ</Text>

                        <Text style={styles.heroSubtitle}>
                            Ghar baithe raddi bechein aur doorstep par instant cash paayein.
                        </Text>
                    </View>

                    {/* Feature Pills */}
                    <View style={styles.featuresRow}>
                        <View style={styles.featureItem}>
                            <Zap size={14} color="#34d399" strokeWidth={2.5} />
                            <Text style={styles.featureText}>2 Ghante Pickup</Text>
                        </View>
                        <View style={styles.featureDivider} />
                        <View style={styles.featureItem}>
                            <ShieldCheck size={14} color="#34d399" strokeWidth={2.5} />
                            <Text style={styles.featureText}>Fauri Cash</Text>
                        </View>
                        <View style={styles.featureDivider} />
                        <View style={styles.featureItem}>
                            <Clock size={14} color="#34d399" strokeWidth={2.5} />
                            <Text style={styles.featureText}>Same Day</Text>
                        </View>
                    </View>
                </View>

                {/* Body Content */}
                <View style={styles.bodyContent}>
                    {/* Live Scrap Rates Section */}
                    <View style={styles.tickerSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sparkleIcon}>
                                <Sparkles size={16} color="#d97706" strokeWidth={2.5} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>Aaj Ke Rate (Live Scrap Rates)</Text>
                                <Text style={styles.sectionSub}>Updated daily across Lahore</Text>
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ratesScroll}>
                            {scrapRates.map((item, idx) => {
                                const IconComponent = item.icon
                                return (
                                    <View key={idx} style={[styles.rateCard, { borderColor: item.color + '25' }]}>
                                        <View style={[styles.rateIconWrap, { backgroundColor: item.bg }]}>
                                            <IconComponent size={20} color={item.color} strokeWidth={2.5} />
                                        </View>
                                        <Text style={styles.rateName}>{item.name}</Text>
                                        <Text style={styles.rateUrdu}>{item.urdu}</Text>
                                        <Text style={[styles.ratePrice, { color: item.color }]}>{item.price}</Text>
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {/* Primary CTAs */}
                    <View style={styles.ctaSection}>
                        {/* Big Prominent Sign In Button */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignIn')}
                            style={styles.primaryBtn}
                            activeOpacity={0.88}
                        >
                            <Text style={styles.primaryBtnText}>Sign In Karein</Text>
                            <View style={styles.arrowCircle}>
                                <ArrowRight size={20} color="#ffffff" strokeWidth={3} />
                            </View>
                        </TouchableOpacity>

                        {/* Secondary Sign Up Button */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignUp')}
                            style={styles.secondaryBtn}
                            activeOpacity={0.8}
                        >
                            <UserPlus size={18} color="#059669" strokeWidth={2.5} />
                            <Text style={styles.secondaryBtnText}>Naya Account Banayein (Sign Up)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#064e3b',
    },
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#f8fafc',
    },
    heroContainer: {
        backgroundColor: '#064e3b',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 28,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    flag: {
        fontSize: 13,
    },
    locationText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#ffffff',
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34d399',
    },
    onlineText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#34d399',
    },
    heroContent: {
        alignItems: 'center',
        marginVertical: 8,
    },
    logoRing: {
        width: 72,
        height: 72,
        borderRadius: 24,
        padding: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    heroBrandName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -0.8,
    },
    heroUrduTag: {
        fontSize: 16,
        fontWeight: '900',
        color: '#6ee7b7',
        marginTop: 2,
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#a7f3d0',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },
    featuresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#ffffff',
    },
    featureDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 12,
    },
    bodyContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
        gap: 24,
    },
    tickerSection: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sparkleIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#fffbeb',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f172a',
    },
    sectionSub: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
    },
    ratesScroll: {
        gap: 12,
        paddingRight: 12,
    },
    rateCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 14,
        width: 130,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    rateIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    rateName: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0f172a',
    },
    rateUrdu: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 6,
    },
    ratePrice: {
        fontSize: 15,
        fontWeight: '900',
    },
    ctaSection: {
        gap: 12,
        marginTop: 8,
    },
    primaryBtn: {
        backgroundColor: '#059669',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 22,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
    },
    primaryBtnText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#ffffff',
    },
    arrowCircle: {
        position: 'absolute',
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtn: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#059669',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#059669',
    },
})

export default InitialScreen