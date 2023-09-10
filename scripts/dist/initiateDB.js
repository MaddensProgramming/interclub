"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.firebaseConfig = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
exports.firebaseConfig = {
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
const app = (0, app_1.initializeApp)(exports.firebaseConfig.firebase);
exports.store = (0, firestore_1.getFirestore)(app);
