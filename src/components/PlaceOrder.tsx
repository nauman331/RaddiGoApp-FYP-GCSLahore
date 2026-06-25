import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import socketService from '../services/socketService'
import logo from "../assets/logo.png"
import { MapPin, Package, AlertCircle, CheckCircle2 } from 'lucide-react-native'

const PlaceOrder: React.FC<{ coordinates: { latitude: number; longitude: number } | null }> = ({ coordinates }) => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    
    const role = userdata?.role || 'customer';
    const primaryColorHex = role === 'collector' ? '#d97706' : '#059669';

    const [pickupAddress, setPickupAddress] = useState<string>("");
    const [approximateRaddiInKg, setApproximateRaddiInKg] = useState<string>("");
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({ text: '', type: null });

    useEffect(() => {
        socketService.on("orderCreated", (data: any) => {
            if (!data.success) {
                setMessage({ text: `Order mein masla aya: ${data.message}`, type: 'error' });
                return;
            }
            setMessage({ text: `Aapka order darj ho gaya hai!`, type: 'success' });
            setPickupAddress("");
            setApproximateRaddiInKg("");
            
            setTimeout(() => setMessage({ text: '', type: null }), 3000);
        });
        return () => {
            socketService.off("orderCreated");
        };
    }, []);

    const handleNewOrder = async () => {
        if (!pickupAddress || !approximateRaddiInKg) {
            setMessage({ text: 'Mukkamal tafseel darj karein', type: 'error' });
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
                setMessage({ text: 'Server se rabta toot gaya hai...', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Abhi order nahi ho sakta.', type: 'error' });
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='bg-white w-full flex-1'
        >
            <View className='flex-row items-center justify-between mb-8'>
                <View>
                    <Text className="text-[11px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: primaryColorHex }}>
                        Fauri Amal
                    </Text>
                    <Text className="text-3xl font-black text-gray-900 tracking-tight">
                        Naya Pickup
                    </Text>
                </View>
                <View className="bg-[#f8fafc] p-2 rounded-[16px] border border-[#f1f5f9]">
                    <Image className='h-12 w-12 rounded-xl' source={logo} resizeMode="contain" />
                </View>
            </View>

            <View className="mb-5">
                <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Mukkamal Pata (Address)
                </Text>
                <View className="flex-row items-center bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-[#f1f5f9] shadow-sm">
                    <MapPin size={20} color="#94a3b8" strokeWidth={2.5} />
                    <TextInput
                        value={pickupAddress}
                        onChangeText={(text) => {
                            setPickupAddress(text);
                            setMessage({ text: '', type: null });
                        }}
                        placeholder="Makan, Gali, Ilaqa"
                        placeholderTextColor="#cbd5e1"
                        className="flex-1 h-full px-3 font-bold text-gray-900 text-base"
                    />
                </View>
            </View>

            <View className="mb-8">
                <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Andazan Wazan (Kg)
                </Text>
                <View className="flex-row items-center bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-[#f1f5f9] shadow-sm">
                    <Package size={20} color="#94a3b8" strokeWidth={2.5} />
                    <TextInput
                        value={approximateRaddiInKg}
                        onChangeText={(text) => {
                            setApproximateRaddiInKg(text);
                            setMessage({ text: '', type: null });
                        }}
                        placeholder="Misaal: 10"
                        placeholderTextColor="#cbd5e1"
                        keyboardType="numeric"
                        className="flex-1 h-full px-3 font-black text-gray-900 text-lg tracking-wide"
                    />
                </View>
            </View>

            {message.type && (
                <View className={`flex-row items-center p-4 rounded-[16px] mb-6 ${message.type === 'error' ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                    {message.type === 'error' ? (
                        <AlertCircle size={20} color="#dc2626" strokeWidth={2.5} />
                    ) : (
                        <CheckCircle2 size={20} color="#059669" strokeWidth={2.5} />
                    )}
                    <Text className={`ml-2.5 flex-1 text-sm font-black ${message.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
                        {message.text}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                disabled={!isConnected}
                activeOpacity={0.85}
                onPress={handleNewOrder}
                className={`mt-auto rounded-[24px] py-4 items-center justify-center shadow-lg ${isConnected ? '' : 'bg-[#e2e8f0] shadow-none'}`}
                style={isConnected ? { backgroundColor: primaryColorHex } : {}}
            >
                <Text className={`font-black text-lg ${isConnected ? 'text-white' : 'text-gray-400'}`}>
                    {isConnected ? 'Pickup Bulao' : 'Server se judh raha hai...'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default PlaceOrder