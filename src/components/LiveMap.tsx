import { View, Image, Text, StyleSheet, ImageStyle, ViewStyle, TextStyle } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Loading from './Loading';
import { LiveMapProps } from '../types/map';
import riderIcon from '../assets/rider-icon.png';
import scrapHomeIcon from '../assets/scrap-home.png';

// Type definitions for strictly typed StyleSheet, including specific literal types for alignment properties
interface MarkerStyle {
    markerWrapper: ViewStyle;
    markerImage: ImageStyle;
    statusBadge: ViewStyle;
    statusText: TextStyle;
}

const markerStyles = StyleSheet.create<MarkerStyle>({
    markerWrapper: {
        backgroundColor: 'white',
        borderRadius: 22,
        padding: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // for Android depth
        borderWidth: 1.5,
        borderColor: '#f0f0f0', // subtle inner ring color
    },
    markerImage: {
        width: 40,
        height: 40,
        borderRadius: 20, // circular icons
        resizeMode: 'contain',
    },
    statusBadge: {
        position: 'absolute',
        backgroundColor: '#ef4444', // prominent red
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        bottom: -8,
        zIndex: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});

// Custom map theme logic could go here and be referenced, but assuming it's correctly embedded or retrieved

const LiveMap: React.FC<LiveMapProps> = ({ coordinates, pickupLocation, dropoffLocation, nearbyUsers, acceptanceRadius }) => {
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [directionsError, setDirectionsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef<MapView>(null);

    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { role?: string } };
    const role = userdata?.role || 'customer';
    const routeColor = role === 'collector' ? '#d97706' : '#10b981'; // amber or emerald

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
                    console.log('OSRM Error:', data.code);
                    setDirectionsError(true);
                }
            } catch (error) {
                console.error('OSRM Fetch Error:', error);
                setDirectionsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (pickupLocation && dropoffLocation) {
            fetchOSRMRoute(pickupLocation, dropoffLocation);
        } else if (coordinates && pickupLocation) {
             // Handle On-Way phase logic if current coords are available
             fetchOSRMRoute(coordinates, pickupLocation);
        } else {
            setRouteCoordinates([]);
            setDirectionsError(false);
        }
    }, [pickupLocation, dropoffLocation, coordinates]); // Ensure current coordinates trigger route update if applicable

    // Fit map to show all markers/route
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
        const center = coordinates ?? (pickupLocation ?? { latitude: 24.8607, longitude: 67.0011 }); // Lahore coordinates or default Karachi
        return {
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
    };

    if (isLoading && !coordinates && !pickupLocation) {
        return <Loading />
    }

    return (
        <View className='flex-1'>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={getMapRegion()}
                showsUserLocation
                showsMyLocationButton
                followsUserLocation={!pickupLocation && !dropoffLocation}
            >
                {/* Current User Location - Robust Premium Framing */}
                {coordinates && (
                    <Marker
                        coordinate={coordinates}
                        title="Your Location"
                        description="Current location"
                    >
                        <View style={markerStyles.markerWrapper}>
                            <Image source={scrapHomeIcon} style={markerStyles.markerImage} />
                        </View>
                    </Marker>
                )}

                {/* Pickup Location - Robust Premium Framing */}
                {pickupLocation && !coordinates && (
                    <Marker coordinate={pickupLocation} title="Pickup Location">
                        <View style={markerStyles.markerWrapper}>
                            <Image source={scrapHomeIcon} style={markerStyles.markerImage} />
                        </View>
                    </Marker>
                )}

                {/* Dropoff Location - Robust Premium Framing */}
                {dropoffLocation && (
                    <Marker coordinate={dropoffLocation} title="Customer Location">
                        <View style={markerStyles.markerWrapper}>
                            <Image source={riderIcon} style={markerStyles.markerImage} />
                        </View>
                    </Marker>
                )}

                {/* Nearby Users - Robust Premium Framing & Badges */}
                {nearbyUsers && nearbyUsers.map((user) => (
                    <Marker
                        key={user.id}
                        coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                        title={user.name}
                        description={`${user.distance.toFixed(1)} km away - ${user.address}`}
                        opacity={user.available === false ? 0.6 : 1}
                    >
                        <View style={markerStyles.markerWrapper}>
                            <Image
                                source={riderIcon}
                                style={[markerStyles.markerImage, user.available === false && { tintColor: '#9ca3af' }]} // Tint grey if unavailable
                            />
                            {user.available === false && (
                                <View style={markerStyles.statusBadge}>
                                    <Text style={markerStyles.statusText}>OUT</Text>
                                </View>
                            )}
                        </View>
                    </Marker>
                ))}

                {/* Acceptance Zone Circle */}
                {acceptanceRadius && coordinates && (
                    <Circle
                        center={coordinates}
                        radius={acceptanceRadius}
                        fillColor="rgba(59, 130, 246, 0.15)" // subtle blue fill
                        strokeColor="#3b82f6" // blue stroke
                        strokeWidth={2}
                    />
                )}

                {/* Premium Layered Route Lines */}
                {routeCoordinates.length > 0 && (
                    <>
                        {/* Wide darker shadow line */}
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={7}
                            strokeColor="#00000040" // translucent black for shadow
                        />
                         {/* Narrow colored line */}
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={4}
                            strokeColor={routeColor}
                        />
                    </>
                )}

                {/* Fallback straight line */}
                {directionsError && pickupLocation && dropoffLocation && (
                    <Polyline
                        coordinates={[pickupLocation, dropoffLocation]}
                        strokeWidth={4}
                        strokeColor="#ef4444" // red
                        lineDashPattern={[10, 5]}
                    />
                )}
            </MapView>
        </View>
    )
}

export default LiveMap