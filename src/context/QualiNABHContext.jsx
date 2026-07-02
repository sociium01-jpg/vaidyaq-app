import React, { createContext, useState, useEffect, useRef } from 'react';
import { isConfigured } from '../firebase';
import * as firestoreService from '../services/firestoreService';

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

const entryLevelStandards = [
  { id: "AAC.1", chapter: "AAC", title: "Registration Process", description: "Established registration process for patient entry.", evidenceRequired: "Registration SOP", status: "Not Met", score: 0, department: "OPD" },
  { id: "COP.1", chapter: "COP", title: "General Care", description: "General care guidelines for patients.", evidenceRequired: "Patient Care Guidelines", status: "Not Met", score: 0, department: "Nursing" },
  { id: "MOM.1", chapter: "MOM", title: "Medication List", description: "Formulary or list of stock drugs is available.", evidenceRequired: "Medicine Formulary", status: "Not Met", score: 0, department: "Pharmacy" },
  { id: "FMS.1", chapter: "FMS", title: "Fire Safety Basic NOC", description: "Fire NOC and basic safety systems are operational.", evidenceRequired: "Fire NOC Copy", status: "Not Met", score: 0, department: "Security & Facility" },
  { id: "HRM.1", chapter: "HRM", title: "Staff Records", description: "Personnel records of active doctors and nurses are verified.", evidenceRequired: "HR Files", status: "Not Met", score: 0, department: "HR" }
];

