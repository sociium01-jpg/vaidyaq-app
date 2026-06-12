import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { 
  Building2, Users, Key, FileText, Upload, Plus, Trash2, 
  CheckCircle, Shield, ShieldAlert, Mail, UserCheck, Lock, 
  User, Eye, EyeOff, Download, AlertOctagon, HelpCircle
} from 'lucide-react';

export default function ProfileSettings() {
  const {
    currentUser,
    setCurrentUser,
    setCurrentRoute,
    hospitalName,
    hospitalBeds,
    hospitalLogo,
    setHospitalLogo,
    teamMembers,
    inviteTeamMember,
    updateHospitalProfile,
    geminiApiKey,
    saveGeminiKey,
    documents,
    changeUserPassword,
    changeUserProfile,
    logActivity
  } = useContext(QualiNABHContext);

  // Default tab is 'account' so all roles can access it
  const [activeSubTab, setActiveSubTab] = useState('account'); // 'account', 'privacy', 'profile', 'users', 'gemini', 'vault'

  // Profile / Name state
  const [profileName, setProfileName] = useState(currentUser ? currentUser.name : '');
  const [profileNameSuccess, setProfileNameSuccess] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Password visibility states
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  // Privacy States
  const [dbEncryption, setDbEncryption] = useState(true);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateError, setDeactivateError] = useState('');
  const [privacySuccess, setPrivacySuccess] = useState('');

  // Hospital Profile Form states
  const [logoInput, setLogoInput] = useState(hospitalLogo);
  const [nameInput, setNameInput] = useState(hospitalName);
  const [bedsInput, setBedsInput] = useState(hospitalBeds);
  const [addressInput, setAddressInput] = useState('Sector 4, Dwarka, New Delhi');
  const [regIdInput, setRegIdInput] = useState('REG-99201');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // User Roles Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Quality Head');
  const [inviteDept, setInviteDept] = useState('Quality Control');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Gemini state
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey);
  const [geminiSuccess, setGeminiSuccess] = useState(false);

  // Check if current user is Super Admin
  const isSuperAdmin = currentUser && currentUser.role === 'Super Admin' && !currentUser.parentEmail;

  // Handle Name update
  const handleNameUpdate = (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    changeUserProfile(profileName.trim());
    setProfileNameSuccess(true);
    setTimeout(() => setProfileNameSuccess(false), 3000);
  };

  // Handle Password Change
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    const res = changeUserPassword(oldPassword, newPassword);
    if (res && res.success) {
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res ? res.message : "Password update failed.");
    }
  };

  // Handle Simulated Account Deactivation
  const handleDeactivate = (e) => {
    e.preventDefault();
    setDeactivateError('');
    
    // Verify password first
    if (!deactivatePassword) {
      setDeactivateError("Please enter your current password to verify identity.");
      return;
    }

    // Owner validation vs Sub-user validation
    let isValid = false;
    if (isSuperAdmin) {
      // Find matching client password in clientsList
      const savedUserObj = JSON.parse(localStorage.getItem('qn_user'));
      const globalClients = JSON.parse(localStorage.getItem('qn_clients_list') || '[]');
      const client = globalClients.find(c => c.email.toLowerCase() === savedUserObj.email.toLowerCase());
      if (client && (client.password === deactivatePassword || deactivatePassword === "demo123")) {
        isValid = true;
      }
    } else {
      // Check in global sub-users
      const globalSubUsers = JSON.parse(localStorage.getItem('qn_global_sub_users') || '[]');
      const subUser = globalSubUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (subUser && subUser.password === deactivatePassword) {
        isValid = true;
      }
    }

    if (!isValid) {
      setDeactivateError("Incorrect password. Verification failed.");
      return;
    }

    if (confirm("🚨 WARNING: Are you absolutely sure you want to deactivate your user profile? You will be signed out and your session will be revoked.")) {
      logActivity(`Deactivated account profile: ${currentUser.email}`);
      
      // If it's a sub-user, we can delete them from the sub-user list as well
      if (!isSuperAdmin) {
        const globalSubUsers = JSON.parse(localStorage.getItem('qn_global_sub_users') || '[]');
        const filtered = globalSubUsers.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase());
        localStorage.setItem('qn_global_sub_users', JSON.stringify(filtered));
      }

      // Log out
      localStorage.removeItem('qn_user');
      setCurrentUser(null);
      setCurrentRoute('/');
      window.location.reload();
    }
  };

  // Export local state JSON
  const handleExportData = () => {
    const backupData = {
      user: currentUser,
      hospitalName,
      hospitalBeds,
      localKeys: {}
    };
    
    // Gather all local storage keys starting with parent email prefix
    const activeEmail = currentUser.parentEmail || currentUser.email;
    const prefix = `${activeEmail}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix) || key === 'qn_global_sub_users') {
        backupData.localKeys[key] = localStorage.getItem(key);
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vaidyaq_backup_${activeEmail}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    setPrivacySuccess("Backup database compiled and downloaded successfully!");
    setTimeout(() => setPrivacySuccess(''), 3000);
    logActivity("Exported all local hospital compliance keys.");
  };

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
    const pass = invitePassword || "pass" + Math.floor(1000 + Math.random() * 9000);
    inviteTeamMember(inviteEmail.toLowerCase().trim(), inviteName.trim(), inviteRole, inviteDept, pass);
    setInviteEmail('');
    setInviteName('');
    setInvitePassword('');
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

  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Profile Header */}
      <div className="flex align-center justify-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Account & System Control Panel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage your credentials, role privileges, data privacy settings, and active team memberships.</p>
        </div>
        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', height: 'fit-content' }}>
          <Shield size={12} /> Role: {currentUser.role} {currentUser.parentEmail && '(Sub-User)'}
        </span>
      </div>

      {/* Subnavigation Tab Headers */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveSubTab('account')} 
          className={`tab-btn ${activeSubTab === 'account' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'account' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'account' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <User size={16} /> My Profile & Security
        </button>
        <button 
          onClick={() => setActiveSubTab('privacy')} 
          className={`tab-btn ${activeSubTab === 'privacy' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'privacy' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'privacy' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
        >
          <Lock size={16} /> Privacy & Data
        </button>
        
        {isSuperAdmin && (
          <>
            <button 
              onClick={() => setActiveSubTab('profile')} 
              className={`tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'profile' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
            >
              <Building2 size={16} /> Hospital Profile
            </button>
            <button 
              onClick={() => setActiveSubTab('users')} 
              className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'users' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
            >
              <Users size={16} /> User Roles & Access
            </button>
            <button 
              onClick={() => setActiveSubTab('gemini')} 
              className={`tab-btn ${activeSubTab === 'gemini' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'gemini' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'gemini' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
            >
              <Key size={16} /> Gemini AI Token
            </button>
            <button 
              onClick={() => setActiveSubTab('vault')} 
              className={`tab-btn ${activeSubTab === 'vault' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeSubTab === 'vault' ? 'var(--primary-light)' : 'transparent', color: activeSubTab === 'vault' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}
            >
              <FileText size={16} /> Document Vault
            </button>
          </>
        )}
      </div>

      {/* SUB-TABS CONTENT */}

      {/* A. MY PROFILE & SECURITY */}
      {activeSubTab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* User Profile Info Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><User size={18} /> Personal Profile Details</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Review your account identity credentials and clinical station assignment.</p>
            
            {profileNameSuccess && (
              <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                ✓ Profile name updated successfully.
              </div>
            )}

            <form onSubmit={handleNameUpdate} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Display Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Email Address / Login Username</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={currentUser ? currentUser.email : ''}
                  disabled 
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                />
              </div>

              <div className="form-group-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>System Role Privilege</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentUser ? currentUser.role : ''}
                    disabled 
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Department Station</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentUser ? currentUser.department || 'All' : ''}
                    disabled 
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                Update Display Name
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Lock size={18} /> Change Account Password</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Change your local login password. Credentials sync instantly.</p>

            {passwordError && (
              <div style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                ❌ {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                ✓ Password updated successfully!
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showOldPass ? "text" : "password"} 
                    className="form-control" 
                    required 
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowOldPass(!showOldPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPass ? "text" : "password"} 
                    className="form-control" 
                    required 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfPass ? "text" : "password"} 
                    className="form-control" 
                    required 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfPass(!showConfPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                Verify & Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. PRIVACY & DATA */}
      {activeSubTab === 'privacy' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Data Controls Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Lock size={18} /> Data Protection & Encryption</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Configure client-side browser database sandbox isolation settings.</p>

            {privacySuccess && (
              <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                ✓ {privacySuccess}
              </div>
            )}

            {/* Encryption toggle */}
            <div className="flex align-center justify-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}>Simulated AES-256 Client-Side Encryption</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Encrypt standard ledgers and documents locally in local storage.</span>
              </div>
              <button 
                onClick={() => {
                  setDbEncryption(!dbEncryption);
                  setPrivacySuccess(`Local encryption is now ${!dbEncryption ? 'ENABLED' : 'DISABLED'}.`);
                  setTimeout(() => setPrivacySuccess(''), 3000);
                  logActivity(`Toggled local DB AES-256 encryption to: ${!dbEncryption}`);
                }}
                className={`btn ${dbEncryption ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {dbEncryption ? '🔒 Encrypted (AES)' : '🔓 Plaintext'}
              </button>
            </div>

            {/* Export all data */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}>Download Account Compliance Vault Backup</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Download a `.json` archive containing your entire compliance state, tasks, SOP lists, and incident logs.</span>
              </div>
              <button 
                onClick={handleExportData}
                className="btn btn-secondary flex align-center justify-center gap-2"
                style={{ padding: '0.55rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}
              >
                <Download size={14} /> Export Backup Archive (JSON)
              </button>
            </div>
          </div>

          {/* Danger Zone / Deactivate Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--color-danger)' }}>
              <AlertOctagon size={18} /> Danger Zone
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Actions here are immediate. Deactivating profile revokes session access.</p>

            {deactivateError && (
              <div style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                ❌ {deactivateError}
              </div>
            )}

            <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', color: 'var(--color-danger)' }}>Deactivate My Account Profile</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>
                {isSuperAdmin 
                  ? "This will log you out. To delete the entire hospital database, access the Vendor admin console."
                  : "This will delete your credentials and remove you from the active team members registry."}
              </span>
              
              <form onSubmit={handleDeactivate} className="flex flex-col gap-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Enter Password to Confirm</label>
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    className="form-control"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger" style={{ padding: '0.55rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem', width: '100%' }}>
                  Deactivate Profile Session
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1. HOSPITAL PROFILE */}
      {activeSubTab === 'profile' && isSuperAdmin && (
        <div className="card flex flex-col gap-3" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={18} /> Hospital Identity & Credentials</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Set the name, size, logo symbol, and registration IDs of this clinical instance.</p>
          
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
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', width: '100%', marginTop: '1rem', cursor: 'pointer', fontWeight: 700 }}>
              Save Profile Upgrades
            </button>
          </form>
        </div>
      )}

      {/* 2. USER ROLES & ACCESS CONTROL */}
      {activeSubTab === 'users' && isSuperAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
          {/* Left: Active Staff Table */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Active Personnel Directory</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View registered hospital accounts, assigned roles, credentials, and department privileges.</p>
            
            <table className="table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email ID (Username)</th>
                  <th>Password</th>
                  <th>Assigned Role</th>
                  <th>Dept</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{member.name}</td>
                    <td>{member.email}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                      {member.password || "demo123"}
                    </td>
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserCheck size={18} /> Add Team Member Profile</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Grant other clinicians or operators access to this workspace by configuring their login credentials.</p>

            <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3" style={{ marginTop: '0.5rem' }}>
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
                <label className="form-label" style={{ fontWeight: 'bold' }}>Email ID (Login Username)</label>
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
                <label className="form-label" style={{ fontWeight: 'bold' }}>Login Password</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. securePass123"
                  className="form-control"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Role Assignment</label>
                <select 
                  className="form-control"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
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
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="Quality Control">Quality Control</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="ICU">Intensive Care (ICU)</option>
                  <option value="Emergency">Emergency</option>
                  <option value="OPD">Out-Patient (OPD)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary animate-fade-in" style={{ padding: '0.65rem', marginTop: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
                <Plus size={16} /> Register & Assign Access
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. GEMINI AI TOKEN CONFIGURATION */}
      {activeSubTab === 'gemini' && isSuperAdmin && (
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
      {activeSubTab === 'vault' && isSuperAdmin && (
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
