import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Linking, Platform, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { acceptOrder, updatecustomerLocation, setRideStatus, resetRide, updatecollectorLocation, RaddiItem } from '../../store/slices/rideSlice'
import LiveMap from '../../components/LiveMap'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import socketService from '../../services/socketService'
import { MapPin, Navigation, CheckCircle, XCircle, Package, User, DollarSign, FileText, Smartphone, Boxes, Wine, Layers, Truck } from 'lucide-react-native'

// Fallback coordinates (Lahore) in case GPS times out
const FALLBACK_LOCATION = { latitude: 31.5204, longitude: 74.3587 };

interface IncomingPickupRequest {
    orderId: string;
    customerId: string;
    customerName: string;
    customerLatitude: number;
    customerLongitude: number;
    customerAddress: string;
    items?: RaddiItem[];
    totalWeight?: string;
    distance?: number;
    estimatedEarnings?: number;
}

const CollectorRideScreen = () => {
    const dispatch = useDispatch();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; name?: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const rideState = useSelector((state: RootState) => state.ride);

    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState<IncomingPickupRequest | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    const categories: { id: RaddiItem['category']; label: string; icon: any; color: string }[] = [
        { id: 'paper', label: 'Paper', icon: FileText, color: '#3b82f6' },
        { id: 'plastic', label: 'Plastic', icon: Layers, color: '#f59e0b' },
        { id: 'metal', label: 'Metal', icon: Package, color: '#6b7280' },
        { id: 'electronics', label: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
        { id: 'cardboard', label: 'Cardboard', icon: Boxes, color: '#d97706' },
        { id: 'glass', label: 'Glass', icon: Wine, color: '#10b981' },
        { id: 'other', label: 'Other', icon: MapPin, color: '#ef4444' },
    ];

    useEffect(() => {
        const locationHandler = async () => {
            try {
                setLocating(true);
                const granted = await getLocationPermission();
                if (!granted) {
                    Toast.show({ type: ALERT_TYPE.DANGER, title: 'Permission Denied', textBody: 'Location permission is required.' });
                    // Provide fallback so the screen doesn't break
                    setCurrentLocation(FALLBACK_LOCATION);
                    dispatch(updatecollectorLocation(FALLBACK_LOCATION));
                    return;
                }
                const position = await getCurrentLocation();
                const { latitude, longitude } = (position as { coords: { latitude: number; longitude: number } }).coords;
                const location = { latitude, longitude };
                setCurrentLocation(location);
                dispatch(updatecollectorLocation(location));
                
                if (isConnected && userdata?.id) {
                    socketService.emit('driverLocationUpdate', {
                        driverId: Number(userdata.id) || userdata.id,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        orderId: rideState.orderId,
                    });
                }
            } catch (error) {
                console.error('Location error:', error);
                Toast.show({ 
                    type: ALERT_TYPE.WARNING, 
                    title: 'GPS Timeout', 
                    textBody: 'Could not get exact location. Using default city center.' 
                });
                // Graceful fallback on timeout
                setCurrentLocation(FALLBACK_LOCATION);
                dispatch(updatecollectorLocation(FALLBACK_LOCATION));
            } finally {
                setLocating(false);
            }
        };
        locationHandler();
    }, []);

    useEffect(() => {
        let interval: number | null = null;
        if (isConnected) {
            interval = setInterval(() => {
                if (currentLocation && userdata?.id) {
                    socketService.emit('driverLocationUpdate', {
                        driverId: Number(userdata.id) || userdata.id,
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        orderId: rideState.orderId,
                    });
                }
            }, 5000) as unknown as number;
        }
        return () => { if (interval !== null) clearInterval(interval as any); };
    }, [isConnected, currentLocation, userdata?.id, rideState.orderId]);

    useEffect(() => {
        socketService.on('newRideOrder', (data: any) => {
            setIncomingRequest(data);
            setShowRequestModal(true);
            Toast.show({ type: ALERT_TYPE.INFO, title: 'New Pickup Request!', textBody: `${data.customerName} wants you to pickup raddi` });
        });

        socketService.on('requestCancelled', () => {
            setShowRequestModal(false);
            setIncomingRequest(null);
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Request Cancelled', textBody: 'The customer cancelled the pickup request.' });
        });

        return () => {
            socketService.off('newRideOrder');
            socketService.off('requestCancelled');
        };
    }, []);

    const handleAcceptRequest = () => {
        if (!incomingRequest) return;
        const customerLocation = { latitude: incomingRequest.customerLatitude, longitude: incomingRequest.customerLongitude };

        dispatch(acceptOrder({
            customerId: incomingRequest.customerId,
            customerName: incomingRequest.customerName,
            customerLocation,
            estimatedTime: 15,
        }));

        setShowRequestModal(false);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Request Accepted!', textBody: `Navigating to ${incomingRequest.customerName}'s location` });

        if (isConnected) {
            socketService.emit('acceptRaddiOrder', {
                customerId: incomingRequest.customerId,
                collectorId: Number(userdata?.id) || userdata?.id,
                pickupLatitude: incomingRequest.customerLatitude,
                pickupLongitude: incomingRequest.customerLongitude,
                pickupAddress: incomingRequest.customerAddress,
                scheduleTime: new Date().toISOString(),
                approximateRaddiInKg: incomingRequest.totalWeight,
            });
        }
    };

    const handleRejectRequest = () => {
        setShowRequestModal(false);
        setIncomingRequest(null);
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'Request Rejected', textBody: 'You rejected the pickup request.' });

        if (isConnected && incomingRequest) {
            socketService.emit('rejectRaddiOrder', {
                customerId: incomingRequest.customerId,
                collectorId: Number(userdata?.id) || userdata?.id,
                orderId: incomingRequest.orderId,
            });
        }
    };

    const handleStartNavigation = () => {
        if (!rideState.customerLocation) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Customer location not available' });
            return;
        }
        const { latitude, longitude } = rideState.customerLocation;
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not open maps application' });
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

        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Status Updated', textBody: statusMessages[newStatus] || 'Status updated' });

        if (newStatus === 'completed') {
            setTimeout(() => { dispatch(resetRide()); }, 2000);
        }

        if (isConnected && rideState.orderId) {
            socketService.emit('updatePickupStatus', { orderId: rideState.orderId, status: newStatus });
        }
    };

    const getStatusInfo = () => {
        switch (rideState.status) {
            case 'idle': return { text: 'Waiting for requests...', color: '#d97706', bgColor: '#fef3c7', border: '#fde68a' };
            case 'accepted': return { text: 'Request Accepted', color: '#d97706', bgColor: '#fef3c7', border: '#fde68a' };
            case 'on_way': return { text: 'On the way', color: '#3b82f6', bgColor: '#eff6ff', border: '#bfdbfe' };
            case 'arrived': return { text: 'Arrived at pickup', color: '#8b5cf6', bgColor: '#faf5ff', border: '#e9d5ff' };
            case 'picked_up': return { text: 'Items picked up', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            case 'completed': return { text: 'Completed', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            default: return { text: 'Waiting for requests...', color: '#d97706', bgColor: '#fef3c7', border: '#fde68a' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <View style={{ flex: 1, position: 'relative' }}>
                <LiveMap
                    coordinates={currentLocation}
                    pickupLocation={rideState.customerLocation}
                    dropoffLocation={null}
                />

                {locating && (
                    <View className="absolute inset-0 justify-center items-center bg-black/30 z-50">
                        <View className="bg-white p-5 rounded-3xl items-center shadow-2xl">
                            <ActivityIndicator size="large" color="#d97706" />
                            <Text className="text-gray-800 mt-3 font-bold">Locating...</Text>
                        </View>
                    </View>
                )}

                <View 
                    className="absolute top-6 self-center px-6 py-2.5 rounded-full shadow-sm z-40 border" 
                    style={{ backgroundColor: statusInfo.bgColor, borderColor: statusInfo.border }}
                >
                    <Text className="font-extrabold text-[13px] uppercase tracking-wider" style={{ color: statusInfo.color }}>
                        {statusInfo.text}
                    </Text>
                </View>

                {rideState.status !== 'idle' && rideState.customerName && (
                    <View className="absolute top-20 mx-5 self-center bg-white p-5 rounded-3xl shadow-xl z-40 w-[90%] border border-gray-100">
                        <View className="flex-row items-center justify-between mb-3 border-b border-gray-50 pb-3">
                            <View className="flex-row items-center">
                                <View className="bg-amber-50 p-2 rounded-full mr-3">
                                    <User color="#d97706" size={20} />
                                </View>
                                <Text className="font-extrabold text-gray-900 text-lg">
                                    {rideState.customerName}
                                </Text>
                            </View>
                            {rideState.estimatedTime && (
                                <View className="bg-amber-100 px-3 py-1.5 rounded-full">
                                    <Text className="text-amber-700 text-xs font-bold tracking-wide">
                                        ~{rideState.estimatedTime} min
                                    </Text>
                                </View>
                            )}
                        </View>
                        {rideState.pickupAddress && (
                            <View className="flex-row items-center mt-1 pr-4">
                                <MapPin color="#9ca3af" size={16} />
                                <Text className="ml-2 text-sm text-gray-600 font-medium" numberOfLines={2}>
                                    {rideState.pickupAddress}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <View className="absolute bottom-8 w-full px-5 z-40">
                    {rideState.status === 'accepted' && (
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="flex-1 flex-row items-center justify-center bg-gray-900 py-4 rounded-2xl shadow-lg"
                                onPress={handleStartNavigation}
                            >
                                <Navigation color="#fff" size={18} strokeWidth={2.5} />
                                <Text className="font-bold text-white ml-2">Navigate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="flex-1 flex-row items-center justify-center bg-amber-600 py-4 rounded-2xl shadow-lg"
                                onPress={() => handleStatusUpdate('on_way')}
                            >
                                <Truck color="#fff" size={18} strokeWidth={2.5} />
                                <Text className="font-bold text-white ml-2">On My Way</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {rideState.status === 'on_way' && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="w-full flex-row items-center justify-center bg-amber-600 py-4 rounded-2xl shadow-lg"
                            onPress={() => handleStatusUpdate('arrived')}
                        >
                            <MapPin color="#fff" size={20} strokeWidth={2.5} />
                            <Text className="font-bold text-white text-base ml-2">I've Arrived</Text>
                        </TouchableOpacity>
                    )}

                    {rideState.status === 'arrived' && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="w-full flex-row items-center justify-center bg-amber-600 py-4 rounded-2xl shadow-lg"
                            onPress={() => handleStatusUpdate('picked_up')}
                        >
                            <Package color="#fff" size={20} strokeWidth={2.5} />
                            <Text className="font-bold text-white text-base ml-2">Items Picked Up</Text>
                        </TouchableOpacity>
                    )}

                    {rideState.status === 'picked_up' && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="w-full flex-row items-center justify-center bg-emerald-600 py-4 rounded-2xl shadow-lg"
                            onPress={() => handleStatusUpdate('completed')}
                        >
                            <CheckCircle color="#fff" size={20} strokeWidth={2.5} />
                            <Text className="font-bold text-white text-base ml-2">Complete Pickup</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Modal
                visible={showRequestModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRequestModal(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[32px] p-6 pb-8 shadow-2xl" style={{ maxHeight: '85%' }}>
                        <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                        <Text className="text-2xl font-black text-gray-900 mb-6 text-center">New Pickup Request</Text>

                        {incomingRequest && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    
                                    <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                        <View className="flex-row items-center">
                                            <View className="bg-amber-100 p-2.5 rounded-full mr-3">
                                                <User color="#d97706" size={20} />
                                            </View>
                                            <Text className="font-extrabold text-gray-900 text-lg">
                                                {incomingRequest.customerName}
                                            </Text>
                                        </View>
                                        {incomingRequest.estimatedEarnings && (
                                            <View className="bg-amber-600 px-3 py-1.5 rounded-full flex-row items-center shadow-sm">
                                                <DollarSign color="#fff" size={14} />
                                                <Text className="text-white font-bold text-sm ml-0.5">{incomingRequest.estimatedEarnings}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-row items-start mb-5">
                                        <MapPin color="#9ca3af" size={20} style={{ marginTop: 2 }} />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Pickup Location</Text>
                                            <Text className="text-gray-900 font-bold leading-tight">
                                                {incomingRequest.customerAddress}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3 mb-5">
                                        {incomingRequest.distance && (
                                            <View className="flex-1 flex-row items-center bg-white p-3 rounded-2xl border border-gray-100">
                                                <Navigation color="#d97706" size={20} />
                                                <View className="ml-2">
                                                    <Text className="text-[10px] text-gray-500 font-bold uppercase">Distance</Text>
                                                    <Text className="text-gray-900 font-black">{incomingRequest.distance.toFixed(1)} km</Text>
                                                </View>
                                            </View>
                                        )}
                                        {incomingRequest.totalWeight && (
                                            <View className="flex-1 flex-row items-center bg-white p-3 rounded-2xl border border-gray-100">
                                                <Package color="#d97706" size={20} />
                                                <View className="ml-2">
                                                    <Text className="text-[10px] text-gray-500 font-bold uppercase">Total Weight</Text>
                                                    <Text className="text-gray-900 font-black">{incomingRequest.totalWeight} Kg</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {incomingRequest.items && incomingRequest.items.length > 0 && (
                                        <View>
                                            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                                Items Included ({incomingRequest.items.length})
                                            </Text>
                                            {incomingRequest.items.map((item) => {
                                                const category = categories.find(cat => cat.id === item.category);
                                                const ItemIcon = category?.icon || Package;
                                                return (
                                                    <View key={item.id} className="bg-white p-3 rounded-2xl mb-2 flex-row items-center border border-gray-100 shadow-sm">
                                                        <View style={{ backgroundColor: category?.color + '15', padding: 10, borderRadius: 12 }}>
                                                            <ItemIcon size={20} color={category?.color || '#d97706'} />
                                                        </View>
                                                        <View className="ml-3 flex-1">
                                                            <View className="flex-row justify-between items-center">
                                                                <Text className="font-extrabold text-gray-900">{category?.label}</Text>
                                                                <Text className="font-bold text-amber-600">{item.weight} Kg</Text>
                                                            </View>
                                                            {item.description && (
                                                                <Text className="text-xs text-gray-500 mt-1 font-medium">{item.description}</Text>
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
                                        className="flex-1 bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center"
                                        onPress={handleRejectRequest}
                                    >
                                        <Text className="text-gray-700 font-extrabold text-base">Decline</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        className="flex-1 bg-amber-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
                                        onPress={handleAcceptRequest}
                                    >
                                        <Text className="text-white font-extrabold text-base">Accept Ride</Text>
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

export default CollectorRideScreen;