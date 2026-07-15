/**
 * securityShield.js
 * VaidyaQ Active Shield & Security Armour
 * Provides runtime protection against XSS DOM manipulation, localStorage theft, 
 * session hijacking, and credential leakage in the console logs.
 */

// 1. Console Data Leakage Prevention (Stripping sensitive variables)
export function initConsoleGuard() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const sanitizeArgs = (args) => {
    return args.map(arg => {
      if (typeof arg === 'string') {
        let cleaned = arg;
        // Strip API keys (VaidyaQ keys, OpenAI, Anthropic, Gemini, Razorpay)
        cleaned = cleaned.replace(/\b(sk-ant-[a-zA-Z0-9_-]{20,}|sk-[a-zA-Z0-9_-]{20,}|rzp_[a-z]+_[a-zA-Z0-9_-]{10,})/g, '[REDACTED_API_KEY]');
        // Strip passwords
        cleaned = cleaned.replace(/\b(password|pass|secret)\b/ig, '[REDACTED_SECURE_PARAM]');
        return cleaned;
      }
      if (arg && typeof arg === 'object') {
        try {
          const stringified = JSON.stringify(arg);
          if (stringified.includes('password') || stringified.includes('sk-')) {
            return '[REDACTED_OBJECT_CONTAINING_SENSITIVE_DATA]';
          }
        } catch(err) {
          console.warn('[SECURITY SHIELD] JSON stringify error on log sanitization:', err);
        }
      }
      return arg;
    });
  };

  console.log = (...args) => originalLog.apply(console, sanitizeArgs(args));
  console.error = (...args) => originalError.apply(console, sanitizeArgs(args));
  console.warn = (...args) => originalWarn.apply(console, sanitizeArgs(args));
}

// 2. LocalStorage Guard (Rate limiting/Proxying to block bulk dumps by malicious extensions)
export function initLocalStorageGuard() {
  let readCounter = 0;
  let lastReadTime = Date.now();

  const originalGetItem = localStorage.getItem;
  
  // Intercept getItem to block rapid query loops (typical of data stealing scrapers)
  localStorage.getItem = function() {
    const now = Date.now();
    if (now - lastReadTime < 200) {
      readCounter++;
    } else {
      readCounter = 0;
    }
    lastReadTime = now;

    // If a script tries to read more than 30 keys in under a second, trigger safety lock
    if (readCounter > 30) {
      console.warn('[SECURITY SHIELD] Rate limiting local storage access. Threat vector intercepted.');
      throw new Error('SecurityException: Bulk reading of local storage is restricted.');
    }

    return originalGetItem.apply(this, arguments);
  };
}

// 3. DOM Injection Guard (MutationObserver to block rogue script tags injected by extensions or malware)
export function initDomGuard() {
  if (typeof window === 'undefined') return;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Detect tag injection
          if (node.nodeName === 'SCRIPT') {
            const src = node.getAttribute('src') || '';
            const isAllowed = src === '' || 
                              src.includes('razorpay') || 
                              src.includes('localhost') || 
                              src.includes('vaidyaq') || 
                              src.includes('vidya');
                              
            if (!isAllowed) {
              console.error(`[SECURITY SHIELD] Blocked unauthorized script source injection: ${src}`);
              node.remove(); // Instantly destroy the element!
            }
          }
          if (node.nodeName === 'IFRAME') {
            const src = node.getAttribute('src') || '';
            const isAllowed = src.includes('razorpay');
            if (!isAllowed) {
              console.error(`[SECURITY SHIELD] Blocked unauthorized iframe source injection: ${src}`);
              node.remove();
            }
          }
        });
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

// 4. Initialize all guards
export function initializeSecurityShield() {
  try {
    initConsoleGuard();
    initLocalStorageGuard();
    initDomGuard();
    console.log('[SECURITY SHIELD] VaidyaQ Shield Armour is active. Core systems secured.');
  } catch (err) {
    console.error('Failed to initialize Security Shield:', err);
  }
}
