import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { Bell, Search, Sparkles, User, AlertTriangle, Menu } from 'lucide-react';

export default function Navbar({ setSidebarOpen }) {
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
    subscriptionDaysLeft
  } = useContext(QualiNABHContext);

  const [showNotifications, setShowNotifications] = useState(false);

  // Derive notifications from actual states
  const notificationsList = [];
  
  // 1. Check for expired/expiring licenses
  licenses.forEach(lic => {
    if (lic.status === 'Expired') {
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
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🏥 {hospitalName}
        </span>
        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
          {hospitalBeds} Beds • {hospitalTier}
        </span>
      </div>

      {/* Middle Search Bar */}
      <div className="navbar-search">
        <Search size={16} className="text-tertiary" />
        <input type="text" placeholder="Search SOPs, CAPAs, Standard codes..." />
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

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            padding: '0.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            position: 'relative'
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
          <div className="flex flex-col" style={{ display: 'none', md: 'flex' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentUser.role}</span>
          </div>
        </div>

        {/* Notifications Dropdown Panel */}
        {showNotifications && (
          <div
            style={{
              position: 'absolute',
              top: '45px',
              right: '40px',
              width: '320px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 150,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Security & Compliance Alerts</span>
              <span className="badge badge-neutral">{notificationsList.length}</span>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {notificationsList.map((notif, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    backgroundColor: notif.type === 'danger' ? 'rgba(220, 38, 38, 0.03)' : notif.type === 'warning' ? 'rgba(217, 119, 6, 0.03)' : 'transparent'
                  }}
                >
                  <AlertTriangle
                    size={16}
                    color={notif.type === 'danger' ? 'var(--color-danger)' : notif.type === 'warning' ? 'var(--color-warning)' : 'var(--primary)'}
                    style={{ marginTop: '2px', flexShrink: 0 }}
                  />
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{notif.text}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0.5rem', textAlign: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
              <button
                onClick={() => { setShowNotifications(false); setCurrentRoute('/app/admin'); }}
                style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}
              >
                View Audit Logs
              </button>
            </div>
          </div>
        )}
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
