import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import socketService from '../services/socketService'
import logo from "../assets/logo.png"
import { MapPin, Package, AlertCircle, CheckCircle2 } from 'lucide-react-native'

const PlaceOrder: React.FC<{ coordinates: { latitude: number; longitude: number } | null }> = ({ coordinates }) => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const [pickupAddress, setPickupAddress] = useState<string>("");
    const [approximateRaddiInKg, setApproximateRaddiInKg] = useState<string>("");
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({ text: '', type: null });

    useEffect(() => {
        socketService.on("orderCreated", (data: any) => {
            if (!data.success) {
                setMessage({ text: `Order creation failed: ${data.message}`, type: 'error' });
                return;
            }
            setMessage({ text: `Your order has been created successfully!`, type: 'success' });
            setPickupAddress("");
            setApproximateRaddiInKg("");
            
            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ text: '', type: null }), 3000);
        });
        return () => {
            socketService.off("orderCreated");
        };
    }, []);

    const handleNewOrder = async () => {
        if (!pickupAddress || !approximateRaddiInKg) {
            setMessage({ text: 'Please fill in all details', type: 'error' });
            return;
        }
        const data = {
            customerId: Number(userdata?.id) || 1,
            pickupLatitude: coordinates?.latitude ?? 31.5204,
            pickupLongitude: coordinates?.longitude ?? 74.3587,
            pickupAddress,
            approximateRaddiInKg
        };
        try {
            if (isConnected) {
                socketService.emit("makeRaddiOrder", data);
            } else {
                setMessage({ text: 'Server disconnected. Trying to reconnect...', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Could not place order right now.', type: 'error' });
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='bg-white w-full rounded-[32px] p-5 shadow-sm border border-gray-100 flex-1'
        >
            <View className='flex-row items-center justify-between mb-6 pb-4 border-b border-gray-100'>
                <View>
                    <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Quick Action</Text>
                    <Text className="text-xl font-black text-gray-900">New Raddi Pickup</Text>
                </View>
                <Image className='h-12 w-12 rounded-xl bg-gray-50' source={logo} resizeMode="contain" />
            </View>

            <View className="mb-4">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Pickup Address</Text>
                <View className="flex-row items-center bg-gray-50 px-4 py-1.5 rounded-2xl border border-gray-100 h-14">
                    <MapPin size={20} color="#9ca3af" />
                    <TextInput
                        value={pickupAddress}
                        onChangeText={(text) => {
                            setPickupAddress(text);
                            setMessage({ text: '', type: null });
                        }}
                        placeholder="House / Street / Area"
                        placeholderTextColor="#9ca3af"
                        className="flex-1 h-full px-3 font-bold text-gray-900 text-base"
                    />
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Approximate Weight (Kg)</Text>
                <View className="flex-row items-center bg-gray-50 px-4 py-1.5 rounded-2xl border border-gray-100 h-14">
                    <Package size={20} color="#9ca3af" />
                    <TextInput
                        value={approximateRaddiInKg}
                        onChangeText={(text) => {
                            setApproximateRaddiInKg(text);
                            setMessage({ text: '', type: null });
                        }}
                        placeholder="e.g. 10"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        className="flex-1 h-full px-3 font-bold text-gray-900 text-base"
                    />
                </View>
            </View>

            {message.type && (
                <View className={`flex-row items-center p-3 rounded-xl mb-4 ${message.type === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    {message.type === 'error' ? (
                        <AlertCircle size={16} color="#ef4444" />
                    ) : (
                        <CheckCircle2 size={16} color="#10b981" />
                    )}
                    <Text className={`ml-2 text-sm font-bold ${message.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                        {message.text}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                disabled={!isConnected}
                activeOpacity={0.8}
                onPress={handleNewOrder}
                className={`mt-auto rounded-2xl py-4 items-center justify-center shadow-lg ${isConnected ? 'bg-emerald-600' : 'bg-gray-400'}`}
            >
                <Text className="text-white font-extrabold text-base">
                    {isConnected ? 'Place Order Now' : 'Connecting to Server...'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default PlaceOrder