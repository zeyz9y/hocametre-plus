import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { firestore, auth } from "./firebase";

export interface TeacherDetail {
  name: string;
  subject: string;
  title: string;
  avgRating: number;
}

export interface TeacherRecord {
  id: string;
  name: string;
  subject: string;
  title: string;
  avgRating: number;
  commentCount?: number;
}

export interface TeacherRatingRecord {
  id: string;
  rating: number;
  comment: string;
  userId?: string;
  createdAt: string;
  likes?: number;
  dislikes?: number;
  dislikedBy?: string[];
  likedBy?: string[];
}

export const getTeacherDetail = async (
  teacherId: string
): Promise<TeacherDetail> => {
  const teacherDocRef = doc(firestore, "teachers", teacherId);
  const teacherSnap = await getDoc(teacherDocRef);
  if (!teacherSnap.exists()) throw new Error("Teacher not found");
  const data = teacherSnap.data() as {
    name: string;
    subject: string;
    title: string;
  };
  const ratingsCol = collection(teacherDocRef, "ratings");
  const ratingsSnap = await getDocs(ratingsCol);
  let total = 0;
  let count = 0;
  ratingsSnap.forEach((r) => {
    const rd = r.data() as { rating: number };
    total += rd.rating;
    count += 1;
  });
  const avgRating = count > 0 ? total / count : 0;
  return {
    name: data.name,
    subject: data.subject,
    title: data.title,
    avgRating,
  };
};

export const addTeacherRating = async (
  teacherId: string,
  rating: number,
  comment: string,
  isAnonymous: boolean
): Promise<number> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı oturumu yok.");

  const teacherDocRef = doc(firestore, "teachers", teacherId);
  const ratingsCol = collection(teacherDocRef, "ratings");

  await addDoc(ratingsCol, {
    rating,
    comment,
    userId: user.uid,
    isAnonymous,
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    likedBy: [],
    dislikedBy: [],
  });

  const ratingsSnap = await getDocs(ratingsCol);
  let total = 0;
  let count = 0;

  ratingsSnap.forEach((r) => {
    const rd = r.data() as { rating: number };
    total += rd.rating;
    count += 1;
  });

  const avgRating = count > 0 ? total / count : 0;
  await setDoc(teacherDocRef, { avgRating }, { merge: true });
  return avgRating;
};

export const fetchTeachers = async (): Promise<TeacherRecord[]> => {
  const teachersColRef = collection(firestore, "teachers");
  const snapshot = await getDocs(teachersColRef);
  const teachers: TeacherRecord[] = [];

  const teachersPromises = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data() as {
      name: string;
      subject: string;
      title: string;
      avgRating?: number;
    };

    const ratingsColRef = collection(
      firestore,
      "teachers",
      docSnap.id,
      "ratings"
    );
    const ratingsSnapshot = await getDocs(ratingsColRef);
    const commentCount = ratingsSnapshot.size;

    return {
      id: docSnap.id,
      name: data.name,
      subject: data.subject,
      title: data.title,
      avgRating: data.avgRating ?? 0,
      commentCount: commentCount,
    };
  });

  const resolvedTeachers = await Promise.all(teachersPromises);
  return resolvedTeachers;
};

export const fetchTeacherRatings = async (
  teacherId: string
): Promise<TeacherRatingRecord[]> => {
  const ratingsColRef = collection(firestore, "teachers", teacherId, "ratings");
  const snapshot = await getDocs(ratingsColRef);
  const ratings: TeacherRatingRecord[] = [];
  snapshot.forEach((r) => {
    const data = r.data() as any;
    ratings.push({
      id: r.id,
      rating: data.rating,
      comment: data.comment,
      userId: data.userId,
      createdAt: data.createdAt,
      likes: data.likes ?? 0,
      dislikes: data.dislikes ?? 0,
      likedBy: data.likedBy ?? [],
      dislikedBy: data.dislikedBy ?? [],
    });
  });
  return ratings;
};

export const deleteTeacherRating = async (
  teacherId: string,
  ratingId: string
) => {
  const ratingRef = doc(firestore, "teachers", teacherId, "ratings", ratingId);
  await deleteDoc(ratingRef);
};

export const likeTeacherRating = async (
  teacherId: string,
  ratingId: string
) => {
  const ratingRef = doc(firestore, "teachers", teacherId, "ratings", ratingId);
  await updateDoc(ratingRef, {
    likes: increment(1),
  });
};

export const toggleLikeTeacherRating = async (
  teacherId: string,
  ratingId: string,
  userId: string
) => {
  const ratingRef = doc(firestore, "teachers", teacherId, "ratings", ratingId);
  const snap = await getDoc(ratingRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const likedBy: string[] = data.likedBy || [];
  const dislikedBy: string[] = data.dislikedBy || [];
  let likes = data.likes || 0;
  let dislikes = data.dislikes || 0;

  const hasLiked = likedBy.includes(userId);
  const hasDisliked = dislikedBy.includes(userId);

  if (hasLiked) {
    await updateDoc(ratingRef, {
      likes: likes - 1,
      likedBy: arrayRemove(userId),
    });
  } else {
    const updates: any = {
      likes: likes + 1,
      likedBy: arrayUnion(userId),
    };

    if (hasDisliked) {
      updates.dislikes = dislikes - 1;
      updates.dislikedBy = arrayRemove(userId);
    }

    await updateDoc(ratingRef, updates);
  }
};

export const toggleDislikeTeacherRating = async (
  teacherId: string,
  ratingId: string,
  userId: string
) => {
  const ratingRef = doc(firestore, "teachers", teacherId, "ratings", ratingId);
  const snap = await getDoc(ratingRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const dislikedBy: string[] = data.dislikedBy || [];
  const likedBy: string[] = data.likedBy || [];
  let dislikes = data.dislikes || 0;
  let likes = data.likes || 0;

  const hasDisliked = dislikedBy.includes(userId);
  const hasLiked = likedBy.includes(userId);

  if (hasDisliked) {
    await updateDoc(ratingRef, {
      dislikes: dislikes - 1,
      dislikedBy: arrayRemove(userId),
    });
  } else {
    const updates: any = {
      dislikes: dislikes + 1,
      dislikedBy: arrayUnion(userId),
    };

    if (hasLiked) {
      updates.likes = likes - 1;
      updates.likedBy = arrayRemove(userId);
    }

    await updateDoc(ratingRef, updates);
  }
};
