import { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  uploadNoteToCloudinary,
  saveNoteToFirestore,
  fetchNotesFromFirestore,
  deleteNoteFromFirestore,
  deleteFileFromFirebase,
} from "../../services/firebase";
import { auth } from "../../services/firebase";

import { styles } from "./NotesScreen.styles";
import { colors } from "../../theme";

type Note = {
  id: string;
  title: string;
  url: string;
  course?: string;
  createdAt?: string;
  uploaderId?: string;
  uploaderEmail?: string;
  uploaderNickname?: string;
  publicId?: string;
  thumbnailUrl?: string;
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const loadNotes = async () => {
    try {
      const raw = await fetchNotesFromFirestore();
      setNotes(
        raw.map((n) => ({
          id: n.id,
          title: n.title,
          url: n.url,
          course: n.course,
          createdAt: n.createdAt,
          uploaderId: n.uploaderId,
          uploaderEmail: n.uploaderEmail,
          uploaderNickname: n.uploaderNickname,
          publicId: n.publicId,
          thumbnailUrl: n.thumbnailUrl,
        }))
      );
    } catch (e) {
      console.error("fetchNotes error", e);
      Alert.alert("Hata", "Notlar yüklenemedi.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isFocused) {
      loadNotes();
    }
  }, [isFocused]);

  const handleUpload = async () => {
    if (!fileName.trim()) {
      Alert.alert("Hata", "Lütfen dosya adı giriniz.");
      return;
    }

    if (!course.trim()) {
      Alert.alert("Hata", "Lütfen ders adı giriniz.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const uri = result.assets[0].uri;

      setLoading(true);

      const cloudinaryResult = await uploadNoteToCloudinary(
        uri,
        fileName.trim()
      );

      await saveNoteToFirestore(
        fileName.trim(),
        cloudinaryResult.url,
        cloudinaryResult.publicId,
        course.trim()
      );

      setFileName("");
      setCourse("");
      setUploadModalVisible(false);
      loadNotes();

      Alert.alert("Başarılı", "Dosya yüklendi.");
    } catch (err: any) {
      console.error("upload error", err);
      Alert.alert("Hata", err.message || "Yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (note: Note) => {
    const currentUserId = auth.currentUser?.uid;

    if (note.uploaderId && note.uploaderId !== currentUserId) {
      Alert.alert(
        "İzin Hatası",
        "Sadece kendi yüklediğiniz notları silebilirsiniz."
      );
      return;
    }

    Alert.alert("Sil", "Notu silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteNoteFromFirestore(note.id);
            await deleteFileFromFirebase(note.url, note.publicId);

            loadNotes();
            Alert.alert("Başarılı", "Not silindi.");
          } catch (error: any) {
            console.error("delete error", error);
            Alert.alert("Hata", error.message || "Silme işlemi başarısız.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery && selectedFilter === "all") {
      return notes;
    }

    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.course &&
          note.course.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "mine" &&
          note.uploaderId === auth.currentUser?.uid);

      return matchesSearch && matchesFilter;
    });
  }, [notes, searchQuery, selectedFilter]);

  const renderItem = ({ item }: { item: Note }) => {
    const currentUserId = auth.currentUser?.uid;
    const canDelete = item.uploaderId === currentUserId;
    const uploaderName =
      item.uploaderNickname || item.uploaderEmail?.split("@")[0] || "Anonim";

    return (
      <View style={styles.card}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.cardThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={colors.primary}
            />
          </View>
        )}
        <Pressable
          onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
          style={styles.cardContent}
          android_ripple={{ color: `${colors.text}10` }}
        >
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            {item.course && (
              <View style={styles.courseContainer}>
                <Ionicons
                  name="library-outline"
                  size={14}
                  color={colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.courseText}>{item.course}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              {item.createdAt && (
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              )}
              <Text style={styles.uploader}>Yükleyen: {uploaderName}</Text>
            </View>
          </View>
        </Pressable>
        {canDelete && (
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Not başlığı veya ders ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <View style={styles.filterChipsContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "all" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "all" && styles.filterChipTextActive,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "mine" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("mine")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "mine" && styles.filterChipTextActive,
            ]}
          >
            Notlarım
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredNotes.length === 0 && !loading
            ? styles.emptyContainer
            : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color={colors.placeholder}
              />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Aramanızla eşleşen not bulunamadı."
                  : "Henüz not yok."}
              </Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={uploadModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Not Yükle</Text>
              <TouchableOpacity
                onPress={() => setUploadModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Dosya Adı</Text>
            <TextInput
              style={[styles.modalInput, loading && styles.inputDisabled]}
              placeholder="Dosya adı"
              value={fileName}
              onChangeText={setFileName}
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Ders Adı</Text>
            <TextInput
              style={[styles.modalInput, loading && styles.inputDisabled]}
              placeholder="Ders adı"
              value={course}
              onChangeText={setCourse}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.uploadButton, loading && styles.uploadBtnDisabled]}
              onPress={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.uploadButtonText}>
                    Dosya Seç ve Yükle
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setUploadModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
