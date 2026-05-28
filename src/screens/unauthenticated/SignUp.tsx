import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import React, { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, User, Phone } from "lucide-react-native";
import { GoogleIcon, FacebookIcon } from "../../assets/Icons";
import LogoImage from "../../assets/half-logo.jpeg";
import { useSubmit } from "../../apiHooks/useSubmit";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

const SignUp: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const role = route?.params?.role || "customer";
  const { mutateAsync, isPending } = useSubmit({
    endpoint: "auth/api/v1/register",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: role,
  });

  // Role-based theme colors
  const themeColors = {
    primary600: role === "customer" ? "#059669" : "#d97706",
    primary500: role === "customer" ? "#10b981" : "#f59e0b",
    primary400: role === "customer" ? "#34d399" : "#fbbf24",
    primary300: role === "customer" ? "#6ee7b7" : "#fcd34d",
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const Register = async () => {
    try {
      await mutateAsync(formData);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "OTP sent to your email. Please verify.",
      });
      navigation.navigate("VerifyOTP", { email: formData.email, role });
    } catch (error: any) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: error.message || "Registration failed",
      });
    }
  };

  return (
    <View className="bg-gray-200 rounded-2xl p-2 flex-1">
      <TouchableOpacity
        style={{ backgroundColor: themeColors.primary600 }}
        className="ml-3 mt-3 w-10 h-10 items-center justify-center rounded-full"
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft color={"white"} />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-5 bg-white shadow-lg p-4 rounded-2xl">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-bold"
              style={{ color: themeColors.primary600 }}
            >
              Sign Up to RaddiGo
            </Text>
            <Image
              className="h-14 w-14 rounded-lg"
              source={LogoImage}
              alt="RaddiGo Logo"
            />
          </View>

          <View className="mt-3">
            <Text className="font-semibold">Username</Text>
            <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
              <User />
              <TextInput
                value={formData.username}
                onChangeText={(text) => handleInputChange("username", text)}
                placeholder="Enter your username"
                placeholderTextColor="#9ca3af"
                style={{ color: themeColors.primary500 }}
                className="flex-1 h-full px-2 py-1 font-bold"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="font-semibold">Email</Text>
            <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
              <Mail />
              <TextInput
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                style={{ color: themeColors.primary500 }}
                className="flex-1 h-full px-2 py-1 font-bold"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="font-semibold">Phone</Text>
            <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
              <Phone />
              <TextInput
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                style={{ color: themeColors.primary500 }}
                className="flex-1 h-full px-2 py-1 font-bold"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="font-semibold">Password</Text>
            <View className="flex-row items-center justify-center mt-2 bg-white px-3 h-14 rounded-lg border border-gray-300">
              <Lock />
              <TextInput
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                placeholder="Enter your Password"
                placeholderTextColor="#9ca3af"
                style={{ color: themeColors.primary500 }}
                className="flex-1 h-full px-2 py-1 font-bold"
                secureTextEntry
              />
              <Eye />
            </View>
          </View>

          <TouchableOpacity
            onPress={Register}
            disabled={isPending}
            style={{
              backgroundColor: isPending
                ? themeColors.primary500
                : themeColors.primary600,
            }}
            className="mt-6 rounded-full h-12 items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">
              {isPending ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-[1px] bg-gray-400" />
            <Text className="text-gray-400 font-semibold mx-3">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-400" />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white rounded-full h-12 mb-3 border-2"
            style={{ borderColor: themeColors.primary600 }}
          >
            <GoogleIcon
              primaryColor={themeColors.primary500}
              secondaryColor={themeColors.primary600}
              tertiaryColor={themeColors.primary400}
              quaternaryColor={themeColors.primary600}
            />
            <Text
              className="font-bold text-base ml-2"
              style={{ color: themeColors.primary600 }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white rounded-full h-12 border-2"
            style={{ borderColor: themeColors.primary600 }}
          >
            <FacebookIcon primaryColor={themeColors.primary500} />
            <Text
              className="font-bold text-base ml-2"
              style={{ color: themeColors.primary600 }}
            >
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center mt-5 ml-5 mb-5">
          <Text className="text-gray-600 font-semibold">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn", { role })}
          >
            <Text
              className="font-bold"
              style={{ color: themeColors.primary600 }}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUp;
