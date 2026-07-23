/**
 * @fileoverview Output encoding and XSS sanitization utilities for user-supplied fields.
 * Encodes special characters before rendering to prevent stored XSS attacks.
 */

/**
 * Encodes HTML special characters to prevent Stored XSS attacks.
 * @param {string} str - Raw input string
 * @returns {string} Sanitized HTML-safe string
 */
export function encodeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes object fields recursively for safer rendering.
 * @param {Object} obj - Target object (e.g. audit note, comment)
 * @returns {Object} Deep-sanitized object clone
 */
export function sanitizeObjectFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectFields(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = encodeHTML(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObjectFields(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
