/**
 * @fileoverview Firestore CRUD service layer with tenant isolation.
 *
 * Every query is scoped under `hospitals/{hospitalId}/{subcollection}` so that
 * data from different hospitals can never leak across tenants.
 *
 * All public functions check `isConfigured` before touching Firestore and
 * return safe fallback values (null / []) when Firebase is not initialised.
 */

import { db, isConfigured } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

// ──────────────────────────────────────────────
// Reference helpers
// ──────────────────────────────────────────────

/**
 * Returns a Firestore document reference for a hospital.
 *
 * @param {string} hospitalId - The hospital tenant ID.
 * @returns {import('firebase/firestore').DocumentReference | null}
 */
export function getHospitalRef(hospitalId) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured.');
    return null;
  }
  return doc(db, 'hospitals', hospitalId);
}

/**
 * Returns a Firestore collection reference scoped to a hospital subcollection.
 *
 * @param {string} hospitalId   - The hospital tenant ID.
 * @param {string} subcollection - Name of the subcollection (e.g. "patients").
 * @returns {import('firebase/firestore').CollectionReference | null}
 */
export function getSubcollectionRef(hospitalId, subcollection) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured.');
    return null;
  }
  return collection(db, 'hospitals', hospitalId, subcollection);
}

// ──────────────────────────────────────────────
// Read operations
// ──────────────────────────────────────────────

/**
 * Fetches all documents from a tenant-scoped subcollection.
 *
 * @param {string}   hospitalId    - The hospital tenant ID.
 * @param {string}   subcollection - Subcollection name.
 * @param {Array<{field: string, operator: string, value: *}>} [filters=[]]
 *   Optional Firestore `where` constraints.
 * @returns {Promise<Array<{id: string, [key: string]: *}>>}
 *   Resolved array of documents (empty array on error / unconfigured).
 */
export async function fetchCollection(hospitalId, subcollection, filters = []) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — returning empty array.');
    return [];
  }

  try {
    const colRef = collection(db, 'hospitals', hospitalId, subcollection);

    // Build query constraints from the filters array
    const constraints = filters.map((f) => where(f.field, f.operator, f.value));
    const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn(`[firestoreService] fetchCollection(${subcollection}) failed:`, error);
    return [];
  }
}

/**
 * Fetches a single document from a tenant-scoped subcollection.
 *
 * @param {string} hospitalId    - The hospital tenant ID.
 * @param {string} subcollection - Subcollection name.
 * @param {string} docId         - Document ID to fetch.
 * @returns {Promise<{id: string, [key: string]: *} | null>}
 *   The document data with its ID, or null if not found / unconfigured.
 */
export async function fetchDocument(hospitalId, subcollection, docId) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — returning null.');
    return null;
  }

  try {
    const docRef = doc(db, 'hospitals', hospitalId, subcollection, docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.warn(`[firestoreService] Document ${docId} not found in ${subcollection}.`);
      return null;
    }

    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.warn(`[firestoreService] fetchDocument(${subcollection}/${docId}) failed:`, error);
    return null;
  }
}

// ──────────────────────────────────────────────
// Write operations
// ──────────────────────────────────────────────

/**
 * Creates a new document in a tenant-scoped subcollection.
 *
 * The `createdAt` field is automatically set via `serverTimestamp()`.
 *
 * @param {string} hospitalId    - The hospital tenant ID.
 * @param {string} subcollection - Subcollection name.
 * @param {Object} data          - Document data to write.
 * @returns {Promise<{id: string} | null>}
 *   The new document reference (with `id`), or null on failure.
 */
export async function createDocument(hospitalId, subcollection, data) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — document not created.');
    return null;
  }

  try {
    const colRef = collection(db, 'hospitals', hospitalId, subcollection);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.warn(`[firestoreService] createDocument(${subcollection}) failed:`, error);
    return null;
  }
}

/**
 * Updates an existing document in a tenant-scoped subcollection.
 *
 * The `updatedAt` field is automatically set via `serverTimestamp()`.
 *
 * @param {string} hospitalId    - The hospital tenant ID.
 * @param {string} subcollection - Subcollection name.
 * @param {string} docId         - Document ID to update.
 * @param {Object} data          - Fields to merge / overwrite.
 * @returns {Promise<boolean>} `true` on success, `false` on failure.
 */
