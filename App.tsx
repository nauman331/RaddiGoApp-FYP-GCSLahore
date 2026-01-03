import "./global.css"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from 'react-native-safe-area-context'
import CombinedNav from "./src/navigation/CombinedNav";
import { View, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from "./src/store/store";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { requestUserPermission, notificationListener, getLocationPermission } from "./src/utils/getPermissions";
import socketService from "./src/services/socketService";
import { setSocketConnected, setSocketDisconnected, setSocketError } from "./src/store/slices/socketSlice";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Loading from "./src/components/Loading";
import { apiURL } from "./src/utils/exports";
import { setuser } from "./src/store/slices/authSlice";
import { logout } from "./src/store/slices/authSlice";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { token, userdata } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState<boolean>(false);

  const initPermissions = async () => {
    await requestUserPermission();
    notificationListener();
    await getLocationPermission();
  };

  useEffect(() => {
    initPermissions();
  }, []);

  const getUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiURL}me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to fetch user data");
        dispatch(logout());
        return;
      }
      dispatch(setuser(data.user))
      console.log("User data fetched successfully:", data.user);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      getUser();
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (token) {
      const userId = (userdata as any)?.id;
      socketService.connect(userId);

      socketService.on("connect", () => {
        dispatch(setSocketConnected(userId || ""));
      });

      socketService.on("disconnect", () => {
        dispatch(setSocketDisconnected());
      });

      socketService.on("connect_error", (err: any) => {
        dispatch(setSocketError(err?.message || "WebSocket error"));
      });

      return () => {
        socketService.off("connect");
        socketService.off("disconnect");
        socketService.off("connect_error");
      };
    } else {
      socketService.disconnect();
      dispatch(setSocketDisconnected());
    }
  }, [token, dispatch]);
  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View className="flex-1 bg-gray-100 p-2">
          <AlertNotificationRoot>
            <CombinedNav />
          </AlertNotificationRoot>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  )
}

export default App;