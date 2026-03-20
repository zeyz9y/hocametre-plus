import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  getAllQuestions,
  deleteQuestion,
} from "../../services/firebase/questionsUtils";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { auth } from "../../services/firebase/firebase";
import { styles } from "./ForumScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

interface Question {
  id: string;
  title: string;
  body: string;
  course: string;
  authorId: string;
  authorName: string | null;
  isAnonymous: boolean;
  upvotes: string[];
  timestamp?: any;
  answerCount: number;
}

export default function ForumScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const fetchData = async () => {
    const qList = await getAllQuestions();
    setQuestions(qList);
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDelete = (questionId: string) => {
    Alert.alert(
      "Soruyu Sil",
      "Bu soruyu silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            await deleteQuestion(questionId);
            fetchData();
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const filteredQuestions = useMemo(() => {
    if (!searchQuery && selectedFilter === "all") {
      return questions;
    }

    return questions.filter((q) => {
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.course.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "mine" && q.authorId === auth.currentUser?.uid) ||
        (selectedFilter === "popular" && q.answerCount > 2);

      return matchesSearch && matchesFilter;
    });
  }, [questions, searchQuery, selectedFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Soru veya ders ara..."
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
            Sorularım
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "popular" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("popular")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "popular" && styles.filterChipTextActive,
            ]}
          >
            Popüler
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredQuestions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.questionBox}
            onPress={() =>
              navigation.navigate("QuestionDetail", { question: item })
            }
            activeOpacity={0.7}
          >
            <View style={styles.questionHeader}>
              <Text style={styles.title}>{item.title}</Text>
              {item.authorId === auth.currentUser?.uid && (
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.courseContainer}>
              <Ionicons
                name="library-outline"
                size={16}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.course}>{item.course}</Text>
            </View>

            <View style={styles.metaInfoContainer}>
              <View style={styles.author}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  {item.isAnonymous ? "Anonim" : item.authorName}
                </Text>
              </View>

              <View style={styles.metaInfoDivider} />

              <View style={styles.metaInfo}>
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color={colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  {item.answerCount} cevap
                </Text>
              </View>

              {item.timestamp?.toDate && (
                <>
                  <View style={styles.metaInfoDivider} />
                  <View style={styles.timestamp}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      {item.timestamp.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Aramanızla eşleşen soru bulunamadı."
                : "Henüz soru yok. Soru sormak için + butonuna tıklayın."}
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AskQuestion")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
