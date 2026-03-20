import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { auth } from "../../services/firebase/firebase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./QuestionDetailScreen.styles";
import { colors } from "../../theme";
import {
  addAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswers,
  upvoteAnswer,
  removeUpvoteAnswer,
} from "../../services/firebase/questionsUtils";

interface Answer {
  id: string;
  body: string;
  authorId: string;
  authorName: string | null;
  isAnonymous: boolean;
  upvotes: string[];
  timestamp?: any;
}

export default function QuestionDetailScreen({ route }: any) {
  const { question } = route.params;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const editInputRef = useRef<TextInput>(null);

  const fetchAnswers = async () => {
    const answerList = await getAnswers(question.id);
    setAnswers(answerList);
  };

  useEffect(() => {
    if (isFocused) {
      fetchAnswers();
    }
  }, [isFocused]);

  useEffect(() => {
    if (editingAnswerId) {
      editInputRef.current?.focus();
    }
  }, [editingAnswerId]);

  const handleAddAnswer = async () => {
    const user = auth.currentUser;
    if (!user || !body.trim()) return;

    await addAnswer(question.id, body.trim(), user, isAnonymous);
    setBody("");
    setIsAnonymous(false);
    fetchAnswers();
  };

  const handleUpvote = async (answerId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const answer = answers.find((a) => a.id === answerId);
    if (!answer) return;

    if (answer.upvotes.includes(userId)) {
      await removeUpvoteAnswer(question.id, answerId, userId);
    } else {
      await upvoteAnswer(question.id, answerId, userId);
    }
    fetchAnswers();
  };

  const confirmDelete = (answerId: string) => {
    Alert.alert("Cevabı Sil", "Bu cevabı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        onPress: async () => {
          await deleteAnswer(question.id, answerId);
          fetchAnswers();
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Geri Dön</Text>
        </TouchableOpacity>
        <View style={styles.questionBox}>
          <Text style={styles.title}>{question.title}</Text>
          <View style={styles.subtitleContainer}>
            <Ionicons
              name="library-outline"
              size={16}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.subtitle}>Ders: {question.course}</Text>
          </View>
          <Text style={styles.body}>{question.body}</Text>
          <View style={styles.authorContainer}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {question.isAnonymous ? "Anonim" : question.authorName}
            </Text>
            {question.timestamp && (
              <>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginLeft: 10, marginRight: 4 }}
                />
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {question.timestamp.toDate
                    ? question.timestamp.toDate().toLocaleDateString()
                    : ""}
                </Text>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginLeft: 10, marginRight: 4 }}
                />
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {question.timestamp.toDate
                    ? question.timestamp.toDate().toLocaleTimeString()
                    : ""}
                </Text>
              </>
            )}
          </View>
        </View>
        <Text style={styles.sectionTitle}>Cevaplar</Text>
        {answers.length === 0 ? (
          <Text style={styles.noAnswer}>
            Henüz cevap yok. İlk cevabı sen yaz!
          </Text>
        ) : (
          answers.map((item) => (
            <View style={styles.answer} key={item.id}>
              {editingAnswerId === item.id ? (
                <>
                  <TextInput
                    ref={editInputRef}
                    value={editedBody}
                    onChangeText={setEditedBody}
                    multiline
                    style={[styles.input, { backgroundColor: "#fff" }]}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={async () => {
                        await updateAnswer(
                          question.id,
                          item.id,
                          editedBody.trim()
                        );
                        setEditingAnswerId(null);
                        fetchAnswers();
                      }}
                    >
                      <Text style={styles.buttonText}>Kaydet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: colors.textSecondary },
                      ]}
                      onPress={() => setEditingAnswerId(null)}
                    >
                      <Text style={styles.buttonText}>İptal</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.answerBody}>{item.body}</Text>
                  <View style={styles.answerMetaContainer}>
                    <View style={styles.answerMetaLeft}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="person-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {item.isAnonymous ? "Anonim" : item.authorName}
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {item.timestamp?.toDate().toLocaleDateString() ?? ""}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.answerMetaRight}>
                      {item.authorId === auth.currentUser?.uid && (
                        <View style={styles.answerActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingAnswerId(item.id);
                              setEditedBody(item.body);
                            }}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <Ionicons
                              name="pencil-outline"
                              size={18}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => confirmDelete(item.id)}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color={colors.error}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.upvoteContainer}
                        onPress={() => handleUpvote(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            item.upvotes.includes(auth.currentUser?.uid ?? "")
                              ? "arrow-up-circle"
                              : "arrow-up-circle-outline"
                          }
                          size={20}
                          color={colors.primary}
                        />
                        <Text style={styles.upvoteCount}>
                          {item.upvotes.length}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))
        )}
        <Text style={styles.sectionTitle}>Cevap Yaz</Text>
        <TextInput
          placeholder="Cevabınızı yazın..."
          value={body}
          onChangeText={setBody}
          multiline
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholderTextColor={colors.textTertiary}
        />
        <TouchableOpacity
          style={styles.switchContainer}
          onPress={() => setIsAnonymous(!isAnonymous)}
          activeOpacity={0.7}
        >
          <Text style={styles.checkboxLabel}>Anonim olarak gönder</Text>
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
          onPress={handleAddAnswer}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Cevapla</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
