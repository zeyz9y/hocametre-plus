import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchNotesFromFirestore, auth } from "../../services/firebase";
import { colors } from "../../theme";

import { styles } from "./NoteDetailScreen.styles";

interface Note {
  id: string;
  title: string;
  url: string;
  course?: string;
  createdAt: string;
  uploaderId?: string;
  uploaderEmail?: string;
  uploaderNickname?: string;
  publicId?: string;
  thumbnailUrl?: string;
}

export default function NoteDetailScreen({ route }: any) {
  const { noteId } = route.params;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    (async () => {
      try {
        const allNotes = await fetchNotesFromFirestore();
        const found = allNotes.find((n) => n.id === noteId) || null;
        setNote(found);
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [noteId]);

  const handleOpenPdf = () => {
    if (note?.url) {
      Linking.openURL(note.url);
    }
  };

  const handleShareNote = async () => {
    if (note) {
      try {
        await Share.share({
          message: `Bak bu not çok önemli: ${note.title} - ${note.url}`,
          url: note.url,
          title: note.title,
        });
      } catch (error) {
        console.error("Error sharing note:", error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Not bulunamadı.</Text>
      </View>
    );
  }

  const uploaderName =
    note.uploaderNickname || note.uploaderEmail?.split("@")[0] || "Anonim";
  const formattedDate = new Date(note.createdAt).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Geri Dön</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.title}>{note.title}</Text>
          {note.course && (
            <View style={styles.courseContainer}>
              <Ionicons
                name="library-outline"
                size={16}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.courseText}>{note.course}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>Yükleyen: {uploaderName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>Yüklenme: {formattedDate}</Text>
          </View>
        </View>

        <View style={styles.thumbnailContainer}>
          {note.thumbnailUrl ? (
            <TouchableOpacity onPress={handleOpenPdf}>
              <Image
                source={{ uri: note.thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.metaText}>PDF Önizlemesi Yok</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenPdf}>
            <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>PDF'i Aç</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareNote}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
