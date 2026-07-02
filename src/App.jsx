import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHProvider, QualiNABHContext } from './context/QualiNABHContext';

// Import Components & Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import SearchModal from './components/SearchModal';
import ToastProvider from './components/ToastProvider';
import FAB from './components/FAB';
import OnboardingWizard from './components/OnboardingWizard';
import Breadcrumb from './components/Breadcrumb';
import NotificationPanel from './components/NotificationPanel';

// Import Pages
import PublicPages from './pages/PublicPages';
import Dashboard from './pages/Dashboard';
import QualityModule from './pages/QualityModule';
import ComplianceModule from './pages/ComplianceModule';
import AccreditationModule from './pages/AccreditationModule';
import AIInsightsModule from './pages/AIInsightsModule';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import AdminModule from './pages/AdminModule';
import ProfileSettings from './pages/ProfileSettings';
import VendorAdminConsole from './pages/VendorAdminConsole';
import SupportCenter from './pages/SupportCenter';
import CommitteeModule from './pages/CommitteeModule';
import TrainingModule from './pages/TrainingModule';
import ComplianceFeed from './pages/ComplianceFeed';

function AppContent() {
  const { 
    currentRoute, 
    currentUser,
    isSubscribed, 
    trialDaysLeft, 
    subscriptionDaysLeft,
    hospitalName, 
    hospitalBeds, 
    purchaseSubscription, 
    setCurrentRoute,
    isAppLocked,
    getLiveCountdownString,
    forcePaymentScreen,
    setForcePaymentScreen,
    hospitalMode,
    logActivity,
    accessibleHospitals
  } = useContext(QualiNABHContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('annually'); // 'quarterly' or 'annually'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Global shortcut Ctrl+K / Cmd+K to open Search Modal
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Parse route parameters
  const parts = (currentRoute || '/').split('/').filter(Boolean);
  const routeType = parts[0]; // 'app', 'org', 'platform', etc.
  const isAppRoute = routeType === 'app';
  const isOrgRoute = routeType === 'org';
  const isPlatformRoute = routeType === 'platform';
  const isSecuredRoute = isAppRoute || isOrgRoute || isPlatformRoute;

  // Enforce logged-in session for application routes
  useEffect(() => {
    if (isSecuredRoute && !currentUser) {
      setCurrentRoute('/');
    }
  }, [isSecuredRoute, currentUser, setCurrentRoute]);

  // Handle redirects for legacy and special routes
  useEffect(() => {
    if (currentUser) {
      if (currentRoute === '/vendor-admin') {
        setCurrentRoute('/platform/dashboard');
      } else if (currentRoute === '/app') {
        setCurrentRoute('/app/dashboard');
      } else if (currentRoute === '/org') {
        setCurrentRoute('/org/dashboard');
      } else if (currentRoute === '/platform') {
        setCurrentRoute('/platform/dashboard');
      } else if (isAppRoute) {
        // Strip legacy hospitalId prefixes: e.g. /app/hosp-123/quality -> /app/quality
        const potentialHospId = parts[1];
        const knownHospIds = ['demo-hosp', 'sarah-hosp', 'sarah-hosp-2'];
        const isLegacyId = potentialHospId && (potentialHospId.startsWith('hosp-') || knownHospIds.includes(potentialHospId));
        if (isLegacyId) {
          const targetModule = parts[2] || 'dashboard';
          setCurrentRoute(`/app/${targetModule}`);
        }
      } else if (isOrgRoute) {
        // Strip legacy orgId prefixes: e.g. /org/org-central/dashboard -> /org/dashboard
        const potentialOrgId = parts[1];
        const isLegacyOrgId = potentialOrgId && (potentialOrgId.startsWith('org-') || potentialOrgId === 'org-central');
        if (isLegacyOrgId) {
          const targetModule = parts[2] || 'dashboard';
          setCurrentRoute(`/org/${targetModule}`);
        }
      }
    }
  }, [currentRoute, currentUser, isAppRoute, isOrgRoute, parts, setCurrentRoute]);

  // Platform Console Route
  if (isPlatformRoute) {
    const isPlatformAdmin = currentUser?.platformRole === 'Platform Admin' || currentUser?.role === 'Platform Admin' || currentUser?.email === 'admin@vaidyaq.com';
    if (!isPlatformAdmin) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '2rem', textAlign: 'center' }}>
          <div className="card shadow-lg" style={{ maxWidth: '480px', width: '100%', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'inline-flex', padding: '1.25rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-danger)', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🛡️</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Only VaidyaQ Platform Administrators are authorized to access this office space.
            </p>
            <button onClick={() => setCurrentRoute('/app/dashboard')} className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', fontWeight: 'bold' }}>
              Return to Hospital Console
            </button>
          </div>
        </div>
      );
    }
    return <VendorAdminConsole />;
  }

  // Check organization authorization
  if (isOrgRoute) {
    const isAuthorizedForOrg = currentUser && (
      currentUser.organizationId ||
      currentUser.platformRole === 'Platform Admin' || currentUser.role === 'Platform Admin'
    );
    if (!isAuthorizedForOrg) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '2rem', textAlign: 'center' }}>
          <div className="card shadow-lg" style={{ maxWidth: '480px', width: '100%', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'inline-flex', padding: '1.25rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-danger)', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🛡️</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              You are not authorized to access this organization's consolidated group console.
            </p>
            <button onClick={() => setCurrentRoute('/app/dashboard')} className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', fontWeight: 'bold' }}>
              Return to Hospital Workspace
            </button>
          </div>
        </div>
      );
    }
  }

  const moduleFromUrl = isSecuredRoute ? parts[1] : null;

  // 1. PUBLIC MARKETING ROUTE HANDLER - enforce currentUser session
  if (currentRoute === '/' || (!isAppRoute && !isOrgRoute) || !currentUser) {
    return <PublicPages />;
  }

  // 2. TRIAL & SUBSCRIPTION SaaS BILLING BLOCKER
  if (isAppLocked) {
    const beds = Number(hospitalBeds);
    
    // Dynamic price lists
    const annualPrice = beds <= 20 ? 55999 : beds <= 150 ? 129999 : 249999;
    const quarterlyPrice = beds <= 20 ? 16999 : beds <= 150 ? 38999 : 74999;
    const activePrice = selectedCycle === 'quarterly' ? quarterlyPrice : annualPrice;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '1rem', textAlign: 'left' }}>
        <div className="glassmorphic-card shadow-lg pricing-card-responsive" style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '0.8rem', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: 'rgb(217, 119, 6)', borderRadius: '50%' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              {forcePaymentScreen ? "Renew VaidyaQ Subscription" : !isSubscribed ? "Access Locked — Free Trial Expired" : "Access Locked — Subscription Expired"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
              {!isSubscribed 
                ? `The 7-day free trial period for ${hospitalName} has expired. To restore access to your SOP drafts, audit modules, and evidence logs, please upgrade your subscription below or contact our sales desk.`
                : `Your subscription has expired. Please renew your plan below to restore access to your compliance dashboard.`}
            </p>
          </div>

          {/* Billing Cycle Selector buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              onClick={() => setSelectedCycle('quarterly')}
              style={{
                flex: 1, padding: '0.55rem', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold',
                backgroundColor: selectedCycle === 'quarterly' ? 'var(--primary-light)' : 'transparent',
                color: selectedCycle === 'quarterly' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
            >
              Quarterly Plan
            </button>
            <button 
              onClick={() => setSelectedCycle('annually')}
              style={{
                flex: 1, padding: '0.55rem', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold',
                backgroundColor: selectedCycle === 'annually' ? 'var(--primary-light)' : 'transparent',
                color: selectedCycle === 'annually' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
            >
              Annual Plan (Save 15%)
            </button>
          </div>

          {/* Pricing Tier Detail Card */}
          <div style={{ padding: '1.25rem', border: '2px solid var(--primary)', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Dynamic Bed Pricing</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                {beds <= 20 ? 'Clinic Tier' : beds <= 150 ? 'Secondary Care Tier' : 'Tertiary Enterprise Tier'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Based on facility capacity of {hospitalBeds} Beds</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>₹{activePrice.toLocaleString()}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}> / {selectedCycle === 'quarterly' ? 'quarter' : 'year'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2" style={{ marginTop: '0.5rem' }}>
            <button 
              onClick={() => purchaseSubscription(selectedCycle)} 
              className="btn btn-primary glow-premium" 
              style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '8px' }}
            >
              💳 Pay & Unlock Instantly (Simulate Razorpay)
            </button>
            
            {forcePaymentScreen && (
              <button 
                onClick={() => setForcePaymentScreen(false)} 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                Cancel & Return to Dashboard
              </button>
            )}
            
            <button 
              onClick={() => {
                setCurrentRoute('/');
                // If trial expired, logout user too
                if (!forcePaymentScreen) {
                  localStorage.removeItem('qn_user');
                  window.location.reload();
                }
              }} 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              Logout & Return to Home
            </button>
          </div>

          {/* Sales Contact Assistance Panel */}
          <div style={{ padding: '0.85rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Need assistance or a custom plan?</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Contact Sales: <a href="mailto:am@sociium.biz" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>am@sociium.biz</a> or call/WhatsApp <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>+91 8850822250</span>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2.5 HOSPTIAL ONBOARDING WIZARD BLOCKER
  if (hospitalMode === 'new') {
    return <OnboardingWizard />;
  }

  // 3. LOGGED-IN SAAS APPLICATION ROUTE HANDLER
  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Left Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main workspace */}
      <div className="app-content-wrapper">
        {/* Top Navbar */}
        <Navbar 
          setSidebarOpen={setSidebarOpen} 
          onSearchClick={() => setIsSearchOpen(true)} 
          onNotificationClick={() => setIsNotificationOpen(true)}
        />

        {/* Dynamic page scroll viewport */}
        <main className="main-scroll-area" style={{ padding: '1rem' }}>
          <Breadcrumb />
          {(() => {
            const validModules = [
              'dashboard', 'quality', 'compliance', 'accreditation', 'ai', 'ai-insights', 
              'documents', 'tasks', 'reports', 'admin', 'committees', 'training', 
              'profile', 'support', 'compliance-feed'
            ];
            const isInvalidModule = isAppRoute && moduleFromUrl && !validModules.includes(moduleFromUrl);

            if (isInvalidModule) {
              return (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>404 - Section Not Found</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    The compliance section you are looking for does not exist or has been relocated.
                  </p>
                  <button className="btn btn-primary" onClick={() => setCurrentRoute('/app/dashboard')}>
                    Back to Dashboard
                  </button>
                </div>
              );
            }

            switch (moduleFromUrl) {
              case 'dashboard':
                return isOrgRoute ? <Dashboard orgMode={true} organizationId={currentUser?.organizationId} /> : <Dashboard />;
              case 'quality':
                return <QualityModule />;
              case 'compliance':
                return <ComplianceModule />;
              case 'accreditation':
                return <AccreditationModule />;
              case 'ai':
              case 'ai-insights':
                return <AIInsightsModule />;
              case 'documents':
                return <Documents />;
              case 'tasks':
                return <Tasks />;
              case 'reports':
                return <Reports />;
              case 'admin':
                return <AdminModule />;
              case 'committees':
                return <CommitteeModule />;
              case 'training':
                return <TrainingModule />;
              case 'profile':
                return <ProfileSettings />;
              case 'support':
                return <SupportCenter />;
              case 'compliance-feed':
                return <ComplianceFeed />;
              default:
                return <Dashboard />;
            }
          })()}
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <BottomNav setSidebarOpen={setSidebarOpen} />

        {/* Floating Action Button for mobile quick actions */}
        <FAB />

        {/* Global Search Modal */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Global Notification Panel */}
        <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[VaidyaQ ErrorBoundary]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '480px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              VaidyaQ encountered an unexpected error. This is usually a temporary issue.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              style={{ padding: '0.7rem 1.5rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginRight: '0.5rem' }}
            >
              Reset & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.7rem 1.5rem', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QualiNABHProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </QualiNABHProvider>
    </ErrorBoundary>
  );
}
