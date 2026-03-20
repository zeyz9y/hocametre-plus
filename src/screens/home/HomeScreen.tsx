import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  auth,
  fetchNotesFromFirestore,
  getCalendarEvents,
  getAllQuestions,
} from "../../services/firebase/index";
import { getUserDataFromFirestore } from "../../services/firebase/profileUtils";
import { getEventDateInfo } from "../../utils/dateUtils";

import { styles } from "./HomeScreen.styles";
import { colors, spacing } from "../../theme";

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

interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  eventType?: "exam" | "other";
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  course: string;
  authorName: string | null;
  isAnonymous: boolean;
  answerCount: number;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [userData, setUserData] = useState<{
    role: string;
    isAnonymous: boolean;
    nickname?: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const [rawNotes, rawEvents, rawQuestions] = await Promise.all([
        fetchNotesFromFirestore(),
        uid ? getCalendarEvents(uid) : Promise.resolve([]),
        getAllQuestions(),
      ]);

      const sortedNotes = rawNotes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotes(sortedNotes);
      const sortedEvents = rawEvents.sort((a, b) => {
        const dateInfoA = getEventDateInfo(a.date);
        const dateInfoB = getEventDateInfo(b.date);

        if (dateInfoA.isExpired && !dateInfoB.isExpired) return 1;
        if (!dateInfoA.isExpired && dateInfoB.isExpired) return -1;

        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setEvents(sortedEvents);

      setQuestions(rawQuestions);
    } catch (error) {
      console.error("Veri yüklenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
      const fetchUserData = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const data = await getUserDataFromFirestore(uid);
        if (data) {
          setUserData({
            role: data.role,
            isAnonymous: data.isAnonymous,
            nickname: data.nickname,
          });
        }
      };
      fetchUserData();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/hocametre.png")}
              style={styles.logo}
            />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Merhaba{userData?.nickname ? `, ${userData.nickname}` : ""} 👋
            </Text>
            <Text style={styles.welcomeSubText}>
              Kampüste ne var ne yok keşfet!
            </Text>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="document-text"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>Son Eklenen Notlar</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "NotesStack" }],
                });
              }}
            >
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={notes.slice(0, 5)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => {
              const uploaderName =
                item.uploaderNickname ||
                item.uploaderEmail?.split("@")[0] ||
                "Anonim";
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("NotesStack", {
                      screen: "NoteDetail",
                      params: { noteId: item.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.cardWithThumbnail}>
                    <View style={styles.thumbnailContainer}>
                      {item.thumbnailUrl ? (
                        <Image
                          source={{ uri: item.thumbnailUrl }}
                          style={styles.thumbnail}
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
                    </View>

                    <View style={styles.noteContentContainer}>
                      <View>
                        <View style={styles.cardHeader}>
                          <Ionicons
                            name="document-text-outline"
                            size={18}
                            color={colors.primary}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.cardTitle} numberOfLines={2}>
                            {item.title}
                          </Text>
                        </View>

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
                      </View>

                      <View style={styles.cardFooter}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="person-outline"
                            size={14}
                            color={colors.textSecondary}
                            style={{ marginRight: spacing.xs }}
                          />
                          <Text style={styles.uploaderText}>
                            {uploaderName}
                          </Text>
                        </View>

                        <Text style={styles.dateText}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Not bulunamadı.</Text>
            }
          />
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIcon}>
                <Ionicons name="calendar" size={18} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Etkinlikler</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "CalendarStack" }],
                });
              }}
            >
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={events.slice(0, 5)}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("CalendarStack", {
                    screen: "EventDetail",
                    params: { eventId: item.id },
                  })
                }
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={[
                      styles.sectionIcon,
                      { marginRight: spacing.sm, alignSelf: "flex-start" },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.eventType === "exam"
                          ? "school-outline"
                          : "calendar-outline"
                      }
                      size={18}
                      color={
                        item.eventType === "exam"
                          ? colors.secondary
                          : colors.primary
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.dateRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={colors.textSecondary}
                        style={{ marginRight: spacing.xs }}
                      />
                      <Text style={styles.dateText} numberOfLines={1}>
                        {item.time ? `${item.time} • ` : ""}
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>

                    {item.description ? (
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 13,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getEventDateInfo(item.date)
                          .statusColor,
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getEventDateInfo(item.date).displayText}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Etkinlik bulunamadı.</Text>
            }
          />
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>Son Sorular</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "ForumStack" }],
                });
              }}
            >
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={questions.slice(0, 5)}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("ForumStack", {
                    screen: "QuestionDetail",
                    params: { question: item },
                  })
                }
                activeOpacity={0.7}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <View
                    style={[
                      styles.sectionIcon,
                      { marginRight: spacing.sm, alignSelf: "flex-start" },
                    ]}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.courseContainer}>
                      <Ionicons
                        name="library-outline"
                        size={14}
                        color={colors.primary}
                        style={{ marginRight: spacing.xs }}
                      />
                      <Text style={styles.courseText} numberOfLines={1}>
                        {item.course}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.uploaderContainer}>
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={styles.uploaderText} numberOfLines={1}>
                      {item.isAnonymous ? "Anonim" : item.authorName || ""}
                    </Text>
                  </View>
                  <View style={styles.answerCountContainer}>
                    <View style={styles.badgeContainer}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={12}
                        color={colors.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.badge}>{item.answerCount} cevap</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Soru bulunamadı.</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
