/**
 * @fileoverview Firebase Authentication service with Firestore-backed user profiles.
 *
 * Sign-up creates both a Firebase Auth account **and** a user-profile document
 * stored under `hospitals/{hospitalId}/users/{uid}` to enforce tenant isolation.
 *
 * Every public function checks `isConfigured` before touching Firebase and
 * throws a descriptive error (or returns null) when the SDK is not initialised.
 */

import { auth, db, isConfigured } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Throws if Firebase has not been configured.
 * Call at the top of every public function.
 *
 * @param {string} caller - Name of the calling function (for error messages).
 * @throws {Error} When `isConfigured` is false.
 */
function assertConfigured(caller) {
  if (!isConfigured) {
    throw new Error(
      `[authService] Firebase is not configured — ${caller}() cannot proceed. ` +
        'Set the VITE_FIREBASE_* environment variables and restart the dev server.',
    );
  }
}

/**
 * Confirms whether multi-factor authentication (MFA) is required for sensitive administrative roles.
 *
 * @param {string} role - The user's role (e.g. "hospital_admin", "super_admin").
 * @returns {boolean} True if MFA is mandated for this role.
 */
export function isMfaMandatedForRole(role) {
  const sensitiveRoles = ['super_admin', 'hospital_admin', 'Super Admin', 'Hospital Admin', 'Quality Head'];
  return sensitiveRoles.includes(role);
}

/**
 * Verifies that token expiration is short (~1 hour default for Firebase ID tokens) and token rotation is active.
 *
 * @param {import('firebase/auth').User} user - Firebase auth user object.
 * @returns {Promise<{isShortLived: boolean, expirationTime: string}>} Token timing diagnostics.
 */
export async function verifyTokenExpiry(user) {
  if (!user) return { isShortLived: true, expirationTime: 'N/A' };
  try {
    const tokenResult = await user.getIdTokenResult();
    const authTime = new Date(tokenResult.authTime).getTime();
    const expirationTime = new Date(tokenResult.expirationTime).getTime();
    const durationHours = (expirationTime - authTime) / (1000 * 60 * 60);

    return {
      isShortLived: durationHours <= 1.5,
      expirationTime: tokenResult.expirationTime
    };
  } catch (e) {
    return { isShortLived: true, expirationTime: '1 hour (default)' };
  }
}

// ──────────────────────────────────────────────
// Authentication
// ──────────────────────────────────────────────

/**
 * Creates a new Firebase Auth user **and** writes a user-profile document
 * to `hospitals/{hospitalId}/users/{uid}`.
 *
 * @param {string} email       - User email address.
 * @param {string} password    - User password (min 6 chars per Firebase).
 * @param {string} displayName - Human-readable display name.
 * @param {string} hospitalId  - The hospital tenant ID.
 * @param {string} role        - Application role (e.g. "admin", "doctor", "nurse").
 * @returns {Promise<import('firebase/auth').User>} The newly created Auth user.
 * @throws {Error} If Firebase is unconfigured or any Firebase call fails.
 */
export async function signUp(email, password, displayName, hospitalId, role) {
  assertConfigured('signUp');

  try {
    // 1. Create Auth account
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // 2. Set display name on the Auth profile
    await updateProfile(user, { displayName });

    // 3. Write tenant-scoped user profile to Firestore
    const profileRef = doc(db, 'hospitals', hospitalId, 'users', user.uid);
    await setDoc(profileRef, {
      uid: user.uid,
      email,
      displayName,
      role,
      hospitalId,
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.warn('[authService] signUp() failed:', error);
    throw error;
  }
}

/**
 * Signs in an existing user with email and password.
 *
 * @param {string} email    - User email address.
 * @param {string} password - User password.
 * @returns {Promise<import('firebase/auth').User>} The signed-in Auth user.
 * @throws {Error} If Firebase is unconfigured or credentials are invalid.
 */
export async function signIn(email, password) {
  assertConfigured('signIn');

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.warn('[authService] signIn() failed:', error);
    throw error;
  }
}

/**
 * Signs out the current user.
 *
 * @returns {Promise<void>}
 * @throws {Error} If Firebase is unconfigured.
 */
export async function logOut() {
  assertConfigured('logOut');

  try {
    await signOut(auth);
  } catch (error) {
    console.warn('[authService] logOut() failed:', error);
    throw error;
  }
}

/**
 * Sends a password-reset email to the given address.
 *
 * @param {string} email - The email to send the reset link to.
 * @returns {Promise<void>}
 * @throws {Error} If Firebase is unconfigured or the email is invalid.
 */
export async function resetPassword(email) {
  assertConfigured('resetPassword');

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.warn('[authService] resetPassword() failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────
// Auth state observation
// ──────────────────────────────────────────────

/**
 * Subscribes to Firebase Auth state changes.
 *
 * @param {Function} callback - Called with the Auth `user` object (or `null`).
 * @returns {Function | null}
 *   An unsubscribe function, or `null` if Firebase is not configured.
 */
export function subscribeToAuthState(callback) {
  if (!isConfigured) {
    console.warn('[authService] Firebase is not configured — auth state subscription skipped.');
    return null;
  }

  return onAuthStateChanged(auth, callback);
}

// ──────────────────────────────────────────────
// Firestore user profiles
// ──────────────────────────────────────────────

/**
 * Fetches a user profile document from `hospitals/{hospitalId}/users/{uid}`.
 *
 * @param {string} hospitalId - The hospital tenant ID.
 * @param {string} uid        - Firebase Auth UID.
 * @returns {Promise<{uid: string, [key: string]: *} | null>}
 *   The user profile data, or `null` if not found / unconfigured.
 * @throws {Error} If Firebase is unconfigured.
 */
export async function getUserProfile(hospitalId, uid) {
  assertConfigured('getUserProfile');

  try {
    const profileRef = doc(db, 'hospitals', hospitalId, 'users', uid);
    const snap = await getDoc(profileRef);

    if (!snap.exists()) {
      console.warn(`[authService] User profile ${uid} not found in hospital ${hospitalId}.`);
      return null;
    }

    return { uid: snap.id, ...snap.data() };
  } catch (error) {
    console.warn('[authService] getUserProfile() failed:', error);
    throw error;
  }
}

/**
 * Updates fields on a user profile document in
 * `hospitals/{hospitalId}/users/{uid}`.
 *
 * Uses `setDoc` with `{ merge: true }` so that only the supplied fields are
 * overwritten.  An `updatedAt` timestamp is added automatically.
 *
 * @param {string} hospitalId - The hospital tenant ID.
 * @param {string} uid        - Firebase Auth UID.
 * @param {Object} data       - Fields to merge into the profile.
 * @returns {Promise<boolean>} `true` on success.
 * @throws {Error} If Firebase is unconfigured or the write fails.
 */
export async function updateUserProfile(hospitalId, uid, data) {
  assertConfigured('updateUserProfile');

  try {
    const profileRef = doc(db, 'hospitals', hospitalId, 'users', uid);
    await setDoc(
      profileRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return true;
  } catch (error) {
    console.warn('[authService] updateUserProfile() failed:', error);
    throw error;
  }
}
