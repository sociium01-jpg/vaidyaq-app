import React, { useState, useContext, useEffect, useRef } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
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
  ArrowRight
} from 'lucide-react';

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
    logActivity
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('copilot'); // 'copilot', 'sop', 'gap', 'ceo'

  // 1. AI Copilot Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello, I am your VaidyaQ AI Copilot. I scan your hospital's active documents, licenses, audits, and CAPA logs. Ask me anything about audit readiness!"
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // AI Copilot Responses (dynamic query on context state)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() === '' && !attachedFile) return;

    const userText = chatInput;
    const currentAttachment = attachedFile;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText || `Uploaded attachment: ${currentAttachment.name}`, attachment: currentAttachment }]);
    setChatInput('');
    setAttachedFile(null);

    // Simulate AI response delay
    setTimeout(() => {
      let responseText = '';
      const query = userText.toLowerCase();

      if (currentAttachment) {
        if (currentAttachment.type === 'pdf') {
          responseText = `I have processed your audit report: **${currentAttachment.name}**. 
- Detected Gaps: Lacks signatures of the Facility Safety Director.
- Verification Status: **Failed Verification**.
- Corrective Action: Upload signed copy. This file has been scanned and is highly recommended as evidence for standard **FMS.1.d** (Fire Safety Drill Records).`;
        } else if (currentAttachment.type === 'image') {
          responseText = `I have analyzed the uploaded image: **${currentAttachment.name}**. 
Visual validation results:
- Item: Medication lockbox cabinet inside Pharmacy
- Locked status: **VERIFIED** (physical lock engaged)
- Compliance status: **PASS**.
This serves as valid proof of compliance for Standard **MOM.2.c** (High-Alert Medication Storage safety).`;
        } else if (currentAttachment.type === 'video') {
          responseText = `Analyzing compliance video recording: **${currentAttachment.name}** (1m 24s). 
Detected: 8 clinical staff members practicing WHO hand rub techniques.
Compliance score check: **92% scrubbing compliance**. 
This serves as strong evidence for training Standard **HRM.2.b** (Infection Control Training Drills).`;
        }
      } else if (query.includes('score') || query.includes('ready') || query.includes('readiness')) {
        responseText = `Our overall hospital accreditation readiness score is currently calculated at ${readinessScore}%. 
This is based on scoring preloaded objective elements: ${standards.filter(s => s.score === 10).length} Fully Met chapters, ${standards.filter(s => s.score === 5).length} Partially Met, and ${standards.filter(s => s.score === 0).length} Not Met. We require ${missingEvidenceCount} more evidence documents to achieve 90%+ target.`;
      } 
      else if (query.includes('capa') || query.includes('corrective')) {
        responseText = `There are currently ${openCapasCount} open CAPA actions pending. 
The most critical is CAPA-1 (ICU Crash Cart) assigned to Sister Gracy, due on 20-Jun-2026. Suggest uploading the physical inventory signature log to resolve the gap.`;
      } 
      else if (query.includes('missing') || query.includes('evidence') || query.includes('gap')) {
        const missingStds = standards.filter(s => s.score < 10).map(s => s.id);
        responseText = `I have detected evidence deficiencies in ${missingEvidenceCount} standards. 
Chapters with critical gaps (scored under 10): ${missingStds.join(', ')}. 
Specifically, MOM.3.a (Medication Expiry disposal) has no mapped SOP. You can use the AI SOP Generator tab to draft and approve one.`;
      } 
      else if (query.includes('risk') || query.includes('department')) {
        responseText = "Department risk scans: ICU and Pharmacy are flagged as HIGH RISK because ICU has an open high-severity CAPA for expired syringes, and Pharmacy has an expired Narcotic Storage License.";
      } 
      else {
        responseText = "Based on our hospital compliance logs, I suggest checking the 'Chapter Gap Analysis' dashboard. You have " + openCapasCount + " open CAPA items and " + missingEvidenceCount + " missing document uploads. Let me know if you want me to draft an SOP for medication safety or security policies.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      logActivity(currentAttachment ? `Uploaded attachment for AI inspection: ${currentAttachment.name}` : `Consulted AI Copilot: "${userText}"`);
    }, 800);
  };

  // SOP Draft Generator
  const handleDraftSOP = () => {
    setSopDrafting(true);
    setTimeout(() => {
      const draft = `STANDARD OPERATING PROCEDURE (SOP)
DOCUMENT TITLE: ${sopTitle}
DEPARTMENT: ${sopDepartment}
MAPPED STANDARD: ${sopStandard}
DOCUMENT STATUS: Draft (Awaiting Human Review)
--------------------------------------------------

1. PURPOSE & OBJECTIVE
To outline the clinical safety standards and protocols for handling, labelling, verifying, and administering high-risk procedures inside the ${sopDepartment} department in accordance with NABH 6th Edition guidelines.

2. SCOPE
Applies to all clinical nurses, pharmacists, medical officers, and auxiliary staff working within the ${sopDepartment}.

3. RESPONSIBILITY
The Clinical Head of ${sopDepartment} is responsible for enforcing compliance, auditing logs, and reporting sentinel incidents.

4. PROCEDURAL PROTOCOL
A. DOUBLE VERIFICATION: Two qualified clinical officers must independently verify the dosage/labels before execution.
B. LABELLING: Standard color-coded warning labels (RED for high-alert drugs, ORANGE for hazardous material) must be affixed physically.
C. DISPOSAL: Expired drugs or contaminated equipment must be logged in the waste register and segregated in locked cabinets.

5. DOCUMENTATION REQUIRED
- Daily inventory check logs
- Incident near-miss forms
- Shift handover signature sheets

6. REVIEW CYCLE
This SOP is subject to audit every 6 months. Revision 1.0.`;
      setSopDraftText(draft);
      setSopDrafting(false);
      logActivity(`Generated SOP draft for ${sopTitle}`);
    }, 1000);
  };

  const handleApproveSOP = () => {
    approveSOPDraft(sopTitle, sopDepartment, [sopStandard], sopDraftText);
    setSopApprovedAlert(true);
    setTimeout(() => {
      setSopApprovedAlert(false);
    }, 4000);
  };

  // AI Gap Checker simulation
  const handleGapCheckUpload = () => {
    setUploadChecking(true);
    setTimeout(() => {
      setGapCheckResult({
        docName: 'Biomedical Waste Log May 2026.pdf',
        chapter: 'FMS.2.a (Hazardous Materials)',
        strength: 'Medium',
        status: 'Partially Approved',
        gaps: [
          'Document lists quantity disposed of, but lacks the State Pollution Board authorized signature seal.',
          'Missing staff attendance list representing housekeeping safety drills.'
        ],
        advice: 'Upgrade standard FMS.2.a from Partially Met to Fully Met by attaching the safety drill attendance certificate.'
      });
      setUploadChecking(false);
      logActivity("Conducted AI Gap Check on mock file");
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-3">
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
      </div>

      {/* 1. AI COPILOT CHAT VIEW */}
      {activeSubTab === 'copilot' && (
        <div className="copilot-wrapper">
          {/* Chat Panel */}
          <div className="copilot-chat-pane">
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }} className="flex align-center gap-2">
              <Brain size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>VaidyaQ Chatbot Co-Pilot</span>
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
                    <div>{msg.text}</div>
                  </div>
                </div>
              ))}
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
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Suggested Readiness Prompts</h4>
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

            <div style={{ marginTop: '2rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', fontSize: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
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
                <>
                  <textarea
                    className="sop-content-draft flex-1 form-control"
                    style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)' }}
                    value={sopDraftText}
                    onChange={(e) => setSopDraftText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button onClick={() => setSopDraftText('')} className="btn btn-secondary">Discard</button>
                    <button onClick={handleApproveSOP} className="btn btn-primary">
                      <CheckCircle2 size={16} /> Approve & Save to Library
                    </button>
                  </div>
                </>
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

            <div className="upload-zone" onClick={handleGapCheckUpload}>
              {uploadChecking ? (
                <div className="flex flex-col align-center gap-2">
                  <Clock size={32} className="text-gradient" style={{ animation: 'spin 2s linear infinite' }} />
                  <p style={{ fontWeight: 600 }}>Analyzing uploaded document structure...</p>
                </div>
              ) : (
                <div className="flex flex-col align-center gap-2">
                  <CheckSquare size={32} color="var(--primary)" />
                  <p style={{ fontWeight: 600 }}>Simulate uploading evidence file for Gap Check</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Click to test with: <strong>Biomedical Waste Log May 2026.pdf</strong></p>
                </div>
              )}
            </div>

            {/* Gap Check Result */}
            {gapCheckResult && (
              <div className="card" style={{ marginTop: '1.5rem', borderLeft: '5px solid var(--color-warning)' }}>
                <h4 style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.95rem', display: 'flex', alignContent: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  <span>Validation Result: {gapCheckResult.docName}</span>
                </h4>
                
                <div style={{ marginTop: '1rem', fontSize: '0.85rem' }} className="flex flex-col gap-2">
                  <div>
                    <strong>Suggested Chapter Map:</strong> <span className="badge badge-neutral">{gapCheckResult.chapter}</span>
                  </div>
                  <div>
                    <strong>Audit Evidence Strength:</strong> <span className="badge badge-warning">{gapCheckResult.strength}</span>
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. AI CEO BRIEFING VIEW */}
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
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>2</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Overall Performance Summary</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  City Central Metro Hospital is currently at <strong>{readinessScore}%</strong> compliance for the NABH 6th Edition accreditation standard. We have mapped <strong>{documents.filter(d=>d.status==='Approved').length} approved SOPs</strong>. A compliance score of 85% is required to trigger final document submission.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Critical Compliance Liabilities</h4>
                <ul style={{ listStyleType: 'decimal', paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li><strong>Expired Narcotics License:</strong> The pharmacy Narcotics Storage license expired on 10-May-2026. Immediate renewal action required to prevent regulatory fines.</li>
                  <li><strong>Unresolved ICU finding:</strong> Audit-1 logged a high-severity finding for expired saline syringes in the crash cart. CAPA-1 remains open.</li>
                  <li><strong>Missing SOP Evidence:</strong> MOM.3.a (Medication Expiry disposal) has no mapped evidence SOP.</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Immediate Action Items for Executive Team</h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li>COO to sign off the Narcotic Storage license renewal fee request.</li>
                  <li>Quality Head to verify Sister Gracy's crash cart handover sheet and close CAPA-1.</li>
                  <li>Pharmacy HOD to approve the Expired Drug Disposal SOP draft.</li>
                </ul>
              </div>
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
      `}</style>
    </div>
  );
}
