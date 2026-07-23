/**
 * @fileoverview Immutable Audit Logger Middleware for sensitive collections.
 * Automatically records { user_id, action, table_affected, hospital_id, timestamp, details }
 * for every operational and administrative action on sensitive tables.
 */

import { writeAuditLog } from './firestoreService';

const SENSITIVE_TABLES = [
  'users',
  'licenses',
  'audits',
  'findings',
  'capas',
  'incidents',
  'ai_settings',
  'ai_provider_keys'
];

/**
 * Creates an append-only audit log entry for a read or write event on a sensitive table.
 *
 * @param {Object} params
 * @param {string} params.userId        - ID of the user performing the action
 * @param {string} params.action        - Event action ("READ", "CREATE", "UPDATE", "DELETE", "EXPORT")
 * @param {string} params.tableAffected - Name of the affected table/collection (e.g. "audits", "incidents")
 * @param {string} params.hospitalId    - Hospital tenant ID
 * @param {Object} [params.details={}] - Additional details or metadata
 * @returns {Promise<Object>} The audit record structure
 */
export async function logSensitiveTableAction({ userId, action, tableAffected, hospitalId, details = {} }) {
  const isSensitive = SENSITIVE_TABLES.includes(tableAffected.toLowerCase());
  
  const auditRecord = {
    userId: userId || 'system',
    action: action.toUpperCase(),
    tableAffected: tableAffected.toLowerCase(),
    hospitalId: hospitalId || 'unknown_tenant',
    timestamp: new Date().toISOString(),
    isSensitiveTable: isSensitive,
    details
  };

  // Attempt writing to Firestore append-only audit log collection
  try {
    if (hospitalId) {
      await writeAuditLog(hospitalId, auditRecord);
    }
  } catch (err) {
    console.warn('[auditLoggerMiddleware] Failed writing to append-only cloud audit log:', err);
  }

  return auditRecord;
}
