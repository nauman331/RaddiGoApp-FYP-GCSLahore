import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Image, StyleSheet, Animated,
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Mail, RotateCcw, CheckCircle2 } from 'lucide-react-native'
import LogoImage from '../../assets/half-logo.jpeg'
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const VerifyOTP: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const { email, role } = route.params
    const isCustomer = role === 'customer'
    const theme = {
        primary: isCustomer ? '#0A7A4A' : '#C85A00',
        mid: isCustomer ? '#1AA061' : '#E86A10',
        light: isCustomer ? '#E8F5EE' : '#FEF3E7',
        pillText: isCustomer ? '#0A5A35' : '#9A3D00',
    }

    const { mutateAsync: verifyOTP, isPending: isVerifying } = useSubmit({ endpoint: 'auth/api/v1/verify-email' })
    const { mutateAsync: resendOTP, isPending: isResending } = useSubmit({ endpoint: 'auth/api/v1/resend-verification-email' })

    const [otp, setOtp] = useState('')
    const [timer, setTimer] = useState(120)
    const [canResend, setCanResend] = useState(false)
    const [verified, setVerified] = useState(false)

    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(20)).current
    const successScale = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start()
    }, [])

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>
        if (timer > 0 && !verified) {
            interval = setInterval(() => setTimer(p => p - 1), 1000)
        } else if (timer === 0) {
            setCanResend(true)
        }
        return () => clearInterval(interval)
    }, [timer, verified])

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid OTP', textBody: 'Enter the 6-digit code' })
            return
        }
        try {
            await verifyOTP({ email, otp })
            setVerified(true)
            Animated.spring(successScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start()
            setTimeout(() => navigation.navigate('SignIn', { role }), 1600)
        } catch (e: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: e.message || 'Verification failed' })
        }
    }

    const handleResend = async () => {
        if (!canResend) return
        try {
            await resendOTP({ email })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Resent!', textBody: 'New code sent to your email' })
            setTimer(120); setCanResend(false); setOtp('')
        } catch (e: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: e.message || 'Failed to resend' })
        }
    }

    // Masked email: jo***@gmail.com
    const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c)

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
                            <Text style={styles.greeting}>Almost there!</Text>
                            <Text style={[styles.title, { color: theme.primary }]}>Verify Email</Text>
                            <Text style={styles.subtitle}>Confirm it's you before we let you in.</Text>
                        </View>
                        <View style={[styles.logoWrap, { borderColor: theme.primary + '30' }]}>
                            <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
                        </View>
                    </View>

                    {/* Email info card */}
                    <View style={[styles.emailCard, { backgroundColor: theme.light }]}>
                        <View style={[styles.mailIconWrap, { backgroundColor: theme.primary + '18' }]}>
                            <Mail size={20} color={theme.primary} strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.emailCardLabel, { color: theme.pillText }]}>Code sent to</Text>
                            <Text style={[styles.emailCardValue, { color: theme.primary }]}>{maskedEmail}</Text>
                        </View>
                    </View>

                    {/* Main Card */}
                    <View style={styles.card}>

                        {verified ? (
                            /* Success state */
                            <Animated.View style={[styles.successWrap, { transform: [{ scale: successScale }] }]}>
                                <View style={[styles.successCircle, { backgroundColor: theme.light }]}>
                                    <CheckCircle2 size={48} color={theme.primary} strokeWidth={2} />
                                </View>
                                <Text style={[styles.successTitle, { color: theme.primary }]}>Verified!</Text>
                                <Text style={styles.successSub}>Taking you to Sign In…</Text>
                            </Animated.View>
                        ) : (
                            <>
                                <Text style={styles.otpHint}>Enter the 6-digit code below</Text>

                                {/* OTP visual boxes */}
                                <View style={styles.otpRow}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.otpBox,
                                                otp[i]
                                                    ? { borderColor: theme.primary, backgroundColor: theme.light }
                                                    : { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }
                                            ]}
                                        >
                                            <Text style={[styles.otpChar, otp[i] ? { color: theme.primary } : { color: 'transparent' }]}>
                                                {otp[i] || '0'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Invisible real TextInput overlaid */}
                                <TextInput
                                    value={otp}
                                    onChangeText={t => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                    style={styles.hiddenInput}
                                />

                                {/* Timer / Resend */}
                                <View style={styles.timerRow}>
                                    {canResend ? (
                                        <TouchableOpacity onPress={handleResend} disabled={isResending} style={styles.resendBtn}>
                                            <RotateCcw size={14} color={theme.primary} strokeWidth={2.5} />
                                            <Text style={[styles.resendText, { color: theme.primary }]}>
                                                {isResending ? 'Sending…' : 'Resend Code'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.timerWrap}>
                                            <Text style={styles.timerLabel}>Resend available in </Text>
                                            <View style={[styles.timerBadge, { backgroundColor: theme.light }]}>
                                                <Text style={[styles.timerCount, { color: theme.primary }]}>{fmt(timer)}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Verify CTA */}
                                <TouchableOpacity
                                    onPress={handleVerify}
                                    disabled={isVerifying || otp.length !== 6}
                                    activeOpacity={0.85}
                                    style={[
                                        styles.primaryBtn,
                                        { backgroundColor: otp.length === 6 ? theme.primary : '#D1D5DB' }
                                    ]}
                                >
                                    <Text style={styles.primaryBtnText}>
                                        {isVerifying ? 'Verifying…' : 'Confirm Code'}
                                    </Text>
                                    {!isVerifying && (
                                        <View style={[styles.arrowCircle, { backgroundColor: otp.length === 6 ? theme.mid : '#9CA3AF' }]}>
                                            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 20 }}>→</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Bottom */}
                    <View style={styles.bottomRow}>
                        <Text style={styles.bottomText}>Wrong email? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={[styles.bottomLink, { color: theme.primary }]}>Go Back</Text>
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

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    greeting: { fontSize: 13, color: '#999', fontWeight: '500', marginBottom: 2 },
    title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, lineHeight: 34 },
    subtitle: { fontSize: 13, color: '#888', marginTop: 5, fontWeight: '400' },
    logoWrap: { width: 52, height: 52, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5 },
    logo: { width: 52, height: 52 },

    // Email card
    emailCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, marginBottom: 20 },
    mailIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emailCardLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2, marginBottom: 2 },
    emailCardValue: { fontSize: 14, fontWeight: '700' },

    // Card
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, marginBottom: 20 },
    otpHint: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 20, fontWeight: '500' },

    otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
    otpBox: { width: 44, height: 54, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    otpChar: { fontSize: 24, fontWeight: '800' },
    hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },

    timerRow: { alignItems: 'center', marginBottom: 20 },
    timerWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timerLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
    timerBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    timerCount: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
    resendText: { fontSize: 13, fontWeight: '700' },

    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingLeft: 26, paddingRight: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    arrowCircle: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

    // Success
    successWrap: { alignItems: 'center', paddingVertical: 24 },
    successCircle: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    successTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
    successSub: { fontSize: 14, color: '#888', fontWeight: '500' },

    bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    bottomText: { fontSize: 14, color: '#888', fontWeight: '500' },
    bottomLink: { fontSize: 14, fontWeight: '700' },
})

export default VerifyOTP