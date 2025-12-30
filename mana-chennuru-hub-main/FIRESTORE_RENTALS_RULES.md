# Firestore Security Rules for Rental Houses

## Collection: `rental_houses`

### Required Fields
- `address` (string)
- `street` (string)
- `userId` (string - Firebase Auth UID)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Optional Fields
- `cost` (string) - Rental cost (e.g., "₹5000/month")
- `imageUrls` (array of strings) - Array of image URLs (max 2 images)

## Security Rules

Add these rules in Firebase Console > Firestore Database > Rules (append to existing rules):

```javascript
// Rental Houses Collection
match /rental_houses/{documentId} {
  // Allow anyone to read all rentals (public view)
  allow read: if true;
  
  // Allow authenticated users to create rentals
  // userId must match the authenticated user's UID
  allow create: if request.auth != null 
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.keys().hasAll(['address', 'street', 'userId'])
                && request.resource.data.address is string
                && request.resource.data.street is string
                && request.resource.data.userId is string;
  
  // Allow users to update only their own rentals
  allow update: if request.auth != null
                && resource.data.userId == request.auth.uid
                && request.resource.data.userId == request.auth.uid;
  
  // Allow users to delete only their own rentals
  allow delete: if request.auth != null
                && resource.data.userId == request.auth.uid;
}
```

## Complete Rules Example

If you want to combine with existing rules, here's a complete example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Village News Documents
    match /village_news_documents/{documentId} {
      allow read: if true;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.keys().hasAll(['title', 'subject', 'date', 'userId'])
                    && request.resource.data.title is string
                    && request.resource.data.subject is string
                    && request.resource.data.userId is string;
      allow update: if request.auth != null
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null
                    && resource.data.userId == request.auth.uid;
    }
    
    // Rental Houses
    match /rental_houses/{documentId} {
      allow read: if true;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.keys().hasAll(['address', 'street', 'userId'])
                    && request.resource.data.address is string
                    && request.resource.data.street is string
                    && request.resource.data.userId is string;
      allow update: if request.auth != null
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null
                    && resource.data.userId == request.auth.uid;
    }
  }
}
```


