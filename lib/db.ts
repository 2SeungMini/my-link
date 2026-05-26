import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  faviconUrl: string;
  createdAt: unknown;
}

export function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=github.com&sz=64";
  }
}

export async function addLink(title: string, url: string) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

  await addDoc(collection(db, "users", "anonymous", "links"), {
    title,
    url: formattedUrl,
    faviconUrl: getFaviconUrl(formattedUrl),
    createdAt: serverTimestamp(),
  });
}

export async function updateLink(id: string, title: string, url: string) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

  await updateDoc(doc(db, "users", "anonymous", "links", id), {
    title,
    url: formattedUrl,
    faviconUrl: getFaviconUrl(formattedUrl),
  });
}

export async function deleteLink(id: string) {
  await deleteDoc(doc(db, "users", "anonymous", "links", id));
}
