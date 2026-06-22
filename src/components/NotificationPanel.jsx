import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { Bell, X, CheckCircle, AlertTriangle, FileText, ClipboardList, Calendar, Users, Filter, Check, Trash2, Clock, Shield, BellOff } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'tasks', label: 'Tasks', icon: CheckCircle },
  { key: 'audits', label: 'Audits', icon: ClipboardList },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'system', label: 'System', icon: Shield },
];

const NOTIFICATION_COLORS = {
  overdue_task: 'var(--color-danger)',
  upcoming_audit: 'var(--color-warning)',
  pending_document: 'var(--secondary)',
  expired_license: 'var(--color-danger)',
  open_capa: 'var(--color-warning)',
};

const NOTIFICATION_ICONS = {
  overdue_task: CheckCircle,
  upcoming_audit: Calendar,
  pending_document: FileText,
  expired_license: Shield,
  open_capa: AlertTriangle,
};

const NOTIFICATION_CATEGORY = {
  overdue_task: 'tasks',
  upcoming_audit: 'audits',
  pending_document: 'documents',
  expired_license: 'system',
  open_capa: 'tasks',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function NotificationPanel({ isOpen, onClose }) {
  const ctx = useContext(QualiNABHContext);
  const {
    tasks = [],
    audits = [],
    documents = [],
    licenses = [],
    capaItems = [],
  } = ctx || {};

  const [activeCategory, setActiveCategory] = useState('all');
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qn_notif_read')) || []; } catch { return []; }
  });
  const [animateIn, setAnimateIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setAnimateIn(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)));
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Persist read state
  useEffect(() => {
    localStorage.setItem('qn_notif_read', JSON.stringify(readIds));
  }, [readIds]);

  // Auto-generate notifications from context data
  const notifications = useMemo(() => {
    const items = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Overdue tasks
    (tasks || []).forEach(t => {
      if (t.dueDate && t.status !== 'Completed' && t.status !== 'Done' && t.status !== 'Closed') {
        const due = new Date(t.dueDate);
        if (due < today) {
          items.push({
            id: `task_overdue_${t.id}`,
            type: 'overdue_task',
            title: 'Overdue Task',
            description: `"${t.title || t.task}" was due ${due.toLocaleDateString()}`,
            timestamp: t.dueDate,
            severity: 'high',
          });
        }
      }
    });

    // Upcoming audits
    (audits || []).forEach(a => {
      if (a.status === 'Scheduled') {
        items.push({
          id: `audit_sched_${a.id}`,
          type: 'upcoming_audit',
          title: 'Upcoming Audit',
          description: `"${a.title || a.name || 'Audit'}" is scheduled${a.date ? ` for ${new Date(a.date).toLocaleDateString()}` : ''}`,
          timestamp: a.date || new Date().toISOString(),
          severity: 'medium',
        });
      }
    });

    // Documents pending review
    (documents || []).forEach(d => {
      if (d.status === 'Pending Review') {
        items.push({
          id: `doc_pending_${d.id}`,
          type: 'pending_document',
          title: 'Document Pending Review',
          description: `"${d.title || d.name}" requires your review`,
          timestamp: d.updatedAt || d.createdAt || new Date().toISOString(),
          severity: 'medium',
        });
      }
    });

    // Expired licenses
    (licenses || []).forEach(lic => {
      if (lic.status === 'Expired') {
        items.push({
          id: `lic_exp_${lic.id}`,
          type: 'expired_license',
          title: 'License Expired',
          description: `"${lic.name || lic.title || 'License'}" has expired${lic.expiryDate ? ` on ${new Date(lic.expiryDate).toLocaleDateString()}` : ''}`,
          timestamp: lic.expiryDate || new Date().toISOString(),
          severity: 'high',
        });
      }
    });

    // Open CAPAs past due date
    (capaItems || []).forEach(c => {
      if (c.status === 'Open' && c.dueDate) {
        const due = new Date(c.dueDate);
        if (due < today) {
          items.push({
            id: `capa_overdue_${c.id}`,
            type: 'open_capa',
            title: 'CAPA Past Due',
            description: `"${c.title || c.finding || `CAPA-${c.id}`}" was due ${due.toLocaleDateString()}`,
            timestamp: c.dueDate,
            severity: 'high',
          });
        }
      }
    });

    // Sort by severity (high first), then by timestamp (newest first)
    items.sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1;
      if (a.severity !== 'high' && b.severity === 'high') return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return items;
  }, [tasks, audits, documents, licenses, capaItems]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') return notifications;
    return notifications.filter(n => NOTIFICATION_CATEGORY[n.type] === activeCategory);
  }, [notifications, activeCategory]);

  const unreadCount = useMemo(() =>
    notifications.filter(n => !readIds.includes(n.id)).length,
    [notifications, readIds]
  );

  const toggleRead = useCallback((id) => {
    setReadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(notifications.map(n => n.id));
  }, [notifications]);

  const clearAll = useCallback(() => {
    setReadIds(notifications.map(n => n.id));
  }, [notifications]);

  if (!isOpen) return null;

  // ---- Styles ----
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 9998,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    opacity: animateIn ? 1 : 0,
    transition: 'opacity 300ms ease',
  };

  const panelStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: isMobile ? '100%' : '380px',
    zIndex: 9999,
    background: 'var(--bg-glass, rgba(255,255,255,0.82))',
    backdropFilter: 'blur(24px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
    borderLeft: '1px solid var(--border-color)',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
    overflow: 'hidden',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
  };

  const titleStyle = {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const badgeStyle = {
    background: unreadCount > 0 ? 'var(--primary)' : 'var(--bg-tertiary)',
    color: unreadCount > 0 ? '#fff' : 'var(--text-tertiary)',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center',
  };

  const headerBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'all 200ms ease',
  };

  const tabBarStyle = {
    display: 'flex',
    gap: '4px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-color)',
    overflowX: 'auto',
    flexShrink: 0,
  };

  const listStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
  };

  const footerStyle = {
    padding: '12px 20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Panel */}
      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleStyle}>
            <Bell size={20} style={{ color: 'var(--primary)' }} />
            Notifications
            <span style={badgeStyle}>{unreadCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              style={headerBtnStyle}
              onClick={markAllRead}
              title="Mark all as read"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Check size={14} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Mark all</span>
            </button>
            <button
              style={{ ...headerBtnStyle, padding: '6px' }}
              onClick={onClose}
              title="Close"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={tabBarStyle}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            const Icon = cat.icon;
            const count = cat.key === 'all'
              ? notifications.length
              : notifications.filter(n => NOTIFICATION_CATEGORY[n.type] === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={13} />
                {cat.label}
                {count > 0 && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-tertiary)',
                    color: isActive ? '#fff' : 'var(--text-tertiary)',
                    padding: '1px 6px',
                    borderRadius: '8px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        <div style={listStyle}>
          {filteredNotifications.length === 0 ? (
            /* Empty state */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '260px',
              gap: '16px',
              padding: '40px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BellOff size={32} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>
                  All caught up!
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                }}>
                  No notifications in this category.
                  <br />Check back later.
                </div>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif, idx) => {
              const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
              const color = NOTIFICATION_COLORS[notif.type] || 'var(--primary)';
              const isRead = readIds.includes(notif.id);

              return (
                <div
                  key={notif.id}
                  onClick={() => toggleRead(notif.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 12px',
                    marginBottom: '4px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isRead ? 'transparent' : 'var(--bg-secondary)',
                    border: '1px solid',
                    borderColor: isRead ? 'transparent' : 'var(--border-color)',
                    opacity: isRead ? 0.55 : 1,
                    transition: 'all 250ms ease',
                    animation: `slideUp 300ms ease ${idx * 30}ms both`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.transform = 'translateX(-2px)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isRead ? 'transparent' : 'var(--bg-secondary)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    <Icon size={17} style={{ color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: isRead ? 500 : 700,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {notif.title}
                      </span>
                      {/* Unread dot */}
                      {!isRead && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {notif.description}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '6px',
                      fontSize: '0.68rem',
                      color: 'var(--text-tertiary)',
                    }}>
                      <Clock size={11} />
                      {timeAgo(notif.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div style={footerStyle}>
            <button
              onClick={clearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-danger)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--color-danger)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Keyframe injection for card slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
