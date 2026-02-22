# Auth setup (Firebase + Google)

## 1. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** and add sign-in methods:
   - **Email/Password** – enable “Email/Password”.
   - **Google** – enable “Google” and set a support email.
3. In **Project settings** (gear) → **Your apps**, add a web app and copy the config values.

## 2. Environment variables

Copy `.env.example` to `.env` and fill in:

- **Firebase:** `EXPO_PUBLIC_FIREBASE_*` from the Firebase web app config.
- **Google Sign-In:** Use the **Web client ID** from Firebase Console → Authentication → Sign-in method → Google (under “Web SDK configuration”). Set it as:
  - `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (required for the OAuth flow).

Optional for native builds:

- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (same as Web client ID if you use one client for all)

## 3. Run the app

```bash
npx expo start
```

- **Email:** Use “Sign up” / “Sign in” with email and password.
- **Google:** Use “Continue with Google” (opens browser; after sign-in you’re redirected back).

## 4. Sign out

Use the “Sign out” link on the Home tab.
