import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import ProfileCompletionScreen from "../screens/profile/ProfileCompletionScreen";

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ProfileCompletion: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen
      name="ProfileCompletion"
      component={ProfileCompletionScreen}
    />
  </Stack.Navigator>
  );
}

