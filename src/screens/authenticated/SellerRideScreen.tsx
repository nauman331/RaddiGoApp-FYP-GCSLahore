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
import { MapPin, Package, User, FileText, Smartphone, Boxes, Wine, Layers, Plus, Trash2, Send } from 'lucide-react-native'

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
        { id: 'paper', label: 'Kaghaz (Paper)', icon: FileText, color: '#3b82f6' },
        { id: 'plastic', label: 'Plastic', icon: Layers, color: '#f59e0b' },
        { id: 'metal', label: 'Loha / Metal', icon: Package, color: '#64748b' },
        { id: 'electronics', label: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
        { id: 'cardboard', label: 'Gatta (Cardboard)', icon: Boxes, color: '#d97706' },
        { id: 'glass', label: 'Sheesha (Glass)', icon: Wine, color: '#10b981' },
        { id: 'other', label: 'Deegar (Other)', icon: MapPin, color: '#ef4444' },
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
        const fetchLocationFast = async () => {
            try {
                setLocating(true);
                const granted = await getLocationPermission();
                if (!granted) {
                    Toast.show({ type: ALERT_TYPE.WARNING, title: 'Permission Chahiye', textBody: 'Location ki ijazat zaroori hai.' });
                    setCurrentLocation(FALLBACK_LOCATION);
                    dispatch(updatecustomerLocation(FALLBACK_LOCATION));
                    return;
                }

                const locationPromise = getCurrentLocation();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
                
                const position = await Promise.race([locationPromise, timeoutPromise]) as any;
                const { latitude, longitude } = position.coords;
                const location = { latitude, longitude };
                
                setCurrentLocation(location);
                dispatch(updatecustomerLocation(location));
            } catch (error: any) {
                console.log('Fast Location Fallback Triggered');
                setCurrentLocation(FALLBACK_LOCATION);
                dispatch(updatecustomerLocation(FALLBACK_LOCATION));
            } finally {
                setLocating(false);
            }
        };
        fetchLocationFast();
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
                Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Request Chali Gayi', textBody: `Aapki request ${data.driverCount} collectors ko bhej di gayi hai.` });
            } else {
                Toast.show({ type: ALERT_TYPE.WARNING, title: 'Koi Collector Nahi', textBody: data.message || 'Is waqt koi qareebi collector nahi hai.' });
                dispatch(resetRide());
            }
        });

        socketService.on('rideOrderAccepted', (data: any) => {
            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Manzoor Ho Gayi!', textBody: `${data.collectorName || 'Collector'} ne aapki request qabool kar li hai.` });
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
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Cancel Ho Gayi', textBody: `${data.collectorName} ne request cancel kar di.` });
            dispatch(resetRide());
        });

        return () => {
            socketService.off('nearbycollectorsUpdate');
            socketService.off('orderCreated');
            socketService.off('rideOrderAccepted');
            socketService.off('driverLocationUpdate');
            socketService.off('pickupRequestRejected');
        };
    }, []);

    const handleSelectcollector = (collector: Nearbycollector) => {
        setSelectedcollector(collector);
        bottomSheetRef.current?.present?.();
    };

    const handleAddItem = () => {
        if (!newItem.category || !newItem.weight) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Nakam', textBody: 'Category aur wazan darj karna zaroori hai.' });
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
    };

    const handleRemoveItem = (itemId: string) => { setItems(items.filter(item => item.id !== itemId)); };

    const getTotalWeight = () => items.reduce((sum, item) => sum + parseFloat(item.weight || '0'), 0).toFixed(1);

    const handleSendPickupRequest = () => {
        if (items.length === 0) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Nakam', textBody: 'Kam az kam ek saman shamil karein.' });
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

        if (isConnected) {
            const payload: any = {
                customerId: Number(userdata?.id) || userdata?.id,
                customerName: userdata?.name || 'Customer',
                pickupLatitude: currentLocation?.latitude,
                pickupLongitude: currentLocation?.longitude,
                pickupAddress: selectedcollector?.address || '',
                approximateRaddiInKg: totalWeight,
                items,
            };
            if (selectedcollector?.id) payload.collectorId = selectedcollector.id;
            socketService.emit('makeRaddiOrder', payload);
        } else {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Internet Masla', textBody: 'Aap is waqt offline hain.' });
        }
    };

    const getStatusInfo = () => {
        switch (rideState.status) {
            case 'idle': return { text: `${nearbycollectors.length} Qareebi Collectors`, color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            case 'pending': return { text: 'Jawab ka intezar...', color: '#d97706', bgColor: '#fef3c7', border: '#fde68a' };
            case 'accepted': return { text: 'Collector Manzoor', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            case 'completed': return { text: 'Pickup Pura Hua', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
            default: return { text: 'Dhoondh rahay hain...', color: '#059669', bgColor: '#ecfdf5', border: '#a7f3d0' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
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
                    <View className="absolute inset-0 justify-center items-center bg-black/20 z-50 backdrop-blur-sm">
                        <View className="bg-white p-6 rounded-[28px] items-center shadow-2xl border border-gray-100">
                            <ActivityIndicator size="large" color="#059669" />
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

                {rideState.status === 'idle' && (
                    <View className="absolute top-28 mx-5 self-center bg-[#059669] p-6 rounded-[32px] shadow-xl shadow-emerald-900/20 z-40 w-[90%] overflow-hidden">
                        <View className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full" />
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-emerald-100 text-[11px] font-extrabold uppercase tracking-widest mb-1.5">Aapki Kamai</Text>
                                <View className="flex-row items-end">
                                    <Text className="text-emerald-200 text-xl font-bold mr-1.5 mb-0.5">Rs</Text>
                                    <Text className="text-white text-4xl font-black tracking-tight">
                                        {rideState.totalEarnings || 0}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-black/10 px-5 py-3.5 rounded-[20px] items-center backdrop-blur-md">
                                <Text className="text-white text-2xl font-black">{rideState.totalOrders || 0}</Text>
                                <Text className="text-emerald-100 text-[10px] font-extrabold uppercase tracking-widest mt-1">Pickups</Text>
                            </View>
                        </View>
                    </View>
                )}

                {rideState.status === 'idle' && nearbycollectors.length > 0 && (
                    <View className="absolute bottom-6 left-0 right-0 z-40">
                        <View className="mx-5 mb-4 bg-white/90 px-5 py-2.5 rounded-full self-start shadow-sm border border-gray-100 backdrop-blur-md flex-row items-center">
                            <MapPin size={14} color="#059669" strokeWidth={3} />
                            <Text className="text-gray-700 text-[11px] font-extrabold uppercase tracking-widest ml-2">
                                {ACCEPTANCE_RADIUS_KM}km ke andar collectors
                            </Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            {nearbycollectors.map((collector) => (
                                <TouchableOpacity
                                    key={collector.id}
                                    activeOpacity={collector.available ? 0.9 : 1}
                                    onPress={() => collector.available && handleSelectcollector(collector)}
                                    style={{ width: 280, opacity: collector.available ? 1 : 0.6 }}
                                    disabled={!collector.available}
                                    className="bg-white rounded-[28px] p-5 mr-4 shadow-lg shadow-black/5 border border-[#f1f5f9]"
                                >
                                    <View className="flex-row items-center justify-between mb-4 border-b border-[#f1f5f9] pb-4">
                                        <View className="flex-row items-center">
                                            <View className={`${collector.available ? 'bg-emerald-50' : 'bg-[#f1f5f9]'} p-3 rounded-[16px] mr-3`}>
                                                <User color={collector.available ? '#059669' : '#94a3b8'} size={20} strokeWidth={2.5} />
                                            </View>
                                            <Text className={`font-black text-lg ${collector.available ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {collector.name}
                                            </Text>
                                        </View>
                                        <Text className={`${collector.available ? 'text-emerald-600' : 'text-gray-400'} text-xs font-black bg-emerald-50 px-2 py-1 rounded-md`}>
                                            {collector.distance.toFixed(1)} km
                                        </Text>
                                    </View>
                                    <View className="flex-row items-start pr-2">
                                        <MapPin color="#94a3b8" size={16} strokeWidth={2.5} className="mt-0.5" />
                                        <Text className={`ml-2 text-xs font-bold leading-relaxed flex-1 ${collector.available ? 'text-gray-600' : 'text-gray-400'}`} numberOfLines={2}>
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
                    className="absolute bottom-44 right-5 bg-gray-900 pl-5 pr-6 py-4 rounded-[20px] shadow-2xl z-40 flex-row items-center"
                    onPress={() => bottomSheetRef.current?.present?.()}
                >
                    <Plus color="#ffffff" size={20} strokeWidth={3} />
                    <Text className="ml-2.5 text-white font-black text-sm tracking-wide">Nayi Request</Text>
                </TouchableOpacity>

                <BottomSheet ref={bottomSheetRef}>
                    <View className="bg-white w-full rounded-t-[40px] p-6 flex-1">
                        <Text className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Pickup ki Tafseel</Text>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedcollector && (
                                <View className="flex-row items-center mb-6 bg-emerald-50 p-4 rounded-[24px] border border-emerald-100">
                                    <View className="bg-white p-2.5 rounded-[14px] mr-3 shadow-sm">
                                        <User color="#059669" size={20} strokeWidth={2.5} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-0.5">Muntakhib Collector</Text>
                                        <Text className="font-black text-gray-900 text-base">{selectedcollector.name}</Text>
                                    </View>
                                </View>
                            )}

                            <View className="mb-6">
                                <View className="flex-row justify-between items-end mb-4 px-1">
                                    <Text className="font-black text-gray-900 text-xl">Bechne Wala Saman</Text>
                                    <View className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                        <Text className="text-emerald-700 font-black text-xs">{getTotalWeight()} Kg Total</Text>
                                    </View>
                                </View>

                                {items.map((item) => {
                                    const category = categories.find(cat => cat.id === item.category);
                                    const ItemIcon = category?.icon || Package;
                                    return (
                                        <View key={item.id} className="mb-3 bg-white p-3.5 rounded-[20px] border border-[#f1f5f9] shadow-sm flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                <View style={{ backgroundColor: category?.color + '15' }} className="p-3 rounded-[14px]">
                                                    <ItemIcon size={20} color={category?.color || '#10b981'} strokeWidth={2.5} />
                                                </View>
                                                <View className="ml-3 flex-1">
                                                    <Text className="font-black text-gray-900 text-base mb-0.5">{category?.label}</Text>
                                                    <Text className="text-xs text-gray-500 font-bold">{item.weight} Kg {item.description && `• ${item.description}`}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => handleRemoveItem(item.id)} className="p-3 bg-red-50 rounded-[14px] ml-2">
                                                <Trash2 size={18} color="#ef4444" strokeWidth={2.5} />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}

                                <TouchableOpacity
                                    onPress={() => setShowCategoryModal(true)}
                                    activeOpacity={0.7}
                                    className="mt-2 bg-[#f8fafc] py-4 rounded-[20px] flex-row items-center justify-center border-2 border-dashed border-[#e2e8f0]"
                                >
                                    <Plus size={20} color="#64748b" strokeWidth={3} />
                                    <Text className="ml-2 text-gray-600 font-black text-sm tracking-wide">Saman Shamil Karein</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                disabled={items.length === 0}
                                onPress={handleSendPickupRequest}
                                activeOpacity={0.85}
                                className={`rounded-[24px] py-4 items-center justify-center flex-row shadow-lg mb-10 ${items.length > 0 ? 'bg-[#059669]' : 'bg-[#e2e8f0] shadow-none'}`}
                            >
                                <Send color={items.length > 0 ? "#ffffff" : "#94a3b8"} size={20} strokeWidth={2.5} />
                                <Text className={`font-black text-lg ml-2.5 ${items.length > 0 ? 'text-white' : 'text-gray-400'}`}>
                                    Request Bhejein
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </BottomSheet>

                <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                            <View className="w-12 h-1.5 bg-[#e2e8f0] rounded-full self-center mb-6" />
                            <Text className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Naya Saman</Text>

                            <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 px-1">Kism (Category)</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {categories.map((category) => {
                                    const CategoryIcon = category.icon;
                                    const isSelected = newItem.category === category.id;
                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            activeOpacity={0.8}
                                            onPress={() => setNewItem({ ...newItem, category: category.id })}
                                            style={{ backgroundColor: isSelected ? category.color : '#f8fafc', borderColor: isSelected ? category.color : '#f1f5f9' }}
                                            className="px-4 py-3 rounded-[16px] flex-row items-center border-[2px]"
                                        >
                                            <CategoryIcon size={16} color={isSelected ? '#ffffff' : category.color} strokeWidth={2.5} />
                                            <Text style={{ color: isSelected ? '#ffffff' : '#475569' }} className="ml-2 font-black text-sm">
                                                {category.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-1">Andazan Wazan (Kg)</Text>
                            <TextInput
                                value={newItem.weight}
                                onChangeText={(text) => setNewItem({ ...newItem, weight: text })}
                                placeholder="Misaal: 5"
                                placeholderTextColor="#cbd5e1"
                                keyboardType="numeric"
                                className="bg-[#f8fafc] px-5 h-[56px] rounded-[20px] border-[2px] border-[#f1f5f9] font-black text-gray-900 text-lg mb-5 shadow-sm"
                            />

                            <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-1">Tafseel (Optional)</Text>
                            <TextInput
                                value={newItem.description}
                                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                                placeholder="Misaal: Purani kitabein, plastic bottles"
                                placeholderTextColor="#cbd5e1"
                                className="bg-[#f8fafc] px-5 h-[56px] rounded-[20px] border-[2px] border-[#f1f5f9] font-bold text-gray-800 text-base mb-8 shadow-sm"
                            />

                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => setShowCategoryModal(false)} className="flex-1 bg-[#f1f5f9] py-4 rounded-[20px] items-center border border-[#e2e8f0]">
                                    <Text className="text-gray-700 font-black text-base">Wapis</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddItem} className="flex-1 bg-gray-900 py-4 rounded-[20px] items-center shadow-lg">
                                    <Text className="text-white font-black text-base">Save Karein</Text>
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