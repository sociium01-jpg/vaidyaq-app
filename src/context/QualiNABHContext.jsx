import React, { createContext, useState, useEffect } from 'react';

export const QualiNABHContext = createContext();

// Default Preloaded Mock Data (Active Demo State)
const defaultStandards = [
  { id: "AAC.1.a", chapter: "AAC", title: "OPD Registration Process", description: "There is an established registration process for out-patient departments.", evidenceRequired: "OPD Registration Policy, Audit Checklist", status: "Fully Met", score: 10, department: "OPD" },
  { id: "AAC.2.b", chapter: "AAC", title: "Admission Criteria & Protocols", description: "Admissions are done according to pre-defined clinical criteria.", evidenceRequired: "Admission Protocol Document", status: "Partially Met", score: 5, department: "Emergency" },
  { id: "AAC.3.a", chapter: "AAC", title: "Discharge & Referral Summary", description: "Discharge summaries are provided to all patients with detailed follow-up advice.", evidenceRequired: "Discharge SOP, Standard Referral Form", status: "Fully Met", score: 10, department: "Medical Records" },
  
  { id: "COP.1.a", chapter: "COP", title: "General Care Guidelines", description: "Uniform care of patients is provided in all departments according to guidelines.", evidenceRequired: "General Patient Care Manual", status: "Fully Met", score: 10, department: "Nursing" },
  { id: "COP.2.b", chapter: "COP", title: "Emergency Care Protocols", description: "Emergency department has standardized guidelines for trauma and cardiac arrest.", evidenceRequired: "CPR Policy, Triage Protocol", status: "Partially Met", score: 5, department: "Emergency" },
  { id: "COP.5.c", chapter: "COP", title: "ICU Management & Admission", description: "Intensive care units have designated admission and discharge criteria.", evidenceRequired: "ICU Standard Guidelines", status: "Not Met", score: 0, department: "ICU" },

  { id: "MOM.1.a", chapter: "MOM", title: "Medication Formulary", description: "There is an officially approved hospital medicine formulary.", evidenceRequired: "Medication Formulary Booklet", status: "Fully Met", score: 10, department: "Pharmacy" },
  { id: "MOM.2.c", chapter: "MOM", title: "High-Alert Medication Safety", description: "High-alert medications are identified, stored in locked cupboards, and double-checked.", evidenceRequired: "High-Alert Meds SOP, Audit Logs", status: "Partially Met", score: 5, department: "Pharmacy" },
  { id: "MOM.3.a", chapter: "MOM", title: "Medication Expiry Auditing", description: "Expired drugs are segregated immediately and disposed of safely.", evidenceRequired: "Drug Expiry SOP, Disposal Register", status: "Not Met", score: 0, department: "Pharmacy" },

  { id: "FMS.1.d", chapter: "FMS", title: "Emergency & Fire Preparedness", description: "Mock fire drills and evacuation exercises are conducted periodically.", evidenceRequired: "Mock Fire Drill Report, Attendance Records", status: "Fully Met", score: 10, department: "Security & Facility" },
  { id: "FMS.2.a", chapter: "FMS", title: "Hazardous Materials Control", description: "Hazardous chemicals and medical wastes are labelled and stored securely.", evidenceRequired: "Hazmat Protocol, Waste Logs", status: "Partially Met", score: 5, department: "Housekeeping" },

  { id: "HRM.1.a", chapter: "HRM", title: "Credentialing of Professionals", description: "Qualifications and license verifications are kept for all doctors and nurses.", evidenceRequired: "Staff Credentials SOP, License Auditing", status: "Fully Met", score: 10, department: "HR" },
  { id: "HRM.2.b", chapter: "HRM", title: "Infection Control Training", description: "All staff members undergo basic training in hand hygiene and infection control.", evidenceRequired: "Training Attendance, Evaluation Quiz", status: "Partially Met", score: 5, department: "Infection Control" }
];

const defaultDocuments = [
  { id: "doc-1", title: "Out-Patient Registration & Billing Policy", type: "Policy", department: "OPD", version: "1.0", status: "Approved", author: "Dr. Paul (Quality Head)", approvedBy: "Dr. Mehta (Medical Director)", lastReviewed: "2026-01-10", nextReview: "2027-01-10", mappedStandards: ["AAC.1.a"], isEncrypted: true },
  { id: "doc-2", title: "Admission & Emergency Triage SOP", type: "SOP", department: "Emergency", version: "2.1", status: "Approved", author: "Dr. Rita (OPD Chair)", approvedBy: "Dr. Mehta (Medical Director)", lastReviewed: "2026-03-15", nextReview: "2027-03-15", mappedStandards: ["AAC.2.b", "COP.2.b"], isEncrypted: true },
  { id: "doc-3", title: "Hospital Medication Formulary Guidebook", type: "Formulary", department: "Pharmacy", version: "2026.1", status: "Approved", author: "Dr. Sen (Pharmacy Head)", approvedBy: "Dr. Mehta (Medical Director)", lastReviewed: "2025-12-01", nextReview: "2026-12-01", mappedStandards: ["MOM.1.a"], isEncrypted: true },
  { id: "doc-4", title: "High-Alert Medication Handling Guidelines", type: "SOP", department: "Pharmacy", version: "1.3", status: "Approved", author: "Dr. Sen (Pharmacy Head)", approvedBy: "Dr. Mehta (Medical Director)", lastReviewed: "2026-04-05", nextReview: "2027-04-05", mappedStandards: ["MOM.2.c"], isEncrypted: true },
  { id: "doc-5", title: "Fire Safety & Evacuation Drill Protocol", type: "Policy", department: "Security & Facility", version: "1.1", status: "Approved", author: "Mr. Verma (Facilities)", approvedBy: "Col. Roy (COO)", lastReviewed: "2026-02-18", nextReview: "2027-02-18", mappedStandards: ["FMS.1.d"], isEncrypted: true },
  { id: "doc-6", title: "Biomedical Waste Disposal Procedure", type: "SOP", department: "Housekeeping", version: "1.0", status: "Pending Review", author: "Mr. Verma (Facilities)", approvedBy: "Pending", lastReviewed: "2026-05-20", nextReview: "2026-11-20", mappedStandards: ["FMS.2.a"], isEncrypted: true },
  { id: "doc-7", title: "Expired Drug Disposal and Auditing System", type: "SOP", department: "Pharmacy", version: "1.0-Draft", status: "Draft", author: "Dr. Sen (Pharmacy Head)", approvedBy: "Not Approved", lastReviewed: "2026-06-01", nextReview: "2026-07-01", mappedStandards: ["MOM.3.a"], isEncrypted: true }
];

const defaultAudits = [
  {
    id: "audit-1",
    title: "ICU Protocol & Crash Cart Audit",
    department: "ICU",
    auditor: "Ramesh Kumar (Quality Officer)",
    date: "2026-06-05",
    status: "Completed",
    checklist: ["Crash cart locks intact", "Infection control guidelines posted", "Nurses understand code blue response", "Crash cart drugs verified for expiry"],
    findings: [
      { id: "find-1", issue: "Crash cart has 2 expired saline syringes (Exp May 2026)", severity: "High", capaId: "capa-1", resolved: false }
    ]
  },
  {
    id: "audit-2",
    title: "OPD Registration Audit",
    department: "OPD",
    auditor: "Ramesh Kumar (Quality Officer)",
    date: "2026-06-08",
    status: "Completed",
    checklist: ["ID check verified", "Waiting time under 15 mins", "Emergency referral path clear"],
    findings: []
  },
  {
    id: "audit-3",
    title: "Pharmacy Storage and High-Alert Drugs Audit",
    department: "Pharmacy",
    auditor: "Sujata Roy (Quality Manager)",
    date: "2026-06-12",
    status: "Scheduled",
    checklist: ["High-alert cabinet locked", "SOP acknowledged by staff", "Expiry tracker updated"],
    findings: []
  }
];

const defaultCapas = [
  {
    id: "capa-1",
    source: "Audit: ICU Protocol & Crash Cart Audit",
    department: "ICU",
    responsible: "Sister Gracy (ICU Nursing In-Charge)",
    dueDate: "2026-06-20",
    priority: "High",
    rootCause: "Lack of inventory check log sheets at nurse shift handover.",
    correctiveAction: "Replace the 2 expired syringes immediately from main store.",
    preventiveAction: "Introduce a daily sign-off sheet for the crash cart pharmacy checklist and train night staff.",
    status: "Open",
    evidenceFile: null,
    closureApprovedBy: null
  }
];

const defaultIncidents = [
  {
    id: "inc-1",
    type: "Medication Error",
    department: "Pharmacy",
    dateTime: "2026-06-10 14:30",
    severity: "Medium",
    description: "Wrong dosage of Aspirin (75mg instead of 150mg) dispensed to OPD patient due to handwriting ambiguity on prescription.",
    immediateAction: "Contacted patient immediately, verified medicine was not consumed, and replaced with correct dose.",
    investigator: "Dr. Sen (Pharmacy Committee Chair)",
    status: "Under Investigation",
    capaId: "capa-pending-1"
  },
  {
    id: "inc-2",
    type: "Patient Fall",
    department: "ICU",
    dateTime: "2026-06-02 08:15",
    severity: "High",
    description: "Post-op patient slipped while attempting to go to restroom without nurse assistance. Bed side rails were down.",
    immediateAction: "Medical examination performed, no fracture detected, bedside rails locked, staff re-instructed.",
    investigator: "Dr. Rita (Safety Committee)",
    status: "Closed",
    capaId: null
  }
];

