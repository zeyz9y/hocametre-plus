import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppDrawer from "./AppDrawer";
import ProfileCompletionScreen from "../screens/profile/ProfileCompletionScreen";

export type AppStackParamList = {
  AppDrawer: undefined;
  ProfileCompletion: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStackNavigator({
  isProfileComplete,
}: {
  isProfileComplete: boolean;
}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isProfileComplete ? (
        <Stack.Screen name="AppDrawer" component={AppDrawer} />
      ) : (
        <Stack.Screen
          name="ProfileCompletion"
          component={ProfileCompletionScreen}
        />
      )}
    </Stack.Navigator>
  );
}
