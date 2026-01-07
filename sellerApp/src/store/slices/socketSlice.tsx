import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
    isConnected: boolean;
    socketId: string | null;
    error: string | null;
}

const initialState: SocketState = {
    isConnected: false,
    socketId: null,
    error: null,
};

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        setSocketConnected(state, action: PayloadAction<string>) {
            state.isConnected = true;
            state.socketId = action.payload;
            state.error = null;
        },
        setSocketDisconnected(state) {
            state.isConnected = false;
            state.socketId = null;
        },
        setSocketError(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.isConnected = false;
        },
        clearSocketError(state) {
            state.error = null;
        },
    },
});

export const {
    setSocketConnected,
    setSocketDisconnected,
    setSocketError,
    clearSocketError
} = socketSlice.actions;
export default socketSlice.reducer;