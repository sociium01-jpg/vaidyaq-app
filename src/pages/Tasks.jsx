import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { runAIOrchestration } from '../services/aiOrchestrator';
import {
  ListTodo, Plus, CheckCircle2, Circle, Calendar, AlertCircle, 
  ArrowRight, Check, X, ShieldAlert, Tag, User, Clock, CheckCircle,
  Sparkles, RefreshCw, Layers, Columns, Trash2, Edit2, Play, CheckSquare, PlusSquare, AlertTriangle, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

const UPGRADED_STATUSES = [
  'Backlog',
  'To Do',
  'In Progress',
  'Waiting for Evidence',
  'Under Review',
  'Rework Required',
  'Done',
  'Closed'
];

const STATUS_COLORS = {
  'Backlog': { border: 'var(--text-tertiary)', bg: 'rgba(156, 163, 175, 0.1)', text: 'var(--text-secondary)' },
  'To Do': { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' },
  'In Progress': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
  'Waiting for Evidence': { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
  'Under Review': { border: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)', text: '#14b8a6' },
  'Rework Required': { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  'Done': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
  'Closed': { border: '#059669', bg: 'rgba(5, 150, 105, 0.15)', text: '#059669' }
};

export default function Tasks() {
  const {
    tasks,
    addHospitalTask,
    updateHospitalTaskStatus,
    deleteHospitalTask,
    teamMembers,
    standards,
    setStandards,
    currentUser,
    documents,
    logActivity,
    aiSettings,
    getDecryptedKey,
    createAiOutput,
    logAiUsage,
    logAiSafety,
    aiMemory,
    aiOutputs,
    updateAiOutputStatus,
    hospitalName,
    sprints,
    setSprints,
    currentRoute,
    setCurrentRoute
  } = useContext(QualiNABHContext);

  // Parse routing tabs
  const parts = currentRoute.split('/').filter(Boolean);
  const activeTab = parts[3] || 'list'; // 'list', 'kanban', 'backlog'

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAiPlanner, setShowAiPlanner] = useState(false);
  const [aiGoalText, setAiGoalText] = useState('');
  const [aiPlannerLoading, setAiPlannerLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  
  const [newForm, setNewForm] = useState({ 
    title: '', 
    assignedMemberEmail: '', 
    priority: 'Medium', 
    dueDate: '', 
    mappedStandard: '',
    status: 'To Do',
    sprintId: ''
  });
  
  const [filterDept, setFilterDept] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeDragOverCol, setActiveDragOverCol] = useState(null);
  
  // Sprint Management States
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [newSprintForm, setNewSprintForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [sprintCompleteModal, setSprintCompleteModal] = useState(null); // sprint object to complete
  const [incompleteTasksAction, setIncompleteTasksAction] = useState('backlog'); // 'backlog' or sprintId
  const [collapsedSprints, setCollapsedSprints] = useState({});

  // Helper to normalize legacy statuses
  const getTaskStatus = (task) => {
    if (task.status === 'Pending') return 'To Do';
    if (task.status === 'Completed') return 'Closed';
    return task.status || 'To Do';
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colName) => {
    e.preventDefault();
    if (activeDragOverCol !== colName) {
      setActiveDragOverCol(colName);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        if (!canChangeStatus(task, targetStatus)) {
          setErrorMsg(`Security Denied: You do not have permissions to move this task to "${targetStatus}".`);
          setTimeout(() => setErrorMsg(''), 5000);
          setActiveDragOverCol(null);
          return;
        }

        if (targetStatus === 'Closed' || targetStatus === 'Done') {
          handleVerifyAndApprove(task, targetStatus);
        } else {
          updateHospitalTaskStatus(taskId, targetStatus);
          logActivity(`Dragged task "${task.title}" to stage: ${targetStatus}`);
        }
      }
    }
    setActiveDragOverCol(null);
  };

  // Role Privilege Controls
  const canAssignTasks = currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Quality Head' || currentUser.role === 'Department Head');
  
  const canChangeStatus = (task, targetStatus) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    
    // Viewer is read-only
    if (role === 'Viewer') return false;
    
    // Super Admin and Quality Head can transition anything
    if (role === 'Super Admin' || role === 'Quality Head') return true;
    
    // HODs can transition anything within their department
    if (role === 'Department Head') {
      return task.department === currentUser.department;
    }
    
    // Staff can transition their own assigned tasks but CANNOT move to Closed or Done
    if (role === 'Staff') {
      const isAssigned = task.assignedToEmail === currentUser.email;
      const isClosing = targetStatus === 'Closed' || targetStatus === 'Done';
      return isAssigned && !isClosing;
    }
    
    return false;
  };

  const handleGenerateAiTasks = async (e) => {
    e.preventDefault();
    if (!aiGoalText.trim()) return;
    setAiPlannerLoading(true);
    setSuggestedTasks([]);
    try {
      const prompt = `Act as an expert hospital quality auditor and task planner. Break down the following accreditation readiness goal or standard criteria into a list of 3-4 specific department tasks.
Goal: ${aiGoalText}
For each task, provide:
- A descriptive title
- Priority level (High, Medium, or Low)
- Target role responsible (e.g. Quality Head, Super Admin, Department Head, Auditor, Staff)
- Mapped Standard ID (if applicable)

Please output your answer EXACTLY as a JSON array of objects conforming to this schema, with no other text or markdown wrapping:
[{"title": "Task Action Name", "priority": "High"|"Medium"|"Low", "assignedRole": "Quality Head"|"Super Admin"|"Auditor"|"Department Head"|"Staff", "mappedStandard": "Standard ID"}]`;

      const result = await runAIOrchestration({
        module: 'tasks',
        agentType: 'Task Breakdown',
        prompt: prompt,
        chatHistory: [],
        contextData: {
          goal: aiGoalText,
          hospitalName
        },
        aiSettings,
        currentUser,
        hospitalName,
        aiMemory,
        getDecryptedKey,
        createAiOutput,
        logAiUsage,
        logAiSafety
      });

      if (result.success) {
        const text = result.text.trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        try {
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed)) {
            const suggestionWithDetails = parsed.map((item, index) => {
              const matchedMember = teamMembers.find(m => m.role.toLowerCase().includes(item.assignedRole.toLowerCase())) || teamMembers[0];
              return {
                id: `s-task-${Date.now()}-${index}`,
                title: item.title,
                priority: item.priority || 'Medium',
                assignedTo: matchedMember.name,
                assignedToEmail: matchedMember.email,
                department: matchedMember.department || 'Quality Control',
                mappedStandard: item.mappedStandard || '',
                selected: true
              };
            });
            setSuggestedTasks(suggestionWithDetails);
          } else {
            throw new Error("Response was not a JSON array.");
          }
        } catch (jsonErr) {
          console.error("JSON parsing error:", jsonErr, text);
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          const customList = lines.slice(0, 4).map((line, idx) => {
            const cleanTitle = line.replace(/^\d+[\.\s\-]+/, '');
            const matchedMember = teamMembers[0];
            return {
              id: `s-task-${Date.now()}-${idx}`,
              title: cleanTitle.substring(0, 100),
              priority: 'Medium',
              assignedTo: matchedMember.name,
              assignedToEmail: matchedMember.email,
              department: matchedMember.department || 'Quality Control',
              mappedStandard: '',
              selected: true
            };
          });
          setSuggestedTasks(customList);
        }
        logActivity(`Generated AI task breakdown suggestions for goal: "${aiGoalText}"`);
      } else {
        alert(`Failed to plan tasks: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error planning tasks: ${err.message}`);
    } finally {
      setAiPlannerLoading(false);
    }
  };

  const handleApplyAiTasks = () => {
    const selected = suggestedTasks.filter(t => t.selected);
    if (selected.length === 0) return;
    
    selected.forEach(task => {
      addHospitalTask({
        title: task.title,
        assignedTo: task.assignedTo,
        assignedToEmail: task.assignedToEmail,
        department: task.department,
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
        priority: task.priority,
        mappedStandard: task.mappedStandard,
        status: 'To Do'
      });
    });

    setSuggestedTasks([]);
    setAiGoalText('');
    setShowAiPlanner(false);
    setSuccessMsg(`Successfully created ${selected.length} AI planned tasks!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Enforce department privacy and interactive filters
  const getFilteredTasks = () => {
    let list = [...tasks];
    
    if (currentUser && currentUser.role !== 'Super Admin' && currentUser.role !== 'Quality Head') {
      const userDept = currentUser.department;
      list = list.filter(t => t.department === userDept || t.assignedToEmail === currentUser.email);
    }

    if (filterDept !== 'All') {
      list = list.filter(t => t.department === filterDept);
    }
    
    return list;
  };

  const filteredTasks = getFilteredTasks();

  const handleCreateTask = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newForm.title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }
    if (!newForm.assignedMemberEmail) {
      setErrorMsg('Please select an assigned staff member.');
      return;
    }

    const member = teamMembers.find(m => m.email.toLowerCase() === newForm.assignedMemberEmail.toLowerCase());
    if (!member) {
      setErrorMsg('Selected team member not found.');
      return;
    }

    const taskData = {
      title: newForm.title,
      assignedTo: member.name,
      assignedToEmail: member.email,
      department: member.department || 'Quality Control',
      dueDate: newForm.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
      priority: newForm.priority,
      mappedStandard: newForm.mappedStandard,
      status: newForm.status || 'To Do'
    };

    const taskId = addHospitalTask(taskData);
    
    // Relational mapping to Sprints if selected
    if (newForm.sprintId && taskId) {
      setSprints(prev => prev.map(s => {
        if (s.id === newForm.sprintId) {
          return { ...s, targets: [...(s.targets || []), taskId] };
        }
        return s;
      }));
    }

    setSuccessMsg(`Task successfully assigned to ${member.name}!`);
    setNewForm({ title: '', assignedMemberEmail: '', priority: 'Medium', dueDate: '', mappedStandard: '', status: 'To Do', sprintId: '' });
    setShowTaskModal(false);
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleVerifyAndApprove = (task, targetStatus = 'Closed') => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!task.mappedStandard) {
      updateHospitalTaskStatus(task.id, targetStatus);
      setSuccessMsg(`Task "${task.title}" marked as ${targetStatus}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    // Evidence check in Document Vault
    const matchingDocs = documents.filter(doc => 
      doc.mappedStandards && 
      doc.mappedStandards.some(s => s.toLowerCase() === task.mappedStandard.toLowerCase())
    );

    const hasApprovedDoc = matchingDocs.some(doc => doc.status === 'Approved');

    if (!hasApprovedDoc) {
      setErrorMsg(`Cannot complete sign-off. Compliance evidence check failed: No approved SOP or audit checklist found in the Document Vault mapped to standard [${task.mappedStandard}].`);
      logActivity(`Failed task verification check for standard ${task.mappedStandard}: Missing evidence document`);
      setTimeout(() => setErrorMsg(''), 6000);
      return;
    }

    updateHospitalTaskStatus(task.id, targetStatus);
    
    // Automatically upgrade points in Context
    setStandards(prev => prev.map(std => {
      if (std.id.toLowerCase() === task.mappedStandard.toLowerCase()) {
        logActivity(`Automatically upgraded compliance score for standard ${std.id} to 10 (Fully Met) via verified task audit closure.`);
        return { ...std, score: 10, status: "Fully Met" };
      }
      return std;
    }));

    setSuccessMsg(`✓ Compliance check passed! Mapped evidence document found. Task signed-off and standard [${task.mappedStandard}] score upgraded to 10.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Sprint CRUD Methods
  const handleCreateSprint = (e) => {
    e.preventDefault();
    if (!newSprintForm.name.trim()) return;

    const newSprint = {
      id: `sprint-${Date.now()}`,
      name: newSprintForm.name,
      status: 'Planned',
      startDate: newSprintForm.startDate || new Date().toISOString().slice(0, 10),
      endDate: newSprintForm.endDate || new Date(Date.now() + 14*24*60*60*1000).toISOString().slice(0, 10),
      targets: []
    };

    setSprints(prev => [...prev, newSprint]);
    logActivity(`Created sprint plan: "${newSprint.name}"`);
    setNewSprintForm({ name: '', startDate: '', endDate: '' });
    setShowSprintModal(false);
  };

  const handleStartSprint = (sprintId) => {
    // There can be only one Active sprint at a time. Mark others as Planned.
    setSprints(prev => prev.map(s => {
      if (s.id === sprintId) {
        logActivity(`Started sprint: "${s.name}"`);
        return { ...s, status: 'Active' };
      }
      if (s.status === 'Active') {
        return { ...s, status: 'Planned' };
      }
      return s;
    }));
  };

  const handleCompleteSprint = () => {
    if (!sprintCompleteModal) return;
    const sprintId = sprintCompleteModal.id;

    // Fetch unfinished tasks in this completed sprint
    const sprintTasks = tasks.filter(t => sprintCompleteModal.targets && sprintCompleteModal.targets.includes(t.id));
    const unfinishedTaskIds = sprintTasks
      .filter(t => !['Completed', 'Closed', 'Done'].includes(t.status) && t.status !== 'Completed')
      .map(t => t.id);

    // Apply action for incomplete tasks
    if (unfinishedTaskIds.length > 0) {
      if (incompleteTasksAction === 'backlog') {
        // Remove target tasks from the completed sprint targets list
        setSprints(prev => prev.map(s => {
          if (s.id === sprintId) {
            return {
              ...s,
              status: 'Completed',
              targets: s.targets.filter(tid => !unfinishedTaskIds.includes(tid))
            };
          }
          return s;
        }));
        logActivity(`Completed sprint: "${sprintCompleteModal.name}". Moved ${unfinishedTaskIds.length} unfinished tasks back to Backlog.`);
      } else {
        // Move targets to another sprint
        setSprints(prev => prev.map(s => {
          if (s.id === sprintId) {
            return {
              ...s,
              status: 'Completed',
              targets: s.targets.filter(tid => !unfinishedTaskIds.includes(tid))
            };
          }
          if (s.id === incompleteTasksAction) {
            return {
              ...s,
              targets: [...(s.targets || []), ...unfinishedTaskIds]
            };
          }
          return s;
        }));
        logActivity(`Completed sprint: "${sprintCompleteModal.name}". Rolled ${unfinishedTaskIds.length} unfinished tasks into Sprint.`);
      }
    } else {
      // Just complete it
      setSprints(prev => prev.map(s => {
        if (s.id === sprintId) {
          return { ...s, status: 'Completed' };
        }
        return s;
      }));
      logActivity(`Completed sprint: "${sprintCompleteModal.name}" with 100% completion rate.`);
    }

    setSprintCompleteModal(null);
  };

  const handleDeleteSprint = (sprintId, sprintName) => {
    if (confirm(`Are you sure you want to delete sprint "${sprintName}"? Action items will be returned to the backlog.`)) {
      setSprints(prev => prev.filter(s => s.id !== sprintId));
      logActivity(`Deleted sprint: "${sprintName}"`);
    }
  };

  const toggleSprintCollapse = (id) => {
    setCollapsedSprints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Assign task to a sprint from Backlog view dropdown
  const handleAssignTaskToSprint = (taskId, targetSprintId) => {
    setSprints(prev => prev.map(s => {
      // Remove from all other sprints
      let targets = s.targets || [];
      if (s.id === targetSprintId) {
        if (!targets.includes(taskId)) {
          targets = [...targets, taskId];
        }
      } else {
        targets = targets.filter(tid => tid !== taskId);
      }
      return { ...s, targets };
    }));
    
    // Also, if dragging into sprint planning, make sure its status is Backlog or To Do
    const targetSprint = sprints.find(s => s.id === targetSprintId);
    logActivity(`Assigned task ${taskId} to sprint: "${targetSprint ? targetSprint.name : 'Backlog'}"`);
  };

  const handleRemoveTaskFromSprint = (taskId, sprintId) => {
    setSprints(prev => prev.map(s => {
      if (s.id === sprintId) {
        return { ...s, targets: (s.targets || []).filter(tid => tid !== taskId) };
      }
      return s;
    }));
    logActivity(`Removed task ${taskId} from sprint.`);
  };

  // Sprints lookup map
  const activeSprint = sprints.find(s => s.status === 'Active');
  const plannedSprints = sprints.filter(s => s.status === 'Planned');
  const completedSprints = sprints.filter(s => s.status === 'Completed');

  // Identify backlog tasks (not inside any active/planned sprint targets)
  const sprintTaskIds = sprints
    .filter(s => s.status === 'Active' || s.status === 'Planned')
    .reduce((arr, s) => [...arr, ...(s.targets || [])], []);
  
  const backlogTasks = filteredTasks.filter(t => !sprintTaskIds.includes(t.id));

  // Change tab routing
  const navigateTab = (tab) => {
    setCurrentRoute(`/app/${currentUser.hospitalId}/tasks/${tab}`);
  };

  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Top Section */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListTodo size={28} style={{ color: 'var(--primary)' }} />
            <span>Task & Sprints Engine</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Coordinate hospital accreditation preparation sprints, mock drills, evidence uploads, and dual-signoff workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <select 
            className="form-control"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{ padding: '0.45rem 1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}
          >
            <option value="All">All Departments</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="ICU">Intensive Care (ICU)</option>
            <option value="Emergency">Emergency</option>
            <option value="OPD">OPD Clinic</option>
          </select>

          {/* Action buttons */}
          {canAssignTasks && (
            <>
              <button 
                onClick={() => setShowAiPlanner(!showAiPlanner)} 
                className="btn btn-secondary flex align-center gap-1" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '8px' }}
              >
                <Sparkles size={14} color="var(--primary)" />
                <span>AI Planner</span>
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', borderRadius: '8px' }}>
                <Plus size={16} /> Assign Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs View Bar */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => navigateTab('list')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'list' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'list' ? 'bold' : 'normal',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: activeTab === 'list' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <ListTodo size={14} />
          <span>List View</span>
        </button>

        <button
          onClick={() => navigateTab('kanban')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'kanban' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeTab === 'kanban' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'kanban' ? 'bold' : 'normal',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: activeTab === 'kanban' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <Columns size={14} />
          <span>Kanban Board</span>
        </button>

        <button
          onClick={() => navigateTab('backlog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'backlog' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeTab === 'backlog' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'backlog' ? 'bold' : 'normal',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: activeTab === 'backlog' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <Layers size={14} />
          <span>Sprint Planning</span>
        </button>
      </div>

      {/* AI Task Planner panel */}
      {showAiPlanner && (
        <div className="card" style={{ border: '1px dashed var(--primary)', background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', borderRadius: '12px', boxShadow: 'var(--shadow-glow)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>AI Task Breakdown Agent</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Enter a high-level goal, department objective, or standard ID (e.g. COP.3.b) and let the AI breakdown agent suggest specific assignments for your team.
          </p>

          <form onSubmit={handleGenerateAiTasks} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Conduct double-verification training on Pharmacy locks"
              value={aiGoalText}
              onChange={(e) => setAiGoalText(e.target.value)}
              required
              disabled={aiPlannerLoading}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
            />
            <button type="submit" className="btn btn-primary flex align-center gap-1" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }} disabled={aiPlannerLoading || !aiSettings?.enabled}>
              {aiPlannerLoading ? <RefreshCw size={12} className="animate-spin" /> : null}
              <span>{aiPlannerLoading ? 'Planning...' : 'Break Down'}</span>
            </button>
          </form>

          {suggestedTasks.length > 0 && (
            <div className="flex flex-col gap-3 animate-fade-in" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>AI Suggested Assignments (Verify details before approving)</h4>
              <div className="flex flex-col gap-2">
                {suggestedTasks.map((t, idx) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <input 
                      type="checkbox" 
                      checked={t.selected}
                      onChange={() => {
                        setSuggestedTasks(prev => prev.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item));
                      }}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }} className="flex flex-col gap-1">
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ fontSize: '0.8rem', padding: '4px 8px', width: '100%' }}
                        value={t.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSuggestedTasks(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                        }}
                      />
                      <div className="flex gap-3 align-center" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <label className="flex align-center gap-1">
                          <span>Priority: </span>
                          <select 
                            value={t.priority}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSuggestedTasks(prev => prev.map((item, i) => i === idx ? { ...item, priority: val } : item));
                            }}
                            style={{ padding: '2px 4px', fontSize: '0.7rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </label>
                        <label className="flex align-center gap-1">
                          <span>Assignee: </span>
                          <select 
                            value={t.assignedToEmail}
                            onChange={(e) => {
                              const email = e.target.value;
                              const member = teamMembers.find(m => m.email === email);
                              setSuggestedTasks(prev => prev.map((item, i) => i === idx ? { ...item, assignedTo: member.name, assignedToEmail: member.email, department: member.department } : item));
                            }}
                            style={{ padding: '2px 4px', fontSize: '0.7rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                          >
                            {teamMembers.map(m => (
                              <option key={m.email} value={m.email}>{m.name} ({m.role})</option>
                            ))}
                          </select>
                        </label>
                        {t.mappedStandard && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>NABH: {t.mappedStandard}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSuggestedTasks([])} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>Clear</button>
                <button type="button" className="btn btn-primary" onClick={handleApplyAiTasks} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>Approve & Create Tasks</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="card" style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '0.8rem 1.2rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="card" style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', padding: '0.8rem 1.2rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Main View Display */}
      {filteredTasks.length === 0 ? (
        <EmptyState 
          type="tasks" 
          action={
            canAssignTasks && (
              <button 
                onClick={() => setShowTaskModal(true)} 
                className="btn btn-primary"
                style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
              >
                <Plus size={16} /> Assign Action Task
              </button>
            )
          } 
        />
      ) : (
        <>
          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Task Details</th>
                    <th style={{ padding: '0.75rem' }}>Priority</th>
                    <th style={{ padding: '0.75rem' }}>Owner</th>
                    <th style={{ padding: '0.75rem' }}>Due Date</th>
                    <th style={{ padding: '0.75rem' }}>NABH Criteria</th>
                    <th style={{ padding: '0.75rem' }}>Stage</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => {
                    const taskStatus = getTaskStatus(task);
                    const isClosed = ['Completed', 'Done', 'Closed'].includes(taskStatus);
                    return (
                      <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600, maxWidth: '280px' }}>
                          <div>{task.title}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600 }}>{task.assignedTo}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{task.department}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
                            <span>{task.dueDate}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {task.mappedStandard ? (
                            <span className="badge badge-neutral" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                              {task.mappedStandard}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span 
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              border: `1px solid ${STATUS_COLORS[taskStatus]?.border || 'var(--border-color)'}`,
                              background: STATUS_COLORS[taskStatus]?.bg || 'transparent',
                              color: STATUS_COLORS[taskStatus]?.text || 'var(--text-primary)'
                            }}
                          >
                            {taskStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            {taskStatus === 'To Do' && canChangeStatus(task, 'In Progress') && (
                              <button 
                                onClick={() => updateHospitalTaskStatus(task.id, 'In Progress')}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                              >
                                Start Work
                              </button>
                            )}

                            {taskStatus === 'In Progress' && canChangeStatus(task, 'Waiting for Evidence') && (
                              <button 
                                onClick={() => updateHospitalTaskStatus(task.id, 'Waiting for Evidence')}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                              >
                                Ask Evidence
                              </button>
                            )}

                            {['In Progress', 'Waiting for Evidence', 'Rework Required'].includes(taskStatus) && canChangeStatus(task, 'Under Review') && (
                              <button 
                                onClick={() => updateHospitalTaskStatus(task.id, 'Under Review')}
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                              >
                                Request Sign-off
                              </button>
                            )}

                            {taskStatus === 'Under Review' && (
                              currentUser?.role === 'Super Admin' || currentUser?.role === 'Quality Head' || (currentUser?.role === 'Department Head' && task.department === currentUser?.department)
                            ) && (
                              <>
                                <button 
                                  onClick={() => handleVerifyAndApprove(task, 'Closed')}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                                >
                                  Sign-off
                                </button>
                                <button 
                                  onClick={() => {
                                    updateHospitalTaskStatus(task.id, 'Rework Required');
                                    logActivity(`Rejected sign-off request for task "${task.title}". Returned to Rework Required.`);
                                  }}
                                  className="btn btn-danger"
                                  style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {isClosed && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                <CheckCircle size={14} /> Approved
                              </span>
                            )}

                            {canAssignTasks && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete task "${task.title}"?`)) {
                                    deleteHospitalTask(task.id);
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                                title="Delete Task"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '500px', alignItems: 'flex-start' }}>
              {UPGRADED_STATUSES.map(colName => {
                const taskList = filteredTasks.filter(t => getTaskStatus(t) === colName);
                const colColors = STATUS_COLORS[colName] || { border: 'var(--border-color)', bg: 'transparent', text: 'var(--text-primary)' };

                return (
                  <div 
                    key={colName}
                    onDragOver={(e) => handleDragOver(e, colName)}
                    onDragLeave={() => setActiveDragOverCol(null)}
                    onDrop={(e) => handleDrop(e, colName)}
                    style={{
                      flex: '0 0 280px',
                      minWidth: '280px',
                      backgroundColor: activeDragOverCol === colName ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-secondary)',
                      borderRadius: '12px',
                      border: activeDragOverCol === colName ? '2px dashed var(--primary)' : '1px solid var(--border-color)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      minHeight: '450px',
                      transition: 'all 200ms ease'
                    }}
                  >
                    {/* Column Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', borderBottom: `2px solid ${colColors.border}`, paddingBottom: '0.5rem', marginBottom: '0.25rem' }} className="justify-between">
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: colColors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colColors.border, display: 'inline-block' }} />
                        {colName}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {taskList.length}
                      </span>
                    </div>

                    {/* Task Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '550px', flex: 1 }}>
                      {taskList.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                          No tasks in this stage
                        </div>
                      ) : (
                        taskList.map(task => {
                          const isClosed = ['Completed', 'Done', 'Closed'].includes(colName);
                          return (
                            <div
                              key={task.id}
                              draggable={!isClosed}
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              className="card animate-fade-in"
                              style={{
                                padding: '0.85rem',
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                cursor: isClosed ? 'default' : 'grab',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'transform 150ms ease, box-shadow 150ms ease'
                              }}
                            >
                              <div className="flex align-center justify-between">
                                <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.6rem' }}>
                                  {task.priority} Priority
                                </span>
                                {canAssignTasks && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete task "${task.title}"?`)) {
                                        deleteHospitalTask(task.id);
                                      }
                                    }}
                                    style={{ color: 'var(--text-tertiary)', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                                {task.title}
                              </h4>

                              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '3px' }} className="text-secondary">
                                <div className="flex align-center gap-1">
                                  <User size={10} style={{ color: 'var(--primary)' }} />
                                  <span>{task.assignedTo} ({task.department})</span>
                                </div>
                                <div className="flex align-center gap-1">
                                  <Clock size={10} />
                                  <span>Due: {task.dueDate}</span>
                                </div>
                                {task.mappedStandard && (
                                  <div className="flex align-center gap-1">
                                    <Tag size={10} style={{ color: 'var(--color-warning)' }} />
                                    <span>NABH: <strong style={{ color: 'var(--primary)' }}>{task.mappedStandard}</strong></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SPRINT PLANNING & BACKLOG */}
          {activeTab === 'backlog' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem', alignItems: 'flex-start' }} className="grid-responsive-1col">
              
              {/* BACKLOG PANEL (Left) */}
              <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={18} style={{ color: 'var(--text-secondary)' }} />
                      <span>Product Backlog</span>
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', margin: '2px 0 0 0' }}>
                      Unscheduled quality audit targets and action items.
                    </p>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    {backlogTasks.length} Tasks
                  </span>
                </div>

                {/* Backlog List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '600px', overflowY: 'auto' }}>
                  {backlogTasks.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.75rem' }}>
                      No tasks in backlog. All assignments are scheduled!
                    </div>
                  ) : (
                    backlogTasks.map(task => {
                      const taskStatus = getTaskStatus(task);
                      return (
                        <div 
                          key={task.id} 
                          className="card"
                          style={{
                            padding: '0.85rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <div className="flex align-center justify-between">
                            <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.6rem' }}>
                              {task.priority}
                            </span>
                            
                            {/* Sprint assignment dropdown */}
                            {canAssignTasks && (
                              <select
                                onChange={(e) => handleAssignTaskToSprint(task.id, e.target.value)}
                                value=""
                                style={{ padding: '2px 6px', fontSize: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                              >
                                <option value="">Assign to Sprint...</option>
                                {activeSprint && <option value={activeSprint.id}>⚡ Active: {activeSprint.name}</option>}
                                {plannedSprints.map(ps => (
                                  <option key={ps.id} value={ps.id}>📅 Planned: {ps.name}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            {task.title}
                          </h4>

                          <div className="flex justify-between align-center" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                            <span>Owner: <strong>{task.assignedTo}</strong></span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SPRINT CONTROL CENTER (Right) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Header & Create Sprint Button */}
                <div className="flex justify-between align-center">
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Sprint Control Center</h3>
                  {canAssignTasks && (
                    <button 
                      onClick={() => setShowSprintModal(true)} 
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', borderRadius: '8px' }}
                    >
                      <PlusSquare size={14} /> Create Sprint Plan
                    </button>
                  )}
                </div>

                {/* Sprints Board */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* SECTION A: ACTIVE SPRINT */}
                  {activeSprint ? (
                    (() => {
                      const sprintTasks = tasks.filter(t => activeSprint.targets && activeSprint.targets.includes(t.id));
                      const completedCount = sprintTasks.filter(t => ['Completed', 'Done', 'Closed'].includes(getTaskStatus(t))).length;
                      const progressPct = sprintTasks.length > 0 ? Math.round((completedCount / sprintTasks.length) * 100) : 0;
                      const isCollapsed = collapsedSprints[activeSprint.id];

                      return (
                        <div 
                          className="card animate-fade-in"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '2px solid var(--primary)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            boxShadow: 'var(--shadow-glow)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                          }}
                        >
                          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            <div className="flex align-center gap-2">
                              <Play size={14} style={{ color: 'var(--primary)' }} />
                              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{activeSprint.name}</span>
                              <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {canAssignTasks && (
                                <button 
                                  onClick={() => setSprintCompleteModal(activeSprint)}
                                  className="btn btn-primary"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Complete Sprint
                                </button>
                              )}
                              <button 
                                onClick={() => toggleSprintCollapse(activeSprint.id)}
                                style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                              >
                                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between align-center" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>Duration: <strong>{activeSprint.startDate}</strong> to <strong>{activeSprint.endDate}</strong></span>
                            <span>Progress: <strong>{progressPct}%</strong> ({completedCount}/{sprintTasks.length} Done)</span>
                          </div>

                          {/* Progress bar */}
                          <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
                          </div>

                          {/* Tasks list */}
                          {!isCollapsed && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {sprintTasks.length === 0 ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.75rem' }}>
                                  No tasks mapped to this active sprint. Drag or move tasks from backlog!
                                </div>
                              ) : (
                                sprintTasks.map(t => {
                                  const tStatus = getTaskStatus(t);
                                  return (
                                    <div key={t.id} style={{ display: 'flex', justify: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }} className="justify-between">
                                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {t.title}
                                      </div>
                                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span 
                                          style={{
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            border: `1px solid ${STATUS_COLORS[tStatus]?.border || 'var(--border-color)'}`,
                                            background: STATUS_COLORS[tStatus]?.bg || 'transparent',
                                            color: STATUS_COLORS[tStatus]?.text || 'var(--text-primary)'
                                          }}
                                        >
                                          {tStatus}
                                        </span>
                                        {canAssignTasks && (
                                          <button 
                                            onClick={() => handleRemoveTaskFromSprint(t.id, activeSprint.id)}
                                            style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                            title="Move to Backlog"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)', fontSize: '0.8rem' }}>
                      💡 No active sprint running. Choose a planned sprint below and click "Start Sprint".
                    </div>
                  )}

                  {/* SECTION B: PLANNED SPRINTS */}
                  {plannedSprints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Planned Sprints ({plannedSprints.length})
                      </h4>
                      {plannedSprints.map(s => {
                        const sprintTasks = tasks.filter(t => s.targets && s.targets.includes(t.id));
                        const isCollapsed = collapsedSprints[s.id];

                        return (
                          <div 
                            key={s.id}
                            className="card"
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}
                          >
                            <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                              <div className="flex align-center gap-1">
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.name}</span>
                                <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>Planned</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {canAssignTasks && (
                                  <>
                                    <button 
                                      onClick={() => handleStartSprint(s.id)}
                                      className="btn btn-secondary flex align-center gap-1"
                                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                      <Play size={10} /> Start Sprint
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSprint(s.id, s.name)}
                                      style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => toggleSprintCollapse(s.id)}
                                  style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                  {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </button>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              Schedule: <strong>{s.startDate}</strong> to <strong>{s.endDate}</strong> | <strong>{sprintTasks.length} Tasks</strong>
                            </div>

                            {!isCollapsed && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.4rem' }}>
                                {sprintTasks.length === 0 ? (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                    No tasks assigned yet.
                                  </span>
                                ) : (
                                  sprintTasks.map(t => (
                                    <div key={t.id} style={{ display: 'flex', justify: 'space-between', padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', alignItems: 'center' }} className="justify-between">
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)' }}>{t.title}</span>
                                      {canAssignTasks && (
                                        <button 
                                          onClick={() => handleRemoveTaskFromSprint(t.id, s.id)}
                                          style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SECTION C: COMPLETED SPRINTS */}
                  {completedSprints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Completed Sprints ({completedSprints.length})
                      </h4>
                      {completedSprints.map(s => {
                        const sprintTasks = tasks.filter(t => s.targets && s.targets.includes(t.id));
                        const isCollapsed = collapsedSprints[s.id] !== false; // collapsed by default

                        return (
                          <div 
                            key={s.id}
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '10px',
                              padding: '0.75rem 1rem',
                              opacity: 0.7,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div className="flex justify-between align-center">
                              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                              <div className="flex align-center gap-2">
                                <span className="badge badge-neutral" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>Archived</span>
                                <button 
                                  onClick={() => toggleSprintCollapse(s.id)}
                                  style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                  {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                </button>
                              </div>
                            </div>

                            {!isCollapsed && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                <div>Duration: {s.startDate} to {s.endDate}</div>
                                <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {sprintTasks.map(t => (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <CheckCircle2 size={10} style={{ color: 'var(--color-success)' }} />
                                      <span>{t.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* Assign Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div className="modal-content card animate-fade-in" style={{ maxWidth: '500px', width: '90%', padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="modal-header flex justify-between align-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Assign Department Task</h3>
              <button onClick={() => setShowTaskModal(false)} style={{ fontSize: '1.25rem', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Task Description / Action Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Conduct double-verification drill on Pharmacy locks"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Assign Owner (From active team members)</label>
                  <select
                    className="form-control"
                    required
                    value={newForm.assignedMemberEmail}
                    onChange={(e) => setNewForm({ ...newForm, assignedMemberEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">-- Select Team Member --</option>
                    {teamMembers.map((m, idx) => (
                      <option key={idx} value={m.email}>
                        {m.name} ({m.role} - {m.department || 'All'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Map to NABH Standard (Optional)</label>
                  <select
                    className="form-control"
                    value={newForm.mappedStandard}
                    onChange={(e) => setNewForm({ ...newForm, mappedStandard: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">-- Select Standard Criteria --</option>
                    {standards.map((s, idx) => (
                      <option key={idx} value={s.id}>
                        {s.id}: {s.title} ({s.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Sprint Group (Optional)</label>
                  <select
                    className="form-control"
                    value={newForm.sprintId}
                    onChange={(e) => setNewForm({ ...newForm, sprintId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">-- Add to Sprints Backlog --</option>
                    {activeSprint && <option value={activeSprint.id}>⚡ Active: {activeSprint.name}</option>}
                    {plannedSprints.map(ps => (
                      <option key={ps.id} value={ps.id}>📅 Planned: {ps.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Target Due Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={newForm.dueDate}
                      onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Task Priority</label>
                    <select
                      className="form-control"
                      value={newForm.priority}
                      onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                      <option value="High">High (Urgent)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Initial Status Stage</label>
                  <select
                    className="form-control"
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer flex justify-end gap-2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showSprintModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div className="modal-content card animate-fade-in" style={{ maxWidth: '400px', width: '90%', padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="modal-header flex justify-between align-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Create Sprint Plan</h3>
              <button onClick={() => setShowSprintModal(false)} style={{ fontSize: '1.25rem', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateSprint}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Sprint Identifier / Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Sprint 3 - Facility Standards"
                    value={newSprintForm.name}
                    onChange={(e) => setNewSprintForm({ ...newSprintForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newSprintForm.startDate}
                    onChange={(e) => setNewSprintForm({ ...newSprintForm, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>End Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newSprintForm.endDate}
                    onChange={(e) => setNewSprintForm({ ...newSprintForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowSprintModal(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Create Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sprint Complete Modal */}
      {sprintCompleteModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001 }}>
          <div className="modal-content card animate-fade-in" style={{ maxWidth: '450px', width: '90%', padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="modal-header flex justify-between align-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} color="var(--primary)" />
                <span>Complete Active Sprint</span>
              </h3>
              <button onClick={() => setSprintCompleteModal(null)} style={{ fontSize: '1.25rem', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
            </div>
            
            <div className="modal-body flex flex-col gap-3">
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                You are about to mark <strong>{sprintCompleteModal.name}</strong> as completed.
              </p>
              
              {(() => {
                const sprintTasks = tasks.filter(t => sprintCompleteModal.targets && sprintCompleteModal.targets.includes(t.id));
                const unfinishedTasks = sprintTasks.filter(t => !['Completed', 'Closed', 'Done'].includes(getTaskStatus(t)));

                if (unfinishedTasks.length === 0) {
                  return (
                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      ✓ High Performance! All sprint tasks are completed.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-2">
                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', color: 'var(--color-warning)' }}>
                      ⚠️ Unfinished Tasks ({unfinishedTasks.length} left)
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Choose what to do with the remaining open tasks of this sprint:
                    </p>
                    
                    <div className="flex flex-col gap-2" style={{ marginTop: '0.25rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="unfinished_action"
                          value="backlog"
                          checked={incompleteTasksAction === 'backlog'}
                          onChange={() => setIncompleteTasksAction('backlog')}
                        />
                        <span>Move back to Product Backlog</span>
                      </label>

                      {plannedSprints.length > 0 && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="unfinished_action"
                            value="move"
                            checked={incompleteTasksAction !== 'backlog'}
                            onChange={() => setIncompleteTasksAction(plannedSprints[0].id)}
                          />
                          <span>Roll over to next planned sprint:</span>
                        </label>
                      )}

                      {incompleteTasksAction !== 'backlog' && plannedSprints.length > 0 && (
                        <select
                          className="form-control"
                          value={incompleteTasksAction}
                          onChange={(e) => setIncompleteTasksAction(e.target.value)}
                          style={{ marginLeft: '1.5rem', width: '80%', padding: '4px', fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                          {plannedSprints.map(ps => (
                            <option key={ps.id} value={ps.id}>{ps.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer flex justify-end gap-2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <button type="button" onClick={() => setSprintCompleteModal(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleCompleteSprint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}>Complete Sprint</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
