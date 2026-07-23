/**
 * @fileoverview File Upload & Malware Protection Verification Tests
 */

import { describe, it, expect } from 'vitest';
import { scanFileForMalware } from '../services/fileScannerService';

describe('4. FILE UPLOAD / MALWARE PROTECTION Verification', () => {

  it('4.1 Should allow whitelisted document MIME types (PDF, PNG, JPEG, DOCX, XLSX)', async () => {
    const validPdfFile = new File(['%PDF-1.5 test document content'], 'evidence.pdf', { type: 'application/pdf' });
    const result = await scanFileForMalware(validPdfFile);

    expect(result.safe).toBe(true);
  });

  it('4.2 Should reject non-whitelisted executable MIME types (e.g. .exe, .sh, .html, .js)', async () => {
    const maliciousScript = new File(['<script>evil()</script>'], 'malware.html', { type: 'text/html' });
    const result = await scanFileForMalware(maliciousScript);

    expect(result.safe).toBe(false);
    expect(result.reason).toContain('is not allowed');
  });

  it('4.3 Should block files exceeding 10MB limit', async () => {
    const oversizedBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'application/pdf' });
    const oversizedFile = new File([oversizedBlob], 'large_evidence.pdf', { type: 'application/pdf' });

    const result = await scanFileForMalware(oversizedFile);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('exceeds 10MB');
  });

  it('4.4 Should detect executable binary magic bytes (MZ header executable disguised as PDF)', async () => {
    // Binary buffer starting with 'MZ' (0x4D, 0x5A - Windows executable)
    const mzHeaderBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
    const disguisedExeFile = new File([mzHeaderBytes], 'fake_doc.pdf', { type: 'application/pdf' });

    const result = await scanFileForMalware(disguisedExeFile);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('executable header detected');
  });
});
