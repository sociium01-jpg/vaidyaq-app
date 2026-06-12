import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  FileText,
  Search,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  History,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  FileSignature,
  Save,
  AlertTriangle,
  Award,
  BookOpen,
  Activity,
  UserCheck,
  ClipboardList,
  Shield,
  ArrowRight,
  Flame,
  FileDown
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

export default function Documents() {
  const {
    documents,
    setDocuments,
    standards,
    setStandards,
    logActivity,
    currentUser,
    addDocument,
    sendSimulatedEmail,
    addIncident,
    setLicenses
  } = useContext(QualiNABHContext);

  // Main Tabs State
  const [activeMainTab, setActiveMainTab] = useState('vault'); // 'vault', 'sop-draft', 'registers'
  const [drawerSubTab, setDrawerSubTab] = useState('body'); // 'body', 'flowchart'

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [selectedDocDetails, setSelectedDocDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [authPin, setAuthPin] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const [newDocForm, setNewDocForm] = useState({
    title: '',
    type: 'Policy',
    department: 'Quality',
    version: '1.0',
    mappedStandards: [],
    content: ''
  });

  // Descriptive SOP Form state
  const [draftTitle, setDraftTitle] = useState('High-Alert Medication Infusion SOP');
  const [draftStandard, setDraftStandard] = useState('MOM.2.c');
  const [draftDept, setDraftDept] = useState('Pharmacy');
  const [draftObjective, setDraftObjective] = useState('Establish dual-custody verification steps and safety warning standards for ICU infusion pump administration of high-alert medications.');
  const [draftSteps, setDraftSteps] = useState("1. Obtain physician prescription containing drug generic name, dilution ratio, and infusion rate.\n2. Access the high-alert cabinet using dual keys held by duty nurse and pharmacist.\n3. Verify critical criteria (Patient ID, drug name, dilution calculation, expiry, bedside monitor alarm limits).\n4. Affix high-contrast RED warning tag to the IV infusion line.\n5. Nurse and witness execute pump programming and double-sign shift handover charts.");
  const [draftRoles, setDraftRoles] = useState('Clinical Pharmacist, ICU Nursing Officer, Duty Medical Specialist');
  const [draftGaps, setDraftGaps] = useState('Address double-verify gaps at shift handovers. Enforce high-alert lock checks.');
  const [draftResultText, setDraftResultText] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Accreditation Registers Form states
  const [activeRegisterForm, setActiveRegisterForm] = useState(null); // 'fire', 'waste', 'training', 'cert', 'calibration', 'incident'

  // Register Fields states
  const [fireForm, setFireForm] = useState({ date: new Date().toISOString().slice(0, 10), supervisor: 'Mr. Verma (Facilities Manager)', attendees: 'Ramesh Kumar, Sister Gracy, Priya Sharma, Aarav Sharma', gaps: 'Billing corridor rear door exit was partially blocked by spare beds. ICU bell decibel volume check was faint.', correctiveAction: 'Moved spare beds to cellar store. Scheduled maintenance check for fire alarms speaker.' });
  const [wasteForm, setWasteForm] = useState({ date: new Date().toISOString().slice(0, 10), yellowWeight: '5.2', redWeight: '9.4', blueWeight: '3.0', sharpsWeight: '1.8', manifestNum: 'BMW-2026-99321', handler: 'Aarav Sharma (Housekeeping Officer)' });
  const [trainingForm, setTrainingForm] = useState({ date: new Date().toISOString().slice(0, 10), topic: 'Clinical Hand Hygiene & Scrubbing', trainer: 'Dr. Sarah Paul (Quality Head)', attendeesCount: '18', passingRate: '100', quizCode: 'QZ-HH-093' });
  const [staffCertForm, setStaffCertForm] = useState({ staffName: 'Dr. Sen', role: 'Pharmacist', certName: 'State Pharmacy Council Registered Pharmacist License', council: 'State Pharmacy Council Board', issueDate: '2025-05-12', expiryDate: '2030-05-12' });
  const [calibrationForm, setCalibrationForm] = useState({ name: 'ICU Ventilator (Main Wing)', serialNum: 'VENT-ICU-2026-081', date: new Date().toISOString().slice(0, 10), nextDue: new Date(Date.now() + 180*24*60*60*1000).toISOString().slice(0,10), agency: 'Standard Calibration Services Ltd.', status: 'Pass' });
  const [incidentForm, setIncidentForm] = useState({ type: 'Medication Error', date: new Date().toISOString().slice(0, 16).replace('T', ' '), dept: 'Pharmacy', desc: 'A double dosage of pediatric paracetamol was prepared but intercepted by senior nurse during drug count.', immediateAction: 'Dispensation stopped immediately, audit logged and doctor alerted.', severity: 'Medium' });

  // Sync selected doc details with global documents list
  useEffect(() => {
    if (selectedDocDetails) {
      const current = documents.find(d => d.id === selectedDocDetails.id);
      if (current) {
        setSelectedDocDetails(current);
      } else {
        setSelectedDocDetails(null);
      }
    }
  }, [documents]);

  const handleStartEdit = () => {
    if (!selectedDocDetails) return;
    setEditContent(selectedDocDetails.content || '');
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (!selectedDocDetails) return;

    const wasApproved = selectedDocDetails.status === 'Approved';
    const nextVer = wasApproved ? (parseFloat(selectedDocDetails.version) + 0.1).toFixed(1) : selectedDocDetails.version;

    const updatedDocs = documents.map(d => {
      if (d.id === selectedDocDetails.id) {
        return {
          ...d,
          content: editContent,
          version: nextVer,
          status: 'Pending Review',
          approvedBy: 'Pending review sign-off',
          sha256Hash: null
        };
      }
      return d;
    });
    setDocuments(updatedDocs);
    setIsEditing(false);

    if (wasApproved && selectedDocDetails.mappedStandards && selectedDocDetails.mappedStandards.length > 0) {
      setStandards(prevStds => prevStds.map(std => {
        if (selectedDocDetails.mappedStandards.includes(std.id)) {
          const otherApproved = updatedDocs.some(d => d.status === "Approved" && d.id !== selectedDocDetails.id && d.mappedStandards.includes(std.id));
          if (otherApproved) return std;
          return { ...std, score: 5, status: "Partially Met" };
        }
        return std;
      }));
    }

    logActivity(`Created revision v${nextVer} of document: ${selectedDocDetails.title} (Pending review)`);
  };

  const handleOpenAuthenticate = () => {
    setAuthName(currentUser.name);
    setAuthPin('');
    setAuthError('');
    setShowAuthModal(true);
  };

  const handleAuthenticateSubmit = (e) => {
    e.preventDefault();
    if (authPin !== '1234') {
      setAuthError('Invalid Verification PIN. Use mock pin 1234 to sign off.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const mockHash = "SHA256-" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();

    const updatedDocs = documents.map(d => {
      if (d.id === selectedDocDetails.id) {
        return {
          ...d,
          status: 'Approved',
          approvedBy: authName,
          lastReviewed: today,
          nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
          sha256Hash: mockHash
        };
      }
      return d;
    });
    setDocuments(updatedDocs);

    if (selectedDocDetails.mappedStandards && selectedDocDetails.mappedStandards.length > 0) {
      setStandards(prevStds => prevStds.map(std => {
        if (selectedDocDetails.mappedStandards.includes(std.id)) {
          return { ...std, score: 10, status: "Fully Met" };
        }
        return std;
      }));
    }

    logActivity(`Signed off & Authenticated: ${selectedDocDetails.title}. Cryptographic Hash: ${mockHash}`);
    setShowAuthModal(false);
    setAuthPin('');
  };

  const handleDeleteDoc = (docId) => {
    if (!window.confirm("Are you sure you want to delete this document? This will remove all associated compliance mappings and may degrade standard compliance scores.")) return;

    const docToDelete = documents.find(d => d.id === docId);
    if (!docToDelete) return;

    const updatedDocs = documents.filter(d => d.id !== docId);
    setDocuments(updatedDocs);
    setSelectedDocDetails(null);

    if (docToDelete.mappedStandards && docToDelete.mappedStandards.length > 0) {
      setStandards(prevStds => prevStds.map(std => {
        if (docToDelete.mappedStandards.includes(std.id)) {
          const otherApproved = updatedDocs.some(d => d.status === "Approved" && d.mappedStandards.includes(std.id));
          if (otherApproved) return std;
          const otherPending = updatedDocs.some(d => d.mappedStandards.includes(std.id));
          if (otherPending) return { ...std, score: 5, status: "Partially Met" };
          return { ...std, score: 0, status: "Not Met" };
        }
        return std;
      }));
    }

    logActivity(`Deleted compliance document: ${docToDelete.title}`);
  };

  const [uploadedFile, setUploadedFile] = useState(null);

  // File Upload scanning with true FileReader text parser and binary scanning mock fallbacks
  const handleVaultFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);

    const docTitle = file.name.split('.').slice(0, -1).join('.') || file.name;
    const fileExt = "." + file.name.split('.').pop().toLowerCase();
    const fileNameLower = file.name.toLowerCase();

    const processContent = (text) => {
      const textLower = text.toLowerCase();
      let suggestedStandards = [];
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

      standardMappings.forEach(mapping => {
        if (mapping.kws.some(kw => textLower.includes(kw))) {
          suggestedStandards.push(mapping.std);
        }
      });

      let department = 'Quality';
      if (suggestedStandards.length > 0) {
        const matchedStd = standards.find(s => s.id === suggestedStandards[0]);
        if (matchedStd) {
          department = matchedStd.department || 'Quality';
        }
      }

      setNewDocForm(prev => ({
        ...prev,
        title: docTitle,
        mappedStandards: suggestedStandards,
        content: text,
        department: department
      }));
    };

    if (fileExt === '.txt') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        processContent(evt.target.result);
      };
      reader.readAsText(file);
    } else {
      // Binary files scanner mock-text generator containing targeted keywords
      let mockContent = `[BINARY SCAN EXTRACTED CONTENT - FORMAT: ${fileExt.toUpperCase()}]\n\n`;
      const fileKeywordSets = [
        { kws: ["registration", "opd", "out-patient"], text: "OUT-PATIENT REGISTRATION POLICY AND PATIENT IDENTIFICATION WORKFLOW.\nOPD registration logs are verified daily.\nUHID numbers generated for out-patient demographics.", std: "AAC.1.a" },
        { kws: ["admission", "inpatient", "triage", "consent"], text: "ADMISSION CRITERIA & EMERGENCY TRIAGE PROTOCOL.\nInpatients are categorized on arrival.\nWritten consent obtained prior to critical admissions.", std: "AAC.2.b" },
        { kws: ["discharge", "referral", "summary"], text: "DISCHARGE AND REFERRAL SUMMARY SOP.\nPatients receive standard discharge summary with medication advice and follow-up contact details.", std: "AAC.3.a" },
        { kws: ["care manual", "general care", "patient care"], text: "GENERAL PATIENT CARE MANUAL & CLINICAL GUIDELINES.\nContinuous monitoring of patient vitals and nursing record sheets.", std: "COP.1.a" },
        { kws: ["cpr", "triage", "emergency", "cardiac arrest", "crash cart"], text: "EMERGENCY MEDICINE CRASH CART INVENTORY & RESUSCITATION PROTOCOLS.\nCPR procedures and Code Blue cardiac arrest triggers.", std: "COP.2.b" },
        { kws: ["icu", "critical care", "intensive care"], text: "INTENSIVE CARE UNIT (ICU) ADMISSION AND DISCHARGE SCORE CRITERIA.\nContinuous bedside vital monitors and ventilator safety checklists.", std: "COP.5.c" },
        { kws: ["formulary", "medication list"], text: "APPROVED HOSPITAL DRUG FORMULARY BOOKLET.\nGeneric substitutions list approved by Pharmacy and Therapeutics Committee.", std: "MOM.1.a" },
        { kws: ["high-alert", "lasa", "narcotic", "locked", "concentrated"], text: "HIGH-ALERT AND LASA DRUG SAFETY PROTOCOLS.\nStorage in LOCKED steel cabinets with dual-signature check logs prior to dispensing.", std: "MOM.2.c" },
        { kws: ["expiry", "expired", "disposal"], text: "DRUG EXPIRY DISPOSAL REGISTER AND SEGREGATION SOP.\nExpired medications are placed in locked bins and written off by Pharmacist and Quality Officer.", std: "MOM.3.a" },
        { kws: ["fire", "drill", "evacuation", "mock drill"], text: "MOCK FIRE SAFETY DRILL RECORD AND EMERGENCY ASSEMBLY PROTOCOLS.\nFire extinguishers inspection and evacuation pathways training logged.", std: "FMS.1.d" },
        { kws: ["hazmat", "hazardous", "waste log", "pollution"], text: "BIOMEDICAL WASTE SEGREGRATION LOGS & HAZARDOUS MATERIALS CONTROL.\nState Pollution Control Board manifest registration for chemical waste disposal.", std: "FMS.2.a" },
        { kws: ["credential", "qualification", "license", "registration"], text: "CLINICAL CREDENTIALS REGISTRY AND PROFESSIONAL LICENSE VERIFICATION.\nPrimary source checks for doctors, nurses, and pharmacists.", std: "HRM.1.a" },
        { kws: ["infection", "hygiene", "scrub", "handwash"], text: "CLINICAL HAND HYGIENE TRAINING AUDITS & INFECTION CONTROL MANUAL.\nWHO 5 moments hand washing training checklist records.", std: "HRM.2.b" }
      ];

      let foundMatch = false;
      fileKeywordSets.forEach(set => {
        if (set.kws.some(kw => fileNameLower.includes(kw))) {
          mockContent += set.text + `\n\n[Parsed matching standard: ${set.std}]\nKeywords scanned: ${set.kws.join(', ')}`;
          foundMatch = true;
        }
      });

      if (!foundMatch) {
        mockContent += `Document Name: ${file.name}\nSize: ${file.size} bytes\nUploaded on: ${new Date().toISOString().slice(0, 10)}\n\nWARNING: No specific compliance keywords matched in filename. Please manually map standards below and edit body instructions to insert required guidelines.`;
      }

      processContent(mockContent);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    
    addDocument({
      title: newDocForm.title,
      type: newDocForm.type,
      department: newDocForm.department,
      version: newDocForm.version,
      status: 'Pending Review',
      author: currentUser.name,
      approvedBy: 'Pending review sign-off',
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: newDocForm.mappedStandards,
      content: newDocForm.content || `STANDARD OPERATING PROCEDURE: ${newDocForm.title}\n=====================================\nDEPARTMENT: ${newDocForm.department}\nMAPPED STANDARDS: ${newDocForm.mappedStandards.join(', ')}\n\n1. PURPOSE:\nDescribe the purpose here...\n\n2. WORKFLOW:\nDescribe workflow here...\n\n3. REVIEW CYCLE:\nAnnual.`
    });

    setNewDocForm({ title: '', type: 'Policy', department: 'Quality', version: '1.0', mappedStandards: [], content: '' });
    setUploadedFile(null);
    setShowDocUploadModal(false);
  };

  const toggleStandardSelect = (stdId) => {
    setNewDocForm(prev => {
      const selected = prev.mappedStandards.includes(stdId)
        ? prev.mappedStandards.filter(id => id !== stdId)
        : [...prev.mappedStandards, stdId];
      return { ...prev, mappedStandards: selected };
    });
  };

  // SOP Drafting action
  const handleDraftSOP = (e) => {
    e.preventDefault();
    setIsDrafting(true);

    setTimeout(() => {
      const stepsArr = draftSteps.split('\n').filter(s => s.trim().length > 0);
      const generated = `STANDARD OPERATING PROCEDURE (SOP)
=====================================
TITLE: ${draftTitle}
DEPARTMENT: ${draftDept}
MAPPED COMPLIANCE STANDARD: ${draftStandard}
CREATOR: ${currentUser.name} (Quality Co-Pilot)
DATE: ${new Date().toISOString().slice(0, 10)}
-------------------------------------

1. CLINICAL OBJECTIVES & PURPOSE:
${draftObjective}

2. TARGET INDIVIDUAL RESPONSIBLE ROLES:
${draftRoles}

3. PROCEDURAL WORKFLOW ACTIONS:
${stepsArr.map((step, idx) => `${idx + 1}. ${step.replace(/^\d+[\.\s\-]+/, '')}`).join('\n')}

4. CRITICAL QUALITY AUDIT CRITERIA & GAPS TO AUDIT:
${draftGaps}

5. REVIEW MATRIX & COMPLIANCE SIGNATURES:
This SOP must be audited every 6 months. In ICU, daily checklist sheets are signed off by Nurse In-Charge and verified weekly by HOD.`;

      setDraftResultText(generated);
      setIsDrafting(false);
      logActivity(`AI Co-pilot drafted SOP: ${draftTitle}`);
    }, 1200);
  };

  const handleSaveDraftSop = () => {
    if (!draftResultText) return;

    const docId = addDocument({
      title: draftTitle,
      type: 'SOP',
      department: draftDept,
      version: '1.0',
      status: 'Approved',
      author: currentUser.name,
      approvedBy: currentUser.name,
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: [draftStandard],
      content: draftResultText
    });

    // Bump mapped standard to Fully Met (10)
    setStandards(prev => prev.map(s => s.id === draftStandard ? { ...s, score: 10, status: 'Fully Met' } : s));

    logActivity(`Saved drafted SOP: ${draftTitle} mapping to ${draftStandard}`);
    alert(`SOP "${draftTitle}" successfully saved to Vault. Standard ${draftStandard} is now upgraded to Fully Met (10 pts).`);
    
    // Switch back to Vault tab and highlight the new document
    setActiveMainTab('vault');
    const newDocObj = {
      id: docId,
      title: draftTitle,
      type: 'SOP',
      department: draftDept,
      version: '1.0',
      status: 'Approved',
      author: currentUser.name,
      approvedBy: currentUser.name,
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: [draftStandard],
      content: draftResultText
    };
    setSelectedDocDetails(newDocObj);
    setDraftResultText('');
  };

  // Register form submissions
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    let compiledTitle = '';
    let compiledContent = '';
    let mappedStd = '';
    let dept = 'Quality';

    if (activeRegisterForm === 'fire') {
      mappedStd = 'FMS.1.d';
      dept = 'Security & Facility';
      compiledTitle = `Mock Fire Drill Record & Evacuation Report - ${fireForm.date}`;
      compiledContent = `MOCK FIRE DRILL & EMERGENCY SAFETY LOG
======================================
MAPPED STANDARD: FMS.1.d (Emergency & Fire Preparedness)
DATE OF DRILL: ${fireForm.date}
FACILITY DRILL SUPERVISOR: ${fireForm.supervisor}

PARTICIPANTS RECORD:
${fireForm.attendees.split(',').map(a => `- ${a.trim()}`).join('\n')}

IDENTIFIED DEFICIENCIES & GAPS:
${fireForm.gaps}

CORRECTIVE ACTIONS TAKEN:
${fireForm.correctiveAction}

DRILL STATUS VERIFICATION: Approved. Fire egress route clear.`;

      // Send simulated email
      sendSimulatedEmail(
        'facilities-head@hospital.org',
        `Statutory Compliance Check: Fire Drill Record Logged`,
        `Hello, Mr. Verma. The fire drill safety report logged on ${fireForm.date} has been added to vault. Corrective action taken: "${fireForm.correctiveAction}" has updated FMS.1.d compliance scoring.`,
        "Register Log"
      );
    } else if (activeRegisterForm === 'waste') {
      mappedStd = 'FMS.2.a';
      dept = 'Housekeeping';
      compiledTitle = `Biomedical Waste Shipment Log - ${wasteForm.date}`;
      compiledContent = `BIOMEDICAL WASTE SEGREGATION & SHIPPED MANIFEST LOG
======================================================
MAPPED STANDARD: FMS.2.a (Hazardous Materials Control)
DATE OF RECORD: ${wasteForm.date}
MANIFEST SHIPMENT NUMBER: ${wasteForm.manifestNum}
REGISTERED HANDLER: ${wasteForm.handler}

DISPOSED WEIGHT BY BAGS:
- Yellow Bag (Infectious Anatomy): ${wasteForm.yellowWeight} kg
- Red Bag (Contaminated Plastics): ${wasteForm.redWeight} kg
- Blue Cardboard (Infectious Glassware): ${wasteForm.blueWeight} kg
- White Container (Sharps & Metals): ${wasteForm.sharpsWeight} kg

TOTAL SHIPPED WEIGHT: ${(parseFloat(wasteForm.yellowWeight) + parseFloat(wasteForm.redWeight) + parseFloat(wasteForm.blueWeight) + parseFloat(wasteForm.sharpsWeight)).toFixed(2)} kg

STATUS: Transferred to State Pollution Control Board truck. Manifest signed off.`;

      // Send simulated email
      sendSimulatedEmail(
        'housekeeping.head@hospital.org',
        `Biomedical Waste Shipment recorded - Manifest #${wasteForm.manifestNum}`,
        `Hello, the waste shipment log for ${wasteForm.date} has been saved. Total weight: ${(parseFloat(wasteForm.yellowWeight) + parseFloat(wasteForm.redWeight) + parseFloat(wasteForm.blueWeight) + parseFloat(wasteForm.sharpsWeight)).toFixed(2)} kg. Manifest number matches State Pollution guidelines.`,
        "Register Log"
      );
    } else if (activeRegisterForm === 'training') {
      mappedStd = 'HRM.2.b';
      dept = 'Quality Control';
      compiledTitle = `Training Log - Topic: ${trainingForm.topic} (${trainingForm.date})`;
      compiledContent = `STAFF TRAINING EVALUATION & ATTENDANCE SURVEILLANCE
===================================================
MAPPED STANDARD: HRM.2.b (Infection Control Training)
DATE OF TRAINING: ${trainingForm.date}
INSTRUCTOR / TRAINER: ${trainingForm.trainer}
TOPIC OF SESSION: ${trainingForm.topic}

ATTENDANCE STATISTICS:
- Attendees: ${trainingForm.attendeesCount} staff members
- Evaluation Quiz Code: ${trainingForm.quizCode}
- Passing Rate: ${trainingForm.passingRate}%

STATUS: Quiz records loaded. Certificates issued in employee files.`;
    } else if (activeRegisterForm === 'cert') {
      mappedStd = 'HRM.1.a';
      dept = 'HR';
      compiledTitle = `Professional Credentials: ${staffCertForm.staffName} (${staffCertForm.certName})`;
      compiledContent = `STAFF CREDENTIALS & LICENSES REGISTRATION PORTAL
==================================================
MAPPED STANDARD: HRM.1.a (Credentialing of Professionals)
STAFF MEMBER NAME: ${staffCertForm.staffName}
PROFESSIONAL ROLE: ${staffCertForm.role}
CERTIFICATE/LICENSE NAME: ${staffCertForm.certName}
ISSUING COUNCIL REGISTRAR: ${staffCertForm.council}
ISSUE DATE: ${staffCertForm.issueDate}
EXPIRY DATE: ${staffCertForm.expiryDate}

CREDENTIALS VERIFICATION STATUS: Checked.
Primary source checks verified with the portal of ${staffCertForm.council}.`;

      // Add to licenses list in context so it updates license calendars!
      const newLic = {
        id: `lic-staff-${Date.now()}`,
        name: `${staffCertForm.staffName} - ${staffCertForm.certName}`,
        authority: staffCertForm.council,
        issueDate: staffCertForm.issueDate,
        expiryDate: staffCertForm.expiryDate,
        responsible: 'HR Department',
        status: 'Active'
      };
      setLicenses(prev => [...prev, newLic]);

      sendSimulatedEmail(
        'hr.director@hospital.org',
        `Staff Credentials Verified - ${staffCertForm.staffName}`,
        `Hello, HR Team. The credentials verification for ${staffCertForm.staffName} (${staffCertForm.certName}) expiring on ${staffCertForm.expiryDate} has been verified and registered.`,
        "Credentials Check"
      );
    } else if (activeRegisterForm === 'calibration') {
      mappedStd = 'COP.5.c';
      dept = 'ICU';
      compiledTitle = `Calibration Certificate: ${calibrationForm.name} - ${calibrationForm.serialNum}`;
      compiledContent = `BIOMEDICAL EQUIPMENT CALIBRATION LOG
=====================================
MAPPED STANDARD: COP.5.c (ICU Management & Equipment)
EQUIPMENT NAME: ${calibrationForm.name}
MODEL / SERIAL NUMBER: ${calibrationForm.serialNum}
CALIBRATING AGENCY: ${calibrationForm.agency}
CALIBRATION DATE: ${calibrationForm.date}
NEXT DUE DATE: ${calibrationForm.nextDue}
CALIBRATION STATUS: ${calibrationForm.status}

VERIFICATION GAPS: Tolerances verified. Standard deviation under 0.05.
Equipment status: APPROVED for active clinical use.`;
    } else if (activeRegisterForm === 'incident') {
      mappedStd = 'COP.2.b';
      dept = incidentForm.dept;
      compiledTitle = `Incident Safety Log - Type: ${incidentForm.type} (${incidentForm.date})`;
      compiledContent = `CLINICAL INCIDENT AND SENTINEL EVENT INVESTIGATION LOG
=====================================================
MAPPED STANDARD: COP.2.b (Emergency Care Protocols & Incident Logs)
INCIDENT CLASSIFICATION: ${incidentForm.type}
DATE & TIME: ${incidentForm.date}
CLINICAL DEPARTMENT: ${incidentForm.dept}
SEVERITY TRIGGER: ${incidentForm.severity}

INCIDENT DESCRIPTION:
${incidentForm.desc}

IMMEDIATE REMEDIAL ACTION TAKEN:
${incidentForm.immediateAction}

INVESTIGATOR SIGN-OFF: ${currentUser.name}
INVESTIGATION STATUS: Closed - CAPA pending review.`;

      // Call addIncident to update global context incidents state
      addIncident({
        type: incidentForm.type,
        department: incidentForm.dept,
        dateTime: incidentForm.date,
        severity: incidentForm.severity,
        description: incidentForm.desc,
        immediateAction: incidentForm.immediateAction,
        investigator: currentUser.name
      });
    }

    const docId = addDocument({
      title: compiledTitle,
      type: 'Register',
      department: dept,
      version: '1.0',
      status: 'Approved',
      author: currentUser.name,
      approvedBy: currentUser.name,
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: [mappedStd],
      content: compiledContent
    });

    // Bump score to 10
    setStandards(prev => prev.map(s => s.id === mappedStd ? { ...s, score: 10, status: 'Fully Met' } : s));

    logActivity(`Recorded accreditation register: ${compiledTitle}`);
    alert(`Register entry compiled and saved as document. Standard ${mappedStd} score has been updated to Fully Met (10 pts).`);

    setActiveRegisterForm(null);
    setActiveMainTab('vault');
    const newDocObj = {
      id: docId,
      title: compiledTitle,
      type: 'Register',
      department: dept,
      version: '1.0',
      status: 'Approved',
      author: currentUser.name,
      approvedBy: currentUser.name,
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: [mappedStd],
      content: compiledContent
    };
    setSelectedDocDetails(newDocObj);
  };

  // Filtered documents list
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.mappedStandards.some(std => std.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'All' || doc.type === filterType;
    const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      {/* Page Title */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Central Document Repository</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Verify, edit, electronically sign off, and manage hospital policies, checklists, and SOP templates.
          </p>
        </div>
        <button onClick={() => setShowDocUploadModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={16} /> Upload New Document
        </button>
      </div>

      {/* Main Tab Controls */}
      <div className="tabs-container" style={{ margin: '0.25rem 0 0.5rem 0' }}>
        <button onClick={() => setActiveMainTab('vault')} className={`tab-btn ${activeMainTab === 'vault' ? 'active' : ''}`}>
          Documents Vault
        </button>
        <button onClick={() => setActiveMainTab('sop-draft')} className={`tab-btn ${activeMainTab === 'sop-draft' ? 'active' : ''}`}>
          Descriptive SOP Drafting Form
        </button>
        <button onClick={() => setActiveMainTab('registers')} className={`tab-btn ${activeMainTab === 'registers' ? 'active' : ''}`}>
          Accreditation Registers & Forms
        </button>
      </div>

      {/* VIEW 1: DOCUMENTS VAULT */}
      {activeMainTab === 'vault' && (
        <>
          {/* Search Bar & Filter Options */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.25rem' }}>
            <div className="flex align-center gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <Search size={18} className="text-tertiary" />
              <input
                type="text"
                className="form-control"
                style={{ border: 'none', padding: '0.25rem 0.5rem', backgroundColor: 'transparent', width: '100%', outline: 'none' }}
                placeholder="Search documents by ID, title, department, or mapped standard code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 align-center flex-wrap" style={{ fontSize: '0.8rem' }}>
              <div className="flex align-center gap-2">
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Document Type:</span>
                <select className="form-control" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Policy">Policy</option>
                  <option value="SOP">SOP</option>
                  <option value="Checklist">Checklist</option>
                  <option value="Forms">Forms</option>
                  <option value="Register">Register</option>
                  <option value="Evidence">Evidence</option>
                  <option value="CAPA">CAPA</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="flex align-center gap-2">
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Status:</span>
                <select className="form-control" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>
                Showing {filteredDocs.length} of {documents.length} entries
              </div>
            </div>
          </div>

          <div className="sop-generator-split" style={{ gridTemplateColumns: selectedDocDetails ? '1.1fr 0.9fr' : '1fr', gap: '1.25rem' }}>
            {/* Main List Table */}
            <div className="table-container" style={{ height: '550px', overflowY: 'auto', margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Doc ID</th>
                    <th>Title & Department</th>
                    <th>Version</th>
                    <th>Author</th>
                    <th>Standards</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                        No documents found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} style={{ cursor: 'pointer' }} className={selectedDocDetails?.id === doc.id ? 'active-row' : ''} onClick={() => { setSelectedDocDetails(doc); setIsEditing(false); setDrawerSubTab('body'); }}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{doc.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{doc.title}</div>
                          <div className="flex gap-1" style={{ marginTop: '0.25rem' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{doc.type}</span>
                            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{doc.department}</span>
                          </div>
                        </td>
                        <td>v{doc.version}</td>
                        <td>{doc.author}</td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            {doc.mappedStandards.map((std, sIdx) => (
                              <span key={sIdx} className="badge badge-primary-light" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{std}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${doc.status === 'Approved' ? 'badge-success' : doc.status === 'Pending Review' ? 'badge-warning' : 'badge-neutral'}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}>
                            <Eye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Doc Details Inspect Side Panel */}
            {selectedDocDetails ? (
              <div className="sop-preview-box flex flex-col gap-3" style={{ height: '550px', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', margin: 0 }}>
                {/* Header info */}
                <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }} className="flex align-center gap-1">
                    <FileText size={16} color="var(--primary)" /> Document Control Center
                  </span>
                  <div className="flex gap-2">
                    {!isEditing && (
                      <button onClick={handleStartEdit} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                    <button onClick={() => handleDeleteDoc(selectedDocDetails.id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                    <button onClick={() => { setSelectedDocDetails(null); setIsEditing(false); }} style={{ fontWeight: 800, fontSize: '1rem', padding: '0 0.25rem' }}>✕</button>
                  </div>
                </div>

                {/* Sub-tabs for drawer details */}
                {!isEditing && (
                  <div className="flex gap-2" style={{ backgroundColor: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => setDrawerSubTab('body')} 
                      className="tab-btn" 
                      style={{ flex: 1, padding: '0.35rem 0', fontSize: '0.75rem', textAlign: 'center', background: drawerSubTab === 'body' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderRadius: '6px', fontWeight: drawerSubTab === 'body' ? 'bold' : 'normal', color: drawerSubTab === 'body' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      Document Content Body
                    </button>
                    <button 
                      onClick={() => setDrawerSubTab('flowchart')} 
                      className="tab-btn"
                      style={{ flex: 1, padding: '0.35rem 0', fontSize: '0.75rem', textAlign: 'center', background: drawerSubTab === 'flowchart' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderRadius: '6px', fontWeight: drawerSubTab === 'flowchart' ? 'bold' : 'normal', color: drawerSubTab === 'flowchart' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      Workflow Flowchart Visualizer
                    </button>
                  </div>
                )}

                {/* Document Status alerts */}
                {selectedDocDetails.status === 'Pending Review' ? (
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(217,119,6,0.08)', color: 'var(--color-warning)', border: '1.5px solid var(--color-warning)', borderRadius: '8px', fontSize: '0.75rem' }} className="flex flex-col gap-1">
                    <div className="flex align-center gap-1" style={{ fontWeight: 700 }}>
                      <AlertTriangle size={14} />
                      <span>ACTION REQUIRED: Pending Review & Customization</span>
                    </div>
                    <span>Please review this SOP template. Customize its details below to reflect central hospital workflows, and authenticate it to fully satisfy standard objective evidence.</span>
                  </div>
                ) : selectedDocDetails.status === 'Approved' ? (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1.5px solid var(--color-success)', borderRadius: '8px', fontSize: '0.75rem' }} className="flex flex-col gap-1">
                    <div className="flex align-center gap-1" style={{ fontWeight: 700 }}>
                      <CheckCircle2 size={14} />
                      <span>VALIDATED & AUTHENTICATED</span>
                    </div>
                    <div style={{ fontSize: '0.7rem' }}>
                      <strong>Digital Hash:</strong> <code style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{selectedDocDetails.sha256Hash || 'SHA256-A83FC0198EBC9201'}</code>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.75rem' }}>
                    <span>This document is in draft state. It is not currently mapped to compliance standards.</span>
                  </div>
                )}

                {/* Document Profile details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div><strong>Document ID:</strong> {selectedDocDetails.id}</div>
                  <div><strong>Owner Dept:</strong> {selectedDocDetails.department}</div>
                  <div><strong>Doc Version:</strong> v{selectedDocDetails.version}</div>
                  <div><strong>Format Type:</strong> {selectedDocDetails.type}</div>
                  <div><strong>Author:</strong> {selectedDocDetails.author}</div>
                  <div><strong>Approver:</strong> {selectedDocDetails.approvedBy}</div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong>Standards Mapped:</strong> {selectedDocDetails.mappedStandards.length > 0 ? (
                      <span className="flex gap-1 flex-wrap" style={{ display: 'inline-flex', marginLeft: '0.25rem' }}>
                        {selectedDocDetails.mappedStandards.map(std => (
                          <span key={std} className="badge badge-primary-light" style={{ fontSize: '0.65rem' }}>{std}</span>
                        ))}
                      </span>
                    ) : 'None'}
                  </div>
                </div>

                {/* Document Content / Editor or Flowchart */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '180px' }}>
                  {isEditing ? (
                    <div className="flex flex-col gap-2" style={{ height: '100%', flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Edit Policy / SOP Content:</label>
                      <textarea
                        className="form-control"
                        style={{ flex: 1, minHeight: '150px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.4', padding: '0.75rem', backgroundColor: 'var(--bg-primary)' }}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end" style={{ marginTop: '0.25rem' }}>
                        <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <X size={12} /> Cancel
                        </button>
                        <button onClick={handleSaveChanges} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Save size={12} /> Save Draft Revision
                        </button>
                      </div>
                    </div>
                  ) : drawerSubTab === 'body' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Document Content Body:</label>
                      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, overflowY: 'auto', maxHeight: '220px' }}>
                        <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.4', margin: 0 }}>
                          {selectedDocDetails.content || "No content provided."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Workflow Flowchart Visualizer:</label>
                      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, overflowY: 'auto', maxHeight: '220px' }}>
                        {renderFlowchartComponent(selectedDocDetails.title, selectedDocDetails.content)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Authenticate Action */}
                {!isEditing && selectedDocDetails.status !== 'Approved' && (
                  <button onClick={handleOpenAuthenticate} className="btn btn-primary" style={{ width: '100%', padding: '0.625rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <FileSignature size={16} /> Verify & Authenticate SOP
                  </button>
                )}

                {/* Version Revision History */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <History size={12} /> Digital Audit Trail & Revisions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div className="flex justify-between">
                      <span>v{selectedDocDetails.version} ({selectedDocDetails.status})</span>
                      <span>Reviewed: {selectedDocDetails.lastReviewed} by {selectedDocDetails.approvedBy}</span>
                    </div>
                    {selectedDocDetails.version !== '1.0' && (
                      <div className="flex justify-between" style={{ color: 'var(--text-tertiary)' }}>
                        <span>v1.0 (Superseded Template)</span>
                        <span>Imported: 2026-06-11 by Official NABH Committee</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex flex-col align-center justify-center text-center" style={{ height: '550px', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', margin: 0 }}>
                <FileText size={48} className="text-tertiary" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem' }}>No Document Selected</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', marginTop: '0.25rem' }}>
                  Select any document or template from the repository list to inspect its contents, edit its body, or electronically sign off on standard controls.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: DESCRIPTIVE SOP DRAFTING ASSISTANT */}
      {activeMainTab === 'sop-draft' && (
        <div className="sop-generator-split" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Parameter Form Card */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="var(--primary)" /> Descriptive SOP Drafting Form
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Provide key parameters to draft a clinical SOP. The AI Co-pilot compiles these into a structured policy and creates a workflow chart.
              </p>
            </div>

            <form onSubmit={handleDraftSOP} className="flex flex-col gap-2">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Document Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. ICU Intubation and Ventilator Care SOP"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Map NABH Standard</label>
                  <select
                    className="form-control"
                    value={draftStandard}
                    onChange={(e) => setDraftStandard(e.target.value)}
                  >
                    {standards.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.title.slice(0, 24)}...</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Owner Department</label>
                  <select
                    className="form-control"
                    value={draftDept}
                    onChange={(e) => setDraftDept(e.target.value)}
                  >
                    <option value="OPD">Out-Patient (OPD)</option>
                    <option value="Emergency">Emergency Room</option>
                    <option value="ICU">Intensive Care (ICU)</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Housekeeping">Housekeeping & Waste</option>
                    <option value="HR">Human Resources</option>
                    <option value="Quality">Quality Control</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Clinical Objective & Goal</label>
                <textarea
                  required
                  rows="2"
                  className="form-control"
                  placeholder="What does this SOP aim to accomplish?"
                  value={draftObjective}
                  onChange={(e) => setDraftObjective(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Key Workflow Steps (One step per line)</label>
                <textarea
                  required
                  rows="4"
                  className="form-control"
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  placeholder="1. Step one details&#10;2. Step two details&#10;3. Step three details"
                  value={draftSteps}
                  onChange={(e) => setDraftSteps(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Responsible Personnel Roles</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. ICU Nurse, Duty Intensivist, Ward In-charge"
                  value={draftRoles}
                  onChange={(e) => setDraftRoles(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Safety Gaps to Address</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="What safety deficiencies should this protocol resolve?"
                  value={draftGaps}
                  onChange={(e) => setDraftGaps(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.625rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={isDrafting}
              >
                <Activity size={16} /> {isDrafting ? 'AI Co-pilot compiling draft...' : 'Compile & Draft SOP'}
              </button>
            </form>
          </div>

          {/* Draft Result Preview Card */}
          <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', height: '620px', overflowY: 'auto' }}>
            <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>SOP Draft & Flowchart Preview</span>
              {draftResultText && <span className="badge badge-warning">Draft Compiled</span>}
            </div>

            {draftResultText ? (
              <div className="flex flex-col gap-3" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Compiled Markdown SOP:</label>
                  <textarea
                    className="form-control"
                    style={{ flex: 1, minHeight: '180px', fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', lineHeight: '1.4' }}
                    value={draftResultText}
                    onChange={(e) => setDraftResultText(e.target.value)}
                  />
                </div>

                {/* Visual Flowchart Display */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Workflow Flowchart Nodes:</label>
                  {renderFlowchartComponent(draftTitle, draftSteps)}
                </div>

                <div className="flex gap-2 justify-end" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setDraftResultText('')} className="btn btn-secondary">Discard</button>
                  <button onClick={handleSaveDraftSop} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={14} /> Approve & Save to Vault
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-tertiary)' }} className="flex flex-col align-center gap-2">
                <FileText size={48} className="text-tertiary" />
                <h4 style={{ fontSize: '1rem' }}>No active draft compiled</h4>
                <p style={{ fontSize: '0.8rem', maxWidth: '280px' }}>Fill in the descriptive parameters on the left and click "Compile & Draft SOP".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ACCREDITATION REGISTERS & FORMS CONSOLE */}
      {activeMainTab === 'registers' && (
        <div className="flex flex-col gap-3">
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Accreditation Registers & Compliance Forms Console</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Super Admins can record compliance event logs. Submitting a register compiles the record, archives it to the central Document Vault, and immediately upgrades standard scores to Fully Met (10 pts).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Card 1: Fire Drill */}
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
              <div>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>FMS.1.d (Safety)</span>
                  <span className="badge badge-danger">Register</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🔥 Fire Drill Safety Checklist
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  Log mock fire drill logs, attendance lists, evacuation times, smoke canister testing details, exit corridor checks, and gaps.
                </p>
              </div>
              <button onClick={() => setActiveRegisterForm('fire')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>
                Log Fire Drill Record
              </button>
            </div>

            {/* Card 2: Bio Waste */}
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', borderLeft: '4px solid #eab308' }}>
              <div>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>FMS.2.a (Hazmat)</span>
                  <span className="badge badge-warning">Forms</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ☣️ Bio Waste Shipment Manifest
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  Record daily bag weights (yellow, red, blue, sharps) and log carrier barcodes, manifest receipts, and pollution control checks.
                </p>
              </div>
              <button onClick={() => setActiveRegisterForm('waste')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>
                Log Waste Movement Log
              </button>
            </div>

            {/* Card 3: Training Tracker */}
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
              <div>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>HRM.2.b (Infection)</span>
                  <span className="badge badge-primary-light" style={{ color: 'var(--primary)' }}>Checklist</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🧼 Hygiene Training Tracker
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  Log staff training sessions for clinical hand scrubbing, WHO moments, evaluations pass rates, and training checklists.
                </p>
              </div>
              <button onClick={() => setActiveRegisterForm('training')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>
                Log Training Attendance
              </button>
            </div>

            {/* Card 4: Staff Certification */}
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
              <div>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>HRM.1.a (Credentials)</span>
                  <span className="badge badge-neutral">Evidence</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  📜 Staff Council Certification
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  Upload degrees, registrar council verify records, check professional licensing validity, and audit primary source credentials.
                </p>
              </div>
              <button onClick={() => setActiveRegisterForm('cert')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>
                Add Staff License Certificate
              </button>
            </div>

            {/* Card 5: Equipment Calibration */}
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>COP.5.c (ICU)</span>
                  <span className="badge badge-success">Register</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚙️ Equipment Calibration Register
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  Track hospital biomedical instruments, serial numbers, agency safety calibration testing logs, and next due date triggers.
                </p>
              </div>
              <button onClick={() => setActiveRegisterForm('calibration')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>
                Log Calibration Test
              </button>
            </div>

            {/* Card 6: Incident Reporting */}
            <div className="card flex flex-col justify-between" style={{ padding: '1.25rem', borderLeft: '4px solid #f97316' }}>
              <div>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>COP.2.b (Clinics)</span>
                  <span className="badge badge-warning">CAPA Link</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ Clinical Incident Safety Report
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  File medication errors, sentinel events, patient falls, immediate action checklists, investigator sign-off, and risk triggers.
                </p>
              </div>
              <button onClick={() => setActiveRegisterForm('incident')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>
                Log Incident Safety Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER FORM 1: FIRE DRILL MODAL */}
      {activeRegisterForm === 'fire' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>🔥 Log Fire Drill Record</h3>
              <button onClick={() => setActiveRegisterForm(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Drill Date</label>
                  <input type="date" required className="form-control" value={fireForm.date} onChange={(e) => setFireForm({ ...fireForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Drill Supervisor / Officer</label>
                  <input type="text" required className="form-control" value={fireForm.supervisor} onChange={(e) => setFireForm({ ...fireForm, supervisor: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Staff Attendees (Comma separated)</label>
                  <textarea rows="2" required className="form-control" value={fireForm.attendees} onChange={(e) => setFireForm({ ...fireForm, attendees: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Identified Gaps / Hazards</label>
                  <textarea rows="2" required className="form-control" value={fireForm.gaps} onChange={(e) => setFireForm({ ...fireForm, gaps: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Remedial Action Taken</label>
                  <textarea rows="2" required className="form-control" value={fireForm.correctiveAction} onChange={(e) => setFireForm({ ...fireForm, correctiveAction: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActiveRegisterForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Fire Drill log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER FORM 2: BIO WASTE MODAL */}
      {activeRegisterForm === 'waste' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>☣️ Log Bio-Waste Movement Manifest</h3>
              <button onClick={() => setActiveRegisterForm(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Date Shipped</label>
                  <input type="date" required className="form-control" value={wasteForm.date} onChange={(e) => setWasteForm({ ...wasteForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Manifest Number (Pollution Board)</label>
                  <input type="text" required className="form-control" value={wasteForm.manifestNum} onChange={(e) => setWasteForm({ ...wasteForm, manifestNum: e.target.value })} />
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Yellow Bag (kg)</label>
                    <input type="number" step="0.1" required className="form-control" value={wasteForm.yellowWeight} onChange={(e) => setWasteForm({ ...wasteForm, yellowWeight: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Red Bag (kg)</label>
                    <input type="number" step="0.1" required className="form-control" value={wasteForm.redWeight} onChange={(e) => setWasteForm({ ...wasteForm, redWeight: e.target.value })} />
                  </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Blue Box (kg)</label>
                    <input type="number" step="0.1" required className="form-control" value={wasteForm.blueWeight} onChange={(e) => setWasteForm({ ...wasteForm, blueWeight: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">White Sharps (kg)</label>
                    <input type="number" step="0.1" required className="form-control" value={wasteForm.sharpsWeight} onChange={(e) => setWasteForm({ ...wasteForm, sharpsWeight: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Registered Waste Handler</label>
                  <input type="text" required className="form-control" value={wasteForm.handler} onChange={(e) => setWasteForm({ ...wasteForm, handler: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActiveRegisterForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Waste Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER FORM 3: HYGIENE TRAINING MODAL */}
      {activeRegisterForm === 'training' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>🧼 Log Hygiene Training Session</h3>
              <button onClick={() => setActiveRegisterForm(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Date of Training</label>
                  <input type="date" required className="form-control" value={trainingForm.date} onChange={(e) => setTrainingForm({ ...trainingForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Topic / Chapter</label>
                  <input type="text" required className="form-control" value={trainingForm.topic} onChange={(e) => setTrainingForm({ ...trainingForm, topic: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trainer Name</label>
                  <input type="text" required className="form-control" value={trainingForm.trainer} onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })} />
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Attendees count</label>
                    <input type="number" required className="form-control" value={trainingForm.attendeesCount} onChange={(e) => setTrainingForm({ ...trainingForm, attendeesCount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Passing Rate (%)</label>
                    <input type="number" min="0" max="100" required className="form-control" value={trainingForm.passingRate} onChange={(e) => setTrainingForm({ ...trainingForm, passingRate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Evaluation Quiz Reference Code</label>
                  <input type="text" required className="form-control" value={trainingForm.quizCode} onChange={(e) => setTrainingForm({ ...trainingForm, quizCode: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActiveRegisterForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Session Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER FORM 4: STAFF CERTIFICATION MODAL */}
      {activeRegisterForm === 'cert' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>📜 Add Professional Staff Council Certificate</h3>
              <button onClick={() => setActiveRegisterForm(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Employee / Staff Name</label>
                  <input type="text" required className="form-control" value={staffCertForm.staffName} onChange={(e) => setStaffCertForm({ ...staffCertForm, staffName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical Role</label>
                  <select className="form-control" value={staffCertForm.role} onChange={(e) => setStaffCertForm({ ...staffCertForm, role: e.target.value })}>
                    <option value="Doctor">Doctor (General Medicine)</option>
                    <option value="Surgeon">Surgical Specialist</option>
                    <option value="Nurse">Registered Nurse</option>
                    <option value="Pharmacist">Clinical Pharmacist</option>
                    <option value="Lab Technician">Lab Technician</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Certificate / Registration Name</label>
                  <input type="text" required className="form-control" value={staffCertForm.certName} onChange={(e) => setStaffCertForm({ ...staffCertForm, certName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Issuing Council Authority</label>
                  <input type="text" required className="form-control" value={staffCertForm.council} onChange={(e) => setStaffCertForm({ ...staffCertForm, council: e.target.value })} />
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input type="date" required className="form-control" value={staffCertForm.issueDate} onChange={(e) => setStaffCertForm({ ...staffCertForm, issueDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" required className="form-control" value={staffCertForm.expiryDate} onChange={(e) => setStaffCertForm({ ...staffCertForm, expiryDate: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActiveRegisterForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Certificate Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER FORM 5: EQUIPMENT CALIBRATION MODAL */}
      {activeRegisterForm === 'calibration' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>⚙️ Log Equipment Calibration Check</h3>
              <button onClick={() => setActiveRegisterForm(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Equipment Name / Location</label>
                  <input type="text" required className="form-control" value={calibrationForm.name} onChange={(e) => setCalibrationForm({ ...calibrationForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial / Asset Number</label>
                  <input type="text" required className="form-control" value={calibrationForm.serialNum} onChange={(e) => setCalibrationForm({ ...calibrationForm, serialNum: e.target.value })} />
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Calibration Date</label>
                    <input type="date" required className="form-control" value={calibrationForm.date} onChange={(e) => setCalibrationForm({ ...calibrationForm, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Calibration Due</label>
                    <input type="date" required className="form-control" value={calibrationForm.nextDue} onChange={(e) => setCalibrationForm({ ...calibrationForm, nextDue: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Testing Agency</label>
                  <input type="text" required className="form-control" value={calibrationForm.agency} onChange={(e) => setCalibrationForm({ ...calibrationForm, agency: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Calibration Outcome Status</label>
                  <select className="form-control" value={calibrationForm.status} onChange={(e) => setCalibrationForm({ ...calibrationForm, status: e.target.value })}>
                    <option value="Pass">Verified Pass (No deviation)</option>
                    <option value="Fail">Failed Verification (Needs service)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActiveRegisterForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Calibration log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER FORM 6: INCIDENT REPORT MODAL */}
      {activeRegisterForm === 'incident' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>⚠️ Log Clinical Incident Report</h3>
              <button onClick={() => setActiveRegisterForm(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Incident Type</label>
                    <select className="form-control" value={incidentForm.type} onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}>
                      <option value="Medication Error">Medication Error</option>
                      <option value="Patient Fall">Patient Fall</option>
                      <option value="Equipment Failure">Equipment Failure</option>
                      <option value="Needlestick Injury">Needlestick Injury</option>
                      <option value="Infection Outbreak">Infection Outbreak</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Incident Date & Time</label>
                    <input type="text" required className="form-control" value={incidentForm.date} onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })} />
                  </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" required className="form-control" value={incidentForm.dept} onChange={(e) => setIncidentForm({ ...incidentForm, dept: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select className="form-control" value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}>
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk / Sentinel</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea rows="3" required className="form-control" value={incidentForm.desc} onChange={(e) => setIncidentForm({ ...incidentForm, desc: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Immediate Remedial Action taken</label>
                  <textarea rows="2" required className="form-control" value={incidentForm.immediateAction} onChange={(e) => setIncidentForm({ ...incidentForm, immediateAction: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActiveRegisterForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">File Incident log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showDocUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Upload Compliance Document</h3>
              <button onClick={() => { setShowDocUploadModal(false); setUploadedFile(null); }} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body flex flex-col gap-2" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Document File</label>
                  <div 
                    className="upload-zone" 
                    style={{ padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}
                    onClick={() => document.getElementById('vault-file-input').click()}
                  >
                    <input 
                      type="file" 
                      id="vault-file-input" 
                      style={{ display: 'none' }}
                      accept=".txt,.pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={handleVaultFileChange}
                    />
                    <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {uploadedFile ? `Selected: ${uploadedFile.name}` : "Click to select a file (PDF, DOCX, XLSX, TXT, PNG, JPG)"}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Selecting a file will auto-scan headers and map standard scores</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Document Title / Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Out-Patient Care Management SOP"
                    value={newDocForm.title}
                    onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select
                      className="form-control"
                      value={newDocForm.type}
                      onChange={(e) => setNewDocForm({ ...newDocForm, type: e.target.value })}
                    >
                      <option value="Policy">Policy</option>
                      <option value="SOP">SOP</option>
                      <option value="Checklist">Checklist</option>
                      <option value="Forms">Forms</option>
                      <option value="Register">Register</option>
                      <option value="Evidence">Evidence</option>
                      <option value="CAPA">CAPA</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department Owner</label>
                    <select
                      className="form-control"
                      value={newDocForm.department}
                      onChange={(e) => setNewDocForm({ ...newDocForm, department: e.target.value })}
                    >
                      <option value="Quality">Quality Control</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="ICU">ICU</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="OPD">OPD</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Document Content Body</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Enter document instructions..."
                    value={newDocForm.content}
                    onChange={(e) => setNewDocForm({ ...newDocForm, content: e.target.value })}
                  />
                </div>

                {/* Standards selection list */}
                <div className="form-group">
                  <label className="form-label">Map to standard objective elements</label>
                  <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: 'var(--bg-primary)' }}>
                    {standards.map((std) => (
                      <label key={std.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newDocForm.mappedStandards.includes(std.id)}
                          onChange={() => toggleStandardSelect(std.id)}
                        />
                        <span><strong>{std.id}</strong> - {std.title} ({std.chapter})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowDocUploadModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Process Draft Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Electronic Sign-Off Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FileSignature size={18} color="var(--primary)" /> Cryptographic Sign-Off
              </h3>
              <button onClick={() => setShowAuthModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleAuthenticateSubmit}>
              <div className="modal-body flex flex-col gap-3" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  By authenticating, you electronically sign off on this document and certify that it complies with the <strong>NABH 6th Edition Quality Guidelines</strong> for the hospital.
                </div>

                <div className="form-group">
                  <label className="form-label">Electronic Signatory Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Enter your name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Verification PIN (Mock: 1234)</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="••••"
                    value={authPin}
                    onChange={(e) => setAuthPin(e.target.value)}
                  />
                </div>

                {authError && (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>
                    ⚠️ {authError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
                  <Lock size={14} style={{ flexShrink: 0 }} />
                  <span>SHA-256 digital signature will be generated in local database upon sign-off.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAuthModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Sign & Approve</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
