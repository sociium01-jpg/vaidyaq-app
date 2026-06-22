import React, { useState, useContext, useEffect, useRef } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { runAIOrchestration } from '../services/aiOrchestrator';
import {
  Brain,
  Send,
  Sparkles,
  FileCode,
  CheckSquare,
  FileDown,
  AlertCircle,
  CheckCircle2,
  Copy,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Helper to determine step-by-step workflow stages for visual flowcharts based on SOP Title / Code
const getFlowchartSteps = (title = '', content = '') => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('high-alert') || titleLower.includes('medication safety') || titleLower.includes('mom.2.c')) {
    return [
      { step: "1", title: "Prescription Check", desc: "Verify generic name, dosage & clinical justification", icon: "clipboard" },
      { step: "2", title: "Dual Custody Unlock", desc: "Two staff members must co-unlock the locked steel cupboard", icon: "key" },
      { step: "3", title: "Double-Signature Verify", desc: "Verify Patient, Drug, Route, Timing, Dose, and Expiry", icon: "users" },
      { step: "4", title: "Red Badge Labelling", desc: "Affix high-contrast red warning label to IV syringe/bag", icon: "tag" },
      { step: "5", title: "Co-signed HIMS Entry", desc: "Record administration details and witness co-sign", icon: "edit" }
    ];
  }
  if (titleLower.includes('expiry') || titleLower.includes('expired') || titleLower.includes('mom.3.a')) {
    return [
      { step: "1", title: "Monthly Shelf Audit", desc: "Pharmacist audits shelf expiries on the 1st of every month", icon: "calendar" },
      { step: "2", title: "Red Box Isolation", desc: "Segregate near-expiry and expired batches immediately", icon: "package" },
      { step: "3", title: "Locked Bin Custody", desc: "Store in labeled secure waste bin under dual lock", icon: "lock" },
      { step: "4", title: "Verification Check", desc: "Pharmacist & Quality Head verify waste log correctness", icon: "user-check" },
      { step: "5", title: "Chemical Destruction", desc: "Safe write-off disposal according to NFI guidelines", icon: "trash" }
    ];
  }
  if (titleLower.includes('fire') || titleLower.includes('safety') || titleLower.includes('fms.1.d') || titleLower.includes('drill')) {
    return [
      { step: "1", title: "Alarm Activation", desc: "Sound physical fire alarm and call extension 555", icon: "bell" },
      { step: "2", title: "Patient Rescue", desc: "Remove patients and visitors from immediate danger zone", icon: "heart" },
      { step: "3", title: "Smoke Containment", desc: "Close fire-resistant doors and window shutters", icon: "shield" },
      { step: "4", title: "PASS Extinguisher", desc: "Deploy canisters using Pull, Aim, Squeeze, Sweep method", icon: "wind" },
      { step: "5", title: "Muster & Attendance", desc: "Assemble at evacuation point and log attendance records", icon: "users" }
    ];
  }
  if (titleLower.includes('waste') || titleLower.includes('hazardous') || titleLower.includes('fms.2.a') || titleLower.includes('bio')) {
    return [
      { step: "1", title: "Color Segregation", desc: "Yellow (infectious), Red (plastics), Blue (glass), White (sharps)", icon: "filter" },
      { step: "2", title: "Biohazard Labeling", desc: "Affix barcode manifest label with date and weight", icon: "tag" },
      { step: "3", title: "PPE Safe Transport", desc: "Housekeeping staff wears heavy-duty gloves, boots, and masks", icon: "user" },
      { step: "4", title: "Secured Store Room", desc: "Hold temporarily in locked waste yard under ventilation", icon: "lock" },
      { step: "5", title: "Board Carrier handoff", desc: "Transfer manifest details to Pollution Board truck driver", icon: "truck" }
    ];
  }
  if (titleLower.includes('icu') || titleLower.includes('critical') || titleLower.includes('cop.5.c')) {
    return [
      { step: "1", title: "Triage Score Check", desc: "Check clinical admission trigger thresholds", icon: "trending-up" },
      { step: "2", title: "ICU Bed Allocation", desc: "Confirm high-dependency ventilator bed availability", icon: "grid" },
      { step: "3", title: "Consultant Briefing", desc: "Notify ICU duty specialist and prepare vital monitors", icon: "phone" },
      { step: "4", title: "SBAR Shift Handover", desc: "Nurse-to-nurse clinical handover log entry", icon: "shuffle" },
      { step: "5", title: "Continuous Monitoring", desc: "Initiate digital vital charts and ventilator protocols", icon: "activity" }
    ];
  }
  if (titleLower.includes('infection') || titleLower.includes('hygiene') || titleLower.includes('hrm.2.b')) {
    return [
      { step: "1", title: "Scrubbing Session", desc: "Train staff in WHO 5 Moments and 6 washing steps", icon: "shield" },
      { step: "2", title: "PPE Protocol Check", desc: "Verify proper wearing of gowns, N95 masks, and gloves", icon: "user" },
      { step: "3", title: "Aseptic Preparation", desc: "Sterilize clinical site with Chlorhexidine wash", icon: "droplet" },
      { step: "4", title: "Disinfection Cycle", desc: "Clean equipment surfaces and autoclave surgical tools", icon: "refresh-cw" },
      { step: "5", title: "Hygiene Compliance Log", desc: "Audit adherence scores and log staff quizzes", icon: "check-circle" }
    ];
  }
  if (titleLower.includes('credential') || titleLower.includes('qualification') || titleLower.includes('hrm.1.a')) {
    return [
      { step: "1", title: "Credentials Upload", desc: "Collect degree certificates, council registrations, and CVs", icon: "folder-open" },
      { step: "2", title: "Primary Verification", desc: "Cross-check details with universities and medical councils", icon: "globe" },
      { step: "3", title: "Privileging Audit", desc: "Review and assess clinical privileging scopes", icon: "briefcase" },
      { step: "4", title: "Privilege Sign-off", desc: "Board issue authorized clinical privilege certificate", icon: "key" },
      { step: "5", title: "Annual Renewal Track", desc: "Monitor CME points and update council expiry records", icon: "refresh-cw" }
    ];
  }

  // Generic Fallback Steps
  return [
    { step: "1", title: "Initiate Procedure", desc: "Verify ownership department guidelines", icon: "play" },
    { step: "2", title: "Verify Authorization", desc: "Check staff credentials and qualification records", icon: "user-check" },
    { step: "3", title: "Execute Protocol", desc: "Follow detailed instructions under clinical checklist", icon: "settings" },
    { step: "4", title: "Activity Register Logging", desc: "Update checklist, registers, or CAPA templates", icon: "file-signature" },
    { step: "5", title: "Quality Audit Review", desc: "Track performance indicators and update revision v", icon: "history" }
  ];
};