const digitalHealthStandards = [
  { id: "DHS.1.a", chapter: "DHS", title: "ABHA ID Integration", description: "Systems allow patients to link their health accounts using ABHA ID.", evidenceRequired: "ABHA Integration Certificate", status: "Not Met", score: 0, department: "IT / Medical Records" },
  { id: "DHS.2.b", chapter: "DHS", title: "Teleconsultation Records", description: "Telehealth consultations are documented digitally with consent logs.", evidenceRequired: "Telehealth Consent Policy", status: "Not Met", score: 0, department: "OPD" },
  { id: "DHS.3.c", chapter: "DHS", title: "Data Security Policy", description: "Active firewalls, encryption-at-rest, and user role limitations are active.", evidenceRequired: "IT Security SOP", status: "Not Met", score: 0, department: "IT" }
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

const defaultComplianceFlows = [
  { id: "PSP", name: "Patient Safety Policy", department: "Quality Control", owner: "Dr. Sarah Paul", version: "1.2", effectiveDate: "2026-01-10", reviewDate: "2027-01-10", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Completed", capa: "Completed", review: "Pending", improvement: "Not Started", updates: "Not Started" }, linkedSops: ["doc-1"], linkedForms: ["incident-reporting"], linkedTraining: [], linkedAudits: ["audit-2"], linkedCapas: [], linkedIncidents: [] },
  { id: "IPC", name: "Infection Prevention & Control Policy", department: "Quality Control", owner: "Dr. Sarah Paul", version: "1.0", effectiveDate: "2026-02-15", reviewDate: "2027-02-15", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Pending", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: ["doc-2"], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "MSP", name: "Medication Safety Policy", department: "Pharmacy", owner: "Dr. Sen", version: "2.0", effectiveDate: "2025-12-01", reviewDate: "2026-12-01", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Completed", capa: "Completed", review: "Completed", improvement: "Completed", updates: "Pending" }, linkedSops: ["doc-3", "doc-4"], linkedForms: [], linkedTraining: [], linkedAudits: ["audit-3"], linkedCapas: ["capa-1"], linkedIncidents: ["inc-1"] },
  { id: "AMS", name: "Antimicrobial Stewardship Policy", department: "Pharmacy", owner: "Dr. Sen", version: "1.0", effectiveDate: "2026-04-01", reviewDate: "2027-04-01", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Pending", training: "Not Started", implementation: "Not Started", documentation: "Not Started", audit: "Not Started", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "IRP", name: "Incident Reporting Policy", department: "Quality Control", owner: "Dr. Sarah Paul", version: "1.1", effectiveDate: "2026-03-01", reviewDate: "2027-03-01", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Completed", capa: "Completed", review: "Completed", improvement: "Completed", updates: "Completed" }, linkedSops: [], linkedForms: ["incident-reporting"], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: ["inc-2"] },
  { id: "PCP", name: "Patient Consent Policy", department: "OPD", owner: "Dr. Rita", version: "1.0", effectiveDate: "2026-01-15", reviewDate: "2027-01-15", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Pending", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "MRP", name: "Medical Record Policy", department: "Medical Records", owner: "Dr. Sarah Paul", version: "1.0", effectiveDate: "2026-01-05", reviewDate: "2027-01-05", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Pending", documentation: "Not Started", audit: "Not Started", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "BWM", name: "Biomedical Waste Management Policy", department: "Housekeeping", owner: "Mr. Verma", version: "1.1", effectiveDate: "2026-02-18", reviewDate: "2027-02-18", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Pending", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: ["doc-6"], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "FSP", name: "Fire and Safety Policy", department: "Security & Facility", owner: "Col. Roy", version: "1.2", effectiveDate: "2026-02-18", reviewDate: "2027-02-18", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Completed", capa: "Pending", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: ["doc-5"], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "STC", name: "Staff Training and Competency Policy", department: "HR", owner: "Dr. Sarah Paul", version: "1.0", effectiveDate: "2026-01-10", reviewDate: "2027-01-10", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Completed", capa: "Completed", review: "Completed", improvement: "Completed", updates: "Completed" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "HRP", name: "Human Resource Policy", department: "HR", owner: "Dr. Sarah Paul", version: "1.0", effectiveDate: "2026-01-10", reviewDate: "2027-01-10", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Pending", documentation: "Not Started", audit: "Not Started", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "DPI", name: "Data Privacy and Information Security Policy", department: "Quality Control", owner: "Col. Roy", version: "1.0", effectiveDate: "2026-05-15", reviewDate: "2027-05-15", approver: "Col. Roy (COO)", stages: { policy: "Completed", sop: "Completed", training: "Pending", implementation: "Not Started", documentation: "Not Started", audit: "Not Started", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "VEM", name: "Vendor and Equipment Maintenance Policy", department: "ICU", owner: "Mr. Dave", version: "1.0", effectiveDate: "2026-03-01", reviewDate: "2027-03-01", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Pending", findings: "Not Started", capa: "Not Started", review: "Not Started", improvement: "Not Started", updates: "Not Started" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] },
  { id: "QIP", name: "Quality Improvement Policy", department: "Quality Control", owner: "Dr. Sarah Paul", version: "1.1", effectiveDate: "2026-01-10", reviewDate: "2027-01-10", approver: "Dr. Mehta (Medical Director)", stages: { policy: "Completed", sop: "Completed", training: "Completed", implementation: "Completed", documentation: "Completed", audit: "Completed", findings: "Completed", capa: "Completed", review: "Completed", improvement: "Completed", updates: "Completed" }, linkedSops: [], linkedForms: [], linkedTraining: [], linkedAudits: [], linkedCapas: [], linkedIncidents: [] }
];

const defaultCommittees = [
  { id: "comm-1", name: "Quality Assurance Committee", department: "Quality Control", chair: "Dr. Sarah Paul", frequency: "Monthly", meetings: [
    { date: "2026-05-10", attendees: ["Dr. Sarah Paul", "Col. Roy", "Dr. Sen"], agenda: "Review ICU CRASH cart audit findings & resolve CAPA-1.", minutes: "Discussed expired saline syringes in ICU cart. Replaced syringes. Nursing handover daily checklists introduced. Signed off.", actionItems: [{ id: "act-1", task: "Introduce daily ICU crash cart check log sheet", assignedTo: "Sister Gracy", dueDate: "2026-05-15", status: "Completed" }] },
    { date: "2026-06-08", attendees: ["Dr. Sarah Paul", "Col. Roy", "Dr. Rita"], agenda: "NABH 6th Edition Readiness scoring review and documentation gaps check.", minutes: "Audited standard scores. Calculated 68% readiness. Flagged missing SOP for MOM.3.a. Tasks assigned to Pharmacy Head.", actionItems: [{ id: "act-2", task: "Draft expired drug disposal SOP (MOM.3.a)", assignedTo: "Dr. Sen", dueDate: "2026-06-15", status: "Pending" }] }
  ] },
  { id: "comm-2", name: "Infection Control Committee", department: "Quality Control", chair: "Dr. Sarah Paul", frequency: "Monthly", meetings: [
    { date: "2026-05-18", attendees: ["Dr. Sarah Paul", "Sister Gracy", "Mr. Verma"], agenda: "Biomedical waste segregation bags checking and staff hygiene training logs review.", minutes: "Evaluated yellow/red bag weights. Hand hygiene quiz completion checked at 88%. Scheduled audit.", actionItems: [] }
  ] },
  { id: "comm-3", name: "Pharmacy Committee", department: "Pharmacy", chair: "Dr. Sen", frequency: "Bi-Monthly", meetings: [
    { date: "2026-06-01", attendees: ["Dr. Sen", "Dr. Sarah Paul", "Dr. Mehta"], agenda: "Medication safety errors, high-alert drug lockbox audits.", minutes: "Reviewed prescription handwriting ambiguities. Intercepted double dose paracetamol. Instructed pharmacy staff to check double signatures.", actionItems: [] }
  ] }
];

const defaultTrainings = [
  { id: "train-1", topic: "Clinical Hand Hygiene (WHO 5 Moments)", department: "Quality Control", role: "Nurse", date: "2026-05-12", attendees: ["Sister Gracy", "Priya Sharma", "Aarav Sharma"], quizRef: "QZ-HH-091", passRate: "90", status: "Active" },
  { id: "train-2", topic: "Basic Life Support (BLS) Certification", department: "Emergency", role: "Doctor", date: "2026-04-10", attendees: ["Dr. Sen", "Dr. Rita", "Dr. Sarah Paul"], quizRef: "QZ-BLS-112", passRate: "100", status: "Active" }
];

const defaultRisks = [
  { id: "risk-1", category: "Medication Safety", description: "Prescription handwriting ambiguity leading to dosage dispensation errors.", department: "Pharmacy", impact: "High", likelihood: "Medium", rating: "Red", correctiveAction: "Transitioning to 100% electronic HIMS prescription entries." },
  { id: "risk-2", category: "Facility Fire Safety", description: "Obstructed emergency egress pathways in OPD consulting wings due to backup furniture storage.", department: "Security & Facility", impact: "High", likelihood: "Low", rating: "Orange", correctiveAction: "Cleared corridors and arranged basement storage." }
];

const defaultSprints = [
  { id: "sprint-1", name: "Sprint 1 - Statutory Renewal", status: "Active", startDate: "2026-06-15", endDate: "2026-06-25", targets: ["task-1", "task-2"] },
  { id: "sprint-2", name: "Sprint 2 - Quality Audit Preparation", status: "Planned", startDate: "2026-06-26", endDate: "2026-07-06", targets: ["task-3"] }
];

const defaultReportsList = [
  { id: "rep-1", title: "NABH 6th Edition Gap Analysis", type: "AI Output", createdBy: "quality.head@hospital.org", createdAt: "2026-06-12 10:15", scope: "Comprehensive", downloadUrl: "#" },
  { id: "rep-2", title: "Weekly CEO Quality Briefing - May W4", type: "Executive Report", createdBy: "super@vaidyaq.com", createdAt: "2026-05-30 18:00", scope: "Weekly", downloadUrl: "#" }
];

const defaultTaskActivities = [
  { id: "act-1", taskId: "task-1", user: "Dr. Sarah Paul", action: "Created task", timestamp: "2026-06-11 11:20:10" }
];

const assertNoMockDataForProductionTenant = (email, key, data) => {
  if (!email) return data;
  const isDemo = email === 'demo@vaidyaq.com' || email === 'quality.head@hospital.org';
  if (!isDemo && data && Array.isArray(data) && data.length > 0) {
    const hasMockId = data.some(item => 
      item && typeof item.id === 'string' && (
        item.id.startsWith('doc-') || 
        item.id.startsWith('audit-') || 
        item.id.startsWith('capa-') || 
        item.id.startsWith('inc-') || 
        item.id.startsWith('task-') || 
        item.id.startsWith('tick-')
      )
    );
    if (hasMockId) {
      console.warn(`[Security Guard] Production tenant ${email} attempted to load mock data for key: ${key}. Enforcing clean slate.`);
      return [];
    }
  }
  return data;
};

const safeJsonParse = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (e) {
    console.warn(`[Safe Storage] Failed to parse key "${key}", reverting to default.`, e);
    return defaultValue;
  }
};

export const QualiNABHProvider = ({ children }) => {
  // Get namespaced key loader helper
  const loadNamespacedState = (key, defaultValue) => {
    const savedUser = localStorage.getItem('qn_user');
    let activeEmail = null;
    let hospId = 'demo-hosp';
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        activeEmail = parsed.parentEmail || parsed.email;
        hospId = parsed.activeHospitalId || parsed.hospitalId || 'demo-hosp';
      } catch (e) {}
    }
    
    // Try hospital-based namespace first
    const hospPrefix = hospId ? `hosp_${hospId}_` : '';
    let saved = localStorage.getItem(hospPrefix + key);
    
    // Fallback to legacy email namespace
    if (!saved && activeEmail) {
      const emailPrefix = `${activeEmail}_`;
      saved = localStorage.getItem(emailPrefix + key);
    }

    let result;
    if (saved) {
      try {
        result = JSON.parse(saved);
      } catch (e) {
        result = saved; // string fallback
      }
    } else {
      // Fallback logic for demo accounts (demo@vaidyaq.com or quality.head@hospital.org)
      const isDemo = activeEmail === 'demo@vaidyaq.com' || activeEmail === 'quality.head@hospital.org';
      if (isDemo) {
        const globalSaved = localStorage.getItem(key);
        if (globalSaved) {
          try {
            result = JSON.parse(globalSaved);
          } catch (e) {}
        }
        if (result === undefined) {
          result = defaultValue;
        }
      } else if (activeEmail) {
        // For new signups, return blank templates
        if (key === 'qn_standards') {
          result = defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" }));
        } else if (key === 'qn_licenses') {
          result = defaultLicenses.map(l => ({
            ...l,
            issueDate: '',
            expiryDate: '',
            responsible: (l.responsible && typeof l.responsible === 'string' && l.responsible.includes('(')) ? l.responsible.substring(l.responsible.indexOf('(') + 1, l.responsible.length - 1) : (l.responsible || 'Administration'),
            status: 'Expired'
          }));
        } else if (key === 'qn_compliance_flows') {
          result = defaultComplianceFlows.map(flow => ({
            ...flow,
            stages: {
              policy: "Not Started",
              sop: "Not Started",
              training: "Not Started",
              implementation: "Not Started",
              documentation: "Not Started",
              audit: "Not Started",
              findings: "Not Started",
              capa: "Not Started",
              review: "Not Started",
              improvement: "Not Started",
              updates: "Not Started"
            },
            linkedSops: [],
            linkedForms: [],
            linkedTraining: [],
            linkedAudits: [],
            linkedCapas: [],
            linkedIncidents: []
          }));
        } else if (key === 'qn_committees') {
          result = defaultCommittees.map(c => ({
            ...c,
            meetings: []
          }));
        } else {
          result = Array.isArray(defaultValue) ? [] : typeof defaultValue === 'object' ? {} : defaultValue;
        }
      } else {
        result = defaultValue;
      }
    }
    return assertNoMockDataForProductionTenant(activeEmail, key, result);
  };

  // Authentication Role - default to null (landing page marketing)
  const [currentUser, setCurrentUser] = useState(() => {
    return safeJsonParse('qn_user', null);
  });

  const [activeHospitalId, setActiveHospitalId] = useState(() => {
    const savedUser = localStorage.getItem('qn_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.activeHospitalId || parsed.hospitalId || 'demo-hosp';
      } catch (e) {}
    }
    return 'demo-hosp';
  });

  const [activeOrganizationId, setActiveOrganizationId] = useState(() => {
    const savedUser = localStorage.getItem('qn_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.organizationId || null;
      } catch (e) {}
    }
    return null;
  });

  const [accessibleHospitals, setAccessibleHospitals] = useState(() => {
    const savedUser = localStorage.getItem('qn_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.accessibleHospitals || [parsed.hospitalId || 'demo-hosp'];
      } catch (e) {}
    }
    return ['demo-hosp'];
  });

  // Sync helper states when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setAccessibleHospitals(currentUser.accessibleHospitals || [currentUser.hospitalId || 'demo-hosp']);
      setActiveHospitalId(currentUser.activeHospitalId || currentUser.hospitalId || 'demo-hosp');
      setActiveOrganizationId(currentUser.organizationId || null);
    } else {
      setAccessibleHospitals(['demo-hosp']);
      setActiveHospitalId('demo-hosp');
      setActiveOrganizationId(null);
    }
  }, [currentUser]);

  // Method to switch between branches
  const switchActiveBranch = (branchId) => {
    if (accessibleHospitals.includes(branchId)) {
      setActiveHospitalId(branchId);
      setCurrentUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, activeHospitalId: branchId };
        localStorage.setItem('qn_user', JSON.stringify(updated));
        return updated;
      });
      logActivity(`Switched active branch to ${branchId}`);
      setCurrentRoute('/app/dashboard');
    }
  };

  const activePrefix = activeHospitalId ? `hosp_${activeHospitalId}_` : (currentUser ? `${currentUser.parentEmail || currentUser.email}_` : '');

  const [isReloading, setIsReloading] = useState(false);
  const prevPrefixRef = useRef(activePrefix);
  const canSave = currentUser && !isReloading && prevPrefixRef.current === activePrefix;

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('qn_theme') || 'dark';
  });

  // Current Router Tab
  const [currentRoute, setCurrentRouteState] = useState(() => {
    const hash = window.location.hash;
    if (hash) {
      return hash.substring(1) || '/';
    }
    const path = window.location.pathname;
    if (path && path !== '/') {
      // Gracefully translate legacy pathname to hash routing to avoid server-side 404s on refresh
      setTimeout(() => {
        window.history.replaceState(null, '', '/');
        window.location.hash = path;
      }, 0);
      return path;
    }
    return '/';
  });

  const setCurrentRoute = (route) => {
    window.location.hash = route;
    setCurrentRouteState(route);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentRouteState(hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



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

  const [onboardingStep, setOnboardingStep] = useState(() => {
    return Number(loadNamespacedState('qn_onboarding_step', 1));
  });

  // Databases States
  const [standards, setStandards] = useState(() => {
    return loadNamespacedState('qn_standards', defaultStandards);
  });

  const [selectedProgram, setSelectedProgram] = useState(() => {
    return loadNamespacedState('qn_selected_program', 'NABH 6th Edition');
  });

  // SaaS Multi-tenant & Vendor Admin States - demo-hosp configured with email demo@vaidyaq.com and password demo123
  const [clientsList, setClientsList] = useState(() => {
    const signup = new Date(Date.now() - 3*24*60*60*1000).toISOString();
    const expiry = new Date(Date.now() + 4*24*60*60*1000).toISOString();
    const defaultClients = [
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
    return safeJsonParse('qn_clients_list', defaultClients);
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

  const [openaiApiKey, setOpenaiApiKey] = useState(() => {
    return loadNamespacedState('qn_openai_api_key', '');
  });

  const [anthropicApiKey, setAnthropicApiKey] = useState(() => {
    return loadNamespacedState('qn_anthropic_api_key', '');
  });

  const [aiProvider, setAiProvider] = useState(() => {
    return loadNamespacedState('qn_ai_provider', 'mock');
  });

  const [aiModel, setAiModel] = useState(() => {
    return loadNamespacedState('qn_ai_model', 'gemini-2.5-flash');
  });

  const [aiSystemPrompt, setAiSystemPrompt] = useState(() => {
    return loadNamespacedState('qn_ai_system_prompt', 'You are a clinical quality auditor and NABH 6th Edition compliance consultant. Generate precise compliance reports, audit checklists, SOP text, and CAPA corrective measures for hospital administration.');
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
    return safeJsonParse('qn_vendor_credentials', { username: "admin", password: "123" });
  });

  const [vendorEmployees, setVendorEmployees] = useState(() => {
    const defaultEmployees = [
      { id: "emp-1", name: "Aarav Sharma", email: "aarav@vaidyaq.com", role: "Support Agent", assignedClients: ["demo-hosp"], username: "aarav", password: "123", permissions: ["view_crm", "resolve_tickets"] },
      { id: "emp-2", name: "Priya Nair", email: "priya@vaidyaq.com", role: "Billing Manager", assignedClients: ["demo-hosp"], username: "priya", password: "123", permissions: ["view_crm", "manage_finance"] }
    ];
    return safeJsonParse('qn_vendor_employees', defaultEmployees);
  });

  // Support Tickets Workspace
  const [supportTickets, setSupportTickets] = useState(() => {
    const defaultTickets = [
      { id: "tick-1", clientId: "demo-hosp", clientName: "City Central Metro Hospital", title: "Gemini SOP generation slow responses", description: "SOP generation takes longer than 15s to draft. Please verify API rate limits.", priority: "Medium", status: "Open", assignedOperator: "Aarav Sharma", createdAt: "2026-06-11 09:12", sequenceCode: "TS-1002" },
      { id: "tick-2", clientId: "demo-hosp", clientName: "City Central Metro Hospital", title: "Indian GST billing checkout failed", description: "Attempted to pay using simulation button but page returned an empty alert box.", priority: "High", status: "Open", assignedOperator: "Aarav Sharma", createdAt: "2026-06-12 11:30", sequenceCode: "TS-1003" }
    ];
    return safeJsonParse('qn_support_tickets', defaultTickets);
  });

  // Simulated Email Notification Archive
  const [emailLogs, setEmailLogs] = useState(() => {
    const defaultMails = [
      { id: "mail-1", recipient: "quality.head@hospital.org", subject: "Welcome to VaidyaQ - 7-Day Free Trial", body: "Hello Dr. Sarah Paul, thank you for signing up to VaidyaQ. Your 7-day trial is now active.", sentAt: "2026-06-09 10:15", category: "Signup" }
    ];
    return safeJsonParse('qn_email_logs', defaultMails);
  });

  // Simulated Payment Transactions Registry
  const [transactions, setTransactions] = useState(() => {
    const defaultTrans = [
      { id: "trans-1", clientId: "demo-hosp", hospitalName: "City Central Metro Hospital", amount: 129999, gst: 23399.82, date: "2026-05-15", status: "Successful", billingCycle: "H1 2026" },
      { id: "trans-2", clientId: "demo-hosp", hospitalName: "City Central Metro Hospital", amount: 55999, gst: 10079.82, date: "2026-06-01", status: "Successful", billingCycle: "H1 2026" }
    ];
    return safeJsonParse('qn_transactions', defaultTrans);
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

  const [complianceFlows, setComplianceFlows] = useState(() => {
    return loadNamespacedState('qn_compliance_flows', defaultComplianceFlows);
  });

  const [committees, setCommittees] = useState(() => {
    return loadNamespacedState('qn_committees', defaultCommittees);
  });

  const [trainings, setTrainings] = useState(() => {
    return loadNamespacedState('qn_trainings', defaultTrainings);
  });

  const [risks, setRisks] = useState(() => {
    return loadNamespacedState('qn_risks', defaultRisks);
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

  const [sprints, setSprints] = useState(() => {
    return loadNamespacedState('qn_sprints', defaultSprints);
  });

  const [reportsList, setReportsList] = useState(() => {
    return loadNamespacedState('qn_reports_list', defaultReportsList);
  });

  const [taskActivities, setTaskActivities] = useState(() => {
    return loadNamespacedState('qn_task_activities', defaultTaskActivities);
  });

  const defaultAiSettings = {
    enabled: false,
    provider: 'mock',
    defaultModel: 'gemini-2.5-flash',
    monthlyTokenLimit: 1000000,
    monthlySpendLimit: 10,
    memoryEnabled: false,
    memoryScope: 'hospital',
    allowedRoles: ['Super Admin', 'Quality Head'],
    dataSharingConsent: false,
    monthlyUsageTokens: 0,
    monthlyUsageSpend: 0,
    providerStatus: 'Disabled'
  };

  const [aiSettings, setAiSettings] = useState(() => {
    return loadNamespacedState('qn_ai_settings', defaultAiSettings);
  });

  const [aiMemory, setAiMemory] = useState(() => {
    return loadNamespacedState('qn_ai_memory', []);
  });

  const [aiOutputs, setAiOutputs] = useState(() => {
    return loadNamespacedState('qn_ai_outputs', []);
  });

  const [aiUsageLogs, setAiUsageLogs] = useState(() => {
    return loadNamespacedState('qn_ai_usage_logs', []);
  });

  const [aiSafetyLogs, setAiSafetyLogs] = useState(() => {
    return loadNamespacedState('qn_ai_safety_logs', []);
  });

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (isConfigured && activeHospitalId) {
      console.log(`[QualiNABHContext] Attaching Firestore subscriptions for hospital: ${activeHospitalId}`);

      const unsubDocs = firestoreService.subscribeToCollection(activeHospitalId, 'documents', setDocuments);
      const unsubAudits = firestoreService.subscribeToCollection(activeHospitalId, 'audits', setAudits);
      const unsubCapas = firestoreService.subscribeToCollection(activeHospitalId, 'capas', setCapaItems);
      const unsubIncidents = firestoreService.subscribeToCollection(activeHospitalId, 'incidents', setIncidents);
      const unsubLicenses = firestoreService.subscribeToCollection(activeHospitalId, 'licenses', setLicenses);
      const unsubTasks = firestoreService.subscribeToCollection(activeHospitalId, 'tasks', setTasks);
      const unsubAuditLogs = firestoreService.subscribeToCollection(activeHospitalId, 'auditLogs', setAuditLogs);
      
      const unsubStandards = firestoreService.subscribeToCollection(activeHospitalId, 'standards', (data) => {
        if (data && data.length > 0) setStandards(data);
      });
      const unsubFlows = firestoreService.subscribeToCollection(activeHospitalId, 'compliance_flows', (data) => {
        if (data && data.length > 0) setComplianceFlows(data);
      });
      const unsubCommittees = firestoreService.subscribeToCollection(activeHospitalId, 'committees', (data) => {
        if (data && data.length > 0) setCommittees(data);
      });
      const unsubTrainings = firestoreService.subscribeToCollection(activeHospitalId, 'trainings', setTrainings);
      const unsubRisks = firestoreService.subscribeToCollection(activeHospitalId, 'risks', setRisks);
      const unsubSprints = firestoreService.subscribeToCollection(activeHospitalId, 'sprints', setSprints);
      const unsubReports = firestoreService.subscribeToCollection(activeHospitalId, 'reports_list', setReportsList);
      const unsubActivities = firestoreService.subscribeToCollection(activeHospitalId, 'task_activities', setTaskActivities);

      // AI Root Collections
      const aiFilters = [{ field: 'hospitalId', operator: '==', value: activeHospitalId }];
      const unsubAiSettings = firestoreService.subscribeToRootCollection('ai_settings', (data) => {
        if (data && data.length > 0) setAiSettings(data[0]);
      }, aiFilters);
      const unsubAiMemory = firestoreService.subscribeToRootCollection('ai_memory', setAiMemory, aiFilters);
      const unsubAiOutputs = firestoreService.subscribeToRootCollection('ai_outputs', setAiOutputs, aiFilters);
      const unsubAiUsage = firestoreService.subscribeToRootCollection('ai_usage_logs', setAiUsageLogs, aiFilters);
      const unsubAiSafety = firestoreService.subscribeToRootCollection('ai_safety_logs', setAiSafetyLogs, aiFilters);

      return () => {
        if (unsubDocs) unsubDocs();
        if (unsubAudits) unsubAudits();
        if (unsubCapas) unsubCapas();
        if (unsubIncidents) unsubIncidents();
        if (unsubLicenses) unsubLicenses();
        if (unsubTasks) unsubTasks();
        if (unsubAuditLogs) unsubAuditLogs();
        if (unsubStandards) unsubStandards();
        if (unsubFlows) unsubFlows();
        if (unsubCommittees) unsubCommittees();
        if (unsubTrainings) unsubTrainings();
        if (unsubRisks) unsubRisks();
        if (unsubSprints) unsubSprints();
        if (unsubReports) unsubReports();
        if (unsubActivities) unsubActivities();
        if (unsubAiSettings) unsubAiSettings();
        if (unsubAiMemory) unsubAiMemory();
        if (unsubAiOutputs) unsubAiOutputs();
        if (unsubAiUsage) unsubAiUsage();
        if (unsubAiSafety) unsubAiSafety();
      };
    }
  }, [isConfigured, activeHospitalId]);

  // Sync AI states with local storage (namespaced)
  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_ai_settings`, JSON.stringify(aiSettings));
    }
  }, [aiSettings, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_ai_memory`, JSON.stringify(aiMemory));
    }
  }, [aiMemory, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_ai_outputs`, JSON.stringify(aiOutputs));
    }
  }, [aiOutputs, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_ai_usage_logs`, JSON.stringify(aiUsageLogs));
    }
  }, [aiUsageLogs, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_ai_safety_logs`, JSON.stringify(aiSafetyLogs));
    }
  }, [aiSafetyLogs, activePrefix, canSave]);

  // Auto-heal legacy user sessions missing hospitalId or having string 'undefined'
  useEffect(() => {
    if (currentUser) {
      const email = currentUser.email ? currentUser.email.toLowerCase() : '';
      let correctHospitalId = currentUser.hospitalId;
      
      if (!correctHospitalId || correctHospitalId === 'undefined') {
        if (email === 'demo@vaidyaq.com') {
          correctHospitalId = 'demo-hosp';
        } else if (email === 'quality.head@hospital.org' || email === 'director@hospital.org') {
          correctHospitalId = 'sarah-hosp';
        } else {
          // Look up in clientsList
          const client = (clientsList || []).find(c => c && c.email && c.email.toLowerCase() === email);
          if (client) {
            correctHospitalId = client.hospitalId;
          } else {
            // Check sub users
            const globalSubUsers = safeJsonParse('qn_global_sub_users', []);
            const subUser = (globalSubUsers || []).find(u => u && u.email && u.email.toLowerCase() === email);
            if (subUser && subUser.parentEmail) {
              const parentClient = (clientsList || []).find(c => c && c.email && c.email.toLowerCase() === subUser.parentEmail.toLowerCase());
              correctHospitalId = parentClient ? parentClient.hospitalId : 'demo-hosp';
            } else {
              correctHospitalId = 'demo-hosp'; // default fallback
            }
          }
        }
        
        // Auto-heal
        setCurrentUser(prev => {
          if (!prev) return prev;
          if (prev.hospitalId === correctHospitalId) return prev;
          return { ...prev, hospitalId: correctHospitalId };
        });
      }
    }
  }, [currentUser, clientsList]);

  // Sync states with local storage (namespaced if user is logged in)
  useEffect(() => {
    localStorage.setItem('qn_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('qn_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_hospital_mode`, hospitalMode);
    }
  }, [hospitalMode, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_hospital_name`, hospitalName);
    }
  }, [hospitalName, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_hospital_beds`, hospitalBeds);
    }
  }, [hospitalBeds, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_hospital_tier`, hospitalTier);
    }
  }, [hospitalTier, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_active_depts`, JSON.stringify(activeDepts));
    }
  }, [activeDepts, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_onboarding_steps`, JSON.stringify(onboardingSteps));
    }
  }, [onboardingSteps, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_onboarding_step`, String(onboardingStep));
    }
  }, [onboardingStep, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_standards`, JSON.stringify(standards));
    }
  }, [standards, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_selected_program`, selectedProgram);
    }
  }, [selectedProgram, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_documents`, JSON.stringify(documents));
    }
  }, [documents, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_audits`, JSON.stringify(audits));
    }
  }, [audits, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_capas`, JSON.stringify(capaItems));
    }
  }, [capaItems, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_incidents`, JSON.stringify(incidents));
    }
  }, [incidents, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_compliance_flows`, JSON.stringify(complianceFlows));
    }
  }, [complianceFlows, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_committees`, JSON.stringify(committees));
    }
  }, [committees, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_trainings`, JSON.stringify(trainings));
    }
  }, [trainings, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_risks`, JSON.stringify(risks));
    }
  }, [risks, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_licenses`, JSON.stringify(licenses));
      
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

          // Auto-daemon: Generate high-priority renewal task if within 30 days and no task exists
          const taskTitle = `Renew Statutory License: ${lic.name}`;
          const alreadyHasTask = (tasks || []).some(t => t && t.title === taskTitle && !["Completed", "Done", "Closed"].includes(t.status));

          if (diffDays <= 30 && !alreadyHasTask) {
            console.log(`[Auto-Daemon] Expiry Alert: "${lic.name}" expires in ${diffDays} days. Auto-generating renewal task.`);
            addHospitalTask({
              title: taskTitle,
              assignedTo: lic.responsible || 'Administration',
              assignedToEmail: activeEmail,
              department: 'Quality Control',
              dueDate: lic.expiryDate,
              priority: 'High'
            });
          }
        });
      }
    }
  }, [licenses, tasks, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_tasks`, JSON.stringify(tasks));
    }
  }, [tasks, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_sprints`, JSON.stringify(sprints));
    }
  }, [sprints, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_reports_list`, JSON.stringify(reportsList));
    }
  }, [reportsList, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      localStorage.setItem(`${activePrefix}qn_task_activities`, JSON.stringify(taskActivities));
    }
  }, [taskActivities, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_audit_logs`, JSON.stringify(auditLogs));
    }
  }, [auditLogs, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_quality_indicators`, JSON.stringify(qualityIndicators));
    }
  }, [qualityIndicators, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_is_subscribed`, JSON.stringify(isSubscribed));
    }
  }, [isSubscribed, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_trial_start_date`, trialStartDate);
    }
  }, [trialStartDate, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_gemini_api_key`, geminiApiKey);
    }
  }, [geminiApiKey, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_openai_api_key`, openaiApiKey);
    }
  }, [openaiApiKey, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_anthropic_api_key`, anthropicApiKey);
    }
  }, [anthropicApiKey, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_ai_provider`, aiProvider);
    }
  }, [aiProvider, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_ai_model`, aiModel);
    }
  }, [aiModel, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_ai_system_prompt`, aiSystemPrompt);
    }
  }, [aiSystemPrompt, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_hospital_logo`, hospitalLogo);
    }
  }, [hospitalLogo, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_team_members`, JSON.stringify(teamMembers));
    }
  }, [teamMembers, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_compliance_feed`, JSON.stringify(complianceFeed));
    }
  }, [complianceFeed, activePrefix, canSave]);

  useEffect(() => {
    if (canSave) {
      localStorage.setItem(`${activePrefix}qn_feed_notifications`, JSON.stringify(feedNotifications));
    }
  }, [feedNotifications, activePrefix, canSave]);

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

  // Reload namespaced states when currentUser or activeHospitalId changes
  useEffect(() => {
    if (currentUser) {
      setIsReloading(true);
      const activeEmail = currentUser.parentEmail || currentUser.email;
      const prefix = activeEmail ? `${activeEmail}_` : '';
      
      const getSaved = (key, defaultVal) => {
        const hospPrefix = activeHospitalId ? `hosp_${activeHospitalId}_` : '';
        let saved = localStorage.getItem(hospPrefix + key);
        if (!saved) {
          saved = localStorage.getItem(prefix + key);
        }
        let result;
        if (saved) {
          try { result = JSON.parse(saved); } catch(e) { result = saved; }
        } else {
          // Fallbacks
          const isDemo = activeEmail === 'demo@vaidyaq.com' || activeEmail === 'quality.head@hospital.org';
          if (isDemo) {
            const globalSaved = localStorage.getItem(key);
            if (globalSaved) {
              try { result = JSON.parse(globalSaved); } catch(e) {}
            }
            if (result === undefined) {
              result = defaultVal;
            }
          } else {
            if (key === 'qn_standards') {
              result = defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" }));
            } else if (key === 'qn_licenses') {
              result = defaultLicenses.map(l => ({
                ...l,
                issueDate: '',
                expiryDate: '',
                responsible: (l.responsible && typeof l.responsible === 'string' && l.responsible.includes('(')) ? l.responsible.substring(l.responsible.indexOf('(') + 1, l.responsible.length - 1) : (l.responsible || 'Administration'),
                status: 'Expired'
              }));
            } else {
              result = Array.isArray(defaultVal) ? [] : typeof defaultVal === 'object' ? {} : defaultVal;
            }
          }
        }
        return assertNoMockDataForProductionTenant(activeEmail, key, result);
      };

      setHospitalMode(getSaved('qn_hospital_mode', 'active'));
      setHospitalName(getSaved('qn_hospital_name', 'City Central Metro Hospital'));
      setHospitalBeds(String(getSaved('qn_hospital_beds', '120')));
      setHospitalTier(getSaved('qn_hospital_tier', 'Full Accreditation'));
      setActiveDepts(getSaved('qn_active_depts', ['ICU', 'Pharmacy', 'Emergency', 'OT', 'Housekeeping / Facilities', 'HR / Staffing']));
      setOnboardingSteps(getSaved('qn_onboarding_steps', { identity: false, departments: false, importTemplates: false, firstSop: false }));
      setOnboardingStep(Number(getSaved('qn_onboarding_step', 1)));
      setStandards(getSaved('qn_standards', defaultStandards));
      setIsSubscribed(getSaved('qn_is_subscribed', false));
      setTrialStartDate(getSaved('qn_trial_start_date', new Date().toISOString()));
      setGeminiApiKey(getSaved('qn_gemini_api_key', ''));
      setOpenaiApiKey(getSaved('qn_openai_api_key', ''));
      setAnthropicApiKey(getSaved('qn_anthropic_api_key', ''));
      setAiProvider(getSaved('qn_ai_provider', 'mock'));
      setAiModel(getSaved('qn_ai_model', 'gemini-2.5-flash'));
      setAiSystemPrompt(getSaved('qn_ai_system_prompt', 'You are a clinical quality auditor and NABH 6th Edition compliance consultant. Generate precise compliance reports, audit checklists, SOP text, and CAPA corrective measures for hospital administration.'));
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
      setAiSettings(getSaved('qn_ai_settings', defaultAiSettings));
      setAiMemory(getSaved('qn_ai_memory', []));
      setAiOutputs(getSaved('qn_ai_outputs', []));
      setAiUsageLogs(getSaved('qn_ai_usage_logs', []));
      setAiSafetyLogs(getSaved('qn_ai_safety_logs', []));
    }
  }, [currentUser, activeHospitalId]);

  // Clear reloading flag and update prevPrefix once reloading state renders
  useEffect(() => {
    if (isReloading) {
      setIsReloading(false);
      prevPrefixRef.current = activePrefix;
    }
  }, [isReloading, activePrefix]);

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
      "am@sociium.biz",
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

    setClientsList(prev => [newClient, ...(prev || [])]);

    // Set as active client context settings
    setHospitalName(hospitalNameInput);
    setHospitalBeds(String(bedsInput));
    setTrialStartDate(signup);
    setIsSubscribed(false);
    setHospitalLogo('🛡️');
    setHospitalTier(Number(bedsInput) <= 20 ? 'Tier A: Clinics' : Number(bedsInput) <= 150 ? 'Tier B: Secondary Care' : 'Tier C: Tertiary Chains');
    
    // Set first team member as Super Admin
    const superAdminUser = { email: email, name: "Hospital Director", role: "Super Admin", department: "Board", hospitalId: newHospitalId };
    setTeamMembers([superAdminUser]);
    setCurrentUser(superAdminUser);

    // Reset namespaced states to empty for a clean slate
    setStandards(defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" })));
    setDocuments([]);
    setAudits([]);
    setCapaItems([]);
    setIncidents([]);
    setTasks([]);
    setQualityIndicators([]);
    setRisks([]);
    setLicenses(defaultLicenses.map(l => ({
      ...l,
      issueDate: '',
      expiryDate: '',
      responsible: (l.responsible && typeof l.responsible === 'string' && l.responsible.includes('(')) ? l.responsible.substring(l.responsible.indexOf('(') + 1, l.responsible.length - 1) : (l.responsible || 'Administration'),
      status: 'Expired'
    })));
    setTrainings([]);
    setCommittees(defaultCommittees.map(c => ({
      ...c,
      meetings: []
    })));
    setComplianceFlows(defaultComplianceFlows.map(flow => ({
      ...flow,
      stages: {
        policy: "Not Started",
        sop: "Not Started",
        training: "Not Started",
        implementation: "Not Started",
        documentation: "Not Started",
        audit: "Not Started",
        findings: "Not Started",
        capa: "Not Started",
        review: "Not Started",
        improvement: "Not Started",
        updates: "Not Started"
      },
      linkedSops: [],
      linkedForms: [],
      linkedTraining: [],
      linkedAudits: [],
      linkedCapas: [],
      linkedIncidents: []
    })));
    setAuditLogs([]);
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

  // Helper to dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper to complete the subscription logic upon successful payment verification
  const finalizeSubscription = (cycle, amount, transactionId) => {
    setIsSubscribed(true);
    setForcePaymentScreen(false);
    setTrialStartDate(null); // Clear trial start to denote active paid subscription

    const termDays = cycle === 'quarterly' ? 90 : 365;
    const newExpiry = new Date(Date.now() + termDays * 24 * 60 * 60 * 1000).toISOString();
    const gstVal = Math.round(amount * 0.18 / 1.18); // Amount includes GST from serverless backend
    const basePrice = amount - gstVal;

    const newTrans = {
      id: transactionId,
      clientId: currentUser?.email || "unknown",
      hospitalName: hospitalName,
      amount: basePrice,
      gst: gstVal,
      date: new Date().toISOString().slice(0, 10),
      status: "Successful",
      billingCycle: cycle === 'quarterly' ? "Quarterly Plan" : "Annual Plan"
    };

    setTransactions(prev => [newTrans, ...prev]);

    setClientsList(prev => (prev || []).map(c => {
      if (c && c.email === currentUser?.email) {
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

    logActivity(`Subscription payment of ₹${amount.toLocaleString()} processed successfully via Razorpay (Txn ID: ${transactionId})`);

    // Send payment confirmation email
    sendSimulatedEmail(
      currentUser?.email || "unknown",
      "VaidyaQ Subscription Active - Payment Received",
      `Hello, we have successfully received your payment of ₹${amount.toLocaleString()} (including GST). Your ${cycle} subscription is active until ${new Date(newExpiry).toLocaleDateString('en-IN')}.`,
      "Payment"
    );
  };

  // Purchase/Renew subscription (cycle can be 'quarterly' or 'annually')
  const purchaseSubscription = async (cycle = 'annually') => {
    try {
      logActivity(`Initiating subscription purchase flow for ${cycle} cycle...`);
      
      // 1. Create order on backend serverless function
      const response = await fetch("/.netlify/functions/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beds: hospitalBeds,
          cycle: cycle,
          email: currentUser?.email || "anonymous",
          name: currentUser?.name || "Hospital Admin"
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      const orderData = await response.json();
      const { orderId, amount, currency, isSandbox, keyId } = orderData;

      // 2. Handle Sandbox Checkout Fallback (if keys are not configured on backend)
      if (isSandbox) {
        const proceedSandbox = window.confirm(
          `[VaidyaQ Developer Sandbox]\n\nRazorpay keys are not configured on the server. Would you like to simulate a successful mock payment of ₹${amount.toLocaleString()} for the ${cycle} plan?`
        );
        if (!proceedSandbox) {
          logActivity(`Sandbox payment flow cancelled by user.`);
          return;
        }

        // Call verification endpoint for sandbox order
        const verifyRes = await fetch("/.netlify/functions/verify-razorpay-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isSandbox: true,
            razorpay_order_id: orderId
          })
        });

        if (!verifyRes.ok) {
          throw new Error("Sandbox payment verification failed.");
        }

        const verifyData = await verifyRes.json();
        if (verifyData.verified) {
          finalizeSubscription(cycle, amount, orderId);
        } else {
          throw new Error("Sandbox payment signature was not verified.");
        }
        return;
      }

      // 3. Load Razorpay script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay checkout failed to load. Please check your internet connection.");
        return;
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amount * 100, // Amount expected in paise
        currency: currency,
        name: "VaidyaQ AI",
        description: `${cycle === 'quarterly' ? 'Quarterly' : 'Annual'} Subscription renewal`,
        image: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>",
        order_id: orderId,
        handler: async function (response) {
          try {
            logActivity(`Razorpay payment successful. Verifying signature...`);
            
            // Call verification endpoint
            const verifyRes = await fetch("/.netlify/functions/verify-razorpay-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              throw new Error("Payment signature verification failed.");
            }

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              finalizeSubscription(cycle, amount, response.razorpay_payment_id);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error(err);
            alert(`Payment verification error: ${err.message}`);
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || ""
        },
        theme: {
          color: "#0d9488"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        logActivity(`Razorpay payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error("[purchaseSubscription] Error:", error);
      alert(`Checkout failed: ${error.message}`);
      logActivity(`Subscription checkout failed: ${error.message}`);
    }
  };


  const updateHospitalProfile = (logo, name, beds, address, regId) => {
    setHospitalLogo(logo);
    setHospitalName(name);
    setHospitalBeds(String(beds));
    setClientsList(prev => (prev || []).map(c => {
      if (c && (c.hospitalName === hospitalName || c.email === currentUser?.email)) {
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
    const globalSubUsers = safeJsonParse('qn_global_sub_users', []);
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
      setClientsList(prev => (prev || []).map(c => {
        if (c && c.email && c.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
          return { ...c, password: newPassword };
        }
        return c;
      }));
      logActivity("Updated owner password.");
      return { success: true };
    }

    // 2. Sub-user change
    const globalSubUsers = safeJsonParse('qn_global_sub_users', []);
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
      const globalSubUsers = safeJsonParse('qn_global_sub_users', []);
      const updatedList = globalSubUsers.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, name } : u);
      localStorage.setItem('qn_global_sub_users', JSON.stringify(updatedList));
    }
    logActivity(`Updated profile name to ${name}`);
  };

  // ── AI SYSTEM HELPER ACTIONS ──

  // Validate API Key
  const validateAiKey = async (provider, apiKey) => {
    if (!apiKey) return { success: false, error: "API Key is empty." };
    if (provider === 'mock') return { success: true };
    
    // Simulate backend connection validation request
    try {
      let endpoint = '';
      let headers = {};
      if (provider === 'google') {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      } else if (provider === 'openai') {
        endpoint = 'https://api.openai.com/v1/models';
        headers = { 'Authorization': `Bearer ${apiKey}` };
      } else if (provider === 'anthropic') {
        endpoint = 'https://api.anthropic.com/v1/models';
        headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
      } else {
        // OpenRouter or Custom
        endpoint = 'https://openrouter.ai/api/v1/models';
        headers = { 'Authorization': `Bearer ${apiKey}` };
      }
      
      const res = await fetch(endpoint, { method: 'GET', headers });
      if (res.status === 200 || res.ok) {
        return { success: true };
      } else {
        const errText = await res.text();
        return { success: false, error: `Validation failed with status ${res.status}: ${errText.substring(0, 100)}` };
      }
    } catch (e) {
      return { success: false, error: `Network/CORS error validating token: ${e.message}` };
    }
  };

  // Encrypt and Save Provider Key
  const saveAiKey = async (provider, apiKey) => {
    const testResult = await validateAiKey(provider, apiKey);
    if (!testResult.success) {
      setAiSettings(prev => ({ ...prev, providerStatus: 'Invalid Key' }));
      return testResult;
    }

    // Encryption simulation: Simple XOR/Base64 to keep key secure from plain text reads in localstorage
    const encryptSim = (text) => {
      return btoa(text.split('').map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ (5 + index % 10))).join(''));
    };

    const encryptedVal = encryptSim(apiKey);
    const activeEmail = currentUser.parentEmail || currentUser.email;
    const prefix = activeEmail ? `${activeEmail}_` : '';
    
    localStorage.setItem(`${prefix}qn_encrypted_key_${provider}`, encryptedVal);
    
    setAiSettings(prev => ({
      ...prev,
      provider: provider,
      providerStatus: 'Connected',
      enabled: true
    }));

    logActivity(`Configured secure API token for AI provider: ${provider}`);
    return { success: true };
  };

  // Delete API Key
  const deleteAiKey = (provider) => {
    const activeEmail = currentUser.parentEmail || currentUser.email;
    const prefix = activeEmail ? `${activeEmail}_` : '';
    localStorage.removeItem(`${prefix}qn_encrypted_key_${provider}`);
    
    setAiSettings(prev => ({
      ...prev,
      provider: 'mock',
      providerStatus: 'Disabled',
      enabled: false
    }));

    logActivity(`Deleted API token configuration for AI provider: ${provider}`);
  };

  // Load decrypt key simulation
  const getDecryptedKey = (provider) => {
    const activeEmail = currentUser ? (currentUser.parentEmail || currentUser.email) : null;
    if (!activeEmail) return '';
    const prefix = activeEmail ? `${activeEmail}_` : '';
    const encrypted = localStorage.getItem(`${prefix}qn_encrypted_key_${provider}`);
    if (!encrypted) return '';
    try {
      const decryptSim = (text) => {
        return atob(text).split('').map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ (5 + index % 10))).join('');
      };
      return decryptSim(encrypted);
    } catch(e) {
      return '';
    }
  };

  // Update Settings
  const updateAiSettings = (newSettings) => {
    setAiSettings(prev => ({ ...prev, ...newSettings }));
    logActivity("Updated AI settings parameters.");
  };

  // Memory CRUD
  const addAiMemory = (scope, scopeId, title, content, allowedRoles = [], allowedUserIds = []) => {
    const newMemory = {
      memoryId: `mem-${Date.now()}`,
      hospitalId: hospitalName,
      scope,
      scopeId: scopeId || '',
      title,
      content,
      allowedRoles: allowedRoles || [],
      allowedUserIds: allowedUserIds || [],
      createdBy: currentUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAiMemory(prev => [newMemory, ...prev]);
    logActivity(`Added AI memory item: "${title}" under scope: ${scope}`);
    return newMemory.memoryId;
  };

  const deleteAiMemory = (memoryId) => {
    setAiMemory(prev => prev.filter(m => m.memoryId !== memoryId));
    logActivity("Deleted AI memory item.");
  };

  const clearAiMemory = (scope, scopeId) => {
    setAiMemory(prev => prev.filter(m => !(m.scope === scope && m.scopeId === scopeId)));
    logActivity(`Cleared AI memories for scope: ${scope}`);
  };

  // AI Outputs (Drafts) & Review Workflow
  const createAiOutput = (module, agentType, content, sourceRecordIds = [], structuredOutput = null) => {
    const newOutput = {
      outputId: `out-${Date.now()}`,
      hospitalId: hospitalName,
      userId: currentUser.email,
      module,
      agentType,
      content,
      structuredOutput,
      sourceRecordIds: sourceRecordIds || [],
      status: 'draft',
      reviewedBy: '',
      reviewedAt: '',
      createdAt: new Date().toISOString()
    };
    setAiOutputs(prev => [newOutput, ...prev]);
    logActivity(`Logged AI draft output for ${module} (${agentType} Agent)`);
    return newOutput;
  };

  const updateAiOutputStatus = (outputId, status, reviewerName) => {
    setAiOutputs(prev => prev.map(out => {
      if (out.outputId === outputId) {
        if (status === 'approved') {
          logActivity(`Approved AI-generated output for ${out.module} (${out.agentType})`);
        } else if (status === 'rejected') {
          logActivity(`Rejected AI-generated output for ${out.module} (${out.agentType})`);
        }
        
        return {
          ...out,
          status,
          reviewedBy: reviewerName || currentUser.name,
          reviewedAt: new Date().toISOString()
        };
      }
      return out;
    }));
  };

  const deleteAiOutput = (outputId) => {
    setAiOutputs(prev => prev.filter(out => out.outputId !== outputId));
  };

  const logAiUsage = (provider, model, module, agentType, inputTokens, outputTokens) => {
    const costPer1kInput = model.includes('gpt-4') ? 0.005 : 0.00015;
    const costPer1kOutput = model.includes('gpt-4') ? 0.015 : 0.0006;
    const estimatedCost = (inputTokens / 1000) * costPer1kInput + (outputTokens / 1000) * costPer1kOutput;

    const newUsage = {
      usageId: `usage-${Date.now()}`,
      hospitalId: hospitalName,
      userId: currentUser.email,
      provider,
      model,
      module,
      agentType,
      inputTokens,
      outputTokens,
      estimatedCost,
      success: true,
      createdAt: new Date().toISOString()
    };

    setAiUsageLogs(prev => [newUsage, ...prev]);
    
    setAiSettings(prev => ({
      ...prev,
      monthlyUsageTokens: (prev.monthlyUsageTokens || 0) + inputTokens + outputTokens,
      monthlyUsageSpend: (prev.monthlyUsageSpend || 0) + estimatedCost
    }));
  };

  const logAiSafety = (module, agentType, issueType, reason, blocked = true) => {
    const newSafetyLog = {
      safetyLogId: `safety-${Date.now()}`,
      hospitalId: hospitalName,
      userId: currentUser.email,
      module,
      agentType,
      issueType,
      blocked,
      reason,
      createdAt: new Date().toISOString()
    };
    setAiSafetyLogs(prev => [newSafetyLog, ...prev]);
    logActivity(`⚠️ AI SAFETY GUARDRAIL: Blocked sensitive request in ${module} (${issueType})`);
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
      status: taskObj.status || 'To Do'
    };
    if (isConfigured && activeHospitalId) {
      firestoreService.createDocument(activeHospitalId, 'tasks', newTask);
    } else {
      setTasks(prev => [newTask, ...prev]);
    }
    logActivity(`Assigned task: "${taskObj.title}" to ${taskObj.assignedTo}`);
    return newTask.id;
  };

  const updateHospitalTaskStatus = (taskId, status) => {
    if (isConfigured && activeHospitalId) {
      const t = tasks.find(item => item.id === taskId);
      if (t) {
        firestoreService.updateDocument(activeHospitalId, 'tasks', taskId, { ...t, status });
        if (status === "Completed" || status === "Done" || status === "Closed") {
          if (t.capaId) {
            const capa = capaItems.find(c => c.id === t.capaId);
            if (capa) {
              firestoreService.updateDocument(activeHospitalId, 'capas', t.capaId, { ...capa, status: "Closed", closureApprovedBy: "System Autoclose" });
            }
            const flow = complianceFlows.find(f => f.linkedCapas && f.linkedCapas.includes(t.capaId));
            if (flow) {
              const updatedStages = {
                ...flow.stages,
                capa: "Completed",
                review: "Completed",
                improvement: "Completed",
                updates: "Pending"
              };
              firestoreService.updateDocument(activeHospitalId, 'compliance_flows', flow.id, { ...flow, stages: updatedStages });
            }
          }
          if (t.incidentId) {
            const inc = incidents.find(i => i.id === t.incidentId);
            if (inc) {
              firestoreService.updateDocument(activeHospitalId, 'incidents', t.incidentId, { ...inc, status: "Closed" });
            }
          }
          if (t.meetingId && t.actionItemId) {
            const comm = committees.find(c => c.id === t.committeeId);
            if (comm) {
              const updatedMeetings = (comm.meetings || []).map(m => {
                if (m.id === t.meetingId) {
                  const updatedActions = (m.actionItems || []).map(act => {
                    if (act.id === t.actionItemId) return { ...act, status: "Completed" };
                    return act;
                  });
                  return { ...m, actionItems: updatedActions };
                }
                return m;
              });
              firestoreService.updateDocument(activeHospitalId, 'committees', comm.id, { ...comm, meetings: updatedMeetings });
            }
          }
        }
      }
    } else {
      setTasks(prev => {
        return prev.map(t => {
          if (t.id === taskId) {
            logActivity(`Updated task "${t.title}" status to ${status}`);
            
            if (status === "Completed" || status === "Done" || status === "Closed") {
              if (t.capaId) {
                setCapaItems(prevCapa => prevCapa.map(c => {
                  if (c.id === t.capaId && c.status !== "Closed") {
                    logActivity(`Closed CAPA ${c.id} automatically via task completion`);
                    return { ...c, status: "Closed", closureApprovedBy: "System Autoclose" };
                  }
                  return c;
                }));
                setComplianceFlows(prevFlows => prevFlows.map(flow => {
                  if (flow.linkedCapas && flow.linkedCapas.includes(t.capaId)) {
                    return {
                      ...flow,
                      stages: {
                        ...flow.stages,
                        capa: "Completed",
                        review: "Completed",
                        improvement: "Completed",
                        updates: "Pending"
                      }
                    };
                  }
                  return flow;
                }));
              }
              if (t.incidentId) {
                setIncidents(prevInc => prevInc.map(inc => {
                  if (inc.id === t.incidentId && inc.status !== "Closed") {
                    logActivity(`Closed Incident ${inc.id} automatically via task completion`);
                    return { ...inc, status: "Closed" };
                  }
                  return inc;
                }));
              }
              if (t.meetingId && t.actionItemId) {
                setCommittees(prevComm => prevComm.map(c => {
                  if (c.id === t.committeeId) {
                    const updatedMeetings = (c.meetings || []).map(m => {
                      if (m.id === t.meetingId) {
                        const updatedActions = (m.actionItems || []).map(act => {
                          if (act.id === t.actionItemId) return { ...act, status: "Completed" };
                          return act;
                        });
                        return { ...m, actionItems: updatedActions };
                      }
                      return m;
                    });
                    return { ...c, meetings: updatedMeetings };
                  }
                  return c;
                }));
              }
            }
            return { ...t, status };
          }
          return t;
        });
      });
    }
  };

  const deleteHospitalTask = (taskId) => {
    if (isConfigured && activeHospitalId) {
      firestoreService.deleteDocument(activeHospitalId, 'tasks', taskId);
    } else {
      setTasks(prev => {
        const taskObj = prev.find(t => t.id === taskId);
        if (taskObj) {
          logActivity(`Deleted task: "${taskObj.title}"`);
        }
        return prev.filter(t => t.id !== taskId);
      });
    }
  };

  const addTaskComment = (taskId, commentText, author) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const comments = t.comments || [];
        const newComment = {
          id: `comment-${Date.now()}`,
          author: author || currentUser?.name || "System",
          text: commentText,
          timestamp: new Date().toISOString()
        };
        return { ...t, comments: [...comments, newComment] };
      }
      return t;
    }));
    logActivity(`Added comment on task ${taskId}`);
  };

  const addTaskActivity = (taskId, action, user) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      taskId,
      user: user || currentUser?.name || "System",
      action,
      timestamp: new Date().toISOString()
    };
    setTaskActivities(prev => [newActivity, ...prev]);
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
    setClientsList(prev => (prev || []).map(c => {
      if (c && c.hospitalId === hospId) {
        const isCurrentHosp = c.hospitalName === hospitalName || c.email.toLowerCase() === (currentUser?.parentEmail || currentUser?.email)?.toLowerCase();
        let updatedClient = { ...c, status: statusValue, isSubscribed: statusValue === 'Paid' };
        
        if (statusValue === 'Paid') {
          updatedClient.planExpiryDate = new Date(Date.now() + 365*24*60*60*1000).toISOString();
          if (isCurrentHosp) {
            setIsSubscribed(true);
          }
        } else if (statusValue === 'Expired') {
          updatedClient.trialStartDate = new Date(Date.now() - 8*24*60*60*1000).toISOString();
          updatedClient.planExpiryDate = new Date(Date.now() - 8*24*60*60*1000).toISOString();
          if (isCurrentHosp) {
            setIsSubscribed(false);
            setTrialStartDate(updatedClient.trialStartDate);
          }
        } else if (statusValue === 'Restricted') {
          updatedClient.trialStartDate = new Date(Date.now() - 8*24*60*60*1000).toISOString();
          updatedClient.planExpiryDate = new Date(Date.now() - 8*24*60*60*1000).toISOString();
          if (isCurrentHosp) {
            setIsSubscribed(false);
            setTrialStartDate(updatedClient.trialStartDate);
          }
        } else if (statusValue === 'Active Trial') {
          const nowIso = new Date().toISOString();
          const trialExpiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();
          updatedClient.trialStartDate = nowIso;
          updatedClient.planExpiryDate = trialExpiry;
          if (isCurrentHosp) {
            setIsSubscribed(false);
            setTrialStartDate(nowIso);
          }
        }
        return updatedClient;
      }
      return c;
    }));
    logActivity(`Vendor Admin override client ${hospId} status to: ${statusValue}`);
  };

  const loadDemoData = () => {
    setStandards(defaultStandards);
    setDocuments(defaultDocuments);
    setAudits(defaultAudits);
    setCapaItems(defaultCapas);
    setIncidents(defaultIncidents);
    setTasks(defaultTasks);
    setComplianceFlows(defaultComplianceFlows);
    setCommittees(defaultCommittees);
    setTrainings(defaultTrainings);
    setRisks(defaultRisks);
    setLicenses(defaultLicenses);
    
    // Namespace them to local storage as well
    const prefix = currentUser ? `${currentUser.parentEmail || currentUser.email}_` : '';
    localStorage.setItem(prefix + 'qn_standards', JSON.stringify(defaultStandards));
    localStorage.setItem(prefix + 'qn_documents', JSON.stringify(defaultDocuments));
    localStorage.setItem(prefix + 'qn_audits', JSON.stringify(defaultAudits));
    localStorage.setItem(prefix + 'qn_capas', JSON.stringify(defaultCapas));
    localStorage.setItem(prefix + 'qn_incidents', JSON.stringify(defaultIncidents));
    localStorage.setItem(prefix + 'qn_tasks', JSON.stringify(defaultTasks));
    localStorage.setItem(prefix + 'qn_compliance_flows', JSON.stringify(defaultComplianceFlows));
    localStorage.setItem(prefix + 'qn_committees', JSON.stringify(defaultCommittees));
    localStorage.setItem(prefix + 'qn_trainings', JSON.stringify(defaultTrainings));
    localStorage.setItem(prefix + 'qn_risks', JSON.stringify(defaultRisks));
    localStorage.setItem(prefix + 'qn_licenses', JSON.stringify(defaultLicenses));
    
    logActivity("Populated workspace with complete suite of demo data.");
  };

  const clearWorkspaceData = () => {
    setStandards(defaultStandards.map(s => ({ ...s, score: 0, status: "Not Met" })));
    setDocuments([]);
    setAudits([]);
    setCapaItems([]);
    setIncidents([]);
    setTasks([]);
    setComplianceFlows(defaultComplianceFlows.map(flow => ({
      ...flow,
      stages: {
        policy: "Not Started",
        sop: "Not Started",
        training: "Not Started",
        implementation: "Not Started",
        documentation: "Not Started",
        audit: "Not Started",
        findings: "Not Started",
        capa: "Not Started",
        review: "Not Started",
        improvement: "Not Started",
        updates: "Not Started"
      },
      linkedSops: [],
      linkedForms: [],
      linkedTraining: [],
      linkedAudits: [],
      linkedCapas: [],
      linkedIncidents: []
    })));
    setCommittees(defaultCommittees.map(c => ({ ...c, meetings: [] })));
    setTrainings([]);
    setRisks([]);
    setLicenses(defaultLicenses.map(l => ({
      ...l,
      issueDate: '',
      expiryDate: '',
      responsible: l.responsible.includes('(') ? l.responsible.substring(l.responsible.indexOf('(') + 1, l.responsible.length - 1) : l.responsible,
      status: 'Expired'
    })));
    
    // Namespace them to local storage
    const prefix = currentUser ? `${currentUser.parentEmail || currentUser.email}_` : '';
    localStorage.removeItem(prefix + 'qn_standards');
    localStorage.removeItem(prefix + 'qn_documents');
    localStorage.removeItem(prefix + 'qn_audits');
    localStorage.removeItem(prefix + 'qn_capas');
    localStorage.removeItem(prefix + 'qn_incidents');
    localStorage.removeItem(prefix + 'qn_tasks');
    localStorage.removeItem(prefix + 'qn_compliance_flows');
    localStorage.removeItem(prefix + 'qn_committees');
    localStorage.removeItem(prefix + 'qn_trainings');
    localStorage.removeItem(prefix + 'qn_risks');
    localStorage.removeItem(prefix + 'qn_licenses');
    
    logActivity("Cleared all workspace data to a clean slate.");
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
    if (isConfigured && activeHospitalId) {
      const s = standards.find(item => item.id === standardId);
      if (s) {
        firestoreService.updateDocument(activeHospitalId, 'standards', standardId, { ...s, score, status: statuses[score] });
      }
    } else {
      setStandards(prev => prev.map(s => {
        if (s.id === standardId) {
          logActivity(`Changed standard ${s.id} score to ${score} (${statuses[score]})`);
          return { ...s, score, status: statuses[score] };
        }
        return s;
      }));
    }
  };

  const addDocument = (newDoc) => {
    const docId = `doc-${Date.now()}`;
    const docWithId = { ...newDoc, id: docId, isEncrypted: true };
    
    if (isConfigured && activeHospitalId) {
      firestoreService.createDocument(activeHospitalId, 'documents', docWithId);
      if (newDoc.mappedStandards && newDoc.mappedStandards.length > 0) {
        newDoc.mappedStandards.forEach(stdId => {
          const scan = analyzeEvidenceFile(newDoc.title, newDoc.content || "", stdId);
          if (scan.success) {
            const s = standards.find(item => item.id === stdId);
            if (s) {
              const newScore = Math.max(s.score, scan.score);
              const statuses = { 10: "Fully Met", 5: "Partially Met", 0: "Not Met" };
              firestoreService.updateDocument(activeHospitalId, 'standards', stdId, { ...s, score: newScore, status: statuses[newScore] });
            }
          }
        });
      }
      if (newDoc.mappedPolicyId) {
        const flow = complianceFlows.find(f => f.id === newDoc.mappedPolicyId);
        if (flow) {
          const updatedStages = { ...flow.stages };
          const type = newDoc.type.toLowerCase();
          let updatedSops = [...(flow.linkedSops || [])];
          let updatedForms = [...(flow.linkedForms || [])];
          
          if (type === "policy") {
            updatedStages.policy = "Completed";
          } else if (type === "sop") {
            updatedStages.sop = "Completed";
            if (!updatedSops.includes(docId)) updatedSops.push(docId);
          } else if (type === "form" || type === "checklist" || type === "register") {
            updatedStages.implementation = "Completed";
            updatedStages.documentation = "Completed";
            if (!updatedForms.includes(docId)) updatedForms.push(docId);
          } else if (type === "evidence") {
            updatedStages.documentation = "Completed";
          }
          firestoreService.updateDocument(activeHospitalId, 'compliance_flows', flow.id, {
            ...flow,
            stages: updatedStages,
            linkedSops: updatedSops,
            linkedForms: updatedForms
          });
        }
      }
    } else {
      setDocuments(prev => [docWithId, ...prev]);
      if (newDoc.mappedStandards && newDoc.mappedStandards.length > 0) {
        newDoc.mappedStandards.forEach(stdId => {
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
      if (newDoc.mappedPolicyId) {
        setComplianceFlows(prev => prev.map(flow => {
          if (flow.id === newDoc.mappedPolicyId) {
            const updatedStages = { ...flow.stages };
            const type = newDoc.type.toLowerCase();
            if (type === "policy") {
              updatedStages.policy = "Completed";
            } else if (type === "sop") {
              updatedStages.sop = "Completed";
              const updatedSops = [...(flow.linkedSops || [])];
              if (!updatedSops.includes(docId)) updatedSops.push(docId);
              return { ...flow, stages: updatedStages, linkedSops: updatedSops };
            } else if (type === "form" || type === "checklist" || type === "register") {
              updatedStages.implementation = "Completed";
              updatedStages.documentation = "Completed";
              const updatedForms = [...(flow.linkedForms || [])];
              if (!updatedForms.includes(docId)) updatedForms.push(docId);
              return { ...flow, stages: updatedStages, linkedForms: updatedForms };
            } else if (type === "evidence") {
              updatedStages.documentation = "Completed";
            }
            return { ...flow, stages: updatedStages };
          }
          return flow;
        }));
      }
    }
    logActivity(`Uploaded document: ${newDoc.title} (${newDoc.type})`);
    return docId;
  };

  const updateDocumentDetails = (docId, updatedFields) => {
    if (isConfigured && activeHospitalId) {
      const docObj = documents.find(d => d.id === docId);
      if (docObj) {
        firestoreService.updateDocument(activeHospitalId, 'documents', docId, { ...docObj, ...updatedFields });
      }
    } else {
      setDocuments(prev => prev.map(d => {
        if (d.id === docId) {
          return { ...d, ...updatedFields };
        }
        return d;
      }));
    }
    logActivity(`Updated document ${docId} attributes`);
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
    if (isConfigured && activeHospitalId) {
      firestoreService.createDocument(activeHospitalId, 'audits', auditObj);
    } else {
      setAudits(prev => [auditObj, ...prev]);
    }
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

    let linkedIncidentId = null;
    if (newCapa.source && newCapa.source.startsWith("Incident: ")) {
      linkedIncidentId = newCapa.source.replace("Incident: ", "").trim();
    }

    const taskId = `task-${Date.now()}`;
    const taskObj = {
      id: taskId,
      title: `CAPA Action: ${(newCapa.correctiveAction || '').substring(0, 40)}...`,
      assignedTo: newCapa.responsible,
      dueDate: newCapa.dueDate,
      status: "Pending",
      priority: newCapa.priority,
      capaId: capaId,
      incidentId: linkedIncidentId
    };

    if (isConfigured && activeHospitalId) {
      firestoreService.createDocument(activeHospitalId, 'capas', capaObj);
      firestoreService.createDocument(activeHospitalId, 'tasks', taskObj);

      if (linkedIncidentId) {
        const inc = incidents.find(item => item.id === linkedIncidentId);
        if (inc) {
          firestoreService.updateDocument(activeHospitalId, 'incidents', linkedIncidentId, { ...inc, capaId });
        }
      }

      if (newCapa.mappedPolicyId) {
        const flow = complianceFlows.find(f => f.id === newCapa.mappedPolicyId);
        if (flow) {
          const updatedCapas = [...(flow.linkedCapas || [])];
          if (!updatedCapas.includes(capaId)) updatedCapas.push(capaId);
          const updatedStages = { ...flow.stages, capa: "Pending" };
          firestoreService.updateDocument(activeHospitalId, 'compliance_flows', flow.id, { ...flow, linkedCapas: updatedCapas, stages: updatedStages });
        }
      }
    } else {
      setCapaItems(prev => [capaObj, ...prev]);
      if (linkedIncidentId) {
        setIncidents(prevInc => prevInc.map(inc => {
          if (inc.id === linkedIncidentId) return { ...inc, capaId };
          return inc;
        }));
      }
      setTasks(prev => [taskObj, ...prev]);

      if (newCapa.mappedPolicyId) {
        setComplianceFlows(prev => prev.map(flow => {
          if (flow.id === newCapa.mappedPolicyId) {
            const updatedCapas = [...(flow.linkedCapas || [])];
            if (!updatedCapas.includes(capaId)) updatedCapas.push(capaId);
            const updatedStages = { ...flow.stages, capa: "Pending" };
            return { ...flow, linkedCapas: updatedCapas, stages: updatedStages };
          }
          return flow;
        }));
      }
    }

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
      capaId: null,
      shift: newInc.shift || "Morning",
      rca: null
    };

    if (isConfigured && activeHospitalId) {
      firestoreService.createDocument(activeHospitalId, 'incidents', incidentObj);
      
      const flow = complianceFlows.find(f => f.id === "IRP");
      if (flow) {
        const updatedIncidents = [...(flow.linkedIncidents || [])];
        if (!updatedIncidents.includes(incId)) updatedIncidents.push(incId);
        const updatedStages = { ...flow.stages, findings: "Completed" };
        firestoreService.updateDocument(activeHospitalId, 'compliance_flows', flow.id, { ...flow, linkedIncidents: updatedIncidents, stages: updatedStages });
      }
    } else {
      setIncidents(prev => [incidentObj, ...prev]);
      setComplianceFlows(prev => prev.map(flow => {
        if (flow.id === "IRP") {
          const updatedIncidents = [...(flow.linkedIncidents || [])];
          if (!updatedIncidents.includes(incId)) updatedIncidents.push(incId);
          const updatedStages = { ...flow.stages, findings: "Completed" };
          return { ...flow, linkedIncidents: updatedIncidents, stages: updatedStages };
        }
        return flow;
      }));
    }

    logActivity(`Reported incident ${incId} in ${newInc.department} (${newInc.type})`);
    return incId;
  };

  const saveRCAData = (incidentId, rcaObj) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return;

    const updatedInc = {
      ...inc,
      status: rcaObj.status || "Closed",
      investigator: rcaObj.investigator || inc.investigator,
      capaId: rcaObj.capaId !== undefined ? rcaObj.capaId : inc.capaId,
      rootCause: rcaObj.rootCauseSummary || rcaObj.rootCauseNotes || '',
      rca: {
        type: rcaObj.type,
        rootCauseNotes: rcaObj.rootCauseNotes || '',
        fiveWhys: rcaObj.fiveWhys || null,
        fishbone: rcaObj.fishbone || null,
        updatedAt: new Date().toISOString()
      }
    };

    if (isConfigured && activeHospitalId) {
      firestoreService.updateDocument(activeHospitalId, 'incidents', incidentId, updatedInc);
    } else {
      setIncidents(prev => prev.map(item => item.id === incidentId ? updatedInc : item));
    }

    logActivity(`Saved RCA findings for incident ${incidentId} (${rcaObj.type})`);
  };

  const closeCapa = (capaId, approverName) => {
    if (isConfigured && activeHospitalId) {
      const c = capaItems.find(item => item.id === capaId);
      if (c) {
        firestoreService.updateDocument(activeHospitalId, 'capas', capaId, { ...c, status: "Closed", closureApprovedBy: approverName });
        
        tasks.forEach(t => {
          if (t.capaId === capaId && t.status !== "Completed") {
            firestoreService.updateDocument(activeHospitalId, 'tasks', t.id, { ...t, status: "Completed" });
          }
        });

        if (c.source && c.source.startsWith("Incident: ")) {
          const incidentId = c.source.replace("Incident: ", "").trim();
          const inc = incidents.find(item => item.id === incidentId);
          if (inc) {
            firestoreService.updateDocument(activeHospitalId, 'incidents', incidentId, { ...inc, status: "Closed" });
          }
        }

        const flow = complianceFlows.find(f => f.linkedCapas && f.linkedCapas.includes(capaId));
        if (flow) {
          const updatedStages = {
            ...flow.stages,
            capa: "Completed",
            review: "Completed",
            improvement: "Completed",
            updates: "Pending"
          };
          firestoreService.updateDocument(activeHospitalId, 'compliance_flows', flow.id, { ...flow, stages: updatedStages });
        }
      }
    } else {
      setCapaItems(prev => prev.map(c => {
        if (c.id === capaId) {
          logActivity(`Closed CAPA ${capaId} (Approved by ${approverName})`);
          
          setTasks(prevTasks => prevTasks.map(t => {
            if (t.capaId === capaId && t.status !== "Completed") return { ...t, status: "Completed" };
            return t;
          }));

          if (c.source && c.source.startsWith("Incident: ")) {
            const incidentId = c.source.replace("Incident: ", "").trim();
            setIncidents(prevInc => prevInc.map(inc => {
              if (inc.id === incidentId && inc.status !== "Closed") return { ...inc, status: "Closed" };
              return inc;
            }));
          }

          return { ...c, status: "Closed", closureApprovedBy: approverName };
        }
        return c;
      }));

      setComplianceFlows(prev => prev.map(flow => {
        if (flow.linkedCapas && flow.linkedCapas.includes(capaId)) {
          const updatedStages = {
            ...flow.stages,
            capa: "Completed",
            review: "Completed",
            improvement: "Completed",
            updates: "Pending"
          };
          return { ...flow, stages: updatedStages };
        }
        return flow;
      }));
    }
    logActivity(`Closed CAPA ${capaId} (Approved by ${approverName})`);
  };

  const linkFindingToCapa = (auditId, findingId, capaId) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        const updatedFindings = (a.findings || []).map(f => {
          if (f.id === findingId) {
            return { ...f, capaId, resolved: true };
          }
          return f;
        });
        const allResolved = updatedFindings.every(f => f.resolved);
        const newStatus = allResolved ? "Completed" : a.status;
        return { ...a, findings: updatedFindings, status: newStatus };
      }
      return a;
    }));
  };

  const addCommitteeMeeting = (committeeId, meeting) => {
    const meetingId = `meet-${Date.now()}`;
    const meetingWithId = {
      ...meeting,
      id: meetingId,
      actionItems: (meeting.actionItems || []).map(item => ({
        ...item,
        id: item.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };
    
    setCommittees(prev => prev.map(c => {
      if (c.id === committeeId) {
        return {
          ...c,
          meetings: [meetingWithId, ...(c.meetings || [])]
        };
      }
      return c;
    }));

    if (meetingWithId.actionItems && meetingWithId.actionItems.length > 0) {
      const newTasks = meetingWithId.actionItems.map(item => ({
        id: `task-meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `Committee Action: ${item.task}`,
        assignedTo: item.assignedTo,
        dueDate: item.dueDate,
        status: item.status || "Pending",
        priority: "Medium",
        source: "Committee Meeting",
        meetingId: meetingId,
        committeeId: committeeId,
        actionItemId: item.id
      }));
      setTasks(prev => [...newTasks, ...prev]);
    }

    logActivity(`Logged meeting for committee ${committeeId}`);
  };

  const addTrainingSession = (session) => {
    const sessionWithId = {
      ...session,
      id: `train-${Date.now()}`
    };
    setTrainings(prev => [sessionWithId, ...prev]);
    
    if (session.mappedPolicyId) {
      setComplianceFlows(prev => prev.map(flow => {
        if (flow.id === session.mappedPolicyId) {
          const updatedStages = { ...flow.stages, training: "Completed" };
          const updatedLinkedTraining = [...(flow.linkedTraining || [])];
          if (!updatedLinkedTraining.includes(sessionWithId.id)) {
            updatedLinkedTraining.push(sessionWithId.id);
          }
          return { ...flow, stages: updatedStages, linkedTraining: updatedLinkedTraining };
        }
        return flow;
      }));
    }
    
    logActivity(`Added training session: ${session.topic}`);
    return sessionWithId.id;
  };

  const addRiskRegisterItem = (risk) => {
    const riskWithId = {
      ...risk,
      id: `risk-${Date.now()}`
    };
    setRisks(prev => [riskWithId, ...prev]);
    logActivity(`Added risk to register: ${(risk.description || '').substring(0, 30)}...`);
    return riskWithId.id;
  };

  const updateComplianceFlowStage = (policyId, stage, status) => {
    setComplianceFlows(prev => prev.map(flow => {
      if (flow.id === policyId) {
        const updatedStages = { ...flow.stages, [stage]: status };
        return { ...flow, stages: updatedStages };
      }
      return flow;
    }));
  };

  const generateAIQuiz = (sopTitle) => {
    return {
      sopTitle: sopTitle,
      status: "Draft",
      questions: [
        {
          id: 1,
          question: `What is the primary objective outlined in the ${sopTitle}?`,
          options: [
            "To define standard operating guidelines and ensure clinical safety.",
            "To record daily attendance logs.",
            "To review financial billing sheets.",
            "To schedule committee meetings."
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          question: `According to the ${sopTitle}, who is responsible for initiating corrective actions?`,
          options: [
            "Any staff member discovering a gap.",
            "Only the Chief Operating Officer.",
            "The Department Head or Quality Officer.",
            "External audit inspectors."
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          question: `What is the maximum timeline allowed for documenting an incident under the ${sopTitle}?`,
          options: [
            "Within 24 hours.",
            "Immediate (within shift) reporting.",
            "Within 7 working days.",
            "By the end of the month."
          ],
          correctAnswer: 1
        },
        {
          id: 4,
          question: `Which of the following is considered a primary audit finding in ${sopTitle} audits?`,
          options: [
            "Lack of proper signature or documentation logs.",
            "Color of the file folders.",
            "Coffee machine placement.",
            "Speed of HIMS network connection."
          ],
          correctAnswer: 0
        },
        {
          id: 5,
          question: `How often must compliance indicators for the ${sopTitle} be reviewed?`,
          options: [
            "Annually",
            "Monthly or during committee audits.",
            "Every shift change.",
            "Decennially"
          ],
          correctAnswer: 1
        }
      ]
    };
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

  const changeStandardsProgram = (programName) => {
    setSelectedProgram(programName);
    let newTemplates = [];
    if (programName === 'NABH Entry-Level') {
      newTemplates = entryLevelStandards;
    } else if (programName === 'Digital Health') {
      newTemplates = digitalHealthStandards;
    } else {
      newTemplates = defaultStandards;
    }
    
    const resetStandards = newTemplates.map(s => ({ ...s, score: 0, status: "Not Met" }));

    if (isConfigured && activeHospitalId) {
      resetStandards.forEach(std => {
        firestoreService.updateDocument(activeHospitalId, 'standards', std.id, std);
      });
    } else {
      setStandards(resetStandards);
    }
    
    logActivity(`Switched standards program to: ${programName}`);
  };

  // Live countdown ticker
  const [liveNow, setLiveNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const clientRecord = currentUser ? (clientsList || []).find(c => c && c.email && c.email.toLowerCase() === (currentUser.parentEmail || currentUser.email || '').toLowerCase()) : null;

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
    return (activeDepts || []).some(ad => {
      if (!ad) return false;
      const normalizedAd = ad.toLowerCase();
      return normalizedAd.includes(stdDept) || stdDept.includes(normalizedAd);
    });
  };

  // Computed readiness scoring indices
  const activeStandards = (standards || []).filter(isStandardActive);
  const totalStandardsCount = activeStandards.length;
  const maxPossibleScore = totalStandardsCount * 10;
  const currentEarnedScore = activeStandards.reduce((sum, s) => sum + s.score, 0);
  
  const rawScore = totalStandardsCount > 0 ? (currentEarnedScore / maxPossibleScore) * 100 : 0;
  const readinessScore = Math.round(rawScore * 10) / 10;

  const evidenceUploadedCount = activeStandards.filter(s => {
    return (documents || []).some(doc => doc && doc.mappedStandards && doc.mappedStandards.includes(s.id) && doc.status === "Approved");
  }).length;

  const missingEvidenceCount = totalStandardsCount - evidenceUploadedCount;
  const openCapasCount = (capaItems || []).filter(c => c && c.status === "Open").length;
  const overdueTasksCount = (tasks || []).filter(t => {
    if (!t) return false;
    const isLegacyOpen = t.status === "Pending";
    const isOpen = !["Completed", "Done", "Closed"].includes(t.status) && t.status !== "Pending";
    return (isLegacyOpen || isOpen) && t.dueDate && new Date(t.dueDate) < new Date();
  }).length;
  const pendingAuditsCount = (audits || []).filter(a => a && a.status === "Scheduled").length;
  const incidentsThisMonthCount = (incidents || []).length;

  return (
    <QualiNABHContext.Provider value={{
      currentUser, setCurrentUser,
      activeHospitalId, setActiveHospitalId,
      activeOrganizationId, setActiveOrganizationId,
      accessibleHospitals, setAccessibleHospitals,
      switchActiveBranch,
      theme, setTheme,
      currentRoute, setCurrentRoute,
      hospitalMode, setHospitalMode, switchHospitalMode,
      hospitalName, setHospitalName,
      hospitalBeds, setHospitalBeds,
      hospitalTier, setHospitalTier,
      activeDepts, setActiveDepts,
      onboardingSteps, setOnboardingSteps,
      onboardingStep, setOnboardingStep,
      importNABHTemplates,
      standards, setStandards, updateStandardScore,
      selectedProgram, changeStandardsProgram,
      documents, setDocuments, addDocument, updateDocumentDetails,
      audits, setAudits, addAudit, linkFindingToCapa,
      capaItems, setCapaItems, addCapa, closeCapa,
      incidents, setIncidents, addIncident, saveRCAData,
      licenses, setLicenses,
      tasks, setTasks,
      auditLogs, setAuditLogs, logActivity,
      qualityIndicators, setQualityIndicators,
      // SaaS Simulator States & Methods
      clientsList, setClientsList,
      isSubscribed, setIsSubscribed,
      trialStartDate, setTrialStartDate,
      geminiApiKey, setGeminiApiKey,
      openaiApiKey, setOpenaiApiKey,
      anthropicApiKey, setAnthropicApiKey,
      aiProvider, setAiProvider,
      aiModel, setAiModel,
      aiSystemPrompt, setAiSystemPrompt,
      hospitalLogo, setHospitalLogo,
      teamMembers, setTeamMembers,
      vendorAdminCredentials, setVendorAdminCredentials,
      vendorEmployees, setVendorEmployees,
      signUpClient, purchaseSubscription, loadDemoData, clearWorkspaceData,
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
      setForcePaymentScreen,
      // New Phase 3 exports
      complianceFlows, setComplianceFlows,
      committees, setCommittees,
      trainings, setTrainings,
      risks, setRisks,
      addCommitteeMeeting,
      addTrainingSession,
      addRiskRegisterItem,
      updateComplianceFlowStage,
      generateAIQuiz,
      // Secure AI Orchestration exports
      aiSettings, setAiSettings,
      aiMemory, setAiMemory,
      aiOutputs, setAiOutputs,
      aiUsageLogs, setAiUsageLogs,
      aiSafetyLogs, setAiSafetyLogs,
      validateAiKey,
      saveAiKey,
      deleteAiKey,
      getDecryptedKey,
      updateAiSettings,
      addAiMemory,
      deleteAiMemory,
      clearAiMemory,
      createAiOutput,
      updateAiOutputStatus,
      deleteAiOutput,
      logAiUsage,
      logAiSafety,
      sprints, setSprints,
      reportsList, setReportsList,
      taskActivities, setTaskActivities,
      addTaskComment,
      addTaskActivity
    }}>
      {children}
    </QualiNABHContext.Provider>
  );
};

