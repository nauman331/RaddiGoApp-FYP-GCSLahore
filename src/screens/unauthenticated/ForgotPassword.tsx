import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Image, StyleSheet, Animated,
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck, KeyRound, RotateCcw } from 'lucide-react-native'
import LogoImage from '../../assets/half-logo.jpeg'
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const STEPS = [
    { id: 1, label: 'Email', icon: Mail },
    { id: 2, label: 'Verify', icon: ShieldCheck },
    { id: 3, label: 'Reset', icon: KeyRound },
]

const ForgotPassword: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const role = route?.params?.role || 'customer'
    const isCustomer = role === 'customer'
    const theme = {
        primary: isCustomer ? '#0A7A4A' : '#C85A00',
        mid: isCustomer ? '#1AA061' : '#E86A10',
        light: isCustomer ? '#E8F5EE' : '#FEF3E7',
        pillText: isCustomer ? '#0A5A35' : '#9A3D00',
    }

    const { mutateAsync: sendOTP, isPending: isSendingOTP } = useSubmit({ endpoint: 'auth/api/v1/resend-verification-email' })
    const { mutateAsync: verifyOTP, isPending: isVerifyingOTP } = useSubmit({ endpoint: 'auth/api/v1/verify-email' })
    const { mutateAsync: resetPassword, isPending: isResettingPassword } = useSubmit({ endpoint: 'auth/api/v1/reset-password' })

    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [timer, setTimer] = useState(120)
    const [canResend, setCanResend] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(20)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start()
    }, [])

    const animateStep = () => {
        fadeAnim.setValue(0)
        slideAnim.setValue(16)
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]).start()
    }

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer(p => p - 1), 1000)
        } else if (timer === 0) {
            setCanResend(true)
        }
        return () => clearInterval(interval)
    }, [timer, step])

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    const inputBorder = (field: string) => focusedField === field ? theme.primary : '#E5E7EB'

    const handleSendOTP = async () => {
        if (!email) { Toast.show({ type: ALERT_TYPE.WARNING, title: 'Required', textBody: 'Please enter your email' }); return }
        try {
            await sendOTP({ email })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Code sent!', textBody: 'Check your email for the OTP' })
            setStep(2); setTimer(120); setCanResend(false); animateStep()
        } catch (e: any) { Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: e.message || 'Failed to send OTP' }) }
    }

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) { Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid OTP', textBody: 'Enter the 6-digit code' }); return }
        try {
            await verifyOTP({ email, otp })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Verified!', textBody: 'Now create your new password' })
            setStep(3); animateStep()
        } catch (e: any) { Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: e.message || 'Verification failed' }) }
    }

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) { Toast.show({ type: ALERT_TYPE.WARNING, title: 'Required', textBody: 'Fill in all fields' }); return }
        if (newPassword !== confirmPassword) { Toast.show({ type: ALERT_TYPE.WARNING, title: 'Mismatch', textBody: 'Passwords do not match' }); return }
        if (newPassword.length < 6) { Toast.show({ type: ALERT_TYPE.WARNING, title: 'Too short', textBody: 'Min. 6 characters' }); return }
        try {
            await resetPassword({ email, otp, password: newPassword })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Done!', textBody: 'Password reset successfully' })
            navigation.navigate('SignIn', { role })
        } catch (e: any) { Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: e.message || 'Reset failed' }) }
    }

    const handleResendOTP = async () => {
        if (!canResend) return
        try {
            await sendOTP({ email })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Resent!', textBody: 'New OTP sent to your email' })
            setTimer(120); setCanResend(false); setOtp('')
        } catch (e: any) { Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: e.message || 'Failed to resend' }) }
    }

    const stepMeta: Record<number, { title: string; subtitle: string }> = {
        1: { title: 'Forgot Password?', subtitle: "No worries — we'll send you a reset code." },
        2: { title: 'Check Your Email', subtitle: `We sent a 6-digit code to ${email || 'your email'}.` },
        3: { title: 'New Password', subtitle: 'Create a strong password for your account.' },
    }

    const isPending = isSendingOTP || isVerifyingOTP || isResettingPassword
    const ctaLabels: Record<number, [string, string]> = {
        1: ['Send Code', 'Sending…'],
        2: ['Verify Code', 'Verifying…'],
        3: ['Reset Password', 'Resetting…'],
    }
    const ctaHandler = [handleSendOTP, handleVerifyOTP, handleResetPassword][step - 1]

    return (
        <View style={[styles.root, { backgroundColor: '#FAFAFA' }]}>
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
                        <View style={{ flex: 1 }}>
                            <Text style={styles.greeting}>Account recovery</Text>
                            <Text style={[styles.title, { color: theme.primary }]}>{stepMeta[step].title}</Text>
                            <Text style={styles.subtitle}>{stepMeta[step].subtitle}</Text>
                        </View>
                        <View style={[styles.logoWrap, { borderColor: theme.primary + '30' }]}>
                            <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
                        </View>
                    </View>

                    {/* Step progress bar */}
                    <View style={styles.stepRow}>
                        {STEPS.map((s, i) => {
                            const done = step > s.id
                            const active = step === s.id
                            const Icon = s.icon
                            return (
                                <React.Fragment key={s.id}>
                                    <View style={styles.stepItem}>
                                        <View style={[
                                            styles.stepCircle,
                                            active && { backgroundColor: theme.primary, borderColor: theme.primary },
                                            done && { backgroundColor: theme.primary, borderColor: theme.primary },
                                            !active && !done && { backgroundColor: '#fff', borderColor: '#E5E7EB' },
                                        ]}>
                                            <Icon size={14} color={active || done ? '#fff' : '#9CA3AF'} strokeWidth={2.5} />
                                        </View>
                                        <Text style={[
                                            styles.stepLabel,
                                            (active || done) && { color: theme.primary, fontWeight: '700' },
                                        ]}>{s.label}</Text>
                                    </View>
                                    {i < STEPS.length - 1 && (
                                        <View style={[styles.stepLine, { backgroundColor: step > s.id ? theme.primary : '#E5E7EB' }]} />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>

                        {/* Step 1: Email */}
                        {step === 1 && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={[styles.inputWrap, { borderColor: inputBorder('email') }]}>
                                    <Mail size={18} color={focusedField === 'email' ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                    <TextInput
                                        style={styles.input}
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
                        )}

                        {/* Step 2: OTP */}
                        {step === 2 && (
                            <>
                                {/* OTP boxes */}
                                <View style={styles.otpRow}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.otpBox,
                                                otp[i] ? { borderColor: theme.primary, backgroundColor: theme.light } : { borderColor: '#E5E7EB' },
                                            ]}
                                        >
                                            <Text style={[styles.otpChar, { color: theme.primary }]}>
                                                {otp[i] || ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                {/* Hidden real input behind the boxes */}
                                <TextInput
                                    value={otp}
                                    onChangeText={t => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    style={styles.hiddenInput}
                                    autoFocus
                                />
                                {/* Timer / Resend */}
                                <View style={styles.timerRow}>
                                    {canResend ? (
                                        <TouchableOpacity onPress={handleResendOTP} disabled={isSendingOTP} style={styles.resendBtn}>
                                            <RotateCcw size={14} color={theme.primary} strokeWidth={2.5} />
                                            <Text style={[styles.resendText, { color: theme.primary }]}>
                                                {isSendingOTP ? 'Sending…' : 'Resend Code'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.timerWrap}>
                                            <Text style={styles.timerLabel}>Resend in </Text>
                                            <View style={[styles.timerBadge, { backgroundColor: theme.light }]}>
                                                <Text style={[styles.timerCount, { color: theme.primary }]}>{fmt(timer)}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={[styles.inputWrap, { borderColor: inputBorder('newpw') }]}>
                                        <Lock size={18} color={focusedField === 'newpw' ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Min. 6 characters"
                                            placeholderTextColor="#C0C0C0"
                                            secureTextEntry={!showPassword}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            onFocus={() => setFocusedField('newpw')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            {showPassword ? <Eye size={18} color="#9CA3AF" strokeWidth={2} /> : <EyeOff size={18} color="#9CA3AF" strokeWidth={2} />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <View style={[
                                        styles.inputWrap,
                                        { borderColor: confirmPassword && confirmPassword !== newPassword ? '#EF4444' : inputBorder('confirmpw') }
                                    ]}>
                                        <Lock size={18} color={focusedField === 'confirmpw' ? theme.primary : '#9CA3AF'} strokeWidth={2} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Repeat new password"
                                            placeholderTextColor="#C0C0C0"
                                            secureTextEntry={!showConfirm}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            onFocus={() => setFocusedField('confirmpw')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            {showConfirm ? <Eye size={18} color="#9CA3AF" strokeWidth={2} /> : <EyeOff size={18} color="#9CA3AF" strokeWidth={2} />}
                                        </TouchableOpacity>
                                    </View>
                                    {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                                        <Text style={styles.errorHint}>Passwords don't match</Text>
                                    )}
                                </View>
                            </>
                        )}

                        {/* CTA Button */}
                        <TouchableOpacity
                            onPress={ctaHandler}
                            disabled={isPending}
                            activeOpacity={0.85}
                            style={[styles.primaryBtn, { backgroundColor: isPending ? theme.mid : theme.primary }]}
                        >
                            <Text style={styles.primaryBtnText}>
                                {isPending ? ctaLabels[step][1] : ctaLabels[step][0]}
                            </Text>
                            {!isPending && (
                                <View style={[styles.arrowCircle, { backgroundColor: theme.mid }]}>
                                    <Text style={{ color: '#fff', fontSize: 18, lineHeight: 20 }}>→</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Bottom nudge */}
                    <View style={styles.bottomRow}>
                        <Text style={styles.bottomText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn', { role })}>
                            <Text style={[styles.bottomLink, { color: theme.primary }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    topAccent: { height: 3 },
    scroll: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 40 },
    backBtn: { position: 'absolute', top: 16, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: 13, color: '#999', fontWeight: '500', marginBottom: 2 },
    title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, lineHeight: 34 },
    subtitle: { fontSize: 13, color: '#888', marginTop: 5, lineHeight: 19, fontWeight: '400', maxWidth: 220 },
    logoWrap: { width: 52, height: 52, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5 },
    logo: { width: 52, height: 52 },

    // Step indicator
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    stepItem: { alignItems: 'center', gap: 5 },
    stepCircle: { width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
    stepLine: { flex: 1, height: 2, borderRadius: 1, marginHorizontal: 6, marginBottom: 14 },

    // Card
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, marginBottom: 20 },

    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52, gap: 10 },
    input: { flex: 1, fontSize: 15, fontWeight: '500', height: '100%', color: '#111' },
    errorHint: { fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: '500' },

    // OTP display
    otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 14 },
    otpBox: { width: 44, height: 52, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    otpChar: { fontSize: 22, fontWeight: '800', letterSpacing: 0 },
    hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },

    timerRow: { alignItems: 'center', marginBottom: 8 },
    timerWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timerLabel: { fontSize: 13, color: '#888', fontWeight: '500' },
    timerBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    timerCount: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
    resendText: { fontSize: 13, fontWeight: '700' },

    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingLeft: 26, paddingRight: 14, borderRadius: 16, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    arrowCircle: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

    bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    bottomText: { fontSize: 14, color: '#888', fontWeight: '500' },
    bottomLink: { fontSize: 14, fontWeight: '700' },
})

export default ForgotPassword