export default function AIInsightsModule() {
  const {
    readinessScore,
    openCapasCount,
    missingEvidenceCount,
    overdueTasksCount,
    pendingAuditsCount,
    incidentsThisMonthCount,
    standards,
    documents,
    approveSOPDraft,
    logActivity,
    analyzeEvidenceFile,
    complianceKnowledgeBase,
    addDocument,
    updateStandardScore,
    capaItems,
    licenses,
    hospitalName,
    currentUser,
    aiSettings,
    getDecryptedKey,
    createAiOutput,
    logAiUsage,
    logAiSafety,
    aiMemory,
    aiOutputs,
    updateAiOutputStatus
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('copilot'); // 'copilot', 'sop', 'gap', 'ceo'
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState([]);

  // 1. AI Copilot Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello, I am VaidyaQ AI. I scan your hospital's active documents, licenses, audits, and CAPA logs. Ask me anything about audit readiness!"
    }
  ]);
  const chatEndRef = useRef(null);

  // Chat attachments states
  const [attachedFile, setAttachedFile] = useState(null); // { name: '', type: 'pdf' | 'image' | 'video' }
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // 2. SOP Generator States
  const [sopTitle, setSopTitle] = useState('High-Alert Medication Dispensing Protocol');
  const [sopDepartment, setSopDepartment] = useState('Pharmacy');
  const [sopStandard, setSopStandard] = useState('MOM.2.c');
  const [sopDraftText, setSopDraftText] = useState('');
  const [sopDrafting, setSopDrafting] = useState(false);
  const [sopApprovedAlert, setSopApprovedAlert] = useState(false);

  // 3. Gap Checker States
  const [uploadChecking, setUploadChecking] = useState(false);
  const [gapCheckResult, setGapCheckResult] = useState(null);
  const [selectedGapFile, setSelectedGapFile] = useState(null);
  const [gapFileContent, setGapFileContent] = useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Dynamic variables for CEO briefing and chatbot
  const activeCapas = capaItems ? capaItems.filter(c => c.status === 'Open') : [];
  const expiredLicenses = licenses ? licenses.filter(l => {
    if (!l.expiryDate) return true; // Treat un-uploaded as expired/alerted
    const exp = new Date(l.expiryDate);
    return isNaN(exp.getTime()) || exp < new Date();
  }) : [];

  const riskDepts = new Set();
  activeCapas.forEach(c => riskDepts.add(c.department));
  expiredLicenses.forEach(l => {
    const dept = l.responsible || "Administration";
    riskDepts.add(dept);
  });
  const highRiskDeptsCount = riskDepts.size;

  // Compile liabilities
  const liabilitiesList = [];
  expiredLicenses.forEach(l => {
    liabilitiesList.push({
      title: `Expired Statutory License: ${l.name}`,
      text: `The statutory authorization is currently marked Expired or Not Uploaded. Immediate action required.`
    });
  });
  activeCapas.forEach(c => {
    liabilitiesList.push({
      title: `Unresolved ${c.department} CAPA Item`,
      text: `Finding source: "${c.source}". Action item is assigned to ${c.responsible || 'unassigned'} with priority ${c.priority}.`
    });
  });
  const firstThreeGaps = standards.filter(s => s.score < 10).slice(0, 3);
  firstThreeGaps.forEach(g => {
    liabilitiesList.push({
      title: `Missing Evidence SOP: ${g.id}`,
      text: `Standard element "${g.title}" in department ${g.department || 'Global'} has no mapped evidence documents.`
    });
  });

  // Compile actions
  const actionItemsList = [];
  expiredLicenses.forEach(l => {
    actionItemsList.push(`Submit renewal and upload files for statutory license: ${l.name}.`);
  });
  activeCapas.forEach(c => {
    actionItemsList.push(`Quality Manager to verify corrective action and close open CAPA for ${c.department} ("${c.source}").`);
  });
  const firstGap = standards.find(s => s.score < 10);
  if (firstGap) {
    actionItemsList.push(`Department HOD to draft and approve the evidence SOP for standard ${firstGap.id}.`);
  }
  if (actionItemsList.length === 0) {
    actionItemsList.push("No outstanding urgent action items. All accreditation checks are fully verified.");
  }

  // AI Copilot Responses (dynamic query on context state or live API keys)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (chatInput.trim() === '' && !attachedFile) return;

    const userText = chatInput;
    const currentAttachment = attachedFile;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText || `Uploaded attachment: ${currentAttachment.name}`, attachment: currentAttachment }]);
    setChatInput('');
    setAttachedFile(null);
    setIsAiTyping(true);
    setWorkflowSteps(['Initializing VaidyaQ AI Agent...']);

    // Animate workflow steps
    const step1 = setTimeout(() => {
      setWorkflowSteps(prev => [...prev, 'Analyzing conversation memory & context...']);
    }, 450);
    const step2 = setTimeout(() => {
      setWorkflowSteps(prev => [...prev, `Retrieving Hospital Command Center context (Readiness: ${readinessScore}%, CAPAs: ${openCapasCount})...`]);
    }, 900);
    const step3 = setTimeout(() => {
      setWorkflowSteps(prev => [...prev, 'Applying NABH 6th Edition quality rules...']);
    }, 1350);
    const step4 = setTimeout(() => {
      setWorkflowSteps(prev => [...prev, `Executing reasoning loop via ${aiProvider === 'mock' ? 'local sandbox' : aiProvider}...`]);
    }, 1800);

    try {
      const result = await runAIOrchestration({
        module: 'chatbot',
        agentType: 'VaidyaQ AI Chatbot',
        prompt: userText || `Inspect attachment: ${currentAttachment.name}`,
        chatHistory: chatMessages,
        contextData: {
          readinessScore,
          openCapasCount,
          missingEvidenceCount,
          overdueTasksCount,
          pendingAuditsCount,
          incidentsThisMonthCount,
          hospitalName
        },
        aiSettings,
        currentUser,
        hospitalName,
        aiMemory,
        getDecryptedKey,
        createAiOutput,
        logAiUsage,
        logAiSafety
      });

      if (!result.success) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: `⚠️ AI Guardrail Alert: ${result.error}`, confidence: 'Low' }]);
        return;
      }

      const responseText = result.text;
      const isAttachment = !!currentAttachment;
      const queryLower = (userText || '').toLowerCase();
      let confidenceLevel = 'High';
      if (queryLower.includes('missing') || queryLower.includes('gap') || queryLower.includes('risk')) {
        confidenceLevel = 'Medium';
      } else if (isAttachment && currentAttachment.type === 'pdf') {
        confidenceLevel = 'Medium';
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText, confidence: confidenceLevel }]);
      logActivity(currentAttachment ? `Uploaded attachment for AI inspection: ${currentAttachment.name}` : `Consulted VaidyaQ AI: "${userText}"`);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Failed to execute AI query: ${err.message}`, confidence: 'Low' }]);
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      setIsAiTyping(false);
      setWorkflowSteps([]);
    }
  };

  // SOP Draft Generator (calls runAIOrchestration with fallback)
  const handleDraftSOP = async () => {
    setSopDrafting(true);
    try {
      const prompt = `Draft a comprehensive, production-ready Standard Operating Procedure (SOP) policy document.
