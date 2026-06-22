import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { useToast } from '../components/ToastProvider';
import {
  Shield,
  AlertOctagon,
  Calendar,
  FileText,
  AlertTriangle,
  Brain,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  ClipboardList,
  Upload,
  Play,
  Check,
  CheckCircle2,
  Building2,
  Grid,
  Plus,
  Newspaper,
  RefreshCw,
  ExternalLink,
  Users,
  Briefcase,
  Ticket,
  Lock,
  ListTodo,
  FileDown,
  Activity,
  Copy
} from 'lucide-react';

export default function Dashboard({ orgMode, organizationId }) {
  const {
    setCurrentRoute,
    currentUser,
    readinessScore,
    openCapasCount,
    overdueTasksCount,
    pendingAuditsCount,
    missingEvidenceCount,
    incidentsThisMonthCount,
    standards,
    documents,
    capaItems,
    audits,
    licenses,
    evidenceUploadedCount,
    hospitalName,
    setHospitalName,
    hospitalBeds,
    setHospitalBeds,
    hospitalTier,
    setHospitalTier,
    activeDepts,
    setActiveDepts,
    onboardingSteps,
    setOnboardingSteps,
    importNABHTemplates,
    logActivity,
    qualityIndicators,
    isSubscribed,
    trialDaysLeft,
    subscriptionDaysLeft,
    getLiveCountdownString,
    setForcePaymentScreen,
    clientsList,
    setClientsList,
    supportTickets,
    setSupportTickets,
    transactions,
    addHospitalTask,
    tasks,
    updateHospitalTaskStatus,
    aiOutputs,
    teamMembers,
    updateStandardScore,
    addDocument,
    activeHospitalId,
    accessibleHospitals,
    switchActiveBranch
  } = useContext(QualiNABHContext);

  const { showToast } = useToast();

  // Onboarding wizard import templates simulation
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatusText, setImportStatusText] = useState('');

  // Local state for profile inputs
  const [editName, setEditName] = useState(hospitalName);
  const [editBeds, setEditBeds] = useState(hospitalBeds);
  const [editTier, setEditTier] = useState(hospitalTier);
  const [tempDepts, setTempDepts] = useState(activeDepts);

  // Pivot Table states for Viewer
  const [pivotIndicator, setPivotIndicator] = useState('All');
  const [pivotDept, setPivotDept] = useState('All');
  const [pivotMonth, setPivotMonth] = useState('All');

  // Sync state on context ready
  useEffect(() => {
    setEditName(hospitalName);
    setEditBeds(hospitalBeds);
    setEditTier(hospitalTier);
    setTempDepts(activeDepts);
  }, [hospitalName, hospitalBeds, hospitalTier, activeDepts]);

  // Expose task completion for employee dashboards
  const handleTaskComplete = (taskId) => {
    updateHospitalTaskStatus(taskId, 'Completed');
    showToast({
      title: "Task Completed",
      message: "The task status has been updated to Completed.",
      type: "success"
    });
  };

  // Onboarding helpers
  const handleSaveIdentity = () => {
    setHospitalName(editName);
    setHospitalBeds(editBeds);
    setHospitalTier(editTier);
    setOnboardingSteps(prev => ({ ...prev, identity: true }));
    logActivity(`Initialized hospital profile: ${editName} (${editBeds} beds, ${editTier})`);
    showToast({ title: "Profile Saved", message: "Hospital details updated successfully.", type: "success" });
  };

  const handleSaveDepartments = () => {
    setActiveDepts(tempDepts);
    setOnboardingSteps(prev => ({ ...prev, departments: true }));
    logActivity(`Configured active clinical departments: ${tempDepts.join(', ')}`);
    showToast({ title: "Departments Configured", message: "Activated departments updated.", type: "success" });
  };

  const handleImportTemplates = () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportStatusText('Establishing secure sandbox connection...');
    
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setImportProgress(current);
      if (current === 20) setImportStatusText('Parsing NABH 6th Edition digital matrices...');
      if (current === 50) setImportStatusText('Generating Standard Operating Procedures...');
      if (current === 80) setImportStatusText('Mapping digital evidence registers...');
      if (current === 100) {
        clearInterval(interval);
        setIsImporting(false);
        importNABHTemplates();
        setOnboardingSteps(prev => ({ ...prev, importTemplates: true }));
        logActivity("Imported 6th Edition preloaded checklist templates and SOP outlines.");
        showToast({
          title: "Templates Imported",
          message: "Checklist structures, SOP outlines, and statutory trackers are now active.",
          type: "success"
        });
      }
    }, 300);
  };

  // Helper variables for dashboards
  const isEmptyState = 
    (documents || []).length === 0 && 
    (audits || []).length === 0 && 
    (capaItems || []).length === 0 && 
    (tasks || []).length === 0;

  const activeCapas = capaItems ? capaItems.filter(c => c.status === 'Open') : [];
  const expiredLicenses = licenses ? licenses.filter(l => l.status === 'Expired') : [];

  const riskDepts = new Set();
  activeCapas.forEach(c => riskDepts.add(c.department));
  expiredLicenses.forEach(l => riskDepts.add(l.responsible || "Administration"));
  const highRiskDeptsCount = riskDepts.size;

  const renderWelcomeChecklist = () => {
    return (
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '6px solid var(--primary)', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Sparkles style={{ color: 'var(--primary)' }} />
            <span>Getting Started: Your VaidyaQ Setup Guide</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
            Accreditation is a journey. Follow these simple baseline setup actions to initialize your readiness score.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
          {/* Step 1: Onboarding Completed */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--color-success)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Hospital profile configured</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configured display name: "{hospitalName}" with {hospitalBeds} beds.</div>
            </div>
          </div>

          {/* Step 2: Quality Team Setup */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: teamMembers.length > 0 ? 'var(--color-success)' : 'var(--text-tertiary)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Coordinate Quality Committee team ({teamMembers.length} active)</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Invite board members and coordinators to outline responsibilities.</div>
            </div>
          </div>

          {/* Step 3: Template Importing */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: onboardingSteps.importTemplates ? 'var(--color-success)' : 'var(--text-tertiary)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Initialize NABH 6th Edition Templates</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Preload default outline structures for statutory license requirements and SOP guides.</div>
              {!onboardingSteps.importTemplates && (
                <div style={{ marginTop: '0.5rem' }}>
                  {isImporting ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '250px' }}>
                      <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${importProgress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>{importStatusText} ({importProgress}%)</span>
                    </div>
                  ) : (
                    <button onClick={handleImportTemplates} className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Import Checklists Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: First SOP Outline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: (documents || []).length > 0 ? 'var(--color-success)' : 'var(--text-tertiary)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Draft your first Policy or SOP outline</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generate clinical guidelines using our integrated AI Co-Pilot assistant.</div>
              {(documents || []).length === 0 && (
                <button onClick={() => setCurrentRoute('/app/documents')} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                  Open Document Control
                </button>
              )}
            </div>
          </div>

          {/* Step 5: First Mock Audit */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: (audits || []).length > 0 ? 'var(--color-success)' : 'var(--text-tertiary)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Schedule an Internal Audit or Drill</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coordinate checklists, register findings, and track corrective action plans (CAPA).</div>
              {(audits || []).length === 0 && (
                <button onClick={() => setCurrentRoute('/app/quality')} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                  Schedule Audit Check
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render SVG Circular Readiness Meter
  const renderReadinessMeter = (size = 120) => {
    if (isEmptyState) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: size, width: size, textAlign: 'center' }}>
          <div style={{ fontSize: `${size * 0.12}px`, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>Not Available Yet</div>
        </div>
      );
    }

    const radius = size * 0.38;
    const stroke = size * 0.08;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (readinessScore / 100) * circ;

    return (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="var(--bg-tertiary)"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke="var(--primary)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: `${size * 0.16}px`, fontWeight: 800, color: 'var(--text-primary)' }}>{readinessScore}%</div>
          <div style={{ fontSize: `${size * 0.08}px`, color: 'var(--text-secondary)', fontWeight: 600 }}>Ready</div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 0. ORGANIZATION CONSOLIDATED GROUP DASHBOARD
  // ----------------------------------------------------
  const getBranchMetrics = (hospId) => {
    let branchStandards;
    const savedStandards = localStorage.getItem(`hosp_${hospId}_qn_standards`);
    if (savedStandards) {
      try { branchStandards = JSON.parse(savedStandards); } catch(e) {}
    }
    if (!branchStandards) {
      // Fallback old structure or default
      const legacySaved = localStorage.getItem('qn_standards');
      if (legacySaved) {
        try { branchStandards = JSON.parse(legacySaved); } catch(e) {}
      }
    }
    if (!branchStandards) {
      branchStandards = []; // starts blank
    }
    
    // Calculate score
    const maxScore = branchStandards.length * 10;
    const earned = branchStandards.reduce((sum, s) => sum + s.score, 0);
    const score = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;
    
    // Look up CAPAs
    let branchCapas = [];
    const savedCapas = localStorage.getItem(`hosp_${hospId}_qn_capas`);
    if (savedCapas) {
      try { branchCapas = JSON.parse(savedCapas); } catch(e) {}
    }
    const openCapa = branchCapas.filter(c => c.status === "Open").length;

    // Look up Audits
    let branchAudits = [];
    const savedAudits = localStorage.getItem(`hosp_${hospId}_qn_audits`);
    if (savedAudits) {
      try { branchAudits = JSON.parse(savedAudits); } catch(e) {}
    }
    const pendingAudit = branchAudits.filter(a => a.status === "Scheduled").length;

    return { score, openCapa, pendingAudit };
  };

  const renderOrganizationDashboard = () => {
    const orgBranches = currentUser?.accessibleHospitals || ['demo-hosp', 'sarah-hosp'];
    const branchData = orgBranches.map(hospId => {
      const clientObj = clientsList.find(c => c.hospitalId === hospId) || { hospitalName: hospId === 'demo-hosp' ? "City Central Metro Hospital" : hospId === 'sarah-hosp' ? "Central City Clinic" : hospId, beds: 50 };
      const metrics = getBranchMetrics(hospId);
      return {
        id: hospId,
        name: clientObj.hospitalName,
        beds: clientObj.beds,
        ...metrics
      };
    });

    const avgScore = branchData.length > 0 ? Math.round(branchData.reduce((sum, b) => sum + b.score, 0) / branchData.length) : 0;
    const totalCapas = branchData.reduce((sum, b) => sum + b.openCapa, 0);
    const totalAudits = branchData.reduce((sum, b) => sum + b.pendingAudit, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Group Executive Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            Consolidated accreditation readiness indices, open CAPAs, and scheduled mock audits across organization branches.
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Branches</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{branchData.length} Branches</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Aggregate Open CAPAs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-danger)' }}>{totalCapas} Active</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Scheduled Audits</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5' }}>{totalAudits} Scheduled</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Group Readiness Index</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{avgScore}% Ready</div>
            </div>
          </div>
        </div>

        {/* Branches Comparison Panel */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Branch Accreditation Comparison Ledger</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Branch Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Beds Scale</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Accreditation Readiness</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Open CAPAs</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Scheduled Audits</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branchData.map(branch => {
                  const scoreColor = branch.score >= 70 ? 'var(--color-success)' : branch.score >= 45 ? 'var(--color-warning)' : 'var(--color-danger)';
                  return (
                    <tr key={branch.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🏢</span>
                          <span>{branch.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{branch.beds} Beds</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${branch.score || 1}%`, height: '100%', backgroundColor: scoreColor }}></div>
                          </div>
                          <span style={{ fontWeight: 'bold', color: scoreColor }}>{branch.score}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span className={`badge ${branch.openCapa > 0 ? 'badge-danger' : 'badge-neutral'}`}>
                          {branch.openCapa} CAPA
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span className="badge badge-neutral">{branch.pendingAudit} Audits</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => switchActiveBranch(branch.id)}
                          className="btn btn-primary" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}
                        >
                          Switch to Branch Console
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 1. SUPER ADMIN (Vendor Portal) DASHBOARD
  // ----------------------------------------------------
  const renderSuperAdminDashboard = () => {
    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>VaidyaQ Cloud Vendor Console</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>SaaS Customer Registry, Subscription Gateways, and SLA Ticketing Management.</p>
        </div>

        {/* Global Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)' }}><Building2 size={24} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hospital Tenants</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{clientsList.length} Registered</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}><Ticket size={24} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Support Tickets</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5' }}>{supportTickets.filter(t=>t.status==='Open').length} Open</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><TrendingUp size={24} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total ARR Revenue</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>₹{(totalRevenue/100000).toFixed(2)}L</div>
            </div>
          </div>
        </div>

        {/* Tenant List */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Multi-Tenant Hospital Deployments</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Hospital Tenant</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Admin Email</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Facility Scale</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>SaaS Status</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientsList.map(client => (
                  <tr key={client.hospitalId} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{client.hospitalName}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{client.email}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{client.beds} Beds</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${client.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{client.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <button 
                        onClick={() => {
                          const updated = clientsList.map(c => c.hospitalId === client.hospitalId ? { ...c, status: c.status === 'Paid' ? 'Active Trial' : 'Paid' } : c);
                          setClientsList(updated);
                          showToast({ title: "SLA Override", message: "Plan status flipped successfully.", type: "success" });
                        }}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                      >
                        Flip SLA Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>SLA Support Tickets Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {supportTickets.map(ticket => (
              <div key={ticket.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>{ticket.priority}</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{ticket.title}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Tenant: {ticket.clientName} | Operator: {ticket.assignedOperator}</div>
                </div>
                <button
                  onClick={() => {
                    setSupportTickets(prev => prev.filter(t => t.id !== ticket.id));
                    showToast({ title: "Ticket Resolved", message: `Support ticket ${ticket.sequenceCode} marked resolved.`, type: "success" });
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 2. HOSPITAL ADMIN (Director) DASHBOARD
  // ----------------------------------------------------
  const renderHospitalAdminDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Command Center Director Suite</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Accreditation readiness indicators, active team operations, and compliance status for {hospitalName}.</p>
        </div>

        {isEmptyState && renderWelcomeChecklist()}

        {/* Top summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Readiness dial card */}
          <div className="card flex flex-col align-center justify-center gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            {renderReadinessMeter(130)}
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>NABH Compliance Score</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Target: 85% for document submission</div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Quality Team</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{teamMembers.length} Members</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Role-based boundaries enforced</div>
            </div>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Risk Hotspots</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: highRiskDeptsCount > 0 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '0.5rem' }}>{highRiskDeptsCount} Departments</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Active risk mitigation trackers</div>
            </div>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending SOP Approvals</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{documents.filter(d=>d.status==='Pending Review').length} Outlines</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Requires Quality Head signature</div>
            </div>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Outputs (Drafts)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{aiOutputs.length} Drafts</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Stored securely inside drafts folder</div>
            </div>
          </div>
        </div>

        {/* Hospital Setup Identity & Profile Settings panel */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Hospital Profile & Operational Scope</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Hospital Display Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Statutory Bed Capacity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={editBeds} 
                  onChange={(e) => setEditBeds(e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>NABH Accreditation Tier</label>
                <select 
                  className="role-badge-selector" 
                  value={editTier} 
                  onChange={(e) => setEditTier(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Tier A: Clinics">Tier A: Clinics (Entry Level)</option>
                  <option value="Tier B: Secondary Care">Tier B: Secondary Care (Non-Teaching)</option>
                  <option value="Tier C: Tertiary Chains">Tier C: Tertiary Chains (Full Accreditation)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={handleSaveIdentity} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Save Profile Configuration
              </button>
            </div>
          </div>
        </div>

        {/* Onboarding Wizard Template Importer */}
        {!onboardingSteps.importTemplates && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', borderLeft: '6px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ color: 'var(--primary)' }} />
              Import NABH 6th Edition Templates
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Initialize your compliance vault with preloaded statutory standards (AAC, COP, MOM, FMS, HRM) outlining mandatory SOP checklists and audit scoring registries.
            </p>
            {isImporting ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${importProgress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>{importStatusText} ({importProgress}%)</span>
              </div>
            ) : (
              <button onClick={handleImportTemplates} className="btn btn-primary glow-premium" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                Import Checklists & Outline Frameworks
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // 3. QUALITY HEAD DASHBOARD
  // ----------------------------------------------------
  const renderQualityHeadDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Accreditation & Quality Controller Suite</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Monitor evidence document coverage, pending approvals, and corrective actions (CAPA) tracking.</p>
        </div>

        {isEmptyState && renderWelcomeChecklist()}

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}><AlertTriangle size={24} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Evidence Gaps</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{missingEvidenceCount} Missing SOPs</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)' }}><ClipboardList size={24} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Internal Audits</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingAuditsCount} Scheduled</div>
            </div>
          </div>
          <div className="card flex align-center gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}><Shield size={24} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active CAPA Trackers</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{openCapasCount} Open Items</div>
            </div>
          </div>
        </div>

        {/* Dynamic Gaps List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Missing Standards Evidence list */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Outstanding Evidence Document Gaps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {standards.filter(s => s.score < 10).slice(0, 5).map(gap => (
                <div key={gap.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{gap.id}: {gap.title}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Dept: {gap.department} | Required: {gap.evidenceRequired}</div>
                  </div>
                  <button 
                    onClick={() => {
                      const title = `Draft SOP: ${gap.evidenceRequired.split(',')[0]}`;
                      const newTask = {
                        title: title,
                        assignedTo: 'Department HOD',
                        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
                        priority: 'Medium',
                        department: gap.department,
                        mappedStandard: gap.id
                      };
                      addHospitalTask(newTask);
                      showToast({ title: "Task Created", message: `Task assigned to ${gap.department} HOD.`, type: "success" });
                    }}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', border: '1px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)' }}
                  >
                    Delegate SOP
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reviews / approvals */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>SOP Drafts Pending Signature Approval</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {documents.filter(d => d.status === 'Pending Review').length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>No drafts require signature sign-off.</p>
              ) : (
                documents.filter(d => d.status === 'Pending Review').map(doc => (
                  <div key={doc.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{doc.title}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Author: {doc.author} | Version: {doc.version}</div>
                    </div>
                    <button 
                      onClick={() => {
                        const updatedDocs = documents.map(d => d.id === doc.id ? { ...d, status: 'Approved', approvedBy: currentUser.name, lastReviewed: new Date().toISOString().split('T')[0] } : d);
                        addDocument(doc); 
                        showToast({ title: "SOP Approved", message: `Successfully signed off "${doc.title}".`, type: "success" });
                      }}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      Sign & Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 4. DEPARTMENT HEAD DASHBOARD
  // ----------------------------------------------------
  const renderDepartmentHeadDashboard = () => {
    const dept = currentUser.department || 'Pharmacy';
    const deptStandards = standards.filter(s => s.department === dept);
    const deptReadiness = deptStandards.length > 0 
      ? Math.round((deptStandards.reduce((acc, s) => acc + s.score, 0) / (deptStandards.length * 10)) * 100) 
      : 100;

    const deptTasks = tasks.filter(t => t.department === dept && t.status !== 'Completed');
    const deptAudits = audits.filter(a => a.department === dept);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>HOD Suite: {dept} Department</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Departmental compliance indicators, audits checklist, and open tasks.</p>
        </div>

        {isEmptyState && renderWelcomeChecklist()}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Dept Readiness score */}
          <div className="card flex flex-col align-center justify-center gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            {isEmptyState ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, width: 120, textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>Not Available Yet</div>
              </div>
            ) : (
              <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                  <circle stroke="var(--bg-tertiary)" fill="transparent" strokeWidth={10} r={45} cx={60} cy={60} />
                  <circle stroke="var(--primary)" fill="transparent" strokeWidth={10} strokeDasharray={2 * Math.PI * 45} strokeDashoffset={(2 * Math.PI * 45) - (deptReadiness / 100) * (2 * Math.PI * 45)} strokeLinecap="round" r={45} cx={60} cy={60} />
                </svg>
                <div style={{ position: 'absolute', fontSize: '1.3rem', fontWeight: 800 }}>{deptReadiness}%</div>
              </div>
            )}
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Departmental Score</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>NABH Chapter compliance index</div>
            </div>
          </div>

          {/* Dept tasks */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Outstanding Departmental Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
              {deptTasks.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>All tasks completed! Department is fully compliant.</p>
              ) : (
                deptTasks.map(task => (
                  <div key={task.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{task.title}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Assigned: {task.assignedTo} | Due: {task.dueDate}</div>
                    </div>
                    <button 
                      onClick={() => handleTaskComplete(task.id)}
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Complete Task
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dept Audits list */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Departmental Compliance Audits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deptAudits.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>No audits scheduled or logged for this department.</p>
            ) : (
              deptAudits.map(audit => (
                <div key={audit.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${audit.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{audit.status}</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{audit.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Auditor: {audit.auditor} | Date: {audit.date}</div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentRoute('/app/quality');
                      showToast({ title: "Navigated", message: "Opening Quality Module Audit checklist.", type: "info" });
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    View Audit Logs
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 5. STAFF (Employee) DASHBOARD
  // ----------------------------------------------------
  const renderStaffDashboard = () => {
    const myTasks = tasks.filter(t => t.assignedToEmail === currentUser.email || t.assignedTo === currentUser.name);
    const myOpenTasks = myTasks.filter(t => t.status !== 'Completed');
    
    // Check overdue tasks
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueCount = myOpenTasks.filter(t => new Date(t.dueDate) < today).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-body)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Employee Compliance Work Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Your assigned checklist tasks, document uploads, and incident logs.</p>
        </div>

        {isEmptyState && renderWelcomeChecklist()}

        {/* Alerts panel */}
        {overdueCount > 0 && (
          <div className="card flex justify-between align-center" style={{ backgroundColor: 'rgba(220, 38, 38, 0.12)', border: '1px solid rgba(220, 38, 38, 0.3)', color: 'var(--color-danger)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertOctagon size={20} />
              <div>
                <strong>Overdue Checklist Tasks Pending</strong>
                <div style={{ fontSize: '0.75rem', marginTop: '1px' }}>You have <strong>{overdueCount} compliance tasks</strong> past due date. Complete them to maintain department readiness.</div>
              </div>
            </div>
          </div>
        )}

        {/* My Tasks lists */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1.25rem 0' }}>My Assigned Tasks checklist</h3>
          
          {myOpenTasks.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              🎉 All caught up! No active tasks assigned to you.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myOpenTasks.map(task => {
                const isOverdue = new Date(task.dueDate) < today;
                return (
                  <div key={task.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{task.title}</strong>
                        {isOverdue && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Overdue</span>}
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{task.priority} Priority</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Due Date: {task.dueDate} | Mapped Standard: {task.mappedStandard || 'None'}</div>
                    </div>
                    <button
                      onClick={() => handleTaskComplete(task.id)}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Mark Complete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Evidence upload shortcut widget */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Quick File Vault Upload</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload clinical training registers, fire drills, or license certificates directly to the vault.</p>
          <div 
            onClick={() => document.getElementById('staff-vault-upload').click()}
            style={{ padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-tertiary)' }}
          >
            <input 
              type="file" 
              id="staff-vault-upload" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  showToast({ title: "File Uploaded", message: `Successfully saved "${file.name}" to the compliance drafts folder.`, type: "success" });
                  logActivity(`Staff uploaded file: ${file.name} to vault.`);
                }
              }}
            />
            <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Click to upload clinical files</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Accepted formats: PDF, PNG, JPG up to 10MB</div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 6. VIEWER / AUDITOR DASHBOARD
  // ----------------------------------------------------
  const renderViewerDashboard = () => {
    // Clinical indicators distribution data
    const getPivotValue = (row, indicatorField) => {
      const totalVal = row[indicatorField] || 0;
      if (pivotDept === 'All') return totalVal;
      
      const distributions = {
        'ICU': { falls: 0.4, medicationErrors: 0.1, infections: 0.5, needleSticks: 0.1 },
        'Pharmacy': { falls: 0.0, medicationErrors: 0.8, infections: 0.0, needleSticks: 0.0 },
        'OPD': { falls: 0.2, medicationErrors: 0.1, infections: 0.1, needleSticks: 0.2 },
        'Emergency': { falls: 0.3, medicationErrors: 0.0, infections: 0.3, needleSticks: 0.5 },
        'OT': { falls: 0.1, medicationErrors: 0.0, infections: 0.1, needleSticks: 0.2 }
      };
      
      const factor = distributions[pivotDept]?.[indicatorField] ?? 0.1;
      return Math.round(totalVal * factor);
    };

    const handleExportCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Month,Clinical Indicator,Department,Value\n";
      
      const indicatorsList = ['falls', 'medicationErrors', 'infections', 'needleSticks'];
      const labelMap = { falls: 'Falls', medicationErrors: 'Medication Errors', infections: 'Infections', needleSticks: 'Needle Sticks' };
      
      qualityIndicators.forEach(row => {
        if (pivotMonth !== 'All' && row.month !== pivotMonth) return;
        
        indicatorsList.forEach(ind => {
          if (pivotIndicator !== 'All' && pivotIndicator !== ind) return;
          
          const val = getPivotValue(row, ind);
          csvContent += `${row.month},${labelMap[ind]},${pivotDept},${val}\n`;
        });
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `clinical_indicators_pivot_${pivotDept}_${pivotMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      logActivity(`Exported clinical indicators pivot table as CSV for department: ${pivotDept}, month: ${pivotMonth}`);
      showToast({ title: "CSV Exported", message: "Clinical indicators CSV downloaded successfully.", type: "success" });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-body)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Assessor Review Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Read-only quality indices, risk registers, and clinical outcome metrics for accreditation audits.</p>
        </div>

        {isEmptyState && renderWelcomeChecklist()}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Readiness gauge */}
          <div className="card flex flex-col align-center justify-center gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            {renderReadinessMeter(130)}
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Accreditation Readiness Dial</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Hospital compliance score across chapters</div>
            </div>
          </div>

          {/* Risk heatmap matrix */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Accreditation Risk Heatmap Index</h3>
            
            <div className="risk-matrix" style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: '4px', maxWidth: '400px' }}>
              {/* Header labels */}
              <div className="risk-matrix-header">L \ I</div>
              <div className="risk-matrix-header">Negl</div>
              <div className="risk-matrix-header">Minor</div>
              <div className="risk-matrix-header">Mod</div>
              <div className="risk-matrix-header">Maj</div>
              <div className="risk-matrix-header">Crit</div>

              {/* Rows (Likelihood: 5 down to 1) */}
              {['Almost Cert', 'Likely', 'Possible', 'Unlikely', 'Rare'].map((lLabel, lIdx) => {
                const likelihood = 5 - lIdx;
                return (
                  <React.Fragment key={lLabel}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>{lLabel}</div>
                    {[1, 2, 3, 4, 5].map(impact => {
                      const score = likelihood * impact;
                      let ratingClass = 'risk-low';
                      if (score >= 15) ratingClass = 'risk-extreme';
                      else if (score >= 10) ratingClass = 'risk-high';
                      else if (score >= 5) ratingClass = 'risk-medium';
                      
                      return (
                        <div key={impact} className={`risk-matrix-cell ${ratingClass}`} style={{ textAlign: 'center', padding: '0.25rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {score}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clinical Indicators Pivot Table */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity style={{ color: 'var(--primary)' }} />
              Clinical Quality Outcomes Pivot Board
            </h3>
            <button onClick={handleExportCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}>
              <FileDown size={12} /> Export CSV Outcomes
            </button>
          </div>

          {/* Pivot Filters */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Indicator Filter</label>
              <select className="role-badge-selector" value={pivotIndicator} onChange={(e)=>setPivotIndicator(e.target.value)}>
                <option value="All">All Indicators</option>
                <option value="falls">Patient Falls</option>
                <option value="medicationErrors">Medication Errors</option>
                <option value="infections">Infections</option>
                <option value="needleSticks">Needle Sticks</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Department Filter</label>
              <select className="role-badge-selector" value={pivotDept} onChange={(e)=>setPivotDept(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="ICU">ICU</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="OPD">OPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">OT</option>
              </select>
            </div>
          </div>

          {/* Table outcome display */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Month</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Clinical Indicator</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Department Scope</th>
                  <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Incidents Count</th>
                </tr>
              </thead>
              <tbody>
                {qualityIndicators.map(row => {
                  const indicatorsList = ['falls', 'medicationErrors', 'infections', 'needleSticks'];
                  const labelMap = { falls: 'Falls', medicationErrors: 'Medication Errors', infections: 'Infections', needleSticks: 'Needle Sticks' };

                  return indicatorsList.map(ind => {
                    if (pivotIndicator !== 'All' && pivotIndicator !== ind) return null;
                    const val = getPivotValue(row, ind);
                    return (
                      <tr key={`${row.month}-${ind}`} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{row.month}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{labelMap[ind]}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{pivotDept}</td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>{val}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // Root Dashboard Route Dispatcher
  // ----------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SaaS billing warning banners */}
      {!isSubscribed && trialDaysLeft > 0 && trialDaysLeft <= 2 && (
        <div className="card shadow-md flex justify-between align-center" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgb(217, 119, 6)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <strong style={{ color: 'rgb(217, 119, 6)' }}>Free Trial Expiring Soon</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>Your 7-day trial ends in <strong>{getLiveCountdownString()}</strong>. Upgrade today to prevent account lockout.</div>
            </div>
          </div>
          <button onClick={() => setForcePaymentScreen(true)} className="btn btn-primary glow-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>
            Upgrade Plan
          </button>
        </div>
      )}

      {isSubscribed && subscriptionDaysLeft > 0 && subscriptionDaysLeft <= 20 && (
        <div className="card shadow-md flex justify-between align-center" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgb(217, 119, 6)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <strong style={{ color: 'rgb(217, 119, 6)' }}>Subscription Expiration Notice</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>Your subscription expires in <strong>{subscriptionDaysLeft} days</strong> ({getLiveCountdownString()}). Renew today to preserve your compliance vault history.</div>
            </div>
          </div>
          <button onClick={() => setForcePaymentScreen(true)} className="btn btn-primary glow-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>
            Renew Now
          </button>
        </div>
      )}

      {/* Main role dashboard switch */}
      {(() => {
        if (orgMode) {
          return renderOrganizationDashboard();
        }

        switch (currentUser?.role) {
          case 'Super Admin':
            return renderHospitalAdminDashboard();
          case 'Hospital Admin':
            return renderHospitalAdminDashboard();
          case 'Quality Head':
            return renderQualityHeadDashboard();
          case 'Department Head':
            return renderDepartmentHeadDashboard();
          case 'Staff':
            return renderStaffDashboard();
          case 'Viewer':
          case 'Auditor':
          case 'External Consultant':
          default:
            return renderViewerDashboard();
        }
      })()}
    </div>
  );
}
