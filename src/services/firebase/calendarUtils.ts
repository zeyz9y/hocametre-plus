import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  eventType: "exam" | "other";
  createdAt: string;
}

export const addCalendarEvent = async (
  uid: string,
  eventData: {
    date: string;
    title: string;
    time: string;
    description: string;
    eventType: "exam" | "other";
  }
): Promise<void> => {
  const eventsColRef = collection(firestore, "users", uid, "calendarEvents");
  await addDoc(eventsColRef, {
    ...eventData,
    createdAt: new Date().toISOString(),
  });
};

export const getCalendarEvents = async (
  uid: string
): Promise<EventRecord[]> => {
  const eventsColRef = collection(firestore, "users", uid, "calendarEvents");
  const snapshot = await getDocs(eventsColRef);
  const events: EventRecord[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as {
      title: string;
      date: string;
      time: string;
      description: string;
      eventType: "exam" | "other";
      createdAt: string;
    };
    events.push({ id: docSnap.id, ...data });
  });
  return events;
};

export const updateCalendarEvent = async (
  uid: string,
  eventId: string,
  updates: {
    title: string;
    time: string;
    description: string;
    eventType: "exam" | "other";
  }
): Promise<void> => {
  const eventRef = doc(firestore, "users", uid, "calendarEvents", eventId);
  await updateDoc(eventRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCalendarEvent = async (
  uid: string,
  eventId: string
): Promise<void> => {
  const eventRef = doc(firestore, "users", uid, "calendarEvents", eventId);
  await deleteDoc(eventRef);
};
