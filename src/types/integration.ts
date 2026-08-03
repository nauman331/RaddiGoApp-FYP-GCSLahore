export interface CategoryItem {
    id: number;
    nameEng: string;
    nameUrdu: string;
    todayPrice: number;
    categoryLogo?: string;
}

export interface BidItem {
    id: number;
    orderId: number;
    collectorId: number;
    collectorName: string;
    collectorPhone?: string;
    bidAmount: number;
    counterAmount?: number | null;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    round: number;
    note?: string;
}

export interface ChatMessage {
    id: number;
    orderId: number;
    senderId: number;
    senderName: string;
    receiverId: number;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface OrderItem {
    id: number;
    customerId: number;
    collectorId?: number | null;
    categoryId: number;
    status: 'pending' | 'bidding' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddress: string;
    scheduleTime?: string;
    approximateRaddiInKg: number;
    expectedPrice?: number;
    finalPrice?: number | null;
    categoryName?: string;
    customerName?: string;
    customerPhone?: string;
    collectorName?: string;
    collectorPhone?: string;
    bids?: BidItem[];
}
