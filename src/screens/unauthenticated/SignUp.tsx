import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    Image,                    // <-- added
} from 'react-native'
import React, { useState } from 'react'
import { ChevronLeft, Mail, Lock, Eye, EyeOff, User, ArrowRight, Phone, ShieldCheck } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '../../assets/Icons'
import LogoImage from '../../assets/half-logo.jpeg'   // <-- import logo
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const SignUp: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const role = route?.params?.role || 'customer'
    const { mutateAsync, isPending } = useSubmit({ endpoint: 'auth/api/v1/register' })

    const [formData, setFormData] = useState({
        username: '', email: '', phone: '', password: '', role,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const isCustomer = role === 'customer'
    const accent = isCustomer ? '#059669' : '#d97706'
    const accentLight = isCustomer ? '#ecfdf5' : '#fffbeb'
    const accentDark = isCustomer ? '#047857' : '#b45309'

    const handleChange = (field: string, value: string) => {
        if (field === 'phone') {
            setFormData(prev => ({ ...prev, [field]: value.replace(/[^0-9]/g, '').slice(0, 10) }))
        } else {
            setFormData(prev => ({ ...prev, [field]: value }))
        }
    }

    const isFormValid = formData.username && formData.email && formData.phone.length >= 10 && formData.password

    const Register = async () => {
        const { username, email, phone, password } = formData
        if (!username || !email || !phone || !password) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Barae meharbani tamam fields pur karein' })
            return
        }
        if (phone.length < 10) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Sahi 10-hindsay ka mobile number darj karein' })
            return
        }
        try {
            await mutateAsync({ ...formData, phone: `+92${formData.phone}` })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'OTP Bhej Diya!', textBody: 'Apna phone/email check karein.' })
            navigation.navigate('VerifyOTP', { email: formData.email, phone: `+92${formData.phone}`, role })
        } catch (error: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: error.message || 'Account bananay mein masla aya' })
        }
    }

    const inputBorderStyle = (field: string) => ({
        borderColor: focusedField === field ? accent : '#e5e7eb',
        borderWidth: focusedField === field ? 2 : 1.5,
    })

    const iconColor = (field: string) => focusedField === field ? accent : '#94a3b8'

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            <View style={[styles.topBar, { backgroundColor: accent }]} />

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
                style={[styles.backBtn, { backgroundColor: accentLight }]}
            >
                <ChevronLeft size={20} color={accent} strokeWidth={2.5} />
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scroll}
                bounces={false}
            >
                {/* Brand header */}
                <View style={styles.brandRow}>
                        <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
                    <View>
                        <Text style={styles.brandName}>RaddiGo</Text>
                        <Text style={[styles.brandUrdu, { color: accent }]}>بیچو۔ کماؤ۔ دہراؤ</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: accentLight }]}>
                        <View style={[styles.roleDot, { backgroundColor: accent }]} />
                        <Text style={[styles.roleText, { color: accentDark }]}>
                            {isCustomer ? 'Seller' : 'Collector'}
                        </Text>
                    </View>
                </View>

                {/* Hero text */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroEyebrow}>
                        {isCustomer ? 'SELLERS KE LIYE' : 'COLLECTORS KE LIYE'}
                    </Text>
                    <Text style={styles.heroTitle}>
                        Naya {isCustomer ? 'Seller' : 'Collector'}{'\n'}account banayein
                    </Text>
                    <Text style={styles.heroSub}>
                        {isCustomer
                            ? 'Ghar baithe raddi becho, same day payment pao.'
                            : 'Apne ilaaké mein pickups lo, daily paisa kamao.'}
                    </Text>
                </View>

                {/* Perks strip — same as InitialScreen pills */}
                <View style={[styles.perksStrip, { backgroundColor: '#ffffff', borderColor: '#f1f5f9' }]}>
                    {[
                        { emoji: '⚡', text: 'Free to join' },
                        { emoji: '🔒', text: 'Secure & safe' },
                        { emoji: '💸', text: 'Fast payments' },
                    ].map((p, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <View style={styles.perkDivider} />}
                            <View style={styles.perkItem}>
                                <Text style={{ fontSize: 13 }}>{p.emoji}</Text>
                                <Text style={styles.perkText}>{p.text}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                </View>

                {/* Form card */}
                <View style={styles.card}>

                    {/* Username */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Pura Naam</Text>
                        <View style={[styles.inputWrap, inputBorderStyle('username')]}>
                            <User size={18} color={iconColor('username')} strokeWidth={2} />
                            <TextInput
                                style={styles.input}
                                placeholder="Jaise: Ali Khan"
                                placeholderTextColor="#cbd5e1"
                                autoCapitalize="words"
                                value={formData.username}
                                onChangeText={v => handleChange('username', v)}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputWrap, inputBorderStyle('email')]}>
                            <Mail size={18} color={iconColor('email')} strokeWidth={2} />
                            <TextInput
                                style={styles.input}
                                placeholder="ali@example.com"
                                placeholderTextColor="#cbd5e1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={v => handleChange('email', v)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <View style={[styles.inputWrap, inputBorderStyle('phone')]}>
                            <Text style={{ fontSize: 17 }}>🇵🇰</Text>
                            <Text style={styles.dialCode}>+92</Text>
                            <View style={styles.phoneDivider} />
                            <TextInput
                                style={styles.input}
                                placeholder="300 1234567"
                                placeholderTextColor="#cbd5e1"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={formData.phone}
                                onChangeText={v => handleChange('phone', v)}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputWrap, inputBorderStyle('password')]}>
                            <Lock size={18} color={iconColor('password')} strokeWidth={2} />
                            <TextInput
                                style={styles.input}
                                placeholder="Kam az kam 8 huroof"
                                placeholderTextColor="#cbd5e1"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={v => handleChange('password', v)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(v => !v)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showPassword
                                    ? <Eye size={18} color="#64748b" strokeWidth={2} />
                                    : <EyeOff size={18} color="#94a3b8" strokeWidth={2} />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Trust badge */}
                    <View style={[styles.trustBadge, { backgroundColor: accentLight }]}>
                        <ShieldCheck size={14} color={accent} strokeWidth={2.5} />
                        <Text style={[styles.trustText, { color: accentDark }]}>
                            Aapka data 256-bit encryption se protected hai
                        </Text>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        onPress={Register}
                        disabled={isPending || !isFormValid}
                        activeOpacity={0.85}
                        style={[
                            styles.primaryBtn,
                            { backgroundColor: isFormValid ? accent : '#e2e8f0' },
                        ]}
                    >
                        <Text style={[styles.primaryBtnText, !isFormValid && { color: '#94a3b8' }]}>
                            {isPending ? 'Account ban raha hai...' : 'Account Banayein'}
                        </Text>
                        {isPending
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <View style={styles.arrowCircle}>
                                <ArrowRight size={18} color={isFormValid ? '#fff' : '#94a3b8'} strokeWidth={3} />
                              </View>
                        }
                    </TouchableOpacity>
                </View>

                {/* Login nudge */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('SignIn', { role })}
                    style={styles.nudgeBtn}
                >
                    <Text style={styles.nudgeText}>
                        Pehle se account hai?{' '}
                        <Text style={[styles.nudgeLink, { color: accent }]}>Sign in karein</Text>
                    </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Ya in se sign up karein</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social */}
                <View style={styles.socialRow}>
                    <TouchableOpacity activeOpacity={0.7} style={styles.socialBtn}>
                        <GoogleIcon primaryColor="#EA4335" secondaryColor="#4285F4" tertiaryColor="#FBBC05" quaternaryColor="#34A853" />
                        <Text style={styles.socialBtnText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={styles.socialBtn}>
                        <FacebookIcon primaryColor="#1877F2" />
                        <Text style={styles.socialBtnText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>
                    Sign up karke aap hamare{' '}
                    <Text style={{ color: accent }}>Terms of Service</Text>
                    {' '}aur{' '}
                    <Text style={{ color: accent }}>Privacy Policy</Text>
                    {' '}se mutafiq hain.
                </Text>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8fafc' },
    topBar: { height: 4, width: '100%' },
    backBtn: {
        position: 'absolute',
        top: 16, left: 20,
        zIndex: 10,
        width: 40, height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        gap: 16,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 48,
    },
    logoImage: {
           width: 44, height: 44,
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
    roleBadge: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    roleDot: { width: 7, height: 7, borderRadius: 4 },
    roleText: { fontSize: 12, fontWeight: '800' },
    heroSection: { gap: 6 },
    heroEyebrow: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
        lineHeight: 34,
    },
    heroSub: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        lineHeight: 22,
    },
    perksStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
    },
    perkItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    perkText: { fontSize: 12, fontWeight: '700', color: '#475569' },
    perkDivider: { width: 1, height: 16, backgroundColor: '#e2e8f0' },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        gap: 14,
    },
    fieldGroup: { gap: 7 },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginLeft: 2,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        height: '100%',
    },
    dialCode: {
        fontSize: 15,
        fontWeight: '900',
        color: '#111827',
    },
    phoneDivider: {
        width: 1.5,
        height: 18,
        backgroundColor: '#e2e8f0',
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    trustText: { fontSize: 12, fontWeight: '600' },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingLeft: 24,
        paddingRight: 14,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    arrowCircle: {
        width: 36, height: 36,
        borderRadius: 11,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nudgeBtn: { alignItems: 'center', paddingVertical: 4 },
    nudgeText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    nudgeLink: { fontWeight: '900' },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#f0f0f0' },
    dividerText: { fontSize: 11, color: '#b0b0b0', fontWeight: '700', letterSpacing: 0.3 },
    socialRow: { flexDirection: 'row', gap: 12 },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        height: 50,
        gap: 8,
    },
    socialBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
    footer: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '500',
    },
})

export default SignUp