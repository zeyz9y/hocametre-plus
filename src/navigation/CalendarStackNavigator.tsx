import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CalendarScreen from "../screens/calendar/CalendarScreen";
import EventDetailScreen from "../screens/calendar/EventDetailScreen";

export type CalendarStackParamList = {
  Calendar: undefined;
  EventDetail: { eventId: string };
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Calendar"
    >
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
      />
    </Stack.Navigator>
  );
}
