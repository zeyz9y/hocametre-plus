import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ForumScreen from "../screens/forum/ForumScreen";
import AskQuestionScreen from "../screens/forum/AskQuestionScreen";
import QuestionDetailScreen from "../screens/forum/QuestionDetailScreen";

export type ForumStackParamList = {
  Forum: undefined;
  AskQuestion: undefined;
  QuestionDetail: { question: any };
};

const Stack = createNativeStackNavigator<ForumStackParamList>();

export default function ForumStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Forum"
    >
      <Stack.Screen
        name="Forum"
        component={ForumScreen}
      />
      <Stack.Screen
        name="AskQuestion"
        component={AskQuestionScreen}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen}
      />
    </Stack.Navigator>
  );
}
