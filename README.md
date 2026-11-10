# LinkedOut

**The truth doesn’t fit in an exit interview.**

LinkedOut is a place to share the real reasons people leave a job—or are let go—without signing up with your real name. Create an account with an email address, verify it, and choose a unique public handle. Your email is not shown with your stories.

<p align="center">
  <img src="./images/linkedout-1.png" width="72%" alt="LinkedOut anonymous workplace story feed">
</p>

[![Live demo](https://img.shields.io/badge/Live%20demo-2ea44f?style=for-the-badge)](https://sauravrwt.github.io/linkedout/)

## Features

- Email/password Firebase Authentication with verified email and unique public handles.
- Stories with a company, message, and outcome: **I quit** or **I was let go**.
- Nested, anonymous conversations on stories, with replies up to 2,000 characters.
- Live, newest-first story feed with outcome filters.
- Responsive Liquid Glass interface with a persistent light/dark theme switch.
- A dedicated About page and account sign-in, sign-up, verification, and logout flows.
- Optional Firebase App Check with reCAPTCHA v3 to help protect Firebase requests.
- Firestore rules for unique handles, verified accounts, and validated story submissions.

## Tech stack

- React
- Vite
- Firebase Authentication
- Cloud Firestore

## Project structure

- `src/App.jsx` — shared application state and Firebase workflows.
- `src/components/home/` — homepage hero and story composer.
- `src/components/stories/` — story feed, story cards, and replies.
- `src/components/pages/` — sign-in, sign-up, verification, profile, and About pages.
- `src/components/layout/` — site header and footer.
- Component styles live beside their component; `src/App.css` holds shared styles.
- `src/lib/firebase.js` — Firebase authentication and Firestore operations.

## Get started

### Requirements

- Node.js and npm
- A Firebase project with a registered Web app
- Cloud Firestore in **Native mode**

### Configure Firebase

1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
2. Set up an email template under **Authentication → Templates → Email address verification**.
3. Create a Cloud Firestore database in **Native mode**. Datastore mode is not supported by the Firebase Firestore client SDK. If the project’s default database is in Datastore mode, create a Native mode database with a separate database ID or use another Firebase project.
4. Publish [the Firestore rules](./firestore.rules) to the same Native mode database. They require a verified email before username claims, stories, or replies can be written. Reply writes also require a rule allowing authenticated users to create validated documents at `posts/{postId}/replies/{replyId}`.
5. Copy [`.env.example`](./.env.example) to `.env` and set the Firebase Web app values:

   ```dotenv
   VITE_FIREBASE_API_KEY=your-firebase-web-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_FIREBASE_DATABASE_ID=(default)
   VITE_FIREBASE_APPCHECK_SITE_KEY=
   ```

   Set `VITE_FIREBASE_DATABASE_ID` to your Native mode database ID. Use `(default)` only if the default database is in Native mode. Copy plain values from Firebase Console—do not include JavaScript quotes or trailing commas.

   For App Check, register a web app in **Firebase Console → App Check**, select reCAPTCHA v3, add the development and production domains, and set `VITE_FIREBASE_APPCHECK_SITE_KEY` to its site key. After deploying and monitoring valid traffic, enable App Check enforcement for the Firebase products you use. App Check is optional until the key is configured.

### Install and run

```sh
npm install
npm run dev
```

Vite prints the local development URL after startup.

## Build and checks

```sh
npm run build
npm run preview
npm run lint
```

`npm run build` creates the production site in `dist/`; `npm run preview` serves that build locally.

## Hosting

Vite embeds `VITE_*` settings into the frontend at **build time**. Add the required Firebase variables to your hosting provider’s build environment and rebuild/redeploy after changing them. Runtime variables added after the build will not update an existing `dist/` bundle.

For hosted or port-forwarded URLs, add the hostname under **Firebase Console → Authentication → Settings → Authorized domains**. If the API key is restricted by HTTP referrer, allow the site’s origin in that key’s restrictions as well.

Firebase Web app configuration is meant to be used by the browser. Never put service-account credentials or private keys in frontend environment variables.

## Data and privacy

The app uses:

- Firebase Authentication stores the account email and password credential; the email is not written to Firestore or displayed publicly.
- `usernames/{handle}` — reserves a unique handle for a verified Firebase Auth account.
- `users/{uid}` — maps that account to its public handle.
- `posts/{postId}` — stores the handle, company, story, outcome, and timestamp.
- `posts/{postId}/replies/{replyId}` — stores the handle, reply, optional parent reply ID, and timestamp. Replies can be nested and are publicly readable and immutable through the client.

Stories and replies are publicly readable and cannot be edited or deleted by the client. Handles are unique and cannot be changed through the client. Avoid including real names or details that could identify you or another person.

Email verification and App Check help deter abuse, but neither guarantees one account per person. This frontend does not implement server-side posting rate limits or an interactive signup CAPTCHA. Those require a trusted backend (for example, Cloud Functions) that validates each request; client-side limits are not secure. Review the Firebase configuration, deployed rules, and abuse protections before making the app publicly available.
