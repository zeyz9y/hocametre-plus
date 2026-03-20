import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { firestore, auth } from "../../services/firebase/firebase";
import { ProfileRefreshContext } from "../../context/ProfileRefreshContext";
import { styles } from "./ProfileCompletionScreen.styles";

export default function ProfileCompletionScreen() {
  const [role, setRole] = useState<"student" | "academic" | null>(null);
  const [loading, setLoading] = useState(false);
  const refresh = useContext(ProfileRefreshContext);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const saveProfileInfo = async () => {
    if (!role) {
      Alert.alert("Hata", "Lütfen rolünüzü seçin.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    try {
      await setDoc(
        doc(firestore, "users", uid),
        {
          role,
          isProfileCompleted: true,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setLoading(false);
      Alert.alert("Başarılı", "Profil bilgileriniz kaydedildi.");

      refresh();
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Hata", "Profil bilgileri kaydedilemedi.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Profilini Tamamla</Text>
          <Text style={styles.subtitle}>
            Hocametre'yi kullanabilmek için rolünüzü seçmeniz gerekiyor.
          </Text>

          <Text style={styles.label}>Rolünüzü seçin:</Text>

          <View style={styles.roles}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                role === "student" && styles.roleSelected,
              ]}
              onPress={() => setRole("student")}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>🎓</Text>
              </View>
              <Text style={styles.roleTitle}>Öğrenci</Text>
              <Text style={styles.roleDescription}>
                Ders programı, notlar ve daha fazlasına erişin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                role === "academic" && styles.roleSelected,
              ]}
              onPress={() => setRole("academic")}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>👨‍🏫</Text>
              </View>
              <Text style={styles.roleTitle}>Hoca</Text>
              <Text style={styles.roleDescription}>
                Derslerinizi ve öğrencilerinizi yönetin
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProfileInfo}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveText}>Kaydet ve Devam Et</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
