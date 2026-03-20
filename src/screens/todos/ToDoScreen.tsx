import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { auth } from "../../services/firebase/firebase";
import {
  addTodo,
  getTodos,
  toggleTodo,
  deleteTodo,
} from "../../services/firebase/toDoUtils";
import { styles } from "./ToDoScreen.styles";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function ToDoScreen() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }
      const todosFromDB = await getTodos(uid);
      setTodos(todosFromDB);
      setLoading(false);
    };
    fetchData();
  }, []);

  const onAddTodo = async () => {
    const text = inputText.trim();
    if (!text) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setAdding(true);
    await addTodo(uid, text);
    const updated = await getTodos(uid);
    setTodos(updated);
    setInputText("");
    setAdding(false);
  };

  const onToggleDone = async (id: string, currentDone: boolean) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await toggleTodo(uid, id, !currentDone);
    const updated = await getTodos(uid);
    setTodos(updated);
  };

  const onDeleteTodo = async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteTodo(uid, id);
    const updated = await getTodos(uid);
    setTodos(updated);
  };

  const onClearCompleted = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setClearing(true);
    const completedTodos = todos.filter((t) => t.completed);
    for (const todo of completedTodos) {
      await deleteTodo(uid, todo.id);
    }
    const updated = await getTodos(uid);
    setTodos(updated);
    setClearing(false);
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        <View
          style={[
            styles.inputRow,
            { marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Yeni görev ekle..."
            placeholderTextColor="#bbb"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="done"
            onSubmitEditing={onAddTodo}
            editable={!adding}
          />
          <TouchableOpacity
            onPress={onAddTodo}
            style={styles.addButton}
            activeOpacity={0.7}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="add" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {todos.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="checkmark-done-circle"
                size={22}
                color="#007AFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.summaryText}>
                {completedCount}/{todos.length} tamamlandı
              </Text>
            </View>
            {completedCount > 0 && (
              <TouchableOpacity
                onPress={onClearCompleted}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: "#f8d7da",
                }}
                disabled={clearing}
              >
                {clearing ? (
                  <ActivityIndicator size={16} color="#d11a2a" />
                ) : (
                  <Ionicons name="trash" size={16} color="#d11a2a" />
                )}
                <Text style={{ color: "#d11a2a", marginLeft: 4, fontSize: 13 }}>
                  Tamamlananları Sil
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 32 }}
          />
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.todoCard,
                  item.completed && styles.doneCard,
                  {
                    borderLeftWidth: 3,
                    borderLeftColor: item.completed ? "#007AFF" : "#ccc",
                    backgroundColor: item.completed
                      ? "#e9f0ff"
                      : styles.todoCard.backgroundColor,
                  },
                ]}
                onPress={() => onToggleDone(item.id, item.completed)}
              >
                <Ionicons
                  name={item.completed ? "checkbox" : "square-outline"}
                  size={24}
                  color={item.completed ? "#007AFF" : "#555"}
                />
                <Text
                  style={[styles.todoText, item.completed && styles.doneText]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <TouchableOpacity
                  onPress={() => onDeleteTodo(item.id)}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="trash" size={20} color="#d11a2a" />
                </TouchableOpacity>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 48 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📝</Text>
                <Text style={styles.emptyText}>
                  Henüz görev yok. Hemen bir tane ekleyin!
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
