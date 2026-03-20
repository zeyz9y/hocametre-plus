import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateEmail,
  UserCredential,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";

export const signUp = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  if (!email.endsWith("@kku.edu.tr")) {
    Alert.alert("Hata", "Sadece kku.edu.tr mail adresi kullanılabilir.");
    throw new Error("Sadece kku.edu.tr mail adresi kullanılabilir.");
  }
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await setDoc(doc(firestore, "users", userCredential.user.uid), {
    email: userCredential.user.email,
    isProfileCompleted: false,
    createdAt: new Date().toISOString(),
  });

  await sendEmailVerification(userCredential.user);
  Alert.alert(
    "Başarılı",
    "Kayıt başarılı! Lütfen e-postanızı doğrulayın ve profilinizi tamamlayın."
  );
  return userCredential;
};

export const login = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  if (!email.endsWith("@kku.edu.tr")) {
    Alert.alert("Hata", "Sadece kku.edu.tr mail adresi ile giriş yapılabilir.");
    throw new Error("Sadece kku.edu.tr mail adresi ile giriş yapılabilir.");
  }
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential;
};

export const updateUserEmail = async (newEmail: string): Promise<void> => {
  if (auth.currentUser) {
    await updateEmail(auth.currentUser, newEmail);
  }
};

export const isEmailVerified = (): boolean => {
  return auth.currentUser?.emailVerified ?? false;
};
