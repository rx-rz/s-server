import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { ENV_VARS } from "../../env";

const firebaseConfig = {
  apiKey: ENV_VARS.FIREBASE_API_KEY,
  authDomain: ENV_VARS.FIREBASE_AUTH_DOMAIN,
  projectId: ENV_VARS.FIREBASE_PROJECT_ID,
  storageBucket: ENV_VARS.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV_VARS.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV_VARS.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
