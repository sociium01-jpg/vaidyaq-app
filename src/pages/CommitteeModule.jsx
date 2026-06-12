import React, { useState, useContext } from 'react';
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
  ArrowRight
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
  const [newActionItem, setNewActionItem] = useState({
    task: '',
    assignedTo: '',
    dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
    status: 'Pending'
  });

  // AI Minutes Drafter states
  const [rawTranscript, setRawTranscript] = useState('');
  const [aiDraftMOM, setAiDraftMOM] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [draftApproved, setDraftApproved] = useState(false);
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

    // Save committee meeting
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

  const handleSimulateDownload = (committeeName, meetingDate) => {
    logActivity(`Downloaded Governance Minutes PDF: ${committeeName} (${meetingDate})`);
    alert(`📥 Evidence PDF Downloaded:\nMinutes of Meeting - ${committeeName}\nDate: ${meetingDate}\nMD5 checksum logged in Audit Vault for NABH assessors.`);
  };

  // Filter committees for searches
  const filteredCommittees = committees.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.chair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-900/30 text-white shadow-xl">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30 font-medium">
            Module 7: MOM & Governance Desk
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 flex items-center gap-2">
            Committee & Meeting Registrar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track statutory committee resolutions, draft AI minutes, and store official governance records as audit evidence.
          </p>
        </div>
        <button
          onClick={() => setActiveSubTab('registrar')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-950"
        >
          <Plus size={16} /> New Meeting MOM
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'meetings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={16} /> Active Committees & Calendars
        </button>
        <button
          onClick={() => setActiveSubTab('registrar')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'registrar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus size={16} /> Log Meeting MOM (Manual)
        </button>
        <button
          onClick={() => setActiveSubTab('ai-minutes')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'ai-minutes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={16} /> AI Minutes Compiler
        </button>
        <button
          onClick={() => setActiveSubTab('vault')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'vault'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Governance Audit Vault
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Active Committees & Meeting Calendars */}
      {activeSubTab === 'meetings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="text-indigo-500" size={18} /> Committees List
                </h2>
                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search committees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCommittees.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No committees found. Customize by adding a committee.
                  </div>
                ) : (
                  filteredCommittees.map(c => (
                    <div key={c.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-base">{c.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Chair: <span className="font-medium">{c.chair}</span> | Dept: {c.department} | Schedule: {c.frequency}
                          </p>
                        </div>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          {(c.meetings || []).length} Meetings logged
                        </span>
                      </div>

                      {/* Display recent meeting list for this committee */}
                      <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
                        {(!c.meetings || c.meetings.length === 0) ? (
                          <p className="text-xs text-slate-400 italic">No meetings logged yet for this committee.</p>
                        ) : (
                          c.meetings.slice(0, 2).map((meet, index) => (
                            <div key={index} className="text-xs space-y-1 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg">
                              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                                <span>📅 Date: {meet.date}</span>
                                <span className="text-indigo-500">MOM #{index + 1}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400">
                                <strong>Agenda:</strong> {meet.agenda}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 italic line-clamp-1">
                                {meet.minutes}
                              </p>
                              {meet.actionItems && meet.actionItems.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {meet.actionItems.map((item, keyId) => (
                                    <span key={keyId} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px]">
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
          </div>

          {/* Right sidebar: Scheduled meetings calendar info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Clock className="text-indigo-500" size={18} /> Governance Requirements
              </h2>
              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Monthly Committees</h4>
                  <ul className="list-disc pl-4 mt-1.5 space-y-1">
                    <li>Quality Assurance & Safety Committee</li>
                    <li>Infection Prevention & Control Committee</li>
                    <li>Pharmacy and Therapeutics Committee</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Quarterly Committees</h4>
                  <ul className="list-disc pl-4 mt-1.5 space-y-1">
                    <li>Blood Transfusion & Safety Committee</li>
                    <li>Medical Records Review Board</li>
                    <li>Radiation Safety Committee (AERB NOCs)</li>
                  </ul>
                </div>
                <p className="italic text-[11px] text-slate-500">
                  💡 NABH Assessors mandate that all agendas be pre-circulated 48 hours prior, and MOM digital records be published within 7 days of the meeting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Log Meeting MOM (Manual) */}
      {activeSubTab === 'registrar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Plus className="text-indigo-500" size={20} /> Log Committee Minutes of Meeting
          </h2>

          <form onSubmit={handleSaveMeeting} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Committee *
                </label>
                <select
                  value={selectedCommitteeId}
                  onChange={(e) => setSelectedCommitteeId(e.target.value)}
                  required
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
                >
                  {committees.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Meeting Date *
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Attendees (Comma separated) *
              </label>
              <input
                type="text"
                placeholder="Dr. Sarah Paul, Col. Roy, Sister Gracy"
                value={attendeesText}
                onChange={(e) => setAttendeesText(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meeting Agenda *
              </label>
              <input
                type="text"
                placeholder="Review of bio-waste disposal bags & OT sterilizer reports"
                value={agendaText}
                onChange={(e) => setAgendaText(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Discussion Minutes & Decisions *
              </label>
              <textarea
                rows={5}
                placeholder="Log decisions made here. For example: Replaced autoclaving indicators. Scheduled quarterly facility checks. Set up hand wash scores monitoring..."
                value={minutesText}
                onChange={(e) => setMinutesText(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2"
              />
            </div>

            {/* Action Items Board */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100 mb-3 flex items-center gap-1">
                🔨 Assign Action Items (Link directly to global task boards)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Task Description"
                  value={newActionItem.task}
                  onChange={(e) => setNewActionItem({ ...newActionItem, task: e.target.value })}
                  className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Assignee (e.g. Sister Gracy)"
                  value={newActionItem.assignedTo}
                  onChange={(e) => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })}
                  className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-white dark:bg-slate-900"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newActionItem.dueDate}
                    onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                    className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-white dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {actionItems.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {actionItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">✔️ {item.task}</span>
                        <span className="text-slate-500"> - Assigned to {item.assignedTo} (Due {item.dueDate})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveActionItem(item.id)}
                        className="text-red-500 hover:text-red-700 font-semibold px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('meetings')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2 rounded-lg transition"
              >
                Log MOM Records
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: AI Minutes Compiler */}
      {activeSubTab === 'ai-minutes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={18} /> Compile AI Minutes from Notes
            </h2>
            <p className="text-xs text-slate-500">
              Paste your raw voice recorder transcript, bulleted notes, or rough discussion texts below. The Copilot will generate a standardized meeting record.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Target Committee
              </label>
              <select
                value={selectedCommitteeId}
                onChange={(e) => setSelectedCommitteeId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
              >
                {committees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Paste Raw Meeting Transcripts / Notes *
              </label>
              <textarea
                rows={10}
                placeholder="Example: We met today 10th June with Col. Roy and Sarah. Gracy mentioned ICU cart had expired syringes. Roy said replace them instantly. Gracy will do it by 15th. Also discussed readiness was 68%, need SOP for expired medicine disposal (Sen to draft by 15th)..."
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3"
              />
            </div>

            <button
              onClick={handleGenerateAIDraft}
              disabled={generating || !rawTranscript.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition"
            >
              {generating ? (
                <>Generating Draft...</>
              ) : (
                <>
                  <Sparkles size={14} /> Draft Minutes of Meeting
                </>
              )}
            </button>
          </div>

          {/* AI Drafting Board */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="text-indigo-500" size={18} /> Generated Draft Minutes
            </h2>

            {!aiDraftMOM ? (
              <div className="h-64 flex flex-col justify-center items-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 p-6">
                <Compass size={24} className="animate-spin text-slate-300 mb-2" />
                <p className="text-xs">No draft generated yet. Paste transcripts on the left and click compile.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-300 p-3.5 rounded-xl space-y-2">
                  <h4 className="font-semibold text-xs flex items-center gap-1.5">
                    <Lock size={12} /> AI-Generated Draft Signature Verification Required
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Accreditation guardrails mandate human-in-the-loop review. Verify the details below and enter the 4-digit signature code to publish.
                  </p>
                  
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="password"
                      placeholder="Enter Signature PIN (1234)"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 w-44"
                    />
                    <button
                      onClick={handleApproveAIDraft}
                      disabled={draftApproved}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded transition flex items-center gap-1"
                    >
                      <Unlock size={12} /> Sign & Approve
                    </button>
                  </div>
                  {pinError && <p className="text-[10px] text-red-500 font-semibold mt-1">{pinError}</p>}
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="border-b pb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {aiDraftMOM.committeeName}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Meeting Date: {aiDraftMOM.date}</p>
                  </div>

                  <p><strong>Attendees:</strong> {aiDraftMOM.attendees.join(', ')}</p>
                  <p><strong>Agenda:</strong> {aiDraftMOM.agenda}</p>
                  <p className="whitespace-pre-line font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded border">
                    {aiDraftMOM.minutes}
                  </p>

                  <div className="pt-2 border-t">
                    <h4 className="font-semibold text-slate-950 dark:text-slate-100 mb-1.5">Action Items formulated:</h4>
                    <ul className="space-y-1">
                      {aiDraftMOM.actionItems.map((item, idx) => (
                        <li key={idx} className="flex justify-between bg-slate-50 dark:bg-slate-900 p-1.5 rounded text-[11px]">
                          <span>✔️ {item.task} ({item.assignedTo})</span>
                          <span className="text-[10px] text-slate-400">Due: {item.dueDate}</span>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Governance Audit Vault</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download verified and signed Minutes of Meetings for legal compliance checklists.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-semibold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
              NABH 6th Edition Compliant Vault
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Committee Name</th>
                  <th className="pb-3">Meeting Date</th>
                  <th className="pb-3">Attendees</th>
                  <th className="pb-3">Key Agendas / Discussion</th>
                  <th className="pb-3 text-center">Action Items</th>
                  <th className="pb-3 text-center">Audit Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {committees.map(c =>
                  (c.meetings || []).map((meet, mIdx) => (
                    <tr key={`${c.id}-${mIdx}`} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="py-3">{meet.date}</td>
                      <td className="py-3 max-w-[150px] truncate">{meet.attendees.join(', ')}</td>
                      <td className="py-3 max-w-xs truncate">{meet.agenda}</td>
                      <td className="py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {meet.actionItems ? meet.actionItems.length : 0}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleSimulateDownload(c.name, meet.date)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <FileDown size={14} /> Download PDF
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
