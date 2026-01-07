import { createStackNavigator } from "@react-navigation/stack";
import SignIn from "../screens/unauthenticated/SignIn";
import InitialScreen from "../screens/unauthenticated/InitialScreen";
import SignUp from "../screens/unauthenticated/SignUp";

const Stack = createStackNavigator();

export default function UnauthenticatedStack() {
    return (
        <Stack.Navigator
            initialRouteName="InitialScreen"
            screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="InitialScreen" component={InitialScreen} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
        </Stack.Navigator>
    );
}