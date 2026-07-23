/**
 * @fileoverview Field-level Encryption (AES-GCM 256-bit) for sensitive clinical & patient fields.
 * Equivalent to pgcrypto field-level encryption for NoSQL/Firestore document payload properties.
 */

const ENCRYPTION_KEY_SECRET = import.meta.env.VITE_FIELD_ENCRYPTION_KEY || 'QualiNABH_Field_Encryption_Default_Secret_Key_32B!';

async function getCryptoKey() {
  const enc = new TextEncoder();
  const keyData = enc.encode(ENCRYPTION_KEY_SECRET.padEnd(32, '0').slice(0, 32));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a sensitive string field (e.g. Patient MRN, Name, Aadhaar)
 * @param {string} text 
 * @returns {Promise<string>} Base64 encrypted string with IV
 */
export async function encryptSensitiveField(text) {
  if (!text || typeof text !== 'string') return text;
  try {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(text)
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return 'enc::' + btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.warn('[cryptoService] Field encryption failed:', err);
    return text; // fallback to unencrypted string on error
  }
}

/**
 * Decrypts a sensitive field if it was encrypted with `enc::` prefix
 * @param {string} cipherText 
 * @returns {Promise<string>} Plaintext string
 */
export async function decryptSensitiveField(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc::')) {
    return cipherText;
  }
  try {
    const key = await getCryptoKey();
    const base64Str = cipherText.replace('enc::', '');
    const binaryStr = atob(base64Str);
    const combined = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      combined[i] = binaryStr.charCodeAt(i);
    }
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.warn('[cryptoService] Field decryption failed:', err);
    return '[Decryption Failed]';
  }
}