SOP Title: ${sopTitle}
Department: ${sopDepartment}
Mapped Standard: ${sopStandard}`;

      const result = await runAIOrchestration({
        module: 'documents',
        agentType: 'Document AI Assistant',
        prompt: prompt,
        chatHistory: [],
        contextData: {
          title: sopTitle,
          department: sopDepartment,
          standard: sopStandard,
          hospitalName
        },
        aiSettings,
        currentUser,
        hospitalName,
        aiMemory,
        getDecryptedKey,
        createAiOutput,
        logAiUsage,
        logAiSafety
      });

      if (result.success) {
        setSopDraftText(result.text);
        logActivity(`Generated SOP draft for "${sopTitle}"`);
      } else {
        alert(`Failed to draft SOP: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSopDrafting(false);
    }
  };

  const handleApproveSOP = () => {
    approveSOPDraft(sopTitle, sopDepartment, [sopStandard], sopDraftText);
    setSopApprovedAlert(true);
    setTimeout(() => {
      setSopApprovedAlert(false);
    }, 4000);
  };

  // AI Gap Checker scanner
  const handleGapFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedGapFile(file);
    setUploadChecking(true);
    setGapCheckResult(null);

    // Read file contents
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setGapFileContent(content);

      // Analyze file and find matching standard based on content and filename keywords
      setTimeout(() => {
        const searchSpace = `${file.name} ${content}`.toLowerCase();
        
        // Find best matching standard ID
        let matchedStdId = "AAC.1.a"; // default fallback
        
        const standardMappings = [
          { std: "AAC.1.a", kws: ["registration", "opd", "out-patient"] },
          { std: "AAC.2.b", kws: ["admission", "inpatient", "triage", "consent"] },
          { std: "AAC.3.a", kws: ["discharge", "referral", "summary"] },
          { std: "COP.1.a", kws: ["care manual", "general care", "patient care"] },
          { std: "COP.2.b", kws: ["cpr", "triage", "emergency", "cardiac arrest"] },
          { std: "COP.5.c", kws: ["icu", "critical care", "intensive care"] },
          { std: "MOM.1.a", kws: ["formulary", "medication list"] },
          { std: "MOM.2.c", kws: ["high-alert", "lasa", "narcotic", "locked"] },
          { std: "MOM.3.a", kws: ["expiry", "expired", "disposal"] },
          { std: "FMS.1.d", kws: ["fire", "drill", "evacuation", "mock drill"] },
          { std: "FMS.2.a", kws: ["hazmat", "hazardous", "waste log", "pollution"] },
          { std: "HRM.1.a", kws: ["credential", "qualification", "license"] },
          { std: "HRM.2.b", kws: ["infection", "hygiene", "scrub", "handwash"] }
        ];

        // Scoring standards for match strength
        let maxMatchCount = -1;
        standardMappings.forEach(mapping => {
          const matchCount = mapping.kws.filter(kw => searchSpace.includes(kw)).length;
          if (matchCount > maxMatchCount && matchCount > 0) {
            maxMatchCount = matchCount;
            matchedStdId = mapping.std;
          }
        });

        // Run compliance scan
        const scan = analyzeEvidenceFile(file.name, content, matchedStdId);
        const standardName = standards.find(s => s.id === matchedStdId)?.title || "Standard Element";

        setGapCheckResult({
          docName: file.name,
          standardId: matchedStdId,
          chapter: `${matchedStdId} (${standardName})`,
          strength: scan.score === 10 ? "Strong" : scan.score === 5 ? "Medium" : "Weak",
          status: scan.status,
          success: scan.success,
          score: scan.score,
          gaps: scan.gaps.length > 0 ? scan.gaps : ["None! All compliance keywords found."],
          advice: scan.success 
            ? `Successfully scanned. Map this document to standard ${matchedStdId}. It meets the core requirements.`
            : `Scan rejected. To approve this file under ${matchedStdId}, please include: ${complianceKnowledgeBase[matchedStdId]?.mandatoryKeywords.join(', ')}`
        });
        
        setUploadChecking(false);
        logActivity(`Analyzed document ${file.name} for AI Gap Check`);
      }, 1200);
    };
    reader.readAsText(file.slice(0, 50000));
  };

  const handleApplyGapRecommendation = () => {
    if (!gapCheckResult || !selectedGapFile) return;

    const matchedStdId = gapCheckResult.standardId;
    const docTitle = selectedGapFile.name.split('.').slice(0, -1).join('.') || selectedGapFile.name;
    const standardObj = standards.find(s => s.id === matchedStdId);

    // Save document to vault
    addDocument({
      title: docTitle,
      type: "Report",
      department: standardObj ? standardObj.department : "Quality",
      version: "1.0",
      status: gapCheckResult.score === 10 ? "Approved" : "Pending Review",
      author: "AI Gap Scan",
      approvedBy: gapCheckResult.score === 10 ? "AI Auto-Verification" : "Pending review sign-off",
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: [matchedStdId],
      content: `Evidence uploaded via AI Gap Checker. Matches standard ${matchedStdId}.`
    });

    // Update score
    updateStandardScore(matchedStdId, gapCheckResult.score);

    // Clear state
    setGapCheckResult(null);
    setSelectedGapFile(null);
  };

  const renderFlowchartComponent = (title, content) => {
    const steps = getFlowchartSteps(title, content);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                width: '100%', 
                padding: '0.75rem', 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '8px', 
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--primary-light)', 
                  color: 'var(--primary)', 
                  fontWeight: 'bold', 
                  fontSize: '0.75rem' 
                }}
              >
                {step.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{step.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{step.desc}</div>
              </div>
              <div style={{ fontSize: '1.1rem' }}>
                {step.icon === 'clipboard' && '📋'}
                {step.icon === 'key' && '🔑'}
                {step.icon === 'users' && '👥'}
                {step.icon === 'tag' && '🏷️'}
                {step.icon === 'edit' && '✍️'}
                {step.icon === 'calendar' && '📅'}
                {step.icon === 'package' && '📦'}
                {step.icon === 'lock' && '🔒'}
                {step.icon === 'user-check' && '👤'}
                {step.icon === 'trash' && '🗑️'}
                {step.icon === 'bell' && '🔔'}
                {step.icon === 'heart' && '❤️'}
                {step.icon === 'shield' && '🛡️'}
                {step.icon === 'wind' && '💨'}
                {step.icon === 'filter' && '🧪'}
                {step.icon === 'file-text' && '📄'}
                {step.icon === 'user' && '🧑'}
                {step.icon === 'truck' && '🚚'}
                {step.icon === 'trending-up' && '📈'}
                {step.icon === 'grid' && '🗂️'}
                {step.icon === 'phone' && '📞'}
                {step.icon === 'shuffle' && '🔀'}
                {step.icon === 'activity' && '⚡'}
                {step.icon === 'droplet' && '💧'}
                {step.icon === 'user-plus' && '➕'}
                {step.icon === 'refresh-cw' && '🔄'}
                {step.icon === 'folder-open' && '📁'}
                {step.icon === 'globe' && '🌐'}
                {step.icon === 'briefcase' && '💼'}
                {step.icon === 'play' && '▶️'}
                {step.icon === 'file-signature' && '🖊️'}
                {step.icon === 'history' && '🕒'}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div 
                style={{ 
                  width: '2px', 
                  height: '16px', 
                  backgroundColor: 'var(--primary)', 
                  margin: '0.25rem 0', 
                  opacity: 0.5 
                }} 
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Visual AI Guardrails Disclaimer Card */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)'
      }} className="flex flex-col gap-1.5">
        <h4 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', margin: 0 }}>
          ⚠️ AI Clinical Guardrails & Data Policy Disclaimer
        </h4>
        <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
          AI recommendations are strictly advisory templates. Authorized human-in-the-loop validation is mandatory before approving or executing any policies, SOPs, MOM minutes, or CAPAs (authorized clinical signature PIN: <strong>1234</strong>). Source citations are matched against the preloaded <strong>NABH 6th Edition</strong> guidelines. No patient-identifiable data or Aadhaar records are processed, satisfying strict ABDM privacy guardrails.
        </p>
      </div>

      {/* Sub navigation */}
      <div className="tabs-container">
        <button onClick={() => setActiveSubTab('copilot')} className={`tab-btn ${activeSubTab === 'copilot' ? 'active' : ''}`}>
          AI Compliance Copilot
        </button>
        <button onClick={() => setActiveSubTab('sop')} className={`tab-btn ${activeSubTab === 'sop' ? 'active' : ''}`}>
          AI SOP Generator
        </button>
        <button onClick={() => setActiveSubTab('gap')} className={`tab-btn ${activeSubTab === 'gap' ? 'active' : ''}`}>
          AI Gap Checker
        </button>
        <button onClick={() => setActiveSubTab('ceo')} className={`tab-btn ${activeSubTab === 'ceo' ? 'active' : ''}`}>
          AI CEO Briefing
        </button>
        <button onClick={() => setActiveSubTab('settings')} className={`tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}>
          ⚙️ AI API Keys Settings
        </button>
      </div>

      {/* 1. AI COPILOT CHAT VIEW */}
      {activeSubTab === 'copilot' && (
        <div className="copilot-wrapper">
          {/* Chat Panel */}
          <div className="copilot-chat-pane">
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }} className="flex align-center gap-2">
              <Brain size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>VaidyaQ AI</span>
            </div>
            
            <div className="chat-history">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                  <div className={`chat-avatar ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                    {msg.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="chat-bubble-body flex flex-col gap-2">
                    {msg.attachment && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          fontSize: '0.8rem',
                          color: '#ffffff',
                          maxWidth: '240px'
                        }}
                      >
                        {msg.attachment.type === 'pdf' && <span>📄</span>}
                        {msg.attachment.type === 'image' && <span>📷</span>}
                        {msg.attachment.type === 'video' && <span>🎥</span>}
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <strong>{msg.attachment.name}</strong>
                          <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{(msg.attachment.type).toUpperCase()} Attached</div>
                        </div>
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    {msg.sender === 'ai' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', flexWrap: 'wrap', gap: '8px' }}>
                        <span className={`ai-confidence-badge ai-confidence-${msg.confidence ? msg.confidence.toLowerCase() : 'high'}`}>
                          🎯 AI CONFIDENCE: {msg.confidence || 'HIGH'}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          ⚠️ AI Advisory — Requires Human Verification
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="chat-bubble ai" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', opacity: 0.9 }}>
                  <div className="chat-avatar ai">AI</div>
                  <div className="chat-bubble-body flex flex-col gap-2" style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} className="animate-pulse" /> VaidyaQ AI Agent Workflow:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', borderLeft: '1.5px solid var(--border-color)', marginTop: '4px' }}>
                      {workflowSteps.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', animation: 'fadeIn 0.3s ease' }}>
                          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> {step}
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginTop: '2px' }}>
                        <span className="flex gap-1" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block', animation: 'typingBounce 1.4s infinite both' }}></span>
                          <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block', animation: 'typingBounce 1.4s infinite both', animationDelay: '0.2s' }}></span>
                          <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block', animation: 'typingBounce 1.4s infinite both', animationDelay: '0.4s' }}></span>
                        </span>
                        <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-tertiary)' }}>AI agent reasoning...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar" style={{ position: 'relative' }}>
              {/* Attachment Preview Box */}
              {attachedFile && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 10
                  }}
                >
                  {attachedFile.type === 'pdf' && <span>📄</span>}
                  {attachedFile.type === 'image' && <span>📷</span>}
                  {attachedFile.type === 'video' && <span>🎥</span>}
                  <span style={{ fontWeight: 600 }}>{attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    style={{ color: 'var(--color-danger)', marginLeft: '0.25rem', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Attachment Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                style={{
                  padding: '0.5rem',
                  color: 'var(--text-secondary)',
                  borderRight: '1px solid var(--border-color)',
                  marginRight: '0.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                📎
              </button>

              {/* Attachment Menu Popup */}
              {showAttachmentMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '55px',
                    left: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    width: '180px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile({ name: 'Fire_Drill_Report.pdf', type: 'pdf' });
                      setShowAttachmentMenu(false);
                    }}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}
                  >
                    📄 Attach Audit PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile({ name: 'Medication_Lockbox.png', type: 'image' });
                      setShowAttachmentMenu(false);
                    }}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}
                  >
                    📷 Attach Incident Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile({ name: 'Nurse_Drills_Feed.mp4', type: 'video' });
                      setShowAttachmentMenu(false);
                    }}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', textAlign: 'left' }}
                  >
                    🎥 Attach Training Video
                  </button>
                </div>
              )}

              <input
                type="text"
                className="chat-input-field"
                placeholder="Ask Copilot or attach files/photos/videos to analyze..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem', borderRadius: '50%' }}>
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Quick Prompts Panel */}
          <div className="copilot-help-pane">
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Readiness Helper Templates</h4>
            <button
              onClick={() => { setChatInput("AI CAPA Assistant: Draft root cause and CAPA corrective measures for an audit gap where ICU crash carts had expired medicines."); }}
              className="preset-prompt-card"
              style={{ borderLeft: '3.5px solid var(--primary)', paddingLeft: '8px', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}
            >
              🛠️ AI CAPA Assistant
            </button>
            <button
              onClick={() => { setChatInput("AI Audit Assistant: Create a custom department audit checklist for Otis elevators and patient transfer safety."); }}
              className="preset-prompt-card"
              style={{ borderLeft: '3.5px solid var(--primary)', paddingLeft: '8px', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}
            >
              📋 AI Audit Checklist Creator
            </button>
            <button
              onClick={() => { setChatInput("AI MOM Assistant: Format raw committee notes: 'Pharmacy committee met June 10th. Discussed narcotic keys custodian double locks. Gracy to enforce double keys. Due June 20th.'"); }}
              className="preset-prompt-card"
              style={{ borderLeft: '3.5px solid var(--primary)', paddingLeft: '8px', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}
            >
              ✍️ AI MOM Minutes Formatter
            </button>
            <button
              onClick={() => { setChatInput("AI Evidence Grader: Evaluate the quality score of document 'Bio-Medical Waste Segregation SOP' against NABH BWM requirements."); }}
              className="preset-prompt-card"
              style={{ borderLeft: '3.5px solid var(--primary)', paddingLeft: '8px', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}
            >
              ⭐ Evidence Quality Grader
            </button>

            <h4 style={{ fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Readiness Prompts</h4>
            <button
              onClick={() => { setChatInput("Show me all missing evidence related to accreditation."); }}
              className="preset-prompt-card"
            >
              Which standards lack evidence docs?
            </button>
            <button
              onClick={() => { setChatInput("What is our hospital readiness score?"); }}
              className="preset-prompt-card"
            >
              Calculate overall readiness score
            </button>
            <button
              onClick={() => { setChatInput("Show me the critical department risks."); }}
              className="preset-prompt-card"
            >
              Scan department risk map
            </button>
            <button
              onClick={() => { setChatInput("What CAPAs are currently overdue?"); }}
              className="preset-prompt-card"
            >
              List overdue CAPAs & deadlines
            </button>

            <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', fontSize: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              🔒 <strong>Audit Privacy Sandbox:</strong> Copilot answers are generated strictly from local parameters. No medical patient charts are accessed.
            </div>
          </div>
        </div>
      )}

      {/* 2. AI SOP GENERATOR VIEW */}
      {activeSubTab === 'sop' && (
        <div className="flex flex-col gap-3">
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignContent: 'center', gap: '0.5rem' }}>
              <FileCode size={20} color="var(--primary)" />
              <span>AI SOP Draft Assistant (Human-in-the-Loop Approval)</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Draft standard operating procedures mapped to NABH chapters. The resulting draft must be audited and approved by the Quality Head before entering the Policy library.
            </p>
          </div>

          {sopApprovedAlert && (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>Document approved! It has been successfully saved to the <strong>Policies & SOPs Library</strong> and mapped to standard <strong>{sopStandard}</strong>.</span>
            </div>
          )}

          <div className="sop-generator-split">
            {/* Input Config Card */}
            <div className="card flex flex-col gap-2">
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>SOP Parameters</h4>
              <div className="form-group">
                <label className="form-label">SOP Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={sopTitle}
                  onChange={(e) => setSopTitle(e.target.value)}
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-control"
                    value={sopDepartment}
                    onChange={(e) => setSopDepartment(e.target.value)}
                  >
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Map standard element</label>
                  <select
                    className="form-control"
                    value={sopStandard}
                    onChange={(e) => setSopStandard(e.target.value)}
                  >
                    <option value="MOM.2.c">MOM.2.c (High-Alert Drugs)</option>
                    <option value="MOM.3.a">MOM.3.a (Medication Expiry)</option>
                    <option value="COP.5.c">COP.5.c (ICU Admission)</option>
                    <option value="FMS.2.a">FMS.2.a (Hazmat Control)</option>
                    <option value="HRM.2.b">HRM.2.b (Infection Drills)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleDraftSOP}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
                disabled={sopDrafting}
              >
                <Sparkles size={16} /> {sopDrafting ? 'Writing SOP...' : 'Draft SOP with AI'}
              </button>
            </div>

            {/* Generated Preview Box */}
            <div className="sop-preview-box flex flex-col gap-3">
              <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Document Editor Panel</span>
                <span className="badge badge-warning">Draft Mode</span>
              </div>
              
              {sopDraftText ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                  <div className="ai-draft-watermark" style={{ width: '100%' }}>
                    <textarea
                      className="sop-content-draft form-control"
                      style={{ minHeight: '160px', height: '160px', width: '100%', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: 'none', outline: 'none', resize: 'vertical' }}
                      value={sopDraftText}
                      onChange={(e) => setSopDraftText(e.target.value)}
                    />
                  </div>
                  {/* Flowchart Component */}
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Workflow Flowchart Nodes:</label>
                    {renderFlowchartComponent(sopTitle, sopDraftText)}
                  </div>
                  <div className="flex gap-2 justify-end" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button onClick={() => setSopDraftText('')} className="btn btn-secondary">Discard</button>
                    <button onClick={handleApproveSOP} className="btn btn-primary">
                      <CheckCircle2 size={16} /> Approve & Save to Library
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-tertiary)' }} className="flex flex-col align-center gap-2">
                  <FileCode size={48} />
                  <p>Configure parameters on the left and click "Draft SOP".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. AI GAP CHECKER VIEW */}
      {activeSubTab === 'gap' && (
        <div className="flex flex-col gap-3">
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>AI Evidence Validation & Audit Mapping</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Upload an evidence document (e.g. fire drill records or calibration reports). The AI will cross-verify file strength, check for signature gaps, and suggest standard mappings.
            </p>

            <div 
              className="upload-zone" 
              onClick={() => document.getElementById('ai-gap-file-input').click()}
            >
              <input 
                type="file" 
                id="ai-gap-file-input" 
                style={{ display: 'none' }}
                onChange={handleGapFileChange}
              />
              {uploadChecking ? (
                <div className="flex flex-col align-center gap-2">
                  <RefreshCw size={32} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
                  <p style={{ fontWeight: 600 }}>Analyzing uploaded document structure...</p>
                </div>
              ) : (
                <div className="flex flex-col align-center gap-2">
                  <Upload size={32} color="var(--primary)" />
                  <p style={{ fontWeight: 600 }}>Upload evidence file for Gap Check & Verification</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {selectedGapFile ? `Selected: ${selectedGapFile.name}` : "Click to select a file (PDF, DOCX, XLSX). The AI will auto-map it."}
                  </p>
                </div>
              )}
            </div>

            {/* Gap Check Result */}
            {gapCheckResult && (
              <div className="card" style={{ marginTop: '1.5rem', borderLeft: `5px solid ${gapCheckResult.success ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                <h4 style={{ fontWeight: 700, color: gapCheckResult.success ? 'var(--color-success)' : 'var(--color-warning)', fontSize: '0.95rem', display: 'flex', alignContent: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  <span>Validation Result: {gapCheckResult.docName}</span>
                </h4>
                
                <div style={{ marginTop: '1rem', fontSize: '0.85rem' }} className="flex flex-col gap-2">
                  <div>
                    <strong>Suggested Chapter Map:</strong> <span className="badge badge-neutral">{gapCheckResult.chapter}</span>
                  </div>
                  <div>
                    <strong>Audit Evidence Strength:</strong> <span className={`badge ${gapCheckResult.strength === 'Strong' ? 'badge-success' : gapCheckResult.strength === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{gapCheckResult.strength}</span>
                  </div>
                  <div>
                    <strong>Detected Document Gaps:</strong>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                      {gapCheckResult.gaps.map((gap, gIdx) => (
                        <li key={gIdx} style={{ marginBottom: '0.25rem' }}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px dashed var(--border-color)', marginTop: '0.5rem' }}>
                    💡 <strong>AI Recommendations:</strong> {gapCheckResult.advice}
                  </div>
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px dashed rgba(124, 58, 237, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span className="ai-confidence-badge ai-confidence-high" style={{ fontSize: '0.65rem' }}>🎯 AI CONFIDENCE: HIGH</span>
                    <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 600 }}>⚠️ AI ASSESSMENT — REQUIRES HUMAN SIGN-OFF</span>
                  </div>
                  {gapCheckResult.success && (
                    <button 
                      onClick={handleApplyGapRecommendation} 
                      className="btn btn-primary"
                      style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <CheckSquare size={16} />
                      Accept AI Mapping & Update Score
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. AI API SETTINGS VIEW */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }} className="animate-fade-in">
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Client AI Gateway Status
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              API credentials, advanced parameters (like temperature, max tokens, and allowed roles), safety incident logs, and tenant memory are managed centrally under the Administration console.
            </p>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }} className="flex flex-col gap-2">
              <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Provider:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{aiSettings?.provider || 'mock'}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Engine Model ID:</span>
                <span style={{ fontWeight: 700 }}>{aiSettings?.model || 'mock-agent-v1'}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Connection Status:</span>
                <span className={`badge ${aiSettings?.providerStatus === 'Connected' ? 'badge-success' : 'badge-neutral'}`}>
                  {aiSettings?.providerStatus || 'Disabled'}
                </span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => setCurrentRoute('/app/admin')}
            >
              <span>Go to Admin AI Console</span>
            </button>
          </div>
        </div>
      )}
      
      {activeSubTab === 'ceo' && (
        <div className="flex flex-col gap-3" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="card" style={{ borderTop: '6px solid var(--primary)', padding: '2.5rem' }}>
            <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Hospital Quality Briefing</span>
                <h2 style={{ fontSize: '1.5rem' }}>Executive Board Quality Briefing</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>Generated on: Monday Review Cycle</p>
              </div>
              <Brain size={32} color="var(--primary)" />
            </div>

            <div className="flex flex-col gap-3" style={{ fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall Readiness</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{readinessScore}%</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open CAPAs</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: openCapasCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{openCapasCount}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High-Risk Depts</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: highRiskDeptsCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{highRiskDeptsCount}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Overall Performance Summary</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {hospitalName} is currently at <strong>{readinessScore}%</strong> compliance for the NABH 6th Edition accreditation standard. We have mapped <strong>{documents.filter(d=>d.status==='Approved').length} approved SOPs</strong>. A compliance score of 85% is required to trigger final document submission.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Critical Compliance Liabilities</h4>
                {liabilitiesList.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No active statutory or clinical liabilities detected.</p>
                ) : (
                  <ul style={{ listStyleType: 'decimal', paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {liabilitiesList.map((liab, index) => (
                      <li key={index}><strong>{liab.title}:</strong> {liab.text}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Immediate Action Items for Executive Team</h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {actionItemsList.map((act, index) => (
                    <li key={index}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px dashed rgba(124, 58, 237, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span className="ai-confidence-badge ai-confidence-medium" style={{ fontSize: '0.65rem' }}>🎯 AI CONFIDENCE: MEDIUM</span>
              <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 600 }}>⚠️ EXECUTIVE ADVISORY — REQUIRES QUALITY HEAD SIGN-OFF</span>
            </div>

            <div className="flex gap-2 justify-end" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '2rem' }}>
              <button onClick={() => alert("CEO Briefing copied to clipboard!")} className="btn btn-secondary">
                <Copy size={14} /> Copy Briefing
              </button>
              <button onClick={() => alert("Downloading PDF summary report...")} className="btn btn-primary">
                <FileDown size={14} /> Export Quality Report Pack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Spinner Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
