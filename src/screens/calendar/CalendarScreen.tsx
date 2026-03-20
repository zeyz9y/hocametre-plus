import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import {
  addCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../../services/firebase";
import { auth } from "../../services/firebase/firebase";
import { styles } from "./CalendarScreen.styles";
import { getEventDateInfo } from "../../utils/dateUtils";
import { colors } from "../../theme";

interface Event {
  id: string;
  date: string;
  title: string;
  time?: string;
  description?: string;
  eventType?: "exam" | "other";
  createdAt: string;
}

interface Dot {
  key: string;
  color: string;
}

interface MarkedDay {
  dots: Dot[];
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
}

type MarkedDates = Record<string, MarkedDay>;

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEventType, setNewEventType] = useState<"exam" | "other">("other");
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadEvents = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const data = await getCalendarEvents(uid);
      setEvents(data);

      const marks: Record<string, { dots: Dot[] }> = {};

      data.forEach((e) => {
        if (!marks[e.date]) {
          marks[e.date] = { dots: [] };
        }
        marks[e.date].dots.push({ key: e.id, color: colors.primary });
      });

      setMarkedDates(marks);
    } catch {
      Alert.alert("Hata", "Etkinlikler yüklenemedi");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);

    setMarkedDates((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((date) => {
        delete next[date].selected;
        delete next[date].selectedColor;
        delete next[date].selectedTextColor;
      });

      next[day.dateString] = {
        dots: next[day.dateString]?.dots ?? [],
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.textInverse,
      };

      return next;
    });
  };

  const openAddEventModal = () => {
    setNewTitle("");
    setNewTime("");
    setNewDescription("");
    setNewEventType("other");
    setEditMode(false);
    setEditingEventId(null);
    setModalVisible(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedDate(event.date);
    setNewTitle(event.title);
    setNewTime(event.time || "");
    setNewDescription(event.description || "");
    setNewEventType(event.eventType || "other");
    setEditMode(true);
    setEditingEventId(event.id);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen bir başlık girin.");
      return;
    }
    if (!selectedDate) {
      Alert.alert("Eksik Bilgi", "Lütfen bir tarih seçin.");
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      if (editMode && editingEventId) {
        await updateCalendarEvent(uid, editingEventId, {
          title: newTitle.trim(),
          time: newTime.trim(),
          description: newDescription.trim(),
          eventType: newEventType,
        });
      } else {
        await addCalendarEvent(uid, {
          date: selectedDate,
          title: newTitle.trim(),
          time: newTime.trim(),
          description: newDescription.trim(),
          eventType: newEventType,
        });
      }
      setModalVisible(false);
      setEditMode(false);
      setEditingEventId(null);
      await loadEvents();
    } catch {
      Alert.alert("Hata", "Etkinlik kaydedilemedi");
    }
  };

  const handleDelete = (eventId: string) => {
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
            if (!uid) return;
            try {
              await deleteCalendarEvent(uid, eventId);
              if (selectedDate) setModalVisible(false);
              await loadEvents();
            } catch {
              Alert.alert("Hata", "Etkinlik silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllEvents = () => {
    if (events.length === 0) return;

    Alert.alert(
      "Tüm Etkinlikleri Sil",
      "Tüm etkinlikleri silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            try {
              await Promise.all(
                events.map((ev) => deleteCalendarEvent(uid, ev.id))
              );
              setSelectedDate("");
              await loadEvents();
            } catch {
              Alert.alert("Hata", "Etkinlikler silinemedi");
            }
          },
        },
      ]
    );
  };

  const eventsForSelected = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => {
      const dateInfoA = getEventDateInfo(a.date);
      const dateInfoB = getEventDateInfo(b.date);

      if (dateInfoA.isExpired && !dateInfoB.isExpired) return 1;
      if (!dateInfoA.isExpired && dateInfoB.isExpired) return -1;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const renderRightActions = (id: string) => (
    <RectButton style={styles.deleteButton} onPress={() => handleDelete(id)}>
      <Text style={styles.deleteButtonText}>Sil</Text>
    </RectButton>
  );

  const handleTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      const hours = selected.getHours().toString().padStart(2, "0");
      const minutes = selected.getMinutes().toString().padStart(2, "0");
      setNewTime(`${hours}:${minutes}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Calendar
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={onDayPress}
          firstDay={1}
          theme={{
            todayTextColor: colors.accent,
            todayBackgroundColor: colors.primaryLight,
            arrowColor: colors.accent,
            monthTextColor: colors.primary,
          }}
        />

        {selectedDate && (
          <View style={styles.eventListContainer}>
            <View style={styles.eventListHeader}>
              <View style={styles.eventListTitleRow}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  style={styles.eventListTitleIcon}
                />
                <Text style={styles.eventListTitle}>
                  {selectedDate.split("-").reverse().join("/")} Etkinlikleri
                </Text>
              </View>

              {eventsForSelected.length > 0 && (
                <TouchableOpacity
                  style={styles.deleteAllIconBtn}
                  onPress={handleDeleteAllEvents}
                  accessibilityLabel="Tüm Etkinlikleri Sil"
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    style={styles.deleteAllIcon}
                  />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={eventsForSelected}
              keyExtractor={(item) => item.id}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={
                <Text style={styles.noEventText}>Etkinlik yok.</Text>
              }
              renderItem={({ item }) => (
                <Swipeable
                  renderRightActions={() => renderRightActions(item.id)}
                >
                  <TouchableOpacity
                    style={styles.eventItem}
                    onPress={() =>
                      navigation.navigate("EventDetail", { eventId: item.id })
                    }
                    onLongPress={() => handleEdit(item)}
                  >
                    <Ionicons
                      name={
                        item.eventType === "exam"
                          ? "school-outline"
                          : "calendar-outline"
                      }
                      size={22}
                      color={
                        item.eventType === "exam"
                          ? colors.secondary
                          : colors.primary
                      }
                      style={styles.eventIcon}
                    />

                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      <Text style={{ color: "#666", fontSize: 13 }}>
                        {item.time ? `Saat: ${item.time}` : ""}
                        {item.description ? `\n${item.description}` : ""}
                      </Text>

                      <View style={styles.eventStatusRow}>
                        <Ionicons
                          name={
                            getEventDateInfo(item.date).isExpired
                              ? "checkmark-circle-outline"
                              : "time-outline"
                          }
                          size={14}
                          color={getEventDateInfo(item.date).statusColor}
                        />
                        <Text
                          style={[
                            styles.eventStatus,
                            { color: getEventDateInfo(item.date).statusColor },
                          ]}
                        >
                          {getEventDateInfo(item.date).displayText}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              )}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.addEventButton}
          onPress={openAddEventModal}
          accessibilityLabel="Etkinlik Ekle"
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editMode ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
              </Text>

              <TextInput
                placeholder="Etkinlik başlığı"
                style={styles.input}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <View style={styles.timePickerRow}>
                <Text style={styles.timePickerLabel}>Saat</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                  accessibilityLabel="Saat seç"
                >
                  <Text style={styles.timePickerButtonText}>
                    {newTime ? newTime : "Saat seçin"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={
                    newTime ? new Date(`2025-01-01T${newTime}:00`) : new Date()
                  }
                  mode="time"
                  is24Hour
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}

              <TextInput
                placeholder="Açıklama"
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
              />

              <View style={styles.eventTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    newEventType === "exam" && styles.selectedEventTypeButton,
                  ]}
                  onPress={() => setNewEventType("exam")}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      newEventType === "exam" && styles.selectedEventTypeText,
                    ]}
                  >
                    Sınav
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    newEventType === "other" && styles.selectedEventTypeButton,
                  ]}
                  onPress={() => setNewEventType("other")}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      newEventType === "other" && styles.selectedEventTypeText,
                    ]}
                  >
                    Diğer
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSave}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
