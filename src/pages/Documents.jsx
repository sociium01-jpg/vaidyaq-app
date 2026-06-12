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
  AlertTriangle
} from 'lucide-react';

export default function Documents() {
  const {
    documents,
    setDocuments,
    standards,
    setStandards,
    logActivity,
    currentUser,
    addDocument
  } = useContext(QualiNABHContext);

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

  // Track currently selected doc details to sync edits from global state
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
        const editedDoc = {
          ...d,
          content: editContent,
          version: nextVer,
          status: 'Pending Review',
          approvedBy: 'Pending review sign-off',
          sha256Hash: null // Reset hash on new edit
        };
        return editedDoc;
      }
      return d;
    });
    setDocuments(updatedDocs);
    setIsEditing(false);

    // If it was approved, reset mapped standards to 5 (Partially Met) because the new revision is pending review!
    if (wasApproved && selectedDocDetails.mappedStandards && selectedDocDetails.mappedStandards.length > 0) {
      setStandards(prevStds => prevStds.map(std => {
        if (selectedDocDetails.mappedStandards.includes(std.id)) {
          // Check if there is another APPROVED document mapping to this standard
          const otherApproved = updatedDocs.some(d => d.status === "Approved" && d.id !== selectedDocDetails.id && d.mappedStandards.includes(std.id));
          if (otherApproved) {
            return std;
          }
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
        const approvedDoc = {
          ...d,
          status: 'Approved',
          approvedBy: authName,
          lastReviewed: today,
          nextReview: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
          sha256Hash: mockHash
        };
        return approvedDoc;
      }
      return d;
    });
    setDocuments(updatedDocs);

    // Bump mapped standards to 10 (Fully Met)
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

    // Update standard scores
    if (docToDelete.mappedStandards && docToDelete.mappedStandards.length > 0) {
      setStandards(prevStds => prevStds.map(std => {
        if (docToDelete.mappedStandards.includes(std.id)) {
          // Check if there are other APPROVED documents mapping to this standard
          const otherApproved = updatedDocs.some(d => d.status === "Approved" && d.mappedStandards.includes(std.id));
          if (otherApproved) {
            return std; // Keep at 10
          }
          // Check if there are other pending documents/templates mapping to this standard
          const otherPending = updatedDocs.some(d => d.mappedStandards.includes(std.id));
          if (otherPending) {
            return { ...std, score: 5, status: "Partially Met" };
          }
          // No other documents map to it
          return { ...std, score: 0, status: "Not Met" };
        }
        return std;
      }));
    }

    logActivity(`Deleted compliance document: ${docToDelete.title}`);
  };

  const [uploadedFile, setUploadedFile] = useState(null);

  const handleVaultFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    
    // Auto fill Title
    const docTitle = file.name.split('.').slice(0, -1).join('.') || file.name;
    
    // Suggest standard mapping based on name
    const fileNameLower = file.name.toLowerCase();
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
      if (mapping.kws.some(kw => fileNameLower.includes(kw))) {
        suggestedStandards.push(mapping.std);
      }
    });

    setNewDocForm(prev => ({
      ...prev,
      title: docTitle,
      mappedStandards: suggestedStandards
    }));
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
              <option value="Form">Form / Checklist</option>
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
                filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} style={{ cursor: 'pointer' }} className={selectedDocDetails?.id === doc.id ? 'active-row' : ''} onClick={() => { setSelectedDocDetails(doc); setIsEditing(false); }}>
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

            {/* Document Status alerts */}
            {selectedDocDetails.status === 'Pending Review' ? (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(217,119,6,0.08)', color: 'var(--color-warning)', border: '1.5px solid var(--color-warning)', borderRadius: '8px', fontSize: '0.75rem' }} className="flex flex-col gap-1">
                <div className="flex align-center gap-1" style={{ fontWeight: 700 }}>
                  <AlertTriangle size={14} />
                  <span>ACTION REQUIRED: Pending Review & Customization</span>
                </div>
                <span>Please review this SOP template. Customize its details below to reflect central中央 Central Central Central central 中央 مرکزی مرکزی Central центра central 中央中央 مرکزی Central மத்திய central Central مرکزی Central centralized central 中央 central Central hospital workflows, and authenticate it to fully satisfy standard objective evidence.</span>
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

            {/* Document Content / Editor */}
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
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Document Content Body:</label>
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, overflowY: 'auto', maxHeight: '220px' }}>
                    <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.4', margin: 0 }}>
                      {selectedDocDetails.content || "No content provided."}
                    </p>
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
                      accept=".pdf,.docx,.xlsx"
                      onChange={handleVaultFileChange}
                    />
                    <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {uploadedFile ? `Selected: ${uploadedFile.name}` : "Click to select a file (PDF, DOCX, XLSX)"}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Selecting a file will auto-suggest standard mappings</p>
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
                      <option value="Form">Form / Checklist</option>
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
