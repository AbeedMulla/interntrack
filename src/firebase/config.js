// src/firebase/config.js
// Firebase configuration and initialization
// Uses environment variables from .env file (Vite loads these automatically)

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration object
// Values are loaded from .env file using Vite's import.meta.env
// All env variables must start with VITE_ to be exposed to the client
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication - handles user signup/login
export const auth = getAuth(app)

// Initialize Firestore - our NoSQL database for storing applications
export const db = getFirestore(app)

export default app