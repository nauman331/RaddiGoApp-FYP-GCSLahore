import { socketURL } from "../utils/exports";

// Module-level state
let socket: WebSocket | null = null;
let socketId: string | null = null;
let listeners: { [event: string]: ((...args: any[]) => void)[] } = {};


const setupListeners = (): void => {
    if (!socket) return;
    socket.onopen = () => {
        socketId = `${Date.now()}`;
        console.log("✅ WebSocket connected:", socketId);
        listeners.connect?.forEach(fn => fn());
    };
    socket.onerror = (err: any) => {
        console.error("❌ WebSocket connection error:", err?.message || err);
        listeners.connect_error?.forEach(fn => fn(err));
    };
    socket.onclose = (event: any) => {
        console.warn("⚠️ WebSocket disconnected:", event.reason);
        listeners.disconnect?.forEach(fn => fn(event.reason));
        if (!event.wasClean) {
            reconnect();
        }
    };
    socket.onmessage = (msg) => {
        try {
            const { event, data } = JSON.parse(msg.data);
            if (listeners[event]) {
                listeners[event].forEach(fn => fn(data));
            }
        } catch (e) {
            console.warn("Received non-JSON message", e, msg.data);
        }
    };
};

const reconnect = () => {
    if (socket) {
        setTimeout(() => {
            if (socket) {
                connect();
                listeners.reconnect_attempt?.forEach(fn => fn(1));
            }
        }, 1000);
    }
};


export const connect = (userId?: string): WebSocket => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("WebSocket already connected:", socketId);
        return socket;
    }
    if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.log("WebSocket is connecting...");
        return socket;
    }
    if (socket) {
        socket.close();
    }
    let url = socketURL;
    if (userId) {
        url += `?userId=${encodeURIComponent(userId)}`;
    }
    console.log("Creating new WebSocket connection...");
    socket = new WebSocket(url);
    setupListeners();
    return socket;
};


export const getSocket = (): WebSocket | null => {
    return socket;
};


export const isConnected = (): boolean => {
    return socket?.readyState === WebSocket.OPEN;
};


export const disconnect = (): void => {
    if (socket) {
        console.log("Disconnecting WebSocket...");
        socket.onopen = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.close();
        socket = null;
        listeners = {};
        socketId = null;
    }
};


export const emit = (event: string, data?: any): void => {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event, data }));
    } else {
        console.warn("Cannot emit - WebSocket not connected");
    }
};


export const on = (event: string, callback: (...args: any[]) => void): void => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
};


export const off = (event: string, callback?: (...args: any[]) => void): void => {
    if (listeners[event]) {
        if (callback) {
            listeners[event] = listeners[event].filter(fn => fn !== callback);
        } else {
            listeners[event] = [];
        }
    }
};


const socketService = {
    connect,
    getSocket,
    isConnected,
    disconnect,
    emit,
    on,
    off,
};

export default socketService;
