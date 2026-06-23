import React, { useState, useContext, useEffect, useRef } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { Plus, X, FileText, AlertTriangle, CheckSquare, ClipboardList } from 'lucide-react';

const ACTIONS = [
  {
    label: 'New Incident',
    icon: AlertTriangle,
    route: '/incidents',
    emoji: '📝',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
  {
    label: 'New Document',
    icon: FileText,
    route: '/documents',
    emoji: '📄',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  },
  {
    label: 'New Task',
    icon: CheckSquare,
    route: '/tasks',
    emoji: '✅',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
  {
    label: 'Quick Audit',
    icon: ClipboardList,
    route: '/audits',
    emoji: '🔍',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  },
];

export default function FAB() {
  const { setCurrentRoute } = useContext(QualiNABHContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const fabRef = useRef(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const handleAction = (route) => {
    setCurrentRoute(route);
    handleClose();
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Inline style tag for the media query safeguard & keyframes */}
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(13,148,136,0.4); }
          50% { box-shadow: 0 4px 30px rgba(13,148,136,0.6), 0 0 40px rgba(13,148,136,0.15); }
        }
        @media (min-width: 769px) {
          .vq-fab-root { display: none !important; }
        }
      `}</style>

      <div ref={fabRef} className="vq-fab-root" style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 9990 }}>
        {/* Backdrop overlay */}
        {isOpen && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: -1,
          }} />
        )}

        {/* Sub-action buttons */}
        {isOpen && ACTIONS.map((action, idx) => {
          const reverseIdx = ACTIONS.length - 1 - idx;
          const offset = (idx + 1) * 64;
          return (
            <div
              key={action.label}
              style={{
                position: 'absolute',
                bottom: `${offset}px`,
                right: '4px',
                display: 'flex', alignItems: 'center', gap: '10px',
                transform: isAnimating
                  ? 'translateY(0) scale(1)'
                  : 'translateY(20px) scale(0.5)',
                opacity: isAnimating ? 1 : 0,
                transition: `all 0.35s cubic-bezier(0.16,1,0.3,1) ${reverseIdx * 0.04}s`,
                pointerEvents: isAnimating ? 'auto' : 'none',
              }}
            >
              {/* Label */}
              <div style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontSize: '13px', fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                {action.emoji} {action.label}
              </div>

              {/* Circle button */}
              <button
                onClick={() => handleAction(action.route)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  border: 'none', cursor: 'pointer',
                  background: action.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.12)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
                }}
              >
                <action.icon size={20} />
              </button>
            </div>
          );
        })}

        {/* Main FAB button */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
            animation: isOpen ? 'none' : 'fabPulse 3s ease-in-out infinite',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
            transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)',
            position: 'relative',
            zIndex: 1,
          }}
          onMouseEnter={e => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(13,148,136,0.5)';
            }
          }}
          onMouseLeave={e => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,148,136,0.4)';
            }
          }}
        >
          {isOpen ? <X size={24} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
}
