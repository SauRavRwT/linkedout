import { getApp, getApps, initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { firebaseConfig, firebaseConfigured, firestoreDatabaseId } from './firebase-config.js'

const firebaseApp = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

if (firebaseApp && import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}

export function getFirebaseAuth() {
  if (!firebaseApp) throw new Error('Firebase is not configured.')
  return getAuth(firebaseApp)
}

export function getFirestoreDb() {
  if (!firebaseApp) throw new Error('Firebase is not configured.')
  return getFirestore(firebaseApp, firestoreDatabaseId)
}

export function getFirestoreErrorMessage(error) {
  if (error?.code === 'unavailable' || error?.code === 'failed-precondition') {
    return 'Could not reach the selected Firestore database. Check your connection, confirm the database is in Native mode (not Datastore mode), and verify VITE_FIREBASE_DATABASE_ID.'
  }
  return error?.message || 'Firestore request failed.'
}

export function getAuthErrorMessage(error) {
  if (error?.code === 'auth/email-already-in-use') {
    return 'An account already uses this email. Sign in instead.'
  }
  if (error?.code === 'auth/invalid-email') {
    return 'Enter a valid email address.'
  }
  if (error?.code === 'auth/weak-password') {
    return 'Choose a password with at least 6 characters.'
  }
  if (error?.code === 'auth/invalid-credential') {
    return 'That email and password combination was not recognized.'
  }
  if (error?.code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a little while, then try again.'
  }
  if (error?.code === 'auth/admin-restricted-operation' || error?.code === 'auth/operation-not-allowed') {
    return 'Email and password sign-in is disabled for this Firebase project. In Firebase Console, open Authentication → Sign-in method and enable it.'
  }
  if (error?.code === 'auth/unauthorized-domain') {
    return 'This site is not authorized for Firebase Authentication. Add its hostname in Firebase Console → Authentication → Settings → Authorized domains.'
  }
  return error?.message || 'Firebase Authentication request failed.'
}

export function subscribeToUser(onUser, onError) {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, onUser, onError)
}

export function createAccount(email, password) {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
}

export function sendVerificationEmail(user) {
  return sendEmailVerification(user)
}

export async function refreshUser(user) {
  await reload(user)
  await user.getIdToken(true)
  return getFirebaseAuth().currentUser
}

export function signOutUser() {
  return signOut(getFirebaseAuth())
}

export async function getUserProfile(uid) {
  const profile = await getDoc(doc(getFirestoreDb(), 'users', uid))
  return profile.exists() ? profile.data() : null
}

export async function claimUsername(uid, value) {
  const username = value.trim().toLowerCase()
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error('Choose a handle with 3–20 letters, numbers, or underscores.')
  }

  const db = getFirestoreDb()
  const usernameRef = doc(db, 'usernames', username)
  const profileRef = doc(db, 'users', uid)

  return runTransaction(db, async (transaction) => {
    const [usernameSnapshot, profileSnapshot] = await Promise.all([
      transaction.get(usernameRef),
      transaction.get(profileRef),
    ])

    if (profileSnapshot.exists()) {
      const currentUsername = profileSnapshot.data().username
      if (currentUsername !== username) {
        throw new Error(`This account already uses @${currentUsername}.`)
      }
      return currentUsername
    }

    if (usernameSnapshot.exists()) {
      throw new Error('That handle is already taken. Try another one.')
    }

    transaction.set(usernameRef, { uid, username, createdAt: serverTimestamp() })
    transaction.set(profileRef, { username, createdAt: serverTimestamp() })
    return username
  })
}

export function createPost({ username, company, message, outcome }) {
  return addDoc(collection(getFirestoreDb(), 'posts'), {
    username,
    company: company.trim(),
    message: message.trim(),
    outcome,
    createdAt: serverTimestamp(),
  })
}

export function createReply({ postId, parentId, username, message }) {
  const trimmedMessage = message.trim()
  if (!trimmedMessage || trimmedMessage.length > 2000) {
    throw new Error('Replies must be between 1 and 2,000 characters.')
  }

  return addDoc(collection(getFirestoreDb(), 'posts', postId, 'replies'), {
    username,
    message: trimmedMessage,
    parentId: parentId ?? null,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToPosts(onPosts, onError) {
  const postsQuery = query(collection(getFirestoreDb(), 'posts'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(
    postsQuery,
    (snapshot) => onPosts(snapshot.docs.map((post) => ({ id: post.id, ...post.data() }))),
    onError,
  )
}

export function subscribeToReplies(postId, onReplies, onError) {
  const repliesQuery = query(
    collection(getFirestoreDb(), 'posts', postId, 'replies'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(
    repliesQuery,
    (snapshot) =>
      onReplies(snapshot.docs.map((reply) => ({ id: reply.id, ...reply.data() }))),
    onError,
  )
}
