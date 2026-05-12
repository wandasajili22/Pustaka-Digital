import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
export const auth = getAuth(app);

console.log("Firebase initialized with project:", config.projectId);

// Connectivity check as per instructions
async function testConnection() {
  try {
    // Attempting to read a non-existent doc to trigger a server-side check
    await getDocFromServer(doc(db, 'system', 'connection_test'));
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      console.warn("Firebase Connection Check:", error.message);
      
      const isFirestoreError = msg.includes('offline') || 
                              msg.includes('failed-precondition') || 
                              msg.includes('not-found') || 
                              msg.includes('no-database') || 
                              msg.includes('not found') ||
                              msg.includes('permission-denied');

      if (isFirestoreError) {
         console.error(`FIREBASE ERROR: Cannot connect to Firestore. 
1. Go to https://console.firebase.google.com/project/${config.projectId}/firestore 
2. CLICK 'Create database' if you haven't already.
3. CHOOSE 'Native mode'.
4. CHOOSE a location (e.g., asia-southeast1).
5. Ensure the database ID is "(default)".`);
      }
      
      if (msg.includes('auth/operation-not-allowed') || msg.includes('configuration-not-found') || msg.includes('auth/unauthorized-domain')) {
         console.error(`FIREBASE AUTH ERROR: 
1. Go to https://console.firebase.google.com/project/${config.projectId}/authentication 
2. Click 'Get Started' and enable 'Email/Password' in Sign-in method.
3. Ensure '${window.location.hostname}' is added to Authorized domains in Settings tab.`);
      }
    }
  }
}

testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
