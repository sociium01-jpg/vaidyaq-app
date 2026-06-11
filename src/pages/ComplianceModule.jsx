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
    logActivity
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('standards'); // 'standards', 'docs', 'licenses'
  
  // Document viewer state
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Renewal states
  const [renewingLicenseId, setRenewingLicenseId] = useState(null);
  const [renewalDate, setRenewalDate] = useState('');

  // New Document upload state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    type: 'Policy',
    department: 'Quality',
    version: '1.0',
    mappedStandards: []
  });

  // Calculate days remaining helper
  const getDaysRemaining = (expiryStr) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRenewLicense = (e) => {
    e.preventDefault();
    setLicenses(prev => prev.map(l => {
      if (l.id === renewingLicenseId) {
        logActivity(`Renewed license: ${l.name}. New expiry: ${renewalDate}`);
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
  };

  const handleUploadDocSubmit = (e) => {
    e.preventDefault();
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
                  return (
                    <tr key={idx}>
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
                        {mappedDocs.length > 0 ? (
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
                        <span className={`badge ${std.score === 10 ? 'badge-success' : std.score === 5 ? 'badge-warning' : 'badge-danger'}`}>
                          {std.status}
                        </span>
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

                  if (days <= 0) {
                    stateBadge = 'badge-danger';
                    statusText = 'Expired';
                  } else if (days <= 60) {
                    stateBadge = 'badge-warning';
                    statusText = 'Expiring Soon';
                  }

                  return (
                    <tr key={idx} style={{ backgroundColor: days <= 0 ? 'rgba(220, 38, 38, 0.02)' : 'transparent' }}>
                      <td>
                        <strong>{lic.name}</strong>
                      </td>
                      <td>{lic.authority}</td>
                      <td>{lic.issueDate}</td>
                      <td>{lic.expiryDate}</td>
                      <td>{lic.responsible}</td>
                      <td>
                        {days <= 0 ? (
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
              <button onClick={() => setShowDocUploadModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleUploadDocSubmit}>
              <div className="modal-body flex flex-col gap-2">
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
                <button type="button" onClick={() => setShowDocUploadModal(false)} className="btn btn-secondary">Cancel</button>
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
              <button onClick={() => setRenewingLicenseId(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleRenewLicense}>
              <div className="modal-body flex flex-col gap-2">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Upload a scanned copy of the renewed statutory certificate issued by the regulatory body.
                </p>
                
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Upload Scanned License (Simulated)</label>
                  <div className="upload-zone" style={{ padding: '2rem 1rem' }}>
                    <RefreshCw size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to select certificate image or PDF</p>
                  </div>
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
                <button type="button" onClick={() => setRenewingLicenseId(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Renewal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
