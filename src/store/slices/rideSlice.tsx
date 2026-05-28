import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RideStatus =
    | 'idle' // No active ride
    | 'searching' // collector searching for customer
    | 'pending' // Order placed, waiting for acceptance
    | 'accepted' // customer accepted
    | 'on_way' // customer on way to pickup
    | 'arrived' // customer arrived at pickup
    | 'picked_up' // Items picked up
    | 'completed' // Ride completed
    | 'cancelled'; // Ride cancelled

export interface Location {
    latitude: number;
    longitude: number;
}

export interface RaddiItem {
    id: string;
    category: 'paper' | 'plastic' | 'metal' | 'electronics' | 'cardboard' | 'glass' | 'other';
    weight: string;
    description?: string;
}

export interface OrderHistory {
    orderId: string;
    date: string;
    status: RideStatus;
    pickupAddress: string;
    totalWeight: string;
    price: number | null;
    customerName?: string;
    collectorName?: string;
    items?: RaddiItem[];
}

export interface RideState {
    status: RideStatus;
    orderId: string | null;
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    customerLocation: Location | null;
    collectorLocation: Location | null;
    pickupAddress: string;
    approximateWeight: string;
    items: RaddiItem[];
    customerId: string | null;
    customerName: string;
    collectorId: string | null;
    collectorName: string;
    estimatedTime: number | null; // in minutes
    price: number | null;
    orderHistory: OrderHistory[];
    totalEarnings: number;
    totalOrders: number;
}

const initialState: RideState = {
    status: 'idle',
    orderId: null,
    pickupLocation: null,
    dropoffLocation: null,
    customerLocation: null,
    collectorLocation: null,
    pickupAddress: '',
    approximateWeight: '',
    items: [],
    customerId: null,
    customerName: '',
    collectorId: null,
    collectorName: '',
    estimatedTime: null,
    price: null,
    orderHistory: [],
    totalEarnings: 0,
    totalOrders: 0,
};

const rideSlice = createSlice({
    name: 'ride',
    initialState,
    reducers: {
        setRideStatus(state, action: PayloadAction<RideStatus>) {
            state.status = action.payload;
        },
        createOrder(state, action: PayloadAction<{
            orderId: string;
            pickupLocation: Location;
            pickupAddress: string;
            approximateWeight: string;
            collectorId: string;
            items?: RaddiItem[];
        }>) {
            state.status = 'pending';
            state.orderId = action.payload.orderId;
            state.pickupLocation = action.payload.pickupLocation;
            state.collectorLocation = action.payload.pickupLocation;
            state.pickupAddress = action.payload.pickupAddress;
            state.approximateWeight = action.payload.approximateWeight;
            state.collectorId = action.payload.collectorId;
            state.items = action.payload.items || [];
        },
        acceptOrder(state, action: PayloadAction<{
            customerId: string;
            customerName: string;
            customerLocation: Location;
            estimatedTime: number;
        }>) {
            state.status = 'accepted';
            state.customerId = action.payload.customerId;
            state.customerName = action.payload.customerName;
            state.customerLocation = action.payload.customerLocation;
            state.estimatedTime = action.payload.estimatedTime;
        },
        updatecustomerLocation(state, action: PayloadAction<Location>) {
            state.customerLocation = action.payload;
        },
        updatecollectorLocation(state, action: PayloadAction<Location>) {
            state.collectorLocation = action.payload;
        },
        setDropoffLocation(state, action: PayloadAction<Location>) {
            state.dropoffLocation = action.payload;
        },
        updateRideInfo(state, action: PayloadAction<Partial<RideState>>) {
            return { ...state, ...action.payload };
        },
        completeRide(state, action: PayloadAction<{ price: number }>) {
            state.status = 'completed';
            state.price = action.payload.price;

            // Add to order history
            const orderRecord: OrderHistory = {
                orderId: state.orderId || '',
                date: new Date().toISOString(),
                status: 'completed',
                pickupAddress: state.pickupAddress,
                totalWeight: state.approximateWeight,
                price: action.payload.price,
                customerName: state.customerName,
                collectorName: state.collectorName,
                items: state.items,
            };
            state.orderHistory.unshift(orderRecord);
            state.totalEarnings += action.payload.price;
            state.totalOrders += 1;
        },
        cancelRide(state) {
            state.status = 'cancelled';

            // Add to order history as cancelled
            if (state.orderId) {
                const orderRecord: OrderHistory = {
                    orderId: state.orderId,
                    date: new Date().toISOString(),
                    status: 'cancelled',
                    pickupAddress: state.pickupAddress,
                    totalWeight: state.approximateWeight,
                    price: null,
                    customerName: state.customerName,
                    collectorName: state.collectorName,
                    items: state.items,
                };
                state.orderHistory.unshift(orderRecord);
            }
        },
        addItem(state, action: PayloadAction<RaddiItem>) {
            state.items.push(action.payload);
        },
        removeItem(state, action: PayloadAction<string>) {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateItem(state, action: PayloadAction<RaddiItem>) {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        clearItems(state) {
            state.items = [];
        },
        resetRide(state) {
            const { orderHistory, totalEarnings, totalOrders } = state;
            return { ...initialState, orderHistory, totalEarnings, totalOrders };
        },
    },
});

export const {
    setRideStatus,
    createOrder,
    acceptOrder,
    updatecustomerLocation,
    updatecollectorLocation,
    setDropoffLocation,
    updateRideInfo,
    completeRide,
    cancelRide,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    resetRide,
} = rideSlice.actions;

export default rideSlice.reducer;
