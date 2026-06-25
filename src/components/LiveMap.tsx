import { View, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { LiveMapProps } from '../types/map'
import { Home, Truck, MapPin, User, Package } from 'lucide-react-native'

interface MarkerStyle {
    markerContainer: ViewStyle;
    badge: ViewStyle;
    badgeText: TextStyle;
}

const markerStyles = StyleSheet.create<MarkerStyle>({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    badge: {
        position: 'absolute',
        bottom: -8,
        backgroundColor: '#ef4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#ffffff',
        zIndex: 10,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
    }
});

const LiveMap: React.FC<LiveMapProps> = ({ coordinates, pickupLocation, dropoffLocation, nearbyUsers, acceptanceRadius }) => {
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [directionsError, setDirectionsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef<MapView>(null);

    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { role?: string } };
    const role = userdata?.role || 'customer';
    const routeColor = role === 'collector' ? '#d97706' : '#059669'; 

    useEffect(() => {
        const fetchOSRMRoute = async (p: { latitude: number; longitude: number }, d: { latitude: number; longitude: number }) => {
            setIsLoading(true);
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${p.longitude},${p.latitude};${d.longitude},${d.latitude}?overview=full&geometries=geojson`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.code === 'Ok') {
                    const coords = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                        latitude: coord[1],
                        longitude: coord[0]
                    }));
                    setRouteCoordinates(coords);
                    setDirectionsError(false);
                } else {
                    setDirectionsError(true);
                }
            } catch (error) {
                setDirectionsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (pickupLocation && dropoffLocation) {
            fetchOSRMRoute(pickupLocation, dropoffLocation);
        } else if (coordinates && pickupLocation) {
             fetchOSRMRoute(coordinates, pickupLocation);
        } else {
            setRouteCoordinates([]);
            setDirectionsError(false);
        }
    }, [pickupLocation, dropoffLocation, coordinates]);

    

    useEffect(() => {
        if (mapRef.current && pickupLocation && dropoffLocation) {
            mapRef.current.fitToCoordinates([pickupLocation, dropoffLocation], {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true,
            });
        } else if (mapRef.current && coordinates && pickupLocation) {
             mapRef.current.fitToCoordinates([coordinates, pickupLocation], {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true,
            });
        } else if (mapRef.current && coordinates) {
            mapRef.current.animateToRegion({
                ...coordinates,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [pickupLocation, dropoffLocation, coordinates]);

    const getMapRegion = () => {
        const center = coordinates ?? (pickupLocation ?? { latitude: 31.5204, longitude: 74.3587 }); 
        return {
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
    };

    if (isLoading && !coordinates && !pickupLocation) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f8fafc]">
                <ActivityIndicator size="large" color={routeColor} />
            </View>
        );
    }

    return (
        <View className='flex-1 bg-[#f8fafc]'>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={getMapRegion()}
                showsUserLocation={false} 
                showsMyLocationButton={false}
                followsUserLocation={false}
            >
                {coordinates && (
                    <Marker
                        coordinate={coordinates}
                        title="Aapki Jagah"
                        description="Mojooda Location"
                        zIndex={2}
                    >
                        <View style={[markerStyles.markerContainer, { backgroundColor: role === 'customer' ? '#059669' : '#d97706' }]}>
                            <Home size={20} color="#ffffff" strokeWidth={2.5} />
                        </View>
                    </Marker>
                )}

                {pickupLocation && (!coordinates || (coordinates.latitude !== pickupLocation.latitude && coordinates.longitude !== pickupLocation.longitude)) && (
                    <Marker coordinate={pickupLocation} title="Pickup Pata" zIndex={1}>
                        <View style={[markerStyles.markerContainer, { backgroundColor: '#059669' }]}>
                            <Package size={20} color="#ffffff" strokeWidth={2.5} />
                        </View>
                    </Marker>
                )}

                {dropoffLocation && (
                    <Marker coordinate={dropoffLocation} title="Customer Location" zIndex={1}>
                        <View style={[markerStyles.markerContainer, { backgroundColor: '#d97706' }]}>
                            <User size={20} color="#ffffff" strokeWidth={2.5} />
                        </View>
                    </Marker>
                )}

                {nearbyUsers && nearbyUsers.map((user) => (
                    <Marker
                        key={user.id}
                        coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                        title={user.name}
                        description={`${user.distance.toFixed(1)} km door - ${user.address}`}
                        opacity={user.available === false ? 0.7 : 1}
                        zIndex={0}
                    >
                        <View style={[markerStyles.markerContainer, { backgroundColor: user.available ? '#d97706' : '#94a3b8' }]}>
                            <Truck size={20} color="#ffffff" strokeWidth={2.5} />
                            {user.available === false && (
                                <View style={markerStyles.badge}>
                                    <Text style={markerStyles.badgeText}>BZY</Text>
                                </View>
                            )}
                        </View>
                    </Marker>
                ))}

                {acceptanceRadius && coordinates && (
                    <Circle
                        center={coordinates}
                        radius={acceptanceRadius}
                        fillColor={role === 'customer' ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)"}
                        strokeColor={role === 'customer' ? "#10b981" : "#f59e0b"}
                        strokeWidth={2}
                    />
                )}

                {routeCoordinates.length > 0 && (
                    <>
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={8}
                            strokeColor="#00000025" 
                        />
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={4}
                            strokeColor={routeColor}
                        />
                    </>
                )}

                {directionsError && pickupLocation && dropoffLocation && (
                    <Polyline
                        coordinates={[pickupLocation, dropoffLocation]}
                        strokeWidth={4}
                        strokeColor="#ef4444" 
                        lineDashPattern={[10, 5]}
                    />
                )}
            </MapView>
        </View>
    )
}

export default LiveMap