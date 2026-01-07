import { View, Text, TouchableOpacity, Linking } from 'react-native'
import React from 'react'

const SignUp: React.FC = () => {
    return (
        <View className="flex-1 items-center justify-center p-4 bg-white">
            <Text className="text-lg font-semibold mb-3">Account creation is managed by RaddiGo administrators</Text>
            <Text className="text-gray-600 text-center mb-4">Collectors cannot create accounts from the app. Please contact the admin on the website to request an account.</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://your-admin-website.example.com')} className="bg-emerald-600 px-6 py-3 rounded-full">
                <Text className="text-white font-semibold">Contact Admin</Text>
            </TouchableOpacity>
        </View>
    )
}

export default SignUp