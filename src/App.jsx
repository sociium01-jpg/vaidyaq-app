import React, { useContext, useState } from 'react';
import { QualiNABHProvider, QualiNABHContext } from './context/QualiNABHContext';

// Import Components & Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

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
    setForcePaymentScreen
  } = useContext(QualiNABHContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('annually'); // 'quarterly' or 'annually'

  // 0. VENDOR ADMIN OFFICE ROUTE HANDLER (Isolated from SaaS app)
  if (currentRoute === '/vendor-admin') {
    return <VendorAdminConsole />;
  }

  // 1. PUBLIC MARKETING ROUTE HANDLER - enforce currentUser session
  if (currentRoute === '/' || !currentRoute.startsWith('/app') || !currentUser) {
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
              {forcePaymentScreen ? "Renew VaidyaQ Subscription" : !isSubscribed ? "Trial Period Expired" : "Subscription Expired"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
              {!isSubscribed 
                ? `The 7-Day Free Trial period for ${hospitalName} has expired. Choose a billing cycle to unlock the NABH compliance cockpit.`
                : `Your subscription has expired. Please renew your plan below to restore access to your SOP lists, team members, and audits.`}
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
        </div>
      </div>
    );
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
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page scroll viewport */}
        <main className="main-scroll-area">
          {(() => {
            switch (currentRoute) {
              case '/app/dashboard':
                return <Dashboard />;
              case '/app/quality':
                return <QualityModule />;
              case '/app/compliance':
                return <ComplianceModule />;
              case '/app/accreditation':
                return <AccreditationModule />;
              case '/app/ai':
                return <AIInsightsModule />;
              case '/app/documents':
                return <Documents />;
              case '/app/tasks':
                return <Tasks />;
              case '/app/reports':
                return <Reports />;
              case '/app/admin':
                return <AdminModule />;
              case '/app/committees':
                return <CommitteeModule />;
              case '/app/training':
                return <TrainingModule />;
              case '/app/profile':
                return <ProfileSettings />;
              case '/app/support':
                return <SupportCenter />;
              default:
                return <Dashboard />;
            }
          })()}
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <BottomNav setSidebarOpen={setSidebarOpen} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QualiNABHProvider>
      <AppContent />
    </QualiNABHProvider>
  );
}
