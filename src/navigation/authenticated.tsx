import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Home from "../screens/authenticated/Home";
import Profile from "../screens/authenticated/Profile";
import Activity from "../screens/authenticated/Activity";
import collectorRideScreen from "../screens/authenticated/BuyerRideScreen";
import customerRideScreen from "../screens/authenticated/SellerRideScreen";
import { Home as HomeIcon, Clock, User, ChevronLeft, MapPin } from "lucide-react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
    const insets = useSafeAreaInsets();
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';
    
    const primaryColor = role === 'collector' ? '#d97706' : '#10b981';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    height: Platform.OS === 'ios' ? 85 : 65 + insets.bottom,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10 + insets.bottom,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6', 
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: primaryColor,
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarShowLabel: false, 
                tabBarIcon: ({ focused, color }) => {
                    let IconComponent;
                    if (route.name === 'Home') IconComponent = HomeIcon;
                    if (route.name === 'Activity') IconComponent = Clock;
                    if (route.name === 'Profile') IconComponent = User;

                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            {IconComponent && (
                                <IconComponent
                                    size={24}
                                    color={color}
                                    strokeWidth={focused ? 2.5 : 2}
                                />
                            )}
                            {focused && (
                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: primaryColor, marginTop: 4 }} />
                            )}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Activity" component={Activity} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}

export default function AuthenticatedStack() {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';

    const RideScreen = role === 'collector' ? collectorRideScreen : customerRideScreen;
    const rideLabel = role === 'collector' ? 'Book a Pickup' : 'Book a Ride';
    const primaryColor = role === 'collector' ? '#d97706' : '#10b981';

    return (
        <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={({ navigation }) => ({
                headerStyle: {
                    backgroundColor: '#ffffff',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                },
                headerTitleAlign: 'center',
                headerLeft: ({ canGoBack }) => canGoBack ? (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            marginLeft: 20,
                            width: 40,
                            height: 40,
                            backgroundColor: '#f3f4f6', 
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ChevronLeft size={24} color="#374151" strokeWidth={2} />
                    </TouchableOpacity>
                ) : null,
                headerRight: () => (
                    <TouchableOpacity
                        style={{
                            marginRight: 20,
                            width: 40,
                            height: 40,
                            backgroundColor: '#f3f4f6',
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MapPin size={20} color="#374151" strokeWidth={2} />
                    </TouchableOpacity>
                ),
                cardStyle: { backgroundColor: '#ffffff' },
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
        </Stack.Navigator>
    );
}