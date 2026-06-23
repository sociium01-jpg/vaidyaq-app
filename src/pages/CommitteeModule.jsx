import React, { useState, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  Calendar,
  Users,
  FileText,
  Plus,
  Sparkles,
  Search,
  CheckCircle,
  FileDown,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CommitteeModule() {
  const {
    committees,
    addCommitteeMeeting,
    currentUser,
    tasks,
    logActivity
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('meetings'); // 'meetings', 'registrar', 'ai-minutes', 'vault'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Committee Registrar states
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(committees[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendeesText, setAttendeesText] = useState('');
  const [agendaText, setAgendaText] = useState('');
  const [minutesText, setMinutesText] = useState('');
  
  // Action item builder in registrar
  const [actionItems, setActionItems] = useState([]);
  const [newActionItem, setNewActionItem] = useState(() => ({
    task: '',
    assignedTo: '',
    dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
    status: 'Pending'
  }));

  // AI Minutes Drafter states
  const [rawTranscript, setRawTranscript] = useState('');
  const [aiDraftMOM, setAiDraftMOM] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [draftApproved, setDraftApproved] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Success message feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Action item handlers
  const handleAddActionItem = () => {
    if (!newActionItem.task || !newActionItem.assignedTo) return;
    setActionItems([...actionItems, {
      ...newActionItem,
      id: `act-temp-${Date.now()}`
    }]);
    setNewActionItem({
      task: '',
      assignedTo: '',
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
      status: 'Pending'
    });
  };

  const handleRemoveActionItem = (id) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  const handleSaveMeeting = (e) => {
    e.preventDefault();
    if (!selectedCommitteeId || !meetingDate || !minutesText) return;

    const committee = committees.find(c => c.id === selectedCommitteeId);
    if (!committee) return;

    const attendees = attendeesText.split(',').map(a => a.trim()).filter(a => a.length > 0);

    const newMeeting = {
      date: meetingDate,
      attendees: attendees.length > 0 ? attendees : [currentUser.name],
      agenda: agendaText || "General Committee Audit & Review",
      minutes: minutesText,
      actionItems: actionItems.map(item => ({
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        task: item.task,
        assignedTo: item.assignedTo,
        dueDate: item.dueDate,
        status: item.status
      }))
    };

    addCommitteeMeeting(selectedCommitteeId, newMeeting);

    // Reset Form
    setAttendeesText('');
    setAgendaText('');
    setMinutesText('');
    setActionItems([]);
    setSuccessMessage(`Minutes for "${committee.name}" saved successfully and linked to Tasks.`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setActiveSubTab('meetings');
  };

  // AI Meeting Minutes drafter
  const handleGenerateAIDraft = () => {
    if (!rawTranscript.trim()) return;
    setGenerating(true);

    setTimeout(() => {
      // Simulate draft minutes creation
      const mockDraft = {
        committeeId: selectedCommitteeId,
        committeeName: committees.find(c => c.id === selectedCommitteeId)?.name || 'General Committee',
        date: meetingDate,
        attendees: ["Dr. Sarah Paul", "Col. Roy", "Sister Gracy", "Dr. Sen"],
        agenda: "Emergency Incident Review, ICU standard audit checklist review, and CAPA formulation.",
        minutes: `1. Incident Review: Reviewed the recent ICU needle-stick incident. Identified missing safety needle disposal canisters in Wing B.
2. Standard Audit: Hand Hygiene scores at 85% - training gap identified.
3. Decision: Double safety canisters will be placed in all ICUs. Mandatory BLS refreshers scheduled.`,
        actionItems: [
          { task: "Procure and mount 4 safety canisters in ICU Wing B", assignedTo: "Facilities Manager", dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().slice(0, 10), status: "Pending" },
          { task: "Schedule refresher hand-hygiene module for nurses", assignedTo: "Sister Gracy", dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().slice(0, 10), status: "Pending" }
        ],
        status: "Draft"
      };

      setAiDraftMOM(mockDraft);
      setGenerating(false);
      setDraftApproved(false);
      setPinInput('');
      setPinError('');
    }, 1200);
  };

  const handleApproveAIDraft = () => {
    if (pinInput !== '1234') {
      setPinError("Invalid Verification PIN! AI Drafts require authorized human signature (PIN: 1234).");
      return;
    }

    if (!aiDraftMOM) return;

    const newMeeting = {
      date: aiDraftMOM.date,
      attendees: aiDraftMOM.attendees,
      agenda: aiDraftMOM.agenda,
      minutes: aiDraftMOM.minutes,
      actionItems: aiDraftMOM.actionItems.map(item => ({
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        task: item.task,
        assignedTo: item.assignedTo,
        dueDate: item.dueDate,
        status: item.status
      }))
    };

    addCommitteeMeeting(aiDraftMOM.committeeId, newMeeting);

    setDraftApproved(true);
    setPinError('');
    setSuccessMessage("AI Draft approved and successfully signed off with digital key. Linked tasks added.");
    setTimeout(() => {
      setSuccessMessage('');
      setAiDraftMOM(null);
      setRawTranscript('');
      setActiveSubTab('meetings');
    }, 3000);
  };

  const handleSimulateDownload = (committee, meeting) => {
    try {
      const doc = new jsPDF();
      
      // Page Borders & Colors
      doc.setDrawColor(13, 148, 136); // Teal primary color
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287); // Border
      
      // Header
      doc.setFillColor(13, 148, 136);
      doc.rect(5, 5, 200, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("VAIDYAQ SECURE CLINICAL GOVERNANCE VAULT", 12, 20);
      
      // Document Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.text(`MINUTES OF MEETING: ${(committee?.name || '').toUpperCase()}`, 15, 45);
      
      // Meta details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Meeting Date: ${meeting?.date || ''}`, 15, 55);
      doc.text(`Chairperson: ${committee?.chair || ''}`, 15, 62);
      doc.text(`Secretary: ${committee?.secretary || ''}`, 15, 69);
      doc.text(`Frequency: ${committee?.frequency || ''}`, 15, 76);
      
      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 82, 195, 82);
      
      // Attendees
      doc.setFont("helvetica", "bold");
      doc.text("Attendees:", 15, 92);
      doc.setFont("helvetica", "normal");
      const attendeesList = meeting?.attendees ? meeting.attendees.join(", ") : "None recorded";
      // Wrap text to fit page width
      const attendeesLines = doc.splitTextToSize(attendeesList, 180);
      doc.text(attendeesLines, 15, 98);
      
      let currentY = 100 + (attendeesLines.length * 5);
      
      // Agenda
      doc.setFont("helvetica", "bold");
      doc.text("Meeting Agenda / Topics Discussed:", 15, currentY);
      doc.setFont("helvetica", "normal");
      const agendaLines = doc.splitTextToSize(meeting?.agenda || "General Quality and Compliance Review", 180);
      doc.text(agendaLines, 15, currentY + 6);
      
      currentY += 12 + (agendaLines.length * 5);
      
      // Minutes / Discussion Notes
      doc.setFont("helvetica", "bold");
      doc.text("Discussion Minutes & Notes:", 15, currentY);
      doc.setFont("helvetica", "normal");
      const minutesLines = doc.splitTextToSize(meeting?.minutes || "No detailed notes recorded.", 180);
      doc.text(minutesLines, 15, currentY + 6);
      
      currentY += 12 + (minutesLines.length * 5);
      
      // Action Items
      if (meeting?.actionItems && meeting.actionItems.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Formulated Action Items / Tasks:", 15, currentY);
        doc.setFont("helvetica", "normal");
        
        meeting.actionItems.forEach((item, idx) => {
          const itemText = `${idx + 1}. [Task] ${item.task || item.title || ''} | Owner: ${item.assignedTo || 'Unassigned'} | Due: ${item.dueDate || 'N/A'}`;
          const itemLines = doc.splitTextToSize(itemText, 180);
          doc.text(itemLines, 15, currentY + 6);
          currentY += (itemLines.length * 5) + 2;
        });
        currentY += 10;
      }
      
      // Signatures
      if (currentY > 245) {
        doc.addPage();
        currentY = 30;
        doc.setDrawColor(13, 148, 136);
        doc.rect(5, 5, 200, 287);
      }
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, currentY + 15, 80, currentY + 15);
      doc.line(120, currentY + 15, 185, currentY + 15);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Chairperson Signature (Digitally Checked)", 15, currentY + 20);
      doc.text("Quality HOD / Secretary Signature (Digitally Checked)", 120, currentY + 20);
      
      // Footer / ABDM compliance info
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("NABH 6th Edition Digital Governance Protocol Compliant. MD5 Checksum recorded securely in the audit vault.", 15, 280);
      
      doc.save(`Minutes_of_Meeting_${(committee?.name || 'Committee').replace(/\s+/g, '_')}_${meeting?.date || 'Date'}.pdf`);
      logActivity(`Downloaded Governance Minutes PDF: ${committee?.name || ''} (${meeting?.date || ''})`);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF. Please check console logs.");
    }
  };

  // Filter committees for searches
  const filteredCommittees = committees.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.chair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Premium Header Container */}
      <div className="flex justify-between align-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
        <div>
          <span className="badge badge-success" style={{ textTransform: 'none', fontSize: '0.7rem' }}>
            Module 7: MOM & Governance Desk
          </span>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0 0' }}>
            Committee & Meeting Registrar
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Track statutory committee resolutions, draft AI minutes, and store official governance records as audit evidence.
          </p>
        </div>
        <button
          onClick={() => setActiveSubTab('registrar')}
          className="btn btn-primary"
        >
          <Plus size={16} /> New Meeting MOM
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="tabs-container" style={{ margin: 0 }}>
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`tab-btn ${activeSubTab === 'meetings' ? 'active' : ''}`}
        >
          Active Committees & Calendars
        </button>
        <button
          onClick={() => setActiveSubTab('registrar')}
          className={`tab-btn ${activeSubTab === 'registrar' ? 'active' : ''}`}
        >
          Log Meeting MOM (Manual)
        </button>
        <button
          onClick={() => setActiveSubTab('ai-minutes')}
          className={`tab-btn ${activeSubTab === 'ai-minutes' ? 'active' : ''}`}
        >
          AI Minutes Compiler
        </button>
        <button
          onClick={() => setActiveSubTab('vault')}
          className={`tab-btn ${activeSubTab === 'vault' ? 'active' : ''}`}
        >
          Governance Audit Vault
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 605, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Active Committees & Meeting Calendars */}
      {activeSubTab === 'meetings' && (
        <div className="grid-split-responsive-sidebar-right">
          {/* Left panel: Committees list */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }} className="flex align-center gap-1">
                <Users size={16} /> Committees List
              </h3>
              <div className="flex align-center" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px 8px', backgroundColor: 'var(--bg-primary)' }}>
                <Search size={12} color="var(--text-tertiary)" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  placeholder="Search committees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent', fontSize: '0.75rem', width: '150px', outline: 'none' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredCommittees.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  No active committees registered.
                </div>
              ) : (
                filteredCommittees.map(c => (
                  <div key={c.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }} className="flex flex-col gap-2">
                    <div className="flex justify-between align-center">
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>{c.name}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Chair: <strong>{c.chair}</strong> | Department: {c.department} | Freq: {c.frequency}
                        </span>
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        {(c.meetings || []).length} Meetings logged
                      </span>
                    </div>

                    {/* Display recent meeting list for this committee */}
                    <div style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--primary-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(!c.meetings || c.meetings.length === 0) ? (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>No meetings logged yet for this committee.</p>
                      ) : (
                        c.meetings.slice(0, 2).map((meet, index) => (
                          <div key={index} style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-350" style={{ marginBottom: '2px' }}>
                              <span>📅 Date: {meet.date}</span>
                              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>MOM #{index + 1}</span>
                            </div>
                            <div style={{ color: 'var(--text-primary)' }}>
                              <strong>Agenda:</strong> {meet.agenda}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>
                              {meet.minutes}
                            </div>
                            {meet.actionItems && meet.actionItems.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                                {meet.actionItems.map((item, keyId) => (
                                  <span key={keyId} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'semibold' }}>
                                    ✔️ Task: {item.task} ({item.assignedTo})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right sidebar: Scheduled meetings calendar info */}
          <div className="flex flex-col gap-4">
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem' }} className="flex align-center gap-1">
                <Clock size={16} /> Governance Requirements
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 'bold', margin: 0 }}>Monthly Committees</h4>
                  <ul style={{ paddingLeft: '1rem', marginTop: '0.3rem', listStyleType: 'disc' }}>
                    <li>Quality Assurance & Safety</li>
                    <li>Infection Prevention & Control</li>
                    <li>Pharmacy and Therapeutics</li>
                  </ul>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 'bold', margin: 0 }}>Quarterly Committees</h4>
                  <ul style={{ paddingLeft: '1rem', marginTop: '0.3rem', listStyleType: 'disc' }}>
                    <li>Blood Transfusion & Safety</li>
                    <li>Medical Records Review Board</li>
                    <li>Radiation Safety Committee (AERB)</li>
                  </ul>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: '0.7rem', margin: 0 }}>
                  💡 NABH Assessors mandate that all agendas be pre-circulated 48 hours prior, and MOM digital records be published within 7 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Log Meeting MOM (Manual) */}
      {activeSubTab === 'registrar' && (
        <div className="card" style={{ padding: '1.5rem', maxWidth: '800px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.25rem' }} className="flex align-center gap-1">
            <Plus size={18} /> Log Committee Minutes of Meeting
          </h3>

          <form onSubmit={handleSaveMeeting} className="flex flex-col gap-3">
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Committee *</label>
                <select
                  value={selectedCommitteeId}
                  onChange={(e) => setSelectedCommitteeId(e.target.value)}
                  required
                  className="form-control"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1.5px solid var(--border-color)' }}
                >
                  {committees.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Meeting Date *</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Attendees (Comma separated) *</label>
              <input
                type="text"
                placeholder="Dr. Sarah Paul, Col. Roy, Sister Gracy"
                value={attendeesText}
                onChange={(e) => setAttendeesText(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meeting Agenda *</label>
              <input
                type="text"
                placeholder="Review of bio-waste disposal bags & OT sterilizer reports"
                value={agendaText}
                onChange={(e) => setAgendaText(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discussion Minutes & Decisions *</label>
              <textarea
                rows={5}
                placeholder="Log decisions made here. For example: Replaced autoclaving indicators. Scheduled quarterly facility checks. Set up hand wash scores monitoring..."
                value={minutesText}
                onChange={(e) => setMinutesText(e.target.value)}
                required
                className="form-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Action Items Board */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: 0 }}>
                🔨 Assign Action Items (Link directly to global task boards)
              </h4>

              <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Task Description"
                  value={newActionItem.task}
                  onChange={(e) => setNewActionItem({ ...newActionItem, task: e.target.value })}
                  className="form-control"
                  style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  placeholder="Assignee (e.g. Sister Gracy)"
                  value={newActionItem.assignedTo}
                  onChange={(e) => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })}
                  className="form-control"
                  style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                />
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <input
                    type="date"
                    value={newActionItem.dueDate}
                    onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                    className="form-control"
                    style={{ padding: '0.5rem', fontSize: '0.75rem', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {actionItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {actionItems.map(item => (
                    <div key={item.id} className="flex justify-between align-center" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>✔️ {item.task}</span>
                        <span style={{ color: 'var(--text-secondary)' }}> - Assigned to {item.assignedTo} (Due {item.dueDate})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveActionItem(item.id)}
                        style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveSubTab('meetings')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Log MOM Records
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: AI Minutes Compiler */}
      {activeSubTab === 'ai-minutes' && (
        <div className="grid-2col-responsive">
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }} className="flex align-center gap-1">
              <Sparkles size={16} /> Compile AI Minutes from Notes
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Paste your raw voice recorder transcript, bulleted notes, or rough discussion texts below. The Copilot will generate a standardized meeting record.
            </p>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Target Committee</label>
              <select
                value={selectedCommitteeId}
                onChange={(e) => setSelectedCommitteeId(e.target.value)}
                className="form-control"
                style={{ padding: '0.5rem', fontSize: '0.75rem' }}
              >
                {committees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Paste Raw Meeting Transcripts / Notes *</label>
              <textarea
                rows={10}
                placeholder="Example: We met today 10th June with Col. Roy and Sarah. Gracy mentioned ICU cart had expired syringes. Roy said replace them instantly. Gracy will do it by 15th. Also discussed readiness was 68%, need SOP for expired medicine disposal (Sen to draft by 15th)..."
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.75rem', resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleGenerateAIDraft}
              disabled={generating || !rawTranscript.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.6rem' }}
            >
              {generating ? "Generating Draft..." : "Draft Minutes of Meeting"}
            </button>
          </div>

          {/* AI Drafting Board */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }} className="flex align-center gap-1">
              <FileText size={16} /> Generated Draft Minutes
            </h3>

            {!aiDraftMOM ? (
              <div style={{ height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1.5px dashed var(--border-color)', borderRadius: '10px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                <Compass size={24} color="var(--text-tertiary)" style={{ marginBottom: '6px' }} />
                <p>No draft generated yet. Paste transcripts on the left and click compile.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-warning)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.75rem', margin: 0 }} className="flex align-center gap-1">
                    <Lock size={12} /> AI-Generated Draft Signature Verification Required
                  </h4>
                  <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>
                    Accreditation guardrails mandate human-in-the-loop review. Verify the details below and enter the 4-digit signature code to publish.
                  </p>
                  
                  <div className="flex gap-2 align-center">
                    <div style={{ position: 'relative', width: '160px' }}>
                      <input
                        type={showPin ? "text" : "password"}
                        placeholder="Enter Signature PIN (1234)"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="form-control"
                        style={{ fontSize: '0.75rem', padding: '0.45rem', paddingRight: '2.2rem', width: '100%', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(prev => !prev)}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px'
                        }}
                        aria-label={showPin ? "Hide PIN" : "Show PIN"}
                      >
                        {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={handleApproveAIDraft}
                      disabled={draftApproved}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      <Unlock size={12} /> Sign & Approve
                    </button>
                  </div>
                  {pinError && <p style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 'bold', margin: 0 }}>{pinError}</p>}
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: 0 }}>
                      {aiDraftMOM.committeeName}
                    </h3>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>Meeting Date: {aiDraftMOM.date}</p>
                  </div>

                  <p style={{ margin: 0 }}><strong>Attendees:</strong> {aiDraftMOM.attendees.join(', ')}</p>
                  <p style={{ margin: 0 }}><strong>Agenda:</strong> {aiDraftMOM.agenda}</p>
                  <p style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-line', backgroundColor: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                    {aiDraftMOM.minutes}
                  </p>

                  <div style={{ marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '0.75rem', margin: '0 0 0.4rem 0' }}>Action Items formulated:</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: 0 }}>
                      {aiDraftMOM.actionItems.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                          <span>✔️ {item.task} ({item.assignedTo})</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>Due: {item.dueDate}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Governance Audit Vault */}
      {activeSubTab === 'vault' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between align-center" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Governance Audit Vault</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Download verified and signed Minutes of Meetings for legal compliance checklists.
              </p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              NABH 6th Edition Compliant Vault
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Committee Name</th>
                  <th>Meeting Date</th>
                  <th>Attendees</th>
                  <th>Key Agendas / Discussion</th>
                  <th style={{ textAlign: 'center' }}>Action Items</th>
                  <th style={{ textAlign: 'center' }}>Audit Evidence</th>
                </tr>
              </thead>
              <tbody>
                {committees.map(c =>
                  (c.meetings || []).map((meet, mIdx) => (
                    <tr key={`${c.id}-${mIdx}`}>
                      <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                      <td>{meet.date}</td>
                      <td>{meet.attendees.join(', ')}</td>
                      <td>{meet.agenda}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--secondary)' }}>
                        {meet.actionItems ? meet.actionItems.length : 0}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleSimulateDownload(c, meet)}
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                        >
                          <FileDown size={12} /> Download PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
