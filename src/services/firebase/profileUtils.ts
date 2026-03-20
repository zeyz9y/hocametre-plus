import { doc, getDoc, updateDoc, DocumentData } from "firebase/firestore";
import { firestore } from "./firebase";
import { uploadProfilePictureToCloudinary } from "../cloudinary/cloudinaryService";

export const uploadProfilePicture = async (
  uid: string,
  uri: string
): Promise<string> => {
  try {
    const result = await uploadProfilePictureToCloudinary(uri, uid);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading profile picture to Cloudinary:", error);
    throw error;
  }
};

export const getUserDataFromFirestore = async (
  uid: string
): Promise<DocumentData | null> => {
  const userDocRef = doc(firestore, "users", uid);
  const userSnap = await getDoc(userDocRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const updateUserDataInFirestore = async (
  uid: string,
  data: Partial<DocumentData>
): Promise<void> => {
  const userDocRef = doc(firestore, "users", uid);
  await updateDoc(userDocRef, data);
};
