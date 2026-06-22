import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_MAP = {
  '/app/dashboard':    'Command Center',
  '/app/quality':      'Quality & CAPA',
  '/app/compliance':   'Compliance',
  '/app/accreditation':'Accreditation',
  '/app/documents':    'Document Control',
  '/app/tasks':        'Task Management',
  '/app/ai':           'AI Insights',
  '/app/reports':      'Reports & Analytics',
  '/app/admin':        'Administration',
  '/app/committees':   'Committee Management',
  '/app/training':     'Training & Competency',
  '/app/profile':      'Profile Settings',
  '/app/support':      'Support Center',
};

export default function Breadcrumb() {
  const { currentRoute, setCurrentRoute, currentUser } = useContext(QualiNABHContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Hidden on mobile — mobile uses bottom nav instead
  if (isMobile) return null;

  // Normalize currentRoute (e.g. /app/tasks -> /app/tasks)
  const parts = currentRoute.split('/').filter(Boolean);
  const isAppRoute = parts[0] === 'app';
  const moduleName = isAppRoute ? parts[1] : null;
  const subModuleName = isAppRoute ? parts[2] : null;

  const lookupRoute = isAppRoute && moduleName ? `/app/${moduleName}` : currentRoute;
  let currentLabel = ROUTE_MAP[lookupRoute] || 'Dashboard';
  if (subModuleName) {
    const formattedSub = subModuleName.charAt(0).toUpperCase() + subModuleName.slice(1);
    currentLabel = `${currentLabel} > ${formattedSub}`;
  }

  const isHome = lookupRoute === '/app/dashboard' || currentRoute === '/app/dashboard' || currentRoute === '/';

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'var(--bg-tertiary)',
    borderRadius: '10px',
    fontSize: '0.8rem',
    lineHeight: 1,
    userSelect: 'none',
  };

  const homeLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: isHome ? 'var(--primary)' : 'var(--text-secondary)',
    fontWeight: isHome ? 700 : 500,
    cursor: isHome ? 'default' : 'pointer',
    background: 'none',
    border: 'none',
    padding: '2px 4px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    transition: 'all 200ms ease',
    textDecoration: 'none',
  };

  const separatorStyle = {
    color: 'var(--text-tertiary)',
    display: 'flex',
    alignItems: 'center',
    opacity: 0.5,
  };

  const currentSegmentStyle = {
    color: 'var(--primary)',
    fontWeight: 700,
    padding: '2px 4px',
    fontSize: '0.8rem',
  };

  const handleHomeClick = () => {
    if (!isHome) {
      setCurrentRoute('/app/dashboard');
    }
  };

  return (
    <nav style={containerStyle} aria-label="Breadcrumb">
      {/* Home segment */}
      <button
        style={homeLinkStyle}
        onClick={handleHomeClick}
        onMouseEnter={e => {
          if (!isHome) {
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.background = 'var(--bg-secondary)';
          }
        }}
        onMouseLeave={e => {
          if (!isHome) {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'none';
          }
        }}
        aria-current={isHome ? 'page' : undefined}
      >
        <Home size={14} />
        Home
      </button>

      {/* Show current page if not on dashboard */}
      {!isHome && (
        <>
          <span style={separatorStyle}>
            <ChevronRight size={14} />
          </span>
          <span style={currentSegmentStyle} aria-current="page">
            {currentLabel}
          </span>
        </>
      )}
    </nav>
  );
}
