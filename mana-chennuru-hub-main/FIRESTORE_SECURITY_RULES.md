# Firestore Security Rules for Village News

## Collection: `village_news_documents`

### Required Fields
- `title` (string)
- `subject` (string)
- `date` (string or timestamp)
- `userId` (string - Firebase Auth UID)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Security Rules

Add these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Village News Documents Collection
    match /village_news_documents/{documentId} {
      // Allow anyone to read all documents (public view)
      allow read: if true;
      
      // Allow authenticated users to create documents
      // userId must match the authenticated user's UID
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.keys().hasAll(['title', 'subject', 'date', 'userId'])
                    && request.resource.data.title is string
                    && request.resource.data.subject is string
                    && request.resource.data.userId is string;
      
      // Allow users to update only their own documents
      allow update: if request.auth != null
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.userId == request.auth.uid;
      
      // Allow users to delete only their own documents
      allow delete: if request.auth != null
                    && resource.data.userId == request.auth.uid;
    }
    
    // Add rules for other collections as needed
  }
}
```

## Rule Explanation

1. **Read Access (Public)**: 
   - `allow read: if true;` - Anyone can read all documents
   - This allows public viewing of all village news

2. **Create Access (Authenticated Users Only)**:
   - User must be authenticated (`request.auth != null`)
   - `userId` must match the authenticated user's UID
   - Required fields must be present and of correct types

3. **Update Access (Own Documents Only)**:
   - User must be authenticated
   - Can only update documents where `userId` matches their UID
   - `userId` cannot be changed in updates

4. **Delete Access (Own Documents Only)**:
   - User must be authenticated
   - Can only delete documents where `userId` matches their UID

## Testing the Rules

After setting up the rules, test them in Firebase Console:

1. **Read Test**: Should work for all users (authenticated and unauthenticated)
2. **Create Test**: Should work only for authenticated users with matching userId
3. **Update Test**: Should work only if userId matches authenticated user
4. **Delete Test**: Should work only if userId matches authenticated user

## Additional Notes

- These rules ensure users can only modify their own content
- Public users can view all documents
- All authenticated users can create new documents
- Users can only edit/delete documents they created

