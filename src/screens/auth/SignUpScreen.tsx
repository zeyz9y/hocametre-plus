import { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { signUp } from "../../services/firebase";
import { AuthStackParamList } from "../../navigation/AuthStackNavigator";
import { styles } from "./SignUpScreen.styles";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      return Alert.alert("Eksik Bilgi", "Lütfen e-posta ve şifrenizi girin.");
    }

    setLoading(true);
    try {
      const userCredential = await signUp(email, password);
      setLoading(false);

      navigation.navigate("ProfileCompletion");
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Kayıt Hatası", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="E-posta"
            placeholderTextColor="#666"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
          <TextInput
            placeholder="Şifre (min. 6 karakter)"
            placeholderTextColor="#666"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonTextSecondary}>Girişe Dön</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
