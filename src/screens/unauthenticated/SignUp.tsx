import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    StyleSheet,
    Animated,
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '../../assets/Icons'
import LogoImage from '../../assets/half-logo.jpeg'
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const SignUp: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const role = route?.params?.role || 'customer'
    const { mutateAsync, isPending } = useSubmit({ endpoint: 'auth/api/v1/register' })

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        role,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(24)).current

    const isCustomer = role === 'customer'
    const theme = {
        primary: isCustomer ? '#0A7A4A' : '#C85A00',
        primaryMid: isCustomer ? '#1AA061' : '#E86A10',
        accent: isCustomer ? '#05C26B' : '#FF8C3A',
        light: isCustomer ? '#E8F5EE' : '#FEF3E7',
        pillText: isCustomer ? '#0A5A35' : '#9A3D00',
    }

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start()
    }, [])

    const handleChange = (field: string, value: string) =>
        setFormData(prev => ({ ...prev, [field]: value }))

    const Register = async () => {
        const { username, email, phone, password } = formData
        if (!username || !email || !phone || !password) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Please fill in all fields' })
            return
        }
        try {
            await mutateAsync(formData)
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'OTP Sent!', textBody: 'Check your email to verify.' })
            navigation.navigate('VerifyOTP', { email: formData.email, role })
        } catch (error: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: error.message || 'Registration failed' })
        }
    }

    const inputBorder = (field: string) =>
        focusedField === field ? theme.primary : '#E5E7EB'

    const fields = [
        { key: 'username', label: 'Username', placeholder: 'johndoe', icon: User, keyboard: 'default' as const },
        { key: 'email', label: 'Email Address', placeholder: 'you@example.com', icon: Mail, keyboard: 'email-address' as const },
        { key: 'phone', label: 'Phone Number', placeholder: '+92 300 0000000', icon: Phone, keyboard: 'phone-pad' as const },
    ]

    return (
        <View style={styles.root}>
            <View style={[styles.topAccent, { backgroundColor: theme.primary }]} />

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backBtn, { backgroundColor: theme.light }]}
                activeOpacity={0.7}
            >
                <ArrowLeft size={20} color={theme.primary} strokeWidth={2.5} />
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scroll}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Header */}
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.greeting}>Create your account ✨</Text>
                            <Text style={[styles.title, { color: theme.primary }]}>Sign Up</Text>
                            <Text style={styles.subtitle}>
                                Joining as a{' '}
                                <Text style={{ color: theme.primary, fontWeight: '700' }}>
                                    {isCustomer ? 'Seller' : 'Collector'}
                                </Text>
                            </Text>
                        </View>
                        <View style={[styles.logoWrap, { borderColor: theme.primary + '30' }]}>
                            <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
                        </View>
                    </View>

                    {/* Perks strip */}
                    <View style={[styles.perksStrip, { backgroundColor: theme.light }]}>
                        <View style={styles.perkItem}>
                            <CheckCircle size={14} color={theme.primary} strokeWidth={2.5} />
                            <Text style={[styles.perkText, { color: theme.pillText }]}>Free to join</Text>
                        </View>
                        <View style={styles.perkDivider} />
                        <View style={styles.perkItem}>
                            <CheckCircle size={14} color={theme.primary} strokeWidth={2.5} />
                            <Text style={[styles.perkText, { color: theme.pillText }]}>Instant access</Text>
                        </View>
                        <View style={styles.perkDivider} />
                        <View style={styles.perkItem}>
                            <CheckCircle size={14} color={theme.primary} strokeWidth={2.5} />
                            <Text style={[styles.perkText, { color: theme.pillText }]}>Secure & safe</Text>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>

                        {/* Text fields */}
                        {fields.map(({ key, label, placeholder, icon: Icon, keyboard }) => (
                            <View key={key} style={styles.fieldGroup}>
                                <Text style={styles.label}>{label}</Text>
                                <View style={[styles.inputWrap, { borderColor: inputBorder(key) }]}>
                                    <Icon size={18} color={focusedField === key ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                    <TextInput
                                        style={[styles.input, { color: '#111' }]}
                                        placeholder={placeholder}
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType={keyboard}
                                        autoCapitalize={key === 'email' ? 'none' : 'words'}
                                        value={(formData as any)[key]}
                                        onChangeText={v => handleChange(key, v)}
                                        onFocus={() => setFocusedField(key)}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </View>
                            </View>
                        ))}

                        {/* Password */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputWrap, { borderColor: inputBorder('password') }]}>
                                <Lock size={18} color={focusedField === 'password' ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                <TextInput
                                    style={[styles.input, { color: '#111' }]}
                                    placeholder="Min. 8 characters"
                                    placeholderTextColor="#C0C0C0"
                                    secureTextEntry={!showPassword}
                                    value={formData.password}
                                    onChangeText={v => handleChange('password', v)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    {showPassword
                                        ? <Eye size={18} color="#9CA3AF" strokeWidth={2} />
                                        : <EyeOff size={18} color="#9CA3AF" strokeWidth={2} />
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Register CTA */}
                        <TouchableOpacity
                            onPress={Register}
                            disabled={isPending}
                            activeOpacity={0.85}
                            style={[styles.primaryBtn, { backgroundColor: isPending ? theme.primaryMid : theme.primary }]}
                        >
                            <Text style={styles.primaryBtnText}>
                                {isPending ? 'Creating account…' : 'Create Account'}
                            </Text>
                            {!isPending && (
                                <View style={[styles.arrowCircle, { backgroundColor: theme.primaryMid }]}>
                                    <Text style={{ color: '#fff', fontSize: 18, lineHeight: 20 }}>→</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By signing up you agree to our{' '}
                            <Text style={{ color: theme.primary, fontWeight: '600' }}>Terms</Text>
                            {' '}and{' '}
                            <Text style={{ color: theme.primary, fontWeight: '600' }}>Privacy Policy</Text>
                        </Text>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or sign up with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social */}
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                            <GoogleIcon
                                primaryColor="#EA4335"
                                secondaryColor="#4285F4"
                                tertiaryColor="#FBBC05"
                                quaternaryColor="#34A853"
                            />
                            <Text style={styles.socialBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                            <FacebookIcon primaryColor="#1877F2" />
                            <Text style={styles.socialBtnText}>Continue with Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login nudge */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn', { role })}>
                            <Text style={[styles.loginLink, { color: theme.primary }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#FAFAFA' },
    topAccent: { height: 3 },
    scroll: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 40 },
    backBtn: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    greeting: { fontSize: 14, color: '#888', fontWeight: '500', marginBottom: 2 },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, lineHeight: 36 },
    subtitle: { fontSize: 13, color: '#888', marginTop: 4, fontWeight: '500' },
    logoWrap: { width: 52, height: 52, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5 },
    logo: { width: 52, height: 52 },

    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    roleDot: { width: 7, height: 7, borderRadius: 4 },
    roleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

    perksStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    perkItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    perkText: { fontSize: 11.5, fontWeight: '600' },
    perkDivider: { width: 1, height: 14, backgroundColor: '#00000015' },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
        marginBottom: 20,
    },

    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
        gap: 10,
    },
    input: { flex: 1, fontSize: 15, fontWeight: '500', height: '100%' },

    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingLeft: 26,
        paddingRight: 14,
        borderRadius: 16,
        marginTop: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    termsText: {
        textAlign: 'center',
        fontSize: 11.5,
        color: '#BBBBBB',
        marginTop: 10,
        marginBottom: 4,
        lineHeight: 17,
    },

    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
    dividerText: { fontSize: 12, color: '#BBBBBB', fontWeight: '600', letterSpacing: 0.3 },

    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        height: 50,
        gap: 10,
        marginBottom: 10,
    },
    socialBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },

    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginText: { fontSize: 14, color: '#888', fontWeight: '500' },
    loginLink: { fontSize: 14, fontWeight: '700' },
})

export default SignUp