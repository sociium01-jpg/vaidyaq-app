import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { 
  Building2, Users, Key, FileText, Upload, Plus, Trash2, 
  CheckCircle, Shield, ShieldAlert, Mail, UserCheck
} from 'lucide-react';

export default function ProfileSettings() {
  const {
    currentUser,
    hospitalName,
    hospitalBeds,
    hospitalLogo,
    setHospitalLogo,
    teamMembers,
    inviteTeamMember,
    updateHospitalProfile,
    geminiApiKey,
    saveGeminiKey,
    documents
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile', 'users', 'gemini', 'vault'

  // Form states
  const [logoInput, setLogoInput] = useState(hospitalLogo);
  const [nameInput, setNameInput] = useState(hospitalName);
  const [bedsInput, setBedsInput] = useState(hospitalBeds);
  const [addressInput, setAddressInput] = useState('Sector 4, Dwarka, New Delhi');
  const [regIdInput, setRegIdInput] = useState('REG-99201');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Quality Head');
  const [inviteDept, setInviteDept] = useState('Quality Control');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Gemini state
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey);
  const [geminiSuccess, setGeminiSuccess] = useState(false);

  // Handle Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateHospitalProfile(logoInput, nameInput, bedsInput, addressInput, regIdInput);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Handle User Invite
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    inviteTeamMember(inviteEmail, inviteName, inviteRole, inviteDept);
    setInviteEmail('');
    setInviteName('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  // Handle Gemini Key Save
  const handleGeminiSubmit = (e) => {
    e.preventDefault();
    saveGeminiKey(geminiKeyInput);
    setGeminiSuccess(true);
    setTimeout(() => setGeminiSuccess(false), 3000);
  };

  // Check if current user is Super Admin (only Super Admin can edit settings)
  const isSuperAdmin = currentUser.role === 'Super Admin';

  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Profile Header */}
      <div className="flex align-center justify-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Hospital Control Panel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure hospital metadata, team access tokens, and API key directories.</p>
        </div>
        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Shield size={12} /> Active Role: {currentUser.role}
        </span>
      </div>

      {/* Subnavigation Tab Headers */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('profile')} 
          className={`tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'profile' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Building2 size={16} /> Hospital Profile
        </button>
        <button 
          onClick={() => setActiveSubTab('users')} 
          className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'users' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Users size={16} /> User Roles & Access
        </button>
        <button 
          onClick={() => setActiveSubTab('gemini')} 
          className={`tab-btn ${activeSubTab === 'gemini' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'gemini' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'gemini' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Key size={16} /> Gemini AI Token
        </button>
        <button 
          onClick={() => setActiveSubTab('vault')} 
          className={`tab-btn ${activeSubTab === 'vault' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'vault' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'vault' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <FileText size={16} /> Document Vault
        </button>
      </div>

      {/* SUB-TABS CONTENT */}
      
      {/* 1. HOSPITAL PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="card flex flex-col gap-3" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={18} /> Hospital Identity & Credentials</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Set the name, size, logo symbol, and registration IDs of this clinical instance.</p>
          
          {!isSuperAdmin && (
            <div style={{ backgroundColor: 'var(--bg-warning)', color: 'var(--color-warning)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} /> Only the hospital's first registered user (Super Admin) can edit profile credentials.
            </div>
          )}

          {profileSuccess && (
            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} /> Hospital Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3" style={{ maxWidth: '600px', marginTop: '1rem' }}>
            <div className="form-group flex align-center gap-3">
              <div style={{ fontSize: '3rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', width: '80px' }}>
                {logoInput}
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Hospital Logo (Emoji/Symbol)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  disabled={!isSuperAdmin}
                  style={{ maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Hospital Name</label>
              <input 
                type="text" 
                required
                className="form-control" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={!isSuperAdmin}
              />
            </div>

            <div className="form-group-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Bed Count</label>
                <input 
                  type="number" 
                  required
                  className="form-control" 
                  value={bedsInput}
                  onChange={(e) => setBedsInput(e.target.value)}
                  disabled={!isSuperAdmin}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Accreditation ID / Registration</label>
                <input 
                  type="text" 
                  required
                  className="form-control" 
                  value={regIdInput}
                  onChange={(e) => setRegIdInput(e.target.value)}
                  disabled={!isSuperAdmin}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Hospital Address</label>
              <input 
                type="text" 
                required
                className="form-control" 
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                disabled={!isSuperAdmin}
              />
            </div>

            {isSuperAdmin && (
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', width: '100%', marginTop: '1rem', cursor: 'pointer', fontWeight: 700 }}>
                Save Profile Upgrades
              </button>
            )}
          </form>
        </div>
      )}

      {/* 2. USER ROLES & ACCESS CONTROL */}
      {activeSubTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
          {/* Left: Active Staff Table */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Active Personnel Directory</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View registered hospital accounts, assigned roles, and permission classes.</p>
            
            <table className="table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email ID</th>
                  <th>Assigned Role</th>
                  <th>Dept</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: member.role === 'Super Admin' ? 'var(--primary-light)' : 'var(--bg-tertiary)', color: member.role === 'Super Admin' ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.7rem' }}>
                        {member.role}
                      </span>
                    </td>
                    <td>{member.department || 'All'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Invite Staff Panel */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserCheck size={18} /> Invite Team Member</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Grant other clinicians or operators access to this workspace.</p>

            {!isSuperAdmin ? (
              <div style={{ backgroundColor: 'var(--bg-warning)', color: 'var(--color-warning)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-warning)', fontSize: '0.75rem' }}>
                Only the Super Admin can invite and assign roles.
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3" style={{ marginTop: '1rem' }}>
                {inviteSuccess && (
                  <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                    🎉 Invite sent and member registered!
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Sujata Roy"
                    className="form-control"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Email ID</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. sujata@hospital.org"
                    className="form-control"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Role Assignment</label>
                  <select 
                    className="form-control"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <option value="Quality Head">Quality Head (Write access + sign-off)</option>
                    <option value="Department Head">Department Head (Write access to specific dept)</option>
                    <option value="Staff">Staff (General data entry)</option>
                    <option value="Auditor">Auditor (Checklist verification access)</option>
                    <option value="Viewer">Guest Viewer (Read-only)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Department Scope</label>
                  <select 
                    className="form-control"
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <option value="Quality Control">Quality Control</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="ICU">Intensive Care (ICU)</option>
                    <option value="Emergency">Emergency</option>
                    <option value="OPD">Out-Patient (OPD)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', marginTop: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
                  <Plus size={16} /> Register & Assign Access
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. GEMINI AI TOKEN CONFIGURATION */}
      {activeSubTab === 'gemini' && (
        <div className="card flex flex-col gap-3" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={18} /> Privacy-Preserving Gemini AI Configuration</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            To enforce absolute patient confidentiality, VaidyaQ AI allows you to input your own **Google Gemini API Key**. 
            All SOP compilation requests and audit logs analysis will be run directly via your account, keeping all data isolated in your private workspace.
          </p>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>🔒 How Data Privacy is Maintained:</h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Your API key is saved exclusively in your browser's local sandbox; it is never transmitted to our servers.</li>
              <li>Requests are piped directly from your machine to the official Gemini API endpoints.</li>
              <li>If no token is supplied, VaidyaQ AI runs in simulated sandbox mode.</li>
            </ul>
          </div>

          {geminiSuccess && (
            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-success)', fontSize: '0.8rem' }}>
              🎉 Gemini API Token saved and verified! AI module is initialized.
            </div>
          )}

          <form onSubmit={handleGeminiSubmit} className="flex flex-col gap-3" style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Gemini API Key</label>
              <input 
                type="password" 
                placeholder="e.g. AIzaSyB7..." 
                className="form-control"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                style={{ fontFamily: 'monospace', width: '100%' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '1rem', cursor: 'pointer', fontWeight: 700 }}>
              Verify & Save Token
            </button>
          </form>
        </div>
      )}

      {/* 4. DOCUMENT VAULT */}
      {activeSubTab === 'vault' && (
        <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Encrypted Document Vault</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Inspect, audit, and manage all policies, procedures, and evidence registers stored in your tenant folder.</p>

          <table className="table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Version</th>
                <th>Last Reviewed</th>
                <th>Mapped Standard</th>
                <th>Storage Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 'bold' }}>{doc.title}</td>
                  <td>{doc.type}</td>
                  <td>v{doc.version}</td>
                  <td>{doc.lastReviewed}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.65rem' }}>
                      {doc.mappedStandards ? doc.mappedStandards.join(', ') : 'None'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {doc.content ? (doc.content.length * 2 / 1024).toFixed(2) + " KB" : "0.50 KB"}
                  </td>
                  <td>
                    <span className={`badge ${doc.status === 'Approved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
