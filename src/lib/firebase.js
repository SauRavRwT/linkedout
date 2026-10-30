import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
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

export function getAnonymousAuth() {
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
  if (error?.code === 'auth/admin-restricted-operation' || error?.code === 'auth/operation-not-allowed') {
    return 'Anonymous sign-in is disabled for this Firebase project. In Firebase Console, open Authentication → Sign-in method and enable Anonymous.'
  }
  if (error?.code === 'auth/unauthorized-domain') {
    return 'This site is not authorized for Firebase Authentication. Add its hostname in Firebase Console → Authentication → Settings → Authorized domains.'
  }
  return error?.message || 'Firebase Authentication request failed.'
}

export function subscribeToAnonymousUser(onUser, onError) {
  const auth = getAnonymousAuth()
  return onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        onUser(user)
        return
      }

      signInAnonymously(auth).catch(onError)
    },
    onError,
  )
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
        throw new Error(`This anonymous account already uses @${currentUsername}.`)
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

export function subscribeToPosts(onPosts, onError) {
  const postsQuery = query(collection(getFirestoreDb(), 'posts'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(
    postsQuery,
    (snapshot) => onPosts(snapshot.docs.map((post) => ({ id: post.id, ...post.data() }))),
    onError,
  )
}
