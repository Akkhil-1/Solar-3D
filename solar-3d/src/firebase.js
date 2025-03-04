import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBPXPwy8_Q8IEPkmRHvJWiKBwze5VQ3qdU",
    authDomain: "solar-3d-638d9.firebaseapp.com",
    projectId: "solar-3d-638d9",
    storageBucket: "solar-3d-638d9.firebasestorage.app",
    messagingSenderId: "576698567493",
    appId: "1:576698567493:web:00708099ae73876431cc2c",
    measurementId: "G-F2QPE62MQW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc };
