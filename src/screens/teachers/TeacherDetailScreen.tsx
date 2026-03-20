import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import type { TeachersStackParamList } from "../../navigation/TeacherStackNavigator";
import {
  getTeacherDetail,
  fetchTeacherRatings,
  addTeacherRating,
} from "../../services/firebase";
import {
  deleteTeacherRating,
  toggleLikeTeacherRating,
  toggleDislikeTeacherRating,
} from "../../services/firebase/teacherUtils";
import { auth, firestore } from "../../services/firebase/firebase";

import { getUserDataFromFirestore } from "../../services/firebase/profileUtils";

import { doc, updateDoc } from "firebase/firestore";

import { styles } from "./TeacherDetailScreen.styles";
import { colors } from "../../theme";

interface TeacherRating {
  id: string;
  userId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
  dislikes?: number;
  dislikedBy?: string[];
}

export default function TeacherDetailScreen() {
  const route = useRoute<RouteProp<TeachersStackParamList, "TeacherDetail">>();
  const navigation = useNavigation();
  const { teacherId } = route.params;
  const [detail, setDetail] = useState({
    name: "",
    subject: "",
    title: "",
    avgRating: 0,
  });
  const [ratings, setRatings] = useState<TeacherRating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(
    null
  );
  const [editedCommentText, setEditedCommentText] = useState("");

  const [userData, setUserData] = useState<{
    role: string;
    isAnonymous: boolean;
  } | null>(null);

  const loadData = async () => {
    try {
      const det = await getTeacherDetail(teacherId);
      setDetail(det);
      const fetched = await fetchTeacherRatings(teacherId);
      setRatings(
        fetched.sort(
          (a, b) =>
            (b.likes ?? 0) - (a.likes ?? 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading teacher data:", error);
      Alert.alert("Hata", "Veri yüklenirken sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const data = await getUserDataFromFirestore(uid);
      if (data) {
        setUserData({
          role: data.role,
          isAnonymous: data.isAnonymous,
        });
      }
    };
    fetchUserData();
  }, []);

  const submitRating = async () => {
    if (userRating < 1) {
      Alert.alert("Uyarı", "Lütfen 1 ile 5 arasında bir puan seçin.");
      return;
    }
    try {
      setLoading(true);
      await addTeacherRating(teacherId, userRating, commentText, false);
      setUserRating(0);
      setCommentText("");
      await loadData();
      Alert.alert("Teşekkürler", "Oy ve yorumunuz kaydedildi.");
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Hata", "Gönderim başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (ratingId: string) => {
    Alert.alert(
      "Silmek istediğinize emin misiniz?",
      "Bu yorum kalıcı olarak silinecek.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => deleteRating(ratingId),
        },
      ]
    );
  };

  const deleteRating = async (ratingId: string) => {
    try {
      setLoading(true);
      await deleteTeacherRating(teacherId, ratingId);
      await loadData();
    } catch (error) {
      console.error("Error deleting rating:", error);
      Alert.alert("Hata", "Yorum silinirken sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (ratingId: string, updatedText: string) => {
    try {
      setLoading(true);
      const ratingRef = doc(
        firestore,
        "teachers",
        teacherId,
        "ratings",
        ratingId
      );
      await updateDoc(ratingRef, {
        comment: updatedText,
      });
      setEditingCommentId(null);
      setEditedCommentText("");
      await loadData();
    } catch (error) {
      console.error("Error updating rating:", error);
      Alert.alert("Hata", "Yorum güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (ratingId: string) => {
    try {
      await toggleLikeTeacherRating(
        teacherId,
        ratingId,
        auth.currentUser?.uid || ""
      );
      await loadData();
    } catch (error) {
      console.error("Error liking rating:", error);
      Alert.alert("Hata", "Beğeni güncellenemedi.");
    }
  };

  const handleDislike = async (ratingId: string) => {
    try {
      await toggleDislikeTeacherRating(
        teacherId,
        ratingId,
        auth.currentUser?.uid || ""
      );
      await loadData();
    } catch (error) {
      console.error("Error disliking rating:", error);
      Alert.alert("Hata", "Dislike güncellenemedi.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text
                style={styles.title}
              >{`${detail.title} ${detail.name}`}</Text>
              <View style={styles.avgRowCompact}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.avgText}>
                  {detail.avgRating.toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={styles.subjectRow}>
              <Ionicons
                name="library-outline"
                size={14}
                color={colors.primary}
                style={styles.subjectIcon}
              />
              <Text style={styles.subLabel}>Dersler:</Text>

              <View style={styles.subjectBadgeContainer}>
                <Text style={styles.subjectBadge}>
                  {detail.subject || "Bilinmiyor"}
                </Text>
              </View>
            </View>
          </View>

          {userData?.role === "student" && (
            <>
              <Text style={styles.section}>Puan Ver</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable
                    key={i}
                    onPress={() => setUserRating(i)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons
                      name={i <= userRating ? "star" : "star-outline"}
                      size={36}
                      color="#FFD700"
                      style={styles.star}
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={styles.section}>Yorum Yaz</Text>
              <TextInput
                style={styles.input}
                placeholder="Dersleri, öğretim stili, sınav zorluk seviyesi hakkında değerlendirmenizi yazın..."
                placeholderTextColor={colors.placeholder}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={submitRating}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>Gönder</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.sectionContainer}>
            <Text style={styles.section}>Değerlendirmeler</Text>

            {ratings.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubble-outline"
                  size={48}
                  color={colors.placeholder}
                />
                <Text style={styles.empty}>
                  Henüz değerlendirme yapılmamış.
                </Text>
              </View>
            )}

            {ratings.map((item) => (
              <View key={item.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.ratingDateContainer}>
                    <View style={styles.starsRowSmall}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Ionicons
                          key={i}
                          name={i <= item.rating ? "star" : "star-outline"}
                          size={16}
                          color="#FFD700"
                          style={styles.starSmall}
                        />
                      ))}
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {item.userId === auth.currentUser?.uid &&
                    userData?.role === "student" && (
                      <View style={styles.commentActionsContainer}>
                        <TouchableOpacity
                          style={styles.commentAction}
                          onPress={() => confirmDelete(item.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.commentAction}
                          onPress={() => {
                            setEditingCommentId(item.id);
                            setEditedCommentText(item.comment);
                          }}
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                </View>

                {editingCommentId === item.id ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editedCommentText}
                      onChangeText={setEditedCommentText}
                      multiline
                      textAlignVertical="top"
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditingCommentId(null)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={16} color={colors.text} />
                        <Text style={styles.cancelButtonText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => updateRating(item.id, editedCommentText)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.textInverse}
                        />
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : item.comment ? (
                  <Text style={styles.commentText}>{item.comment}</Text>
                ) : null}

                {userData?.role === "student" && (
                  <View style={styles.likeDislikeRow}>
                    <TouchableOpacity
                      style={[
                        styles.likeButton,
                        item.likedBy?.includes(auth.currentUser?.uid || "") &&
                          styles.likeButtonActive,
                      ]}
                      onPress={() => handleLike(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="thumbs-up"
                        size={18}
                        color={
                          item.likedBy?.includes(auth.currentUser?.uid || "")
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                      <Text style={styles.iconCount}>{item.likes ?? 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.likeButton,
                        item.dislikedBy?.includes(
                          auth.currentUser?.uid || ""
                        ) && styles.dislikeButtonActive,
                      ]}
                      onPress={() => handleDislike(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="thumbs-down"
                        size={18}
                        color={
                          item.dislikedBy?.includes(auth.currentUser?.uid || "")
                            ? colors.error
                            : colors.textSecondary
                        }
                      />
                      <Text style={styles.iconCount}>{item.dislikes ?? 0}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
