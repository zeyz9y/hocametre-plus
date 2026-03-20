import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NotesScreen from "../screens/notes/NotesScreen";
import NoteDetailScreen from "../screens/notes/NoteDetailScreen";

export type NotesStackParamList = {
  Notes: undefined;
  NoteDetail: { noteId: string };
};

const Stack = createNativeStackNavigator<NotesStackParamList>();

export default function NotesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{
        headerShown: false,
      }} initialRouteName="Notes">
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
      />
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
      />
    </Stack.Navigator>
  );
}
