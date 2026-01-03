import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { ArrowLeft, Mail, Lock, Eye, EyeClosed } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '../../assets/Icons'
import LogoImage from "../../assets/logo.png"
import { useDispatch } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import { useSubmit } from "../../apiHooks/useSubmit"
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';


const SignIn: React.FC<{ navigation: any }> = ({ navigation }) => {
    const dispatch = useDispatch();
    const { mutateAsync, isPending } = useSubmit({
        endpoint: 'login',
    });

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const Login = async () => {
        if (!email || !password) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Please fill in all fields',
            });
            return;
        }
        try {
            const response = await mutateAsync({ email, password });
            dispatch(login(response.token));
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'Logged in successfully',
            });
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Login failed',
            });
        }
    }

    return (
        <View className='bg-white rounded-2xl p-2 flex-1'>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft />
            </TouchableOpacity>
            <Text className="text-lg font-semibold mt-3">Welcome Back</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mt-5 bg-gray-200 p-4 rounded-2xl">
                    <View className='flex-row items-center justify-between'>
                        <Text className="text-emerald-600 font-bold">Log in to RaddiGo</Text>
                        <Image className='h-14 w-14 rounded-lg' source={LogoImage} alt='RaddiGo Logo' />
                    </View>


                    <View className="mt-3">
                        <Text className="font-semibold">Email</Text>
                        <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
                            <Mail />
                            <TextInput
                                keyboardType="email-address"
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                            />
                        </View>
                    </View>

                    <View className="mt-3">
                        <Text className="font-semibold">Password</Text>
                        <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
                            <Lock />
                            <TextInput
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                placeholder="Enter your Password"
                                placeholderTextColor="#9ca3af"
                                className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">

                                {showPassword ? <Eye /> : <EyeClosed />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={Login}
                        disabled={isPending}
                        className="bg-emerald-600 mt-6 rounded-full h-12 items-center justify-center">
                        <Text className="text-white font-bold text-lg">
                            {isPending ? 'Logging in...' : 'Log In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("ForgotPassword")}
                        className="mt-4 justify-center">
                        <Text className="text-emerald-600 font-bold">Forgot Password?</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center my-5">
                        <View className="flex-1 h-[1px] bg-gray-400" />
                        <Text className="text-gray-400 font-semibold mx-3">OR</Text>
                        <View className="flex-1 h-[1px] bg-gray-400" />
                    </View>

                    <TouchableOpacity className="flex-row items-center justify-center bg-white border-2 border-emerald-600 rounded-full h-12 mb-3">
                        <GoogleIcon />
                        <Text className="text-emerald-600 font-bold text-base ml-2">Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-center bg-white border-2 border-emerald-600 rounded-full h-12">
                        <FacebookIcon />
                        <Text className="text-emerald-600 font-bold text-base ml-2">Continue with Facebook</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row justify-center mt-5 ml-5">
                    <Text className="text-gray-600 font-semibold">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                        <Text className="text-emerald-600 font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default SignIn