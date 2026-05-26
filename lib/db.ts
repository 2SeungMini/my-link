import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  faviconUrl: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface UserProfileInput {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=github.com&sz=64";
  }
}

export async function addLink(userId: string, title: string, url: string) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

  await addDoc(collection(db, "users", userId, "links"), {
    title,
    url: formattedUrl,
    faviconUrl: getFaviconUrl(formattedUrl),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateLink(
  userId: string,
  id: string,
  title: string,
  url: string,
) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

  await updateDoc(doc(db, "users", userId, "links", id), {
    title,
    url: formattedUrl,
    faviconUrl: getFaviconUrl(formattedUrl),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLink(userId: string, id: string) {
  await deleteDoc(doc(db, "users", userId, "links", id));
}

export async function updateUserBio(userId: string, bio: string) {
  await setDoc(
    doc(db, "users", userId),
    {
      bio,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function ensureUserProfile(
  userId: string,
  profileInput: UserProfileInput,
) {
  await setDoc(
    doc(db, "users", userId),
    {
      displayName: profileInput.displayName,
      email: profileInput.email,
      photoURL: profileInput.photoURL,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
