/**
 * Nawaloka Hospitals PLC - KPI Evaluation System
 * Firebase Configuration
 * 
 * =========================================================================================
 * HOW TO CONNECT YOUR REAL FIREBASE PROJECT:
 * =========================================================================================
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create or select your project (e.g., "nawaloka-kpi-system").
 * 3. Add a Web App and copy the firebaseConfig object.
 * 4. Replace the placeholder values below with your project credentials:
 *    - apiKey: "AIzaSy..."
 *    - authDomain: "your-project.firebaseapp.com"
 *    - projectId: "your-project-id"
 *    - storageBucket: "your-project.firebasestorage.app"
 *    - messagingSenderId: "123456789..."
 *    - appId: "1:123456789:web:abcdef..."
 * 5. Enable Authentication > Email/Password provider in the Firebase Console.
 * 6. Create Cloud Firestore in Production Mode and deploy the rules from `firestore.rules`.
 * 
 * NOTE: If these values remain placeholders (or projectId is 'YOUR_PROJECT_ID'),
 * the application automatically operates in DEMO MODE with a full localStorage-backed
 * data service, allowing complete evaluation, reporting, and administrative workflows out of the box!
 * =========================================================================================
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nawaloka-kpi.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nawaloka-kpi.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef0123456789",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)",
};

/**
 * Checks whether Firebase is configured with real credentials or still using placeholders.
 */
export function isFirebaseConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Allow explicit forced demo mode via localStorage override
  const forceDemo = localStorage.getItem('nawaloka_force_demo_mode');
  if (forceDemo === 'true') {
    return false;
  }

  const isPlaceholder = 
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey.includes('YOUR_API_KEY') ||
    !firebaseConfig.projectId ||
    firebaseConfig.projectId === 'YOUR_PROJECT_ID' ||
    firebaseConfig.projectId.includes('placeholder');

  return !isPlaceholder;
}
