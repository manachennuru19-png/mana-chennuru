// Firebase type definitions for the application

import { User as FirebaseUser } from 'firebase/auth';

// Application User type (extends Firebase User with custom fields)
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Convert Firebase User to App User
export const convertFirebaseUser = (firebaseUser: FirebaseUser | null): AppUser | null => {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
};

// Database collection types (add your collection types here)
export interface Shop {
  id?: string;
  name: string;
  description: string; // What is available
  address: string;
  contact: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface NewsItem {
  id?: string;
  title: string;
  content: string;
  author: string;
  publishedAt: Date;
  imageUrl?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Temple {
  id?: string;
  name: string;
  fullName?: string;
  area: string;
  landmark: string;
  imageUrl?: string;
  galleryImageUrls?: string[];
  importance?: string;
  timings?: string;
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface VillageNewsDocument {
  id?: string;
  title: string;
  subject: string;
  date: string | Date;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface RentalHouse {
  id?: string;
  address: string;
  street: string;
  cost?: string;
  contact?: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface GovernmentScheme {
  id?: string;
  title: string;
  description: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface Complaint {
  id?: string;
  title: string;
  description: string;
  category: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface GovernmentContact {
  id?: string;
  name: string;
  position: string;
  contact: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface EmergencyService {
  id?: string;
  service: string;
  contact: string;
  description: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface EducationInfo {
  id?: string;
  title: string; // School name or tuition name
  description: string;
  address: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface TransportInfo {
  id?: string;
  driverName: string;
  mobileNumber: string;
  address: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface AgricultureInfo {
  id?: string;
  title: string;
  description: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface GalleryItem {
  id?: string;
  title: string;
  description: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface LostFoundItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  contact: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface DonationItem {
  id?: string;
  title: string;
  description: string;
  contact: string;
  category: string;
  imageUrls?: string[];
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface ElectionCommissionDocument {
  id?: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'image';
  fileUrl: string;
  userId: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

