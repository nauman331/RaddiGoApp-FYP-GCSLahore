import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { createOrder, updatecustomerLocation, setRideStatus, resetRide, RaddiItem, addItem, removeItem } from '../../store/slices/rideSlice'
import LiveMap from '../../components/LiveMap'
import Header from '../../components/Header'
import BottomSheet from '../../components/BottomSheet'
import { getCurrentLocation, getLocationPermission } from '../../utils/getPermissions'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import socketService from '../../services/socketService'
import { MapPin, Navigation, Package, User, DollarSign, TrendingUp, FileText, Smartphone, Boxes, Wine, Layers, Plus, Trash2, Send } from 'lucide-react-native'

interface Nearbycollector {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    distance: number;
    available: boolean;
}

const customerRideScreen = () => {
    const dispatch = useDispatch();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: string; name?: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);
    const rideState = useSelector((state: RootState) => state.ride);

    // Acceptance radius in kilometers (orders accepted only within this range)
    const ACCEPTANCE_RADIUS_KM = 5;
    const ACCEPTANCE_RADIUS_METERS = ACCEPTANCE_RADIUS_KM * 1000;

    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [nearbycollectors, setNearbycollectors] = useState<Nearbycollector[]>([]);
    const [selectedcollector, setSelectedcollector] = useState<Nearbycollector | null>(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [items, setItems] = useState<RaddiItem[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newItem, setNewItem] = useState<{ category: RaddiItem['category'] | null; weight: string; description: string }>({
        category: null,
        weight: '',
        description: '',
    });
    const bottomSheetRef = useRef<any>(null);

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

    // Helper function to calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Dummy nearby collectors for testing (closer locations within ~5km)
    const getDummycollectors = (customerLat: number, customerLon: number): Nearbycollector[] => {
        const collectors = [
            {
                id: 'collector-1',
                name: 'Ahmed Hassan',
                latitude: customerLat + 0.02, // ~2.2 km north
                longitude: customerLon + 0.01,
                address: '123 Main Street, Gulberg, Lahore',
            },
            {
                id: 'collector-2',
                name: 'Sara Ali',
                latitude: customerLat - 0.015, // ~1.7 km south
                longitude: customerLon + 0.02,
                address: '45 Garden Town, Lahore',
            },
            {
                id: 'collector-3',
                name: 'Usman Khan',
                latitude: customerLat + 0.01, // ~1.1 km northeast
                longitude: customerLon - 0.015,
                address: '78 Model Town, Lahore',
            },
            {
                id: 'collector-4',
                name: 'Fatima Raza',
                latitude: customerLat + 0.05, // ~5.6 km north (outside zone)
                longitude: customerLon + 0.03,
                address: '92 DHA Phase 5, Lahore',
            },
        ];

        // Calculate actual distances and availability based on acceptance radius
        return collectors.map(collector => {
            const distance = calculateDistance(customerLat, customerLon, collector.latitude, collector.longitude);
            return {
                ...collector,
                distance: parseFloat(distance.toFixed(1)),
                available: distance <= ACCEPTANCE_RADIUS_KM,
            };
        });
    };

    // Get and update current location
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
                dispatch(updatecustomerLocation(location));
            } catch (error) {
                console.error('Location error:', error);
            } finally {
                setLocating(false);
            }
        };
        locationHandler();
    }, []);

    // Load nearby collectors (simulate for now)
    useEffect(() => {
        if (currentLocation && rideState.status === 'idle') {
            const collectors = getDummycollectors(currentLocation.latitude, currentLocation.longitude);
            setNearbycollectors(collectors);
        }
    }, [currentLocation, rideState.status]);
    useEffect(() => {

        socketService.on('nearbycollectorsUpdate', (data: Nearbycollector[]) => {
            setNearbycollectors(data);
        });

        socketService.on('pickupRequestAccepted', (data: any) => {
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Request Accepted!',
                textBody: `${data.collectorName} accepted your pickup request.`,
            });
            dispatch(setRideStatus('accepted'));
        });

        socketService.on('pickupRequestRejected', (data: any) => {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Request Rejected',
                textBody: `${data.collectorName} rejected your pickup request.`,
            });
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
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Please select category and enter weight.',
            });
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

        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Item Added',
            textBody: `${newItem.category} item added successfully.`,
        });
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const getTotalWeight = () => {
        return items.reduce((sum, item) => sum + parseFloat(item.weight || '0'), 0).toFixed(1);
    };

    const handleSendPickupRequest = () => {
        if (!selectedcollector) return;

        if (items.length === 0) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Please add at least one item.',
            });
            return;
        }

        const orderId = Date.now().toString();
        const totalWeight = getTotalWeight();

        dispatch(createOrder({
            orderId,
            pickupLocation: currentLocation!,
            pickupAddress: selectedcollector.address,
            approximateWeight: totalWeight,
            collectorId: selectedcollector.id,
            items,
        }));

        bottomSheetRef.current?.close?.();
        setItems([]);
        setSelectedcollector(null);

        Toast.show({
            type: ALERT_TYPE.INFO,
            title: 'Request Sent',
            textBody: `Pickup request sent to ${selectedcollector.name}`,
        });

        // Simulate request acceptance after 3 seconds (for testing)
        setTimeout(() => {
            dispatch(setRideStatus('accepted'));
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Request Accepted!',
                textBody: `${selectedcollector.name} accepted your pickup request.`,
            });
        }, 3000);

        // TODO: Uncomment when backend is ready
        // if (isConnected) {
        //     socketService.emit('sendPickupRequest', {
        //         orderId,
        //         customerId: userdata?.id,
        //         customerName: userdata?.name || 'customer',
        //         collectorId: selectedcollector.id,
        //         items,
        //         totalWeight,
        //         customerLocation: currentLocation,
        //     });
        // }
    };

    const getStatusInfo = () => {
        switch (rideState.status) {
            case 'idle':
                return { text: `${nearbycollectors.length} collectors Nearby`, color: '#059669', bgColor: '#d1fae5' };
            case 'pending':
                return { text: 'Waiting for collector response...', color: '#f59e0b', bgColor: '#fef3c7' };
            case 'accepted':
                return { text: 'collector Accepted - Waiting for pickup', color: '#059669', bgColor: '#d1fae5' };
            case 'completed':
                return { text: 'Pickup Completed', color: '#10b981', bgColor: '#d1fae5' };
            default:
                return { text: 'Searching for collectors...', color: '#059669', bgColor: '#d1fae5' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={{ flex: 1 }}>
            <Header />

            <LiveMap
                coordinates={currentLocation}
                pickupLocation={null}
                dropoffLocation={null}
                nearbyUsers={nearbycollectors}
                acceptanceRadius={ACCEPTANCE_RADIUS_METERS}
            />

            {locating && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 60, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text className="text-white mt-2 font-semibold">Getting your location...</Text>
                </View>
            )}

            {/* Status Bar */}
            <View className="absolute top-20 self-center px-6 py-3 rounded-full shadow-lg z-50" style={{ backgroundColor: statusInfo.bgColor }}>
                <Text className="font-bold" style={{ color: statusInfo.color }}>
                    {statusInfo.text}
                </Text>
            </View>

            {/* Earnings Stats Card */}
            {rideState.status === 'idle' && (
                <View className="absolute top-36 mx-4 self-center bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-2xl shadow-xl z-50 w-11/12">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-emerald-100 text-sm font-semibold">Total Earnings</Text>
                            <View className="flex-row items-center mt-1">
                                <DollarSign color="#fff" size={28} strokeWidth={3} />
                                <Text className="text-white text-3xl font-bold ml-1">
                                    {rideState.totalEarnings || 0}
                                </Text>
                            </View>
                        </View>
                        <View className="bg-emerald-500 px-4 py-3 rounded-xl">
                            <Text className="text-emerald-100 text-xs font-semibold">Pickups</Text>
                            <Text className="text-white text-2xl font-bold text-center">{rideState.totalOrders || 0}</Text>
                        </View>
                    </View>
                    {rideState.totalOrders > 0 && (
                        <View className="mt-3 pt-3 border-t border-emerald-500 flex-row items-center">
                            <TrendingUp color="#d1fae5" size={16} />
                            <Text className="text-emerald-100 text-xs ml-2">
                                Avg: PKR {Math.round((rideState.totalEarnings || 0) / rideState.totalOrders)} per pickup
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Nearby collectors List */}
            {rideState.status === 'idle' && nearbycollectors.length > 0 && (
                <View className="absolute bottom-28 left-0 right-0 z-50">
                    {/* Blue Zone Info Badge */}
                    <View className="mx-4 mb-2 bg-blue-500 px-4 py-2 rounded-full self-start shadow-md">
                        <Text className="text-white text-xs font-bold">
                            🔵 Acceptance Zone: {ACCEPTANCE_RADIUS_KM}km radius
                        </Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {nearbycollectors.map((collector) => (
                            <TouchableOpacity
                                key={collector.id}
                                activeOpacity={collector.available ? 0.8 : 1}
                                onPress={() => collector.available && handleSelectcollector(collector)}
                                className={`rounded-2xl p-4 mr-3 shadow-lg ${collector.available ? 'bg-white' : 'bg-gray-100'}`}
                                style={{ width: 280, opacity: collector.available ? 1 : 0.6 }}
                                disabled={!collector.available}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <View className={`${collector.available ? 'bg-emerald-100' : 'bg-gray-200'} p-2 rounded-full`}>
                                            <User color={collector.available ? '#059669' : '#9ca3af'} size={20} />
                                        </View>
                                        <Text className={`ml-2 font-bold text-base ${collector.available ? 'text-gray-800' : 'text-gray-500'}`}>
                                            {collector.name}
                                        </Text>
                                    </View>
                                    <View className={`${collector.available ? 'bg-emerald-50' : 'bg-red-50'} px-2 py-1 rounded-full`}>
                                        <Text className={`${collector.available ? 'text-emerald-700' : 'text-red-600'} text-xs font-bold`}>
                                            {collector.distance.toFixed(1)} km
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-start mt-2">
                                    <MapPin color="#6b7280" size={14} style={{ marginTop: 2 }} />
                                    <Text className={`ml-2 text-xs flex-1 ${collector.available ? 'text-gray-600' : 'text-gray-400'}`} numberOfLines={2}>
                                        {collector.address}
                                    </Text>
                                </View>
                                {collector.available ? (
                                    <View className="mt-3 flex-row items-center justify-center bg-emerald-600 py-2 rounded-lg">
                                        <Send color="#fff" size={16} />
                                        <Text className="ml-2 text-white font-bold text-sm">Send Pickup Request</Text>
                                    </View>
                                ) : (
                                    <View className="mt-3 flex-row items-center justify-center bg-gray-300 py-2 rounded-lg">
                                        <Text className="text-gray-600 font-bold text-xs">Out of Range ({ACCEPTANCE_RADIUS_KM}km)</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Pickup Request Form Bottom Sheet */}
            <BottomSheet ref={bottomSheetRef}>
                <View className="bg-white w-full rounded-2xl p-4 flex-1">
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="mt-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                            <Text className="text-emerald-700 font-bold text-lg mb-2">Send Pickup Request</Text>
                            {selectedcollector && (
                                <View className="flex-row items-center mb-4 pb-3 border-b border-emerald-200">
                                    <User color="#059669" size={18} />
                                    <Text className="ml-2 font-bold text-gray-800">
                                        to {selectedcollector.name}
                                    </Text>
                                </View>
                            )}

                            {/* Items Section */}
                            <View className="mt-2">
                                <View className="flex-row justify-between items-center">
                                    <Text className="font-semibold text-gray-700">Items ({items.length})</Text>
                                    <Text className="text-emerald-600 font-bold">Total: {getTotalWeight()} Kg</Text>
                                </View>

                                {/* Items List */}
                                {items.map((item) => {
                                    const category = categories.find(cat => cat.id === item.category);
                                    const ItemIcon = category?.icon || Package;
                                    return (
                                        <View key={item.id} className="mt-2 bg-white p-3 rounded-lg border border-emerald-200 flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                <View style={{ backgroundColor: category?.color + '20', padding: 8, borderRadius: 8 }}>
                                                    <ItemIcon size={18} color={category?.color || '#10b981'} />
                                                </View>
                                                <View className="ml-3 flex-1">
                                                    <Text className="font-bold text-gray-800">{category?.label}</Text>
                                                    <Text className="text-xs text-gray-500">{item.weight} Kg</Text>
                                                    {item.description && (
                                                        <Text className="text-xs text-gray-400 mt-0.5">{item.description}</Text>
                                                    )}
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveItem(item.id)}
                                                className="p-2 bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}

                                {/* Add Item Button */}
                                <TouchableOpacity
                                    onPress={() => setShowCategoryModal(true)}
                                    className="mt-3 bg-emerald-100 py-3 rounded-lg flex-row items-center justify-center border border-dashed border-emerald-400"
                                >
                                    <Plus size={20} color="#059669" strokeWidth={2.5} />
                                    <Text className="ml-2 text-emerald-700 font-bold">Add Item</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                disabled={items.length === 0}
                                onPress={handleSendPickupRequest}
                                className={`mt-6 rounded-full h-12 items-center justify-center flex-row ${items.length > 0 ? 'bg-emerald-600' : 'bg-gray-400'
                                    }`}
                            >
                                <Send color="#fff" size={20} strokeWidth={2} />
                                <Text className="text-white font-bold text-lg ml-2">
                                    Send Pickup Request
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </BottomSheet>

            {/* Category Selection Modal */}
            <Modal
                visible={showCategoryModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
                        <Text className="text-2xl font-bold text-emerald-600 mb-4">Add Item</Text>

                        {/* Category Selection */}
                        <Text className="font-semibold text-gray-700 mb-2">Category</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {categories.map((category) => {
                                const CategoryIcon = category.icon;
                                const isSelected = newItem.category === category.id;
                                return (
                                    <TouchableOpacity
                                        key={category.id}
                                        onPress={() => setNewItem({ ...newItem, category: category.id })}
                                        style={{
                                            backgroundColor: isSelected ? category.color : '#f3f4f6',
                                            borderWidth: 2,
                                            borderColor: isSelected ? category.color : '#e5e7eb',
                                        }}
                                        className="px-4 py-3 rounded-xl flex-row items-center"
                                    >
                                        <CategoryIcon size={18} color={isSelected ? '#fff' : category.color} />
                                        <Text
                                            style={{ color: isSelected ? '#fff' : '#374151' }}
                                            className="ml-2 font-semibold"
                                        >
                                            {category.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Weight Input */}
                        <Text className="font-semibold text-gray-700 mb-2">Weight (Kg)</Text>
                        <View className="bg-gray-50 px-4 py-1 rounded-lg border border-gray-300 h-14 mb-4">
                            <TextInput
                                value={newItem.weight}
                                onChangeText={(text) => setNewItem({ ...newItem, weight: text })}
                                placeholder="Enter weight in kg"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                className="flex-1 h-full font-bold text-emerald-600"
                            />
                        </View>

                        {/* Description Input */}
                        <Text className="font-semibold text-gray-700 mb-2">Description (Optional)</Text>
                        <View className="bg-gray-50 px-4 py-1 rounded-lg border border-gray-300 h-14 mb-6">
                            <TextInput
                                value={newItem.description}
                                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                                placeholder="e.g., Old newspapers, plastic bottles"
                                placeholderTextColor="#9ca3af"
                                className="flex-1 h-full text-gray-800"
                            />
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCategoryModal(false);
                                    setNewItem({ category: null, weight: '', description: '' });
                                }}
                                className="flex-1 bg-gray-200 py-4 rounded-xl"
                            >
                                <Text className="text-gray-700 font-bold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddItem}
                                className="flex-1 bg-emerald-600 py-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center">Add Item</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default customerRideScreen;
