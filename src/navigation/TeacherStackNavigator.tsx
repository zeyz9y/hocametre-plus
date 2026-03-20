import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TeachersScreen from "../screens/teachers/TeachersScreen";
import TeacherDetailScreen from "../screens/teachers/TeacherDetailScreen";

export type TeachersStackParamList = {
  Teachers: undefined;
  TeacherDetail: { teacherId: string };
};

const Stack = createNativeStackNavigator<TeachersStackParamList>();

export default function TeachersStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Teachers"
    >
      <Stack.Screen
        name="Teachers"
        component={TeachersScreen}
      />
      <Stack.Screen
        name="TeacherDetail"
        component={TeacherDetailScreen}
      />
    </Stack.Navigator>
  );
}
