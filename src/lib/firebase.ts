import { type FirebaseApp, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (apiKey && authDomain && projectId && appId) {
  try {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      appId,
    });
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase initialization failed — auth disabled:", error);
    auth = null;
    app = null;
  }
} else {
  console.warn("Firebase not configured — auth disabled");
}

export { auth, app };