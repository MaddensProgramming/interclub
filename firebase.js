// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjyk0BJAlEi921YMpaqjUKQMu0LKeB8j4",
  authDomain: "interclub-668f3.firebaseapp.com",
  projectId: "interclub-668f3",
  storageBucket: "interclub-668f3.appspot.com",
  messagingSenderId: "783417294563",
  appId: "1:783417294563:web:4d861cff2a7b2d1a990fd6",
  measurementId: "G-HR0R37BTQB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
