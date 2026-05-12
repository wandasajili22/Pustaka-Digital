import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type LogType = 'admin' | 'user';

export async function logActivity(
  userId: string,
  userName: string,
  action: string,
  type: LogType,
  details?: string,
  targetId?: string
) {
  try {
    await addDoc(collection(db, 'logs'), {
      userId,
      userName,
      action,
      type,
      details: details || '',
      targetId: targetId || '',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Critical: Failed to record activity log", error);
  }
}
