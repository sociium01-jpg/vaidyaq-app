import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  Users,
  Settings,
  Shield,
  ClipboardList,
  ShieldCheck,
  Lock,
  LockKeyhole
} from 'lucide-react';

export default function AdminModule() {
  const {
    currentUser,
    auditLogs,
    logActivity
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('logs'); // 'logs', 'users', 'settings'

  // Mock users database
  const mockUsersList = [
    { email: "super@vaidyaq.com", name: "Col. Roy", role: "Super Admin", department: "Administration" },
    { email: "director@hospital.org", name: "Mr. Mehta", role: "Hospital Admin", department: "Board" },
    { email: "quality.head@hospital.org", name: "Dr. Sarah Paul", role: "Quality Head", department: "Quality Control" },
    { email: "pharmacy@hospital.org", name: "Dr. Sen", role: "Department Head", department: "Pharmacy" },
    { email: "auditor@hospital.org", name: "Ramesh Kumar", role: "Auditor", department: "Quality Control" },
    { email: "nurse@hospital.org", name: "Sister Gracy", role: "Staff", department: "ICU" },
    { email: "vinay.consultant@gmail.com", name: "Mr. Vinay", role: "External Consultant", department: "Advisory" }
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Sub tabs */}
      <div className="tabs-container">
        <button onClick={() => setActiveSubTab('logs')} className={`tab-btn ${activeSubTab === 'logs' ? 'active' : ''}`}>
          Security Audit Logs ({auditLogs.length})
        </button>
        <button onClick={() => setActiveSubTab('users')} className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}>
          Users & Roles Management
        </button>
        <button onClick={() => setActiveSubTab('settings')} className={`tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}>
          Organization Settings
        </button>
      </div>

      {/* 1. SECURITY AUDIT LOGS VIEW */}
      {activeSubTab === 'logs' && (
        <div className="flex flex-col gap-3">
          <div className="card flex align-center gap-3" style={{ borderLeft: '5px solid var(--secondary)' }}>
            <LockKeyhole size={24} color="var(--secondary)" />
            <div>
              <h3 style={{ fontSize: '1rem' }}>SaaS Activity Trail & Security Control Logs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                This ledger logs all actions (scoring edits, document uploads, role simulations, and logins) to conform to JCI/NABH security audit expectations.
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Email</th>
                  <th>Active Access Role</th>
                  <th>Action Logs Activity</th>
                  <th>IP Address</th>
                  <th>Cryptographic Footprint</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>{log.user}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{log.role}</span>
                    </td>
                    <td>{log.action}</td>
                    <td><code>{log.ipAddress}</code></td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>AES-VERIFIED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. USERS & ROLES VIEW */}
      {activeSubTab === 'users' && (
        <div className="flex flex-col gap-3">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User Full Name</th>
                  <th>Hospital Email</th>
                  <th>Assigned Role</th>
                  <th>Access Scope</th>
                  <th>Security Clearance</th>
                  <th>Compliance Privileges</th>
                </tr>
              </thead>
              <tbody>
                {mockUsersList.map((usr, idx) => (
                  <tr key={idx} style={{ backgroundColor: usr.email === currentUser.email ? 'rgba(13, 148, 136, 0.03)' : 'transparent' }}>
                    <td style={{ fontWeight: 700 }}>
                      {usr.name} {usr.email === currentUser.email && <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>(Current Session)</span>}
                    </td>
                    <td>{usr.email}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{usr.role}</span>
                    </td>
                    <td>{usr.department}</td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        {usr.role === 'Super Admin' || usr.role === 'Quality Head' ? 'Level 3 (Full)' : usr.role === 'Auditor' ? 'Level 2' : 'Level 1'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {usr.role === 'Super Admin' || usr.role === 'Quality Head' ? 'Read/Write/Approve' : usr.role === 'Auditor' ? 'Read/Write' : 'Read-Only'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SETTINGS VIEW */}
      {activeSubTab === 'settings' && (
        <div className="flex flex-col gap-3" style={{ maxWidth: '600px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignContent: 'center', gap: '0.5rem' }}>
              <Settings size={18} color="var(--primary)" />
              <span>Hospital Profile & Parameters</span>
            </h3>

            <div className="flex flex-col gap-2">
              <div className="form-group">
                <label className="form-label">Hospital Registered Name</label>
                <input type="text" className="form-control" value="City Central Metro Hospital" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Hospital Registered Address</label>
                <input type="text" className="form-control" value="St. Jude Circle, Metro Central, Sector-4" disabled />
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Bed Strength Capacity</label>
                  <input type="number" className="form-control" value="120" disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Accreditation Cycle Tier</label>
                  <input type="text" className="form-control" value="NABH 6th Edition (Full Accreditation)" disabled />
                </div>
              </div>
              
              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }} />
              
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Security & Data Isolation Controls</h4>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                  <Shield size={14} color="var(--color-success)" />
                  <span>ABDM Sandbox Privacy Policy Enabled</span>
                </p>
                Patient identity mapping is isolated. Encryption keys are cached locally in the hospital's browser store.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
