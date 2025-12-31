# Firebase Admin SDK Setup for Backend

To use Firebase Firestore in the backend, you need to set up Firebase Admin SDK credentials.

## Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts** tab
4. Click **"Generate New Private Key"**
5. Download the JSON file

## Option 1: Use Environment Variables (Recommended)

Extract values from the JSON file and add to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```

**Important:** 
- The private key must be in quotes
- Keep the `\n` characters as they are
- The key should include the full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines

## Option 2: Use Service Account JSON File

1. Save the downloaded JSON file in the `backend/` folder (e.g., `serviceAccountKey.json`)
2. Update `backend/config/firebase.js` to use the file path
3. Add to `.gitignore` so the file is not committed

## Current Status

The backend will run even without Firebase credentials configured, but document operations will fail until Firebase is properly set up.

