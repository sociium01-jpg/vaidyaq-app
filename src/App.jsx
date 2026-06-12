import React, { useContext, useState } from 'react';
import { QualiNABHProvider, QualiNABHContext } from './context/QualiNABHContext';

// Import Components & Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

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

function AppContent() {
  const { 
    currentRoute, 
    isSubscribed, 
    trialDaysLeft, 
    hospitalName, 
    hospitalBeds, 
    purchaseSubscription, 
    setCurrentRoute 
  } = useContext(QualiNABHContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 0. VENDOR ADMIN OFFICE ROUTE HANDLER (Isolated from SaaS app)
  if (currentRoute === '/vendor-admin') {
    return <VendorAdminConsole />;
  }

  // 1. PUBLIC MARKETING ROUTE HANDLER
  if (currentRoute === '/' || !currentRoute.startsWith('/app')) {
    return <PublicPages />;
  }

  // 2. TRIAL EXPIRY SaaS BILLING BLOCKER
  const isTrialExpired = trialDaysLeft <= 0 && !isSubscribed;
  if (isTrialExpired) {
    const beds = Number(hospitalBeds);
    const price = beds <= 20 ? "55,999" : beds <= 150 ? "1,29,999" : "2,49,999";
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '2rem', textAlign: 'left' }}>
        <div className="card shadow-lg" style={{ maxWidth: '600px', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>VaidyaQ Free Trial Expired</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            The 7-Day Free Trial period for <strong>{hospitalName}</strong> has ended. To continue using the VaidyaQ AI dashboard, audit tracking, incident logging, and SOP compilers, please choose your subscription plan.
          </p>

          {/* Pricing Tier Card */}
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', border: '2px solid var(--primary)', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Dynamic Bed Pricing</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{beds <= 20 ? 'Clinic Tier' : beds <= 150 ? 'Secondary Care Tier' : 'Tertiary Enterprise Tier'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Based on your hospital size of {hospitalBeds} Beds</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>₹{price}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}> / year</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2" style={{ marginTop: '2.5rem' }}>
            <button 
              onClick={purchaseSubscription} 
              className="btn btn-primary glow-premium" 
              style={{ width: '100%', padding: '0.85rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
            >
              💳 Pay & Activate Subscription (Simulate Razorpay)
            </button>
            <button 
              onClick={() => setCurrentRoute('/')} 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.85rem', cursor: 'pointer' }}
            >
              Return to Landing Page
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
        <Navbar />

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
              case '/app/profile':
                return <ProfileSettings />;
              default:
                return <Dashboard />;
            }
          })()}
        </main>
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
