/*FIREBASE initialisation*/
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjePvAVzrjKLK78EipUGZ7O9EBVBFq_mU",
  authDomain: "my-secret-santa-d581b.firebaseapp.com",
  projectId: "my-secret-santa-d581b",
  storageBucket: "my-secret-santa-d581b.appspot.com",
  messagingSenderId: "803053895148",
  appId: "1:803053895148:web:ae2a35dfc53d80bea214c9",
};

// Initialize Firebase & services
const app = initializeApp(firebaseConfig);
const db = getFirestore();
