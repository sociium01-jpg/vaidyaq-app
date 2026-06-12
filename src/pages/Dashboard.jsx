import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
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
  Plus
} from 'lucide-react';

export default function Dashboard() {
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
    licenses,
    capaItems,
    audits,
    evidenceUploadedCount,
    hospitalMode,
    switchHospitalMode,
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
    qualityIndicators
  } = useContext(QualiNABHContext);

  const [selectedDeptRisk, setSelectedDeptRisk] = useState(null);

  // Clinical Indicators Pivot Table States
  const [pivotIndicator, setPivotIndicator] = useState('All');
  const [pivotDept, setPivotDept] = useState('All');
  const [pivotMonth, setPivotMonth] = useState('All');

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
  };

  const handleExportWord = () => {
    const labelMap = { falls: 'Patient Falls', medicationErrors: 'Medication Errors', infections: 'Infections', needleSticks: 'Needle Stick Injuries' };
    const indicatorsList = ['falls', 'medicationErrors', 'infections', 'needleSticks'];
    
    let reportText = `CLINICAL INDICATORS COMPLIANCE REPORT - VAIDYAQ AI\n`;
    reportText += `====================================================\n`;
    reportText += `Hospital: ${hospitalName}\n`;
    reportText += `Beds: ${hospitalBeds} Beds | Tier: ${hospitalTier}\n`;
    reportText += `Report Filter - Department: ${pivotDept} | Month: ${pivotMonth}\n`;
    reportText += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    reportText += `SUMMARY DATA:\n`;
    reportText += `-------------\n`;
    
    qualityIndicators.forEach(row => {
      if (pivotMonth !== 'All' && row.month !== pivotMonth) return;
      reportText += `Month: ${row.month}\n`;
      indicatorsList.forEach(ind => {
        if (pivotIndicator !== 'All' && pivotIndicator !== ind) return;
        const val = getPivotValue(row, ind);
        reportText += `  - ${labelMap[ind]}: ${val} incidents\n`;
      });
      reportText += `\n`;
    });
    
    reportText += `CONFIDENTIALITY NOTICE:\n`;
    reportText += `This report contains de-identified quality outcomes compiled for NABH accreditation review.`;
    
    const blob = new Blob([reportText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical_indicators_report_${pivotDept}_${pivotMonth}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity(`Exported clinical indicators report as MS Word summary for department: ${pivotDept}, month: ${pivotMonth}`);
  };

  const handleExportPDF = () => {
    window.print();
    logActivity(`Triggered PDF printer spool for dashboard indicators.`);
  };


  // Profile editing state
  const [editName, setEditName] = useState(hospitalName);
  const [editBeds, setEditBeds] = useState(hospitalBeds);
  const [editTier, setEditTier] = useState(hospitalTier);

  // Departments editing state
  const [tempDepts, setTempDepts] = useState(activeDepts);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [customDeptsList, setCustomDeptsList] = useState(() => {
    const saved = localStorage.getItem('qn_custom_depts_list');
    return saved ? JSON.parse(saved) : ['Radiology', 'Laboratory', 'IPD Ward'];
  });

  useEffect(() => {
    localStorage.setItem('qn_custom_depts_list', JSON.stringify(customDeptsList));
  }, [customDeptsList]);

  // Simulated Template Importer Progress State
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatusText, setImportStatusText] = useState('');

  // Direct AI Policy Drafting States
  const [showDirectDraftModal, setShowDirectDraftModal] = useState(false);
  const [directDraftText, setDirectDraftText] = useState('');
  const [directDrafting, setDirectDrafting] = useState(false);
  const [directDraftStatusText, setDirectDraftStatusText] = useState('');

  // Sync edit forms on outer state changes
  useEffect(() => {
    setEditName(hospitalName);
    setEditBeds(hospitalBeds);
    setEditTier(hospitalTier);
  }, [hospitalName, hospitalBeds, hospitalTier]);

  useEffect(() => {
    setTempDepts(activeDepts);
  }, [activeDepts]);

  const handleSaveIdentity = () => {
    setHospitalName(editName);
    setHospitalBeds(editBeds);
    setHospitalTier(editTier);
    setOnboardingSteps(prev => ({ ...prev, identity: true }));
    logActivity(`Initialized hospital profile: ${editName} (${editBeds} beds, ${editTier})`);
  };

  const handleSaveDepartments = () => {
    setActiveDepts(tempDepts);
    setOnboardingSteps(prev => ({ ...prev, departments: true }));
    logActivity(`Configured active clinical departments: ${tempDepts.join(', ')}`);
  };

  const handleAddCustomDept = () => {
    if (customDeptInput.trim() === '') return;
    const cleanName = customDeptInput.trim();
    if (!customDeptsList.includes(cleanName) && !['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing'].includes(cleanName)) {
      setCustomDeptsList(prev => [...prev, cleanName]);
    }
    if (!tempDepts.includes(cleanName)) {
      setTempDepts(prev => [...prev, cleanName]);
    }
    setCustomDeptInput('');
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
        setTimeout(() => {
          setIsImporting(false);
          importNABHTemplates();
        }, 300);
      }
    }, 150);
  };

  const handleDirectDraft = () => {
    setDirectDrafting(true);
    setDirectDraftStatusText('Initializing AI drafting module...');
    
    setTimeout(() => {
      setDirectDraftStatusText('Reading MOM.3.a Medication Expiry requirements...');
    }, 300);

    setTimeout(() => {
      setDirectDraftStatusText('Compiling Segregation and Disposal Protocols...');
    }, 700);

    setTimeout(() => {
      const draft = `STANDARD OPERATING PROCEDURE (SOP)
DOCUMENT TITLE: Medication Expiry Auditing & Segregation Protocol
DEPARTMENT: Pharmacy
MAPPED STANDARD: MOM.3.a (6th Edition)
AUTHOR: AI Quality Copilot (Direct Integration)
STATUS: Approved (Sarah Paul, Quality Head)
--------------------------------------------------

1. PURPOSE & OBJECTIVE
To outline the clinical safety standards and protocols for handling, segregated storage, auditing, and safe disposal of expired and near-expiry medications to prevent medication administration errors inside the Pharmacy.

2. STORAGE PROTOCOL
A. Daily Audits: All dispensing shelves must be audited daily by the duty pharmacist.
B. Near-Expiry Tags: Medications within 3 months of expiry must be physically tagged with yellow indicators.
C. Expiry Removal: Expired medications must be removed from circulation immediately and kept inside a double-locked RED bin labelled: "EXPIRED DRUGS - DO NOT USE".

3. DISPOSAL PROTOCOL
A. Segregated drugs must be disposed of in coordination with state authorized pollution control agencies.
B. All disposals must be logged in the Drug Disposal Registry with dual signatures (Pharmacist + Quality Officer).

4. STAFF DRILLS & COMPLIANCE
A. Annual training must be conducted for all pharmacy handlers.
B. Weekly check sheets must be verified by the Pharmacy Head.

DOCUMENT CONTROL CYCLE: Reviewed every 6 months. Revision 1.0.`;
      
      setDirectDraftText(draft);
      setDirectDrafting(false);
      logActivity("Generated Direct AI SOP Draft for standard MOM.3.a");
    }, 1100);
  };

  const handleDirectApprove = () => {
    approveSOPDraft("Medication Expiry Auditing Protocol", "Pharmacy", ["MOM.3.a"], directDraftText);
    setOnboardingSteps(prev => ({ ...prev, firstSop: true }));
    setShowDirectDraftModal(false);
    setDirectDraftText('');
    logActivity("Approved direct onboarding AI SOP draft for MOM.3.a Medication Expiry Auditing");
  };

  const handleNavigateToAi = () => {
    setCurrentRoute('/app/ai');
    if (hospitalMode === 'new') {
      setOnboardingSteps(prev => ({ ...prev, firstSop: true }));
    }
  };

  // Dynamic Department Risk Analysis based on state and Mode
  const getDepartmentRisks = () => {
    if (hospitalMode === 'new') {
      const newDepts = [
        { name: 'ICU', risk: 'not audited', color: 'neutral', issues: ["No audits performed yet. Schedule an ICU safety audit to begin."] },
        { name: 'Pharmacy', risk: 'not audited', color: 'neutral', issues: ["Narcotic licenses and expiry tracking are unmapped. Upload standard policies."] },
        { name: 'Emergency', risk: 'not audited', color: 'neutral', issues: ["No triage audits performed yet."] },
        { name: 'OT', risk: 'not audited', color: 'neutral', issues: ["Sterilization logs not yet uploaded."] },
        { name: 'Housekeeping / Facilities', risk: 'not audited', color: 'neutral', issues: ["Bio-medical waste logs unmapped."] },
        { name: 'HR / Staffing', risk: 'not audited', color: 'neutral', issues: ["Staff credentialing training compliance not recorded."] }
      ];

      const defaultNames = newDepts.map(d => d.name);
      activeDepts.forEach(dept => {
        if (!defaultNames.includes(dept)) {
          newDepts.push({
            name: dept,
            risk: 'not audited',
            color: 'neutral',
            issues: [`Custom department initialized. Schedule an audit to check compliance.`]
          });
        }
      });

      return newDepts.filter(d => activeDepts.includes(d.name));
    }

    // Active Demo State
    const hasIcuOpenCapa = capaItems.some(c => c.department === 'ICU' && c.status === 'Open');
    const icuStandardScore = standards.find(s => s.id === 'COP.5.c')?.score || 0;
    const icuRisk = (hasIcuOpenCapa || icuStandardScore === 0) ? 'high' : 'low';
    const icuIssues = [];
    if (icuStandardScore === 0) icuIssues.push("ICU Standard COP.5.c is Not Met.");
    if (hasIcuOpenCapa) icuIssues.push("Unresolved High-Severity Audit Finding regarding expired syringes.");

    const hasPharmacyExpiredLic = licenses.some(l => l.name.includes("Narcotic") && l.status === "Expired");
    const pharmacyExpiryScore = standards.find(s => s.id === 'MOM.3.a')?.score || 0;
    const pharmacyRisk = (hasPharmacyExpiredLic || pharmacyExpiryScore === 0) ? 'high' : 'low';
    const pharmacyIssues = [];
    if (pharmacyExpiryScore === 0) pharmacyIssues.push("Medication Expiry Standard MOM.3.a is Not Met.");
    if (hasPharmacyExpiredLic) pharmacyIssues.push("Narcotic Storage License is currently EXPIRED.");

    const emergencyScore = standards.find(s => s.id === 'AAC.2.b')?.score || 0;
    const emergencyRisk = (emergencyScore < 10) ? 'medium' : 'low';
    const emergencyIssues = [];
    if (emergencyScore < 10) emergencyIssues.push("Emergency Care COP.2.b and AAC.2.b are Partially Met.");

    const otRisk = 'low';
    const otIssues = ["Sterilization monitoring logs verified up-to-date."];

    const hasWasteLogGap = standards.find(s => s.id === 'FMS.2.a')?.score < 10;
    const hasWasteLicExpiring = licenses.some(l => l.name.includes("Bio-Medical") && new Date(l.expiryDate) < new Date(Date.now() + 90*24*60*60*1000));
    const facilitiesRisk = (hasWasteLogGap || hasWasteLicExpiring) ? 'medium' : 'low';
    const facilitiesIssues = [];
    if (hasWasteLogGap) facilitiesIssues.push("Hazmat Control FMS.2.a is Partially Met.");
    if (hasWasteLicExpiring) facilitiesIssues.push("Bio-Medical Waste authorization expires within 90 days.");

    const hrScore = standards.find(s => s.id === 'HRM.2.b')?.score || 0;
    const hrRisk = (hrScore < 10) ? 'medium' : 'low';
    const hrIssues = [];
    if (hrScore < 10) hrIssues.push("Infection Control Training compliance is under 80%.");

    const activeDemoDepts = [
      { name: 'ICU', risk: icuRisk, color: icuRisk === 'high' ? 'red' : 'green', issues: icuIssues },
      { name: 'Pharmacy', risk: pharmacyRisk, color: pharmacyRisk === 'high' ? 'red' : 'green', issues: pharmacyIssues },
      { name: 'Emergency', risk: emergencyRisk, color: 'yellow', issues: emergencyIssues },
      { name: 'OT', risk: otRisk, color: 'green', issues: otIssues },
      { name: 'Housekeeping / Facilities', risk: facilitiesRisk, color: facilitiesRisk === 'medium' ? 'yellow' : 'green', issues: facilitiesIssues },
      { name: 'HR / Staffing', risk: hrRisk, color: hrRisk === 'medium' ? 'yellow' : 'green', issues: hrIssues }
    ];

    const demoNames = activeDemoDepts.map(d => d.name);
    activeDepts.forEach(dept => {
      if (!demoNames.includes(dept)) {
        activeDemoDepts.push({
          name: dept,
          risk: 'low',
          color: 'green',
          issues: ["No compliance deviations reported."]
        });
      }
    });

    return activeDemoDepts.filter(d => activeDepts.includes(d.name));
  };

  const departments = getDepartmentRisks();

  // SVG Gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  const stepsCompletedCount = Object.values(onboardingSteps).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Page Title & Onboarding Toggle Bar */}
      <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Hospital Quality Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time compliance analytics for <strong>NABH 6th Edition Accreditation Cycle</strong>
          </p>
        </div>
        
        {/* Onboarding Mode Toggles */}
        <div style={{ display: 'inline-flex', padding: '0.3rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
          <button
            onClick={() => switchHospitalMode('new')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: hospitalMode === 'new' ? 'var(--primary-light)' : 'transparent',
              color: hospitalMode === 'new' ? 'var(--primary-hover)' : 'var(--text-secondary)'
            }}
          >
            🏥 New Hospital (Empty)
          </button>
          <button
            onClick={() => switchHospitalMode('active')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: hospitalMode === 'active' ? 'var(--primary-light)' : 'transparent',
              color: hospitalMode === 'active' ? 'var(--primary-hover)' : 'var(--text-secondary)'
            }}
          >
            📊 Active Demo (Preloaded)
          </button>
        </div>
      </div>

      {/* 1. Welcoming Onboarding wizard if database state is 'new' */}
      {hospitalMode === 'new' && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🚀 Quick Setup Wizard
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome to your new Hospital quality workspace</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Let's configure your digital infrastructure for the <strong>NABH 6th Edition Quality & Compliance Audit</strong>.
                </p>
              </div>
              
              <div className="flex align-center gap-2" style={{ backgroundColor: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {stepsCompletedCount} / 4
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Steps Completed
                </div>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-accent)', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ height: '100%', width: `${(stepsCompletedCount / 4) * 100}%`, backgroundColor: 'var(--primary)', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              
              {/* Step 1: Hospital Details */}
              <div className={`card ${onboardingSteps.identity ? 'good' : ''}`} style={{ padding: '1.25rem', backgroundColor: onboardingSteps.identity ? 'rgba(5,150,105,0.02)' : 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.75rem', color: onboardingSteps.identity ? 'var(--color-success)' : 'var(--primary)' }}>STEP 1</span>
                  {onboardingSteps.identity ? (
                    <span className="badge badge-success" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>✓ Saved</span>
                  ) : (
                    <span className="badge badge-neutral" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>Pending</span>
                  )}
                </div>
                
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Hospital Identity</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', minHeight: '36px' }}>
                  Set your hospital's name, bed capacity, and accreditation tier.
                </p>

                {!onboardingSteps.identity ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Hospital Name"
                      className="form-control"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Beds"
                        className="form-control"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flex: 1 }}
                        value={editBeds}
                        onChange={(e) => setEditBeds(e.target.value)}
                      />
                      <select
                        className="form-control"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flex: 1.5 }}
                        value={editTier}
                        onChange={(e) => setEditTier(e.target.value)}
                      >
                        <option value="Entry Level">Entry Level</option>
                        <option value="Full Accreditation">Full Accreditation</option>
                        <option value="Sandbox Mode">Sandbox Mode</option>
                      </select>
                    </div>
                    <button onClick={handleSaveIdentity} className="btn btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.5rem', width: '100%' }}>
                      Save Profile
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600 }}>{hospitalName}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{hospitalBeds} Beds • {hospitalTier}</div>
                    <button onClick={() => setOnboardingSteps(prev => ({ ...prev, identity: false }))} style={{ color: 'var(--primary)', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'underline' }}>
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Select Active Departments */}
              <div className={`card ${onboardingSteps.departments ? 'good' : ''}`} style={{ padding: '1.25rem', backgroundColor: onboardingSteps.departments ? 'rgba(5,150,105,0.02)' : 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.75rem', color: onboardingSteps.departments ? 'var(--color-success)' : 'var(--primary)' }}>STEP 2</span>
                  {onboardingSteps.departments ? (
                    <span className="badge badge-success" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>✓ Configured</span>
                  ) : (
                    <span className="badge badge-neutral" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>Pending</span>
                  )}
                </div>
                
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Active Departments</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', minHeight: '36px' }}>
                  Check the departments active at your clinical facility.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', maxHeight: '110px', overflowY: 'auto', padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', marginBottom: '0.5rem' }}>
                  {['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing', ...customDeptsList].map(dept => (
                    <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tempDepts.includes(dept)}
                        onChange={() => {
                          setTempDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
                        }}
                      />
                      <span>{dept.split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add department (e.g. Radiology)"
                    className="form-control"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                    value={customDeptInput}
                    onChange={(e) => setCustomDeptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDept();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDept}
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Add
                  </button>
                </div>

                <button onClick={handleSaveDepartments} className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.8rem', width: '100%' }}>
                  {onboardingSteps.departments ? 'Update Departments' : 'Save Departments'}
                </button>
              </div>

              {/* Step 3: Import NABH Templates */}
              <div className={`card ${onboardingSteps.importTemplates ? 'good' : ''}`} style={{ padding: '1.25rem', backgroundColor: onboardingSteps.importTemplates ? 'rgba(5,150,105,0.02)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', color: onboardingSteps.importTemplates ? 'var(--color-success)' : 'var(--primary)' }}>STEP 3</span>
                    {onboardingSteps.importTemplates ? (
                      <span className="badge badge-success" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>✓ Loaded</span>
                    ) : (
                      <span className="badge badge-neutral" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>Pending</span>
                    )}
                  </div>
                  
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>NABH Starter Pack</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', minHeight: '36px' }}>
                    Import standard 6th edition templates to kickstart compliance.
                  </p>
                </div>

                {isImporting ? (
                  <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{importStatusText}</div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-accent)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.4rem' }}>
                      <div style={{ height: '100%', width: `${importProgress}%`, backgroundColor: 'var(--primary)' }} />
                    </div>
                  </div>
                ) : onboardingSteps.importTemplates ? (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Loaded <strong>7 Policies/SOPs</strong>. Mapped score initialized to <strong>38%</strong>.</span>
                  </div>
                ) : (
                  <button onClick={handleImportTemplates} className="btn btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem', width: '100%' }}>
                    Import Templates
                  </button>
                )}
              </div>

              {/* Step 4: Write policy with AI */}
              <div className={`card ${onboardingSteps.firstSop ? 'good' : ''}`} style={{ padding: '1.25rem', backgroundColor: onboardingSteps.firstSop ? 'rgba(5,150,105,0.02)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', color: onboardingSteps.firstSop ? 'var(--color-success)' : 'var(--primary)' }}>STEP 4</span>
                    {onboardingSteps.firstSop ? (
                      <span className="badge badge-success" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>✓ Drafted</span>
                    ) : (
                      <span className="badge badge-neutral" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>Pending</span>
                    )}
                  </div>
                  
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Draft SOP with AI</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', minHeight: '36px' }}>
                    Draft your Medication Expiry SOP directly mapped to MOM.3.a chapter.
                  </p>
                </div>

                {onboardingSteps.firstSop ? (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    🎉 Expiry SOP mapped! Standard score updated to <strong>Fully Met (10/10)</strong>.
                  </div>
                ) : (
                  <button onClick={() => setShowDirectDraftModal(true)} className="btn btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem', width: '100%', display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={12} />
                    <span>Draft Policy Directly</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Onboarding Complete Congratulatory Card */}
      {hospitalMode === 'new' && stepsCompletedCount === 4 && (
        <div className="card flex gap-3 align-center" style={{ border: '2px solid var(--color-success)', background: 'linear-gradient(to right, rgba(5,150,105,0.03), rgba(5,150,105,0.08))', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'white', padding: '0.75rem', backgroundColor: 'var(--color-success)', borderRadius: '50%', display: 'flex' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-success)', fontWeight: 800 }}>🎉 Onboarding Configuration Completed!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Your workspace is initialized. The standards registry is loaded, departments are configured, and templates are mapped.
            </p>
          </div>
          <button onClick={() => switchHospitalMode('active')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
            Explore Full Demo Data
          </button>
        </div>
      )}

      {/* 2. Metric Cards Row */}
      <div className="grid dashboard-grid">
        {/* Readiness Score Card */}
        <div className="card gauge-container" style={{ padding: '1.25rem' }}>
          <div className="metric-title" style={{ fontWeight: 700 }}>Accreditation Readiness</div>
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="gauge-svg" width="110" height="110" viewBox="0 0 110 110">
              <circle className="gauge-bg" cx="55" cy="55" r={radius} strokeWidth="10" />
              <circle
                className="gauge-fill"
                cx="55"
                cy="55"
                r={radius}
                strokeWidth="10"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  stroke: readinessScore >= 80 ? 'var(--primary)' : readinessScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'
                }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{readinessScore}%</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Score</span>
            </div>
          </div>
          <button onClick={() => setCurrentRoute('/app/accreditation')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.5rem', width: '100%' }}>
            View Gap Analysis
          </button>
        </div>

        {/* Open CAPAs */}
        <div className={`card metric-card ${openCapasCount > 0 ? 'critical' : 'good'}`}>
          <div className="metric-title">Open CAPA Actions</div>
          <div className="metric-val" style={{ color: openCapasCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {openCapasCount}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {openCapasCount > 0 ? 'Requires immediate action proof upload' : 'All audits findings closed out'}
          </p>
          <button onClick={() => setCurrentRoute('/app/quality')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
            Manage CAPAs
          </button>
        </div>

        {/* Missing Evidence */}
        <div className={`card metric-card ${missingEvidenceCount > 2 ? 'warning' : 'good'}`}>
          <div className="metric-title">Missing Proofs</div>
          <div className="metric-val" style={{ color: missingEvidenceCount > 2 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {missingEvidenceCount}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Objective elements lacking mapped SOP/Audit docs
          </p>
          <button onClick={() => setCurrentRoute('/app/accreditation')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
            Evidence Mapper
          </button>
        </div>

        {/* Incidents Reported */}
        <div className="card metric-card">
          <div className="metric-title">Incidents logged (Month)</div>
          <div className="metric-val">{incidentsThisMonthCount}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {incidentsThisMonthCount > 0 ? `${incidentsThisMonthCount} errors reported for investigation` : 'No patient incidents recorded'}
          </p>
          <button onClick={() => setCurrentRoute('/app/quality')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
            Report Incident
          </button>
        </div>

        {/* Overdue Tasks */}
        <div className={`card metric-card ${overdueTasksCount > 0 ? 'critical' : 'good'}`}>
          <div className="metric-title">Overdue Tasks</div>
          <div className="metric-val" style={{ color: overdueTasksCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {overdueTasksCount}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Handover and training deadlines missed
          </p>
          <button onClick={() => setCurrentRoute('/app/tasks')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
            Task Board
          </button>
        </div>
      </div>

      {/* 3. Onboarding Operating Model Map / Pipeline */}
      {hospitalMode === 'new' && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <span>VaidyaQ Operating System Workflow Map</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Explore how data flows inside the Quality Operating System. Click on any stage to visit that workspace.
          </p>
          
          <div className="flex justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            {[
              { step: "1", title: "Compliance Registers", desc: "Consult NABH 6th Edition requirements library.", route: "/app/compliance" },
              { step: "2", title: "AI SOP Generator", desc: "Draft localized medical policies in seconds.", route: "/app/ai" },
              { step: "3", title: "Internal Auditing", desc: "Run checklist inspections and log deviations.", route: "/app/quality" },
              { step: "4", title: "CAPA Closures Desk", desc: "Address gaps and upload evidence justifications.", route: "/app/quality" },
              { step: "5", title: "Dossier Dossiers", desc: "Generate summary dossiers for assessment.", route: "/app/reports" }
            ].map((flow, index) => (
              <div
                key={index}
                onClick={() => setCurrentRoute(flow.route)}
                style={{
                  flex: '1 1 180px',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="hover-card-highlight"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  {flow.step}
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>{flow.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{flow.desc}</p>
              </div>
            ))}
          </div>
          <style>{`
            .hover-card-highlight:hover {
              border-color: var(--primary) !important;
              transform: translateY(-2px);
              background-color: var(--bg-secondary) !important;
              box-shadow: var(--shadow-md);
            }
          `}</style>
        </div>
      )}

      {/* 4. Main Sections Split */}
      <div className="dashboard-sections-grid grid">
        {/* Left Side: Interactive Department Risk Map & Audits */}
        <div className="flex flex-col gap-3">
          {/* Department Risk Map */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--primary)" />
              <span>Interactive Department Risk Map</span>
            </h3>
            
            {departments.length > 0 ? (
              <div className="grid dept-risk-grid">
                {departments.map((dept, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDeptRisk(dept)}
                    className={`dept-risk-item ${dept.color}`}
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{dept.name}</span>
                    <span className={`badge ${dept.color === 'red' ? 'badge-danger' : dept.color === 'yellow' ? 'badge-warning' : dept.color === 'neutral' ? 'badge-neutral' : 'badge-success'}`}>
                      {dept.risk.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-tertiary)' }}>
                No active departments configured. Complete Step 2 of the Onboarding Wizard to populate this map.
              </div>
            )}

            {/* Department Risk Details Overlay Panel */}
            {selectedDeptRisk && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Department Quality Dossier: {selectedDeptRisk.name}</h4>
                  <button onClick={() => setSelectedDeptRisk(null)} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>✕ Close</button>
                </div>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedDeptRisk.issues.map((issue, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{issue}</li>
                  ))}
                </ul>
                <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
                  <button onClick={() => setCurrentRoute('/app/compliance')} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    View SOPs
                  </button>
                  <button onClick={() => setCurrentRoute('/app/quality')} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    Trigger Internal Audit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audits Table / Onboarding Empty State */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--secondary)" />
              <span>Upcoming Quality Audits</span>
            </h3>

            {audits.length > 0 ? (
              <div className="table-container" style={{ margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Audit ID</th>
                      <th>Audit Title</th>
                      <th>Department</th>
                      <th>Auditor</th>
                      <th>Date Scheduled</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map((aud, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 700 }}>{aud.id.substring(0, 7)}</td>
                        <td>{aud.title}</td>
                        <td>{aud.department}</td>
                        <td>{aud.auditor}</td>
                        <td>{aud.date}</td>
                        <td>
                          <span className={`badge ${aud.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                            {aud.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }} className="flex flex-col align-center gap-2">
                <Calendar size={36} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No quality audits scheduled yet</p>
                <button onClick={() => setCurrentRoute('/app/quality')} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                  Schedule Your First Audit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: AI Weekly Summary / Onboarding Instructions */}
        <div className="flex flex-col gap-3">
          <div className="card" style={{ borderLeft: '5px solid var(--primary)', background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-tertiary))' }}>
            <div className="flex align-center gap-2" style={{ marginBottom: '1rem' }}>
              <Brain size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>AI Quality Co-Pilot Digest</h3>
            </div>
            
            {hospitalMode === 'new' ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p>Welcome to VaidyaQ AI! My algorithms are initialized and awaiting hospital compliance data.</p>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Onboarding Hint</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Draft your first SOP</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Use the **AI SOP Generator** under AI Insights to draft a Medication Expiry Protocol, map it to chapter MOM.3.a, and approve it.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-danger" style={{ fontSize: '0.6rem', marginBottom: '0.4rem' }}>Critical Risk</span>
                  <p style={{ fontWeight: 600 }}>Expired Narcotic License</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    The <strong>Narcotics Storage License</strong> under Pharmacy expired on 10-May-2026. This is a severe legal liability.
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.6rem', marginBottom: '0.4rem' }}>Gap Detected</span>
                  <p style={{ fontWeight: 600 }}>ICU Standard Missing Evidence</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    No evidence document linked for <strong>COP.5.c (ICU Criteria)</strong>. The ICU risk is marked HIGH.
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.6rem', marginBottom: '0.4rem' }}>Audit Recommendation</span>
                  <p style={{ fontWeight: 600 }}>Unresolved Crash Cart Syringes CAPA</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    CAPA-1 is due on 20-Jun-2026. Suggest uploading Daily Handover check sheet as corrective proof.
                  </p>
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }} />

            <button
              onClick={() => setCurrentRoute('/app/ai')}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
            >
              <span>Consult Copilot Assistant</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Quick Stats Summary */}
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>6th Edition Progress</h4>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>SOP Uploads mapped to chapters</span>
                  <span>{standards.length > 0 ? Math.round((evidenceUploadedCount/standards.length)*100) : 0}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${standards.length > 0 ? (evidenceUploadedCount/standards.length)*100 : 0}%`, backgroundColor: 'var(--primary)' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>CAPA Action Closure Rate</span>
                  <span>{capaItems.length > 0 ? Math.round((capaItems.filter(c=>c.status==='Closed').length / capaItems.length)*100) : 100}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${capaItems.length > 0 ? (capaItems.filter(c=>c.status==='Closed').length / capaItems.length)*100 : 100}%`, backgroundColor: 'var(--secondary)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CLINICAL INDICATORS ANALYTICS PIVOT CENTER */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem', textAlign: 'left' }}>
        <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <span>Clinical Analytics & Indicator Pivot Center</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Cross-examine clinical incidents by department and month to monitor accreditation safety parameters.
            </p>
          </div>
          
          {/* Exporters Row */}
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🖨️ Export PDF / Print
            </button>
            <button onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              📄 Export CSV / Data
            </button>
            <button onClick={handleExportWord} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              📝 Export Word Summary
            </button>
          </div>
        </div>

        {/* Pivot Filters Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.4rem', display: 'block' }}>Filter Clinical Indicator</label>
            <select 
              value={pivotIndicator} 
              onChange={(e) => setPivotIndicator(e.target.value)} 
              className="form-control" 
              style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-primary)' }}
            >
              <option value="All">All Indicators</option>
              <option value="falls">Patient Falls</option>
              <option value="medicationErrors">Medication Errors</option>
              <option value="infections">Healthcare-Associated Infections</option>
              <option value="needleSticks">Needle Stick Injuries</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.4rem', display: 'block' }}>Filter Department</label>
            <select 
              value={pivotDept} 
              onChange={(e) => setPivotDept(e.target.value)} 
              className="form-control" 
              style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-primary)' }}
            >
              <option value="All">All Departments</option>
              <option value="ICU">Intensive Care (ICU)</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="OPD">Out-Patient (OPD)</option>
              <option value="Emergency">Emergency Room (OPD)</option>
              <option value="OT">Operation Theatre (OT)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.4rem', display: 'block' }}>Filter Month</label>
            <select 
              value={pivotMonth} 
              onChange={(e) => setPivotMonth(e.target.value)} 
              className="form-control" 
              style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-primary)' }}
            >
              <option value="All">All Months (H1 2026)</option>
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
            </select>
          </div>
        </div>

        {/* Interactive Pivot Grid Table */}
        <div className="table-container" style={{ margin: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Reporting Month</th>
                {(pivotIndicator === 'All' || pivotIndicator === 'falls') && <th>Patient Falls</th>}
                {(pivotIndicator === 'All' || pivotIndicator === 'medicationErrors') && <th>Medication Errors</th>}
                {(pivotIndicator === 'All' || pivotIndicator === 'infections') && <th>Infections</th>}
                {(pivotIndicator === 'All' || pivotIndicator === 'needleSticks') && <th>Needle Sticks</th>}
                <th>Monthly Total</th>
              </tr>
            </thead>
            <tbody>
              {qualityIndicators.map((row, idx) => {
                if (pivotMonth !== 'All' && row.month !== pivotMonth) return null;
                
                const valFalls = getPivotValue(row, 'falls');
                const valMeds = getPivotValue(row, 'medicationErrors');
                const valInfect = getPivotValue(row, 'infections');
                const valNeedle = getPivotValue(row, 'needleSticks');
                
                const rowTotal = 
                  (pivotIndicator === 'All' || pivotIndicator === 'falls' ? valFalls : 0) +
                  (pivotIndicator === 'All' || pivotIndicator === 'medicationErrors' ? valMeds : 0) +
                  (pivotIndicator === 'All' || pivotIndicator === 'infections' ? valInfect : 0) +
                  (pivotIndicator === 'All' || pivotIndicator === 'needleSticks' ? valNeedle : 0);

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{row.month} 2026</td>
                    {(pivotIndicator === 'All' || pivotIndicator === 'falls') && (
                      <td style={{ color: valFalls > 2 ? 'var(--color-danger)' : 'inherit', fontWeight: valFalls > 2 ? 'bold' : 'normal' }}>
                        {valFalls}
                      </td>
                    )}
                    {(pivotIndicator === 'All' || pivotIndicator === 'medicationErrors') && (
                      <td style={{ color: valMeds > 3 ? 'var(--color-danger)' : 'inherit', fontWeight: valMeds > 3 ? 'bold' : 'normal' }}>
                        {valMeds}
                      </td>
                    )}
                    {(pivotIndicator === 'All' || pivotIndicator === 'infections') && (
                      <td style={{ color: valInfect > 2 ? 'var(--color-danger)' : 'inherit', fontWeight: valInfect > 2 ? 'bold' : 'normal' }}>
                        {valInfect}
                      </td>
                    )}
                    {(pivotIndicator === 'All' || pivotIndicator === 'needleSticks') && (
                      <td style={{ color: valNeedle > 2 ? 'var(--color-danger)' : 'inherit', fontWeight: valNeedle > 2 ? 'bold' : 'normal' }}>
                        {valNeedle}
                      </td>
                    )}
                    <td style={{ fontWeight: 800, backgroundColor: 'var(--bg-tertiary)' }}>{rowTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 5. Direct AI SOP Drafting Modal Overlay */}
      {showDirectDraftModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                <span>AI SOP Generator Panel (Onboarding Wizard)</span>
              </h3>
              <button 
                onClick={() => { setShowDirectDraftModal(false); setDirectDraftText(''); }} 
                style={{ fontSize: '1.2rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body flex flex-col gap-2">
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                Drafting SOP: <strong>Medication Expiry Auditing & Segregation Protocol</strong><br />
                Mapped Standard Chapter: <strong>MOM.3.a (Medication Expiry Control Register)</strong>
              </div>

              {directDrafting ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }} className="flex flex-col align-center gap-2">
                  <Brain size={32} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{directDraftStatusText}</p>
                </div>
              ) : directDraftText ? (
                <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Edit Generated SOP Text</label>
                  <textarea
                    className="form-control"
                    style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: 'monospace', 
                      fontSize: '0.8rem', 
                      padding: '0.75rem', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      minHeight: '260px',
                      width: '100%',
                      resize: 'vertical'
                    }}
                    value={directDraftText}
                    onChange={(e) => setDirectDraftText(e.target.value)}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="flex flex-col align-center gap-2">
                  <Sparkles size={36} color="var(--primary)" />
                  <p style={{ fontWeight: 600 }}>Ready to generate compliance document.</p>
                  <button 
                    onClick={handleDirectDraft} 
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                  >
                    Draft with Quality Copilot
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => { setShowDirectDraftModal(false); setDirectDraftText(''); }} 
                className="btn btn-secondary"
              >
                Discard Draft
              </button>
              <button 
                type="button" 
                onClick={handleDirectApprove} 
                className="btn btn-primary" 
                disabled={!directDraftText}
              >
                Approve & Map to Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
