import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { firestore } from "./firebase";

import { getUserDataFromFirestore } from "../firebase/profileUtils";

import { getCountFromServer } from "firebase/firestore";

export const updateAnswer = async (
  questionId: string,
  answerId: string,
  newBody: string
) => {
  const ref = doc(firestore, "questions", questionId, "answers", answerId);
  await updateDoc(ref, {
    body: newBody,
  });
};

export const addQuestion = async (
  title: string,
  body: string,
  course: string,
  author: any,
  isAnonymous: boolean
) => {
  const userProfile = await getUserDataFromFirestore(author.uid);
  const name =
    userProfile?.nickname ||
    userProfile?.name ||
    author.displayName ||
    "Kullanıcı";

  const ref = collection(firestore, "questions");
  await addDoc(ref, {
    title,
    body,
    course,
    authorId: author.uid,
    authorName: isAnonymous ? null : name,
    isAnonymous,
    upvotes: [],
    timestamp: serverTimestamp(),
  });
};

export const getAllQuestions = async () => {
  const ref = collection(firestore, "questions");
  const snapshot = await getDocs(ref);

  const questions = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const answersRef = collection(
        firestore,
        "questions",
        docSnap.id,
        "answers"
      );
      const countSnap = await getCountFromServer(answersRef);

      return {
        id: docSnap.id,
        title: data.title,
        body: data.body,
        course: data.course,
        authorId: data.authorId,
        authorName: data.authorName ?? null,
        isAnonymous: data.isAnonymous,
        upvotes: data.upvotes ?? [],
        timestamp: data.timestamp,
        answerCount: countSnap.data().count,
      };
    })
  );

  return questions.sort((a, b) => {
    if (!a.timestamp && !b.timestamp) return 0;
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;

    return b.timestamp.toMillis() - a.timestamp.toMillis();
  });
};

export const addAnswer = async (
  questionId: string,
  body: string,
  user: any,
  isAnonymous: boolean
) => {
  const ref = collection(firestore, "questions", questionId, "answers");

  let authorName: string | null = null;

  if (!isAnonymous) {
    const userData = await getUserDataFromFirestore(user.uid);
    authorName = userData?.nickname || userData?.name || user.email;
  }

  await addDoc(ref, {
    body,
    authorId: user.uid,
    authorName: isAnonymous ? null : authorName,
    isAnonymous,
    upvotes: [],
    timestamp: serverTimestamp(),
  });
};

export const deleteQuestion = async (questionId: string) => {
  const ref = doc(firestore, "questions", questionId);
  await deleteDoc(ref);
};

export const deleteAnswer = async (questionId: string, answerId: string) => {
  const ref = doc(firestore, "questions", questionId, "answers", answerId);
  await deleteDoc(ref);
};

export const getAnswers = async (questionId: string) => {
  const ref = collection(firestore, "questions", questionId, "answers");
  const snapshot = await getDocs(ref);
  const answerList = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      body: doc.data().body,
      authorId: doc.data().authorId,
      authorName: doc.data().authorName,
      isAnonymous: doc.data().isAnonymous,
      upvotes: doc.data().upvotes || [],
      timestamp: doc.data().timestamp,
    }))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
  return answerList;
};

export const upvoteAnswer = async (
  questionId: string,
  answerId: string,
  userId: string
) => {
  const answerRef = doc(
    firestore,
    "questions",
    questionId,
    "answers",
    answerId
  );
  await updateDoc(answerRef, {
    upvotes: arrayUnion(userId),
  });
};

export const removeUpvoteAnswer = async (
  questionId: string,
  answerId: string,
  userId: string
) => {
  const answerRef = doc(
    firestore,
    "questions",
    questionId,
    "answers",
    answerId
  );
  await updateDoc(answerRef, {
    upvotes: arrayRemove(userId),
  });
};
