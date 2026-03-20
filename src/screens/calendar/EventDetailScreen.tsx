import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { CalendarStackParamList } from "../../navigation/CalendarStackNavigator";
import {
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../../services/firebase";
import { auth } from "../../services/firebase/firebase";
import { styles } from "./EventDetailScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { getEventDateInfo, formatEventDate } from "../../utils/dateUtils";
import DateTimePicker from "@react-native-community/datetimepicker";

type EventDetailRouteProp = RouteProp<CalendarStackParamList, "EventDetail">;

interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  eventType?: "exam" | "other";
  createdAt: string;
}

export default function EventDetailScreen() {
  const route = useRoute<EventDetailRouteProp>();
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEventType, setEditEventType] = useState<"exam" | "other">("other");
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const allEvents = await getCalendarEvents(uid);
        const found = allEvents.find((e) => e.id === eventId) || null;
        setEvent(found);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }
  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Etkinlik bulunamadı.</Text>
      </View>
    );
  }

  const dateInfo = getEventDateInfo(event.date);

  const handleDelete = async () => {
    Alert.alert(
      "Etkinliği Sil",
      "Bu etkinliği silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const uid = auth.currentUser?.uid;
            if (!uid || !event) return;
            try {
              await deleteCalendarEvent(uid, event.id);
              navigation.goBack();
            } catch {
              Alert.alert("Hata", "Etkinlik silinemedi");
            }
          },
        },
      ]
    );
  };

  const openEditModal = () => {
    if (!event) return;
    setEditTitle(event.title);
    setEditTime(event.time || "");
    setEditDescription(event.description || "");
    setEditEventType(event.eventType || "other");
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !event) return;
    try {
      await updateCalendarEvent(uid, event.id, {
        title: editTitle.trim(),
        time: editTime.trim(),
        description: editDescription.trim(),
        eventType: editEventType,
      });
      setEditModalVisible(false);
      const allEvents = await getCalendarEvents(uid);
      const found = allEvents.find((e) => e.id === event.id) || null;
      setEvent(found);
    } catch {
      Alert.alert("Hata", "Etkinlik güncellenemedi");
    }
  };

  const handleEditTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      const hours = selected.getHours().toString().padStart(2, "0");
      const minutes = selected.getMinutes().toString().padStart(2, "0");
      setEditTime(`${hours}:${minutes}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="Geri Dön"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
      <View style={styles.detailCard}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons
            name={
              event.eventType === "exam" ? "school-outline" : "calendar-outline"
            }
            size={22}
            color={event.eventType === "exam" ? "#FF6B35" : "#6200ee"}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {event.title}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: dateInfo.statusColor },
          ]}
        >
          <Ionicons
            name={
              dateInfo.isExpired ? "checkmark-circle-outline" : "time-outline"
            }
            size={16}
            color="white"
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{dateInfo.displayText}</Text>
        </View>

        {Boolean(dateInfo.isExpired) && (
          <View style={styles.expiredNotice}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#666"
              style={styles.noticeIcon}
            />
            <Text style={styles.expiredText}>Bu etkinlik sona ermiştir</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.primary}
            style={styles.metaIcon}
          />
          <Text style={styles.meta}>Tarih: {formatEventDate(event.date)}</Text>
        </View>
        {event.time && (
          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.meta}>Saat: {event.time}</Text>
          </View>
        )}
        {event.description && (
          <View style={styles.metaRow}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.meta}>{event.description}</Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <Ionicons
            name="bookmark-outline"
            size={18}
            color={colors.primary}
            style={styles.metaIcon}
          />
          <Text style={styles.meta}>
            Oluşturulma: {new Date(event.createdAt).toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <TouchableOpacity onPress={openEditModal} style={{ padding: 8 }}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
            <Ionicons name="trash-outline" size={22} color={colors.errorAlt} />
          </TouchableOpacity>
        </View>
      </View>

      {editModalVisible && (
        <Modal visible={editModalVisible} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Etkinliği Düzenle</Text>
              <TextInput
                placeholder="Etkinlik başlığı"
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
              />
              <View style={styles.timePickerRow}>
                <Text style={styles.timePickerLabel}>Saat</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                  accessibilityLabel="Saat seç"
                >
                  <Text style={styles.timePickerButtonText}>
                    {editTime ? editTime : "Saat seçin"}
                  </Text>
                </TouchableOpacity>
              </View>
              {showTimePicker && (
                <DateTimePicker
                  value={
                    editTime
                      ? new Date(`2025-01-01T${editTime}:00`)
                      : new Date()
                  }
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleEditTimeChange}
                />
              )}
              <TextInput
                placeholder="Açıklama"
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
              />
              <View style={styles.eventTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    editEventType === "exam" && styles.selectedEventTypeButton,
                  ]}
                  onPress={() => setEditEventType("exam")}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      editEventType === "exam" && styles.selectedEventTypeText,
                    ]}
                  >
                    Sınav
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    editEventType === "other" && styles.selectedEventTypeButton,
                  ]}
                  onPress={() => setEditEventType("other")}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      editEventType === "other" && styles.selectedEventTypeText,
                    ]}
                  >
                    Diğer
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.buttonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSave}
                  onPress={handleEditSave}
                >
                  <Text style={styles.buttonSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}
