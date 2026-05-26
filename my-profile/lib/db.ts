import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  faviconUrl: string;
  createdAt: any;
}

// 도메인 추출 및 구글 파비콘 API 주소 반환 헬퍼
export function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
  } catch (error) {
    // URL 포맷 오류 시 기본 파비콘 이미지 또는 빈 파비콘 주소 반환
    return "https://www.google.com/s2/favicons?domain=github.com&sz=64";
  }
}

// 1. 링크 추가하기 (users/anonymous/links 경로)
export async function addLink(title: string, url: string) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
  const faviconUrl = getFaviconUrl(formattedUrl);
  
  const linksCol = collection(db, "users", "anonymous", "links");
  await addDoc(linksCol, {
    title,
    url: formattedUrl,
    faviconUrl,
    createdAt: serverTimestamp()
  });
}

// 2. 링크 수정하기
export async function updateLink(id: string, title: string, url: string) {
  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
  const faviconUrl = getFaviconUrl(formattedUrl);
  
  const linkDocRef = doc(db, "users", "anonymous", "links", id);
  await updateDoc(linkDocRef, {
    title,
    url: formattedUrl,
    faviconUrl
  });
}

// 3. 링크 삭제하기
export async function deleteLink(id: string) {
  const linkDocRef = doc(db, "users", "anonymous", "links", id);
  await deleteDoc(linkDocRef);
}
