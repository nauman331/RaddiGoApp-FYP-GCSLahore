import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import authReducer from "./slices/authSlice";
import socketReducer from "./slices/socketSlice";
import rideReducer from "./slices/rideSlice";

// Only persist auth, NOT socket (socket instances cannot be serialized)
const persistedAuthConfig = {
    key: "auth",
    storage: AsyncStorage,
};

const persistedAuthReducer = persistReducer(persistedAuthConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        socket: socketReducer, // Not persisted - socket state is volatile
        ride: rideReducer, // Ride state management
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                // Ignore socket-related paths in state
                ignoredPaths: ['socket'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;