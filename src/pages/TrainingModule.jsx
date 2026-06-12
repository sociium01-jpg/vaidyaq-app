import React, { useState, useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  GraduationCap,
  Calendar,
  Grid,
  FileBadge,
  Sparkles,
  Plus,
  CheckCircle,
  AlertTriangle,
  Award,
  Search,
  BookOpen,
  HelpCircle,
  UserCheck
} from 'lucide-react';

export default function TrainingModule() {
  const {
    trainings,
    addTrainingSession,
    generateAIQuiz,
    documents,
    complianceFlows,
    logActivity
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('matrix'); // 'matrix', 'log', 'scorecard', 'certificates', 'quiz'
  const [successMessage, setSuccessMessage] = useState('');

  // Log Training Form States
  const [topic, setTopic] = useState('');
  const [department, setDepartment] = useState('Quality Control');
  const [role, setRole] = useState('Nurse');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendeesInput, setAttendeesInput] = useState('');
  const [mappedPolicyId, setMappedPolicyId] = useState('');

  // Certificate log states
  const [certs, setCerts] = useState([
    { id: 'cert-1', name: 'Dr. Sen', type: 'ACLS Certification', issueDate: '2025-06-15', expiryDate: '2026-06-15', status: 'Expiring Soon' },
    { id: 'cert-2', name: 'Sister Gracy', type: 'BLS Certification', issueDate: '2024-04-10', expiryDate: '2026-04-10', status: 'Expired' },
    { id: 'cert-3', name: 'Dr. Rita', type: 'ACLS Certification', issueDate: '2025-08-01', expiryDate: '2027-08-01', status: 'Valid' },
    { id: 'cert-4', name: 'Sister Priya', type: 'Fire Safety Induction', issueDate: '2025-10-10', expiryDate: '2026-10-10', status: 'Valid' }
  ]);
  
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    type: 'BLS Certification',
    issueDate: '',
    expiryDate: ''
  });

  // AI Quiz Generator states
  const [selectedSopTitle, setSelectedSopTitle] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [quizPin, setQuizPin] = useState('');
  const [quizPinError, setQuizPinError] = useState('');
  const [activeQuizzes, setActiveQuizzes] = useState([
    { id: 'qz-1', sopTitle: 'Clinical Hand Segregation SOP', questionsCount: 5, status: 'Approved', author: 'Dr. Sarah Paul' }
  ]);

  // Role matrix data
  const matrixData = [
    { course: 'Basic Life Support (BLS)', doctor: 'Mandatory', nurse: 'Mandatory', pharmacy: 'Optional', housekeeper: 'N/A', admin: 'Optional' },
    { course: 'Advanced Cardiac Life Support (ACLS)', doctor: 'Mandatory', nurse: 'Mandatory', pharmacy: 'N/A', housekeeper: 'N/A', admin: 'N/A' },
    { course: 'Hospital Hand Hygiene (WHO 5 Moments)', doctor: 'Mandatory', nurse: 'Mandatory', pharmacy: 'Mandatory', housekeeper: 'Mandatory', admin: 'Optional' },
    { course: 'Biomedical Waste Segregation Protocols', doctor: 'Mandatory', nurse: 'Mandatory', pharmacy: 'Mandatory', housekeeper: 'Mandatory', admin: 'N/A' },
    { course: 'Fire Drill & Egress Protocols', doctor: 'Mandatory', nurse: 'Mandatory', pharmacy: 'Mandatory', housekeeper: 'Mandatory', admin: 'Mandatory' },
    { course: 'Medication Safety & High-Alert Locker SOP', doctor: 'Mandatory', nurse: 'Mandatory', pharmacy: 'Mandatory', housekeeper: 'N/A', admin: 'N/A' }
  ];

  // Helper: calculate certificate expiry status
  const getCertStatus = (expiryDateStr) => {
    if (!expiryDateStr) return 'Expired';
    const exp = new Date(expiryDateStr);
    if (isNaN(exp.getTime())) return 'Expired';
    const today = new Date();
    exp.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diff = exp - today;
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays <= 20) return 'Expiring Soon';
    return 'Valid';
  };

  const handleLogTrainingSubmit = (e) => {
    e.preventDefault();
    if (!topic || !attendeesInput) return;

    const attendees = attendeesInput.split(',').map(a => a.trim()).filter(a => a.length > 0);
    
    const session = {
      topic,
      department,
      role,
      date,
      attendees,
      quizRef: `QZ-${Math.floor(100 + Math.random() * 900)}`,
      passRate: "95",
      status: "Active",
      mappedPolicyId: mappedPolicyId || null
    };

    addTrainingSession(session);

    // Reset Form
    setTopic('');
    setAttendeesInput('');
    setMappedPolicyId('');
    
    setSuccessMessage(`Training logged successfully. Mapped policy flows updated.`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setActiveSubTab('log');
  };

  const handleAddCertSubmit = (e) => {
    e.preventDefault();
    if (!certForm.name || !certForm.expiryDate) return;

    const status = getCertStatus(certForm.expiryDate);
    const newCert = {
      id: `cert-${Date.now()}`,
      name: certForm.name,
      type: certForm.type,
      issueDate: certForm.issueDate || new Date().toISOString().slice(0,10),
      expiryDate: certForm.expiryDate,
      status: status
    };

    setCerts([newCert, ...certs]);
    setShowAddCertModal(false);
    setCertForm({ name: '', type: 'BLS Certification', issueDate: '', expiryDate: '' });
    logActivity(`Uploaded certification: ${newCert.name} - ${newCert.type}`);
  };

  const handleGenerateQuiz = () => {
    if (!selectedSopTitle) return;
    const quiz = generateAIQuiz(selectedSopTitle);
    setGeneratedQuiz(quiz);
    setQuizPin('');
    setQuizPinError('');
  };

  const handleApproveQuiz = () => {
    if (quizPin !== '1234') {
      setQuizPinError("Invalid verification PIN! AI generated quizzes must be signed off by a clinical admin (PIN: 1234).");
      return;
    }

    if (!generatedQuiz) return;

    const newQuiz = {
      id: `qz-custom-${Date.now()}`,
      sopTitle: generatedQuiz.sopTitle,
      questionsCount: 5,
      status: 'Approved',
      author: 'Clinical Administrator'
    };

    setActiveQuizzes([newQuiz, ...activeQuizzes]);
    setSuccessMessage(`AI quiz for "${generatedQuiz.sopTitle}" approved and saved as Active.`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setGeneratedQuiz(null);
    setSelectedSopTitle('');
  };

  // SOP documents list
  const sopDocs = documents.filter(d => d.type === 'SOP');

  return (
    <div className="flex flex-col gap-3">
      {/* Premium Header */}
      <div className="flex justify-between align-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
        <div>
          <span className="badge badge-success" style={{ textTransform: 'none', fontSize: '0.7rem' }}>
            Module 8: Competency Hub
          </span>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0 0' }}>
            Staff Training & Accreditation Competency
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Map training credentials, track statutory certification expiries (BLS/ACLS), and automatically generate AI quizzes from SOPs.
          </p>
        </div>
        <button
          onClick={() => setActiveSubTab('log')}
          className="btn btn-primary"
        >
          <Plus size={16} /> Log Training Session
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="tabs-container" style={{ margin: 0 }}>
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`tab-btn ${activeSubTab === 'matrix' ? 'active' : ''}`}
        >
          <Grid size={14} style={{ marginRight: '4px' }} /> Training Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('log')}
          className={`tab-btn ${activeSubTab === 'log' ? 'active' : ''}`}
        >
          <Calendar size={14} style={{ marginRight: '4px' }} /> Training Logs
        </button>
        <button
          onClick={() => setActiveSubTab('scorecard')}
          className={`tab-btn ${activeSubTab === 'scorecard' ? 'active' : ''}`}
        >
          <Award size={14} style={{ marginRight: '4px' }} /> Completion Scorecard
        </button>
        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`tab-btn ${activeSubTab === 'certificates' ? 'active' : ''}`}
        >
          <FileBadge size={14} style={{ marginRight: '4px' }} /> Certificates Log
        </button>
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`tab-btn ${activeSubTab === 'quiz' ? 'active' : ''}`}
        >
          <Sparkles size={14} style={{ marginRight: '4px' }} /> AI Quiz Generator
        </button>
      </div>

      {/* Success alert banner */}
      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Training Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mandatory Staff Training Requirements (Matrix Grid)</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Accreditation Course / SOP</th>
                  <th style={{ textAlign: 'center' }}>Doctors</th>
                  <th style={{ textAlign: 'center' }}>Nursing Staff</th>
                  <th style={{ textAlign: 'center' }}>Pharmacy Dept</th>
                  <th style={{ textAlign: 'center' }}>Housekeeping</th>
                  <th style={{ textAlign: 'center' }}>Admin Staff</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{row.course}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.doctor === 'Mandatory' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{row.doctor}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.nurse === 'Mandatory' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{row.nurse}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.pharmacy === 'Mandatory' ? 'badge-danger' : row.pharmacy === 'Optional' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{row.pharmacy}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.housekeeper === 'Mandatory' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{row.housekeeper}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.admin === 'Mandatory' ? 'badge-danger' : row.admin === 'Optional' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{row.admin}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Log Training / List */}
      {activeSubTab === 'log' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Form */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem' }}>Log Training Session</h3>
            <form onSubmit={handleLogTrainingSubmit} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="form-label">Topic / SOP Covered *</label>
                <input
                  type="text"
                  placeholder="WHO 5 Moments of Hand Hygiene"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="form-control"
                  >
                    <option>Quality Control</option>
                    <option>Pharmacy</option>
                    <option>Emergency</option>
                    <option>OT</option>
                    <option>Housekeeping</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-control"
                  >
                    <option>Nurse</option>
                    <option>Doctor</option>
                    <option>Pharmacist</option>
                    <option>Housekeeper</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Session Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attendees (Comma separated) *</label>
                <textarea
                  rows={2}
                  placeholder="Sister Gracy, Priya Sharma, Aarav Sharma"
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  required
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link to Compliance Policy</label>
                <select
                  value={mappedPolicyId}
                  onChange={(e) => setMappedPolicyId(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- None --</option>
                  {complianceFlows.map(flow => (
                    <option key={flow.id} value={flow.id}>{flow.name}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: '0.2rem', display: 'block' }}>
                  💡 Linking auto-completes the "Training" lifecycle step.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Log Training Record
              </button>
            </form>
          </div>

          {/* List */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem' }}>Session Log Register</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trainings.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '2rem 0' }}>No sessions logged yet.</p>
              ) : (
                trainings.map(session => (
                  <div key={session.id} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>{session.topic}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Dept: <strong>{session.department}</strong> | Role: {session.role} | 📅 {session.date}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                        <strong>Attendees:</strong> {session.attendees.join(', ')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Pass: {session.passRate}%
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Quiz: {session.quizRef}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Scorecard */}
      {activeSubTab === 'scorecard' && (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.25rem' }}>Departmental Competency Scorecards</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'semibold', marginBottom: '0.25rem' }}>
                  <span>Quality Control Dept</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>90% Completion</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-success)', height: '100%', width: '90%', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'semibold', marginBottom: '0.25rem' }}>
                  <span>Emergency Wing</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>88% Completion</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-success)', height: '100%', width: '88%', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'semibold', marginBottom: '0.25rem' }}>
                  <span>Pharmacy Dept</span>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>80% Completion</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-warning)', height: '100%', width: '80%', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'semibold', marginBottom: '0.25rem' }}>
                  <span>OT / Sterile Units</span>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>75% Completion</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-warning)', height: '100%', width: '75%', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'semibold', marginBottom: '0.25rem' }}>
                  <span>Housekeeping & Waste segregation</span>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>68% Completion</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-danger)', height: '100%', width: '68%', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Key Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <p>
                ⚠️ <strong>Housekeeping segregations</strong> are lagging due to language barriers on clinical SOPs. Suggesting visual poster aids.
              </p>
              <p>
                ✔️ <strong>Emergency & ICU staff</strong> scored 100% in recent BLS checklists.
              </p>
              <p>
                💡 Generating AI quizzes based on standard SOPs is recommended for departments scoring below 80% to audit gaps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Certificates Log */}
      {activeSubTab === 'certificates' && (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Statutory Certification Expiry Trackers</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Track ACLS, BLS, and Fire safety induction dates for audits.</p>
            </div>
            <button
              onClick={() => setShowAddCertModal(true)}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              <Plus size={14} /> Upload Certification
            </button>
          </div>

          {showAddCertModal && (
            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '600px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>Record New Certificate</h3>
              <form onSubmit={handleAddCertSubmit} className="flex flex-col gap-3">
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Staff Name *</label>
                    <input
                      type="text"
                      required
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      className="form-control"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                      placeholder="Sister Gracy"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Certificate Type *</label>
                    <select
                      value={certForm.type}
                      onChange={(e) => setCertForm({ ...certForm, type: e.target.value })}
                      className="form-control"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <option>BLS Certification</option>
                      <option>ACLS Certification</option>
                      <option>Fire Safety Induction</option>
                    </select>
                  </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Issue Date</label>
                    <input
                      type="date"
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      className="form-control"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={certForm.expiryDate}
                      onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                      className="form-control"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCertModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  >
                    Save Certificate
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Certificate Type</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 'bold' }} className="flex align-center gap-1">
                      <UserCheck size={14} color="var(--text-tertiary)" /> {c.name}
                    </td>
                    <td>{c.type}</td>
                    <td>{c.issueDate}</td>
                    <td>{c.expiryDate}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                        c.status === 'Valid' ? 'badge-success' :
                        c.status === 'Expiring Soon' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: AI Quiz Generator */}
      {activeSubTab === 'quiz' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }} className="flex align-center gap-1">
              <Sparkles className="text-gradient" size={18} /> Generate SOP Competency Quiz
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select an approved Hospital SOP. The Copilot will automatically analyze the procedures and generate a 5-question multiple-choice staff evaluation.
            </p>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Approved SOP *</label>
              <select
                value={selectedSopTitle}
                onChange={(e) => setSelectedSopTitle(e.target.value)}
                className="form-control"
                style={{ padding: '0.5rem', fontSize: '0.75rem' }}
              >
                <option value="">-- Choose SOP --</option>
                {sopDocs.length === 0 ? (
                  <>
                    <option>Biomedical Segregation SOP (BWM)</option>
                    <option>High Alert Lockbox Procedures (MSP)</option>
                    <option>Prescription Writing Guidelines (MSP)</option>
                  </>
                ) : (
                  sopDocs.map(d => (
                    <option key={d.id} value={d.title}>{d.title}</option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={!selectedSopTitle}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.6rem' }}
            >
              <Sparkles size={14} /> Auto-Generate MCQ Evaluation
            </button>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Active Assessments:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {activeQuizzes.map(qz => (
                  <div key={qz.id} className="flex justify-between align-center" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{qz.sopTitle}</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Generated by {qz.author} • {qz.questionsCount} Qs</div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      {qz.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Display Block */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }} className="flex align-center gap-1">
              <HelpCircle size={18} /> Assessment Draft Sheet
            </h2>

            {!generatedQuiz ? (
              <div style={{ height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1.5px dashed var(--border-color)', borderRadius: '10px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                <BookOpen size={24} color="var(--text-tertiary)" style={{ marginBottom: '6px' }} />
                <p>No quiz generated yet. Select an SOP on the left to begin.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-warning)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.75rem', margin: 0 }} className="flex align-center gap-1">
                    ⚠️ AI-Generated Evaluation - Authorized Sign Off Mandatory
                  </h4>
                  <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>
                    Review the draft questions below. Enter clinical supervisor verification code (PIN: 1234) to deploy the quiz.
                  </p>
                  
                  <div className="flex gap-2 align-center">
                    <input
                      type="password"
                      placeholder="Verification PIN"
                      value={quizPin}
                      onChange={(e) => setQuizPin(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.75rem', padding: '0.45rem', width: '160px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    />
                    <button
                      onClick={handleApproveQuiz}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      Sign & Deploy
                    </button>
                  </div>
                  {quizPinError && <p style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 'bold', margin: 0 }}>{quizPinError}</p>}
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', margin: 0 }}>
                    Competency Quiz for: {generatedQuiz.sopTitle}
                  </h3>
                  {generatedQuiz.questions.map(q => (
                    <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '0.75rem', margin: 0 }}>Q{q.id}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{
                            padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.7rem',
                            backgroundColor: oIdx === q.correctAnswer ? 'var(--bg-success)' : 'var(--bg-secondary)',
                            color: oIdx === q.correctAnswer ? 'var(--color-success)' : 'var(--text-primary)',
                            fontWeight: oIdx === q.correctAnswer ? 'bold' : 'normal'
                          }}>
                            {opt} {oIdx === q.correctAnswer && "✓ (Correct Answer)"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
