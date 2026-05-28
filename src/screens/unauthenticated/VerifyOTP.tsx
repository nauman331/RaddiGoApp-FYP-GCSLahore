import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react-native'
import LogoImage from "../../assets/half-logo.jpeg"
import { useSubmit } from '../../apiHooks/useSubmit'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

const VerifyOTP: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const { email, role } = route.params;

    const { mutateAsync: verifyOTP, isPending: isVerifying } = useSubmit({
        endpoint: 'auth/api/v1/verify-email',
    });

    const { mutateAsync: resendOTP, isPending: isResending } = useSubmit({
        endpoint: 'auth/api/v1/resend-verification-email',
    });

    const [otp, setOtp] = useState<string>('');
    const [timer, setTimer] = useState<number>(120);
    const [canResend, setCanResend] = useState<boolean>(false);

    // Role-based theme colors
    const themeColors = {
        primary600: role === 'seller' ? '#059669' : '#d97706',
        primary500: role === 'seller' ? '#10b981' : '#f59e0b',
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerifyOTP = async () => {
        if (otp?.length !== 6) {
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
                textBody: 'Email verified successfully',
            });
            navigation.navigate('SignIn');
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'OTP verification failed',
            });
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            await resendOTP({ email });
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
            <TouchableOpacity
                style={{ backgroundColor: themeColors.primary600 }}
                className='ml-3 mt-3 w-10 h-10 items-center justify-center rounded-full'
                onPress={() => navigation.goBack()}>
                <ArrowLeft color={"white"} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold mt-3">Verify Email</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mt-5 bg-white shadow-lg p-4 rounded-2xl">
                    <View className='flex-row items-center justify-between'>
                        <Text className="font-bold" style={{ color: themeColors.primary600 }}>Enter Verification Code</Text>
                        <Image className='h-14 w-14 rounded-lg' source={LogoImage} alt='RaddiGo Logo' />
                    </View>

                    <Text className="text-gray-600 mt-3 mb-3">
                        We've sent a 6-digit verification code to {email}. Please enter the code below to verify your account.
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
                                style={{ color: themeColors.primary500 }}
                                className="flex-1 h-full px-2 py-1 font-bold text-center text-xl tracking-widest"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleVerifyOTP}
                        disabled={isVerifying}
                        style={{ backgroundColor: isVerifying ? themeColors.primary500 : themeColors.primary600 }}
                        className="mt-6 rounded-full h-12 items-center justify-center">
                        <Text className="text-white font-bold text-lg">
                            {isVerifying ? 'Verifying...' : 'Verify Code'}
                        </Text>
                    </TouchableOpacity>

                    <View className="mt-4 items-center">
                        {canResend ? (
                            <TouchableOpacity
                                onPress={handleResendOTP}
                                disabled={isResending}
                                className="py-2">
                                <Text className="font-bold text-center" style={{ color: themeColors.primary600 }}>
                                    {isResending ? 'Sending...' : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-gray-600 font-semibold">
                                Resend code in <Text className="font-bold" style={{ color: themeColors.primary600 }}>{formatTime(timer)}</Text>
                            </Text>
                        )}
                    </View>
                </View>

                <View className="flex-row justify-center mt-5 ml-5 mb-5">
                    <Text className="text-gray-600 font-semibold">Wrong email? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="font-bold" style={{ color: themeColors.primary600 }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default VerifyOTP
