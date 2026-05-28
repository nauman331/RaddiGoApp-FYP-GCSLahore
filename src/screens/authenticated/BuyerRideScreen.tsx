import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Linking, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { acceptOrder, updateSellerLocation, setRideStatus, resetRide, updateBuyerLocation, RaddiItem } from '../../store/slices/rideSlice'
import LiveMap from '../../components/LiveMap'
import Header from '../../components/Header'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import socketService from '../../services/socketService'
import { MapPin, Navigation, CheckCircle, XCircle, Package, User, DollarSign, FileText, Smartphone, Boxes, Wine, Layers, Truck } from 'lucide-react-native'

interface IncomingPickupRequest {
    orderId: string;
    sellerId: string;
    sellerName: string;
    sellerLatitude: number;
    sellerLongitude: number;
    sellerAddress: string;
    items?: RaddiItem[];
    totalWeight?: string;
    distance?: number;
    estimatedEarnings?: number;
}

const BuyerRideScreen = () => {
    const dispatch = useDispatch();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; name?: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const rideState = useSelector((state: RootState) => state.ride);

    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState<IncomingPickupRequest | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Category configurations
    const categories: { id: RaddiItem['category']; label: string; icon: any; color: string }[] = [
        { id: 'paper', label: 'Paper', icon: FileText, color: '#3b82f6' },
        { id: 'plastic', label: 'Plastic', icon: Layers, color: '#f59e0b' },
        { id: 'metal', label: 'Metal', icon: Package, color: '#6b7280' },
        { id: 'electronics', label: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
        { id: 'cardboard', label: 'Cardboard', icon: Boxes, color: '#d97706' },
        { id: 'glass', label: 'Glass', icon: Wine, color: '#10b981' },
        { id: 'other', label: 'Other', icon: MapPin, color: '#ef4444' },
    ];

    // Dummy seller request for testing
    const dummyRequest: IncomingPickupRequest = {
        orderId: 'order-' + Date.now(),
        sellerId: 'seller-456',
        sellerName: 'Ali Khan',
        sellerLatitude: 31.5304,
        sellerLongitude: 74.3687,
        sellerAddress: '456 Garden Town, Lahore',
        distance: 2.5,
        estimatedEarnings: 350,
        totalWeight: '18',
        items: [
            { id: '1', category: 'paper', weight: '8', description: 'Newspapers and magazines' },
            { id: '2', category: 'plastic', weight: '6', description: 'Plastic containers' },
            { id: '3', category: 'metal', weight: '4', description: 'Aluminum cans' },
        ],
    };

    // Get current location
    useEffect(() => {
        const locationHandler = async () => {
            try {
                setLocating(true);
                const granted = await getLocationPermission();
                if (!granted) {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Permission Denied',
                        textBody: 'Location permission is required.',
                    });
                    return;
                }
                const position = await getCurrentLocation();
                const { latitude, longitude } = (position as { coords: { latitude: number; longitude: number } }).coords;
                const location = { latitude, longitude };
                setCurrentLocation(location);
                dispatch(updateBuyerLocation(location));
            } catch (error) {
                console.error('Location error:', error);
            } finally {
                setLocating(false);
            }
        };
        locationHandler();
    }, []);

    // Simulate incoming pickup request after 5 seconds (for testing)
    useEffect(() => {
        if (rideState.status === 'idle') {
            const timer = setTimeout(() => {
                setIncomingRequest(dummyRequest);
                setShowRequestModal(true);
                Toast.show({
                    type: ALERT_TYPE.INFO,
                    title: 'New Pickup Request!',
                    textBody: `${dummyRequest.sellerName} wants you to pickup raddi`,
                });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [rideState.status]);

    useEffect(() => {
        socketService.on('pickupRequestReceived', (data: any) => {
            setIncomingRequest(data);
            setShowRequestModal(true);
            Toast.show({
                type: ALERT_TYPE.INFO,
                title: 'New Pickup Request!',
                textBody: `${data.sellerName} wants you to pickup raddi`,
            });
        });

        socketService.on('requestCancelled', () => {
            setShowRequestModal(false);
            setIncomingRequest(null);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Request Cancelled',
                textBody: 'The seller cancelled the pickup request.',
            });
        });

        return () => {
            socketService.off('pickupRequestReceived');
            socketService.off('requestCancelled');
        };
    }, []);

    const handleAcceptRequest = () => {
        if (!incomingRequest) return;

        const sellerLocation = {
            latitude: incomingRequest.sellerLatitude,
            longitude: incomingRequest.sellerLongitude,
        };

        dispatch(acceptOrder({
            sellerId: incomingRequest.sellerId,
            sellerName: incomingRequest.sellerName,
            sellerLocation,
            estimatedTime: 15,
        }));

        setShowRequestModal(false);
        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Request Accepted!',
            textBody: `Navigating to ${incomingRequest.sellerName}'s location`,
        });

        // TODO: Uncomment when backend is ready
        // if (isConnected) {
        //     socketService.emit('acceptPickupRequest', {
        //         orderId: incomingRequest.orderId,
        //         buyerId: userdata?.id,
        //     });
        // }
    };

    const handleRejectRequest = () => {
        setShowRequestModal(false);
        setIncomingRequest(null);
        Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Request Rejected',
            textBody: 'You rejected the pickup request.',
        });

        // TODO: Uncomment when backend is ready
        // if (isConnected && incomingRequest) {
        //     socketService.emit('rejectPickupRequest', {
        //         orderId: incomingRequest.orderId,
        //         buyerId: userdata?.id,
        //     });
        // }
    };

    const handleStartNavigation = () => {
        if (!rideState.sellerLocation) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Seller location not available',
            });
            return;
        }

        const { latitude, longitude } = rideState.sellerLocation;
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Could not open maps application',
                });
            });
        }
    };

    const handleStatusUpdate = (newStatus: string) => {
        dispatch(setRideStatus(newStatus as any));
        
        const statusMessages: { [key: string]: string } = {
            on_way: 'On the way to pickup location',
            arrived: 'Arrived at pickup location',
            picked_up: 'Items picked up successfully',
            completed: 'Pickup completed!',
        };

        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Status Updated',
            textBody: statusMessages[newStatus] || 'Status updated',
        });

        if (newStatus === 'completed') {
            setTimeout(() => {
                dispatch(resetRide());
            }, 2000);
        }

        // TODO: Uncomment when backend is ready
        // if (isConnected) {
        //     socketService.emit('updatePickupStatus', {
        //         orderId: rideState.orderId,
        //         status: newStatus,
        //     });
        // }
    };

    const getStatusInfo = () => {
        switch (rideState.status) {
            case 'idle':
                return { text: 'Waiting for pickup requests...', color: '#d97706', bgColor: '#fef3c7' };
            case 'accepted':
                return { text: 'Request Accepted', color: '#d97706', bgColor: '#fef3c7' };
            case 'on_way':
                return { text: 'On the way', color: '#3b82f6', bgColor: '#dbeafe' };
            case 'arrived':
                return { text: 'Arrived at pickup', color: '#8b5cf6', bgColor: '#ede9fe' };
            case 'picked_up':
                return { text: 'Items picked up', color: '#10b981', bgColor: '#d1fae5' };
            case 'completed':
                return { text: 'Completed', color: '#10b981', bgColor: '#d1fae5' };
            default:
                return { text: 'Waiting for pickup requests...', color: '#d97706', bgColor: '#fef3c7' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={{ flex: 1 }}>
            <Header />

            <LiveMap
                coordinates={currentLocation}
                pickupLocation={rideState.sellerLocation}
                dropoffLocation={null}
            />

            {locating && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 60, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <ActivityIndicator size="large" color="#d97706" />
                    <Text className="text-white mt-2 font-semibold">Getting your location...</Text>
                </View>
            )}

            {/* Status Bar */}
            <View className="absolute top-20 self-center px-6 py-3 rounded-full shadow-lg z-50" style={{ backgroundColor: statusInfo.bgColor }}>
                <Text className="font-bold" style={{ color: statusInfo.color }}>
                    {statusInfo.text}
                </Text>
            </View>

            {/* Seller Info Card (when request accepted) */}
            {rideState.status !== 'idle' && rideState.sellerName && (
                <View className="absolute top-36 mx-4 self-center bg-white p-4 rounded-2xl shadow-xl z-50 w-11/12">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <User color="#d97706" size={20} />
                            <Text className="ml-2 font-bold text-gray-800 text-lg">
                                {rideState.sellerName}
                            </Text>
                        </View>
                        {rideState.estimatedTime && (
                            <View className="bg-amber-100 px-3 py-1 rounded-full">
                                <Text className="text-amber-700 text-xs font-bold">
                                    ~{rideState.estimatedTime} mins
                                </Text>
                            </View>
                        )}
                    </View>
                    {rideState.pickupAddress && (
                        <View className="flex-row items-start mt-2">
                            <MapPin color="#6b7280" size={16} style={{ marginTop: 2 }} />
                            <Text className="ml-2 text-sm text-gray-600 flex-1">
                                {rideState.pickupAddress}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Action Buttons based on ride status */}
            {rideState.status === 'accepted' && (
                <View className="absolute bottom-28 self-center z-50 flex-row gap-3">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="flex-row items-center bg-blue-600 border border-white px-6 py-4 rounded-full shadow-lg"
                        onPress={handleStartNavigation}
                    >
                        <Navigation color="#fff" size={20} strokeWidth={2} style={{ marginRight: 8 }} />
                        <Text className="font-bold text-white">Start Navigation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="flex-row items-center bg-amber-600 border border-white px-6 py-4 rounded-full shadow-lg"
                        onPress={() => handleStatusUpdate('on_way')}
                    >
                        <Truck color="#fff" size={20} strokeWidth={2} style={{ marginRight: 8 }} />
                        <Text className="font-bold text-white">On My Way</Text>
                    </TouchableOpacity>
                </View>
            )}

            {rideState.status === 'on_way' && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    className="absolute bottom-28 self-center flex-row items-center bg-amber-600 border border-white px-8 py-5 rounded-full shadow-lg z-50"
                    onPress={() => handleStatusUpdate('arrived')}
                >
                    <MapPin color="#fff" size={20} strokeWidth={2} style={{ marginRight: 8 }} />
                    <Text className="font-bold text-white">I've Arrived</Text>
                </TouchableOpacity>
            )}

            {rideState.status === 'arrived' && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    className="absolute bottom-28 self-center flex-row items-center bg-amber-600 border border-white px-8 py-5 rounded-full shadow-lg z-50"
                    onPress={() => handleStatusUpdate('picked_up')}
                >
                    <Package color="#fff" size={20} strokeWidth={2} style={{ marginRight: 8 }} />
                    <Text className="font-bold text-white">Picked Up</Text>
                </TouchableOpacity>
            )}

            {rideState.status === 'picked_up' && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    className="absolute bottom-28 self-center flex-row items-center bg-green-600 border border-white px-8 py-5 rounded-full shadow-lg z-50"
                    onPress={() => handleStatusUpdate('completed')}
                >
                    <CheckCircle color="#fff" size={20} strokeWidth={2} style={{ marginRight: 8 }} />
                    <Text className="font-bold text-white">Complete Pickup</Text>
                </TouchableOpacity>
            )}

            {/* Incoming Pickup Request Modal */}
            <Modal
                visible={showRequestModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRequestModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10" style={{ maxHeight: '85%' }}>
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

                        <Text className="text-2xl font-bold text-amber-600 mb-4">New Pickup Request</Text>

                        {incomingRequest && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                                    {/* Seller Info */}
                                    <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-amber-200">
                                        <View className="flex-row items-center">
                                            <User color="#d97706" size={20} />
                                            <Text className="ml-2 font-bold text-gray-800 text-lg">
                                                {incomingRequest.sellerName}
                                            </Text>
                                        </View>
                                        {incomingRequest.estimatedEarnings && (
                                            <View className="bg-amber-600 px-3 py-1.5 rounded-full flex-row items-center">
                                                <DollarSign color="#fff" size={16} />
                                                <Text className="text-white font-bold ml-1">PKR {incomingRequest.estimatedEarnings}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Location Info */}
                                    <View className="flex-row items-start mb-3">
                                        <MapPin color="#6b7280" size={18} style={{ marginTop: 2 }} />
                                        <View className="ml-2 flex-1">
                                            <Text className="text-xs text-gray-500 font-semibold">Pickup Location</Text>
                                            <Text className="text-gray-800 font-medium">
                                                {incomingRequest.sellerAddress}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Distance and Weight */}
                                    <View className="flex-row justify-between mb-4">
                                        {incomingRequest.distance && (
                                            <View className="flex-row items-center bg-white px-3 py-2 rounded-lg">
                                                <Navigation color="#d97706" size={18} />
                                                <View className="ml-2">
                                                    <Text className="text-xs text-gray-500">Distance</Text>
                                                    <Text className="text-gray-800 font-bold">
                                                        {incomingRequest.distance.toFixed(1)} km
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                        {incomingRequest.totalWeight && (
                                            <View className="flex-row items-center bg-white px-3 py-2 rounded-lg">
                                                <Package color="#d97706" size={18} />
                                                <View className="ml-2">
                                                    <Text className="text-xs text-gray-500">Total Weight</Text>
                                                    <Text className="text-gray-800 font-bold">
                                                        {incomingRequest.totalWeight} Kg
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* Items List */}
                                    {incomingRequest.items && incomingRequest.items.length > 0 && (
                                        <View className="mt-2">
                                            <Text className="text-sm font-bold text-gray-700 mb-2">Items ({incomingRequest.items.length})</Text>
                                            {incomingRequest.items.map((item) => {
                                                const category = categories.find(cat => cat.id === item.category);
                                                const ItemIcon = category?.icon || Package;
                                                return (
                                                    <View key={item.id} className="bg-white p-3 rounded-lg mb-2 flex-row items-center">
                                                        <View style={{ backgroundColor: category?.color + '20', padding: 8, borderRadius: 8 }}>
                                                            <ItemIcon size={18} color={category?.color || '#d97706'} />
                                                        </View>
                                                        <View className="ml-3 flex-1">
                                                            <Text className="font-bold text-gray-800">{category?.label}</Text>
                                                            <Text className="text-xs text-gray-500">{item.weight} Kg</Text>
                                                            {item.description && (
                                                                <Text className="text-xs text-gray-400 mt-0.5">{item.description}</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row gap-3 mt-6">
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        className="flex-1 bg-red-600 py-4 rounded-xl flex-row items-center justify-center"
                                        onPress={handleRejectRequest}
                                    >
                                        <XCircle color="#fff" size={20} strokeWidth={2} />
                                        <Text className="ml-2 text-white font-bold">Reject</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        className="flex-1 bg-amber-600 py-4 rounded-xl flex-row items-center justify-center"
                                        onPress={handleAcceptRequest}
                                    >
                                        <CheckCircle color="#fff" size={20} strokeWidth={2} />
                                        <Text className="ml-2 text-white font-bold">Accept & Navigate</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default BuyerRideScreen;