export async function updateDocument(hospitalId, subcollection, docId, data) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — document not updated.');
    return false;
  }

  try {
    const docRef = doc(db, 'hospitals', hospitalId, subcollection, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn(`[firestoreService] updateDocument(${subcollection}/${docId}) failed:`, error);
    return false;
  }
}

/**
 * Deletes a document from a tenant-scoped subcollection.
 *
 * @param {string} hospitalId    - The hospital tenant ID.
 * @param {string} subcollection - Subcollection name.
 * @param {string} docId         - Document ID to delete.
 * @returns {Promise<boolean>} `true` on success, `false` on failure.
 */
export async function deleteDocument(hospitalId, subcollection, docId) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — document not deleted.');
    return false;
  }

  try {
    const docRef = doc(db, 'hospitals', hospitalId, subcollection, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn(`[firestoreService] deleteDocument(${subcollection}/${docId}) failed:`, error);
    return false;
  }
}

// ──────────────────────────────────────────────
// Real-time subscription
// ──────────────────────────────────────────────

/**
 * Subscribes to real-time updates on a tenant-scoped subcollection.
 *
 * @param {string}   hospitalId    - The hospital tenant ID.
 * @param {string}   subcollection - Subcollection name.
 * @param {Function} callback      - Called with an array of documents on every change.
 * @param {Array<{field: string, operator: string, value: *}>} [filters=[]]
 *   Optional Firestore `where` constraints.
 * @returns {Function | null}
 *   An unsubscribe function, or null if Firebase is not configured.
 */
export function subscribeToCollection(hospitalId, subcollection, callback, filters = []) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — subscription skipped.');
    return null;
  }

  try {
    const colRef = collection(db, 'hospitals', hospitalId, subcollection);
    const constraints = filters.map((f) => where(f.field, f.operator, f.value));
    const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(docs);
      },
      (error) => {
        console.warn(`[firestoreService] subscribeToCollection(${subcollection}) error:`, error);
      },
    );

    return unsubscribe;
  } catch (error) {
    console.warn(`[firestoreService] subscribeToCollection(${subcollection}) failed:`, error);
    return null;
  }
}

// ──────────────────────────────────────────────
// Audit logging
// ──────────────────────────────────────────────

/**
 * Writes an entry to the `auditLogs` subcollection for a hospital.
 *
 * @param {string} hospitalId          - The hospital tenant ID.
 * @param {Object} details             - Audit log payload.
 * @param {string} details.user        - Username or UID that performed the action.
 * @param {string} details.role        - Role of the user (e.g. "admin", "nurse").
 * @param {string} details.action      - Human-readable description of the action.
 * @returns {Promise<{id: string} | null>}
 *   The new audit log document reference, or null on failure.
 */
export async function writeAuditLog(hospitalId, { user, role, action }) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — audit log skipped.');
    return null;
  }

  try {
    const colRef = collection(db, 'hospitals', hospitalId, 'auditLogs');
    const docRef = await addDoc(colRef, {
      user,
      role,
      action,
      timestamp: serverTimestamp(),
      ip: 'server-side-only', // IP should be captured by a Cloud Function or server
    });
    return { id: docRef.id };
  } catch (error) {
    console.warn('[firestoreService] writeAuditLog() failed:', error);
    return null;
  }
}

// ──────────────────────────────────────────────
// Batch operations
// ──────────────────────────────────────────────

/**
 * Performs a batched update on multiple documents within a tenant-scoped
 * subcollection.  Each update automatically receives an `updatedAt` timestamp.
 *
 * Firestore limits a single batch to **500 writes**.  This function does NOT
 * split larger payloads — callers must chunk if needed.
 *
 * @param {string} hospitalId    - The hospital tenant ID.
 * @param {string} subcollection - Subcollection name.
 * @param {Array<{id: string, data: Object}>} updates
 *   Array of objects, each containing a document `id` and partial `data`.
 * @returns {Promise<boolean>} `true` on success, `false` on failure.
 */
export async function batchUpdate(hospitalId, subcollection, updates) {
  if (!isConfigured) {
    console.warn('[firestoreService] Firebase is not configured — batch update skipped.');
    return false;
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    console.warn('[firestoreService] batchUpdate() called with empty updates array.');
    return false;
  }

  try {
    const batch = writeBatch(db);

    updates.forEach(({ id, data }) => {
      const docRef = doc(db, 'hospitals', hospitalId, subcollection, id);
      batch.update(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.warn(`[firestoreService] batchUpdate(${subcollection}) failed:`, error);
    return false;
  }
}
