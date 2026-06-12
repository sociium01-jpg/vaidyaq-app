import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { 
  ShieldCheck, Lock, Activity, Users, Settings, UserPlus, 
  RefreshCw, Play, CircleAlert, CheckCircle, Database
} from 'lucide-react';

export default function VendorAdminConsole() {
  const {
    clientsList,
    vendorAdminCredentials,
    setVendorAdminCredentials,
    vendorEmployees,
    setVendorEmployees,
    setClientStatusOverride,
    auditLogs
  } = useContext(QualiNABHContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Tab switcher
  const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'employees', 'credentials'

  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('Support Agent');
  const [empAssignedHosp, setEmpAssignedHosp] = useState('demo-hosp');
  const [empSuccess, setEmpSuccess] = useState(false);

  // Credentials Update State
  const [newUsername, setNewUsername] = useState(vendorAdminCredentials.username);
  const [newPassword, setNewPassword] = useState(vendorAdminCredentials.password);
  const [credSuccess, setCredSuccess] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (usernameInput === vendorAdminCredentials.username && passwordInput === vendorAdminCredentials.password) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Add VaidyaQ Employee
  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: empName,
      email: empEmail,
      role: empRole,
      assignedClients: [empAssignedHosp]
    };
    setVendorEmployees([...vendorEmployees, newEmp]);
    setEmpName('');
    setEmpEmail('');
    setEmpSuccess(true);
    setTimeout(() => setEmpSuccess(false), 3000);
  };

  // Save Credentials
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    setVendorAdminCredentials({ username: newUsername, password: newPassword });
    setCredSuccess(true);
    setTimeout(() => setCredSuccess(false), 3000);
  };

  // 1. LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '1rem', textAlign: 'left' }}>
        <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', marginBottom: '0.5rem' }}>
              <Lock size={30} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Vendor Admin</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              VaidyaQ Employee Console (Office Use Only)
            </p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-danger)', fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CircleAlert size={14} /> Invalid office credentials. Please try again.
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Username</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. admin"
                className="form-control"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="form-control"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn btn-primary glow-premium" style={{ padding: '0.75rem', width: '100%', marginTop: '1.25rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Log In to Office Panel
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
            🔒 Vault Protected • Direct database override initialized.<br />
            (Default credentials: <strong>admin</strong> / <strong>123</strong>)
          </div>
        </div>
      </div>
    );
  }

  // Calculate SaaS Stats
  const totalClients = clientsList.length;
  const trialClients = clientsList.filter(c => c.status === 'Active Trial').length;
  const paidClients = clientsList.filter(c => c.status === 'Paid').length;
  const restrictedClients = clientsList.filter(c => c.status === 'Restricted' || c.status === 'Expired').length;

  // 2. MAIN LOGGED-IN CONSOLE
  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Console Header */}
      <div className="flex align-center justify-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <span>VaidyaQ Employee Administration Console</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Core portal for internal staff to monitor client onboarding, override subscriptions, and configure support permissions.</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          Lock Session
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Clients</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalClients}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Paid Subscribers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{paidClients}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Trials</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{trialClients}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)' }}>
            <CircleAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Restricted/Expired</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{restrictedClients}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
        <button 
          onClick={() => setActiveTab('clients')} 
          className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'clients' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'clients' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Database size={16} /> Client Control Registry
        </button>
        <button 
          onClick={() => setActiveTab('employees')} 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'employees' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Users size={16} /> VaidyaQ Office Staff
        </button>
        <button 
          onClick={() => setActiveTab('credentials')} 
          className={`tab-btn ${activeTab === 'credentials' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'credentials' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'credentials' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Settings size={16} /> Console Settings
        </button>
      </div>

      {/* SUB-TABS VIEWS */}
      
      {/* 1. CLIENT CONTROL REGISTRY */}
      {activeTab === 'clients' && (
        <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={18} /> Customer Subscriptions and Status Overrides</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monitor active customer tenants. Force trials to expire or upgrade plan statuses to simulate Razorpay hooks.</p>

          <table className="table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Hospital ID</th>
                <th>Hospital Name</th>
                <th>Owner Email</th>
                <th>Bed Strength</th>
                <th>Signup Date</th>
                <th>Plan Status</th>
                <th>Diagnostic Action</th>
              </tr>
            </thead>
            <tbody>
              {clientsList.map((client) => {
                const start = new Date(client.trialStartDate).getTime();
                const now = Date.now();
                const diffTime = (start + 7*24*60*60*1000) - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const daysRemaining = diffDays < 0 ? 0 : diffDays;

                return (
                  <tr key={client.hospitalId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{client.hospitalId}</td>
                    <td style={{ fontWeight: 'bold' }}>{client.hospitalName}</td>
                    <td>{client.email}</td>
                    <td>{client.beds} Beds</td>
                    <td>{new Date(client.trialStartDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge" style={{ 
                        backgroundColor: client.status === 'Paid' ? 'var(--bg-success)' : client.status === 'Expired' ? 'var(--bg-danger)' : 'var(--primary-light)', 
                        color: client.status === 'Paid' ? 'var(--color-success)' : client.status === 'Expired' ? 'var(--color-danger)' : 'var(--primary)',
                        fontSize: '0.75rem' 
                      }}>
                        {client.status} {client.status === 'Active Trial' && `(${daysRemaining}d left)`}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setClientStatusOverride(client.hospitalId, 'Paid')} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', color: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                        >
                          Upgrade Paid
                        </button>
                        <button 
                          onClick={() => setClientStatusOverride(client.hospitalId, 'Expired')} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', cursor: 'pointer' }}
                        >
                          Force Expire
                        </button>
                        <button 
                          onClick={() => setClientStatusOverride(client.hospitalId, 'Restricted')} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        >
                          Suspend
                        </button>
                        <button 
                          onClick={() => setClientStatusOverride(client.hospitalId, 'Active Trial')} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          Reset Trial
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. VAIDYAQ OFFICE STAFF */}
      {activeTab === 'employees' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
          {/* Employee Directory */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> VaidyaQ Staff & Access Permissions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage internal developer and customer support accounts responsible for database overrides and setups.</p>

            <table className="table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Office Email</th>
                  <th>Office Role</th>
                  <th>Assigned Client</th>
                </tr>
              </thead>
              <tbody>
                {vendorEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 'bold' }}>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {emp.role}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {emp.assignedClients.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invite Employee Form */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={18} /> Register VaidyaQ Operator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Register an internal support agent, billing agent, or system administrator.</p>

            {empSuccess && (
              <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                Employee registered successfully.
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="flex flex-col gap-3" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Aarav Sharma"
                  className="form-control"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Office Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. aarav@vaidyaq.com"
                  className="form-control"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Internal Role</label>
                <select 
                  className="form-control"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <option value="Support Agent">Support Agent (Troubleshoot client errors)</option>
                  <option value="Billing Manager">Billing Manager (Trigger plan pricing hooks)</option>
                  <option value="Platform Administrator">Platform Administrator (Full system access)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Assign Client Hospital</label>
                <select 
                  className="form-control"
                  value={empAssignedHosp}
                  onChange={(e) => setEmpAssignedHosp(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                >
                  {clientsList.map(c => (
                    <option key={c.hospitalId} value={c.hospitalId}>{c.hospitalName}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', marginTop: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                Add Office Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. CONSOLE SETTINGS (CREDENTIALS CUSTOMIZER) */}
      {activeTab === 'credentials' && (
        <div className="card flex flex-col gap-3" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={18} /> Update Vendor Admin Credentials</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Change the username and password used to access the secure Vendor Office Console.</p>

          {credSuccess && (
            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-success)', fontSize: '0.8rem' }}>
              Credentials updated! Use the new credentials to log in next time.
            </div>
          )}

          <form onSubmit={handleSaveCredentials} className="flex flex-col gap-3" style={{ maxWidth: '500px', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Office Username</label>
              <input 
                type="text" 
                required 
                className="form-control"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Office Password</label>
              <input 
                type="text" 
                required 
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '1rem', cursor: 'pointer', fontWeight: 700 }}>
              Apply Credentials
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
