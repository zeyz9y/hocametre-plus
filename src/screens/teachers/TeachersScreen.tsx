import { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import type { AppDrawerParamList } from "../../navigation/AppDrawer";
import type { TeachersStackParamList } from "../../navigation/TeacherStackNavigator";
import { fetchTeachers } from "../../services/firebase";

import { styles } from "./TeachersScreen.styles";
import { colors, spacing } from "../../theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface Teacher {
  id: string;
  name: string;
  subject: string;
  avgRating: number;
  commentCount?: number;
}

interface Category {
  key: string;
  title: string;
  icon: IconName;
  teacher?: Teacher;
  color?: string;
}

type TeachersNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<TeachersStackParamList, "Teachers">,
  DrawerNavigationProp<AppDrawerParamList, "TeachersStack">
>;

export default function TeachersScreen() {
  const navigation = useNavigation<TeachersNavProp>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadTeachers = async () => {
    try {
      setRefreshing(true);
      const list = await fetchTeachers();
      setTeachers(list);
    } catch (err) {
      console.error("Hocalar yüklenirken hata:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = useMemo(
    () =>
      [...teachers]
        .filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.subject &&
              t.subject.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => b.avgRating - a.avgRating),
    [teachers, search]
  );

  const topRated = useMemo(
    () => [...teachers].sort((a, b) => b.avgRating - a.avgRating)[0],
    [teachers]
  );

  const mostCommented = useMemo(() => {
    const withComments = [...teachers].filter((t) => (t.commentCount || 0) > 0);
    if (withComments.length > 0) {
      return withComments.sort(
        (a, b) => (b.commentCount || 0) - (a.commentCount || 0)
      )[0];
    }
    return null;
  }, [teachers]);

  const mostRecent = teachers[teachers.length - 1];

  const categories: Category[] = [
    {
      key: "rated",
      title: "En Çok Puan",
      icon: "star" as IconName,
      teacher: topRated,
      color: "#4C51BF",
    },
    ...(mostCommented
      ? [
          {
            key: "commented",
            title: "En Çok Yorum",
            icon: "chatbubbles" as IconName,
            teacher: mostCommented,
            color: "#2B6CB0",
          },
        ]
      : []),
    {
      key: "recent",
      title: "Yeni Eklenen",
      icon: "time" as IconName,
      teacher: mostRecent,
      color: "#2F855A",
    },
  ];

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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadTeachers}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
          </View>
          {categories.some((cat) => cat.teacher) ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map(
                (cat) =>
                  cat.teacher && (
                    <Pressable
                      key={cat.key}
                      style={[styles.catCard, { backgroundColor: cat.color }]}
                      onPress={() =>
                        navigation.navigate("TeacherDetail", {
                          teacherId: cat.teacher!.id,
                        })
                      }
                      android_ripple={{ color: "rgba(255,255,255,0.1)" }}
                    >
                      <View style={styles.catPattern}>
                        {cat.key === "rated" && (
                          <Ionicons
                            name="star"
                            size={120}
                            color="#fff"
                            style={{
                              position: "absolute",
                              right: -20,
                              bottom: -20,
                              transform: [{ rotate: "15deg" }],
                            }}
                          />
                        )}
                        {cat.key === "commented" && (
                          <Ionicons
                            name="chatbubbles"
                            size={120}
                            color="#fff"
                            style={{
                              position: "absolute",
                              right: -20,
                              bottom: -20,
                              transform: [{ rotate: "15deg" }],
                            }}
                          />
                        )}
                        {cat.key === "recent" && (
                          <Ionicons
                            name="time"
                            size={120}
                            color="#fff"
                            style={{
                              position: "absolute",
                              right: -20,
                              bottom: -20,
                              transform: [{ rotate: "15deg" }],
                            }}
                          />
                        )}
                      </View>
                      <View style={styles.catGradientOverlay} />
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{cat.title}</Text>
                      </View>
                      <View style={styles.catCardContent}>
                        <View style={styles.catIconContainer}>
                          <Ionicons name={cat.icon} size={32} color="#fff" />
                        </View>
                        <View>
                          <Text style={styles.catName}>
                            {cat.teacher!.name}
                          </Text>
                          {cat.teacher.subject && (
                            <Text style={styles.catSub} numberOfLines={1}>
                              {cat.teacher.subject}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  )
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyFeaturedContainer}>
              <Text style={styles.emptyText}>
                Henüz öne çıkan hoca bulunmamaktadır.
              </Text>
            </View>
          )}

          <View style={{ marginBottom: spacing.sm }}>
            <Text style={styles.sectionTitle}>Tüm Hocalar</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Hoca veya ders ara..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={colors.placeholder}
                returnKeyType="search"
              />
              {search !== "" && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          </View>
          <FlatList
            data={filteredTeachers}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {search
                  ? "Aramanıza uygun hoca bulunamadı."
                  : "Henüz hoca yok."}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  navigation.navigate("TeacherDetail", { teacherId: item.id })
                }
              >
                <View style={styles.avatar}>
                  <Ionicons name="glasses" size={24} color="#fff" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.subject && (
                    <View style={styles.subjectContainer}>
                      <Ionicons
                        name="library-outline"
                        size={14}
                        color={colors.primary}
                        style={styles.subjectIcon}
                      />
                      <Text style={styles.subject} numberOfLines={1}>
                        {item.subject}
                      </Text>
                    </View>
                  )}
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Puan:</Text>
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Ionicons
                          key={i}
                          name={
                            i <= Math.round(item.avgRating)
                              ? "star"
                              : "star-outline"
                          }
                          size={16}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingValue}>
                      {item.avgRating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
