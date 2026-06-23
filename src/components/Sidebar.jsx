import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import VaidyaQLogo from './VaidyaQLogo';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Brain,
  FileText,
  ListTodo,
  BarChart3,
  Settings,
  Sun,
  Moon,
  ShieldCheck,
  X,
  Newspaper,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Bell
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
    openCapasCount,
    complianceFeed,
    feedNotifications,
    checkForComplianceUpdates,
    hospitalMode,
    switchHospitalMode,
    activeHospitalId,
    accessibleHospitals,
    activeOrganizationId
  } = useContext(QualiNABHContext);

  const [newsCollapsed, setNewsCollapsed] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  const unreadNotifsCount = feedNotifications ? feedNotifications.filter(n => !n.read).length : 0;

  const getTenantPath = (moduleName) => {
    if (activeOrganizationId && currentRoute.startsWith('/org/')) {
      return `/org/${moduleName}`;
    }
    return `/app/${moduleName}`;
  };

  const mainNavItems = [
    { label: 'Dashboard', module: 'dashboard', icon: LayoutDashboard },
    { label: 'Quality Management', module: 'quality', icon: Activity },
    { label: 'Compliance Management', module: 'compliance', icon: ShieldAlert },
    { label: 'Accreditation Readiness', module: 'accreditation', icon: ShieldCheck },
    { label: 'Committee Meetings', module: 'committees', icon: BookOpen },
    { label: 'Staff Training', module: 'training', icon: GraduationCap },
    { label: 'AI Insights', module: 'ai-insights', icon: Brain }
  ];

  const secondaryNavItems = [
    { label: 'Documents', module: 'documents', icon: FileText },
    { label: 'Tasks', module: 'tasks', icon: ListTodo },
    { label: 'Reports', module: 'reports', icon: BarChart3 },
    { label: 'Hospital Settings', module: 'profile', icon: Settings },
    { label: 'Help & Support', module: 'support', icon: ShieldAlert }
  ];

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    const names = {
      "Platform Admin": "VaidyaQ Operator",
      "Super Admin": "Col. Roy (COO)",
      "Hospital Admin": "Mr. Mehta (Director)",
      "Quality Head": "Dr. Sarah Paul",
      "Department Head": "Dr. Sen (Pharmacy)",
      "Auditor": "Ramesh Kumar (Officer)",
      "Staff": "Sister Gracy (ICU)",
      "External Consultant": "Mr. Vinay (NABH Assessor)",
      "Viewer": "Guest Auditor"
    };
    
    const currentHospId = activeHospitalId || currentUser?.hospitalId || 'demo-hosp';
    
    const emails = {
      "Platform Admin": "admin@vaidyaq.com",
      "Super Admin": "super@vaidyaq.com",
      "Hospital Admin": "director@hospital.org",
      "Quality Head": "quality.head@hospital.org",
      "Department Head": "pharmacy@hospital.org",
      "Auditor": "auditor@hospital.org",
      "Staff": "nurse@hospital.org",
      "External Consultant": "vinay.consultant@gmail.com",
      "Viewer": "viewer@hospital.org"
    };

    const orgId = (newRole === 'Platform Admin') ? null : 'org-central';
    let accHops = [currentHospId];
    if (newRole === 'Super Admin' || newRole === 'Hospital Admin') {
      accHops = ['demo-hosp', 'sarah-hosp'];
    } else if (newRole === 'Quality Head') {
      accHops = ['sarah-hosp'];
    }

    const selectedUser = {
      role: newRole === 'Platform Admin' ? 'Platform Admin' : newRole,
      platformRole: newRole === 'Platform Admin' ? 'Platform Admin' : null,
      name: names[newRole] || "User",
      email: emails[newRole] || "user@hospital.org",
      hospitalId: newRole === 'Platform Admin' ? 'vaidyaq-hq' : currentHospId,
      activeHospitalId: newRole === 'Platform Admin' ? 'vaidyaq-hq' : currentHospId,
      organizationId: orgId,
      accessibleHospitals: accHops,
      parentEmail: newRole === 'Platform Admin' ? 'admin@vaidyaq.com' : (newRole === 'Quality Head' ? 'quality.head@hospital.org' : 'demo@vaidyaq.com')
    };

    setCurrentUser(selectedUser);
    logActivity(`Simulated role switched to: ${newRole}`);
    
    if (newRole === 'Platform Admin') {
      setCurrentRoute('/platform/dashboard');
    } else {
      setCurrentRoute('/app/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRoute('/');
    logActivity("Logged out of SaaS session");
  };

  const handleLinkClick = (path) => {
    setCurrentRoute(path);
    if (sidebarOpen && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const parts = (currentRoute || '/app/dashboard').split('/').filter(Boolean);
  const currentModule = parts[1] || 'dashboard';

  return (
    <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-logo flex align-center justify-between">
        <div className="flex align-center gap-2">
          <VaidyaQLogo size={28} showText={false} />
          <div className="flex flex-col">
            <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              <span style={{ color: 'var(--text-primary)' }}>Vaidya</span>
              <span style={{ color: '#0d9488' }}>Q</span>
            </div>
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
          const isActive = currentModule === item.module;
          return (
            <button
              key={item.module}
              onClick={() => handleLinkClick(getTenantPath(item.module))}
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
          const isActive = currentModule === item.module;
          return (
            <button
              key={item.module}
              onClick={() => handleLinkClick(getTenantPath(item.module))}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compliance Feed Sidebar Widget */}
      <div style={{ margin: '0.5rem 1rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)' }}>
        <button 
          onClick={() => setNewsCollapsed(!newsCollapsed)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 800 }}>
            <Newspaper size={14} style={{ color: 'var(--primary)' }} />
            <span>Compliance Feed</span>
            {unreadNotifsCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                {unreadNotifsCount} New
              </span>
            )}
          </div>
          {newsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!newsCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
              {complianceFeed && complianceFeed.slice(0, 3).map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedNews(item)}
                  style={{ cursor: 'pointer', padding: '0.35rem', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {item.title}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleLinkClick(getTenantPath('compliance-feed'))}
              style={{ width: '100%', padding: '0.35rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', border: 'none', color: 'white', borderRadius: '4px', marginTop: '0.25rem' }}
            >
              View All Feed
            </button>

            <button 
              onClick={() => {
                checkForComplianceUpdates();
              }}
              style={{ width: '100%', padding: '0.3rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
            >
              <RefreshCw size={10} /> Check for updates
            </button>
          </div>
        )}
      </div>

      {/* Selected News Modal */}
      {selectedNews && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{selectedNews.category}</span>
              <button onClick={() => setSelectedNews(null)} style={{ border: 'none', background: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}>✕</button>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{selectedNews.title}</h3>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
              Source: <strong>{selectedNews.source}</strong> | Date: {selectedNews.date}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 1rem 0' }}>
              {selectedNews.content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedNews(null)} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                Close Update
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Role Selector (Only shown for Demo Sandbox Users) */}
        {(currentUser?.email === 'demo@vaidyaq.com' || currentUser?.email === 'quality.head@hospital.org' || currentUser?.email === 'admin@vaidyaq.com' || currentUser?.email === 'super@vaidyaq.com') && (
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
              <option value="Platform Admin">Platform Admin</option>
            </select>
          </div>
        )}

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
