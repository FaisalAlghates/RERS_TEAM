// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAurJx-nSpVdj0ctPx8agoIIVTi8k3Wtpg",
  authDomain: "rersweb.firebaseapp.com",
  databaseURL: "https://rersweb-default-rtdb.firebaseio.com",
  projectId: "rersweb",
  storageBucket: "rersweb.firebasestorage.app",
  messagingSenderId: "432558250053",
  appId: "1:432558250053:web:07fc91665244a2d93feb2c",
  measurementId: "G-WEK79FH0J6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export necessary Firebase services
export { app, auth, db };