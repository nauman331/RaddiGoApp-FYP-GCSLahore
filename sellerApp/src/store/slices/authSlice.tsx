import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    userdata?: object;
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
        setuser(state, action: PayloadAction<object>) {
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