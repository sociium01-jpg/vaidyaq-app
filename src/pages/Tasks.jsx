import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Tasks() {
  const {
    tasks,
    setTasks,
    logActivity
  } = useContext(QualiNABHContext);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', assignedTo: '', dueDate: '', priority: 'High' });

  const handleToggleTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        logActivity(`Changed task "${t.title}" status to ${nextStatus}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const newTask = {
      id: `task-${Date.now()}`,
      title: newForm.title,
      assignedTo: newForm.assignedTo,
      dueDate: newForm.dueDate,
      status: 'Pending',
      priority: newForm.priority
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity(`Created task: "${newForm.title}" assigned to ${newForm.assignedTo}`);
    setNewForm({ title: '', assignedTo: '', dueDate: '', priority: 'High' });
    setShowTaskModal(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex justify-between align-center">
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Hospital Action Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Coordinate accreditation preparation assignments, mock drills, and CAPA corrective checklists
          </p>
        </div>
        <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
          <Plus size={16} /> Assign New Task
        </button>
      </div>

      {/* Task List Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Mark</th>
              <th>Task Action Assignment</th>
              <th>Assigned Department Owner</th>
              <th>Target Due Date</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={idx} style={{ backgroundColor: task.status === 'Completed' ? 'rgba(5, 150, 105, 0.01)' : 'transparent' }}>
                <td>
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    style={{ color: task.status === 'Completed' ? 'var(--color-success)' : 'var(--text-tertiary)', padding: 0 }}
                  >
                    {task.status === 'Completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                </td>
                <td>
                  <span style={{
                    fontWeight: 600,
                    textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                    color: task.status === 'Completed' ? 'var(--text-secondary)' : 'var(--text-primary)'
                  }}>
                    {task.title}
                  </span>
                </td>
                <td>{task.assignedTo}</td>
                <td>
                  <div className="flex align-center gap-1" style={{ fontSize: '0.85rem' }}>
                    <Calendar size={14} className="text-tertiary" />
                    <span>{task.dueDate}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${task.priority === 'High' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Assign Action Task</h3>
              <button onClick={() => setShowTaskModal(false)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body flex flex-col gap-2">
                <div className="form-group">
                  <label className="form-label">Task Assignment Description</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Schedule narcotics storage double-verification training"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Owner / Department Head</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Sen (Pharmacy HOD)"
                    value={newForm.assignedTo}
                    onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })}
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Target Due Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={newForm.dueDate}
                      onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Task Priority</label>
                    <select
                      className="form-control"
                      value={newForm.priority}
                      onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
                    >
                      <option value="High">High (Urgent)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
