import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 빌드 타임에 환경 변수가 비어있는 상황(Pre-render)을 방어하기 위한 코드
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined";

const activeConfig = isConfigValid ? firebaseConfig : {
  apiKey: "dummy-key-for-build-prerendering-protection",
  authDomain: "dummy-auth-domain-for-build",
  projectId: "dummy-project-id-for-build",
  storageBucket: "dummy-storage-bucket-for-build",
  messagingSenderId: "dummy-sender-id",
  appId: "dummy-app-id",
  measurementId: "dummy-measurement-id"
};

// SSR(Server-Side Rendering) 환경 대응 및 중복 초기화 방지
const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics는 브라우저 환경(window가 존재할 때)에서만 동작 가능하며,
// Firebase Analytics가 지원되는 환경인지(isSupported) 체크 후 초기화합니다.
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
