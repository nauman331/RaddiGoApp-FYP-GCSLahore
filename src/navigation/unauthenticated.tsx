import { createStackNavigator } from "@react-navigation/stack";
import SignIn from "../screens/unauthenticated/SignIn";
import InitialScreen from "../screens/unauthenticated/InitialScreen";
import SignUp from "../screens/unauthenticated/SignUp";
import ForgotPassword from "../screens/unauthenticated/ForgotPassword";
import VerifyOTP from "../screens/unauthenticated/VerifyOTP";

const Stack = createStackNavigator();

export default function UnauthenticatedStack() {
    return (
        <Stack.Navigator
            initialRouteName="InitialScreen"
            screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="InitialScreen" component={InitialScreen} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
        </Stack.Navigator>
    );
}