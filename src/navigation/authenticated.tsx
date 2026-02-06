import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from "../screens/authenticated/Home";
import Profile from "../screens/authenticated/Profile";
import { Home as HomeIcon, User, MapPin, Activity } from "lucide-react-native";
import Riders from "../screens/authenticated/Riders";

const Tab = createBottomTabNavigator();

export default function AuthenticatedStack() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#eee',
                    height: Platform.OS === 'ios' ? 90 : 70 + insets.bottom,
                    paddingBottom: Platform.OS === 'ios' ? 30 + insets.bottom : 10 + insets.bottom,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    position: 'absolute',
                },
                tabBarActiveTintColor: '#10b981',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 4,
                },
                tabBarIcon: ({ focused, color }) => {
                    let IconComponent;
                    let iconSize = 24;

                    if (route.name === 'Home') {
                        IconComponent = HomeIcon;
                    } else if (route.name === 'Activity') {
                        IconComponent = Activity;
                    } else if (route.name === 'Riders') {
                        IconComponent = MapPin;
                    } else if (route.name === 'Profile') {
                        IconComponent = User;
                    }

                    return (
                        <View
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: focused ? '#10b98115' : 'transparent',
                            }}
                        >
                            {IconComponent && (
                                <IconComponent
                                    size={iconSize}
                                    color={color}
                                    strokeWidth={focused ? 2.5 : 2}
                                />
                            )}
                        </View>
                    );
                },
            })}
            initialRouteName="Home"
            backBehavior="history"
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Activity"
                component={Home}
                options={{
                    tabBarLabel: 'Activity',
                }}
            />
            <Tab.Screen
                name="Riders"
                component={Riders}
                options={{
                    tabBarLabel: 'Riders',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarLabel: 'Account',
                }}
            />
        </Tab.Navigator>
    );
}