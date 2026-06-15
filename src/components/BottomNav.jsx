import React, { useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  FileText, 
  Menu 
} from 'lucide-react';

export default function BottomNav({ setSidebarOpen }) {
  const { currentRoute, setCurrentRoute } = useContext(QualiNABHContext);

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Quality', path: '/app/quality', icon: Activity },
    { label: 'Compliance', path: '/app/compliance', icon: ShieldAlert },
    { label: 'Documents', path: '/app/documents', icon: FileText },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentRoute === item.path;
        return (
          <button
            key={item.path}
            onClick={() => setCurrentRoute(item.path)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={() => setSidebarOpen(true)}
        className="bottom-nav-item"
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </div>
  );
}
