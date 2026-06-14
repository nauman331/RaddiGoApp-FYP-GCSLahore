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
import { ChevronLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '../../assets/Icons'
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

    const isCustomer = role === 'customer'
    const primaryColorHex = isCustomer ? '#059669' : '#d97706'

    const Login = async () => {
        if (!email || !password) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Barae meharbani tamam fields pur karein' })
            return
        }
        try {
            const response = await mutateAsync({ email, password })
            dispatch(login(response.token))
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Khushamdeed!', textBody: 'Aap kamyabi se login ho gaye hain.' })
        } catch (error: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: error.message || 'Login mein masla aya' })
        }
    }

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
                            RADDIGO MEIN WAPSI
                        </Text>
                        <Text className="text-4xl font-black text-white tracking-tight leading-tight">
                            Sign In karein{"\n"}apne account mein
                        </Text>
                    </View>

                    <View className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-8 shadow-2xl">
                        
                        <View className="mb-5 mt-2">
                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">Email Address</Text>
                            <View className={`flex-row items-center bg-[#f8fafc] rounded-[20px] border-[2px] px-4 h-14 ${focusedField === 'email' ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                                <Mail size={20} color={focusedField === 'email' ? '#111827' : '#9ca3af'} strokeWidth={2} />
                                <TextInput
                                    className="flex-1 font-bold text-base text-gray-900 ml-3 h-full"
                                    placeholder="ali@example.com"
                                    placeholderTextColor="#cbd5e1"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

                        <View className="mb-8">
                            <View className="flex-row justify-between items-center mb-2 ml-1 mr-2">
                                <Text className="text-gray-900 font-bold text-sm">Password</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role })}>
                                    <Text style={{ color: primaryColorHex }} className="font-bold text-xs">Password bhool gaye?</Text>
                                </TouchableOpacity>
                            </View>
                            <View className={`flex-row items-center bg-[#f8fafc] rounded-[20px] border-[2px] px-4 h-14 ${focusedField === 'password' ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                                <Lock size={20} color={focusedField === 'password' ? '#111827' : '#9ca3af'} strokeWidth={2} />
                                <TextInput
                                    className="flex-1 font-bold text-base text-gray-900 ml-3 h-full"
                                    placeholder="••••••••"
                                    placeholderTextColor="#cbd5e1"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
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
                            onPress={Login}
                            disabled={isPending}
                            activeOpacity={0.85}
                            className={`flex-row items-center justify-between py-4 pl-8 pr-4 rounded-[24px] shadow-lg mb-8 ${!email || !password ? 'opacity-60 shadow-none' : ''}`}
                            style={{ backgroundColor: (!email || !password) ? '#e2e8f0' : primaryColorHex }}
                        >
                            <Text className={`text-lg font-black tracking-wide ${(!email || !password) ? 'text-gray-400' : 'text-white'}`}>
                                {isPending ? 'Signing In...' : 'Sign In karein'}
                            </Text>
                            {!isPending ? (
                                <View className="w-12 h-12 rounded-[16px] items-center justify-center bg-white/20">
                                    <ArrowRight size={24} color={(!email || !password) ? "#94a3b8" : "#ffffff"} strokeWidth={3} />
                                </View>
                            ) : (
                                <View className="w-12 h-12 rounded-[16px] items-center justify-center">
                                    <ActivityIndicator color="#ffffff" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-center mb-8">
                            <Text className="text-gray-500 font-bold text-sm">Account nahi hai? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp', { role })}>
                                <Text style={{ color: primaryColorHex }} className="font-black text-sm">Sign Up karein</Text>
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

export default SignIn