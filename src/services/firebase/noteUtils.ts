import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore, auth } from "./firebase";
import {
  uploadToCloudinary,
  formatPdfViewUrl,
  generatePdfThumbnail,
} from "../cloudinary";
import { getUserDataFromFirestore } from "./profileUtils";

export interface NoteRecord {
  id: string;
  title: string;
  url: string;
  course?: string;
  createdAt: string;
  uploaderId: string;
  uploaderEmail: string;
  uploaderNickname?: string;
  publicId?: string;
  thumbnailUrl?: string;
}

export const uploadNoteToCloudinary = async (
  uri: string,
  fileName: string
): Promise<{ url: string; publicId: string }> => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const userData = await getUserDataFromFirestore(auth.currentUser.uid);
    const username =
      userData?.nickname ||
      auth.currentUser.email?.split("@")[0] ||
      "anonymous";

    const result = await uploadToCloudinary(uri, fileName, username);

    return {
      url: formatPdfViewUrl(result.secure_url),
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Note upload error:", err);
    throw err;
  }
};

export const saveNoteToFirestore = async (
  fileName: string,
  fileURL: string,
  publicId?: string,
  course?: string
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  const userData = await getUserDataFromFirestore(auth.currentUser.uid);

  const notesColRef = collection(firestore, "notes");

  let thumbnailUrl = "";
  if (publicId) {
    thumbnailUrl = generatePdfThumbnail(publicId);
  }

  await addDoc(notesColRef, {
    title: fileName,
    url: fileURL,
    course: course || "",
    createdAt: new Date().toISOString(),
    uploaderId: auth.currentUser.uid,
    uploaderEmail: auth.currentUser.email || "anonymous",
    uploaderNickname: userData?.nickname || "",
    publicId: publicId || "",
    thumbnailUrl: thumbnailUrl,
  });
};

export const fetchNotesFromFirestore = async (): Promise<NoteRecord[]> => {
  const notesColRef = collection(firestore, "notes");
  const snapshot = await getDocs(notesColRef);
  const notes: NoteRecord[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as {
      title: string;
      url: string;
      course?: string;
      createdAt: string;
      uploaderId?: string;
      uploaderEmail?: string;
      uploaderNickname?: string;
      publicId?: string;
      thumbnailUrl?: string;
    };

    let thumbnailUrl = data.thumbnailUrl;
    if (!thumbnailUrl && data.publicId) {
      thumbnailUrl = generatePdfThumbnail(data.publicId);
    }

    notes.push({
      id: docSnap.id,
      title: data.title,
      url: data.url,
      course: data.course || "",
      createdAt: data.createdAt,
      uploaderId: data.uploaderId || "unknown",
      uploaderEmail: data.uploaderEmail || "anonymous",
      uploaderNickname: data.uploaderNickname,
      publicId: data.publicId,
      thumbnailUrl: thumbnailUrl,
    });
  });
  return notes;
};

export const deleteNoteFromFirestore = async (
  noteId: string
): Promise<void> => {
  const noteDoc = doc(firestore, "notes", noteId);
  await deleteDoc(noteDoc);
};

export const deleteFileFromFirebase = async (
  fileURL: string,
  publicId?: string
): Promise<void> => {
  console.log("Note file URL removed from database:", fileURL);
};
