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

export const QualiNABHProvider = ({ children }) => {
  // Authentication Role
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('qn_user');
    return saved ? JSON.parse(saved) : { email: "quality.head@hospital.org", role: "Quality Head", name: "Dr. Sarah Paul" };
  });

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('qn_theme') || 'light';
  });

  // Current Router Tab
  const [currentRoute, setCurrentRoute] = useState('/');

  // Hospital Onboarding State Type: 'active' or 'new'
  const [hospitalMode, setHospitalMode] = useState(() => {
    return localStorage.getItem('qn_hospital_mode') || 'active';
  });

  // Dynamic Hospital Settings
  const [hospitalName, setHospitalName] = useState(() => {
    return localStorage.getItem('qn_hospital_name') || 'City Central Metro Hospital';
  });

  const [hospitalBeds, setHospitalBeds] = useState(() => {
    return localStorage.getItem('qn_hospital_beds') || '120';
  });

  const [hospitalTier, setHospitalTier] = useState(() => {
    return localStorage.getItem('qn_hospital_tier') || 'Full Accreditation';
  });

  const [activeDepts, setActiveDepts] = useState(() => {
    const saved = localStorage.getItem('qn_active_depts');
    return saved ? JSON.parse(saved) : ['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing'];
  });

  const [onboardingSteps, setOnboardingSteps] = useState(() => {
    const saved = localStorage.getItem('qn_onboarding_steps');
    return saved ? JSON.parse(saved) : { identity: false, departments: false, importTemplates: false, firstSop: false };
  });

  // Databases States
  const [standards, setStandards] = useState(() => {
    const saved = localStorage.getItem('qn_standards');
    return saved ? JSON.parse(saved) : defaultStandards;
  });

  // SaaS Multi-tenant & Vendor Admin States
  const [clientsList, setClientsList] = useState(() => {
    const saved = localStorage.getItem('qn_clients_list');
    const signup = new Date(Date.now() - 3*24*60*60*1000).toISOString();
    const expiry = new Date(Date.now() + 4*24*60*60*1000).toISOString();
    return saved ? JSON.parse(saved) : [
      { 
        hospitalId: "demo-hosp", 
        hospitalName: "City Central Metro Hospital", 
        email: "quality.head@hospital.org", 
        beds: 120, 
        trialStartDate: signup, 
        signupDate: signup,
        planExpiryDate: expiry,
        isSubscribed: false, 
        status: "Active Trial", 
        address: "Sector 4, Dwarka, New Delhi", 
        regId: "REG-99201",
        govId: "07AAAAA1111A1Z1",
        govIdType: "GSTIN",
        govIdStatus: "Approved",
        storageUsed: 3145728,
        bounced: false
      }
    ];
  });

  const [isSubscribed, setIsSubscribed] = useState(() => {
    const saved = localStorage.getItem('qn_is_subscribed');
    return saved ? JSON.parse(saved) : false;
  });

  const [trialStartDate, setTrialStartDate] = useState(() => {
    return localStorage.getItem('qn_trial_start_date') || new Date().toISOString();
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('qn_gemini_api_key') || '';
  });

  const [hospitalLogo, setHospitalLogo] = useState(() => {
    return localStorage.getItem('qn_hospital_logo') || '🛡️';
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem('qn_team_members');
    return saved ? JSON.parse(saved) : [
      { email: "quality.head@hospital.org", name: "Dr. Sarah Paul", role: "Quality Head", department: "Quality Control" },
      { email: "super@vaidyaq.com", name: "Col. Roy", role: "Super Admin", department: "Board" },
      { email: "pharmacy@hospital.org", name: "Dr. Sen", role: "Department Head", department: "Pharmacy" }
    ];
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
    const saved = localStorage.getItem('qn_documents');
    return saved ? JSON.parse(saved) : defaultDocuments;
  });

  const [audits, setAudits] = useState(() => {
    const saved = localStorage.getItem('qn_audits');
    return saved ? JSON.parse(saved) : defaultAudits;
  });

  const [capaItems, setCapaItems] = useState(() => {
    const saved = localStorage.getItem('qn_capas');
    return saved ? JSON.parse(saved) : defaultCapas;
  });

  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('qn_incidents');
    return saved ? JSON.parse(saved) : defaultIncidents;
  });

  const [licenses, setLicenses] = useState(() => {
    const saved = localStorage.getItem('qn_licenses');
    return saved ? JSON.parse(saved) : defaultLicenses;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('qn_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('qn_audit_logs');
    return saved ? JSON.parse(saved) : defaultAuditLogs;
  });

  const [qualityIndicators, setQualityIndicators] = useState(() => {
    const saved = localStorage.getItem('qn_quality_indicators');
    return saved ? JSON.parse(saved) : defaultQualityIndicators;
  });

  // Sync states with local storage
  useEffect(() => {
    localStorage.setItem('qn_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('qn_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('qn_hospital_mode', hospitalMode);
  }, [hospitalMode]);

  useEffect(() => {
    localStorage.setItem('qn_hospital_name', hospitalName);
  }, [hospitalName]);

  useEffect(() => {
    localStorage.setItem('qn_hospital_beds', hospitalBeds);
  }, [hospitalBeds]);

  useEffect(() => {
    localStorage.setItem('qn_hospital_tier', hospitalTier);
  }, [hospitalTier]);

  useEffect(() => {
    localStorage.setItem('qn_active_depts', JSON.stringify(activeDepts));
  }, [activeDepts]);

  useEffect(() => {
    localStorage.setItem('qn_onboarding_steps', JSON.stringify(onboardingSteps));
  }, [onboardingSteps]);

  useEffect(() => {
    localStorage.setItem('qn_standards', JSON.stringify(standards));
  }, [standards]);

  useEffect(() => {
    localStorage.setItem('qn_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('qn_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('qn_capas', JSON.stringify(capaItems));
  }, [capaItems]);

  useEffect(() => {
    localStorage.setItem('qn_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('qn_licenses', JSON.stringify(licenses));
  }, [licenses]);

  useEffect(() => {
    localStorage.setItem('qn_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('qn_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('qn_quality_indicators', JSON.stringify(qualityIndicators));
  }, [qualityIndicators]);

  useEffect(() => {
    localStorage.setItem('qn_clients_list', JSON.stringify(clientsList));
  }, [clientsList]);

  useEffect(() => {
    localStorage.setItem('qn_is_subscribed', JSON.stringify(isSubscribed));
  }, [isSubscribed]);

  useEffect(() => {
    localStorage.setItem('qn_trial_start_date', trialStartDate);
  }, [trialStartDate]);

  useEffect(() => {
    localStorage.setItem('qn_gemini_api_key', geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem('qn_hospital_logo', hospitalLogo);
  }, [hospitalLogo]);

  useEffect(() => {
    localStorage.setItem('qn_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

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
      bounced: true
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

    // Reset standard scores to 0 (Unonboarded state)
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

  const purchaseSubscription = () => {
    setIsSubscribed(true);
    const priceAmount = Number(hospitalBeds) <= 20 ? 55999 : Number(hospitalBeds) <= 150 ? 129999 : 249999;
    const gstVal = Math.round(priceAmount * 0.18 * 100) / 100;
    
    const newTrans = {
      id: `trans-${Date.now()}`,
      clientId: currentUser.email,
      hospitalName: hospitalName,
      amount: priceAmount,
      gst: gstVal,
      date: new Date().toISOString().slice(0, 10),
      status: "Successful",
      billingCycle: "H1 2026"
    };
    setTransactions(prev => [newTrans, ...prev]);

    setClientsList(prev => prev.map(c => {
      if (c.hospitalName === hospitalName || c.email === currentUser.email) {
        return { ...c, isSubscribed: true, status: "Paid", planExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString() };
      }
      return c;
    }));
    logActivity(`Subscription payment of ₹${priceAmount.toLocaleString()} processed successfully.`);

    // Send payment confirmation email
    sendSimulatedEmail(
      currentUser.email,
      "VaidyaQ Subscription Active - Payment Received",
      `Hello, we have successfully received your payment of ₹${priceAmount.toLocaleString()} + ₹${gstVal.toLocaleString()} GST. Your subscription is active until ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}.`,
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

  const inviteTeamMember = (email, name, role, department) => {
    const newMember = { email, name, role, department };
    setTeamMembers(prev => [...prev, newMember]);
    logActivity(`Invited team member: ${name} (${role}) to ${department}`);
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
        setStandards(prev => prev.map(s => {
          if (s.id === stdId && s.score === 0) {
            return { ...s, score: 5, status: "Partially Met" };
          }
          return s;
        }));
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

  // Computed readiness scoring indices
  const totalStandardsCount = standards.length;
  const maxPossibleScore = totalStandardsCount * 10;
  const currentEarnedScore = standards.reduce((sum, s) => sum + s.score, 0);
  
  const rawScore = totalStandardsCount > 0 ? (currentEarnedScore / maxPossibleScore) * 100 : 0;
  const readinessScore = Math.round(rawScore * 10) / 10;

  const evidenceUploadedCount = standards.filter(s => {
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
      trialDaysLeft: (() => {
        const start = new Date(trialStartDate).getTime();
        const now = Date.now();
        const diffTime = (start + 7*24*60*60*1000) - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 0 ? 0 : diffDays;
      })()
    }}>
      {children}
    </QualiNABHContext.Provider>
  );
};

