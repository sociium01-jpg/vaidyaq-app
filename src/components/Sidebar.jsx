import React, { useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  GraduationCap,
  Brain,
  FileText,
  ListTodo,
  BarChart3,
  Settings,
  Sun,
  Moon,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const {
    currentRoute,
    setCurrentRoute,
    theme,
    setTheme,
    currentUser,
    setCurrentUser,
    logActivity,
    openCapasCount
  } = useContext(QualiNABHContext);

  const mainNavItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Quality Management', path: '/app/quality', icon: Activity },
    { label: 'Compliance Management', path: '/app/compliance', icon: ShieldAlert },
    { label: 'Accreditation Readiness', path: '/app/accreditation', icon: ShieldCheck },
    { label: 'AI Insights', path: '/app/ai', icon: Brain }
  ];

  const secondaryNavItems = [
    { label: 'Documents', path: '/app/documents', icon: FileText },
    { label: 'Tasks', path: '/app/tasks', icon: ListTodo },
    { label: 'Reports', path: '/app/reports', icon: BarChart3 },
    { label: 'Hospital Settings', path: '/app/profile', icon: Settings },
    { label: 'Help & Support', path: '/app/support', icon: ShieldAlert }
  ];

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    const names = {
      "Super Admin": "Col. Roy (COO)",
      "Hospital Admin": "Mr. Mehta (Director)",
      "Quality Head": "Dr. Sarah Paul",
      "Department Head": "Dr. Sen (Pharmacy)",
      "Auditor": "Ramesh Kumar (Officer)",
      "Staff": "Sister Gracy (ICU)",
      "External Consultant": "Mr. Vinay (NABH Assessor)",
      "Viewer": "Guest Auditor"
    };
    const emails = {
      "Super Admin": "super@vaidyaq.com",
      "Hospital Admin": "director@hospital.org",
      "Quality Head": "quality.head@hospital.org",
      "Department Head": "pharmacy@hospital.org",
      "Auditor": "auditor@hospital.org",
      "Staff": "nurse@hospital.org",
      "External Consultant": "vinay.consultant@gmail.com",
      "Viewer": "viewer@hospital.org"
    };

    setCurrentUser({
      role: newRole,
      name: names[newRole] || "User",
      email: emails[newRole] || "user@hospital.org"
    });
    logActivity(`Simulated role switched to: ${newRole}`);
  };

  const handleLogout = () => {
    setCurrentRoute('/');
    logActivity("Logged out of SaaS session");
  };

  const handleLinkClick = (path) => {
    setCurrentRoute(path);
    if (sidebarOpen && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-logo flex align-center justify-between">
        <div className="flex align-center gap-2">
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1, color: 'var(--primary)' }}>VaidyaQ</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>6TH ED. OS • Jan 2025</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="sidebar-close-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Core pillars */}
      <div className="sidebar-nav">
        <span className="sidebar-section-title">Core Pillars</span>
        {mainNavItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentRoute.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
              {item.label === 'Quality Management' && openCapasCount > 0 && (
                <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                  {openCapasCount} CAPA
                </span>
              )}
            </button>
          );
        })}

        {/* Secondary Modules */}
        <span className="sidebar-section-title" style={{ marginTop: '1rem' }}>Modules</span>
        {secondaryNavItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentRoute === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Settings & Role Selector */}
      <div className="sidebar-footer flex flex-col gap-2">
        {/* Theme Toggle */}
        <div className="flex align-center justify-between" style={{ padding: '0.25rem 0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {theme === 'light' ? 'Light Theme' : 'Dark Theme'}
          </span>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              padding: '0.4rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--primary)'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        {/* Role Selector */}
        <div style={{ marginTop: '0.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Simulate Access Role</label>
          <select
            value={currentUser.role}
            onChange={handleRoleChange}
            className="role-badge-selector"
          >
            <option value="Quality Head">Quality Head</option>
            <option value="Super Admin">COO (Super Admin)</option>
            <option value="Hospital Admin">Director (Hospital Admin)</option>
            <option value="Department Head">HOD (Dept Head)</option>
            <option value="Auditor">Hospital Auditor</option>
            <option value="Staff">Nurse/Staff</option>
            <option value="External Consultant">NABH Consultant</option>
            <option value="Viewer">Assessor (Viewer)</option>
          </select>
        </div>

        {/* Current user summary */}
        <div style={{ padding: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-danger)',
            color: 'var(--color-danger)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginTop: '0.25rem'
          }}
        >
          Logout Session
        </button>

        {/* Sociium Product Branding */}
        <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', lineHeight: '1.4' }}>
          A <strong style={{ color: 'var(--primary)' }}>Sociium</strong> Product<br />
          Email: <a href="mailto:am@sociium.biz" style={{ color: 'var(--primary)' }}>am@sociium.biz</a><br />
          Call: <a href="tel:8850822250" style={{ color: 'var(--primary)' }}>8850822250</a>
        </div>
      </div>
    </div>
  );
}
