// Firestore database helper functions
// Import like this:
// import { getCollection, addDocument, updateDocument, deleteDocument } from "@/integrations/firebase/firestore";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  CollectionReference,
  DocumentReference,
  DocumentData,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './client';

/**
 * Get all documents from a collection
 */
export const getCollection = async <T = DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> => {
  const collectionRef = collection(db, collectionName);
  const q = queryConstraints.length > 0 
    ? query(collectionRef, ...queryConstraints)
    : collectionRef;
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

/**
 * Get a single document by ID
 */
export const getDocument = async <T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  }
  
  return null;
};

/**
 * Add a new document to a collection
 */
export const addDocument = async <T = DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> => {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return docRef.id;
};

/**
 * Update an existing document
 */
export const updateDocument = async <T = DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

/**
 * Helper to convert Firestore Timestamp to Date
 */
export const timestampToDate = (timestamp: Timestamp | null | undefined): Date | null => {
  if (!timestamp) return null;
  return timestamp.toDate();
};

/**
 * Helper to convert Date to Firestore Timestamp
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Subscribe to real-time updates from a collection
 * Returns an unsubscribe function
 */
export const subscribeToCollection = <T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...queryConstraints: QueryConstraint[]
): Unsubscribe => {
  const collectionRef = collection(db, collectionName);
  const q = queryConstraints.length > 0 
    ? query(collectionRef, ...queryConstraints)
    : collectionRef;
  
  return onSnapshot(q, (querySnapshot) => {
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(data);
  });
};

// Re-export commonly used Firestore utilities
export { where, orderBy, limit, Timestamp, collection, doc };

