
'use server';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  username: string;
  email: string | null;
  createdAt: any; // Firebase ServerTimestamp
  updatedAt?: any;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(
  firebaseUser: FirebaseUser,
  customUsername?: string
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  
  const username = customUsername || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AnonymousUser';
  const email = firebaseUser.email;

  const newUserProfile: UserProfile = {
    uid: firebaseUser.uid,
    username,
    email,
    createdAt: serverTimestamp(),
  };

  await setDoc(userDocRef, newUserProfile);
  return newUserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
