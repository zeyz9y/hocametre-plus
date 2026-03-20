import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from './firebase';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export const addTodo = async (
  uid: string,
  title: string
): Promise<void> => {
  const todosRef = collection(firestore, 'users', uid, 'todos');
  await addDoc(todosRef, {
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  });
};

export const getTodos = async (uid: string): Promise<TodoItem[]> => {
  const todosRef = collection(firestore, 'users', uid, 'todos');
  const snapshot = await getDocs(todosRef);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      completed: data.completed,
      createdAt: data.createdAt,
    };
  });
};

export const toggleTodo = async (
  uid: string,
  todoId: string,
  completed: boolean
): Promise<void> => {
  const todoRef = doc(firestore, 'users', uid, 'todos', todoId);
  await updateDoc(todoRef, { completed });
};

export const deleteTodo = async (
  uid: string,
  todoId: string
): Promise<void> => {
  const todoRef = doc(firestore, 'users', uid, 'todos', todoId);
  await deleteDoc(todoRef);
};
