export interface LiveMapProps {
    coordinates?: { latitude: number; longitude: number } | null;
    pickupLocation?: {
        latitude: number;
        longitude: number;
    };
    dropoffLocation?: {
        latitude: number;
        longitude: number;
    };
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