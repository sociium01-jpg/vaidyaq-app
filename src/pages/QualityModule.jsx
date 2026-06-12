import React, { useState, useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  Activity,
  Calendar,
  FileSpreadsheet,
  AlertTriangle,
  FileCheck,
  Plus,
  Sparkles,
  ClipboardList,
  Upload,
  UserCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function QualityModule() {
  const {
    currentUser,
    audits,
    addAudit,
    capaItems,
    addCapa,
    closeCapa,
    linkFindingToCapa,
    incidents,
    setIncidents,
    addIncident,
    qualityIndicators,
    setQualityIndicators,
    logActivity,
    activeDepts,
    risks,
    addRiskRegisterItem
  } = useContext(QualiNABHContext);

  const defaultDept = activeDepts && activeDepts.length > 0 ? activeDepts[0] : 'Quality Control';

  const [activeSubTab, setActiveSubTab] = useState('audits'); // 'audits', 'capa', 'incidents', 'indicators'

  // Modal controls
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showCapaModal, setShowCapaModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showCloseCapaModal, setShowCloseCapaModal] = useState(false);

  // Forms states
  const [newAuditForm, setNewAuditForm] = useState({ title: '', department: defaultDept, date: '', checklistItem: '', checklist: [] });
  const [newCapaForm, setNewCapaForm] = useState({ source: '', department: defaultDept, responsible: '', dueDate: '', priority: 'High', rootCause: '', correctiveAction: '', preventiveAction: '' });
  const [newIncidentForm, setNewIncidentForm] = useState({ type: 'Medication Error', department: defaultDept, severity: 'Medium', description: '', immediateAction: '', investigator: '', shift: 'Morning', deidentified: true });
  
  const [selectedCapaToClose, setSelectedCapaToClose] = useState(null);
  const [closureEvidence, setClosureEvidence] = useState('');

  const [showRiskModal, setShowRiskModal] = useState(false);
  const [newRiskForm, setNewRiskForm] = useState({ category: 'Medication Safety', description: '', department: defaultDept, impact: 'High', likelihood: 'Medium', rating: 'Red', correctiveAction: '' });

  const [selectedIncidentToInvestigate, setSelectedIncidentToInvestigate] = useState(null);
  const [investigationForm, setInvestigationForm] = useState({ investigator: '', rootCause: '', capaId: '' });

  // AI Assistant Draft Statuses
  const [aiDraftLoading, setAiDraftLoading] = useState(false);

  // Trigger AI root cause draft suggest
  const generateAICapaSuggestions = () => {
    setAiDraftLoading(true);
    setTimeout(() => {
      let suggestion = {
        rootCause: "Lack of standard barcode scanning validation at pharmacy checkout and handwriting reading ambiguity.",
        correctiveAction: "Verify prescription dosage with ordering physician, replace and label correct medication immediately.",
        preventiveAction: "Enforce double-signature policy for high-alert drugs, mandate capital lettering for handwritten prescriptions, and schedule nurse drug safety training."
      };
      // If ICU or expired syringe
      if (newCapaForm.source.toLowerCase().includes('syringe') || newCapaForm.source.toLowerCase().includes('icu')) {
        suggestion = {
          rootCause: "Handover check sheet did not mandate daily physical verification of the emergency cart seal status.",
          correctiveAction: "Physically inspect and replace all items in ICU crash cart with validated sterile stocks.",
          preventiveAction: "Implement daily physical verification of emergency cart locks at 8:00 AM shift handover, signed by incoming senior nurse."
        };
      }
      setNewCapaForm(prev => ({
        ...prev,
        rootCause: suggestion.rootCause,
        correctiveAction: suggestion.correctiveAction,
        preventiveAction: suggestion.preventiveAction
      }));
      setAiDraftLoading(false);
      logActivity("Generated AI suggestions for CAPA details");
    }, 800);
  };

  // Add checklist item to audit form
  const addChecklistItem = () => {
    if (newAuditForm.checklistItem.trim() !== '') {
      setNewAuditForm(prev => ({
        ...prev,
        checklist: [...prev.checklist, prev.checklistItem],
        checklistItem: ''
      }));
    }
  };

  // Handle SPA actions
  const handleCreateAudit = (e) => {
    e.preventDefault();
    addAudit({
      title: newAuditForm.title,
      department: newAuditForm.department,
      date: newAuditForm.date,
      checklist: newAuditForm.checklist
    });
    setNewAuditForm({ title: '', department: defaultDept, date: '', checklistItem: '', checklist: [] });
    setShowAuditModal(false);
  };

  const handleCreateCapa = (e) => {
    e.preventDefault();
    addCapa(newCapaForm);
    setNewCapaForm({ source: '', department: defaultDept, responsible: '', dueDate: '', priority: 'High', rootCause: '', correctiveAction: '', preventiveAction: '' });
    setShowCapaModal(false);
  };

  const handleCreateIncident = (e) => {
    e.preventDefault();
    addIncident(newIncidentForm);
    setNewIncidentForm({ type: 'Medication Error', department: defaultDept, severity: 'Medium', description: '', immediateAction: '', investigator: '', shift: 'Morning', deidentified: true });
    setShowIncidentModal(false);
  };

  const handleCreateRisk = (e) => {
    e.preventDefault();
    addRiskRegisterItem(newRiskForm);
    setNewRiskForm({ category: 'Medication Safety', description: '', department: defaultDept, impact: 'High', likelihood: 'Medium', rating: 'Red', correctiveAction: '' });
    setShowRiskModal(false);
  };

  const handleSaveInvestigation = (e) => {
    e.preventDefault();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncidentToInvestigate.id) {
        return {
          ...inc,
          status: "Closed",
          investigator: investigationForm.investigator,
          rootCause: investigationForm.rootCause,
          capaId: investigationForm.capaId
        };
      }
      return inc;
    }));
    logActivity(`Closed investigation on incident ${selectedIncidentToInvestigate.id}. RCA logged.`);
    setSelectedIncidentToInvestigate(null);
  };

  const handleCloseCapaSubmit = (e) => {
    e.preventDefault();
    closeCapa(selectedCapaToClose, currentUser.name);
    
    // Also mark finding resolved in audits
    audits.forEach(aud => {
      aud.findings.forEach(find => {
        if (find.capaId === selectedCapaToClose) {
          linkFindingToCapa(aud.id, find.id, selectedCapaToClose);
        }
      });
    });

    logActivity(`Closed CAPA: ${selectedCapaToClose} with evidence: ${closureEvidence}`);
    setClosureEvidence('');
    setSelectedCapaToClose(null);
    setShowCloseCapaModal(false);
  };

  // Spawn CAPA form directly from Audit Finding
  const spawnCapaFromFinding = (auditTitle, finding, dept) => {
    setNewCapaForm({
      source: `Audit: ${auditTitle}`,
      department: dept,
      responsible: '',
      dueDate: '',
      priority: finding.severity === 'High' ? 'High' : 'Medium',
      rootCause: '',
      correctiveAction: finding.issue,
      preventiveAction: ''
    });
    setActiveSubTab('capa');
    setShowCapaModal(true);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sub Tabs Navigation */}
      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
        <div className="tabs-container" style={{ margin: 0, border: 'none' }}>
          <button onClick={() => setActiveSubTab('audits')} className={`tab-btn ${activeSubTab === 'audits' ? 'active' : ''}`}>
            Internal Audits ({audits.length})
          </button>
          <button onClick={() => setActiveSubTab('capa')} className={`tab-btn ${activeSubTab === 'capa' ? 'active' : ''}`}>
            CAPA Register ({capaItems.length})
          </button>
          <button onClick={() => setActiveSubTab('incidents')} className={`tab-btn ${activeSubTab === 'incidents' ? 'active' : ''}`}>
            Incident Desk ({incidents.length})
          </button>
          <button onClick={() => setActiveSubTab('indicators')} className={`tab-btn ${activeSubTab === 'indicators' ? 'active' : ''}`}>
            Quality Indicators
          </button>
        </div>

        {/* Primary Action Button based on subtab */}
        {activeSubTab === 'audits' && (
          <button onClick={() => setShowAuditModal(true)} className="btn btn-primary">
            <Plus size={16} /> Schedule Internal Audit
          </button>
        )}
        {activeSubTab === 'capa' && (
          <button onClick={() => setShowCapaModal(true)} className="btn btn-primary">
            <Plus size={16} /> Log CAPA Action
          </button>
        )}
        {activeSubTab === 'incidents' && (
          <button onClick={() => setShowIncidentModal(true)} className="btn btn-primary">
            <Plus size={16} /> Report Patient Incident
          </button>
        )}
      </div>

      {/* 1. INTERNAL AUDITS VIEW */}
      {activeSubTab === 'audits' && (
        <div className="flex flex-col gap-3">
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Audit Workflow</h3>
            <div className="flex justify-between text-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>1. Schedule Calendar</div>
              <div style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>2. Conduct Checklists</div>
              <div style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>3. Log Non-Conformities</div>
              <div style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>4. Link CAPA & Close</div>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Audit Title</th>
                  <th>Department</th>
                  <th>Auditor</th>
                  <th>Date Scheduled</th>
                  <th>Status</th>
                  <th>Checklist Items</th>
                  <th>Unresolved Findings</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((aud, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td style={{ fontWeight: 700 }}>{aud.id.substring(0, 8)}</td>
                      <td>
                        <strong>{aud.title}</strong>
                      </td>
                      <td>{aud.department}</td>
                      <td>{aud.auditor}</td>
                      <td>{aud.date}</td>
                      <td>
                        <span className={`badge ${aud.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {aud.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{aud.checklist.length} verified checks</span>
                      </td>
                      <td>
                        {aud.findings.filter(f => !f.resolved).length > 0 ? (
                          <span className="badge badge-danger">{aud.findings.filter(f => !f.resolved).length} Critical</span>
                        ) : (
                          <span className="badge badge-success">0 Gaps</span>
                        )}
                      </td>
                    </tr>

                    {/* Audit Findings Sub Table if findings exist */}
                    {aud.findings && aud.findings.length > 0 && (
                      <tr>
                        <td colSpan="8" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 1.5rem' }}>
                          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.5rem' }}>
                              ⚠️ Logged Non-Conformities (NC) & Findings:
                            </h4>
                            <table className="table" style={{ fontSize: '0.8rem' }}>
                              <thead>
                                <tr>
                                  <th>Finding / Issue</th>
                                  <th>Severity</th>
                                  <th>Resolution</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {aud.findings.map((find, fIdx) => (
                                  <tr key={fIdx}>
                                    <td style={{ color: 'var(--text-primary)' }}>{find.issue}</td>
                                    <td><span className={`badge ${find.severity === 'High' ? 'badge-danger' : 'badge-warning'}`}>{find.severity}</span></td>
                                    <td>
                                      {find.resolved ? (
                                        <span className="badge badge-success">CAPA Linked ({find.capaId.substring(0,7)})</span>
                                      ) : (
                                        <span className="badge badge-danger">Unresolved</span>
                                      )}
                                    </td>
                                    <td>
                                      {!find.resolved && (
                                        <button
                                          onClick={() => spawnCapaFromFinding(aud.title, find, aud.department)}
                                          className="btn btn-primary"
                                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                        >
                                          <Sparkles size={10} /> Generate CAPA
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CAPA REGISTER VIEW */}
      {activeSubTab === 'capa' && (
        <div className="flex flex-col gap-3">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>CAPA ID</th>
                  <th>Source & Department</th>
                  <th>Responsible Head</th>
                  <th>Root Cause & Preventive Plan</th>
                  <th>Priority & Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {capaItems.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{c.id.substring(0, 8)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.source}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{c.department}</span>
                    </td>
                    <td>{c.responsible}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>Root Cause:</strong> {c.rootCause || "Under analysis"}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        <strong>Preventive Plan:</strong> {c.preventiveAction || "Drafting"}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${c.priority === 'High' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {c.priority}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Due: {c.dueDate}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'Closed' ? 'badge-success' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.status === 'Open' ? (
                        <button
                          onClick={() => { setSelectedCapaToClose(c.id); setShowCloseCapaModal(true); }}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          <Upload size={12} /> Attach Proof
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          Approved by<br /><strong>{c.closureApprovedBy}</strong>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INCIDENT & RISK DESK VIEW */}
      {activeSubTab === 'incidents' && (
        <div className="flex flex-col gap-4">
          {/* Privacy Disclaimer Card */}
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-warning)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            🔒 <strong>ABDM Patient Privacy Guard:</strong> Patient Names and Aadhaar numbers are scrubbed. Incident logs utilize generic Incident IDs, department names, and de-identified details.
          </div>

          <div className="grid-split-responsive-sidebar-right">
            {/* Left Column: Incidents Table */}
            <div className="flex flex-col gap-3">
              <div className="table-container">
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }} className="flex justify-between align-center">
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Incident Logs Register</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total reported: {incidents.length}</span>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Incident ID</th>
                      <th>Type</th>
                      <th>Dept & Shift</th>
                      <th>Date</th>
                      <th>Severity</th>
                      <th>RCA & CAPA</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{inc.id.substring(0, 8)}</td>
                        <td>
                          <strong>{inc.type}</strong>
                        </td>
                        <td>
                          <div>{inc.department}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{inc.shift || 'Morning'} Shift</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{inc.dateTime}</td>
                        <td>
                          <span className={`badge ${inc.severity === 'High' ? 'badge-danger' : inc.severity === 'Medium' ? 'badge-warning' : 'badge-neutral'}`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td>
                          {inc.status === 'Closed' ? (
                            <div style={{ fontSize: '0.75rem' }}>
                              <div>🔍 RCA: {inc.rootCause ? inc.rootCause.substring(0, 30) : 'Done'}...</div>
                              {inc.capaId && <div style={{ color: 'var(--primary-color)', fontSize: '0.7rem' }}>🔗 CAPA: {inc.capaId.substring(0, 10)}</div>}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', italic: true }}>Awaiting RCA</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${inc.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>
                            {inc.status}
                          </span>
                        </td>
                        <td>
                          {inc.status !== 'Closed' ? (
                            <button
                              onClick={() => {
                                setSelectedIncidentToInvestigate(inc);
                                setInvestigationForm({ investigator: inc.investigator || '', rootCause: '', capaId: '' });
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            >
                              Investigate
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 'bold' }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quality & Accreditation Risk Register Card */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div className="flex justify-between align-center mb-3">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Accreditation Risk Register (Proactive Management)</h3>
                  <button onClick={() => setShowRiskModal(true)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    <Plus size={12} /> Log Risk Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Risk Description</th>
                        <th>Department</th>
                        <th>Rating</th>
                        <th>Corrective / Mitigation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {risks && risks.map((risk, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 'bold' }}>{risk.category}</td>
                          <td>{risk.description}</td>
                          <td>{risk.department}</td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              backgroundColor: risk.rating === 'Red' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: risk.rating === 'Red' ? 'var(--color-danger)' : '#f59e0b'
                            }}>
                              {risk.rating} ({risk.impact}/{risk.likelihood})
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{risk.correctiveAction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Trend Dashboards */}
            <div className="flex flex-col gap-4">
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Incidents by Shift
                </h4>
                {(() => {
                  const shiftCounts = { Morning: 0, Evening: 0, Night: 0 };
                  incidents.forEach(inc => {
                    const s = inc.shift || "Morning";
                    if (shiftCounts[s] !== undefined) shiftCounts[s]++;
                  });
                  const total = Math.max(1, incidents.length);
                  return (
                    <div className="flex flex-col gap-2.5">
                      {Object.entries(shiftCounts).map(([shift, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={shift} style={{ fontSize: '0.75rem' }}>
                            <div className="flex justify-between" style={{ marginBottom: '2px' }}>
                              <span>{shift} Shift</span>
                              <strong>{count} ({pct}%)</strong>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--primary-color)', borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Incidents Severity
                </h4>
                {(() => {
                  const severityCounts = { Low: 0, Medium: 0, High: 0 };
                  incidents.forEach(inc => {
                    const s = inc.severity || "Medium";
                    if (severityCounts[s] !== undefined) severityCounts[s]++;
                  });
                  const total = Math.max(1, incidents.length);
                  return (
                    <div className="flex flex-col gap-2.5">
                      {Object.entries(severityCounts).map(([sev, count]) => {
                        const pct = Math.round((count / total) * 100);
                        const color = sev === 'High' ? 'var(--color-danger)' : sev === 'Medium' ? '#f59e0b' : 'var(--color-success)';
                        return (
                          <div key={sev} style={{ fontSize: '0.75rem' }}>
                            <div className="flex justify-between" style={{ marginBottom: '2px' }}>
                              <span>{sev} Severity</span>
                              <strong>{count} ({pct}%)</strong>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUALITY INDICATORS VIEW */}
      {activeSubTab === 'indicators' && (
        <div className="flex flex-col gap-3">
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>NABH Digital Health Core Indicators Tracker (Jan 2025)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              The hospital enters monthly quality metrics. These feed into clinical risk prediction models and the final readiness board reports.
            </p>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Patient Falls (Target: 0)</th>
                    <th>Medication Errors (Target: &lt; 2)</th>
                    <th>Hospital-Acquired Infections (Target: 0)</th>
                    <th>Needle-Stick Injuries (Target: 0)</th>
                    <th>Monthly Status</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityIndicators.map((ind, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{ind.month}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: ind.falls > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{ind.falls}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: ind.medicationErrors > 2 ? 'var(--color-warning)' : 'var(--color-success)' }}>{ind.medicationErrors}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: ind.infections > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{ind.infections}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: ind.needleSticks > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{ind.needleSticks}</span>
                      </td>
                      <td>
                        {ind.falls === 0 && ind.medicationErrors <= 2 ? (
                          <span className="badge badge-success">Target Achieved</span>
                        ) : (
                          <span className="badge badge-warning">Review Needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custom SVG/CSS Bar Chart showing Medication Error trends */}
            <h4 style={{ fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', fontSize: '0.95rem' }}>Medication Errors Monthly Trend Comparison</h4>
            <div className="flex align-center gap-3" style={{ height: '180px', padding: '1rem 0', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', justifyContent: 'space-around', alignItems: 'flex-end' }}>
              {qualityIndicators.map((ind, idx) => {
                const heightPercent = (ind.medicationErrors / 6) * 100;
                return (
                  <div key={idx} className="flex flex-col align-center" style={{ height: '100%', justifyContent: 'flex-end', width: '40px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{ind.medicationErrors}</div>
                    <div
                      style={{
                        width: '24px',
                        height: `${heightPercent}%`,
                        backgroundColor: ind.medicationErrors > 2 ? 'var(--color-warning)' : 'var(--primary)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease'
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{ind.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* A. Schedule Audit Modal */}
      {showAuditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Schedule Quality Audit</h3>
              <button onClick={() => setShowAuditModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleCreateAudit}>
              <div className="modal-body flex flex-col gap-2">
                <div className="form-group">
                  <label className="form-label">Audit Title / Scope</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. ICU Safety & Narcotics Audit"
                    value={newAuditForm.title}
                    onChange={(e) => setNewAuditForm({ ...newAuditForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Department</label>
                  <select
                    className="form-control"
                    value={newAuditForm.department}
                    onChange={(e) => setNewAuditForm({ ...newAuditForm, department: e.target.value })}
                  >
                    {(!activeDepts || activeDepts.length === 0) ? (
                      <option value="Quality Control">Quality Control</option>
                    ) : (
                      activeDepts.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Audit Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newAuditForm.date}
                    onChange={(e) => setNewAuditForm({ ...newAuditForm, date: e.target.value })}
                  />
                </div>

                {/* Audit Checklist Items */}
                <div className="form-group">
                  <label className="form-label">Checklist Items (To verify during audit)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Verification of high-alert labels"
                      value={newAuditForm.checklistItem}
                      onChange={(e) => setNewAuditForm({ ...newAuditForm, checklistItem: e.target.value })}
                    />
                    <button type="button" onClick={addChecklistItem} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Add Check
                    </button>
                  </div>
                  <ul style={{ marginTop: '0.5rem', listStyleType: 'decimal', paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {newAuditForm.checklist.map((item, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAuditModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Log CAPA Modal */}
      {showCapaModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Generate CAPA Action</h3>
              <button onClick={() => setShowCapaModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleCreateCapa}>
              <div className="modal-body flex flex-col gap-2">
                <div className="form-group">
                  <label className="form-label">CAPA Source (Audit finding, Complaint, Incident)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Audit Finding: Expired Syringes in ICU Cart"
                    value={newCapaForm.source}
                    onChange={(e) => setNewCapaForm({ ...newCapaForm, source: e.target.value })}
                  />
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Responsible Head</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Sister Gracy"
                      value={newCapaForm.responsible}
                      onChange={(e) => setNewCapaForm({ ...newCapaForm, responsible: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-control"
                      value={newCapaForm.department}
                      onChange={(e) => setNewCapaForm({ ...newCapaForm, department: e.target.value })}
                    >
                      {(!activeDepts || activeDepts.length === 0) ? (
                        <option value="Quality Control">Quality Control</option>
                      ) : (
                        activeDepts.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={newCapaForm.dueDate}
                      onChange={(e) => setNewCapaForm({ ...newCapaForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={newCapaForm.priority}
                      onChange={(e) => setNewCapaForm({ ...newCapaForm, priority: e.target.value })}
                    >
                      <option value="High">High (Critical)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* AI Draft Suggestion Box */}
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '0.5rem' }}>
                  <div className="flex align-center gap-2">
                    <Sparkles size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', fontWeight: 700 }}>AI CAPA Copilot Available</span>
                  </div>
                  <button
                    type="button"
                    onClick={generateAICapaSuggestions}
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', marginLeft: 'auto' }}
                    disabled={aiDraftLoading}
                  >
                    {aiDraftLoading ? 'Drafting suggestions...' : 'Draft Details with AI'}
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Root Cause Analysis (RCA)</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="Describe why the error happened..."
                    value={newCapaForm.rootCause}
                    onChange={(e) => setNewCapaForm({ ...newCapaForm, rootCause: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Corrective Action (Immediate solution)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="What action did you take immediately?"
                    value={newCapaForm.correctiveAction}
                    onChange={(e) => setNewCapaForm({ ...newCapaForm, correctiveAction: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preventive Action (Long-term process control)</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="How will you prevent recurrence?"
                    value={newCapaForm.preventiveAction}
                    onChange={(e) => setNewCapaForm({ ...newCapaForm, preventiveAction: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCapaModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Approve & Log CAPA</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Report Incident Modal */}
      {showIncidentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Report Critical Patient Incident</h3>
              <button onClick={() => setShowIncidentModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="modal-body flex flex-col gap-2">
                <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                  🚨 DO NOT enter Patient Names or Aadhaar numbers to ensure strict regulatory HIPAA/ABDM data privacy rules.
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Incident Type</label>
                    <select
                      className="form-control"
                      value={newIncidentForm.type}
                      onChange={(e) => setNewIncidentForm({ ...newIncidentForm, type: e.target.value })}
                    >
                      <option value="Medication Error">Medication Error</option>
                      <option value="Patient Fall">Patient Fall / Slippage</option>
                      <option value="Needle-stick Injury">Needle-stick Injury</option>
                      <option value="Label Mismatch">Sample Label Mismatch</option>
                      <option value="Equipment Failure">Biomedical Equipment Failure</option>
                      <option value="Infection Control Breach">Infection Control Breach</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department Location</label>
                    <select
                      className="form-control"
                      value={newIncidentForm.department}
                      onChange={(e) => setNewIncidentForm({ ...newIncidentForm, department: e.target.value })}
                    >
                      {(!activeDepts || activeDepts.length === 0) ? (
                        <option value="Quality Control">Quality Control</option>
                      ) : (
                        activeDepts.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Severity</label>
                  <select
                    className="form-control"
                    value={newIncidentForm.severity}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, severity: e.target.value })}
                  >
                    <option value="Low">Low (No harm / Near miss)</option>
                    <option value="Medium">Medium (Mild harm / Recoverable)</option>
                    <option value="High">High (Severe harm / Clinical sentinel event)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description of Incident</label>
                  <textarea
                    rows="3"
                    required
                    className="form-control"
                    placeholder="Briefly describe what happened..."
                    value={newIncidentForm.description}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Immediate Action Taken</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Bed rails locked, vitals check performed"
                    value={newIncidentForm.immediateAction}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, immediateAction: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shift Parameter</label>
                  <select
                    className="form-control"
                    value={newIncidentForm.shift}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, shift: e.target.value })}
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Investigator</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Rita (Safety Committee)"
                    value={newIncidentForm.investigator}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, investigator: e.target.value })}
                  />
                </div>

                <div className="form-group flex align-center gap-2" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="deidentified-chk"
                    checked={newIncidentForm.deidentified}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, deidentified: e.target.checked })}
                  />
                  <label htmlFor="deidentified-chk" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    Confirm De-identification: Patient Names or records are NOT entered. (Mandatory under privacy rules)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowIncidentModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!newIncidentForm.deidentified}>File Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Investigation / RCA Board Modal */}
      {selectedIncidentToInvestigate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Incident Investigation & RCA Desk</h3>
              <button onClick={() => setSelectedIncidentToInvestigate(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleSaveInvestigation}>
              <div className="modal-body flex flex-col gap-2">
                <div style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <strong>Incident ID:</strong> {selectedIncidentToInvestigate.id.substring(0, 10)}
                  <div style={{ marginTop: '0.2rem' }}><strong>Type:</strong> {selectedIncidentToInvestigate.type} | <strong>Dept:</strong> {selectedIncidentToInvestigate.department}</div>
                  <div style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>{selectedIncidentToInvestigate.description}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Investigator *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={investigationForm.investigator}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, investigator: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Root Cause Analysis (RCA) *</label>
                  <textarea
                    rows="4"
                    required
                    className="form-control"
                    placeholder="Log RCA findings (gaps, training lapses, environment hazards)..."
                    value={investigationForm.rootCause}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, rootCause: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link to Corrective Action (CAPA)</label>
                  <select
                    className="form-control"
                    value={investigationForm.capaId}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, capaId: e.target.value })}
                  >
                    <option value="">-- No CAPA Link --</option>
                    {capaItems.map(c => (
                      <option key={c.id} value={c.id}>[{c.id.substring(0, 8)}] {c.correctiveAction.substring(0, 35)}...</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedIncidentToInvestigate(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Findings & Close Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Risk Register Modal */}
      {showRiskModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Log Risk to Register</h3>
              <button onClick={() => setShowRiskModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleCreateRisk}>
              <div className="modal-body flex flex-col gap-2">
                <div className="form-group">
                  <label className="form-label">Risk Category</label>
                  <select
                    className="form-control"
                    value={newRiskForm.category}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, category: e.target.value })}
                  >
                    <option value="Medication Safety">Medication Safety</option>
                    <option value="Infection Control">Infection Control</option>
                    <option value="Facility Fire Safety">Facility Fire Safety</option>
                    <option value="Radiation Safety">Radiation Safety</option>
                    <option value="Patient Identification">Patient Identification</option>
                    <option value="Equipment Failure">Equipment Failure</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Risk Description *</label>
                  <textarea
                    rows="3"
                    required
                    className="form-control"
                    placeholder="Describe the clinical or operational risk..."
                    value={newRiskForm.description}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, description: e.target.value })}
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Impact (High/Medium/Low)</label>
                    <select
                      className="form-control"
                      value={newRiskForm.impact}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, impact: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Likelihood (High/Medium/Low)</label>
                    <select
                      className="form-control"
                      value={newRiskForm.likelihood}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, likelihood: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Rating Color</label>
                  <select
                    className="form-control"
                    value={newRiskForm.rating}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, rating: e.target.value })}
                  >
                    <option value="Red">Red (Immediate Action Required)</option>
                    <option value="Orange">Orange (High Priority)</option>
                    <option value="Yellow">Yellow (Monitoring Required)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mitigation / Corrective Action *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Mitigation or preventive measures..."
                    value={newRiskForm.correctiveAction}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, correctiveAction: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRiskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. Attach Proof and Close CAPA Modal */}
      {showCloseCapaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Close CAPA Action Proof</h3>
              <button onClick={() => setShowCloseCapaModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleCloseCapaSubmit}>
              <div className="modal-body flex flex-col gap-2">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  To close this Corrective Action, please provide the name of the approved audit log or training attendance certificate.
                </p>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Evidence File Attachment (Simulated)</label>
                  <div className="upload-zone" style={{ padding: '2rem 1rem' }}>
                    <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to select quality evidence file</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>PDF, PNG, JPG (Max 5MB)</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Evidence Document Title / Reference</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. ICU Crash Cart Handover Register May 2026.pdf"
                    value={closureEvidence}
                    onChange={(e) => setClosureEvidence(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCloseCapaModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Approve Closure</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
