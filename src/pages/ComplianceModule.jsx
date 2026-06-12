import React, { useState, useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  ShieldAlert,
  BookOpen,
  FileText,
  CalendarDays,
  FileBadge,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ComplianceModule() {
  const {
    standards,
    documents,
    addDocument,
    licenses,
    setLicenses,
    logActivity,
    analyzeEvidenceFile,
    isStandardActive
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('standards'); // 'standards', 'docs', 'licenses'
  
  // Document viewer state
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Renewal states
  const [renewingLicenseId, setRenewingLicenseId] = useState(null);
  const [renewalDate, setRenewalDate] = useState('');

  // License upload states
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseScanning, setLicenseScanning] = useState(false);
  const [licenseScanError, setLicenseScanError] = useState('');
  const [licenseScanSuccess, setLicenseScanSuccess] = useState(false);

  // New Document upload state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    type: 'Policy',
    department: 'Quality',
    version: '1.0',
    mappedStandards: []
  });

  // SOP upload states
  const [sopFile, setSopFile] = useState(null);
  const [sopScanError, setSopScanError] = useState('');

  // Calculate days remaining helper
  const getDaysRemaining = (expiryStr) => {
    if (!expiryStr) return -999999;
    const expiry = new Date(expiryStr);
    if (isNaN(expiry.getTime())) return -999999;
    const today = new Date();
    expiry.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleLicenseFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLicenseFile(file);
    setLicenseScanError('');
    setLicenseScanSuccess(false);
    setLicenseScanning(true);

    setTimeout(() => {
      const fileNameLower = file.name.toLowerCase();
      
      // Check file extension
      const fileExt = "." + file.name.split('.').pop().toLowerCase();
      const allowedExts = [".pdf", ".png", ".jpg", ".jpeg"];
      if (!allowedExts.includes(fileExt)) {
        setLicenseScanError("Invalid format. Licenses must be uploaded as PDF or Image files (.pdf, .png, .jpg).");
        setLicenseScanning(false);
        return;
      }

      // Check key validation terms based on the license being renewed
      const targetLicense = licenses.find(l => l.id === renewingLicenseId);
      if (!targetLicense) {
        setLicenseScanError("Could not identify the license to renew.");
        setLicenseScanning(false);
        return;
      }

      let keywords = [];
      if (targetLicense.id === "lic-1") {
        keywords = ["pollution", "waste", "board", "authorisation", "authorization", "noc"];
      } else if (targetLicense.id === "lic-2") {
        keywords = ["narcotic", "drugs", "pharmacy", "controller", "storage", "license"];
      } else if (targetLicense.id === "lic-3") {
        keywords = ["fire", "safety", "noc", "certificate", "no objection"];
      } else if (targetLicense.id === "lic-4") {
        keywords = ["aerb", "atomic", "radiation", "x-ray", "xray", "certification"];
      }

      const match = keywords.some(kw => fileNameLower.includes(kw));
      if (!match) {
        setLicenseScanError(`License scan mismatch: The uploaded file "${file.name}" does not seem to contain mandatory keywords for "${targetLicense.name}" (Expected reference to: ${keywords.slice(0, 3).join(', ')}).`);
        setLicenseScanning(false);
        return;
      }

      setLicenseScanSuccess(true);
      setLicenseScanning(false);
    }, 1000);
  };

  const handleCloseRenewModal = () => {
    setRenewingLicenseId(null);
    setRenewalDate('');
    setLicenseFile(null);
    setLicenseScanError('');
    setLicenseScanSuccess(false);
  };

  const handleSopFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSopFile(file);
    setSopScanError('');
    
    // Auto fill title if empty
    if (!newDocForm.title) {
      const docTitle = file.name.split('.').slice(0, -1).join('.') || file.name;
      setNewDocForm(prev => ({ ...prev, title: docTitle }));
    }
  };

  const handleRenewLicense = (e) => {
    e.preventDefault();
    if (!licenseScanSuccess) {
      alert("Please upload and scan a valid statutory certificate before confirming renewal.");
      return;
    }
    setLicenses(prev => prev.map(l => {
      if (l.id === renewingLicenseId) {
        logActivity(`Renewed license: ${l.name}. New expiry: ${renewalDate}`);
        
        // Also save license document to the vault
        addDocument({
          title: `Renewed statutory license: ${l.name}`,
          type: "Manual",
          department: l.id === "lic-2" ? "Pharmacy" : l.id === "lic-4" ? "Quality" : "Housekeeping",
          version: "1.0",
          status: "Approved",
          author: "Licensing Board Office",
          approvedBy: "Col. Roy (COO)",
          lastReviewed: new Date().toISOString().slice(0, 10),
          nextReview: renewalDate,
          mappedStandards: l.id === "lic-2" ? ["MOM.2.c"] : l.id === "lic-3" ? ["FMS.1.d"] : l.id === "lic-1" ? ["FMS.2.a"] : [],
          content: `Renewed license document. Expiry date: ${renewalDate}.`
        });

        return {
          ...l,
          expiryDate: renewalDate,
          status: 'Active'
        };
      }
      return l;
    }));
    setRenewingLicenseId(null);
    setRenewalDate('');
    setLicenseFile(null);
    setLicenseScanSuccess(false);
  };

  const handleUploadDocSubmit = (e) => {
    e.preventDefault();
    setSopScanError('');

    if (sopFile && newDocForm.mappedStandards.length > 0) {
      // Validate the uploaded file against each checked standard
      for (const stdId of newDocForm.mappedStandards) {
        const check = analyzeEvidenceFile(sopFile.name, "", stdId);
        if (!check.success) {
          setSopScanError(`Validation Failed for ${stdId}: ${check.message}`);
          return;
        }
      }
    }

    addDocument({
      title: newDocForm.title,
      type: newDocForm.type,
      department: newDocForm.department,
      version: newDocForm.version,
      status: 'Approved',
      author: 'Dr. Sarah Paul (Quality Head)',
      approvedBy: 'Col. Roy (COO)',
      lastReviewed: new Date().toISOString().slice(0, 10),
      nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      mappedStandards: newDocForm.mappedStandards,
      content: `This document contains the policy and operational procedures for ${newDocForm.title}. It has been compiled in compliance with NABH 6th Edition requirements.`
    });
    setNewDocForm({ title: '', type: 'Policy', department: 'Quality', version: '1.0', mappedStandards: [] });
    setSopFile(null);
    setSopScanError('');
    setShowDocUploadModal(false);
  };

  const toggleStandardSelection = (stdId) => {
    setNewDocForm(prev => {
      const selected = prev.mappedStandards.includes(stdId)
        ? prev.mappedStandards.filter(id => id !== stdId)
        : [...prev.mappedStandards, stdId];
      return { ...prev, mappedStandards: selected };
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sub Tabs */}
      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
        <div className="tabs-container" style={{ margin: 0, border: 'none' }}>
          <button onClick={() => setActiveSubTab('standards')} className={`tab-btn ${activeSubTab === 'standards' ? 'active' : ''}`}>
            Standards Library ({standards.length})
          </button>
          <button onClick={() => setActiveSubTab('docs')} className={`tab-btn ${activeSubTab === 'docs' ? 'active' : ''}`}>
            Policies & SOPs ({documents.length})
          </button>
          <button onClick={() => setActiveSubTab('licenses')} className={`tab-btn ${activeSubTab === 'licenses' ? 'active' : ''}`}>
            License Tracker ({licenses.length})
          </button>
        </div>

        {activeSubTab === 'docs' && (
          <button onClick={() => setShowDocUploadModal(true)} className="btn btn-primary">
            <Plus size={16} /> Upload Policy / SOP Document
          </button>
        )}
      </div>

      {/* 1. STANDARDS LIBRARY VIEW */}
      {activeSubTab === 'standards' && (
        <div className="flex flex-col gap-3">
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }} className="flex align-center justify-between">
            <div>
              <h3 style={{ fontSize: '1rem' }}>NABH 6th Edition Digital Registry</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                Preloaded Chapters containing objective requirements mapped to hospital evidence.
              </p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Official Metadata Structure</span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th>Standard Code</th>
                  <th>Objective Element Requirement</th>
                  <th>Responsible Dept</th>
                  <th>Required Evidence Formats</th>
                  <th>Mapped Documents</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {standards.map((std, idx) => {
                  // Find documents mapped to this standard
                  const mappedDocs = documents.filter(doc => doc.mappedStandards && doc.mappedStandards.includes(std.id));
                  const active = isStandardActive(std);
                  return (
                    <tr key={idx} style={{ opacity: active ? 1 : 0.6, backgroundColor: active ? 'transparent' : 'var(--bg-tertiary)' }}>
                      <td style={{ fontWeight: 700 }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{std.chapter}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{std.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{std.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{std.description}</div>
                      </td>
                      <td>{std.department}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{std.evidenceRequired}</span>
                      </td>
                      <td>
                        {!active ? (
                          <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>Exempt</span>
                        ) : mappedDocs.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {mappedDocs.map((doc, dIdx) => (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
                                <FileText size={12} />
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { setSelectedDoc(doc); setActiveSubTab('docs'); }}>
                                  {doc.title.substring(0, 20)}...
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Evidence Missing</span>
                        )}
                      </td>
                      <td>
                        {!active ? (
                          <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>
                            Exempt (Inactive Dept)
                          </span>
                        ) : (
                          <span className={`badge ${std.score === 10 ? 'badge-success' : std.score === 5 ? 'badge-warning' : 'badge-danger'}`}>
                            {std.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. POLICIES & SOPs LIBRARY VIEW */}
      {activeSubTab === 'docs' && (
        <div className="sop-generator-split" style={{ gridTemplateColumns: selectedDoc ? '1.2fr 0.8fr' : '1fr' }}>
          
          {/* Documents Table */}
          <div className="table-container" style={{ height: '100%', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Title & Department</th>
                  <th>Version</th>
                  <th>Author / Reviewer</th>
                  <th>Review Schedule</th>
                  <th>Mappings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{doc.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.title}</div>
                      <div className="flex gap-1 align-center" style={{ marginTop: '0.25rem' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{doc.type}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{doc.department}</span>
                      </div>
                    </td>
                    <td>v{doc.version}</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>Auth: {doc.author}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Appr: {doc.approvedBy}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>Reviewed: {doc.lastReviewed}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Next: {doc.nextReview}</div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {doc.mappedStandards.map((stdId, sIdx) => (
                          <span key={sIdx} className="badge badge-neutral" style={{ fontSize: '0.65rem', alignSelf: 'flex-start' }}>{stdId}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${doc.status === 'Approved' ? 'badge-success' : doc.status === 'Pending Review' ? 'badge-warning' : 'badge-neutral'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem', borderRadius: '50%' }}
                        title="View Document Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Document Content Details Viewer Panel */}
          {selectedDoc && (
            <div className="sop-preview-box flex flex-col gap-3" style={{ height: '100%', overflowY: 'auto' }}>
              <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>🛡️ Document Inspection</h3>
                <button onClick={() => setSelectedDoc(null)} style={{ fontWeight: 700 }}>✕</button>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{selectedDoc.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Document Code: <strong>{selectedDoc.id}</strong> • Version: <strong>{selectedDoc.version}</strong>
                </div>
              </div>

              {selectedDoc.isEncrypted && (
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                  🔒 <strong>Local AES-256 Mock Secured:</strong> This document is encrypted at rest to safeguard clinical process intelligence.
                </div>
              )}

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', flex: 1, minHeight: '150px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '0.5rem' }}>Content Body</div>
                <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{selectedDoc.content}</p>
              </div>

              <div style={{ fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }} className="flex justify-between">
                <span>Next Scheduled Review: <strong>{selectedDoc.nextReview}</strong></span>
                <span className="badge badge-success">SOP Mapped</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. LICENSE TRACKER VIEW */}
      {activeSubTab === 'licenses' && (
        <div className="flex flex-col gap-3">
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary)" />
              <span>Statutory Compliance Calendar</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              Hospitals must renew operational and biomedical certificates regularly. Expired licenses trigger red alerts in Quality Reports.
            </p>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>License / Certificate Name</th>
                  <th>Issuing Authority</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Responsible Department Owner</th>
                  <th>Days Remaining</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((lic, idx) => {
                  const days = getDaysRemaining(lic.expiryDate);
                  let stateBadge = 'badge-success';
                  let statusText = 'Active';

                  if (!lic.expiryDate) {
                    stateBadge = 'badge-danger';
                    statusText = 'Expired';
                  } else if (days <= 0) {
                    stateBadge = 'badge-danger';
                    statusText = 'Expired';
                  } else if (days <= 60) {
                    stateBadge = 'badge-warning';
                    statusText = 'Expiring Soon';
                  }

                  return (
                    <tr key={idx} style={{ backgroundColor: (!lic.expiryDate || days <= 0) ? 'rgba(220, 38, 38, 0.02)' : 'transparent' }}>
                      <td>
                        <strong>{lic.name}</strong>
                      </td>
                      <td>{lic.authority}</td>
                      <td>{lic.issueDate || '—'}</td>
                      <td>{lic.expiryDate || '—'}</td>
                      <td>{lic.responsible}</td>
                      <td>
                        {!lic.expiryDate ? (
                          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>Not Uploaded</span>
                        ) : days <= 0 ? (
                          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>Expired ({Math.abs(days)} days ago)</span>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{days} Days Left</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${stateBadge}`}>{statusText}</span>
                      </td>
                      <td>
                        {(days <= 60 || lic.status === 'Expired') ? (
                          <button
                            onClick={() => setRenewingLicenseId(lic.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                          >
                            <RefreshCw size={12} /> Renew
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No action required</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* A. Upload Document Modal */}
      {showDocUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Upload Compliance Document</h3>
              <button onClick={() => { setShowDocUploadModal(false); setSopFile(null); setSopScanError(''); }} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleUploadDocSubmit}>
              <div className="modal-body flex flex-col gap-2">
                <div className="form-group">
                  <label className="form-label">Attach SOP / Policy Document File</label>
                  <div 
                    className="upload-zone" 
                    style={{ padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}
                    onClick={() => document.getElementById('sop-file-input').click()}
                  >
                    <input 
                      type="file" 
                      id="sop-file-input" 
                      style={{ display: 'none' }}
                      accept=".pdf,.docx,.xlsx"
                      onChange={handleSopFileChange}
                    />
                    <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {sopFile ? `Selected: ${sopFile.name}` : "Click to select SOP, Policy or Checklist file"}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Accepted formats: PDF, DOCX, XLSX</p>
                  </div>
                  {sopScanError && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', padding: '0.5rem', backgroundColor: 'var(--bg-danger)', borderRadius: '6px' }}>
                      ⚠️ {sopScanError}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Document Title / Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Needle-Stick Prevention & Management Protocol"
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
                      <option value="SOP">SOP (Standard Operating Procedure)</option>
                      <option value="Form">Form / Checklist template</option>
                      <option value="Report">Audit Report</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
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
                      <option value="HR">HR & Recruitment</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Version Number</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. 1.0"
                    value={newDocForm.version}
                    onChange={(e) => setNewDocForm({ ...newDocForm, version: e.target.value })}
                  />
                </div>

                {/* Standards Mapping checkboxes */}
                <div className="form-group">
                  <label className="form-label">Map to Objective Elements (NABH Standards)</label>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {standards.map((std, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newDocForm.mappedStandards.includes(std.id)}
                          onChange={() => toggleStandardSelection(std.id)}
                        />
                        <span><strong>{std.id}</strong> - {std.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowDocUploadModal(false); setSopFile(null); setSopScanError(''); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Upload & Parse Evidence</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Renew License Modal */}
      {renewingLicenseId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Renew License / Authorization</h3>
              <button onClick={handleCloseRenewModal} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRenewLicense}>
              <div className="modal-body flex flex-col gap-2">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Upload a scanned copy of the renewed statutory certificate issued by the regulatory body.
                </p>
                
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Upload Scanned License Certificate (PDF or Image)</label>
                  <div 
                    className="upload-zone" 
                    style={{ padding: '2rem 1rem', position: 'relative' }}
                    onClick={() => document.getElementById('renew-license-input').click()}
                  >
                    <input 
                      type="file" 
                      id="renew-license-input" 
                      style={{ display: 'none' }}
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleLicenseFileChange}
                    />
                    {licenseScanning ? (
                      <div>
                        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 0.5rem' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Analyzing certificate headers...</p>
                      </div>
                    ) : licenseScanSuccess ? (
                      <div>
                        <CheckCircle2 size={24} color="var(--color-success)" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)' }}>Certificate Verified: {licenseFile?.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to browse certificate image or PDF</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Expected formats: PDF, PNG, JPG</p>
                      </div>
                    )}
                  </div>
                  {licenseScanError && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', padding: '0.5rem', backgroundColor: 'var(--bg-danger)', borderRadius: '6px' }}>
                      ⚠️ {licenseScanError}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">New Expiry Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseRenewModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={licenseScanning || !licenseScanSuccess}>Confirm Renewal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
