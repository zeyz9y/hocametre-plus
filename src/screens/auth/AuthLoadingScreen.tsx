import { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../services/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AuthLoadingScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace("Login");
        return;
      }

      try {
        const userRef = doc(firestore, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          navigation.replace("ProfileCompletion");
        } else {
          const data = snap.data();
          if (data.isProfileCompleted) {
            navigation.replace("AppDrawer");
          } else {
            navigation.replace("ProfileCompletion");
          }
        }
      } catch (err) {
        console.error("Profile check error:", err);
        Alert.alert("Hata", "Profil kontrolü yapılamadı.");
        navigation.replace("Login");
      }
    };

    checkProfileCompletion();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
