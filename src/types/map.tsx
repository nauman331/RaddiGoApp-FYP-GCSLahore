export interface NearbyUser {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    distance: number;
    available?: boolean; // Whether the user is within acceptance range
}

export interface LiveMapProps {
    coordinates?: { latitude: number; longitude: number } | null;
    pickupLocation?: {
        latitude: number;
        longitude: number;
    } | null;
    dropoffLocation?: {
        latitude: number;
        longitude: number;
    } | null;
    nearbyUsers?: NearbyUser[];
    acceptanceRadius?: number; // Radius in meters for the acceptance zone
    /** Called when user taps the map to manually set location (GPS fallback) */
    onLocationPicked?: (coord: { latitude: number; longitude: number }) => void;
}

export interface User {
    id: string;
    username: string;
    email: string;
    address?: string;
    phone: string;
    profilePicture?: string;
    role: string;
}