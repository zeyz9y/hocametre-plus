import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { addQuestion } from "../../services/firebase/questionsUtils";
import { auth } from "../../services/firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./AskQuestionScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

export default function AskQuestionScreen() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!title || !body || !course) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
      return;
    }

    try {
      await addQuestion(title, body, course, user, isAnonymous);
      Alert.alert("Başarılı", "Soru başarıyla eklendi!");
      navigation.goBack();
    } catch (error) {
      console.error("Soru eklenemedi:", error);
      Alert.alert("Hata", "Soru eklenirken bir sorun oluştu.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.header}>Yeni Soru Sor</Text>
          </View>

          <Text style={styles.label}>Soru Başlığı</Text>
          <TextInput
            placeholder="Sorunuzu kısaca açıklayan bir başlık..."
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Detaylı Açıklama</Text>
          <TextInput
            placeholder="Sorununuzu detaylı olarak açıklayın..."
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={6}
            style={[styles.input, { height: 150, textAlignVertical: "top" }]}
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.label}>Ders</Text>
          <TextInput
            placeholder="İlgili ders adı (örnek: Fizik, Matematik...)"
            value={course}
            onChangeText={setCourse}
            style={styles.input}
            placeholderTextColor={colors.textTertiary}
          />

          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.7}
          >
            <Text style={styles.switchLabel}>Anonim olarak gönder</Text>
            <View style={styles.checkboxContainer}>
              <View
                style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}
              >
                {isAnonymous && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={colors.textInverse}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Soruyu Paylaş</Text>
          </TouchableOpacity>

          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={24} color={colors.primary} />
            <Text style={styles.tipText}>
              İpucu: Sorunuzu ne kadar detaylı yazarsanız, o kadar iyi ve hızlı
              cevaplar alabilirsiniz.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
