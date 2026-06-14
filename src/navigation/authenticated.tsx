import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Platform, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

import Home from "../screens/authenticated/Home";
import Profile from "../screens/authenticated/Profile";
import Activity from "../screens/authenticated/Activity";
import collectorRideScreen from "../screens/authenticated/BuyerRideScreen";
import customerRideScreen from "../screens/authenticated/SellerRideScreen";
import walletScreen from "../screens/authenticated/Wallet";
import Notifications from "../screens/authenticated/Notifications";

import { Home as HomeIcon, Clock, User, ChevronLeft, MapPin, Wallet as WalletIcon } from "lucide-react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
    const insets = useSafeAreaInsets();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';
    
    const isCollector = role === 'collector';
    const primaryColor = isCollector ? '#d97706' : '#059669';
    const primaryLight = isCollector ? '#fffbeb' : '#ecfdf5';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    height: Platform.OS === 'ios' ? 85 : 70 + insets.bottom,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10 + insets.bottom,
                    paddingTop: 10,
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                },
                tabBarShowLabel: false, 
                tabBarIcon: ({ focused }) => {
                    let IconComponent;
                    if (route.name === 'Home') IconComponent = HomeIcon;
                    if (route.name === 'Wallet') IconComponent = WalletIcon;
                    if (route.name === 'Activity') IconComponent = Clock;
                    if (route.name === 'Profile') IconComponent = User;
                    
                    return (
                        <View style={{ 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: focused ? primaryLight : 'transparent',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 100,
                        }}>
                            {IconComponent && (
                                <IconComponent
                                    size={24}
                                    color={focused ? primaryColor : '#9CA3AF'}
                                    strokeWidth={focused ? 2.5 : 2}
                                />
                            )}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Wallet" component={walletScreen} />
            <Tab.Screen name="Activity" component={Activity} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}

export default function AuthenticatedStack() {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';

    const RideScreen = role === 'collector' ? collectorRideScreen : customerRideScreen;
    const rideLabel = role === 'collector' ? 'Book a Pickup' : 'Find Raddi Orders';

    return (
        <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={({ navigation }) => ({
                headerStyle: {
                    backgroundColor: '#ffffff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '900',
                    color: '#111827',
                    letterSpacing: -0.5,
                },
                headerTitleAlign: 'center',
                headerLeft: ({ canGoBack }) => canGoBack ? (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.goBack()}
                        style={{
                            marginLeft: 20,
                            width: 44,
                            height: 44,
                            backgroundColor: '#f8fafc', 
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }}
                    >
                        <ChevronLeft size={24} color="#111827" strokeWidth={2.5} />
                    </TouchableOpacity>
                ) : null,
                headerRight: () => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                            marginRight: 20,
                            width: 44,
                            height: 44,
                            backgroundColor: '#f8fafc',
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }}
                    >
                        <MapPin size={20} color="#4b5563" strokeWidth={2.5} />
                    </TouchableOpacity>
                ),
                cardStyle: { backgroundColor: '#f8fafc' },
            })}
        >
            <Stack.Screen 
                name="MainTabs" 
                component={MainTabNavigator} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="Ride" 
                component={RideScreen} 
                options={{ 
                    title: rideLabel,
                    headerShown: true, 
                }} 
            />
            <Stack.Screen 
                name="Notifications" 
                component={Notifications} 
                options={{ headerShown: false }} 
            />
        </Stack.Navigator>
    );
}