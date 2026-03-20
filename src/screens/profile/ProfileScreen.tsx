import { useState, useEffect, useContext, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/firebase";
import {
  uploadProfilePicture,
  getUserDataFromFirestore,
  updateUserDataInFirestore,
} from "../../services/firebase/profileUtils";
import type { DocumentData } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ProfileRefreshContext } from "../../context/ProfileRefreshContext";

import { styles } from "./ProfileScreen.styles";
import { colors } from "../../theme";

interface UserProfile extends DocumentData {
  nickname?: string;
  class?: string;
  role?: string;
  profilePicture?: string;
  email?: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [userClass, setUserClass] = useState<string>("1");
  const [role, setRole] = useState<string>("");
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const refreshProfile = useContext(ProfileRefreshContext);

  const user = auth.currentUser;
  const classOptions = ["1", "2", "3", "4", "4+"];

  const loadUserData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserDataFromFirestore(user.uid);
      setUserData(data);
      setNickname(data?.nickname ?? "");
      setUserClass(data?.class ?? "1");
      setRole(data?.role ?? "");
      setHasChanges(false);
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert("Hata", "Profil verisi yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Fotoğraf seçmek için galeri erişim izni gereklidir.",
          [{ text: "Tamam" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.uri || !user) return;

      setLoading(true);
      try {
        console.log("Uploading image to Cloudinary...");
        const url = await uploadProfilePicture(user.uid, asset.uri);
        console.log("Upload successful, URL:", url);

        await updateUserDataInFirestore(user.uid, { profilePicture: url });
        console.log("Firebase updated with new profile picture URL");

        setUserData((prev) => {
          const updated = prev
            ? { ...prev, profilePicture: url }
            : { profilePicture: url };
          console.log("Updated user data:", updated);
          return updated;
        });

        refreshProfile();

        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (err: any) {
        console.error("Profile picture upload error:", err);
        Alert.alert("Yükleme Hatası", err.message || "Fotoğraf yüklenemedi");
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu");
      console.error(error);
    }
  };

  const saveProfileInfo = async () => {
    if (!user) return;
    if (!nickname.trim()) {
      Alert.alert("Uyarı", "Lütfen bir takma ad girin");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserDataInFirestore(user.uid, {
        role,
        nickname: nickname.trim(),
        class: userClass,
      });

      setUserData((prev) =>
        prev
          ? { ...prev, nickname, class: userClass, role }
          : { nickname, class: userClass, role }
      );

      setHasChanges(false);
      refreshProfile();
      Alert.alert("Başarılı", "Profil bilgileri kaydedildi");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Hata", "Güncelleme başarısız");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: () => {
            signOut(auth).catch(() => Alert.alert("Hata", "Çıkış yapılamadı"));
          },
        },
      ]
    );
  };

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setHasChanges(true);
  };

  const handleClassChange = (cls: string) => {
    setUserClass(cls);
    setClassDropdownVisible(false);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const patternSource = {
    uri: "https://www.transparenttextures.com/patterns/cubes.png",
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.heroSection, { backgroundColor: colors.primary }]}
          >
            <Image
              source={patternSource}
              style={styles.heroPattern}
              resizeMode="repeat"
            />
            <View style={styles.heroContent}>
              <View style={styles.profileHeader}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.avatarContainer}
                  activeOpacity={0.7}
                >
                  {userData?.profilePicture ? (
                    <Image
                      source={{
                        uri:
                          userData.profilePicture +
                          "?t=" +
                          new Date().getTime(),
                        cache: "reload",
                      }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Ionicons
                        name="person"
                        size={60}
                        color={colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.nameText}>{nickname || "Kullanıcı"}</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Takma Ad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Takma adınızı girin"
                  value={nickname}
                  onChangeText={handleNicknameChange}
                  maxLength={30}
                />
              </View>

              {role === "student" && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Sınıf</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setClassDropdownVisible(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {`${userClass}. Sınıf`}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={classDropdownVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setClassDropdownVisible(false)}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setClassDropdownVisible(false)}
                    >
                      <View style={styles.modalContent}>
                        <FlatList
                          data={classOptions}
                          keyExtractor={(item) => item}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleClassChange(item)}
                            >
                              <Ionicons
                                name="school"
                                size={20}
                                color={colors.primary}
                                style={styles.dropdownItemIcon}
                              />
                              <Text style={styles.dropdownItemText}>
                                {`${item}. Sınıf`}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>
              )}

              <View style={styles.roleContainer}>
                <Ionicons
                  name={role === "student" ? "school" : "briefcase"}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.roleText}>
                  {role === "student"
                    ? "Öğrenci"
                    : role === "academic"
                    ? "Hoca"
                    : "Bilinmiyor"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || isSaving) && styles.saveButtonDisabled,
              ]}
              onPress={saveProfileInfo}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.error}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.signOutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
