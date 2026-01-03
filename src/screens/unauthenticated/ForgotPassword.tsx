import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Mail, Lock, Eye, EyeClosed } from 'lucide-react-native'
import LogoImage from "../../assets/logo.png"
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const ForgotPassword: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { mutateAsync: sendOTP, isPending: isSendingOTP } = useSubmit({
        endpoint: 'resend-verification-email',
    });

    const { mutateAsync: verifyOTP, isPending: isVerifyingOTP } = useSubmit({
        endpoint: 'verify-email',
    });

    const { mutateAsync: resetPassword, isPending: isResettingPassword } = useSubmit({
        endpoint: 'reset-password',
    });

    const [step, setStep] = useState<number>(1);
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(120);
    const [canResend, setCanResend] = useState<boolean>(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, step]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendOTP = async () => {
        if (!email) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Invalid Input',
                textBody: 'Please enter your email address',
            });
            return;
        }

        try {
            await sendOTP({ email });
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'OTP has been sent to your email',
            });
            setStep(2);
            setTimer(120);
            setCanResend(false);
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Failed to send OTP',
            });
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Invalid OTP',
                textBody: 'Please enter a valid 6-digit OTP',
            });
            return;
        }

        try {
            await verifyOTP({ email, otp });
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'OTP verified successfully',
            });
            setStep(3);
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'OTP verification failed',
            });
        }
    }

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Invalid Input',
                textBody: 'Please fill in all fields',
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Password Mismatch',
                textBody: 'Passwords do not match',
            });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Weak Password',
                textBody: 'Password must be at least 6 characters',
            });
            return;
        }

        try {
            await resetPassword({ email, otp, password: newPassword });
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'Password has been reset successfully',
            });
            navigation.navigate("SignIn");
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Failed to reset password',
            });
        }
    }

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            await sendOTP({ email });
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'OTP has been resent to your email',
            });
            setTimer(120);
            setCanResend(false);
            setOtp('');
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Failed to resend OTP',
            });
        }
    };

    return (
        <View className='bg-white rounded-2xl p-2 flex-1'>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft />
            </TouchableOpacity>
            <Text className="text-lg font-semibold mt-3">
                {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mt-5 bg-gray-200 p-4 rounded-2xl">
                    <View className='flex-row items-center justify-between'>
                        <Text className="text-emerald-600 font-bold">
                            {step === 1 ? "Reset Your Password" : step === 2 ? "Enter Verification Code" : "Create New Password"}
                        </Text>
                        <Image className='h-14 w-14 rounded-lg' source={LogoImage} alt='RaddiGo Logo' />
                    </View>

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <>
                            <Text className="text-gray-600 mt-3 mb-3">
                                Enter your email address and we'll send you a verification code to reset your password.
                            </Text>
                            <View className="mt-3">
                                <Text className="font-semibold">Email</Text>
                                <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
                                    <Mail />
                                    <TextInput
                                        value={email}
                                        onChangeText={(text) => setEmail(text)}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSendOTP}
                                disabled={isSendingOTP}
                                className={`mt-6 rounded-full h-12 items-center justify-center ${isSendingOTP ? 'bg-emerald-400' : 'bg-emerald-600'}`}>
                                <Text className="text-white font-bold text-lg">
                                    {isSendingOTP ? 'Sending...' : 'Send OTP'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Step 2: OTP Input */}
                    {step === 2 && (
                        <>
                            <Text className="text-gray-600 mt-3 mb-3">
                                We've sent a verification code to {email}. Please enter the code below.
                            </Text>
                            <View className="mt-3">
                                <Text className="font-semibold">Verification Code</Text>
                                <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
                                    <TextInput
                                        value={otp}
                                        onChangeText={(text) => setOtp(text)}
                                        placeholder="Enter 6-digit code"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        className="flex-1 h-full px-2 py-1 font-bold text-emerald-500 text-center text-xl tracking-widest"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleVerifyOTP}
                                disabled={isVerifyingOTP}
                                className={`mt-6 rounded-full h-12 items-center justify-center ${isVerifyingOTP ? 'bg-emerald-400' : 'bg-emerald-600'}`}>
                                <Text className="text-white font-bold text-lg">
                                    {isVerifyingOTP ? 'Verifying...' : 'Verify Code'}
                                </Text>
                            </TouchableOpacity>

                            <View className="mt-4 items-center">
                                {!canResend ? (
                                    <Text className="text-gray-600 font-semibold">
                                        Resend code in <Text className="text-emerald-600 font-bold">{formatTime(timer)}</Text>
                                    </Text>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleResendOTP}
                                        disabled={isSendingOTP}
                                        className="py-2">
                                        <Text className="text-emerald-600 font-bold text-center">
                                            {isSendingOTP ? 'Sending...' : 'Resend Code'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}

                    {/* Step 3: New Password Input */}
                    {step === 3 && (
                        <>
                            <Text className="text-gray-600 mt-3 mb-3">
                                Create a strong password for your account.
                            </Text>
                            <View className="mt-3">
                                <Text className="font-semibold">New Password</Text>
                                <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
                                    <Lock />
                                    <TextInput
                                        secureTextEntry={!showPassword}
                                        value={newPassword}
                                        onChangeText={(text) => setNewPassword(text)}
                                        placeholder="Enter new password"
                                        placeholderTextColor="#9ca3af"
                                        className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                                        {showPassword ? <Eye /> : <EyeClosed />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="mt-3">
                                <Text className="font-semibold">Confirm Password</Text>
                                <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
                                    <Lock />
                                    <TextInput
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={(text) => setConfirmPassword(text)}
                                        placeholder="Confirm new password"
                                        placeholderTextColor="#9ca3af"
                                        className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                                        {showConfirmPassword ? <Eye /> : <EyeClosed />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleResetPassword}
                                disabled={isResettingPassword}
                                className={`mt-6 rounded-full h-12 items-center justify-center ${isResettingPassword ? 'bg-emerald-400' : 'bg-emerald-600'}`}>
                                <Text className="text-white font-bold text-lg">
                                    {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View className="flex-row justify-center mt-5 ml-5 mb-5">
                    <Text className="text-gray-600 font-semibold">Remember your password? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                        <Text className="text-emerald-600 font-bold">Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default ForgotPassword