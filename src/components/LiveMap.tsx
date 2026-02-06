import { View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker, Polyline } from 'react-native-maps';
import Loading from './Loading';
import { LiveMapProps } from '../types/map';

const riderIcon = require('../assets/rider-icon.png');
const scrapHomeIcon = require('../assets/scrap-home.png');



const LiveMap: React.FC<LiveMapProps> = ({ coordinates, pickupLocation, dropoffLocation }) => {
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [directionsError, setDirectionsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const getMapRegion = () => {
        const center = coordinates ?? (pickupLocation ?? { latitude: 24.8607, longitude: 67.0011 }); // default Karachi
        return {
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
    };
    if (isLoading) {
        return <Loading />
    }

    return (
        <View className='flex-1'>
            <MapView
                provider="google"
                style={{ flex: 1 }}
                initialRegion={getMapRegion()}
            >
                {coordinates && (
                    <Marker
                        coordinate={coordinates}
                        title="Your Location"
                        description="Seller current location"
                    >
                        <Image source={scrapHomeIcon} style={{ width: 40, height: 40 }} />
                    </Marker>
                )}
                {pickupLocation && !coordinates && (
                    <Marker coordinate={pickupLocation} title="Pickup Location">
                        <Image source={scrapHomeIcon} style={{ width: 40, height: 40 }} />
                    </Marker>
                )}
                {dropoffLocation && !coordinates && (
                    <Marker coordinate={dropoffLocation} title="Drop-off Location">
                        <Image source={riderIcon} style={{ width: 40, height: 40 }} />
                    </Marker>
                )}

                {/* Route line from OSRM */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeWidth={4}
                        strokeColor="#10b981"
                    />
                )}

                {/* Fallback straight line when directions fail */}
                {directionsError && (
                    <Polyline
                        coordinates={pickupLocation && dropoffLocation ? [pickupLocation, dropoffLocation] : []}
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