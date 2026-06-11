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

function AppContent() {
  const { currentRoute } = useContext(QualiNABHContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. PUBLIC MARKETING ROUTE HANDLER
  if (currentRoute === '/' || !currentRoute.startsWith('/app')) {
    return <PublicPages />;
  }

  // 2. LOGGED-IN SAAS APPLICATION ROUTE HANDLER
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
