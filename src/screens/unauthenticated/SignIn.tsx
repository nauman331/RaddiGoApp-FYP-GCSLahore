import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Linking,
    StyleSheet,
    Animated,
    Platform,
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '../../assets/Icons'
import LogoImage from '../../assets/half-logo.jpeg'
import { useDispatch } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const SignIn: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const role = route?.params?.role || 'customer'
    const dispatch = useDispatch()
    const { mutateAsync, isPending } = useSubmit({ endpoint: 'auth/api/v1/login' })

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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

    const Login = async () => {
        if (!email || !password) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Please fill in all fields' })
            return
        }
        try {
            const response = await mutateAsync({ email, password })
            dispatch(login(response.token))
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Welcome back!', textBody: 'Logged in successfully' })
        } catch (error: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: error.message || 'Login failed' })
        }
    }

    const inputBorder = (field: string) =>
        focusedField === field ? theme.primary : '#E5E7EB'

    return (
        <View style={styles.root}>
            {/* Colored top accent */}
            <View style={[styles.topAccent, { backgroundColor: theme.primary }]} />

            {/* Back button */}
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
                            <Text style={styles.greeting}>Welcome back 👋</Text>
                            <Text style={[styles.title, { color: theme.primary }]}>Sign In</Text>
                            <Text style={styles.subtitle}>
                                Continuing as{' '}
                                <Text style={{ color: theme.primary, fontWeight: '700' }}>
                                    {isCustomer ? 'Seller' : 'Collector'}
                                </Text>
                            </Text>
                        </View>
                        <View style={[styles.logoWrap, { borderColor: theme.primary + '30' }]}>
                            <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
                        </View>
                    </View>

                    {/* Role badge */}
                    <View style={[styles.roleBadge, { backgroundColor: theme.light }]}>
                        <View style={[styles.roleDot, { backgroundColor: theme.primary }]} />
                        <Text style={[styles.roleText, { color: theme.pillText }]}>
                            {isCustomer ? '🏠 Seller Account' : '🚛 Collector Account'}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>

                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[styles.inputWrap, { borderColor: inputBorder('email') }]}>
                                <Mail size={18} color={focusedField === 'email' ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                <TextInput
                                    style={[styles.input, { color: '#111' }]}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#C0C0C0"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role })}>
                                    <Text style={[styles.forgotLink, { color: theme.primary }]}>Forgot?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputWrap, { borderColor: inputBorder('password') }]}>
                                <Lock size={18} color={focusedField === 'password' ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                <TextInput
                                    style={[styles.input, { color: '#111' }]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#C0C0C0"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
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

                        {/* Login CTA */}
                        <TouchableOpacity
                            onPress={Login}
                            disabled={isPending}
                            activeOpacity={0.85}
                            style={[styles.primaryBtn, { backgroundColor: isPending ? theme.primaryMid : theme.primary }]}
                        >
                            <Text style={styles.primaryBtnText}>
                                {isPending ? 'Signing in…' : 'Sign In'}
                            </Text>
                            {!isPending && (
                                <View style={[styles.arrowCircle, { backgroundColor: theme.primaryMid }]}>
                                    <Text style={{ color: '#fff', fontSize: 18, lineHeight: 20 }}>→</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <TouchableOpacity style={[styles.socialBtn, { borderColor: '#E5E7EB' }]} activeOpacity={0.7}>
                            <GoogleIcon
                                primaryColor="#EA4335"
                                secondaryColor="#4285F4"
                                tertiaryColor="#FBBC05"
                                quaternaryColor="#34A853"
                            />
                            <Text style={styles.socialBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.socialBtn, { borderColor: '#E5E7EB' }]} activeOpacity={0.7}>
                            <FacebookIcon primaryColor="#1877F2" />
                            <Text style={styles.socialBtnText}>Continue with Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign up nudge */}
                    <View style={styles.signupRow}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp', { role })}>
                            <Text style={[styles.signupLink, { color: theme.primary }]}>Sign Up</Text>
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

    // Header
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    greeting: { fontSize: 14, color: '#888', fontWeight: '500', marginBottom: 2 },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, lineHeight: 36 },
    subtitle: { fontSize: 13, color: '#888', marginTop: 4, fontWeight: '500' },
    logoWrap: { width: 52, height: 52, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5 },
    logo: { width: 52, height: 52 },

    // Role badge
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    roleDot: { width: 7, height: 7, borderRadius: 4 },
    roleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

    // Card
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

    // Fields
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    forgotLink: { fontSize: 13, fontWeight: '600' },
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

    // Primary Button
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingLeft: 26,
        paddingRight: 14,
        borderRadius: 16,
        marginTop: 4,
        marginBottom: 4,
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

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
    dividerText: { fontSize: 12, color: '#BBBBBB', fontWeight: '600', letterSpacing: 0.3 },

    // Social Buttons
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderRadius: 14,
        height: 50,
        gap: 10,
        marginBottom: 10,
    },
    socialBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },

    // Signup nudge
    signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    signupText: { fontSize: 14, color: '#888', fontWeight: '500' },
    signupLink: { fontSize: 14, fontWeight: '700' },
})

export default SignIn