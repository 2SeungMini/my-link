import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

const PROFILE_DOC_ID = "main";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  faviconUrl: string;
  createdAt: unknown;
  updatedAt?: unknown;
  clickCount?: number;
}

export interface UserProfile {
  displayName: string;
  routeKey: string;
  bio: string;
  email: string | null;
  photoURL: string | null;
  username?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export interface UserProfileInput {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function getProfileRouteKey(displayName: string | null, userId: string) {
  const rawValue = displayName || "";
  const decodedValue = (() => {
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  })();
  const routeKey = decodedValue
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[/#?[\]]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return routeKey || userId.slice(0, 10);
}

function getRouteKeyFromEmail(email: string | null, userId: string) {
  return getProfileRouteKey(email?.split("@")[0] || null, userId);
}

export function getProfileDocRef(userId: string) {
  return doc(db, "users", userId, "profile", PROFILE_DOC_ID);
}

function getUserDocRef(userId: string) {
  return doc(db, "users", userId);
}

function getProfileRouteDocRef(routeKey: string) {
  return doc(db, "profileRoutes", routeKey);
}

export function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=github.com&sz=64";
  }
}

export async function findProfileByRoute(routeKey: string) {
  const normalizedRouteKey = getProfileRouteKey(routeKey, "");
  if (!normalizedRouteKey) return null;

  const routeSnapshot = await getDoc(getProfileRouteDocRef(normalizedRouteKey));
  const userId = routeSnapshot.data()?.userId;

  if (typeof userId !== "string") {
    return null;
  }

  const profileSnapshot = await getDoc(getProfileDocRef(userId));
  if (!profileSnapshot.exists()) {
    return null;
  }

  return {
    userId,
    profile: profileSnapshot.data() as UserProfile,
  };
}

export async function ensureUserProfile(
  userId: string,
  profileInput: UserProfileInput,
) {
  const profileRef = getProfileDocRef(userId);
  const profileSnapshot = await getDoc(profileRef);
  const legacySnapshot = await getDoc(getUserDocRef(userId)).catch(() => null);
  const existingProfile = profileSnapshot.exists()
    ? (profileSnapshot.data() as Partial<UserProfile>)
    : null;
  const legacyProfile = legacySnapshot?.exists()
    ? (legacySnapshot.data() as Partial<UserProfile>)
    : null;
  const email = profileInput.email || legacyProfile?.email || null;
  const displayName =
    existingProfile?.displayName ||
    legacyProfile?.displayName ||
    profileInput.displayName ||
    email?.split("@")[0] ||
    "사용자";
  const routeKey = getRouteKeyFromEmail(email, userId);
  const bio = existingProfile?.bio || legacyProfile?.bio || "";
  const photoURL = profileInput.photoURL || legacyProfile?.photoURL || null;
  const previousRouteKey = existingProfile?.routeKey;

  await runTransaction(db, async (transaction) => {
    const routeRef = getProfileRouteDocRef(routeKey);
    const transactionRouteSnapshot = await transaction.get(routeRef);
    const transactionRouteOwnerId = transactionRouteSnapshot.data()?.userId;

    if (
      transactionRouteSnapshot.exists() &&
      typeof transactionRouteOwnerId === "string" &&
      transactionRouteOwnerId !== userId
    ) {
      throw new Error("PROFILE_ROUTE_TAKEN");
    }

    transaction.set(
      profileRef,
      {
        displayName,
        routeKey,
        bio,
        email,
        photoURL,
        username: existingProfile?.username || legacyProfile?.username || null,
        createdAt: existingProfile?.createdAt || serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    transaction.set(
      routeRef,
      {
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    if (previousRouteKey && previousRouteKey !== routeKey) {
      transaction.delete(getProfileRouteDocRef(previousRouteKey));
    }
  });
}

export async function updateDisplayName(userId: string, displayName: string) {
  await updateDoc(getProfileDocRef(userId), {
    displayName: displayName.trim() || "사용자",
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserBio(userId: string, bio: string) {
  await updateDoc(getProfileDocRef(userId), {
    bio: bio.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function addLink(userId: string, title: string, url: string) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

  await addDoc(collection(db, "users", userId, "links"), {
    title,
    url: formattedUrl,
    faviconUrl: getFaviconUrl(formattedUrl),
    clickCount: 0,
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

export async function recordLinkClick(userId: string, id: string) {
  await updateDoc(doc(db, "users", userId, "links", id), {
    clickCount: increment(1),
  });
}
