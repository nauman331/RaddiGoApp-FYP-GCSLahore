import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import socketService from '../services/socketService'
import logo from "../assets/logo.png"

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
            setMessage({ text: `Your order with ID ${data.orderId} has been created successfully!`, type: 'success' });
            setPickupAddress("");
            setApproximateRaddiInKg("");
        });
        return () => {
            socketService.off("orderCreated");
        };
    }, []);

    const handleNewOrder = async () => {
        if (!pickupAddress || !approximateRaddiInKg) {
            setMessage({ text: 'Please fill in all fields', type: 'error' });
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
                console.warn("Socket not connected");
                setMessage({ text: 'Socket not connected. Please try again later.', type: 'error' });
            }
        } catch (error) {
            console.error("Order Error:", error);
            setMessage({ text: 'Could not place order. Please try again.', type: 'error' });
        }
    };

    return (
        <View className='bg-white w-full rounded-2xl p-2 flex-1'>
            <View className="mt-5 bg-gray-200 p-4 rounded-2xl">
                <View className='flex-row items-center justify-between'>
                    <Text className="text-emerald-600 font-bold">New Raddi Pickup</Text>
                    <Image className='h-14 w-14 rounded-lg' source={logo} />
                </View>

                <View className="mt-3">
                    <Text className="font-semibold">Pickup Address</Text>
                    <View className="mt-2 bg-white px-3 py-1 rounded-lg border border-gray-300 h-14">
                        <TextInput
                            value={pickupAddress}
                            onChangeText={setPickupAddress}
                            placeholder="Enter pickup address"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                        />
                    </View>
                </View>

                <View className="mt-3">
                    <Text className="font-semibold">Approximate Raddi (Kg)</Text>
                    <View className="mt-2 bg-white px-3 py-1 rounded-lg border border-gray-300 h-14">
                        <TextInput
                            value={approximateRaddiInKg}
                            onChangeText={setApproximateRaddiInKg}
                            placeholder="Enter approximate weight"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 h-full px-2 py-1 font-bold text-emerald-500"
                        />
                    </View>
                </View>

                {/* Message shown below inputs and above button */}
                {message.type === 'error' && (
                    <Text className="text-red-600 mt-4 font-semibold">{message.text}</Text>
                )}
                {message.type === 'success' && (
                    <Text className="text-emerald-600 mt-4 font-semibold">{message.text}</Text>
                )}

                <TouchableOpacity
                    disabled={!isConnected}
                    onPress={handleNewOrder}
                    className="bg-emerald-600 mt-6 rounded-full h-12 items-center justify-center">
                    <Text className="text-white font-bold text-lg">
                        {isConnected ? 'Place Order' : 'Connecting...'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default PlaceOrder