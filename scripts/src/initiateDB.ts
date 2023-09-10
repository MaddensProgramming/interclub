import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  firebase: {
    projectId: 'interclub-668f3',
    appId: '1:783417294563:web:4d861cff2a7b2d1a990fd6',
    storageBucket: 'interclub-668f3.appspot.com',
    locationId: 'europe-west',
    apiKey: 'AIzaSyDjyk0BJAlEi921YMpaqjUKQMu0LKeB8j4',
    authDomain: 'interclub-668f3.firebaseapp.com',
    messagingSenderId: '783417294563',
    measurementId: 'G-HR0R37BTQB',
  },
  production: false,
};
const app = initializeApp(firebaseConfig.firebase);
export const store = getFirestore(app);
