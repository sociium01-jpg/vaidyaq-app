/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

const TOAST_DURATION = 4000;
const MAX_TOASTS = 3;

const VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
    border: 'rgba(16,185,129,0.3)',
    color: '#34d399',
    progressColor: '#10b981',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
    border: 'rgba(239,68,68,0.3)',
    color: '#f87171',
    progressColor: '#ef4444',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))',
    border: 'rgba(245,158,11,0.3)',
    color: '#fbbf24',
    progressColor: '#f59e0b',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.08))',
    border: 'rgba(59,130,246,0.3)',
    color: '#60a5fa',
    progressColor: '#3b82f6',
    label: 'Info',
  },
};

let toastIdCounter = 0;

function ToastItem({ toast, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const variant = VARIANTS[toast.type] || VARIANTS.info;
  const IconComp = variant.icon;
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const [progress, setProgress] = useState(100);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    // Set start time inside effect to keep render pure
    startTimeRef.current = Date.now();

    // Animate in
    requestAnimationFrame(() => requestAnimationFrame(() => setIsVisible(true)));

    // Progress bar animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);

    // Auto dismiss
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, TOAST_DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, [handleDismiss]);

  return (
    <div
      style={{
        position: 'relative',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'var(--bg-primary)',
        backgroundImage: variant.bg,
        border: `1px solid ${variant.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 0 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
        transform: isExiting
          ? 'translateX(120%) scale(0.9)'
          : isVisible
            ? 'translateX(0) scale(1)'
            : 'translateX(120%) scale(0.9)',
        opacity: isExiting ? 0 : isVisible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => clearTimeout(timerRef.current)}
      onMouseLeave={() => {
        startTimeRef.current = Date.now() - (TOAST_DURATION * (1 - progress / 100));
        timerRef.current = setTimeout(handleDismiss, TOAST_DURATION * (progress / 100));
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '14px 16px',
      }}>
        {/* Icon */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${variant.color}18`,
          color: variant.color,
          flexShrink: 0,
        }}>
          <IconComp size={18} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: 600, color: variant.color,
            marginBottom: '2px', letterSpacing: '0.2px',
          }}>
            {toast.title || variant.label}
          </div>
          <div style={{
            fontSize: '13px', color: 'var(--text-secondary)',
            lineHeight: '1.45', wordBreak: 'break-word',
          }}>
            {toast.message}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '6px', flexShrink: 0,
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '3px', background: 'rgba(255,255,255,0.04)',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: `linear-gradient(90deg, ${variant.progressColor}, ${variant.color})`,
          borderRadius: '0 2px 2px 0',
          transition: 'width 0.1s linear',
        }} />
      </div>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;

    let msg;
    let t = type;
    let title = '';

    if (message && typeof message === 'object') {
      msg = message.message || message.description || '';
      t = message.type || 'info';
      title = message.title || '';
    } else {
      msg = message;
      t = type;
    }

    const finalMessage = typeof msg === 'object' ? JSON.stringify(msg) : String(msg || '');
    const finalTitle = typeof title === 'object' ? JSON.stringify(title) : String(title || '');

    setToasts(prev => {
      const next = [...prev, { id, message: finalMessage, type: t, title: finalTitle }];
      // Keep max toasts, evict oldest
      if (next.length > MAX_TOASTS) {
        return next.slice(next.length - MAX_TOASTS);
      }
      return next;
    });
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
