import React, { useState, useContext, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { useToast } from '../components/ToastProvider';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  Plus, 
  ClipboardList, 
  Globe, 
  Bell, 
  CheckCircle,
  FileText,
  User,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function ComplianceFeed() {
  const { 
    complianceFeed, 
    addHospitalTask, 
    currentUser, 
    teamMembers,
    logActivity 
  } = useContext(QualiNABHContext);
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Namespaced bookmarks stored in local storage
  const [bookmarks, setBookmarks] = useState(() => {
    const activeEmail = currentUser?.parentEmail || currentUser?.email;
    const prefix = activeEmail ? `${activeEmail}_` : '';
    const saved = localStorage.getItem(`${prefix}qn_feed_bookmarks`);
    return saved ? JSON.parse(saved) : [];
  });

  // Task assignment dialog state
  const [assigningItem, setAssigningItem] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    const activeEmail = currentUser?.parentEmail || currentUser?.email;
    const prefix = activeEmail ? `${activeEmail}_` : '';
    localStorage.setItem(`${prefix}qn_feed_bookmarks`, JSON.stringify(bookmarks));
  }, [bookmarks, currentUser]);

  const toggleBookmark = (id) => {
    if (bookmarks.includes(id)) {
      setBookmarks(prev => prev.filter(bId => bId !== id));
      showToast({
        title: "Bookmark Removed",
        message: "Article has been removed from your saved list.",
        type: "info"
      });
    } else {
      setBookmarks(prev => [...prev, id]);
      showToast({
        title: "Bookmark Saved",
        message: "Article has been saved to your bookmark filter list.",
        type: "success"
      });
    }
  };

  const handleCreatePolicyReview = (item) => {
    const qualityHead = teamMembers.find(t => t.role === 'Quality Head') || teamMembers[0];
    const taskObj = {
      title: `Policy Review: ${item.title}`,
      assignedTo: qualityHead ? qualityHead.name : 'Quality Head',
      assignedToEmail: qualityHead ? qualityHead.email : 'quality.head@hospital.org',
      department: 'Quality Control',
      dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0], // 5 days from now
      priority: 'High',
      mappedStandard: item.title.includes('ABDM') ? 'DPI' : item.title.includes('Medication') ? 'MOM.2.c' : 'FMS.1.d'
    };

    const taskId = addHospitalTask(taskObj);
    logActivity(`Created Policy Review Task for update: "${item.title}"`);
    showToast({
      title: "Task Assigned",
      message: `Policy Review task assigned to ${taskObj.assignedTo} with High priority.`,
      type: "success"
    });
  };

  const handleAssignCustomTaskSubmit = (e) => {
    e.preventDefault();
    if (!assignee || !dueDate) {
      showToast({
        title: "Error",
        message: "Please fill out all required fields.",
        type: "error"
      });
      return;
    }

    const member = teamMembers.find(t => t.name === assignee) || teamMembers[0];
    const taskObj = {
      title: `Compliance Review: ${assigningItem.title}`,
      assignedTo: assignee,
      assignedToEmail: member ? member.email : '',
      department: member ? member.department : 'Quality Control',
      dueDate: dueDate,
      priority: priority,
      mappedStandard: ''
    };

    addHospitalTask(taskObj);
    logActivity(`Assigned compliance task to ${assignee} for update: "${assigningItem.title}"`);
    
    showToast({
      title: "Task Assigned",
      message: `Task assigned successfully to ${assignee}.`,
      type: "success"
    });

    setAssigningItem(null);
    setAssignee('');
    setDueDate('');
    setPriority('Medium');
  };

  // Filter list
  const filteredFeed = (complianceFeed || []).filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'Bookmarks') {
      return matchesSearch && bookmarks.includes(item.id);
    }
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Regulatory Update', 'Compliance Alert', 'NABH Notice', 'Bookmarks'];

  return (
    <div style={{ color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-body)' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe style={{ color: 'var(--primary)' }} />
            Compliance News Feed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Official regulatory updates, ABDM alerts, QCI circulars, and national healthcare quality releases.
          </p>
        </div>
      </div>

      {/* Search and filter toolbar */}
      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat} {cat === 'Bookmarks' && `(${bookmarks.length})`}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search feed articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 1rem 0.45rem 2.25rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Grid containing feed cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredFeed.length === 0 ? (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>No updates found</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Try broadening your keyword search or changing the filter.
            </p>
          </div>
        ) : (
          filteredFeed.map(item => {
            const isBookmarked = bookmarks.includes(item.id);
            return (
              <div 
                key={item.id} 
                className="card" 
                style={{ 
                  padding: '1.5rem', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${
                        item.category === 'Regulatory Update' ? 'badge-danger' : 
                        item.category === 'Compliance Alert' ? 'badge-warning' : 'badge-success'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {item.date}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                  </div>
                  
                  <button 
                    onClick={() => toggleBookmark(item.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.25rem', color: isBookmarked ? 'var(--primary)' : 'var(--text-tertiary)' }}
                  >
                    {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                </div>

                {/* Content body */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {item.content}
                </p>

                {/* Footer and Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    Official Bulletin Source: <strong>{item.source}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleCreatePolicyReview(item)}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        color: 'var(--primary)', 
                        border: '1px solid var(--primary)', 
                        borderRadius: '6px', 
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <FileText size={14} />
                      Create Policy Review
                    </button>
                    
                    <button 
                      onClick={() => setAssigningItem(item)}
                      className="btn btn-primary"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      Assign as Task
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Assignment Modal */}
      {assigningItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Assign Compliance Task</h3>
              <button onClick={() => setAssigningItem(null)} style={{ border: 'none', background: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}>✕</button>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Assign a review or verification checklist task for item: <br />
              <strong style={{ color: 'var(--text-primary)' }}>{assigningItem.title}</strong>
            </div>

            <form onSubmit={handleAssignCustomTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Assignee</label>
                <select 
                  className="role-badge-selector"
                  value={assignee} 
                  onChange={(e) => setAssignee(e.target.value)}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select hospital user...</option>
                  {teamMembers.map(member => (
                    <option key={member.email} value={member.name}>{member.name} ({member.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.45rem', 
                    fontSize: '0.8rem', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }} 
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Priority</label>
                <select 
                  className="role-badge-selector"
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setAssigningItem(null)} 
                  style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '0.45rem 1.25rem', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
