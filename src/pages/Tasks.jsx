import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { runAIOrchestration } from '../services/aiOrchestrator';
import {
  ListTodo, Plus, CheckCircle2, Circle, Calendar, AlertCircle, 
  ArrowRight, Check, X, ShieldAlert, Tag, User, Clock, CheckCircle,
  Sparkles, RefreshCw
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
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
    hospitalName
  } = useContext(QualiNABHContext);

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
    mappedStandard: '' 
  });
  
  const [filterDept, setFilterDept] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeDragOverCol, setActiveDragOverCol] = useState(null);

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
        if (targetStatus === 'Completed') {
          handleVerifyAndApprove(task);
        } else {
          updateHospitalTaskStatus(taskId, targetStatus);
          logActivity(`Dragged task "${task.title}" to stage: ${targetStatus}`);
        }
      }
    }
    setActiveDragOverCol(null);
  };

  // Check user privileges
  const canAssignTasks = currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Quality Head' || currentUser.role === 'Department Head');
  
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
        mappedStandard: task.mappedStandard
      });
    });

    setSuggestedTasks([]);
    setAiGoalText('');
    setShowAiPlanner(false);
    setSuccessMsg(`Successfully created ${selected.length} AI planned tasks!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Filter tasks based on logged-in user department and assignments
  const getFilteredTasks = () => {
    let list = [...tasks];
    
    // 1. Enforce department-level privacy: If not Super Admin / Quality Head, they can only see tasks matching their department
    if (currentUser && currentUser.role !== 'Super Admin' && currentUser.role !== 'Quality Head') {
      const userDept = currentUser.department;
      list = list.filter(t => t.department === userDept || t.assignedToEmail === currentUser.email);
    }

    // 2. Interactive filter dropdown
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
      mappedStandard: newForm.mappedStandard
    };

    addHospitalTask(taskData);
    setSuccessMsg(`Task successfully assigned to ${member.name}!`);
    setNewForm({ title: '', assignedMemberEmail: '', priority: 'Medium', dueDate: '', mappedStandard: '' });
    setShowTaskModal(false);
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Perform compliance document verification check
  const handleVerifyAndApprove = (task) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!task.mappedStandard) {
      // Direct approve if no standard mapped
      updateHospitalTaskStatus(task.id, 'Completed');
      setSuccessMsg(`Task "${task.title}" approved and completed.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    // Check if there is an approved document in the vault mapped to the standard
    const matchingDocs = documents.filter(doc => 
      doc.mappedStandards && 
      doc.mappedStandards.some(s => s.toLowerCase() === task.mappedStandard.toLowerCase())
    );

    const hasApprovedDoc = matchingDocs.some(doc => doc.status === 'Approved');

    if (!hasApprovedDoc) {
      setErrorMsg(`Cannot approve sign-off. Compliance evidence check failed: No approved SOP or audit checklist found in the Document Vault mapped to standard [${task.mappedStandard}].`);
      logActivity(`Failed task verification check for standard ${task.mappedStandard}: Missing evidence document`);
      setTimeout(() => setErrorMsg(''), 6000);
      return;
    }

    // Verification success: Move to Completed and update standard score!
    updateHospitalTaskStatus(task.id, 'Completed');
    
    // Automatically update point and compliance matrix score in Context
    setStandards(prev => prev.map(std => {
      if (std.id.toLowerCase() === task.mappedStandard.toLowerCase()) {
        logActivity(`Automatically upgraded compliance score for standard ${std.id} to 10 (Fully Met) via verified task audit closure.`);
        return { ...std, score: 10, status: "Fully Met" };
      }
      return std;
    }));

    setSuccessMsg(`✓ Compliance check passed! Mapped evidence document found. Task approved and standard [${task.mappedStandard}] score upgraded to 10.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Separate tasks into Kanban columns
  const columns = {
    'Pending': filteredTasks.filter(t => t.status === 'Pending'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Verification': filteredTasks.filter(t => t.status === 'Verification' || t.status === 'Review'), // Map both
    'Completed': filteredTasks.filter(t => t.status === 'Completed')
  };

  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Title */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Action Task Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
            Coordinate accreditation preparation assignments, mock drills, department compliance checklists, and sign-offs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Department Filter Selector */}
          <select 
            className="form-control"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem' }}
          >
            <option value="All">All Departments</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="ICU">Intensive Care (ICU)</option>
            <option value="Emergency">Emergency</option>
            <option value="OPD">Out-Patient (OPD)</option>
          </select>

          {canAssignTasks && (
            <>
              <button 
                onClick={() => setShowAiPlanner(!showAiPlanner)} 
                className="btn btn-secondary flex align-center gap-1" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                title="AI Task Breakdown Agent"
              >
                <Sparkles size={14} color="var(--primary)" />
                <span>AI Planner</span>
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                <Plus size={16} /> Assign Action Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI Task Planner panel */}
      {showAiPlanner && (
        <div className="card" style={{ border: '1px dashed var(--primary)', background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>AI Task Breakdown Agent</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Enter a high-level goal, department objective, or standard ID (e.g. MOM.2.c) and let the AI breakdown agent suggest specific assignments for your team.
          </p>

          <form onSubmit={handleGenerateAiTasks} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Conduct fire exit inspection drills and calibration audits"
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

      {/* Message alerts */}
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

      {/* Kanban Board Grid */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
          {Object.entries(columns).map(([colName, taskList]) => (
            <div 
              key={colName} 
              onDragOver={(e) => handleDragOver(e, colName)}
              onDragLeave={() => setActiveDragOverCol(null)}
              onDrop={(e) => handleDrop(e, colName)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem', 
                backgroundColor: activeDragOverCol === colName ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-secondary)', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: activeDragOverCol === colName ? '2px dashed var(--primary)' : '1px solid var(--border-color)', 
                minHeight: '400px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Column Header */}
              <div className="flex align-center justify-between" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: colName === 'Completed' ? 'var(--color-success)' : colName === 'Verification' ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {colName}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {taskList.length}
                </span>
              </div>

              {/* Tasks cards list */}
              <div className="flex flex-col gap-2" style={{ overflowY: 'auto', maxHeight: '550px' }}>
                {taskList.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '8px', marginTop: '0.5rem' }}>
                    No tasks in this stage
                  </div>
                ) : (
                  taskList.map((task) => (
                    <div 
                      key={task.id} 
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="card animate-fade-in" 
                      style={{ 
                        padding: '1rem', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.6rem', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        cursor: 'grab'
                      }}
                    >
                      {/* Priority & Delete button */}
                      <div className="flex align-center justify-between">
                        <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                          {task.priority} Priority
                        </span>
                        {canAssignTasks && (
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
                                deleteHospitalTask(task.id);
                              }
                            }}
                            style={{ color: 'var(--text-tertiary)', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
                            title="Delete Task"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Task Title */}
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                        {task.title}
                      </h4>

                      {/* Meta Fields */}
                      <div className="flex flex-col gap-1 text-secondary" style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                        <div className="flex align-center gap-1">
                          <User size={12} style={{ color: 'var(--primary)' }} />
                          <span><strong>Owner:</strong> {task.assignedTo} ({task.department})</span>
                        </div>
                        <div className="flex align-center gap-1">
                          <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
                          <span><strong>Due Date:</strong> {task.dueDate}</span>
                        </div>
                        {task.mappedStandard && (
                          <div className="flex align-center gap-1">
                            <Tag size={12} style={{ color: 'var(--color-warning)' }} />
                            <span><strong>NABH Standard:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{task.mappedStandard}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Actions controls */}
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                        {task.status === 'Pending' && (
                          <button 
                            onClick={() => updateHospitalTaskStatus(task.id, 'In Progress')}
                            className="btn btn-secondary flex align-center justify-center gap-1"
                            style={{ padding: '0.35rem', fontSize: '0.7rem', width: '100%', cursor: 'pointer' }}
                          >
                            Start Work <ArrowRight size={10} />
                          </button>
                        )}
                        
                        {task.status === 'In Progress' && (
                          <button 
                            onClick={() => updateHospitalTaskStatus(task.id, 'Verification')}
                            className="btn btn-primary flex align-center justify-center gap-1 glow-premium"
                            style={{ padding: '0.35rem', fontSize: '0.7rem', width: '100%', cursor: 'pointer' }}
                          >
                            Request Sign-off <Clock size={10} />
                          </button>
                        )}

                        {(task.status === 'Verification' || task.status === 'Review') && (
                          <div className="flex flex-col gap-1" style={{ width: '100%' }}>
                            {/* Super Admin or Quality Head reviews */}
                            {canAssignTasks ? (
                              <div style={{ display: 'flex', gap: '0.25rem', width: '100%' }}>
                                <button 
                                  onClick={() => handleVerifyAndApprove(task)}
                                  className="btn btn-primary flex align-center justify-center gap-1"
                                  style={{ padding: '0.35rem', fontSize: '0.7rem', flex: 1, backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                                >
                                  <Check size={12} /> Sign-off
                                </button>
                                <button 
                                  onClick={() => {
                                    updateHospitalTaskStatus(task.id, 'In Progress');
                                    logActivity(`Rejected sign-off request for task "${task.title}". Returned to In Progress.`);
                                  }}
                                  className="btn btn-danger flex align-center justify-center gap-1"
                                  style={{ padding: '0.35rem', fontSize: '0.7rem', flex: 1, cursor: 'pointer' }}
                                >
                                  <X size={12} /> Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', display: 'block', width: '100%', padding: '0.2rem' }}>
                                ⏳ Pending Admin Sign-off Check
                              </span>
                            )}
                          </div>
                        )}

                        {task.status === 'Completed' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 'bold', width: '100%', justifyContent: 'center' }}>
                            <CheckCircle2 size={14} /> Completed & Closed
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div className="modal-content card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div className="modal-header flex justify-between align-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Assign Department Task</h3>
              <button onClick={() => setShowTaskModal(false)} style={{ fontSize: '1.25rem', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Task Description / Action Name</label>
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
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Assign Owner (From active team members)</label>
                  <select
                    className="form-control"
                    required
                    value={newForm.assignedMemberEmail}
                    onChange={(e) => setNewForm({ ...newForm, assignedMemberEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
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
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Map to NABH Standard (Optional)</label>
                  <select
                    className="form-control"
                    value={newForm.mappedStandard}
                    onChange={(e) => setNewForm({ ...newForm, mappedStandard: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Select Standard Criteria --</option>
                    {standards.map((s, idx) => (
                      <option key={idx} value={s.id}>
                        {s.id}: {s.title} ({s.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Target Due Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={newForm.dueDate}
                      onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Task Priority</label>
                    <select
                      className="form-control"
                      value={newForm.priority}
                      onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      <option value="High">High (Urgent)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
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
    </div>
  );
}
