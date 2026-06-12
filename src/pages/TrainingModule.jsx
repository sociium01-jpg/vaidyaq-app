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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-emerald-950 p-6 rounded-2xl border border-emerald-900/30 text-white shadow-xl">
        <div>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-medium">
            Module 8: Competency Hub
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 flex items-center gap-2">
            Staff Training & Accreditation Competency
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Map training credentials, track statutory certification expiries (BLS/ACLS), and automatically generate AI quizzes from SOPs.
          </p>
        </div>
        <button
          onClick={() => setActiveSubTab('log')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-950"
        >
          <Plus size={16} /> Log Training Session
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'matrix' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid size={16} /> Training Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('log')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'log' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={16} /> Training Logs
        </button>
        <button
          onClick={() => setActiveSubTab('scorecard')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'scorecard' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award size={16} /> Completion Scorecard
        </button>
        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'certificates' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileBadge size={16} /> Certificates Log
        </button>
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'quiz' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={16} /> AI Quiz Generator
        </button>
      </div>

      {/* Success alert banner */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Training Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 dark:text-white mb-4">Mandatory Staff Training Requirements (Matrix Grid)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pr-4">Accreditation Course / SOP</th>
                  <th className="pb-3 text-center">Doctors</th>
                  <th className="pb-3 text-center">Nursing Staff</th>
                  <th className="pb-3 text-center">Pharmacy Dept</th>
                  <th className="pb-3 text-center">Housekeeping</th>
                  <th className="pb-3 text-center">Admin Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matrixData.map((row, idx) => (
                  <tr key={idx} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950/40">
                    <td className="py-4 font-semibold text-slate-950 dark:text-white">{row.course}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${row.doctor === 'Mandatory' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold' : 'text-slate-400'}`}>{row.doctor}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${row.nurse === 'Mandatory' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold' : 'text-slate-400'}`}>{row.nurse}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${row.pharmacy === 'Mandatory' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold' : row.pharmacy === 'Optional' ? 'bg-slate-100 text-slate-650' : 'text-slate-450'}`}>{row.pharmacy}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${row.housekeeper === 'Mandatory' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold' : 'text-slate-400'}`}>{row.housekeeper}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${row.admin === 'Mandatory' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold' : row.admin === 'Optional' ? 'bg-slate-100 text-slate-650' : 'text-slate-450'}`}>{row.admin}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-fit">
            <h3 className="font-bold text-slate-950 dark:text-white text-base mb-4">Log Training Session</h3>
            <form onSubmit={handleLogTrainingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / SOP Covered *
                </label>
                <input
                  type="text"
                  placeholder="WHO 5 Moments of Hand Hygiene"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-250 dark:border-slate-800 px-3 py-2 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs rounded-lg border px-2 py-2 bg-slate-50 dark:bg-slate-950"
                  >
                    <option>Quality Control</option>
                    <option>Pharmacy</option>
                    <option>Emergency</option>
                    <option>OT</option>
                    <option>Housekeeping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs rounded-lg border px-2 py-2 bg-slate-50 dark:bg-slate-950"
                  >
                    <option>Nurse</option>
                    <option>Doctor</option>
                    <option>Pharmacist</option>
                    <option>Housekeeper</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs rounded-lg border px-3 py-2 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendees (Comma separated) *
                </label>
                <textarea
                  rows={2}
                  placeholder="Sister Gracy, Priya Sharma, Aarav Sharma"
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border px-3 py-2 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Compliance Policy
                </label>
                <select
                  value={mappedPolicyId}
                  onChange={(e) => setMappedPolicyId(e.target.value)}
                  className="w-full text-xs rounded-lg border px-2 py-2 bg-slate-50 dark:bg-slate-950"
                >
                  <option value="">-- None --</option>
                  {complianceFlows.map(flow => (
                    <option key={flow.id} value={flow.id}>{flow.name}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                  💡 Linking auto-completes the "Training" lifecycle step.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-lg transition bg-emerald-600"
              >
                Log Training Record
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Session Log Register</h3>
              <div className="space-y-3">
                {trainings.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-6">No sessions logged yet.</p>
                ) : (
                  trainings.map(session => (
                    <div key={session.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-950 dark:text-white text-sm">{session.topic}</h4>
                        <p className="text-xs text-slate-500">
                          Dept: <span className="font-semibold text-slate-700 dark:text-slate-300">{session.department}</span> | Role: {session.role} | 📅 {session.date}
                        </p>
                        <p className="text-xs text-slate-650 dark:text-slate-400 font-mono">
                          <strong>Attendees:</strong> {session.attendees.join(', ')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="bg-emerald-50 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">
                          Pass: {session.passRate}%
                        </span>
                        <p className="text-[10px] text-slate-400">Quiz Ref: {session.quizRef}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Scorecard */}
      {activeSubTab === 'scorecard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm md:col-span-2 space-y-6">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Departmental Competency Scorecards</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Quality Control Dept</span>
                  <span className="text-emerald-650">90% Completion</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Emergency Wing</span>
                  <span className="text-emerald-650">88% Completion</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Pharmacy Dept</span>
                  <span className="text-amber-500">80% Completion</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>OT / Sterile Units</span>
                  <span className="text-amber-500">75% Completion</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Housekeeping & Waste segregation</span>
                  <span className="text-red-500">68% Completion</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Insights</h3>
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-450">
              <p>
                ⚠️ **Housekeeping segregations** are lagging due to language barriers on clinical SOPs. Suggesting visual poster aids.
              </p>
              <p>
                ✔️ **Emergency & ICU staff** scored 100% in recent BLS checklists.
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Statutory Certification Expiry Trackers</h2>
              <p className="text-xs text-slate-500">Track ACLS, BLS, and Fire safety induction dates for audits.</p>
            </div>
            <button
              onClick={() => setShowAddCertModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
            >
              <Plus size={14} /> Upload Certification
            </button>
          </div>

          {showAddCertModal && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record New Certificate</h3>
              <form onSubmit={handleAddCertSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Staff Name *</label>
                  <input
                    type="text"
                    required
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    className="w-full text-xs rounded border p-2"
                    placeholder="Sister Gracy"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Certificate Type *</label>
                  <select
                    value={certForm.type}
                    onChange={(e) => setCertForm({ ...certForm, type: e.target.value })}
                    className="w-full text-xs rounded border p-2"
                  >
                    <option>BLS Certification</option>
                    <option>ACLS Certification</option>
                    <option>Fire Safety Induction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full text-xs rounded border p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={certForm.expiryDate}
                    onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                    className="w-full text-xs rounded border p-2"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCertModal(false)}
                    className="px-3 py-1.5 text-xs border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white font-semibold text-xs px-4 py-1.5 rounded hover:bg-emerald-700 transition"
                  >
                    Save Certificate
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Staff Member</th>
                  <th className="pb-3">Certificate Type</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3">Expiry Date</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certs.map(c => (
                  <tr key={c.id} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UserCheck size={14} className="text-slate-400" /> {c.name}
                    </td>
                    <td className="py-3">{c.type}</td>
                    <td className="py-3">{c.issueDate}</td>
                    <td className="py-3">{c.expiryDate}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Valid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        c.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={18} /> Generate SOP Competency Quiz
            </h2>
            <p className="text-xs text-slate-500">
              Select an approved Hospital SOP. The Copilot will automatically analyze the procedures and generate a 5-question multiple-choice staff evaluation.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Approved SOP *
              </label>
              <select
                value={selectedSopTitle}
                onChange={(e) => setSelectedSopTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-2"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition"
            >
              <Sparkles size={14} /> Auto-Generate MCQ Evaluation
            </button>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-2">Active Assessments:</h4>
              <div className="space-y-1.5">
                {activeQuizzes.map(qz => (
                  <div key={qz.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-slate-950 dark:text-white">{qz.sopTitle}</span>
                      <p className="text-[10px] text-slate-500">Generated by {qz.author} | {qz.questionsCount} Qs</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                      {qz.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Display Block */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="text-emerald-500" size={18} /> Assessment Draft Sheet
            </h2>

            {!generatedQuiz ? (
              <div className="h-64 flex flex-col justify-center items-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 p-6">
                <BookOpen size={24} className="text-slate-300 mb-2" />
                <p className="text-xs">No quiz generated yet. Select an SOP on the left to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-300 p-3.5 rounded-xl space-y-2">
                  <h4 className="font-semibold text-xs flex items-center gap-1.5">
                    ⚠️ AI-Generated Evaluation - Authorized Sign Off Mandatory
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Review the draft questions below. Enter clinical supervisor verification code (PIN: 1234) to deploy the quiz.
                  </p>
                  
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="password"
                      placeholder="Verification PIN"
                      value={quizPin}
                      onChange={(e) => setQuizPin(e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 w-44"
                    />
                    <button
                      onClick={handleApproveQuiz}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded transition"
                    >
                      Sign & Deploy
                    </button>
                  </div>
                  {quizPinError && <p className="text-[10px] text-red-500 font-semibold mt-1">{quizPinError}</p>}
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 max-h-96 overflow-y-auto">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white border-b pb-1.5">
                    Competency Quiz for: {generatedQuiz.sopTitle}
                  </h3>
                  {generatedQuiz.questions.map(q => (
                    <div key={q.id} className="space-y-1.5 text-xs border-b pb-2 last:border-0 last:pb-0">
                      <p className="font-semibold text-slate-900 dark:text-white">Q{q.id}. {q.question}</p>
                      <div className="grid grid-cols-1 gap-1 pl-2.5">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-1.5 rounded border ${oIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 font-medium' : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-850'}`}>
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