const defaultLicenses = [
  { id: "lic-1", name: "Pollution Control Board - Bio-Medical Waste Authorization", authority: "State Pollution Control Board", issueDate: "2022-08-15", expiryDate: "2026-08-15", responsible: "Mr. Verma (Facilities Manager)", status: "Active" },
  { id: "lic-2", name: "Narcotic Drugs Storage License", authority: "State Drug Controller Office", issueDate: "2025-05-10", expiryDate: "2026-05-10", responsible: "Dr. Sen (Pharmacy Head)", status: "Expired" },
  { id: "lic-3", name: "Fire Safety No-Objection Certificate (NOC)", authority: "Fire Safety Board", issueDate: "2025-09-01", expiryDate: "2026-09-01", responsible: "Col. Roy (COO)", status: "Active" },
  { id: "lic-4", name: "Atomic Energy Regulatory Board (AERB) X-Ray Certification", authority: "AERB", issueDate: "2023-10-10", expiryDate: "2026-10-10", responsible: "Mr. Dave (Radiology Chief)", status: "Active" }
];

const defaultTasks = [
  { id: "task-1", title: "Conduct Pharmacy Handover Training", assignedTo: "Dr. Sen", dueDate: "2026-06-18", status: "Pending", priority: "High" },
  { id: "task-2", title: "Upload Fire Drill Attendance Sheets", assignedTo: "Mr. Verma", dueDate: "2026-06-15", status: "Pending", priority: "Medium" },
  { id: "task-3", title: "Perform weekly checklist check on crash cart", assignedTo: "Sister Gracy", dueDate: "2026-06-13", status: "Completed", priority: "High" }
];

const defaultAuditLogs = [
  { id: "log-1", timestamp: "2026-06-11 10:15:32", user: "admin@vaidyaq.com", role: "Super Admin", action: "User logged in", ipAddress: "192.168.1.101" },
  { id: "log-2", timestamp: "2026-06-11 11:20:10", user: "quality.head@hospital.org", role: "Quality Head", action: "Updated scoring for MOM.2.c from 0 to 5", ipAddress: "192.168.1.108" },
  { id: "log-3", timestamp: "2026-06-11 14:02:44", user: "pharmacy.head@hospital.org", role: "Department Head", action: "Uploaded Draft SOP: Expired Drug Disposal Protocol", ipAddress: "192.168.1.112" }
];

const defaultQualityIndicators = [
  { month: "Jan", falls: 1, medicationErrors: 3, infections: 2, needleSticks: 4 },
  { month: "Feb", falls: 0, medicationErrors: 2, infections: 1, needleSticks: 2 },
  { month: "Mar", falls: 2, medicationErrors: 5, infections: 3, needleSticks: 1 },
  { month: "Apr", falls: 1, medicationErrors: 1, infections: 1, needleSticks: 3 },
  { month: "May", falls: 3, medicationErrors: 2, infections: 0, needleSticks: 2 },
  { month: "Jun", falls: 0, medicationErrors: 4, infections: 1, needleSticks: 0 }
];

const defaultComplianceFeed = [
  { id: "feed-1", date: "2026-06-10", title: "National Health Authority (NHA) releases ABDM v3.0 Guidelines", category: "Regulatory Update", content: "ABDM Health Locker integration requirements have been revised. Hospitals must ensure all medical record PDFs generated conform to the new metadata tagging guidelines.", source: "National Health Authority", isNew: true },
  { id: "feed-2", date: "2026-06-08", title: "QCI introduces updated Fire Security Audit Template for Hospitals", category: "Compliance Alert", content: "Quality Council of India (QCI) has launched a new mock drill scoring checklist. Fire safety logs must now detail extinguisher canister weight verifications.", source: "Quality Council of India", isNew: false },
  { id: "feed-3", date: "2026-06-02", title: "NABH 6th Edition Medication Storage Amendments", category: "NABH Notice", content: "High-alert medication locks must be checked at every shift change. Dual-custody signatures are mandated for narcotic withdrawals.", source: "NABH constitutive board", isNew: false }
];

