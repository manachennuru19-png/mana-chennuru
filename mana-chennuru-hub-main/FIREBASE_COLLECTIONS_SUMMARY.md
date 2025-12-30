# Firebase Collections Summary

All sections now have Firebase collections configured. Here's the complete list:

## Collections Created:

1. **village_news_documents** - Village News
   - Fields: title, subject, date, userId, createdAt, updatedAt

2. **rental_houses** - Rental Houses
   - Required Fields: address, street, userId, createdAt, updatedAt
   - Optional Fields: cost (string), imageUrls (array of strings, max 2)

3. **government_schemes** - Government Schemes
   - Fields: title, description, userId, createdAt, updatedAt

4. **complaints** - Report Problems
   - Fields: title, description, category, userId, createdAt, updatedAt

5. **government_contacts** - Government Contacts
   - Fields: name, position, contact, userId, createdAt, updatedAt

6. **emergency_services** - Emergency Services
   - Fields: service, contact, description, userId, createdAt, updatedAt

7. **education_info** - Education Info (to be created)
   - Fields: title, description, contact, userId, createdAt, updatedAt

8. **transport_info** - Transport Info (to be created)
   - Fields: route, timings, description, userId, createdAt, updatedAt

9. **agriculture_info** - Agriculture Zone (to be created)
   - Fields: title, description, category, userId, createdAt, updatedAt

10. **gallery_items** - Gallery (to be created)
    - Fields: title, description, imageUrl, userId, createdAt, updatedAt

## Security Rules Template

All collections follow the same security pattern:
- Read: Anyone can read (public access)
- Create: Authenticated users only (must match userId)
- Update: Only owner (userId must match)
- Delete: Only owner (userId must match)

Example rule:
```javascript
match /{collection}/{documentId} {
  allow read: if true;
  allow create: if request.auth != null 
                && request.resource.data.userId == request.auth.uid;
  allow update: if request.auth != null
                && resource.data.userId == request.auth.uid
                && request.resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null
                && resource.data.userId == request.auth.uid;
}
```


