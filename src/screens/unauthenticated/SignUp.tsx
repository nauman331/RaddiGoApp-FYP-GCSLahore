import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator
} from 'react-native'
import React, { useState } from 'react'
import { ChevronLeft, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '../../assets/Icons'
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

    const isCustomer = role === 'customer'
    const primaryColorHex = isCustomer ? '#059669' : '#d97706'

    const handleChange = (field: string, value: string) => {
        if (field === 'phone') {
            setFormData(prev => ({ ...prev, [field]: value.replace(/[^0-9]/g, '').slice(0, 10) }))
        } else {
            setFormData(prev => ({ ...prev, [field]: value }))
        }
    }

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
            await mutateAsync({
                ...formData,
                phone: `+92${phone}`
            })
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'OTP Bhej Diya!', textBody: 'Apna phone/email check karein.' })
            navigation.navigate('VerifyOTP', { email: formData.email, phone: `+92${phone}`, role })
        } catch (error: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: error.message || 'Account bananay mein masla aya' })
        }
    }

    const isFormValid = formData.username && formData.email && formData.phone.length >= 10 && formData.password

    return (
        <View style={{ flex: 1, backgroundColor: primaryColorHex }}>
            <StatusBar barStyle="light-content" backgroundColor={primaryColorHex} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                    bounces={false}
                >
                    <View className="px-6 pt-12 pb-10">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.goBack()}
                            className="w-12 h-12 rounded-full items-center justify-center bg-white/20 mb-6"
                        >
                            <ChevronLeft size={28} color="#ffffff" strokeWidth={2.5} />
                        </TouchableOpacity>

                        <Text className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1.5">
                            RADDIGO MEIN KHUSHAMDEED
                        </Text>
                        <Text className="text-4xl font-black text-white tracking-tight leading-tight">
                            Naya {isCustomer ? 'Customer' : 'Collector'}{"\n"}Account Banayein
                        </Text>
                    </View>

                    <View className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-8 shadow-2xl">

                        <View className="mb-5">
                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">Pura Naam</Text>
                            <View className={`flex-row items-center bg-[#f8fafc] rounded-[20px] border-[2px] px-4 h-14 ${focusedField === 'username' ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                                <User size={20} color={focusedField === 'username' ? '#111827' : '#9ca3af'} strokeWidth={2} />
                                <TextInput
                                    className="flex-1 font-bold text-base text-gray-900 ml-3 h-full"
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

                        <View className="mb-5">
                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">Email Address</Text>
                            <View className={`flex-row items-center bg-[#f8fafc] rounded-[20px] border-[2px] px-4 h-14 ${focusedField === 'email' ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                                <Mail size={20} color={focusedField === 'email' ? '#111827' : '#9ca3af'} strokeWidth={2} />
                                <TextInput
                                    className="flex-1 font-bold text-base text-gray-900 ml-3 h-full"
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

                        <View className="mb-5">
                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">Mobile Number</Text>
                            <View className={`flex-row items-center bg-[#f8fafc] rounded-[20px] border-[2px] px-4 h-14 ${focusedField === 'phone' ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                                <View className="flex-row items-center">
                                    <Text className="text-lg mr-1">🇵🇰</Text>
                                    <Text className="text-gray-900 font-black text-base mr-2">+92</Text>
                                </View>
                                <View className="w-[1.5px] h-5 bg-gray-200 mr-3" />
                                <TextInput
                                    className="flex-1 font-bold text-base text-gray-900 h-full"
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

                        <View className="mb-8">
                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">Naya Password</Text>
                            <View className={`flex-row items-center bg-[#f8fafc] rounded-[20px] border-[2px] px-4 h-14 ${focusedField === 'password' ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                                <Lock size={20} color={focusedField === 'password' ? '#111827' : '#9ca3af'} strokeWidth={2} />
                                <TextInput
                                    className="flex-1 font-bold text-base text-gray-900 ml-3 h-full"
                                    placeholder="Kam az kam 8 huroof"
                                    placeholderTextColor="#cbd5e1"
                                    secureTextEntry={!showPassword}
                                    value={formData.password}
                                    onChangeText={v => handleChange('password', v)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    {showPassword ? (
                                        <Eye size={20} color="#64748b" strokeWidth={2} />
                                    ) : (
                                        <EyeOff size={20} color="#9ca3af" strokeWidth={2} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={Register}
                            disabled={isPending}
                            activeOpacity={0.85}
                            className={`flex-row items-center justify-between py-4 pl-8 pr-4 rounded-[24px] shadow-lg mb-8 ${!isFormValid ? 'opacity-60 shadow-none' : ''}`}
                            style={{ backgroundColor: !isFormValid ? '#e2e8f0' : primaryColorHex }}
                        >
                            <Text className={`text-lg font-black tracking-wide ${!isFormValid ? 'text-gray-400' : 'text-white'}`}>
                                {isPending ? 'Account ban raha hai...' : 'Account Banayein'}
                            </Text>
                            {!isPending ? (
                                <View className="w-12 h-12 rounded-[16px] items-center justify-center bg-white/20">
                                    <ArrowRight size={24} color={!isFormValid ? "#94a3b8" : "#ffffff"} strokeWidth={3} />
                                </View>
                            ) : (
                                <View className="w-12 h-12 rounded-[16px] items-center justify-center">
                                    <ActivityIndicator color="#ffffff" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-center mb-8">
                            <Text className="text-gray-500 font-bold text-sm">Pehle se account hai? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignIn', { role })}>
                                <Text style={{ color: primaryColorHex }} className="font-black text-sm">Log In karein</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-[1.5px] bg-gray-100" />
                            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mx-4">Ya in se continue karein</Text>
                            <View className="flex-1 h-[1.5px] bg-gray-100" />
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity activeOpacity={0.7} className="flex-1 flex-row items-center justify-center bg-white border-[2px] border-gray-100 py-3.5 rounded-[20px]">
                                <GoogleIcon primaryColor="#EA4335" secondaryColor="#4285F4" tertiaryColor="#FBBC05" quaternaryColor="#34A853" />
                                <Text className="font-extrabold text-gray-800 ml-2">Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} className="flex-1 flex-row items-center justify-center bg-white border-[2px] border-gray-100 py-3.5 rounded-[20px]">
                                <FacebookIcon primaryColor="#1877F2" />
                                <Text className="font-extrabold text-gray-800 ml-2">Facebook</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default SignUp