export const QualiNABHProvider = ({ children }) => {
  // Get namespaced key loader helper
  const loadNamespacedState = (key, defaultValue) => {
    const savedUser = localStorage.getItem('qn_user');
    let activeEmail = null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        activeEmail = parsed.parentEmail || parsed.email;
      } catch (e) {}
    }
    const prefix = activeEmail ? `${activeEmail}_` : '';
    const saved = localStorage.getItem(prefix + key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return saved; // string fallback
      }
    }
    
    // Fallback logic for demo accounts (demo@vaidyaq.com or quality.head@hospital.org)
    const isDemo = activeEmail === 'demo@vaidyaq.com' || activeEmail === 'quality.head@hospital.org';
    if (isDemo) {
      const globalSaved = localStorage.getItem(key);
      if (globalSaved) {
        try {
          return JSON.parse(globalSaved);
        } catch (e) {}
      }
      return defaultValue;
    }
    
    // For new signups, return blank templates
    if (activeEmail) {
      if (key === 'qn_standards') {
        return defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" }));
      }
      if (key === 'qn_licenses') {
        return defaultLicenses.map(l => ({
          ...l,
          issueDate: '',
          expiryDate: '',
          responsible: l.responsible.includes('(') ? l.responsible.substring(l.responsible.indexOf('(') + 1, l.responsible.length - 1) : l.responsible,
          status: 'Expired'
        }));
      }
      return Array.isArray(defaultValue) ? [] : typeof defaultValue === 'object' ? {} : defaultValue;
    }
    return defaultValue;
  };

  // Authentication Role - default to null (landing page marketing)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('qn_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('qn_theme') || 'light';
  });

  // Current Router Tab
  const [currentRoute, setCurrentRoute] = useState('/');

  // Force early renewal payment block screen early flag
  const [forcePaymentScreen, setForcePaymentScreen] = useState(false);

  // Hospital Onboarding State Type: 'active' or 'new'
  const [hospitalMode, setHospitalMode] = useState(() => {
    return loadNamespacedState('qn_hospital_mode', 'active');
  });

  // Dynamic Hospital Settings
  const [hospitalName, setHospitalName] = useState(() => {
    return loadNamespacedState('qn_hospital_name', 'City Central Metro Hospital');
  });

  const [hospitalBeds, setHospitalBeds] = useState(() => {
    return loadNamespacedState('qn_hospital_beds', '120');
  });

  const [hospitalTier, setHospitalTier] = useState(() => {
    return loadNamespacedState('qn_hospital_tier', 'Full Accreditation');
  });

  const [activeDepts, setActiveDepts] = useState(() => {
    return loadNamespacedState('qn_active_depts', ['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing']);
  });

  const [onboardingSteps, setOnboardingSteps] = useState(() => {
    return loadNamespacedState('qn_onboarding_steps', { identity: false, departments: false, importTemplates: false, firstSop: false });
  });

  // Databases States
  const [standards, setStandards] = useState(() => {
    return loadNamespacedState('qn_standards', defaultStandards);
  });

  // SaaS Multi-tenant & Vendor Admin States - demo-hosp configured with email demo@vaidyaq.com and password demo123
  const [clientsList, setClientsList] = useState(() => {
    const saved = localStorage.getItem('qn_clients_list');
    const signup = new Date(Date.now() - 3*24*60*60*1000).toISOString();
    const expiry = new Date(Date.now() + 4*24*60*60*1000).toISOString();
    return saved ? JSON.parse(saved) : [
      { 
        hospitalId: "demo-hosp", 
        hospitalName: "City Central Metro Hospital", 
        email: "demo@vaidyaq.com", 
        beds: 120, 
        trialStartDate: signup, 
        signupDate: signup,
        planExpiryDate: expiry,
        isSubscribed: true, 
        status: "Paid", 
        address: "Sector 4, Dwarka, New Delhi", 
        regId: "REG-99201",
        govId: "07AAAAA1111A1Z1",
        govIdType: "GSTIN",
        govIdStatus: "Approved",
        storageUsed: 3145728,
        bounced: false,
        password: "demo123",
        firstLoginDate: signup
      },
      { 
        hospitalId: "sarah-hosp", 
        hospitalName: "Central City Clinic", 
        email: "quality.head@hospital.org", 
        beds: 50, 
        trialStartDate: signup, 
        signupDate: signup,
        planExpiryDate: expiry,
        isSubscribed: true, 
        status: "Paid", 
        address: "Sector 4, Dwarka, New Delhi", 
        regId: "REG-99202",
        govId: "07AAAAA1111A1Z2",
        govIdType: "GSTIN",
        govIdStatus: "Approved",
        storageUsed: 1048576,
        bounced: false,
        password: "demo123",
        firstLoginDate: signup
      }
    ];
  });

  const [isSubscribed, setIsSubscribed] = useState(() => {
    return loadNamespacedState('qn_is_subscribed', false);
  });

  const [trialStartDate, setTrialStartDate] = useState(() => {
    return loadNamespacedState('qn_trial_start_date', new Date().toISOString());
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return loadNamespacedState('qn_gemini_api_key', '');
  });

  const [hospitalLogo, setHospitalLogo] = useState(() => {
    return loadNamespacedState('qn_hospital_logo', '🛡️');
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    return loadNamespacedState('qn_team_members', [
      { email: "quality.head@hospital.org", name: "Dr. Sarah Paul", role: "Quality Head", department: "Quality Control" },
      { email: "super@vaidyaq.com", name: "Col. Roy", role: "Super Admin", department: "Board" },
      { email: "pharmacy@hospital.org", name: "Dr. Sen", role: "Department Head", department: "Pharmacy" }
    ]);
  });

  const [vendorAdminCredentials, setVendorAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('qn_vendor_credentials');
    return saved ? JSON.parse(saved) : { username: "admin", password: "123" };
  });

  const [vendorEmployees, setVendorEmployees] = useState(() => {
    const saved = localStorage.getItem('qn_vendor_employees');
    return saved ? JSON.parse(saved) : [
      { id: "emp-1", name: "Aarav Sharma", email: "aarav@vaidyaq.com", role: "Support Agent", assignedClients: ["demo-hosp"], username: "aarav", password: "123", permissions: ["view_crm", "resolve_tickets"] },
      { id: "emp-2", name: "Priya Nair", email: "priya@vaidyaq.com", role: "Billing Manager", assignedClients: ["demo-hosp"], username: "priya", password: "123", permissions: ["view_crm", "manage_finance"] }
    ];
  });

  // Support Tickets Workspace
  const [supportTickets, setSupportTickets] = useState(() => {
    const saved = localStorage.getItem('qn_support_tickets');
    return saved ? JSON.parse(saved) : [
      { id: "tick-1", clientId: "demo-hosp", clientName: "City Central Metro Hospital", title: "Gemini SOP generation slow responses", description: "SOP generation takes longer than 15s to draft. Please verify API rate limits.", priority: "Medium", status: "Open", assignedOperator: "Aarav Sharma", createdAt: "2026-06-11 09:12", sequenceCode: "TS-1002" },
      { id: "tick-2", clientId: "demo-hosp", clientName: "City Central Metro Hospital", title: "Indian GST billing checkout failed", description: "Attempted to pay using simulation button but page returned an empty alert box.", priority: "High", status: "Open", assignedOperator: "Aarav Sharma", createdAt: "2026-06-12 11:30", sequenceCode: "TS-1003" }
    ];
  });

  // Simulated Email Notification Archive
  const [emailLogs, setEmailLogs] = useState(() => {
    const saved = localStorage.getItem('qn_email_logs');
    return saved ? JSON.parse(saved) : [
      { id: "mail-1", recipient: "quality.head@hospital.org", subject: "Welcome to VaidyaQ - 7-Day Free Trial", body: "Hello Dr. Sarah Paul, thank you for signing up to VaidyaQ. Your 7-day trial is now active.", sentAt: "2026-06-09 10:15", category: "Signup" }
    ];
  });

  // Simulated Payment Transactions Registry
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('qn_transactions');
    return saved ? JSON.parse(saved) : [
      { id: "trans-1", clientId: "demo-hosp", hospitalName: "City Central Metro Hospital", amount: 129999, gst: 23399.82, date: "2026-05-15", status: "Successful", billingCycle: "H1 2026" },
      { id: "trans-2", clientId: "demo-hosp", hospitalName: "City Central Metro Hospital", amount: 55999, gst: 10079.82, date: "2026-06-01", status: "Successful", billingCycle: "H1 2026" }
    ];
  });

  // Vendor Admin Co-pilot API key
  const [vendorGeminiKey, setVendorGeminiKey] = useState(() => {
    return localStorage.getItem('qn_vendor_gemini_key') || '';
  });

  const [documents, setDocuments] = useState(() => {
    return loadNamespacedState('qn_documents', defaultDocuments);
  });

  const [audits, setAudits] = useState(() => {
    return loadNamespacedState('qn_audits', defaultAudits);
  });

  const [capaItems, setCapaItems] = useState(() => {
    return loadNamespacedState('qn_capas', defaultCapas);
  });

  const [incidents, setIncidents] = useState(() => {
    return loadNamespacedState('qn_incidents', defaultIncidents);
  });

  const [licenses, setLicenses] = useState(() => {
    return loadNamespacedState('qn_licenses', defaultLicenses);
  });

  const [tasks, setTasks] = useState(() => {
    return loadNamespacedState('qn_tasks', defaultTasks);
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    return loadNamespacedState('qn_audit_logs', defaultAuditLogs);
  });

  const [qualityIndicators, setQualityIndicators] = useState(() => {
    return loadNamespacedState('qn_quality_indicators', defaultQualityIndicators);
  });

  const [complianceFeed, setComplianceFeed] = useState(() => {
    return loadNamespacedState('qn_compliance_feed', defaultComplianceFeed);
  });
  
  const [feedNotifications, setFeedNotifications] = useState(() => {
    return loadNamespacedState('qn_feed_notifications', [
      { id: "notif-1", title: "ABDM Update", message: "New ABDM v3.0 guidelines released. Check the News Feed.", type: "warning", read: false }
    ]);
  });

  // Sync states with local storage (namespaced if user is logged in)
  useEffect(() => {
    localStorage.setItem('qn_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('qn_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_hospital_mode`, hospitalMode);
    }
  }, [hospitalMode, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_hospital_name`, hospitalName);
    }
  }, [hospitalName, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_hospital_beds`, hospitalBeds);
    }
  }, [hospitalBeds, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_hospital_tier`, hospitalTier);
    }
  }, [hospitalTier, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_active_depts`, JSON.stringify(activeDepts));
    }
  }, [activeDepts, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_onboarding_steps`, JSON.stringify(onboardingSteps));
    }
  }, [onboardingSteps, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_standards`, JSON.stringify(standards));
    }
  }, [standards, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_documents`, JSON.stringify(documents));
    }
  }, [documents, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_audits`, JSON.stringify(audits));
    }
  }, [audits, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_capas`, JSON.stringify(capaItems));
    }
  }, [capaItems, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_incidents`, JSON.stringify(incidents));
    }
  }, [incidents, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_licenses`, JSON.stringify(licenses));
      
      // Auto check and send warning emails for expiring/expired licenses
      if (licenses && licenses.length > 0) {
        licenses.forEach(lic => {
          if (!lic.expiryDate) return;
          const exp = new Date(lic.expiryDate);
          if (isNaN(exp.getTime())) return;
          
          const today = new Date();
          exp.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          const diffTime = exp - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          const activeEmail = currentUser.parentEmail || currentUser.email;
          const emailSentKey = `${activeEmail}_email_sent_${lic.id}_${lic.expiryDate}`;
          const alreadySent = localStorage.getItem(emailSentKey);
          
          if (!alreadySent) {
            const ownerEmail = activeEmail;
            if (diffDays <= 0) {
              sendSimulatedEmail(
                ownerEmail,
                `URGENT ALERT: Statutory License Expired - ${lic.name}`,
                `Hello, the statutory certificate "${lic.name}" issued by "${lic.authority}" expired on ${lic.expiryDate}. Please renew immediately to prevent clinical restrictions or legal penalties.`,
                "Statutory Alert"
              );
              localStorage.setItem(emailSentKey, "true");
            } else if (diffDays <= 20) {
              sendSimulatedEmail(
                ownerEmail,
                `WARNING: Statutory License Expiring Soon - ${lic.name}`,
                `Hello, the statutory certificate "${lic.name}" is expiring in ${diffDays} days (Expiry: ${lic.expiryDate}). Please initiate renewal proceedings and upload the new certificate.`,
                "Statutory Alert"
              );
              localStorage.setItem(emailSentKey, "true");
            }
          }
        });
      }
    }
  }, [licenses, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_tasks`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_audit_logs`, JSON.stringify(auditLogs));
    }
  }, [auditLogs, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_quality_indicators`, JSON.stringify(qualityIndicators));
    }
  }, [qualityIndicators, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_is_subscribed`, JSON.stringify(isSubscribed));
    }
  }, [isSubscribed, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_trial_start_date`, trialStartDate);
    }
  }, [trialStartDate, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_gemini_api_key`, geminiApiKey);
    }
  }, [geminiApiKey, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_hospital_logo`, hospitalLogo);
    }
  }, [hospitalLogo, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_team_members`, JSON.stringify(teamMembers));
    }
  }, [teamMembers, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_compliance_feed`, JSON.stringify(complianceFeed));
    }
  }, [complianceFeed, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser.parentEmail || currentUser.email}_qn_feed_notifications`, JSON.stringify(feedNotifications));
    }
  }, [feedNotifications, currentUser]);

  useEffect(() => {
    localStorage.setItem('qn_clients_list', JSON.stringify(clientsList));
  }, [clientsList]);

  useEffect(() => {
    localStorage.setItem('qn_vendor_credentials', JSON.stringify(vendorAdminCredentials));
  }, [vendorAdminCredentials]);

  useEffect(() => {
    localStorage.setItem('qn_vendor_employees', JSON.stringify(vendorEmployees));
  }, [vendorEmployees]);

  useEffect(() => {
    localStorage.setItem('qn_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('qn_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('qn_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('qn_vendor_gemini_key', vendorGeminiKey);
  }, [vendorGeminiKey]);

  // Initialize default global sub-users if not exists
  useEffect(() => {
    const saved = localStorage.getItem('qn_global_sub_users');
    if (!saved) {
      const defaultSubUsers = [
        {
          email: "sarah@demo.com",
          name: "Dr. Sarah Paul",
          role: "Quality Head",
          department: "Quality Control",
          password: "demo123",
          parentEmail: "demo@vaidyaq.com"
        },
        {
          email: "sen@demo.com",
          name: "Dr. Sen",
          role: "Department Head",
          department: "Pharmacy",
          password: "demo123",
          parentEmail: "demo@vaidyaq.com"
        },
        {
          email: "gracy@demo.com",
          name: "Sister Gracy",
          role: "Staff",
          department: "ICU",
          password: "demo123",
          parentEmail: "demo@vaidyaq.com"
        }
      ];
      localStorage.setItem('qn_global_sub_users', JSON.stringify(defaultSubUsers));
    }
  }, []);

  // Reload namespaced states when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      
      const getSaved = (key, defaultVal) => {
        const saved = localStorage.getItem(prefix + key);
        if (saved) {
          try { return JSON.parse(saved); } catch(e) { return saved; }
        }
        // Fallbacks
        const isDemo = activeEmail === 'demo@vaidyaq.com' || activeEmail === 'quality.head@hospital.org';
        if (isDemo) {
          const globalSaved = localStorage.getItem(key);
          if (globalSaved) {
            try { return JSON.parse(globalSaved); } catch(e) {}
          }
          return defaultVal;
        }
        if (key === 'qn_standards') {
          return defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" }));
        }
        if (key === 'qn_licenses') {
          return defaultLicenses.map(l => ({ ...l, status: 'Active' }));
        }
        return Array.isArray(defaultVal) ? [] : typeof defaultVal === 'object' ? {} : defaultVal;
      };

      setHospitalMode(getSaved('qn_hospital_mode', 'active'));
      setHospitalName(getSaved('qn_hospital_name', 'City Central Metro Hospital'));
      setHospitalBeds(String(getSaved('qn_hospital_beds', '120')));
      setHospitalTier(getSaved('qn_hospital_tier', 'Full Accreditation'));
      setActiveDepts(getSaved('qn_active_depts', ['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing']));
      setOnboardingSteps(getSaved('qn_onboarding_steps', { identity: false, departments: false, importTemplates: false, firstSop: false }));
      setStandards(getSaved('qn_standards', defaultStandards));
      setIsSubscribed(getSaved('qn_is_subscribed', false));
      setTrialStartDate(getSaved('qn_trial_start_date', new Date().toISOString()));
      setGeminiApiKey(getSaved('qn_gemini_api_key', ''));
      setHospitalLogo(getSaved('qn_hospital_logo', '🛡️'));
      setTeamMembers(getSaved('qn_team_members', [
        { email: "quality.head@hospital.org", name: "Dr. Sarah Paul", role: "Quality Head", department: "Quality Control" },
        { email: "super@vaidyaq.com", name: "Col. Roy", role: "Super Admin", department: "Board" },
        { email: "pharmacy@hospital.org", name: "Dr. Sen", role: "Department Head", department: "Pharmacy" }
      ]));
      setDocuments(getSaved('qn_documents', defaultDocuments));
      setAudits(getSaved('qn_audits', defaultAudits));
      setCapaItems(getSaved('qn_capas', defaultCapas));
      setIncidents(getSaved('qn_incidents', defaultIncidents));
      setLicenses(getSaved('qn_licenses', defaultLicenses));
      setTasks(getSaved('qn_tasks', defaultTasks));
      setAuditLogs(getSaved('qn_audit_logs', defaultAuditLogs));
      setQualityIndicators(getSaved('qn_quality_indicators', defaultQualityIndicators));
      setComplianceFeed(getSaved('qn_compliance_feed', defaultComplianceFeed));
      setFeedNotifications(getSaved('qn_feed_notifications', [
        { id: "notif-1", title: "ABDM Update", message: "New ABDM v3.0 guidelines released. Check the News Feed.", type: "warning", read: false }
      ]));
    }
  }, [currentUser]);

  // Log Security Activity helper
  const logActivity = (action) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser.email,
      role: currentUser.role,
      action,
      ipAddress: "192.168.1.108"
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Switch Hospital State Mode ('new' vs 'active')
  const switchHospitalMode = (mode) => {
    setHospitalMode(mode);
    if (mode === 'new') {
      // Set to blank state
      setStandards(defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" })));
      setDocuments([]);
      setAudits([]);
      setCapaItems([]);
      setIncidents([]);
      setTasks([]);
      setLicenses(defaultLicenses.map(l => ({ ...l, status: 'Active' }))); // active but unmapped
      setHospitalName('My New Hospital');
      setHospitalBeds('50');
      setHospitalTier('Entry Level');
      setActiveDepts(['Pharmacy', 'Emergency', 'Housekeeping / Facilities']);
      setOnboardingSteps({ identity: false, departments: false, importTemplates: false, firstSop: false });
      logActivity("Reset database to New Hospital Onboarding Mode (Empty state)");
    } else {
      // Restore preloaded demo databases
      setStandards(defaultStandards);
      setDocuments(defaultDocuments);
      setAudits(defaultAudits);
      setCapaItems(defaultCapas);
      setIncidents(defaultIncidents);
      setLicenses(defaultLicenses);
      setTasks(defaultTasks);
      setHospitalName('City Central Metro Hospital');
      setHospitalBeds('120');
      setHospitalTier('Full Accreditation');
      setActiveDepts(['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing']);
      setOnboardingSteps({ identity: true, departments: true, importTemplates: true, firstSop: true });
      logActivity("Loaded Active Demo Hospital database (Preloaded state)");
    }
  };

  // SignUp a new Client
  // Helper to send transactional emails and save copy to office folder
  const sendSimulatedEmail = (recipient, subject, body, category) => {
    const newMail = {
      id: `mail-${Date.now()}`,
      recipient,
      subject,
      body,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      category
    };
    setEmailLogs(prev => [newMail, ...prev]);
    logActivity(`Simulated email sent to ${recipient}: ${subject}`);
  };

  // Support ticket filing desk
  const addSupportTicket = (title, description, priority, category) => {
    const ticketId = `tick-${Date.now()}`;
    const seqNum = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
    const assignedOperator = priority === 'High' ? "Aarav Sharma" : "Priya Nair";

    const newTicket = {
      id: ticketId,
      clientId: hospitalName,
      clientName: hospitalName,
      title,
      description,
      priority,
      category,
      status: "Open",
      assignedOperator,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sequenceCode: seqNum
    };
    
    setSupportTickets(prev => [newTicket, ...prev]);
    logActivity(`Support ticket logged: ${seqNum} - ${title}`);

    // Notify client
    sendSimulatedEmail(
      currentUser.email,
      `VaidyaQ Support Ticket Filed - ${seqNum}`,
      `Hello, we have received your troubleshooting request ${seqNum} regarding "${title}". Support engineer ${assignedOperator} has been assigned.`,
      "Ticket"
    );

    // Copy to internal office folder
    sendSimulatedEmail(
      "support-desk@vaidyaq.com",
      `[OFFICE COPY] Ticket Filed - ${seqNum} - ${hospitalName}`,
      `Client ${hospitalName} filed ticket ${seqNum}. Category: ${category}. Description: ${description}`,
      "Ticket"
    );
  };

  // Log client file download security check
  const logSimulatedDownload = (docName) => {
    logActivity(`Downloaded clinical audit document: ${docName}`);
    sendSimulatedEmail(
      currentUser.email,
      `Security Alert: Vault Document Downloaded`,
      `User ${currentUser.name} (${currentUser.role}) has downloaded the document "${docName}" from the secure compliance folder.`,
      "Download"
    );
  };

  const saveVendorGeminiKey = (key) => {
    setVendorGeminiKey(key);
    logActivity("Configured custom Vendor Co-pilot Gemini API Token.");
  };

  // SignUp a new Client
  const signUpClient = (email, password, hospitalNameInput, bedsInput) => {
    const newHospitalId = `hosp-${Date.now()}`;
    const signup = new Date().toISOString();
    const expiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();
    
    const newClient = {
      hospitalId: newHospitalId,
      hospitalName: hospitalNameInput,
      email: email,
      beds: Number(bedsInput),
      trialStartDate: signup,
      signupDate: signup,
      planExpiryDate: expiry,
      isSubscribed: false,
      status: "Active Trial",
      address: "Enter address...",
      regId: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      govId: "PENDING_INPUT",
      govIdType: "GSTIN",
      govIdStatus: "Pending",
      storageUsed: 1048576,
      bounced: false,
      password: password,
      firstLoginDate: signup // Signup automatically logs them in!
    };

    setClientsList(prev => [newClient, ...prev]);

    // Set as active client context settings
    setHospitalName(hospitalNameInput);
    setHospitalBeds(String(bedsInput));
    setTrialStartDate(signup);
    setIsSubscribed(false);
    setHospitalLogo('🛡️');
    setHospitalTier(Number(bedsInput) <= 20 ? 'Tier A: Clinics' : Number(bedsInput) <= 150 ? 'Tier B: Secondary Care' : 'Tier C: Tertiary Chains');
    
    // Set first team member as Super Admin
    const superAdminUser = { email: email, name: "Hospital Director", role: "Super Admin", department: "Board" };
    setTeamMembers([superAdminUser]);
    setCurrentUser(superAdminUser);

    // Reset namespaced states to empty for a clean slate
    setStandards(defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" })));
    setDocuments([]);
    setAudits([]);
    setCapaItems([]);
    setIncidents([]);
    setTasks([]);
    setHospitalMode('new'); // start in onboarding wizard
    
    setCurrentRoute('/app/dashboard');
    logActivity(`Signed up new client hospital: ${hospitalNameInput} (Beds: ${bedsInput}) with first user as Super Admin.`);

    // Send Welcome Email
    sendSimulatedEmail(
      email,
      "Welcome to VaidyaQ - 7-Day Free Trial",
      `Hello! Thank you for registering ${hospitalNameInput} with VaidyaQ. Your 7-day trial period is now active. Log in at any time to complete your digital accreditation onboarding.`,
      "Signup"
    );
  };

  // Purchase/Renew subscription (cycle can be 'quarterly' or 'annually')
  const purchaseSubscription = (cycle = 'annually') => {
    setIsSubscribed(true);
    setForcePaymentScreen(false);
    
    const beds = Number(hospitalBeds);
    const baseFee = beds <= 20 ? 55999 : beds <= 150 ? 129999 : 249999;
    
    // Quarterly is 30% of annual price
    const priceAmount = cycle === 'quarterly' ? Math.round(baseFee * 0.3) : baseFee;
    const gstVal = Math.round(priceAmount * 0.18);
    const totalAmount = priceAmount + gstVal;
    
    const termDays = cycle === 'quarterly' ? 90 : 365;
    const newExpiry = new Date(Date.now() + termDays * 24 * 60 * 60 * 1000).toISOString();
    
    const newTrans = {
      id: `trans-${Date.now()}`,
      clientId: currentUser.email,
      hospitalName: hospitalName,
      amount: priceAmount,
      gst: gstVal,
      date: new Date().toISOString().slice(0, 10),
      status: "Successful",
      billingCycle: cycle === 'quarterly' ? "Quarterly Plan" : "Annual Plan"
    };
    setTransactions(prev => [newTrans, ...prev]);

    setClientsList(prev => prev.map(c => {
      if (c.email === currentUser.email) {
        return { 
          ...c, 
          isSubscribed: true, 
          status: "Paid", 
          planExpiryDate: newExpiry,
          billingCycle: cycle === 'quarterly' ? "Quarterly" : "Annual"
        };
      }
      return c;
    }));

    // Save active state to context
    setIsSubscribed(true);
    setTrialStartDate(null); // Clear trial start to denote active paid subscription

    logActivity(`Subscription payment of ₹${priceAmount.toLocaleString()} processed successfully for ${cycle} cycle.`);

    // Send payment confirmation email
    sendSimulatedEmail(
      currentUser.email,
      "VaidyaQ Subscription Active - Payment Received",
      `Hello, we have successfully received your payment of ₹${priceAmount.toLocaleString()} + ₹${gstVal.toLocaleString()} GST (Total: ₹${totalAmount.toLocaleString()}). Your ${cycle} subscription is active until ${new Date(newExpiry).toLocaleDateString('en-IN')}.`,
      "Payment"
    );
  };

  const updateHospitalProfile = (logo, name, beds, address, regId) => {
    setHospitalLogo(logo);
    setHospitalName(name);
    setHospitalBeds(String(beds));
    setClientsList(prev => prev.map(c => {
      if (c.hospitalName === hospitalName || c.email === currentUser.email) {
        return { ...c, hospitalName: name, beds: Number(beds), address, regId };
      }
      return c;
    }));
    logActivity("Updated hospital profile details.");
  };

  const saveGeminiKey = (key) => {
    setGeminiApiKey(key);
    logActivity("Configured custom Gemini AI API Token.");
  };

  const inviteTeamMember = (email, name, role, department, password = "password123") => {
    const newMember = { email, name, role, department, password };
    setTeamMembers(prev => [...prev, newMember]);
    
    // Save to global sub-users registry
    const globalSubUsers = JSON.parse(localStorage.getItem('qn_global_sub_users') || '[]');
    // Filter out duplicates
    const filtered = globalSubUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    const subUserObj = {
      email,
      name,
      role,
      department,
      password,
      parentEmail: currentUser.parentEmail || currentUser.email
    };
    localStorage.setItem('qn_global_sub_users', JSON.stringify([...filtered, subUserObj]));
    
    logActivity(`Invited team member: ${name} (${role}) to ${department}`);
  };

  const changeUserPassword = (oldPassword, newPassword) => {
    if (!currentUser) return { success: false, message: "No active session." };

    // 1. Owner change
    if (currentUser.role === 'Super Admin' && !currentUser.parentEmail) {
      setClientsList(prev => prev.map(c => {
        if (c.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...c, password: newPassword };
        }
        return c;
      }));
      logActivity("Updated owner password.");
      return { success: true };
    }

    // 2. Sub-user change
    const globalSubUsers = JSON.parse(localStorage.getItem('qn_global_sub_users') || '[]');
    const userIndex = globalSubUsers.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (userIndex !== -1) {
      if (globalSubUsers[userIndex].password !== oldPassword) {
        return { success: false, message: "Incorrect current password." };
      }
      globalSubUsers[userIndex].password = newPassword;
      localStorage.setItem('qn_global_sub_users', JSON.stringify(globalSubUsers));
      logActivity(`Updated sub-user password for ${currentUser.name}`);
      return { success: true };
    }

    return { success: false, message: "User not found in registry." };
  };

  const changeUserProfile = (name) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name };
    setCurrentUser(updatedUser);
    localStorage.setItem('qn_user', JSON.stringify(updatedUser));
    
    // Update local state list
    setTeamMembers(prev => prev.map(m => m.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...m, name } : m));
    
    if (currentUser.parentEmail) {
      const globalSubUsers = JSON.parse(localStorage.getItem('qn_global_sub_users') || '[]');
      const updatedList = globalSubUsers.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, name } : u);
      localStorage.setItem('qn_global_sub_users', JSON.stringify(updatedList));
    }
    logActivity(`Updated profile name to ${name}`);
  };

  const addHospitalTask = (taskObj) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskObj.title,
      assignedTo: taskObj.assignedTo,
      assignedToEmail: taskObj.assignedToEmail || '',
      department: taskObj.department || 'Quality Control',
      dueDate: taskObj.dueDate,
      priority: taskObj.priority || 'Medium',
      mappedStandard: taskObj.mappedStandard || '',
      status: 'Pending'
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity(`Assigned task: "${taskObj.title}" to ${taskObj.assignedTo}`);
    return newTask.id;
  };

  const updateHospitalTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logActivity(`Updated task "${t.title}" status to ${status}`);
        return { ...t, status };
      }
      return t;
    }));
  };

  const deleteHospitalTask = (taskId) => {
    setTasks(prev => {
      const taskObj = prev.find(t => t.id === taskId);
      if (taskObj) {
        logActivity(`Deleted task: "${taskObj.title}"`);
      }
      return prev.filter(t => t.id !== taskId);
    });
  };

  const checkForComplianceUpdates = () => {
    logActivity("Checking Google News for live compliance updates...");
    
    const query = encodeURIComponent("NABH compliance hospital India OR ABDM healthcare India");
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          const fetchedFeed = data.items.slice(0, 5).map((item, idx) => ({
            id: `feed-live-${idx}-${Date.now()}`,
            date: item.pubDate ? item.pubDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
            title: item.title,
            category: "Google Live News",
            content: item.description || item.content || "Click source link to view full article.",
            source: item.author || "Google News",
            link: item.link,
            isNew: true
          }));

          setComplianceFeed(fetchedFeed);
          
          // Add a notification about new updates
          const newNotif = {
            id: `notif-live-${Date.now()}`,
            title: "Live Compliance Updates Scan Completed",
            message: `Fetched ${fetchedFeed.length} live articles from Google News.`,
            type: "success",
            read: false
          };
          setFeedNotifications(prev => [newNotif, ...prev]);
          logActivity(`Successfully scraped ${fetchedFeed.length} live compliance articles from Google News RSS.`);
        } else {
          throw new Error("Invalid RSS response.");
        }
      })
      .catch(err => {
        console.error("Failed to fetch live updates, falling back to offline templates:", err);
        // Fallback to mock update if offline or API limit exceeded
        const newUpdate = {
          id: `feed-offline-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          title: "Ministry of Health mandates digital consent records via ABHA ID",
          category: "Statutory Law",
          content: "All clinical admissions from 01-Jul-2026 must support digital consent sign-offs using patient ABHA OTP verification under the ABDM program.",
          source: "Ministry of Health & Family Welfare",
          isNew: true
        };
        setComplianceFeed(prev => [newUpdate, ...prev]);
        setFeedNotifications(prev => [
          { id: `notif-offline-${Date.now()}`, title: "New Policy Mandate", message: "Ministry of Health digital consent guidelines released.", type: "danger", read: false },
          ...prev
        ]);
        
        setStandards(prev => prev.map(s => {
          if (s.id === "AAC.2.b") {
            return {
              ...s,
              description: "Admissions and digital consents are logged via patient ABHA credentials in compliance with ABDM guidelines.",
              evidenceRequired: "ABHA Consent Log Sheets, Admission SOP"
            };
          }
          return s;
        }));

        logActivity("Fetched default regulatory update templates (Google scan fallback).");
      });
  };

  const setClientStatusOverride = (hospId, statusValue) => {
    setClientsList(prev => prev.map(c => {
      if (c.hospitalId === hospId) {
        if (c.hospitalName === hospitalName) {
          if (statusValue === 'Paid') {
            setIsSubscribed(true);
          } else if (statusValue === 'Expired') {
            setIsSubscribed(false);
            setTrialStartDate(new Date(Date.now() - 8*24*60*60*1000).toISOString());
          } else if (statusValue === 'Restricted') {
            setIsSubscribed(false);
            setTrialStartDate(new Date(Date.now() - 8*24*60*60*1000).toISOString());
          } else if (statusValue === 'Active Trial') {
            setIsSubscribed(false);
            setTrialStartDate(new Date().toISOString());
          }
        }
        return { ...c, status: statusValue, isSubscribed: statusValue === 'Paid' };
      }
      return c;
    }));
    logActivity(`Vendor Admin override client ${hospId} status to: ${statusValue}`);
  };


  // Import official NABH 6th edition templates with simulated score bump
  const importNABHTemplates = () => {
    const templateContents = {
      "doc-1": `STANDARD OPERATING PROCEDURE: OUT-PATIENT REGISTRATION & BILLING POLICY
======================================================================
MAPPED STANDARD: AAC.1.a (NABH 6th Edition)
OWNER: OPD & Billing Departments

1. PURPOSE & OBJECTIVE:
To establish a standardized, transparent, and patient-friendly registration process for out-patients at our hospital, ensuring accurate record keeping.

2. OPERATIONAL PROTOCOL:
A. OPD Reception: Capture demographic details including Name, Age, Gender, Contact, and Government ID (Aadhaar or ABHA Card).
B. HIMS Entry: Create a Unique Hospital Identification Number (UHID) for new admissions.
C. Billing: Process consulting fees and issue consultation tokens.
D. Waiting Time: Target queue duration must remain under 15 minutes.

3. QUALITY METRICS:
- Audits: Monthly register logs checked by the Administration team.
- Compliance Target: 98% UHID verification rate.`,

      "doc-2": `STANDARD OPERATING PROCEDURE: ADMISSION & EMERGENCY TRIAGE SOP
==================================================================
MAPPED STANDARDS: AAC.2.b, COP.2.b (NABH 6th Edition)
OWNER: Emergency Medicine & Triage Desk

1. PURPOSE & OBJECTIVE:
To define standard clinical criteria for admitting patients through the Emergency Department, prioritizing cases based on clinical severity.

2. TRIAGE CLASSIFICATION:
A. RED (Critical): Life-threatening emergencies. Immediate attention. Zero wait time.
B. YELLOW (Urgent): Stable but severe conditions. Consultation within 15 minutes.
C. GREEN (Non-Urgent): Minor injuries or illnesses. Wait time up to 60 minutes.

3. ADMISSION PROCESS:
- Patient clinical assessment performed by the duty doctor.
- Secure bed allocation in appropriate wards (ICU, OT, General Ward).
- Shift summary documentation completed by nursing staff at handover.`,

      "doc-3": `OFFICIAL DRUG MANUAL: HOSPITAL MEDICATION FORMULARY GUIDEBOOK
=================================================================
MAPPED STANDARD: MOM.1.a (NABH 6th Edition)
OWNER: Pharmacy Committee

1. PURPOSE & OBJECTIVE:
To compile and maintain an officially approved list of therapeutic medicines permitted for prescription and dispensing inside our hospital facility.

2. FORMULARY MANAGEMENT:
A. Approval: Only drugs reviewed and approved by the Pharmacy & Therapeutics Committee (PTC) are kept in stock.
B. Substitutions: Generic equivalents must conform to National Formulary of India (NFI) specifications.
C. Updates: The formulary list is updated bi-annually.

3. STORAGE REGULATIONS:
- Cold chain maintenance (2-8°C) for vaccines and insulin.
- Weekly temperature audit checks logged on digital cards.`,

      "doc-4": `STANDARD OPERATING PROCEDURE: HIGH-ALERT MEDICATION SAFETY
=================================================================
MAPPED STANDARD: MOM.2.c (NABH 6th Edition)
OWNER: Pharmacy & Nursing Services

1. PURPOSE & OBJECTIVE:
To establish safety protocols for storing, handling, prescribing, and administering High-Alert Medications (HAM) to prevent catastrophic medication errors.

2. HANDLING CONTROLS:
A. Storage: Keep all high-alert medications in designated LOCKED cupboards with warning badges.
B. Double-Signature Check: Two qualified nurses must independently verify the dosage, patient name, and expiry date prior to administration.
C. Dilution: Follow standard dilution tables posted on clinical charts.

3. AUDITS & INCIDENTS:
- Weekly inspections of HAM storage cupboards.
- Zero-tolerance policy for undocumented drug handovers.`,

      "doc-5": `EMERGENCY PROTOCOL: FIRE SAFETY & EVACUATION DRILL PROTOCOL
===============================================================
MAPPED STANDARD: FMS.1.d (NABH 6th Edition)
OWNER: Security & Facilities Desk

1. PURPOSE & OBJECTIVE:
To establish fire prevention guidelines, response steps, and evacuation procedures to ensure safety during a fire emergency.

2. EMERGENCY ACTIONS (R.A.C.E.):
A. Rescue: Remove individuals from the immediate danger area.
B. Alarm: Sound the fire alarm and dial extension 555.
C. Confine: Close fire doors and windows to contain smoke and heat.
D. Extinguish: Use fire extinguishers following the P.A.S.S. technique.

3. DRILLS & AUDITS:
- Mock fire drills must be conducted twice a year.
- Training records for all shifts must be digitally stored and reviewed.`,

      "doc-6": `STANDARD OPERATING PROCEDURE: BIOMEDICAL WASTE DISPOSAL
===============================================================
MAPPED STANDARD: FMS.2.a (NABH 6th Edition)
OWNER: Housekeeping & Facility Services

1. PURPOSE & OBJECTIVE:
To ensure safe handling, segregation, storage, transport, and disposal of biomedical waste in accordance with State Pollution Control Board guidelines.

2. SEGREGATION COLOR SCHEME:
A. RED Bag: Recyclable contaminated plastic waste (syringes without needles, IV bottles).
B. YELLOW Bag: Highly infectious waste (dressings, anatomy waste, chemical liquid waste).
C. BLUE Cardboard Box: Glassware (vials, ampoules).
D. White Translucent Container: Sharps and metal wastes (needles, blades).

3. SAFETY REGULATIONS:
- Staff must wear heavy-duty gloves, boots, and masks during waste handling.
- Daily logs in Waste disposal register.`,

      "doc-7": `STANDARD OPERATING PROCEDURE: EXPIRED DRUG DISPOSAL
===============================================================
MAPPED STANDARD: MOM.3.a (NABH 6th Edition)
OWNER: Pharmacy Department

1. PURPOSE & OBJECTIVE:
To outline clear guidelines for identifying, segregating, locking, and safely disposing of expired medications in the pharmacy.

2. DISPOSAL GUIDELINES:
A. Expiry Checks: Duty pharmacist must audit shelf expiries on the 1st of every month.
B. Segregation: Remove expired medications immediately and place them in the RED locked bin labelled: "EXPIRED MEDICATION - DO NOT USE".
C. Verification: Disposals require dual signatures (Pharmacist + Quality Head) before destruction.

3. LOGGING:
- Maintain historical disposal records for a minimum of 3 years.`
    };

    setDocuments(defaultDocuments.map(doc => ({
      ...doc,
      title: `${doc.title} (Template)`,
      status: 'Pending Review',
      author: 'Official NABH Committee',
      approvedBy: 'Pending review sign-off',
      content: templateContents[doc.id] || `NABH 6th Edition template for ${doc.title}. Customization required.`
    })));

    // Bump scores of standards to partially met since templates are loaded but not authenticated
    setStandards(prev => prev.map(s => {
      const hasDoc = defaultDocuments.some(d => d.mappedStandards.includes(s.id));
      if (hasDoc) {
        return { ...s, score: 5, status: "Partially Met" };
      }
      return s;
    }));
    setOnboardingSteps(prev => ({ ...prev, importTemplates: true }));
    logActivity("Imported official NABH 6th Edition Templates & Policies");
  };

  // Compliance Knowledge Base rules for standard verification
  const complianceKnowledgeBase = {
    "AAC.1.a": {
      name: "OPD Registration Process",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["registration", "opd", "out-patient"],
      partialKeywords: ["queue", "demographics", "checklist", "patient", "policy"],
      gaps: {
        format: "OPD Registration standard requires a formal PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing registration flow descriptions or OPD policy outline.",
        partial: "Lacks OPD audit check frequency schedules or queuing protocol details."
      }
    },
    "AAC.2.b": {
      name: "Admission Criteria & Protocols",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["admission", "criteria", "clinical criteria"],
      partialKeywords: ["protocol", "inpatient", "triage", "consent"],
      gaps: {
        format: "Admission Protocols standard requires a formal PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing clinical admission threshold criteria or inpatient classification rules.",
        partial: "Lacks referral transfer guidelines or emergency admission override protocols."
      }
    },
    "AAC.3.a": {
      name: "Discharge & Referral Summary",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["discharge", "referral", "summary"],
      partialKeywords: ["sop", "follow-up", "medication instructions", "dossier"],
      gaps: {
        format: "Discharge & Referral standard requires a formal PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing structured discharge summary template or standard referral forms.",
        partial: "Lacks emergency contact detail guidelines or discharge medication advice sections."
      }
    },
    "COP.1.a": {
      name: "General Care Guidelines",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["care manual", "general care", "patient care"],
      partialKeywords: ["nursing", "standard of care", "vitals", "guidelines"],
      gaps: {
        format: "General Patient Care standard requires a PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing overall clinical patient care manual or standard nursing protocols.",
        partial: "Lacks frequency definitions for vital signs monitoring or daily nursing sheets."
      }
    },
    "COP.2.b": {
      name: "Emergency Care Protocols",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["cpr", "triage", "emergency"],
      partialKeywords: ["cardiac arrest", "resuscitation", "trauma", "crash cart"],
      gaps: {
        format: "Emergency Care standard requires a PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing standard CPR/resuscitation algorithms or emergency triage codes.",
        partial: "Lacks crash cart inventory checks or trauma activation protocol documentation."
      }
    },
    "COP.5.c": {
      name: "ICU Management & Admission",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["icu", "critical care", "admission criteria"],
      partialKeywords: ["discharge criteria", "intensive care", "ventilator", "nurse ratio"],
      gaps: {
        format: "ICU Management standard requires a PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing ICU admission/discharge score thresholds or critical care protocols.",
        partial: "Lacks ICU safety guidelines or ventilator-associated pneumonia (VAP) prevention SOPs."
      }
    },
    "MOM.1.a": {
      name: "Medication Formulary",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["formulary", "medication list", "drugs"],
      partialKeywords: ["essential medicines", "dosage", "generic name", "substitution"],
      gaps: {
        format: "Medication Formulary standard requires a PDF or Word Document (.pdf, .docx).",
        mandatory: "Missing the official approved hospital formulary drug list.",
        partial: "Lacks automatic generic substitution rules or look-alike medication flags."
      }
    },
    "MOM.2.c": {
      name: "High-Alert Medication Safety",
      formats: [".xlsx", ".pdf"],
      mandatoryKeywords: ["high-alert", "lasa", "double-check"],
      partialKeywords: ["narcotic", "audit log", "storage", "locked", "concentrated"],
      gaps: {
        format: "High-Alert Medications standard requires a spreadsheet audit log or PDF (.xlsx, .pdf).",
        mandatory: "Missing high-alert drug lists (LASA medications) and double-verification audit protocols.",
        partial: "Lacks lockbox audit signatures or temperature storage registers for high-alert drugs."
      }
    },
    "MOM.3.a": {
      name: "Medication Expiry Auditing",
      formats: [".xlsx", ".pdf", ".docx"],
      mandatoryKeywords: ["expiry", "expired drugs", "disposal"],
      partialKeywords: ["segregation", "register", "waste", "write-off"],
      gaps: {
        format: "Medication Expiry Auditing requires a Spreadsheet register or PDF/DOCX policy (.xlsx, .pdf, .docx).",
        mandatory: "Missing drug expiry inspection schedule or expired drug disposal procedures.",
        partial: "Lacks chemical waste disposal registration details or pharmacy segregation records."
      }
    },
    "FMS.1.d": {
      name: "Emergency & Fire Preparedness",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["fire drill", "evacuation", "attendance"],
      partialKeywords: ["extinguisher", "smoke", "alarm", "mock drill"],
      gaps: {
        format: "Fire Safety standard requires a PDF or Word Document drill record (.pdf, .docx).",
        mandatory: "Missing fire mock drill report or evacuation exercise certificates.",
        partial: "Lacks staff attendance logs representing housekeeping safety drills."
      }
    },
    "FMS.2.a": {
      name: "Hazardous Materials Control",
      formats: [".xlsx", ".pdf", ".docx"],
      mandatoryKeywords: ["hazmat", "hazardous", "waste log"],
      partialKeywords: ["segregation", "pollution", "biomedical waste", "spill kit"],
      gaps: {
        format: "Hazardous Materials standard requires an audit log sheet or PDF (.xlsx, .pdf, .docx).",
        mandatory: "Missing biomedical waste category log sheets or hazardous spill control manuals.",
        partial: "Lacks the State Pollution Board authorized signature seal or manifest numbers."
      }
    },
    "HRM.1.a": {
      name: "Credentialing of Professionals",
      formats: [".pdf", ".docx"],
      mandatoryKeywords: ["credentials", "license", "verification"],
      partialKeywords: ["nursing council", "qualification", "medical council", "audit"],
      gaps: {
        format: "Credentialing standard requires a PDF or Word Document registry (.pdf, .docx).",
        mandatory: "Missing doctor/nurse qualification checks or registry board verification files.",
        partial: "Lacks primary source verification certificates or background registration logs."
      }
    },
    "HRM.2.b": {
      name: "Infection Control Training",
      formats: [".pdf", ".docx", ".xlsx"],
      mandatoryKeywords: ["infection", "hand hygiene", "training"],
      partialKeywords: ["quiz", "scrubbing", "attendance", "evaluation"],
      gaps: {
        format: "Infection Control standard requires a PDF, Word, or Excel spreadsheet document (.pdf, .docx, .xlsx).",
        mandatory: "Missing clinical hand hygiene training records or basic infection protocols.",
        partial: "Lacks staff evaluation quiz results or hand scrubbing audit checklist files."
      }
    }
  };

  const analyzeEvidenceFile = (fileName, fileContent = "", standardId) => {
    const rule = complianceKnowledgeBase[standardId];
    if (!rule) {
      return {
        success: false,
        score: 0,
        status: "Not Met",
        gaps: ["Standard ID not found in compliance matrix."],
        message: "Unrecognized Standard ID."
      };
    }

    // Check file format (case-insensitive extension check)
    const fileExt = "." + fileName.split('.').pop().toLowerCase();
    if (!rule.formats.includes(fileExt)) {
      return {
        success: false,
        score: 0,
        status: "Not Met",
        gaps: [rule.gaps.format],
        message: `Invalid file format. This standard expects: ${rule.formats.join(', ')}`
      };
    }

    // Combine filename and file content for parsing
    const searchSpace = `${fileName} ${fileContent}`.toLowerCase();

    // Check mandatory keywords
    const missingMandatory = rule.mandatoryKeywords.filter(kw => !searchSpace.includes(kw));

    if (missingMandatory.length > 0) {
      return {
        success: false,
        score: 0,
        status: "Not Met",
        gaps: [rule.gaps.mandatory, `Missing required keywords: ${missingMandatory.join(', ')}`],
        message: "Compliance scan rejected. File content does not match standard requirements."
      };
    }

    // Check partial keywords to decide between Fully Met (10) and Partially Met (5)
    const missingPartial = rule.partialKeywords.filter(kw => !searchSpace.includes(kw));

    if (missingPartial.length > 0) {
      return {
        success: true,
        score: 5,
        status: "Partially Met",
        gaps: [rule.gaps.partial, `Notice: missing keywords for full score: ${missingPartial.join(', ')}`],
        message: "Compliance scan partially approved. The file meets standard requirements but has document gaps.",
        advice: `To upgrade to Fully Met (10 pts), make sure the file references: ${missingPartial.join(', ')}`
      };
    }

    return {
      success: true,
      score: 10,
      status: "Fully Met",
      gaps: [],
      message: "Compliance scan approved! Document fully meets standard requirements.",
      advice: "Ready for audit verification."
    };
  };

  // State Linked Operations
  const updateStandardScore = (standardId, score) => {
    const statuses = { 10: "Fully Met", 5: "Partially Met", 0: "Not Met" };
    setStandards(prev => prev.map(s => {
      if (s.id === standardId) {
        logActivity(`Changed standard ${s.id} score to ${score} (${statuses[score]})`);
        return { ...s, score, status: statuses[score] };
      }
      return s;
    }));
  };

  const addDocument = (newDoc) => {
    const docId = `doc-${Date.now()}`;
    const docWithId = { ...newDoc, id: docId, isEncrypted: true };
    setDocuments(prev => [docWithId, ...prev]);
    
    if (newDoc.mappedStandards && newDoc.mappedStandards.length > 0) {
      newDoc.mappedStandards.forEach(stdId => {
        // Run compliance check on the document details
        const scan = analyzeEvidenceFile(newDoc.title, newDoc.content || "", stdId);
        if (scan.success) {
          setStandards(prev => prev.map(s => {
            if (s.id === stdId) {
              const newScore = Math.max(s.score, scan.score);
              const statuses = { 10: "Fully Met", 5: "Partially Met", 0: "Not Met" };
              return { ...s, score: newScore, status: statuses[newScore] };
            }
            return s;
          }));
        }
      });
    }

    logActivity(`Uploaded document: ${newDoc.title} (${newDoc.type})`);
    return docId;
  };

  const addAudit = (newAudit) => {
    const auditId = `audit-${Date.now()}`;
    const auditObj = {
      id: auditId,
      title: newAudit.title,
      department: newAudit.department,
      auditor: currentUser.name,
      date: newAudit.date,
      status: "Scheduled",
      checklist: newAudit.checklist || [],
      findings: []
    };
    setAudits(prev => [auditObj, ...prev]);
    logActivity(`Created internal audit: ${newAudit.title} for ${newAudit.department}`);
  };

  const addCapa = (newCapa) => {
    const capaId = `capa-${Date.now()}`;
    const capaObj = {
      id: capaId,
      source: newCapa.source || "Manual Log",
      department: newCapa.department,
      responsible: newCapa.responsible,
      dueDate: newCapa.dueDate,
      priority: newCapa.priority,
      rootCause: newCapa.rootCause,
      correctiveAction: newCapa.correctiveAction,
      preventiveAction: newCapa.preventiveAction,
      status: "Open",
      evidenceFile: null,
      closureApprovedBy: null
    };
    setCapaItems(prev => [capaObj, ...prev]);

    const taskId = `task-${Date.now()}`;
    const taskObj = {
      id: taskId,
      title: `CAPA Action: ${newCapa.correctiveAction.substring(0, 40)}...`,
      assignedTo: newCapa.responsible,
      dueDate: newCapa.dueDate,
      status: "Pending",
      priority: newCapa.priority
    };
    setTasks(prev => [taskObj, ...prev]);

    logActivity(`Created CAPA ${capaId} assigned to ${newCapa.responsible}`);
    return capaId;
  };

  const addIncident = (newInc) => {
    const incId = `inc-${Date.now()}`;
    const incidentObj = {
      id: incId,
      type: newInc.type,
      department: newInc.department,
      dateTime: newInc.dateTime || new Date().toISOString().slice(0, 16).replace('T', ' '),
      severity: newInc.severity,
      description: newInc.description,
      immediateAction: newInc.immediateAction,
      investigator: newInc.investigator || "Assigned Quality Officer",
      status: "Under Investigation",
      capaId: null
    };
    setIncidents(prev => [incidentObj, ...prev]);
    logActivity(`Reported incident ${incId} in ${newInc.department} (${newInc.type})`);
  };

  const closeCapa = (capaId, approverName) => {
    setCapaItems(prev => prev.map(c => {
      if (c.id === capaId) {
        logActivity(`Closed CAPA ${capaId} (Approved by ${approverName})`);
        return { ...c, status: "Closed", closureApprovedBy: approverName };
      }
      return c;
    }));
  };

  const linkFindingToCapa = (auditId, findingId, capaId) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        const updatedFindings = a.findings.map(f => {
          if (f.id === findingId) {
            return { ...f, capaId, resolved: true };
          }
          return f;
        });
        return { ...a, findings: updatedFindings };
      }
      return a;
    }));
  };

  const approveSOPDraft = (title, department, mappedStds, content) => {
    const newDoc = {
      title,
      type: "SOP",
      department,
      version: "1.0",
      status: "Approved",
      author: "AI Copilot (Approved by " + currentUser.name + ")",
      approvedBy: currentUser.name,
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: mappedStds,
      content
    };
    const docId = addDocument(newDoc);
    logActivity(`Approved AI-generated SOP draft for standard ${mappedStds.join(', ')}`);
    return docId;
  };

  // Live countdown ticker
  const [liveNow, setLiveNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const clientRecord = currentUser ? clientsList.find(c => c.email === currentUser.email) : null;

  const trialTimeLeftMs = (() => {
    if (isSubscribed || !clientRecord) return 0;
    if (!clientRecord.trialStartDate) return 7 * 24 * 60 * 60 * 1000;
    const start = new Date(clientRecord.trialStartDate).getTime();
    const expiry = start + 7 * 24 * 60 * 60 * 1000;
    const diff = expiry - liveNow;
    return diff < 0 ? 0 : diff;
  })();

  const trialDaysLeft = Math.ceil(trialTimeLeftMs / (1000 * 60 * 60 * 24));

  const subscriptionTimeLeftMs = (() => {
    if (!isSubscribed || !clientRecord || !clientRecord.planExpiryDate) return 0;
    const expiry = new Date(clientRecord.planExpiryDate).getTime();
    const diff = expiry - liveNow;
    return diff < 0 ? 0 : diff;
  })();

  const subscriptionDaysLeft = Math.ceil(subscriptionTimeLeftMs / (1000 * 60 * 60 * 24));

  const isAppLocked = forcePaymentScreen || (currentUser && (
    (!isSubscribed && trialTimeLeftMs <= 0) ||
    (isSubscribed && subscriptionTimeLeftMs <= 0)
  ));

  const getLiveCountdownString = () => {
    if (isSubscribed) {
      if (!clientRecord || !clientRecord.planExpiryDate) return "No active subscription";
      const diff = new Date(clientRecord.planExpiryDate).getTime() - liveNow;
      if (diff <= 0) return "Expired";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${days}d ${hours}h ${mins}m ${secs}s`;
    } else {
      if (!clientRecord || !clientRecord.trialStartDate) return "7 days remaining";
      const start = new Date(clientRecord.trialStartDate).getTime();
      const diff = (start + 7*24*60*60*1000) - liveNow;
      if (diff <= 0) return "Expired";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${days}d ${hours}h ${mins}m ${secs}s`;
    }
  };

  const isStandardActive = (std) => {
    if (!std.department) return true;
    const stdDept = std.department.toLowerCase();
    
    // Global/hospital-wide departments are always active
    const globalDepts = ["hr", "nursing", "medical records", "security & facility", "infection control", "quality control", "board", "quality"];
    if (globalDepts.some(gd => stdDept.includes(gd))) return true;

    // Check if standard department matches any selected active department
    return activeDepts.some(ad => {
      const normalizedAd = ad.toLowerCase();
      return normalizedAd.includes(stdDept) || stdDept.includes(normalizedAd);
    });
  };

  // Computed readiness scoring indices
  const activeStandards = standards.filter(isStandardActive);
  const totalStandardsCount = activeStandards.length;
  const maxPossibleScore = totalStandardsCount * 10;
  const currentEarnedScore = activeStandards.reduce((sum, s) => sum + s.score, 0);
  
  const rawScore = totalStandardsCount > 0 ? (currentEarnedScore / maxPossibleScore) * 100 : 0;
  const readinessScore = Math.round(rawScore * 10) / 10;

  const evidenceUploadedCount = activeStandards.filter(s => {
    return documents.some(doc => doc.mappedStandards && doc.mappedStandards.includes(s.id) && doc.status === "Approved");
  }).length;

  const missingEvidenceCount = totalStandardsCount - evidenceUploadedCount;
  const openCapasCount = capaItems.filter(c => c.status === "Open").length;
  const overdueTasksCount = tasks.filter(t => t.status === "Pending" && new Date(t.dueDate) < new Date()).length;
  const pendingAuditsCount = audits.filter(a => a.status === "Scheduled").length;
  const incidentsThisMonthCount = incidents.length;

  return (
    <QualiNABHContext.Provider value={{
      currentUser, setCurrentUser,
      theme, setTheme,
      currentRoute, setCurrentRoute,
      hospitalMode, switchHospitalMode,
      hospitalName, setHospitalName,
      hospitalBeds, setHospitalBeds,
      hospitalTier, setHospitalTier,
      activeDepts, setActiveDepts,
      onboardingSteps, setOnboardingSteps,
      importNABHTemplates,
      standards, setStandards, updateStandardScore,
      documents, setDocuments, addDocument,
      audits, setAudits, addAudit, linkFindingToCapa,
      capaItems, setCapaItems, addCapa, closeCapa,
      incidents, setIncidents, addIncident,
      licenses, setLicenses,
      tasks, setTasks,
      auditLogs, setAuditLogs, logActivity,
      qualityIndicators, setQualityIndicators,
      // SaaS Simulator States & Methods
      clientsList, setClientsList,
      isSubscribed, setIsSubscribed,
      trialStartDate, setTrialStartDate,
      geminiApiKey, setGeminiApiKey,
      hospitalLogo, setHospitalLogo,
      teamMembers, setTeamMembers,
      vendorAdminCredentials, setVendorAdminCredentials,
      vendorEmployees, setVendorEmployees,
      signUpClient, purchaseSubscription,
      updateHospitalProfile, saveGeminiKey, inviteTeamMember,
      changeUserPassword, changeUserProfile,
      addHospitalTask, updateHospitalTaskStatus, deleteHospitalTask,
      complianceFeed, setComplianceFeed,
      feedNotifications, setFeedNotifications,
      checkForComplianceUpdates,
      setClientStatusOverride,
      supportTickets, setSupportTickets,
      emailLogs, setEmailLogs,
      transactions, setTransactions,
      vendorGeminiKey, setVendorGeminiKey,
      sendSimulatedEmail, addSupportTicket, logSimulatedDownload,
      saveVendorGeminiKey,
      // Computed stats
      readinessScore,
      evidenceUploadedCount,
      missingEvidenceCount,
      openCapasCount,
      overdueTasksCount,
      pendingAuditsCount,
      incidentsThisMonthCount,
      approveSOPDraft,
      complianceKnowledgeBase,
      analyzeEvidenceFile,
      isStandardActive,
      trialDaysLeft,
      subscriptionDaysLeft,
      isAppLocked,
      getLiveCountdownString,
      forcePaymentScreen,
      setForcePaymentScreen
    }}>
      {children}
    </QualiNABHContext.Provider>
  );
};

