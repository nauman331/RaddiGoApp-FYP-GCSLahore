import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput, StatusBar } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { createOrder, updatecustomerLocation, updatecollectorLocation, setRideStatus, resetRide, RaddiItem } from '../../store/slices/rideSlice'
import LiveMap from '../../components/LiveMap'
import BottomSheet from '../../components/BottomSheet'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import socketService from '../../services/socketService'
import { MapPin, Navigation, Package, User, DollarSign, FileText, Smartphone, Boxes, Wine, Layers, Plus, Trash2, Send } from 'lucide-react-native'

const FALLBACK_LOCATION = { latitude: 31.5204, longitude: 74.3587 };

interface Nearbycollector {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    distance: number;
    available: boolean;
}

const CustomerRideScreen = () => {
    const dispatch = useDispatch();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; name?: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const rideState = useSelector((state: RootState) => state.ride);

    const ACCEPTANCE_RADIUS_KM = 5;
    const ACCEPTANCE_RADIUS_METERS = ACCEPTANCE_RADIUS_KM * 1000;

    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [nearbycollectors, setNearbycollectors] = useState<Nearbycollector[]>([]);
    const [selectedcollector, setSelectedcollector] = useState<Nearbycollector | null>(null);
    const [items, setItems] = useState<RaddiItem[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newItem, setNewItem] = useState<{ category: RaddiItem['category'] | null; weight: string; description: string }>({
        category: null, weight: '', description: '',
    });
    const bottomSheetRef = useRef<any>(null);

    const categories: { id: RaddiItem['category']; label: string; icon: any; color: string }[] = [
        { id: 'paper', label: 'Paper', icon: FileText, color: '#3b82f6' },
        { id: 'plastic', label: 'Plastic', icon: Layers, color: '#f59e0b' },
        { id: 'metal', label: 'Metal', icon: Package, color: '#6b7280' },
        { id: 'electronics', label: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
        { id: 'cardboard', label: 'Cardboard', icon: Boxes, color: '#d97706' },
        { id: 'glass', label: 'Glass', icon: Wine, color: '#10b981' },
        { id: 'other', label: 'Other', icon: MapPin, color: '#ef4444' },
    ];

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        const locationHandler = async () => {
            try {
                setLocating(true);
                const granted = await getLocationPermission();
                if (!granted) {
                    Toast.show({ type: ALERT_TYPE.DANGER, title: 'Permission Denied', textBody: 'Location permission is required.' });
                    setCurrentLocation(FALLBACK_LOCATION);
                    dispatch(updatecustomerLocation(FALLBACK_LOCATION));
                    return;
                }
                const position = await getCurrentLocation();
                const { latitude, longitude } = (position as { coords: { latitude: number; longitude: number } }).coords;
                const location = { latitude, longitude };
                setCurrentLocation(location);
                dispatch(updatecustomerLocation(location));
            } catch (error: any) {
                console.error('Location error:', error);
                Toast.show({ 
                    type: ALERT_TYPE.WARNING, 
                    title: 'GPS Timeout', 
                    textBody: 'Could not get exact location. Using default city center.' 
                });
                setCurrentLocation(FALLBACK_LOCATION);
                dispatch(updatecustomerLocation(FALLBACK_LOCATION));
            } finally {
                setLocating(false);
            }
        };
        locationHandler();
    }, []);

    useEffect(() => {
        if (currentLocation && rideState.status === 'idle') {
            if (isConnected) {
                socketService.emit('requestNearbyCollectors', {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    radiusMeters: ACCEPTANCE_RADIUS_METERS,
                });
            } else {
                setNearbycollectors([]);
            }
        }
    }, [currentLocation, rideState.status, isConnected]);

    useEffect(() => {
        socketService.on('nearbycollectorsUpdate', (data: Nearbycollector[]) => { setNearbycollectors(data); });

        socketService.on('orderCreated', (data: any) => {
            if (data.success) {
                Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Request Sent', textBody: `Request sent to ${data.driverCount} drivers` });
            } else {
                Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Drivers', textBody: data.message || 'No nearby drivers found' });
                dispatch(resetRide());
            }
        });

        socketService.on('rideOrderAccepted', (data: any) => {
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Request Accepted!', textBody: `${data.collectorName || 'Collector'} accepted your pickup request.` });
            dispatch(setRideStatus('accepted'));
            if (data.collectorId) {
                dispatch(updatecollectorLocation({ latitude: data.orderDetails?.collectorLatitude || 0, longitude: data.orderDetails?.collectorLongitude || 0 }));
            }
        });

        socketService.on('driverLocationUpdate', (data: { driverId: string; latitude: number; longitude: number; orderId?: string }) => {
            setNearbycollectors(prev => prev.map(c => {
                if (c.id === String(data.driverId)) {
                    const distance = currentLocation ? calculateDistance(currentLocation.latitude, currentLocation.longitude, data.latitude, data.longitude) : c.distance;
                    return { ...c, latitude: data.latitude, longitude: data.longitude, distance: parseFloat((distance).toFixed(1)) };
                }
                return c;
            }));

            if (rideState.collectorId === String(data.driverId)) {
                dispatch(updatecollectorLocation({ latitude: data.latitude, longitude: data.longitude }));
            }
        });

        socketService.on('pickupRequestRejected', (data: any) => {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Request Rejected', textBody: `${data.collectorName} rejected your request.` });
            dispatch(resetRide());
        });

        return () => {
            socketService.off('nearbycollectorsUpdate');
            socketService.off('pickupRequestAccepted');
            socketService.off('pickupRequestRejected');
        };
    }, []);

    const handleSelectcollector = (collector: Nearbycollector) => {
        setSelectedcollector(collector);
        bottomSheetRef.current?.present?.();
    };

    const handleAddItem = () => {
        if (!newItem.category || !newItem.weight) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Please select category and enter weight.' });
            return;
        }

        const item: RaddiItem = {
            id: Date.now().toString(),
            category: newItem.category,
            weight: newItem.weight,
            description: newItem.description,
        };

        setItems([...items, item]);
        setNewItem({ category: null, weight: '', description: '' });
        setShowCategoryModal(false);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Item Added', textBody: `${newItem.category} added successfully.` });
    };

    const handleRemoveItem = (itemId: string) => { setItems(items.filter(item => item.id !== itemId)); };

    const getTotalWeight = () => items.reduce((sum, item) => sum + parseFloat(item.weight || '0'), 0).toFixed(1);

    const handleSendPickupRequest = () => {
        if (items.length === 0) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Please add at least one item.' });
            return;
        }

        const totalWeight = getTotalWeight();
        const tempOrderId = `temp-${Date.now()}`;
        
        dispatch(createOrder({
            orderId: tempOrderId,
            pickupLocation: currentLocation ?? null as any,
            pickupAddress: selectedcollector?.address || '',
            approximateWeight: totalWeight,
            collectorId: selectedcollector?.id ?? null as any,
            items,
        }));

        bottomSheetRef.current?.close?.();
        setItems([]);
        setSelectedcollector(null);

        Toast.show({ type: ALERT_TYPE.INFO, title: 'Request Sent', textBody: selectedcollector ? `Sent to ${selectedcollector.name}` : 'Pickup request sent' });

        if (isConnected) {
            const payload: any = {
                customerId: Number(userdata?.id) || userdata?.id,
                customerName: userdata?.name || 'customer',
                pickupLatitude: currentLocation?.latitude,
                pickupLongitude: currentLocation?.longitude,
                pickupAddress: selectedcollector?.address || '',
                approximateRaddiInKg: totalWeight,
                items,
            };
            if (selectedcollector?.id) payload.collectorId = selectedcollector.id;
            socketService.emit('makeRaddiOrder', payload);
        } else {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Offline', textBody: 'Unable to send request: not connected.' });
        }
    };

    const getStatusInfo = () => {
        switch (rideState.status) {
            case 'idle': return { text: `${nearbycollectors.length} Collectors Nearby`, color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            case 'pending': return { text: 'Waiting for response...', color: '#d97706', bgColor: '#fef3c7', border: '#fde68a' };
            case 'accepted': return { text: 'Collector Accepted', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            case 'completed': return { text: 'Pickup Completed', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            default: return { text: 'Searching...', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <View style={{ flex: 1, position: 'relative' }}>
                <LiveMap
                    coordinates={currentLocation}
                    pickupLocation={null}
                    dropoffLocation={null}
                    nearbyUsers={nearbycollectors}
                    acceptanceRadius={ACCEPTANCE_RADIUS_METERS}
                />

                {locating && (
                    <View className="absolute inset-0 justify-center items-center bg-black/30 z-50">
                        <View className="bg-white p-5 rounded-3xl items-center shadow-2xl">
                            <ActivityIndicator size="large" color="#059669" />
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

                {rideState.status === 'idle' && (
                    <View className="absolute top-20 mx-5 self-center bg-emerald-600 p-5 rounded-3xl shadow-xl z-40 w-[90%]">
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Earnings</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-emerald-200 text-xl font-bold mr-1">Rs</Text>
                                    <Text className="text-white text-3xl font-black">
                                        {rideState.totalEarnings || 0}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-white/20 px-5 py-3 rounded-2xl items-center">
                                <Text className="text-emerald-50 text-[10px] font-bold uppercase tracking-wider mb-0.5">Pickups</Text>
                                <Text className="text-white text-2xl font-black">{rideState.totalOrders || 0}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {rideState.status === 'idle' && nearbycollectors.length > 0 && (
                    <View className="absolute bottom-6 left-0 right-0 z-40">
                        <View className="mx-5 mb-3 bg-white/90 px-4 py-2 rounded-full self-start shadow-sm border border-gray-100 backdrop-blur-md">
                            <Text className="text-gray-600 text-[11px] font-extrabold uppercase tracking-wider">
                                📍 Showing collectors within {ACCEPTANCE_RADIUS_KM}km
                            </Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            {nearbycollectors.map((collector) => (
                                <TouchableOpacity
                                    key={collector.id}
                                    activeOpacity={collector.available ? 0.8 : 1}
                                    onPress={() => collector.available && handleSelectcollector(collector)}
                                    style={{ width: 260, opacity: collector.available ? 1 : 0.6 }}
                                    disabled={!collector.available}
                                    className="bg-white rounded-3xl p-5 mr-4 shadow-md border border-gray-100"
                                >
                                    <View className="flex-row items-center justify-between mb-3 border-b border-gray-50 pb-3">
                                        <View className="flex-row items-center">
                                            <View className={`${collector.available ? 'bg-emerald-50' : 'bg-gray-100'} p-2.5 rounded-full mr-3`}>
                                                <User color={collector.available ? '#059669' : '#9ca3af'} size={18} />
                                            </View>
                                            <Text className={`font-extrabold text-base ${collector.available ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {collector.name}
                                            </Text>
                                        </View>
                                        <Text className={`${collector.available ? 'text-emerald-600' : 'text-gray-400'} text-xs font-black`}>
                                            {collector.distance.toFixed(1)} km
                                        </Text>
                                    </View>
                                    <View className="flex-row items-start pr-2">
                                        <MapPin color="#9ca3af" size={16} />
                                        <Text className={`ml-2 text-xs font-medium leading-tight flex-1 ${collector.available ? 'text-gray-600' : 'text-gray-400'}`} numberOfLines={2}>
                                            {collector.address}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={0.9}
                    className="absolute bottom-36 right-5 bg-gray-900 px-6 py-4 rounded-full shadow-2xl z-40 flex-row items-center"
                    onPress={() => bottomSheetRef.current?.present?.()}
                >
                    <Plus color="#fff" size={20} strokeWidth={3} />
                    <Text className="ml-2 text-white font-bold text-sm">New Request</Text>
                </TouchableOpacity>

                <BottomSheet ref={bottomSheetRef}>
                    <View className="bg-white w-full rounded-t-[32px] p-6 flex-1">
                        <Text className="text-2xl font-black text-gray-900 mb-5">Pickup Details</Text>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedcollector && (
                                <View className="flex-row items-center mb-6 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <User color="#059669" size={20} />
                                    <View className="ml-3">
                                        <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Selected Collector</Text>
                                        <Text className="font-extrabold text-gray-900">{selectedcollector.name}</Text>
                                    </View>
                                </View>
                            )}

                            <View className="mb-6">
                                <View className="flex-row justify-between items-end mb-3 px-1">
                                    <Text className="font-extrabold text-gray-800 text-lg">Items to Sell</Text>
                                    <Text className="text-emerald-600 font-black text-sm">{getTotalWeight()} Kg Total</Text>
                                </View>

                                {items.map((item) => {
                                    const category = categories.find(cat => cat.id === item.category);
                                    const ItemIcon = category?.icon || Package;
                                    return (
                                        <View key={item.id} className="mb-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                <View style={{ backgroundColor: category?.color + '15', padding: 10, borderRadius: 12 }}>
                                                    <ItemIcon size={20} color={category?.color || '#10b981'} />
                                                </View>
                                                <View className="ml-3 flex-1">
                                                    <Text className="font-extrabold text-gray-900">{category?.label}</Text>
                                                    <Text className="text-xs text-gray-500 font-bold">{item.weight} Kg {item.description && `• ${item.description}`}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => handleRemoveItem(item.id)} className="p-2.5 bg-red-50 rounded-xl ml-2">
                                                <Trash2 size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}

                                <TouchableOpacity
                                    onPress={() => setShowCategoryModal(true)}
                                    activeOpacity={0.7}
                                    className="mt-2 bg-gray-50 py-4 rounded-2xl flex-row items-center justify-center border border-dashed border-gray-300"
                                >
                                    <Plus size={20} color="#6b7280" strokeWidth={2.5} />
                                    <Text className="ml-2 text-gray-600 font-extrabold text-sm">Add Item</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                disabled={items.length === 0}
                                onPress={handleSendPickupRequest}
                                activeOpacity={0.8}
                                className={`rounded-2xl py-4 items-center justify-center flex-row shadow-sm mb-10 ${items.length > 0 ? 'bg-emerald-600' : 'bg-gray-300'}`}
                            >
                                <Send color="#fff" size={18} strokeWidth={2.5} />
                                <Text className="text-white font-extrabold text-base ml-2">Submit Request</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </BottomSheet>

                <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl">
                            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />
                            <Text className="text-2xl font-black text-gray-900 mb-6">Add Item</Text>

                            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Select Category</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {categories.map((category) => {
                                    const CategoryIcon = category.icon;
                                    const isSelected = newItem.category === category.id;
                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            activeOpacity={0.8}
                                            onPress={() => setNewItem({ ...newItem, category: category.id })}
                                            style={{ backgroundColor: isSelected ? category.color : '#f9fafb', borderColor: isSelected ? category.color : '#f3f4f6' }}
                                            className="px-4 py-3 rounded-2xl flex-row items-center border-2"
                                        >
                                            <CategoryIcon size={16} color={isSelected ? '#fff' : category.color} />
                                            <Text style={{ color: isSelected ? '#fff' : '#4b5563' }} className="ml-2 font-bold text-sm">
                                                {category.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Estimated Weight (Kg)</Text>
                            <TextInput
                                value={newItem.weight}
                                onChangeText={(text) => setNewItem({ ...newItem, weight: text })}
                                placeholder="e.g. 5"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 font-extrabold text-gray-900 text-base mb-5"
                            />

                            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Description (Optional)</Text>
                            <TextInput
                                value={newItem.description}
                                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                                placeholder="e.g. Plastic bottles, old books"
                                placeholderTextColor="#9ca3af"
                                className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 font-medium text-gray-800 text-base mb-8"
                            />

                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => setShowCategoryModal(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl">
                                    <Text className="text-gray-700 font-extrabold text-center text-base">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddItem} className="flex-1 bg-gray-900 py-4 rounded-2xl shadow-lg">
                                    <Text className="text-white font-extrabold text-center text-base">Save Item</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

export default CustomerRideScreen;