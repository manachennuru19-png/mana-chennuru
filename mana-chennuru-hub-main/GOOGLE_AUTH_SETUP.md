# Google Authentication Setup

Google authentication has been implemented in the application. To enable it, you need to configure Google as a sign-in provider in Firebase Console.

## Setup Steps

### 1. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. Toggle **Enable** to ON
6. Enter your **Project support email** (required)
7. Click **Save**

### 2. Configure OAuth Consent Screen (Optional but Recommended)

If you want to customize the consent screen that users see:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Configure the consent screen settings (app name, logo, etc.)

### 3. Add Authorized Domains (If Needed)

1. In Firebase Console, go to **Authentication** > **Settings**
2. Under **Authorized domains**, add your production domain if deploying to a custom domain
3. Localhost is automatically included for development

## How It Works

- The Google sign-in button appears on both Login and Sign Up modes
- Clicking the button opens a Google popup for authentication
- If the user already has an account, they will be logged in
- If the user doesn't have an account, Firebase will create one automatically (same behavior for login and signup)
- User's display name and email will be automatically populated from their Google account

## Code Implementation

The Google authentication is implemented in:

- `src/integrations/firebase/auth.ts` - `signInWithGoogle()` function
- `src/hooks/useAuth.ts` - `loginWithGoogle()` method
- `src/pages/Login.tsx` - Google sign-in button with proper translations

## Notes

- Google authentication works for both login and signup - Firebase automatically creates an account if the user doesn't have one
- The button text changes based on whether the user is in "Login" or "Sign Up" mode
- Loading states are properly handled to prevent multiple clicks
- Error handling is in place with user-friendly toast notifications







