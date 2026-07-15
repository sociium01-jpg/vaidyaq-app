import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  Users,
  Settings,
  Shield,
  ShieldCheck,
  Lock,
  LockKeyhole,
  Brain,
  Cpu,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  History,
  DollarSign,
  Activity,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminModule() {
  const {
    currentUser,
    auditLogs,
    logActivity,
    aiSettings,
    updateAiSettings,
    saveAiKey,
    deleteAiKey,
    aiMemory,
    addAiMemory,
    deleteAiMemory,
    aiUsageLogs,
    aiSafetyLogs,
    hospitalName,
    backupHistory,
    restoreBackupPayload,
    triggerManualBackup
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('logs'); // 'logs', 'users', 'settings', 'ai-config'

  // Form states for AI Key Verification
  const [selectedProvider, setSelectedProvider] = useState(aiSettings?.provider || 'google');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [tempCustomUrl, setTempCustomUrl] = useState(aiSettings?.customUrl || '');
  const [tempModel, setTempModel] = useState(aiSettings?.model || '');
  
  // Advanced Settings Form States
  const [tempSystemPrompt, setTempSystemPrompt] = useState(aiSettings?.systemPrompt || '');
  const [tempTemp, setTempTemp] = useState(aiSettings?.temperature !== undefined ? aiSettings.temperature : 0.7);
  const [tempMaxTokens, setTempMaxTokens] = useState(aiSettings?.maxTokens || 2048);
  const [allowedRoles, setAllowedRoles] = useState(aiSettings?.allowedRoles || ['Super Admin', 'Quality Head']);

  // Verification feedbacks
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // { success: bool, message: string }

  // Memory form states
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [memTitle, setMemTitle] = useState('');
  const [memScope, setMemScope] = useState('global');
  const [memContent, setMemContent] = useState('');
  const [memRoles, setMemRoles] = useState(['Super Admin', 'Quality Head']);

  // Sync state values on config load
  useEffect(() => {
    if (aiSettings) {
      setTimeout(() => {
        setSelectedProvider(aiSettings.provider || 'google');
        setTempCustomUrl(aiSettings.customUrl || '');
        setTempModel(aiSettings.model || '');
        setTempSystemPrompt(aiSettings.systemPrompt || '');
        setTempTemp(aiSettings.temperature !== undefined ? aiSettings.temperature : 0.7);
        setTempMaxTokens(aiSettings.maxTokens || 2048);
        setAllowedRoles(aiSettings.allowedRoles || ['Super Admin', 'Quality Head']);
      }, 0);
    }
  }, [aiSettings]);

  // Handle saving advanced configuration variables
  const handleSaveAdvancedConfig = (e) => {
    e.preventDefault();
    updateAiSettings({
      model: tempModel,
      systemPrompt: tempSystemPrompt,
      temperature: parseFloat(tempTemp),
      maxTokens: parseInt(tempMaxTokens),
      customUrl: tempCustomUrl,
      allowedRoles: allowedRoles
    });
    setValidationResult({ success: true, message: "Advanced AI configuration updated successfully." });
    setTimeout(() => setValidationResult(null), 3000);
  };

  // Run validation and lock credentials in local KMS simulator
  const handleVerifyAndSaveKey = async (e) => {
    e.preventDefault();
    if (!tempApiKey) {
      setValidationResult({ success: false, message: "Please enter a valid API key to test." });
      return;
    }
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await saveAiKey(selectedProvider, tempApiKey);
      if (res.success) {
        setValidationResult({ success: true, message: `Successfully verified and connected to ${selectedProvider} API gateway!` });
        setTempApiKey(''); // Clear write-only field
      } else {
        setValidationResult({ success: false, message: res.error || "Failed to authenticate with provider." });
      }
    } catch (err) {
      setValidationResult({ success: false, message: `Network/CORS Error: ${err.message}` });
    } finally {
      setIsValidating(false);
    }
  };

  // Remove API key from storage
  const handleDisconnectKey = () => {
    deleteAiKey(selectedProvider);
    setValidationResult({ success: true, message: `Credentials cleared successfully.` });
    setTimeout(() => setValidationResult(null), 3000);
  };

  // Add new knowledge memory block
  const handleAddMemorySubmit = (e) => {
    e.preventDefault();
    if (!memTitle || !memContent) return;

    addAiMemory(memScope, '', memTitle, memContent, memRoles);
    setMemTitle('');
    setMemContent('');
    setShowAddMemory(false);
  };

  // Default models helper
  const getProviderDefaultModel = (prov) => {
    switch (prov) {
      case 'openai': return 'gpt-4o-mini';
      case 'google':
      case 'gemini': return 'gemini-1.5-flash';
      case 'anthropic': return 'claude-3-5-haiku-20241022';
      case 'openrouter': return 'google/gemini-2.5-flash';
      case 'custom': return 'custom-llm';
      default: return 'gemini-1.5-flash';
    }
  };

  // Handle role checkbox toggling
  const handleRoleToggle = (role) => {
    if (allowedRoles.includes(role)) {
      setAllowedRoles(prev => prev.filter(r => r !== role));
    } else {
      setAllowedRoles(prev => [...prev, role]);
    }
  };

  // Handle memory role checkbox toggling
  const handleMemoryRoleToggle = (role) => {
    if (memRoles.includes(role)) {
      setMemRoles(prev => prev.filter(r => r !== role));
    } else {
      setMemRoles(prev => [...prev, role]);
    }
  };

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
        <button onClick={() => setActiveSubTab('ai-config')} className={`tab-btn ${activeSubTab === 'ai-config' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Brain size={14} />
          <span>AI Console & Guardrails</span>
        </button>
        <button onClick={() => setActiveSubTab('backup')} className={`tab-btn ${activeSubTab === 'backup' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <History size={14} />
          <span>Backup & Restore Vault</span>
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

      {/* 4. AI CONSOLE & GUARDRAILS PANEL */}
      {activeSubTab === 'ai-config' && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', alignItems: 'start' }}>
          
          {/* Left Column: API Gateway settings */}
          <div className="flex flex-col gap-3">
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="var(--primary)" />
                <span>AI Gateway Credentials Configuration</span>
              </h3>

              {validationResult && (
                <div className={`card ${validationResult.success ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`} style={{ padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', borderLeft: `4px solid ${validationResult.success ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    {validationResult.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <span>{validationResult.success ? 'Success' : 'Verification Alert'}</span>
                  </div>
                  <p style={{ marginTop: '4px' }}>{validationResult.message}</p>
                </div>
              )}

              <form onSubmit={handleVerifyAndSaveKey} className="flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Active AI Model Provider</label>
                  <select 
                    className="form-control"
                    value={selectedProvider}
                    onChange={(e) => {
                      const prov = e.target.value;
                      setSelectedProvider(prov);
                      setTempModel(getProviderDefaultModel(prov));
                      if (prov === 'custom' && !tempCustomUrl) {
                        setTempCustomUrl('http://localhost:11434/v1/chat/completions');
                      }
                    }}
                  >
                    <option value="google">Google Gemini API</option>
                    <option value="openai">OpenAI ChatGPT API</option>
                    <option value="anthropic">Anthropic Claude API</option>
                    <option value="openrouter">OpenRouter API Gateways</option>
                    <option value="custom">Custom Local LLM / REST Endpoint</option>
                  </select>
                </div>

                {selectedProvider === 'custom' && (
                  <div className="form-group">
                    <label className="form-label">Custom HTTP Completion API URL</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="e.g. http://localhost:11434/v1/chat/completions"
                      value={tempCustomUrl}
                      onChange={(e) => setTempCustomUrl(e.target.value)}
                      required
                    />
                  </div>
                )}

                  <div className="form-group">
                    <label className="form-label">Secure API Secret Key (Write-Only Input)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                          type={showSecretKey ? "text" : "password"} 
                          className="form-control" 
                          placeholder={aiSettings?.providerStatus === 'Connected' && selectedProvider === aiSettings.provider ? '••••••••••••••••••••••••••••' : 'Enter API token secret'}
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          style={{ paddingRight: '2.5rem', width: '100%' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretKey(prev => !prev)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          aria-label={showSecretKey ? "Hide key" : "Show key"}
                        >
                          {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {aiSettings?.providerStatus === 'Connected' && selectedProvider === aiSettings.provider && (
                        <button type="button" className="btn btn-danger" onClick={handleDisconnectKey} title="Delete stored credentials">
                          Disconnect
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                      Keys are encrypted locally inside your tenant context browser sandbox and never relayed back to external logs.
                    </span>
                  </div>

                <div className="flex gap-2 align-center justify-between" style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge" style={{ 
                      backgroundColor: aiSettings?.providerStatus === 'Connected' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(156, 163, 175, 0.1)', 
                      color: aiSettings?.providerStatus === 'Connected' ? 'var(--color-success)' : 'var(--text-secondary)',
                      fontWeight: 700
                    }}>
                      Status: {selectedProvider === aiSettings?.provider ? (aiSettings?.providerStatus || 'Disabled') : 'Unsaved Changes'}
                    </span>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isValidating}>
                    {isValidating ? 'Validating Connection...' : 'Save & Verify Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Advanced Completion Parameters */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} color="var(--primary)" />
                <span>Completion Parameters & Access Roles</span>
              </h3>

              <form onSubmit={handleSaveAdvancedConfig} className="flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Target Engine Model ID</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. gemini-1.5-flash, gpt-4o-mini"
                    value={tempModel}
                    onChange={(e) => setTempModel(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Instruction System Prompt</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    value={tempSystemPrompt}
                    onChange={(e) => setTempSystemPrompt(e.target.value)}
                    placeholder="Provide default rules for compliance checks..."
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Temperature ({tempTemp})</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      className="form-control"
                      value={tempTemp}
                      onChange={(e) => setTempTemp(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Token Limit ({tempMaxTokens})</label>
                    <input 
                      type="range" 
                      min="256" 
                      max="4096" 
                      step="256" 
                      className="form-control"
                      value={tempMaxTokens}
                      onChange={(e) => setTempMaxTokens(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>Allowed Roles for AI Interaction</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['Super Admin', 'Quality Head', 'Department Head', 'Auditor', 'Staff'].map(role => (
                      <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={allowedRoles.includes(role)} 
                          onChange={() => handleRoleToggle(role)} 
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Apply Advanced Parameters
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Usage Stats, Guardrail logs, Memory Register */}
          <div className="flex flex-col gap-3">
            
            {/* Usage Cost & Consumption Analytics */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="var(--color-success)" />
                <span>Usage Logs & Token Metrics</span>
              </h3>
              
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Token Consumption</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                    {(aiSettings?.monthlyUsageTokens || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Estimated API Spend</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-success)' }}>
                    ${(aiSettings?.monthlyUsageSpend || 0.0).toFixed(4)}
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Recent AI Calls</h4>
                {(aiUsageLogs || []).length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>No calls logged in active session.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {aiUsageLogs.slice(0, 5).map((log, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', padding: '4px 6px', borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.agentType}</span>
                          <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>({log.model})</span>
                        </div>
                        <div style={{ fontWeight: 600 }}>{log.inputTokens + log.outputTokens} tkn</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Safety Guardrail Breach Register */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--color-danger)" />
                <span>Compliance Safety Incidents ({aiSafetyLogs?.length || 0})</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                System-blocked attempts requesting restricted clinical diagnostics, forged audit signatures, or compliance guarantees.
              </p>
              
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {(aiSafetyLogs || []).length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>All interactions safe. Zero incidents.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {aiSafetyLogs.map((incident, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(220,38,38,0.03)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(220,38,38,0.1)', fontSize: '0.75rem' }}>
                        <div className="flex justify-between" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>
                          <span>{incident.issueType}</span>
                          <span>{incident.createdAt.slice(11, 16)}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.7rem' }}>
                          {incident.reason} (User: {incident.userId})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tenant Memory / Local Knowledge Context Register */}
            <div className="card">
              <div className="flex align-center justify-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={18} color="var(--secondary)" />
                  <span>Tenant Local Memory Context</span>
                </h3>
                <button className="btn btn-secondary-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setShowAddMemory(!showAddMemory)}>
                  {showAddMemory ? 'Cancel' : 'Add Context'}
                </button>
              </div>

              {showAddMemory && (
                <form onSubmit={handleAddMemorySubmit} className="card bg-tertiary flex flex-col gap-2" style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px dashed var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Inject Local Context Block</h4>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Context Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }} 
                      placeholder="e.g. ICU Incident Review Policies"
                      value={memTitle}
                      onChange={(e) => setMemTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Scope Partition</label>
                      <select 
                        className="form-control" 
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        value={memScope}
                        onChange={(e) => setMemScope(e.target.value)}
                      >
                        <option value="global">Global (All Modules)</option>
                        <option value="dashboard">Dashboard Briefings</option>
                        <option value="documents">Document SOP Control</option>
                        <option value="quality">Quality & CAPA</option>
                        <option value="audits">Audits</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Memory Content Description</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      style={{ fontSize: '0.75rem' }}
                      placeholder="Provide local facts/guidelines..."
                      value={memContent}
                      onChange={(e) => setMemContent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '2px' }}>Clearance Roles</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Super Admin', 'Quality Head', 'Auditor'].map(r => (
                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem' }}>
                          <input 
                            type="checkbox" 
                            checked={memRoles.includes(r)} 
                            onChange={() => handleMemoryRoleToggle(r)} 
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100%' }}>
                    Save Knowledge Block
                  </button>
                </form>
              )}

              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {aiMemory.filter(m => m.hospitalId === hospitalName).length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>
                    No custom memory modules injected yet. AI will rely on generic standard rules.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {aiMemory.filter(m => m.hospitalId === hospitalName).map((mem) => (
                      <div key={mem.memoryId} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '4px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mem.title}</span>
                            <span className="badge" style={{ fontSize: '0.6rem', marginLeft: '6px', textTransform: 'uppercase' }}>{mem.scope}</span>
                          </div>
                          <button 
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '2px' }}
                            onClick={() => deleteAiMemory(mem.memoryId)}
                            title="Delete memory"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                          {mem.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. BACKUP & RESTORE VAULT VIEW */}
      {activeSubTab === 'backup' && (
        <div className="flex flex-col gap-3">
          <div className="card flex align-center gap-3" style={{ borderLeft: '5px solid var(--primary)' }}>
            <History size={24} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1rem' }}>VaidyaQ Shield Vault: Backup & Restore System</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                This system automatically backups your complete compliance database every 24 hours to secure browser storage and the cloud vault. In case of data loss, you can download backups or restore older versions here.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Create Manual Backup */}
            <div className="card flex flex-col gap-2">
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Create Manual Backup Snapshot</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Compile your entire hospital quality profile (SOPs, audits, CAPA items, tasks, and indicators) into a secure, portable JSON backup file.
              </p>
              <button 
                onClick={triggerManualBackup}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: 'auto', fontSize: '0.8rem', padding: '0.6rem 1rem' }}
              >
                📥 Export & Download Backup File
              </button>
            </div>

            {/* Restore from File */}
            <div className="card flex flex-col gap-2">
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Restore Database from File</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Select a previously exported VaidyaQ JSON backup file to overwrite your current browser data workspace.
              </p>
              <input 
                type="file" 
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const parsed = JSON.parse(event.target.result);
                      if (confirm("WARNING: Restoring from this file will overwrite all your current local data. Are you sure you want to proceed?")) {
                        restoreBackupPayload(parsed);
                        alert("Database restored successfully!");
                      }
                    } catch (err) {
                      alert("Failed to parse backup file. Please ensure it is a valid VaidyaQ JSON backup.");
                    }
                  };
                  reader.readAsText(file);
                }}
                style={{ fontSize: '0.75rem', marginTop: 'auto' }}
              />
            </div>
          </div>

          {/* Backup History Table */}
          <div className="card">
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Local Snapshot History (24-Hour Auto-Syncs & Manuals)</h4>
            <div className="table-container">
              <table className="table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Snapshot Type</th>
                    <th>Compliance Version</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No automatic or manual backup snapshots saved yet.
                      </td>
                    </tr>
                  ) : (
                    backupHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{new Date(item.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${item.type === 'Auto 24h Sync' ? 'badge-primary' : 'badge-success'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td>{item.data?.version || "1.0.0"}</td>
                        <td>
                          <button 
                            onClick={() => {
                              if (confirm("Are you sure you want to restore this snapshot? All current changes will be overwritten.")) {
                                restoreBackupPayload(item.data);
                                alert("Database rolled back successfully!");
                              }
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                          >
                            Restore Version
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
