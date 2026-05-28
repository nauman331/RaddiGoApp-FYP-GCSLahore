import { View, Image, Text } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Loading from './Loading';
import { LiveMapProps } from '../types/map';
import riderIcon from '../assets/rider-icon.png';
import scrapHomeIcon from '../assets/scrap-home.png';


const LiveMap: React.FC<LiveMapProps> = ({ coordinates, pickupLocation, dropoffLocation, nearbyUsers, acceptanceRadius }) => {
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [directionsError, setDirectionsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef<MapView>(null);

    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata?: { role?: string } };
    const role = userdata?.role || 'customer';
    const routeColor = role === 'collector' ? '#d97706' : '#10b981';

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
        } else {
            setRouteCoordinates([]);
            setDirectionsError(false);
        }
    }, [pickupLocation, dropoffLocation]);

    // Fit map to show all markers
    useEffect(() => {
        if (mapRef.current && pickupLocation && dropoffLocation) {
            const markers = [pickupLocation, dropoffLocation];
            mapRef.current.fitToCoordinates(markers, {
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
        const center = coordinates ?? (pickupLocation ?? { latitude: 24.8607, longitude: 67.0011 });
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
                {/* Current User Location */}
                {coordinates && (
                    <Marker
                        coordinate={coordinates}
                        title="Your Location"
                        description="Current location"
                    >
                        <Image source={scrapHomeIcon} style={{ width: 40, height: 40 }} />
                    </Marker>
                )}

                {/* Pickup Location */}
                {pickupLocation && !coordinates && (
                    <Marker coordinate={pickupLocation} title="Pickup Location">
                        <Image source={scrapHomeIcon} style={{ width: 40, height: 40 }} />
                    </Marker>
                )}

                {/* Dropoff

 Location */}
                {dropoffLocation && (
                    <Marker coordinate={dropoffLocation} title="customer Location">
                        <Image source={riderIcon} style={{ width: 40, height: 40 }} />
                    </Marker>
                )}

                {/* Nearby Users (collectors for customer) */}
                {nearbyUsers && nearbyUsers.map((user) => (
                    <Marker
                        key={user.id}
                        coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                        title={user.name}
                        description={`${user.distance.toFixed(1)} km away - ${user.address}`}
                        opacity={user.available === false ? 0.5 : 1}
                    >
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: user.available === false ? 0.6 : 1
                        }}>
                            <Image
                                source={riderIcon}
                                style={{
                                    width: 40,
                                    height: 40,
                                    tintColor: user.available === false ? '#9ca3af' : undefined
                                }}
                            />
                            {user.available === false && (
                                <View style={{
                                    position: 'absolute',
                                    backgroundColor: '#ef4444',
                                    borderRadius: 10,
                                    paddingHorizontal: 4,
                                    paddingVertical: 2,
                                    bottom: -5,
                                }}>
                                    <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>OUT</Text>
                                </View>
                            )}
                        </View>
                    </Marker>
                ))}

                {/* Acceptance Zone Circle (Blue) */}
                {acceptanceRadius && coordinates && (
                    <Circle
                        center={coordinates}
                        radius={acceptanceRadius}
                        fillColor="rgba(59, 130, 246, 0.15)"
                        strokeColor="#3b82f6"
                        strokeWidth={2}
                    />
                )}

                {/* Route line from OSRM */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeWidth={5}
                        strokeColor={routeColor}
                    />
                )}

                {/* Fallback straight line when directions fail */}
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