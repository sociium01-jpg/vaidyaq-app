/**
 * @fileoverview Secrets & Field-Level Encryption Verification Tests
 */

import { describe, it, expect } from 'vitest';
import { encryptSensitiveField, decryptSensitiveField } from '../services/cryptoService';

describe('2. SECRETS & ENCRYPTION Verification', () => {

  it('2.1 Should encrypt and decrypt sensitive fields (Patient MRN / Audit findings naming individuals)', async () => {
    const rawPatientIdentifier = 'Aadhaar: 9876-5432-1098 | Patient: Rajesh Sharma';
    const encrypted = await encryptSensitiveField(rawPatientIdentifier);

    expect(encrypted).not.toEqual(rawPatientIdentifier);
    expect(encrypted.startsWith('enc::')).toBe(true);

    const decrypted = await decryptSensitiveField(encrypted);
    expect(decrypted).toEqual(rawPatientIdentifier);
  });

  it('2.2 Should safely handle unencrypted or null inputs during field decryption', async () => {
    const legacyPlaintext = 'General Hospital Staff Hygiene Finding';
    const result = await decryptSensitiveField(legacyPlaintext);
    expect(result).toEqual(legacyPlaintext);

    const nullValue = await decryptSensitiveField(null);
    expect(nullValue).toBeNull();
  });

  it('2.3 Should confirm no private API secrets are exposed to the client bundle', () => {
    const envVars = import.meta.env || {};
    // Ensure server-only secret keys are not prefixed with VITE_
    expect(envVars['VITE_RAZORPAY_KEY_SECRET']).toBeUndefined();
    expect(envVars['VITE_CLAUDE_API_KEY']).toBeUndefined();
    expect(envVars['VITE_SUPABASE_SERVICE_ROLE_KEY']).toBeUndefined();
  });
});
