/**
 * @fileoverview Audit Logging Verification Tests
 */

import { describe, it, expect } from 'vitest';
import { logSensitiveTableAction } from '../services/auditLoggerMiddleware';
import firestoreRules from '../../firestore.rules?raw';

describe('6. AUDIT LOGGING Verification', () => {

  it('6.1 Should record user_id, action, table_affected, hospital_id, and timestamp for sensitive table actions', async () => {
    const log = await logSensitiveTableAction({
      userId: 'usr_doctor_101',
      action: 'UPDATE',
      tableAffected: 'incidents',
      hospitalId: 'hosp_metro_01',
      details: { incidentId: 'inc-99', status: 'Under Investigation' }
    });

    expect(log.userId).toEqual('usr_doctor_101');
    expect(log.action).toEqual('UPDATE');
    expect(log.tableAffected).toEqual('incidents');
    expect(log.hospitalId).toEqual('hosp_metro_01');
    expect(log.timestamp).toBeDefined();
    expect(log.isSensitiveTable).toBe(true);
  });

  it('6.2 Should confirm audit_logs collection has append-only rules (update/delete blocked) in firestore.rules', () => {
    expect(firestoreRules).toContain('match /audit_logs/{logId}');
    expect(firestoreRules).toContain('allow update, delete: if false;');
  });
});
