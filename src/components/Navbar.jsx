import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { Bell, Search, Sparkles, User, AlertTriangle, Menu } from 'lucide-react';

export default function Navbar({ setSidebarOpen, onSearchClick, onNotificationClick }) {
  const {
    setCurrentRoute,
    openCapasCount,
    overdueTasksCount,
    licenses,
    currentUser,
    hospitalName,
    hospitalBeds,
    hospitalTier,
    isSubscribed,
    trialDaysLeft,
    subscriptionDaysLeft,
    activeHospitalId,
    accessibleHospitals,
    switchActiveBranch,
    clientsList
  } = useContext(QualiNABHContext);



  // Derive notifications from actual states
  const notificationsList = [];
  
  // 1. Check for expired/expiring licenses
  (licenses || []).forEach(lic => {
    if (lic && lic.status === 'Expired') {
      notificationsList.push({
        id: `notif-lic-${lic.id}`,
        type: 'danger',
        text: `License expired: ${lic.name}`,
        time: 'Critical Action Needed'
      });
    }
  });

  // 2. Check for open CAPAs
  if (openCapasCount > 0) {
    notificationsList.push({
      id: 'notif-capa',
      type: 'warning',
      text: `${openCapasCount} open CAPAs require corrective action evidence.`,
      time: 'Urgent'
    });
  }

  // 3. Overdue Tasks
  if (overdueTasksCount > 0) {
    notificationsList.push({
      id: 'notif-tasks',
      type: 'danger',
      text: `${overdueTasksCount} tasks are currently overdue.`,
      time: 'High Priority'
    });
  }

  // 4. Subscription Expiry Warning
  if (isSubscribed && subscriptionDaysLeft > 0 && subscriptionDaysLeft <= 20) {
    notificationsList.push({
      id: 'notif-sub-expiry',
      type: 'warning',
      text: `Subscription expires in ${subscriptionDaysLeft} days. Renew now to avoid lockout.`,
      time: 'Renewal Warning'
    });
  }

  // 5. Trial Expiry Warning
  if (!isSubscribed && trialDaysLeft > 0 && trialDaysLeft <= 2) {
    notificationsList.push({
      id: 'notif-trial-expiry',
      type: 'warning',
      text: `Free trial ends in ${trialDaysLeft} days. Upgrade now.`,
      time: 'Trial Warning'
    });
  }

  // Fallback default
  if (notificationsList.length === 0) {
    notificationsList.push({
      id: 'notif-default',
      type: 'info',
      text: 'Hospital is currently in stable operational health.',
      time: 'Just now'
    });
  }

  return (
    <div className="navbar">
      {/* Left side info */}
      <div className="flex align-center gap-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="navbar-toggle-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.25rem',
            marginRight: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={20} />
        </button>
        {accessibleHospitals && accessibleHospitals.length > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={activeHospitalId}
              onChange={(e) => switchActiveBranch(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.35rem 1.75rem 0.35rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                boxShadow: 'var(--shadow-sm)',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem'
              }}
            >
              {(accessibleHospitals || []).map(hospId => {
                const hospObj = (clientsList || []).find(c => c && c.hospitalId === hospId);
                return (
                  <option key={hospId} value={hospId}>
                    🏥 {hospObj ? hospObj.hospitalName : hospId}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            🏥 {hospitalName}
          </span>
        )}
        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
          {hospitalBeds} Beds • {hospitalTier}
        </span>
      </div>

      {/* Middle Search Bar */}
      <div className="navbar-search" onClick={onSearchClick} style={{ cursor: 'pointer' }}>
        <Search size={16} className="text-tertiary" />
        <input 
          type="text" 
          placeholder="Search SOPs, CAPAs, Standard codes... (Ctrl+K)" 
          readOnly 
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Right controls */}
      <div className="flex align-center gap-3" style={{ position: 'relative' }}>
        {/* Quick AI Copilot */}
        <button
          onClick={() => setCurrentRoute('/app/ai')}
          className="btn btn-primary"
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            border: 'none',
            fontSize: '0.8rem',
            boxShadow: 'var(--shadow-glow)',
            animation: 'pulse 2s infinite'
          }}
        >
          <Sparkles size={14} />
          <span>Ask Copilot</span>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onSearchClick}
          className="mobile-search-btn"
          style={{
            padding: '0.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          style={{
            padding: '0.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <Bell size={18} />
          {notificationsList.length > 0 && notificationsList[0].id !== 'notif-default' && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger)'
              }}
            />
          )}
        </button>

        {/* User Card */}
        <div className="flex align-center gap-2" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="navbar-user-role flex flex-col">
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentUser.role}</span>
          </div>
        </div>
      </div>

      {/* Embedded Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 148, 136, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
        }
      `}</style>
    </div>
  );
}
