import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Linking, Platform, StatusBar, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { acceptOrder, updatecustomerLocation, setRideStatus, resetRide, updatecollectorLocation, RaddiItem, completeRide } from '../../store/slices/rideSlice'
import LiveMap from '../../components/LiveMap'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import socketService from '../../services/socketService'
import { MapPin, Navigation, CheckCircle, XCircle, Package, User, DollarSign, FileText, Smartphone, Boxes, Wine, Layers, Truck, MessageSquare, Send, Tag, X } from 'lucide-react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { useFetch } from '../../apiHooks/useFetch'

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
    const navigation = useNavigation<any>();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; name?: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const rideState = useSelector((state: RootState) => state.ride);

    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState<IncomingPickupRequest | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Bidding states
    const [customBidAmount, setCustomBidAmount] = useState('');
    const [counterOfferData, setCounterOfferData] = useState<any>(null);
    const [showCounterModal, setShowCounterModal] = useState(false);

    const categories: { id: RaddiItem['category']; label: string; icon: any; color: string }[] = [
        { id: 'paper', label: 'Kaghaz (Paper)', icon: FileText, color: '#3b82f6' },
        { id: 'plastic', label: 'Plastic', icon: Layers, color: '#f59e0b' },
        { id: 'metal', label: 'Loha / Metal', icon: Package, color: '#64748b' },
        { id: 'electronics', label: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
        { id: 'cardboard', label: 'Gatta (Cardboard)', icon: Boxes, color: '#d97706' },
        { id: 'glass', label: 'Sheesha (Glass)', icon: Wine, color: '#10b981' },
        { id: 'other', label: 'Deegar (Other)', icon: MapPin, color: '#ef4444' },
    ];

    useEffect(() => {
        const fetchLocationFast = async () => {
            try {
                setLocating(true);
                const granted = await getLocationPermission();
                if (!granted) {
                    Toast.show({ type: ALERT_TYPE.WARNING, title: 'Permission Chahiye', textBody: 'Location ki ijazat zaroori hai.' });
                    setCurrentLocation(FALLBACK_LOCATION);
                    dispatch(updatecollectorLocation(FALLBACK_LOCATION));
                    return;
                }

                const locationPromise = getCurrentLocation();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000));
                
                const position = await Promise.race([locationPromise, timeoutPromise]) as any;
                const { latitude, longitude } = position.coords;
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
            } catch (error: any) {
                console.log('Fast Location Fallback Triggered');
                setCurrentLocation(FALLBACK_LOCATION);
                dispatch(updatecollectorLocation(FALLBACK_LOCATION));
            } finally {
                setLocating(false);
            }
        };
        fetchLocationFast();
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

    // Fetch open/available orders from REST API for collectors logged in after order creation
    const { data: availableData, refetch: refetchAvailable } = useFetch({
        endpoint: 'order/api/v1/available?page=1&limit=10',
        isAuth: true,
    });

    useFocusEffect(
        useCallback(() => {
            if (rideState.status === 'idle') {
                refetchAvailable();
            }
        }, [rideState.status, refetchAvailable])
    );

    useEffect(() => {
        if (rideState.status === 'idle' && !incomingRequest) {
            const rawOrders = availableData?.orders ?? availableData?.data ?? availableData;
            const orders = Array.isArray(rawOrders) ? rawOrders : [];
            if (orders.length > 0) {
                const firstOrder = orders[0];
                const mapped: IncomingPickupRequest = {
                    orderId: String(firstOrder.id),
                    customerId: String(firstOrder.customerId || firstOrder.customer_id || firstOrder.user_id || '1'),
                    customerName: firstOrder.customerName || firstOrder.customer_name || 'Customer',
                    customerLatitude: Number(firstOrder.pickupLatitude || firstOrder.pickup_latitude || 31.5204),
                    customerLongitude: Number(firstOrder.pickupLongitude || firstOrder.pickup_longitude || 74.3587),
                    customerAddress: firstOrder.pickupAddress || firstOrder.pickup_address || 'Lahore',
                    totalWeight: String(firstOrder.approximateRaddiInKg || firstOrder.weight || '10'),
                    estimatedEarnings: Number(firstOrder.expectedPrice || 0),
                };
                setIncomingRequest(mapped);
                setShowRequestModal(true);
            }
        }
    }, [availableData, rideState.status, incomingRequest]);

    useEffect(() => {
        const handleNewOrder = (data: any) => {
            if (!data) return;
            const mapped: IncomingPickupRequest = {
                orderId: String(data.orderId || data.id || Date.now()),
                customerId: String(data.customerId || data.customer_id || '1'),
                customerName: data.customerName || data.customer_name || 'Customer',
                customerLatitude: Number(data.pickupLatitude || data.customerLatitude || 31.5204),
                customerLongitude: Number(data.pickupLongitude || data.customerLongitude || 74.3587),
                customerAddress: data.pickupAddress || data.customerAddress || 'Lahore',
                totalWeight: String(data.approximateRaddiInKg || data.totalWeight || '10'),
                estimatedEarnings: Number(data.expectedPrice || data.estimatedEarnings || 0),
            };
            setIncomingRequest(mapped);
            setShowRequestModal(true);
            Toast.show({ type: ALERT_TYPE.INFO, title: 'Nayi Request Aagayi!', textBody: `${mapped.customerName} ko raddi bechni hai.` });
        };

        socketService.on('newRideOrder', handleNewOrder);
        socketService.on('newOrderAvailable', handleNewOrder);
        socketService.on('new_order', handleNewOrder);

        socketService.on('bidPlaced', (data: any) => {
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Boli Lag Gayi!', textBody: 'Customer ko aapki boli bhej di gayi hai.' });
        });

        socketService.on('bidAccepted', (data: any) => {
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Boli Manzoor!', textBody: 'Customer ne aapki boli qabool kar li hai!' });
            dispatch(setRideStatus('accepted'));
            setShowRequestModal(false);
        });

        socketService.on('bidCountered', (data: any) => {
            setCounterOfferData(data);
            setShowCounterModal(true);
            Toast.show({ type: ALERT_TYPE.INFO, title: 'Counter Offer Aagayi!', textBody: `${data.customerName || 'Customer'} ne Rs ${data.counterAmount} ki counter offer ki hai.` });
        });

        socketService.on('orderCompletedConfirmed', (data: any) => {
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Order Mukammal!', textBody: `Rs ${data.finalPrice} aapke batwe se muntaqil kar diye gaye hain.` });
            dispatch(completeRide({ price: data.finalPrice || 0 }));
            setTimeout(() => { dispatch(resetRide()); }, 2000);
        });

        socketService.on('requestCancelled', () => {
            setShowRequestModal(false);
            setIncomingRequest(null);
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Request Cancel Ho Gayi', textBody: 'Customer ne request cancel kar di hai.' });
        });

        return () => {
            socketService.off('newRideOrder');
            socketService.off('newOrderAvailable');
            socketService.off('new_order');
            socketService.off('bidPlaced');
            socketService.off('bidAccepted');
            socketService.off('bidCountered');
            socketService.off('orderCompletedConfirmed');
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
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Qabool Kar Li!', textBody: `${incomingRequest.customerName} ki taraf rasta dekhein` });

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
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'Inkaar Kar Diya', textBody: 'Aapne request reject kar di hai.' });

        if (isConnected && incomingRequest) {
            socketService.emit('rejectRaddiOrder', {
                customerId: incomingRequest.customerId,
                collectorId: Number(userdata?.id) || userdata?.id,
                orderId: incomingRequest.orderId,
            });
        }
    };

    const handlePlaceBid = () => {
        if (!incomingRequest || !customBidAmount) return;
        if (!isConnected) {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Offline', textBody: 'Internet connection check karein.' });
            return;
        }

        socketService.emit('placeBid', {
            orderId: Number(incomingRequest.orderId),
            collectorId: Number(userdata?.id) || userdata?.id,
            bidAmount: parseFloat(customBidAmount),
            note: 'Fauri pickup kar sakta hoon',
        });

        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Boli Bhej Di!', textBody: `Rs ${customBidAmount} ki boli bhej di gayi hai.` });
        setShowRequestModal(false);
        setCustomBidAmount('');
    };

    const handleAcceptCounterOffer = () => {
        if (!counterOfferData || !isConnected) return;
        socketService.emit('acceptCounter', {
            orderId: counterOfferData.orderId,
            bidId: counterOfferData.bidId,
        });
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Counter Manzoor!', textBody: 'Aapne counter offer qabool kar li hai.' });
        dispatch(setRideStatus('accepted'));
        setShowCounterModal(false);
    };

    const handleRejectCounterOffer = () => {
        if (!counterOfferData || !isConnected) return;
        socketService.emit('rejectCounter', {
            orderId: counterOfferData.orderId,
            bidId: counterOfferData.bidId,
        });
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'Counter Radd', textBody: 'Counter offer radd kar di gayi.' });
        setShowCounterModal(false);
    };

    const handleStartNavigation = () => {
        if (!rideState.customerLocation) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Masla Hai', textBody: 'Customer ki location nahi mil rahi' });
            return;
        }
        const { latitude, longitude } = rideState.customerLocation;
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Toast.show({ type: ALERT_TYPE.DANGER, title: 'Masla Hai', textBody: 'Maps app open nahi ho raha' });
            });
        }
    };

    const handleStatusUpdate = (newStatus: string) => {
        dispatch(setRideStatus(newStatus as any));
        const statusMessages: { [key: string]: string } = {
            on_way: 'Aap raste mein hain',
            arrived: 'Aap pohnch gaye hain',
            picked_up: 'Saman utha liya gaya hai',
            completed: 'Pickup mukammal ho gaya!',
        };

        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Status Update', textBody: statusMessages[newStatus] || 'Status badal gaya' });

        if (isConnected) {
            if (newStatus === 'on_way') {
                socketService.emit('startPickup', { orderId: Number(rideState.orderId), collectorId: Number(userdata?.id) });
            } else if (newStatus === 'completed') {
                socketService.emit('completeOrder', {
                    orderId: Number(rideState.orderId),
                    collectorId: Number(userdata?.id),
                    actualRaddiInKg: parseFloat(rideState.approximateWeight || '10'),
                });
            } else {
                socketService.emit('updatePickupStatus', { orderId: rideState.orderId, status: newStatus });
            }
        }
    };

    const getStatusInfo = () => {
        switch (rideState.status) {
            case 'idle': return { text: 'Nayi requests ka intezar...', color: '#d97706', bgColor: '#fffbeb', border: '#fde68a' };
            case 'accepted': return { text: 'Request Qabool Ho Gayi', color: '#d97706', bgColor: '#fffbeb', border: '#fde68a' };
            case 'on_way': return { text: 'Raste Mein Hain', color: '#2563eb', bgColor: '#eff6ff', border: '#bfdbfe' };
            case 'arrived': return { text: 'Pohnch Gaye', color: '#7c3aed', bgColor: '#faf5ff', border: '#e9d5ff' };
            case 'picked_up': return { text: 'Saman Utha Liya', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            case 'completed': return { text: 'Mukammal', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            default: return { text: 'Nayi requests ka intezar...', color: '#d97706', bgColor: '#fffbeb', border: '#fde68a' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <View style={{ flex: 1, position: 'relative' }}>
                <LiveMap
                    coordinates={currentLocation}
                    pickupLocation={rideState.customerLocation}
                    dropoffLocation={null}
                />

                {locating && (
                    <View className="absolute inset-0 justify-center items-center bg-black/20 z-50 backdrop-blur-sm">
                        <View className="bg-white p-6 rounded-[28px] items-center shadow-2xl border border-[#f1f5f9]">
                            <ActivityIndicator size="large" color="#d97706" />
                            <Text className="text-gray-900 mt-4 font-black text-lg tracking-tight">Location mil rahi hai...</Text>
                        </View>
                    </View>
                )}

                <View 
                    className="absolute top-12 self-center px-6 py-3 rounded-full shadow-md z-40 border" 
                    style={{ backgroundColor: statusInfo.bgColor, borderColor: statusInfo.border }}
                >
                    <Text className="font-black text-xs uppercase tracking-widest" style={{ color: statusInfo.color }}>
                        {statusInfo.text}
                    </Text>
                </View>

                {rideState.status !== 'idle' && rideState.customerName && (
                    <View className="absolute top-28 mx-5 self-center bg-white p-6 rounded-[32px] shadow-xl shadow-amber-900/10 z-40 w-[90%] border border-[#f1f5f9]">
                        <View className="flex-row items-center justify-between mb-4 border-b border-[#f1f5f9] pb-4">
                            <View className="flex-row items-center">
                                <View className="bg-[#fffbeb] p-3 rounded-[16px] mr-3">
                                    <User color="#d97706" size={20} strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-0.5">Customer</Text>
                                    <Text className="font-black text-gray-900 text-lg tracking-tight">
                                        {rideState.customerName}
                                    </Text>
                                </View>
                            </View>
                            {rideState.estimatedTime && (
                                <View className="bg-[#fffbeb] px-3 py-1.5 rounded-[12px] border border-[#fde68a]">
                                    <Text className="text-[#d97706] text-xs font-black tracking-wide">
                                        ~{rideState.estimatedTime} min
                                    </Text>
                                </View>
                            )}
                        </View>
                        {rideState.pickupAddress && (
                            <View className="flex-row items-start mt-1 pr-2">
                                <MapPin color="#94a3b8" size={16} strokeWidth={2.5} className="mt-0.5" />
                                <Text className="ml-2.5 text-sm text-gray-600 font-bold leading-relaxed flex-1" numberOfLines={2}>
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
                                activeOpacity={0.85}
                                className="flex-1 flex-row items-center justify-center bg-gray-900 py-4 rounded-[24px] shadow-lg"
                                onPress={handleStartNavigation}
                            >
                                <Navigation color="#ffffff" size={18} strokeWidth={2.5} />
                                <Text className="font-black text-white ml-2.5 text-base">Rasta Dekhein</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                className="flex-1 flex-row items-center justify-center bg-[#d97706] py-4 rounded-[24px] shadow-lg shadow-amber-600/30"
                                onPress={() => handleStatusUpdate('on_way')}
                            >
                                <Truck color="#ffffff" size={18} strokeWidth={2.5} />
                                <Text className="font-black text-white ml-2.5 text-base">Raste Mein Hoon</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {rideState.status === 'on_way' && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="w-full flex-row items-center justify-center bg-[#d97706] py-4 rounded-[24px] shadow-lg shadow-amber-600/30"
                            onPress={() => handleStatusUpdate('arrived')}
                        >
                            <MapPin color="#ffffff" size={20} strokeWidth={2.5} />
                            <Text className="font-black text-white text-lg ml-2.5">Main Pohnch Gaya</Text>
                        </TouchableOpacity>
                    )}

                    {rideState.status === 'arrived' && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="w-full flex-row items-center justify-center bg-[#d97706] py-4 rounded-[24px] shadow-lg shadow-amber-600/30"
                            onPress={() => handleStatusUpdate('picked_up')}
                        >
                            <Package color="#ffffff" size={20} strokeWidth={2.5} />
                            <Text className="font-black text-white text-lg ml-2.5">Saman Utha Liya</Text>
                        </TouchableOpacity>
                    )}

                    {rideState.status === 'picked_up' && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="w-full flex-row items-center justify-center bg-[#059669] py-4 rounded-[24px] shadow-lg shadow-emerald-600/30"
                            onPress={() => handleStatusUpdate('completed')}
                        >
                            <CheckCircle color="#ffffff" size={20} strokeWidth={2.5} />
                            <Text className="font-black text-white text-lg ml-2.5">Pickup Pura Karein</Text>
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
                    <View className="bg-white rounded-t-[40px] p-6 pb-8 shadow-2xl" style={{ maxHeight: '85%' }}>
                        <View className="w-12 h-1.5 bg-[#e2e8f0] rounded-full self-center mb-6" />

                        <Text className="text-3xl font-black text-gray-900 mb-6 text-center tracking-tight">Nayi Request Agayi</Text>

                        {incomingRequest && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                <View className="bg-[#f8fafc] p-5 rounded-[32px] border border-[#f1f5f9]">
                                    
                                    <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-[#e2e8f0]">
                                        <View className="flex-row items-center">
                                            <View className="bg-[#fffbeb] p-3 rounded-[16px] mr-3">
                                                <User color="#d97706" size={20} strokeWidth={2.5} />
                                            </View>
                                            <Text className="font-black text-gray-900 text-xl tracking-tight">
                                                {incomingRequest.customerName}
                                            </Text>
                                        </View>
                                        {incomingRequest.estimatedEarnings && (
                                            <View className="bg-[#d97706] px-3 py-1.5 rounded-[12px] flex-row items-center shadow-sm">
                                                <DollarSign color="#ffffff" size={14} strokeWidth={3} />
                                                <Text className="text-white font-black text-sm ml-0.5">{incomingRequest.estimatedEarnings}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-row items-start mb-6">
                                        <MapPin color="#64748b" size={20} style={{ marginTop: 2 }} strokeWidth={2.5} />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Pickup Ka Pata (Location)</Text>
                                            <Text className="text-gray-900 font-bold text-sm leading-relaxed">
                                                {incomingRequest.customerAddress}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3 mb-6">
                                        {incomingRequest.distance && (
                                            <View className="flex-1 flex-row items-center bg-white p-3 rounded-[20px] border border-[#f1f5f9] shadow-sm">
                                                <View className="bg-[#fffbeb] p-2 rounded-[12px]">
                                                    <Navigation color="#d97706" size={18} strokeWidth={2.5} />
                                                </View>
                                                <View className="ml-3">
                                                    <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Fasla</Text>
                                                    <Text className="text-gray-900 font-black text-base">{incomingRequest.distance.toFixed(1)} km</Text>
                                                </View>
                                            </View>
                                        )}
                                        {incomingRequest.totalWeight && (
                                            <View className="flex-1 flex-row items-center bg-white p-3 rounded-[20px] border border-[#f1f5f9] shadow-sm">
                                                <View className="bg-[#fffbeb] p-2 rounded-[12px]">
                                                    <Package color="#d97706" size={18} strokeWidth={2.5} />
                                                </View>
                                                <View className="ml-3">
                                                    <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Kull Wazan</Text>
                                                    <Text className="text-gray-900 font-black text-base">{incomingRequest.totalWeight} Kg</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {incomingRequest.items && incomingRequest.items.length > 0 && (
                                        <View>
                                            <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 px-1">
                                                Saman Ki Tafseel ({incomingRequest.items.length})
                                            </Text>
                                            {incomingRequest.items.map((item) => {
                                                const category = categories.find(cat => cat.id === item.category);
                                                const ItemIcon = category?.icon || Package;
                                                return (
                                                    <View key={item.id} className="bg-white p-3 rounded-[20px] mb-2 flex-row items-center border border-[#f1f5f9] shadow-sm">
                                                        <View style={{ backgroundColor: category?.color + '15' }} className="p-3 rounded-[14px]">
                                                            <ItemIcon size={20} color={category?.color || '#d97706'} strokeWidth={2.5} />
                                                        </View>
                                                        <View className="ml-3 flex-1">
                                                            <View className="flex-row justify-between items-center mb-0.5">
                                                                <Text className="font-black text-gray-900 text-base">{category?.label}</Text>
                                                                <Text className="font-black text-[#d97706] text-sm">{item.weight} Kg</Text>
                                                            </View>
                                                            {item.description && (
                                                                <Text className="text-xs text-gray-500 font-bold">{item.description}</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>

                                 {/* Custom Bidding Input Section */}
                                 <View className="mt-4 pt-4 border-t border-[#e2e8f0]">
                                     <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                         Apni Boli (Custom Bid Price Rs)
                                     </Text>
                                     <View className="flex-row gap-2">
                                         <TextInput
                                             value={customBidAmount}
                                             onChangeText={setCustomBidAmount}
                                             placeholder="Misaal: 1350"
                                             keyboardType="numeric"
                                             className="flex-1 bg-white px-4 h-[50px] rounded-[18px] border border-[#e2e8f0] font-black text-gray-900 text-base"
                                         />
                                         <TouchableOpacity
                                             onPress={handlePlaceBid}
                                             disabled={!customBidAmount}
                                             className={`px-5 rounded-[18px] justify-center flex-row items-center ${customBidAmount ? 'bg-amber-600' : 'bg-gray-200'}`}
                                         >
                                             <Tag size={16} color={customBidAmount ? '#ffffff' : '#94a3b8'} className="mr-1.5" />
                                             <Text className={`font-black text-sm ${customBidAmount ? 'text-white' : 'text-gray-400'}`}>Boli Bhejein</Text>
                                         </TouchableOpacity>
                                     </View>
                                 </View>

                                 <View className="flex-row gap-3 mt-6">
                                     <TouchableOpacity
                                         activeOpacity={0.85}
                                         className="flex-1 bg-[#f1f5f9] py-4 rounded-[24px] flex-row items-center justify-center border border-[#e2e8f0]"
                                         onPress={handleRejectRequest}
                                     >
                                         <Text className="text-gray-700 font-black text-base tracking-wide">Inkaar Karein</Text>
                                     </TouchableOpacity>

                                     <TouchableOpacity
                                         activeOpacity={0.85}
                                         className="flex-1 bg-[#d97706] py-4 rounded-[24px] flex-row items-center justify-center shadow-lg shadow-amber-600/30"
                                         onPress={handleAcceptRequest}
                                     >
                                         <Text className="text-white font-black text-base tracking-wide">Qabool Karein</Text>
                                     </TouchableOpacity>
                                 </View>
                             </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Counter Offer Modal */}
            <Modal visible={showCounterModal} transparent animationType="slide" onRequestClose={() => setShowCounterModal(false)}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-black text-gray-900">Customer Counter Offer!</Text>
                            <TouchableOpacity onPress={() => setShowCounterModal(false)} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} color="#374151" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        {counterOfferData && (
                            <View className="bg-[#fffbeb] p-5 rounded-[28px] border border-[#fde68a] mb-6">
                                <Text className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">
                                    {counterOfferData.customerName || 'Customer'} ne counter offer ki hai:
                                </Text>
                                <View className="flex-row items-baseline mb-2">
                                    <Text className="font-black text-gray-900 text-3xl">Rs {counterOfferData.counterAmount}</Text>
                                    <Text className="text-xs font-bold text-gray-500 ml-2">(Original: Rs {counterOfferData.originalBid})</Text>
                                </View>
                                <Text className="text-xs text-gray-600 font-medium leading-relaxed">
                                    Kya aap is nayi qeemat par pickup karne ke liye tayyar hain?
                                </Text>
                            </View>
                        )}

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleRejectCounterOffer}
                                className="flex-1 bg-[#f1f5f9] py-4 rounded-[24px] items-center border border-[#e2e8f0]"
                            >
                                <Text className="font-black text-gray-700 text-base">Inkaar Karein</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleAcceptCounterOffer}
                                className="flex-1 bg-[#d97706] py-4 rounded-[24px] items-center shadow-lg shadow-amber-600/30"
                            >
                                <Text className="font-black text-white text-base">Qabool Karein</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Floating Chat Button when order is active */}
            {rideState.status !== 'idle' && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Chat', {
                        orderId: rideState.orderId,
                        recipientName: rideState.customerName || 'Customer',
                        recipientId: rideState.customerId,
                    })}
                    className="absolute bottom-28 right-5 bg-amber-600 p-4 rounded-full shadow-2xl z-40 flex-row items-center border border-white"
                >
                    <MessageSquare color="#ffffff" size={22} strokeWidth={2.5} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default CollectorRideScreen;