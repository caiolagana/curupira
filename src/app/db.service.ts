import { Injectable } from '@angular/core'
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
//import { enableIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAD2hlb6WuoZXhPSPXaPc1y9c1VlQlo7RQ",
  authDomain: "salvia-ambiental.firebaseapp.com",
  projectId: "salvia-ambiental",
  storageBucket: "salvia-ambiental.appspot.com",
  messagingSenderId: "1050268639599",
  appId: "1:1050268639599:web:62bd5668c6b1eb1f58c89a",
  measurementId: "G-QWXJJCWG1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const fdb = getFirestore(app)
//enableIndexedDbPersistence(fdb)
export const storage = getStorage(app);

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor() { }
}
