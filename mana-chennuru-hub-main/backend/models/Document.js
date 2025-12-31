import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';

const COLLECTION_NAME = 'election_commission_documents';

/**
 * Document model for Firestore
 * Schema:
 * - title (string, required)
 * - description (string, optional)
 * - fileUrl (string, required) - Cloudinary secure_url
 * - fileType (string, required) - 'pdf' | 'image'
 * - source (string, required) - 'Election Commission' | 'Village News'
 * - publicId (string, required) - Cloudinary public_id
 * - resourceType (string, required) - 'image' | 'raw'
 * - userId (string, required)
 * - createdAt (Timestamp)
 * - updatedAt (Timestamp)
 */

export const createDocument = async (documentData) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = db.collection(COLLECTION_NAME).doc();
    const now = new Date();
    
    const document = {
      ...documentData,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
    };

    await docRef.set(document);
    return { id: docRef.id, ...document };
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

export const getDocuments = async (query = {}, limit = 3) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    let queryRef = db.collection(COLLECTION_NAME);

    // Apply filters
    if (query.source) {
      queryRef = queryRef.where('source', '==', query.source);
    }

    // Apply ordering and limit
    queryRef = queryRef.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await queryRef.get();
    
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const getDocumentById = async (id) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Error getting document by ID:', error);
    throw error;
  }
};

export const deleteDocument = async (id) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const updateDocument = async (id, updateData) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    
    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
    });

    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
