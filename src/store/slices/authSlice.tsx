import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
    id?: string | number;
    _id?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    address?: string;
    phone?: string;
    [key: string]: any;
}

interface AuthState {
    token: string | null;
    userdata?: UserData;
}

const initialState: AuthState = {
    token: null,
    userdata: {},
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<string>) {
            state.token = action.payload;
        },
        setuser(state, action: PayloadAction<UserData>) {
            state.userdata = action.payload;
        },
        logout(state) {
            state.token = null;
            state.userdata = {};
        },
    },
})

export const { login, logout, setuser } = authSlice.actions;
export default authSlice.reducer;