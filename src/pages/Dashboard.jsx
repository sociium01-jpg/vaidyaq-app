import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { useToast } from '../components/ToastProvider';
import { jsPDF } from 'jspdf';
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
  Copy,
  Printer
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
    setDocuments,
    activeHospitalId,
    accessibleHospitals,
    switchActiveBranch,
    incidents,
    committees
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

  // Date Range Filters State (defaulting to May 1, 2026 to July 1, 2026 to capture all demo data)
  const [fromDate, setFromDate] = useState('2026-05-01');
  const [toDate, setToDate] = useState('2026-07-01');

  // Date Range Filter Helper
  const isWithinDateRange = (dateStr) => {
    if (!dateStr) return true;
    const cleanDate = String(dateStr).substring(0, 10);
    if (fromDate && cleanDate < fromDate) return false;
    if (toDate && cleanDate > toDate) return false;
    return true;
  };

  // Filtered arrays based on selected date range
  const displayAudits = (audits || []).filter(a => isWithinDateRange(a.date));
  const displayCapaItems = (capaItems || []).filter(c => isWithinDateRange(c.dueDate));
  const displayTasks = (tasks || []).filter(t => isWithinDateRange(t.dueDate));
  const displayIncidents = (incidents || []).filter(i => isWithinDateRange(i.dateTime));
  const displayLicenses = (licenses || []).filter(l => isWithinDateRange(l.expiryDate || l.issueDate));

  // Extract all meetings from committees
  const allMeetings = (committees || []).flatMap(comm => 
    (comm.meetings || []).map(meet => ({
      ...meet,
      committeeId: comm.id,
      committeeName: comm.name,
      chair: comm.chair
    }))
  );
  const displayMeetings = allMeetings.filter(m => isWithinDateRange(m.date));

  // Filtered counts
  const displayOpenCapasCount = displayCapaItems.filter(c => c.status === 'Open').length;
  const displayPendingAuditsCount = displayAudits.filter(a => a.status === 'Scheduled').length;
  const displayOverdueTasksCount = displayTasks.filter(t => t.status !== 'Completed' && t.dueDate < new Date().toISOString().split('T')[0]).length;
  const displayIncidentsCount = displayIncidents.length;

  // 1. Export PDF (Using client-side jsPDF)
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Page Border
      doc.setDrawColor(13, 148, 136); // Teal
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287); // Border
      
      // Header
      doc.setFillColor(13, 148, 136);
      doc.rect(5, 5, 200, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("VAIDYAQ CLINICAL COMPLIANCE PERFORMANCE REPORT", 12, 20);
      
      // Meta Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Hospital: ${hospitalName}`, 15, 42);
      doc.text(`Beds: ${hospitalBeds} | Tier: ${hospitalTier}`, 15, 48);
      doc.text(`Accreditation Readiness: ${readinessScore}%`, 15, 54);
      doc.text(`Date Range: ${fromDate || 'All'} to ${toDate || 'All'}`, 15, 60);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 65, 195, 65);
      
      // Summary Counts
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary Indicators", 15, 75);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`- Total Scheduled Audits: ${displayPendingAuditsCount}`, 20, 85);
      doc.text(`- Active CAPA Trackers: ${displayOpenCapasCount}`, 20, 91);
      doc.text(`- Overdue Compliance Tasks: ${displayOverdueTasksCount}`, 20, 97);
      doc.text(`- Reported Clinical Incidents: ${displayIncidentsCount}`, 20, 103);
      doc.text(`- Recorded Committee Meetings: ${displayMeetings.length}`, 20, 109);
      
      doc.line(15, 115, 195, 115);
      
      // Active CAPA list
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("2. Active CAPA Items", 15, 125);
      
      doc.setFontSize(9);
      let y = 135;
      if (displayCapaItems.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("No active CAPA items in this date range.", 20, y);
        y += 10;
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("CAPA ID", 15, y);
        doc.text("Department", 35, y);
        doc.text("Responsible", 65, y);
        doc.text("Priority", 105, y);
        doc.text("Due Date", 125, y);
        doc.text("Status", 150, y);
        
        doc.line(15, y + 2, 195, y + 2);
        y += 7;
        doc.setFont("helvetica", "normal");
        
        displayCapaItems.slice(0, 8).forEach(c => {
          doc.text((c.id || '').substring(0, 8), 15, y);
          doc.text((c.department || '').substring(0, 15), 35, y);
          doc.text((c.responsible || '').substring(0, 20), 65, y);
          doc.text((c.priority || ''), 105, y);
          doc.text((c.dueDate || ''), 125, y);
          doc.text((c.status || ''), 150, y);
          y += 6;
        });
      }
      
      doc.line(15, y + 3, 195, y + 3);
      y += 10;
      
      // Recent Audits
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("3. Recent Internal Audits", 15, y);
      y += 10;
      
      doc.setFontSize(9);
      if (displayAudits.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("No audits scheduled or completed in this date range.", 20, y);
        y += 10;
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("Audit ID", 15, y);
        doc.text("Title", 35, y);
        doc.text("Department", 85, y);
        doc.text("Date", 120, y);
        doc.text("Status", 145, y);
        doc.text("Gaps", 170, y);
        
        doc.line(15, y + 2, 195, y + 2);
        y += 7;
        doc.setFont("helvetica", "normal");
        
        displayAudits.slice(0, 8).forEach(a => {
          doc.text((a.id || '').substring(0, 8), 15, y);
          doc.text((a.title || '').substring(0, 25), 35, y);
          doc.text((a.department || ''), 85, y);
          doc.text((a.date || ''), 120, y);
          doc.text((a.status || ''), 145, y);
          doc.text(`${(a.findings || []).length} NCs`, 170, y);
          y += 6;
        });
      }
      
      doc.save(`VaidyaQ_Compliance_Report_${hospitalName.replace(/\s+/g, '_')}.pdf`);
      showToast({ title: "PDF Generated", message: "Compliance Performance report PDF downloaded.", type: "success" });
    } catch (err) {
      console.error(err);
      showToast({ title: "Export Error", message: "Could not compile PDF report.", type: "error" });
    }
  };

  // 2. Export Excel (XLS)
  const handleExportExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/><style>
      table { border-collapse: collapse; font-family: sans-serif; font-size: 10pt; }
      th { background-color: #0d9488; color: white; font-weight: bold; border: 1px solid #d1d5db; padding: 6px; }
      td { border: 1px solid #d1d5db; padding: 6px; }
      .header { font-size: 14pt; font-weight: bold; color: #111827; }
      .meta { font-size: 9pt; color: #4b5563; }
    </style></head>
    <body>
      <div class="header">NABH Compliance & Quality Performance Summary - ${hospitalName}</div>
      <div class="meta">Date Filter: ${fromDate || 'All'} to ${toDate || 'All'}</div>
      <div class="meta">Accreditation Readiness Score: <b>${readinessScore}%</b></div>
      <div class="meta">Exported Date: ${new Date().toLocaleDateString('en-IN')}</div>
      <br/>
      <h3>1. Summary Indicators</h3>
      <table>
        <thead>
          <tr>
            <th>Indicator Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Total Scheduled Audits</td><td>${displayPendingAuditsCount}</td></tr>
          <tr><td>Active CAPA Trackers</td><td>${displayOpenCapasCount}</td></tr>
          <tr><td>Overdue Tasks</td><td>${displayOverdueTasksCount}</td></tr>
          <tr><td>Reported Patient Incidents</td><td>${displayIncidentsCount}</td></tr>
        </tbody>
      </table>
      <br/>
      <h3>2. Active CAPA Items</h3>
      <table>
        <thead>
          <tr>
            <th>CAPA ID</th>
            <th>Source</th>
            <th>Department</th>
            <th>Responsible</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>`;
    displayCapaItems.forEach(c => {
      html += `<tr>
        <td>${c.id}</td>
        <td>${c.source}</td>
        <td>${c.department}</td>
        <td>${c.responsible}</td>
        <td>${c.priority}</td>
        <td>${c.dueDate}</td>
        <td>${c.status}</td>
      </tr>`;
    });
    html += `</tbody></table>
      <br/>
      <h3>3. Internal Audits</h3>
      <table>
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Title</th>
            <th>Department</th>
            <th>Auditor</th>
            <th>Date</th>
            <th>Status</th>
            <th>Findings Count</th>
          </tr>
        </thead>
        <tbody>`;
    displayAudits.forEach(a => {
      html += `<tr>
        <td>${a.id}</td>
        <td>${a.title}</td>
        <td>${a.department}</td>
        <td>${a.auditor}</td>
        <td>${a.date}</td>
        <td>${a.status}</td>
        <td>${(a.findings || []).length}</td>
      </tr>`;
    });
    html += `</tbody></table>
      <br/>
      <h3>4. Clinical Committee Meetings</h3>
      <table>
        <thead>
          <tr>
            <th>Committee</th>
            <th>Meeting Date</th>
            <th>Chairperson</th>
            <th>Agenda</th>
            <th>Action Items Count</th>
          </tr>
        </thead>
        <tbody>`;
    displayMeetings.forEach(m => {
      html += `<tr>
        <td>${m.committeeName}</td>
        <td>${m.date}</td>
        <td>${m.chair}</td>
        <td>${m.agenda}</td>
        <td>${(m.actionItems || []).length}</td>
      </tr>`;
    });
    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VaidyaQ_Dashboard_Report_${hospitalName.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ title: "Excel Exported", message: "Compliance performance report XLS downloaded.", type: "success" });
  };

  // 3. Export Word (DOC)
  const handleExportDOC = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/><style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
      h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 6px; font-size: 20pt; }
      h2 { color: #0f766e; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; font-size: 14pt; margin-top: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th { background-color: #f3f4f6; font-weight: bold; border: 1px solid #d1d5db; padding: 8px; text-align: left; }
      td { border: 1px solid #d1d5db; padding: 8px; }
      .summary-box { background-color: #f0fdfa; padding: 12px; border: 1px solid #ccfbf1; border-radius: 6px; margin-bottom: 20px; }
    </style></head>
    <body>
      <h1>VaidyaQ Executive Compliance Briefing</h1>
      <div class="summary-box">
        <p><b>Hospital / Facility Name:</b> ${hospitalName}</p>
        <p><b>Statutory Capacity:</b> ${hospitalBeds} Beds | Tier: ${hospitalTier}</p>
        <p><b>Date Range:</b> ${fromDate || 'All'} to ${toDate || 'All'}</p>
        <p><b>NABH 6th Edition Readiness Index:</b> ${readinessScore}%</p>
        <p><b>Exported Date:</b> ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <h2>1. Key Quality and Performance Indicators</h2>
      <ul>
        <li><b>Scheduled Audits:</b> ${displayPendingAuditsCount} pending</li>
        <li><b>Open CAPA Items:</b> ${displayOpenCapasCount} active remediation trackers</li>
        <li><b>Overdue Compliance Tasks:</b> ${displayOverdueTasksCount} tasks requiring immediate attention</li>
        <li><b>Reported Clinical Incidents:</b> ${displayIncidentsCount} cases logged</li>
      </ul>
      
      <h2>2. Active Corrective Actions (CAPA)</h2>`;
      if (displayCapaItems.length === 0) {
        html += `<p>No active CAPA items within this date range.</p>`;
      } else {
        html += `<table>
          <thead>
            <tr>
              <th>CAPA ID</th>
              <th>Department</th>
              <th>Responsible</th>
              <th>Action Plan</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>`;
        displayCapaItems.forEach(c => {
          html += `<tr>
            <td>${c.id}</td>
            <td>${c.department}</td>
            <td>${c.responsible}</td>
            <td>${c.correctiveAction}</td>
            <td>${c.dueDate}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }
      
      html += `<h2>3. Committee Meetings Minutes Summary</h2>`;
      if (displayMeetings.length === 0) {
        html += `<p>No committee meetings recorded in this date range.</p>`;
      } else {
        displayMeetings.forEach(m => {
          html += `<div style="margin-top: 15px; padding: 10px; border-left: 4px solid #0d9488; background-color: #fafafa;">
            <p><b>Committee:</b> ${m.committeeName} | <b>Date:</b> ${m.date}</p>
            <p><b>Agenda:</b> ${m.agenda}</p>
            <p><b>Minutes:</b> ${m.minutes}</p>
          </div>`;
        });
      }
      
      html += `</body></html>`;

      const blob = new Blob([html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `VaidyaQ_Compliance_Executive_Briefing_${hospitalName.replace(/\s+/g, '_')}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast({ title: "Word Document Downloaded", message: "Compliance briefing brief downloaded.", type: "success" });
  };

  // 4. Print Summary
  const handlePrint = () => {
    window.print();
    logActivity("Triggered print dialogue for the Compliance Dashboard.");
  };

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
            <div style={{ color: (teamMembers || []).length > 0 ? 'var(--color-success)' : 'var(--text-tertiary)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Coordinate Quality Committee team ({(teamMembers || []).length} active)</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Invite board members and coordinators to outline responsibilities.</div>
            </div>
          </div>

          {/* Step 3: Template Importing */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: onboardingSteps?.importTemplates ? 'var(--color-success)' : 'var(--text-tertiary)', marginTop: '2px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Initialize NABH 6th Edition Templates</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Preload default outline structures for statutory license requirements and SOP guides.</div>
              {!onboardingSteps?.importTemplates && (
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
      const clientObj = (clientsList || []).find(c => c && c.hospitalId === hospId) || { hospitalName: hospId === 'demo-hosp' ? "City Central Metro Hospital" : hospId === 'sarah-hosp' ? "Central City Clinic" : hospId, beds: 50 };
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
    // Re-calculate date-filtered high risk departments
    const activeCapas = displayCapaItems.filter(c => c.status === 'Open');
    const expiredLicenses = displayLicenses.filter(l => l.status === 'Expired');
    const riskDepts = new Set();
    activeCapas.forEach(c => riskDepts.add(c.department));
    expiredLicenses.forEach(l => riskDepts.add(l.responsible || "Administration"));
    const filteredHighRiskDeptsCount = riskDepts.size;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Dashboard Header, Exporter & Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Command Center Director Suite
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Accreditation readiness indicators, active team operations, and compliance status for {hospitalName}.
            </p>
          </div>
          
          {/* Controls: Date Picker & Export Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Date Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From:</span>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>To:</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            {/* Export Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleDownloadPDF} 
                className="btn btn-secondary flex align-center gap-1" 
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                title="Download PDF Report"
              >
                <FileDown size={14} /> PDF
              </button>
              <button 
                onClick={handleExportExcel} 
                className="btn btn-secondary flex align-center gap-1" 
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                title="Download Excel Spreadsheet"
              >
                <FileDown size={14} /> Excel
              </button>
              <button 
                onClick={handleExportDOC} 
                className="btn btn-secondary flex align-center gap-1" 
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                title="Download Word Document"
              >
                <FileDown size={14} /> Word
              </button>
              <button 
                onClick={handlePrint} 
                className="btn btn-secondary flex align-center gap-1" 
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                title="Print Dashboard Report"
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
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
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{(teamMembers || []).length} Members</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Role-based boundaries enforced</div>
            </div>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Risk Hotspots</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: filteredHighRiskDeptsCount > 0 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '0.5rem' }}>{filteredHighRiskDeptsCount} Departments</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Active risk mitigation trackers</div>
            </div>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending SOP Approvals</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{(documents || []).filter(d=>d.status==='Pending Review').length} Outlines</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Requires Quality Head signature</div>
            </div>
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Patient Incidents</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{displayIncidentsCount} Cases</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Logged within selected range</div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Chart 1: Incident Trends */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-danger)' }} />
              Clinical Incident Trends
            </h3>
            <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {(() => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const values = Array(12).fill(0);
                displayIncidents.forEach(inc => {
                  if (inc.dateTime) {
                    try {
                      const mIdx = new Date(inc.dateTime.split(' ')[0]).getMonth();
                      if (mIdx >= 0 && mIdx < 12) values[mIdx]++;
                    } catch(e) {}
                  }
                });
                const maxVal = Math.max(...values, 4);
                return (
                  <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 0.5rem' }}>
                    {values.map((val, mIdx) => {
                      const barHeight = (val / maxVal) * 120;
                      return (
                        <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: val > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{val}</span>
                          <div style={{
                            width: '16px',
                            height: `${Math.max(barHeight, 4)}px`,
                            background: val > 0 ? 'linear-gradient(to top, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 0.4))' : 'var(--bg-tertiary)',
                            borderRadius: '4px 4px 0 0',
                            marginTop: '0.25rem',
                            transition: 'all 0.3s ease'
                          }} />
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', fontWeight: 600 }}>{months[mIdx]}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Chart 2: CAPAs by Department */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--primary)' }} />
              Active CAPAs by Department
            </h3>
            <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
              {(() => {
                const deptMap = {};
                displayCapaItems.forEach(c => {
                  deptMap[c.department] = (deptMap[c.department] || 0) + 1;
                });
                const depts = Object.keys(deptMap);
                if (depts.length === 0) {
                  return <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No active CAPAs found in this range.</div>;
                }
                const maxVal = Math.max(...Object.values(deptMap), 2);
                return depts.slice(0, 4).map(dept => {
                  const val = deptMap[dept];
                  const widthPercent = (val / maxVal) * 100;
                  return (
                    <div key={dept} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600 }}>
                        <span>{dept}</span>
                        <span>{val} CAPAs</span>
                      </div>
                      <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${widthPercent}%`, background: 'linear-gradient(to right, var(--primary), var(--secondary))', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Audits & Meetings Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Recent Internal Audits list */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
              Audit Performance Ledger (Filtered)
            </h3>
            {displayAudits.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>No audits matched this date range.</p>
            ) : (
              <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Dept</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Critical Gaps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayAudits.slice(0, 5).map(aud => {
                      const unresolved = (aud.findings || []).filter(f => !f.resolved).length;
                      return (
                        <tr key={aud.id}>
                          <td><strong>{aud.title}</strong></td>
                          <td>{aud.department}</td>
                          <td>{aud.date}</td>
                          <td>
                            <span className={`badge ${aud.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                              {aud.status}
                            </span>
                          </td>
                          <td>
                            {unresolved > 0 ? (
                              <span className="badge badge-danger">{unresolved} Critical</span>
                            ) : (
                              <span className="badge badge-success">0 Gaps</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Committee Meetings summary cards */}
          <div className="card flex flex-col" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              Committee Meetings (Filtered)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '280px' }}>
              {displayMeetings.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>No committee meetings found in this range.</p>
              ) : (
                displayMeetings.slice(0, 4).map((meet, mIdx) => (
                  <div key={mIdx} style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{meet.committeeName}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>{meet.date}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <b>Agenda:</b> {meet.agenda}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      <b>Attendees:</b> {meet.attendees.join(', ')}
                    </div>
                  </div>
                ))
              )}
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

        {/* Hospital Setup Identity & Profile Settings panel (Kept below summary and reports) */}
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
              {(standards || []).filter(s => s && s.score < 10).slice(0, 5).map(gap => (
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
              {(documents || []).filter(d => d && d.status === 'Pending Review').length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>No drafts require signature sign-off.</p>
              ) : (
                (documents || []).filter(d => d && d.status === 'Pending Review').map(doc => (
                  <div key={doc.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{doc.title}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Author: {doc.author} | Version: {doc.version}</div>
                    </div>
                    <button 
                      onClick={() => {
                        const updatedDocs = (documents || []).map(d => d.id === doc.id ? { ...d, status: 'Approved', approvedBy: currentUser?.name || currentUser?.email || 'Admin', lastReviewed: new Date().toISOString().split('T')[0] } : d);
                        setDocuments(updatedDocs); 
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
    const dept = currentUser?.department || 'Pharmacy';
    const deptStandards = (standards || []).filter(s => s && s.department === dept);
    const deptReadiness = deptStandards.length > 0 
      ? Math.round((deptStandards.reduce((acc, s) => acc + s.score, 0) / (deptStandards.length * 10)) * 100) 
      : 100;

    const deptTasks = (tasks || []).filter(t => t && t.department === dept && t.status !== 'Completed');
    const deptAudits = (audits || []).filter(a => a && a.department === dept);

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
    const myTasks = (tasks || []).filter(t => t && (t.assignedToEmail === currentUser?.email || t.assignedTo === currentUser?.name));
    const myOpenTasks = myTasks.filter(t => t && t.status !== 'Completed');
    
    // Check overdue tasks
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueCount = myOpenTasks.filter(t => t && new Date(t.dueDate) < today).length;

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
      
      (qualityIndicators || []).forEach(row => {
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
                {(qualityIndicators || []).map(row => {
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

  const renderSectionSummaryGrid = () => {
    const approvedDocs = (documents || []).filter(d => d.status === 'Approved').length;
    const pendingDocs = (documents || []).filter(d => d.status !== 'Approved').length;

    const closedCapa = (capaItems || []).filter(c => c.status === 'Closed').length;
    const openCapa = (capaItems || []).filter(c => c.status === 'Open').length;

    const activeLic = (licenses || []).filter(l => l.status === 'Active').length;
    const pendingLic = (licenses || []).filter(l => l.status !== 'Active').length;

    const doneTasks = (tasks || []).filter(t => t.status === 'Completed').length;
    const pendingTasks = (tasks || []).filter(t => t.status !== 'Completed').length;

    const sections = [
      {
        title: 'Document Control',
        icon: FileText,
        path: '/app/documents',
        metrics: {
          done: `${approvedDocs} Approved`,
          pending: `${pendingDocs} Review / Draft`
        },
        color: 'var(--primary)'
      },
      {
        title: 'Quality & CAPA',
        icon: Activity,
        path: '/app/quality',
        metrics: {
          done: `${closedCapa} CAPAs Closed`,
          pending: `${openCapa} CAPAs Open`
        },
        color: '#3b82f6'
      },
      {
        title: 'Statutory Compliance',
        icon: Shield,
        path: '/app/compliance',
        metrics: {
          done: `${activeLic} Active Licenses`,
          pending: `${pendingLic} Expired / Renewing`
        },
        color: '#f59e0b'
      },
      {
        title: 'Task Management',
        icon: ListTodo,
        path: '/app/tasks',
        metrics: {
          done: `${doneTasks} Completed`,
          pending: `${pendingTasks} Active / Overdue`
        },
        color: '#10b981'
      }
    ];

    return (
      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Interactive Section Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div 
                key={idx}
                onClick={() => setCurrentRoute(sec.path)}
                className="card glow-premium"
                style={{ 
                  padding: '1.25rem', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = sec.color;
                  e.currentTarget.style.boxShadow = `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px ${sec.color}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Visual accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: sec.color }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: `${sec.color}15`, color: sec.color, display: 'flex', alignItems: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{sec.title}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>→</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontSize: '0.5rem' }}>●</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Done: <strong>{sec.metrics.done}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.5rem' }}>●</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Pending: <strong>{sec.metrics.pending}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Section Summary Grid for client-side hospital view */}
      {!orgMode && renderSectionSummaryGrid()}

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
