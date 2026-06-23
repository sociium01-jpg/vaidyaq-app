import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { Search, FileText, Shield, AlertTriangle, CheckSquare, ClipboardList, Users, X, ArrowRight, Clock } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'standards', label: 'Standards', icon: Shield },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'capas', label: 'CAPAs', icon: AlertTriangle },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'audits', label: 'Audits', icon: ClipboardList },
  { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { key: 'committees', label: 'Committees', icon: Users },
];

const STATUS_COLORS = {
  'Met': 'var(--color-success)',
  'Partially Met': 'var(--color-warning)',
  'Not Met': 'var(--color-danger)',
  'Approved': 'var(--color-success)',
  'Draft': 'var(--color-warning)',
  'Pending Review': 'var(--color-warning)',
  'Open': 'var(--color-danger)',
  'Closed': 'var(--color-success)',
  'In Progress': 'var(--secondary)',
  'Completed': 'var(--color-success)',
  'Scheduled': 'var(--color-warning)',
  'Reported': 'var(--color-danger)',
  'Investigating': 'var(--color-warning)',
  'Resolved': 'var(--color-success)',
  'Pending': 'var(--color-warning)',
  'Active': 'var(--color-success)',
};

const TYPE_ICONS = {
  standard: Shield,
  document: FileText,
  capa: AlertTriangle,
  task: CheckSquare,
  audit: ClipboardList,
  incident: AlertTriangle,
  committee: Users,
};

const RECENT_KEY = 'qn_recent_searches';
const MAX_RECENT = 5;

export default function SearchModal({ isOpen, onClose }) {
  const ctx = useContext(QualiNABHContext);
  const { standards = [], documents = [], capaItems = [], tasks = [], audits = [], incidents = [], committees = [], setCurrentRoute } = ctx || {};

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  });
  const [animateIn, setAnimateIn] = useState(false);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Animate in when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimateIn(true);
        setQuery('');
        setActiveCategory('all');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setAnimateIn(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Build searchable results
  const allResults = useMemo(() => {
    const items = [];

    (standards || []).forEach(s => items.push({
      id: s.id, type: 'standard', title: `${s.id} — ${s.name}`,
      status: s.status, department: s.chapter || '', route: '/standards',
    }));

    (documents || []).forEach(d => items.push({
      id: d.id, type: 'document', title: d.title || d.name,
      status: d.status, department: d.department || d.category || '', route: '/documents',
    }));

    (capaItems || []).forEach(c => items.push({
      id: c.id, type: 'capa', title: c.title || c.finding || `CAPA-${c.id}`,
      status: c.status, department: c.department || '', route: '/capa',
    }));

    (tasks || []).forEach(t => items.push({
      id: t.id, type: 'task', title: t.title || t.task,
      status: t.status, department: t.department || t.assignee || '', route: '/tasks',
    }));

    (audits || []).forEach(a => items.push({
      id: a.id, type: 'audit', title: a.title || a.name || `Audit-${a.id}`,
      status: a.status, department: a.department || a.area || '', route: '/audits',
    }));

    (incidents || []).forEach(i => items.push({
      id: i.id, type: 'incident', title: i.title || i.description || `Incident-${i.id}`,
      status: i.status, department: i.department || i.location || '', route: '/incidents',
    }));

    (committees || []).forEach(c => items.push({
      id: c.id, type: 'committee', title: c.name,
      status: 'Active', department: c.type || '', route: '/committees',
    }));

    return items;
  }, [standards, documents, capaItems, tasks, audits, incidents, committees]);

  // Filter results
  const filteredResults = useMemo(() => {
    let pool = allResults;
    if (activeCategory !== 'all') {
      const catMap = { standards: 'standard', documents: 'document', capas: 'capa', tasks: 'task', audits: 'audit', incidents: 'incident', committees: 'committee' };
      pool = pool.filter(r => r.type === catMap[activeCategory]);
    }
    if (!query.trim()) return pool.slice(0, 20);
    const q = query.toLowerCase();
    return pool.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allResults, query, activeCategory]);

  // Reset index handled directly in event handlers to prevent cascading renders

  // Save recent search
  const saveRecent = useCallback((term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Navigate to result
  const handleSelect = useCallback((result) => {
    if (result) {
      saveRecent(result.title);
      setCurrentRoute(result.route);
      onClose();
    }
  }, [saveRecent, setCurrentRoute, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) handleSelect(filteredResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [filteredResults, selectedIndex, handleSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const el = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const TypeBadge = ({ type }) => {
    const colors = {
      standard: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
      document: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
      capa: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
      task: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
      audit: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
      incident: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
      committee: { bg: 'rgba(20,184,166,0.15)', color: '#2dd4bf' },
    };
    const c = colors[type] || colors.standard;
    return (
      <span style={{
        padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
        background: c.bg, color: c.color, textTransform: 'capitalize', letterSpacing: '0.3px',
      }}>
        {type}
      </span>
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '8vh',
        opacity: animateIn ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '680px',
          background: 'var(--bg-primary)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(13,148,136,0.08)',
          overflow: 'hidden',
          transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.97)',
          opacity: animateIn ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Search size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search standards, documents, CAPAs, tasks..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: '16px', fontWeight: 500,
              color: 'var(--text-primary)',
              caretColor: 'var(--primary)',
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <kbd style={{
              padding: '2px 6px', borderRadius: '4px', fontSize: '11px',
              background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)',
              border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace',
            }}>ESC</kbd>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', transition: 'var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '10px 20px',
          overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setSelectedIndex(0); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px',
                  fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                  border: 'none', whiteSpace: 'nowrap',
                  background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  transition: 'var(--transition-fast)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <cat.icon size={13} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div ref={resultsRef} style={{
          maxHeight: '400px', overflowY: 'auto', padding: '8px',
        }}>
          {/* Recent Searches (when no query) */}
          {!query.trim() && recentSearches.length > 0 && (
            <div style={{ padding: '8px 12px 4px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px',
              }}>
                <Clock size={12} /> Recent Searches
              </div>
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(term); setSelectedIndex(0); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontSize: '13px',
                    textAlign: 'left', transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Clock size={14} style={{ opacity: 0.5 }} />
                  {term}
                </button>
              ))}
              <div style={{
                height: '1px', background: 'rgba(255,255,255,0.06)',
                margin: '8px 0',
              }} />
            </div>
          )}

          {/* Result Items */}
          {filteredResults.length > 0 ? (
            filteredResults.map((result, idx) => {
              const IconComp = TYPE_ICONS[result.type] || FileText;
              const isSelected = idx === selectedIndex;
              const statusColor = STATUS_COLORS[result.status] || 'var(--text-tertiary)';
              return (
                <button
                  key={`${result.type}-${result.id}-${idx}`}
                  data-index={idx}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    background: isSelected ? 'rgba(13,148,136,0.1)' : 'transparent',
                    border: isSelected ? '1px solid rgba(13,148,136,0.2)' : '1px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s ease',
                    marginBottom: '2px',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.04)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)',
                    transition: 'var(--transition-fast)',
                    flexShrink: 0,
                  }}>
                    <IconComp size={16} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {result.title}
                    </div>
                    {result.department && (
                      <div style={{
                        fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {result.department}
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <TypeBadge type={result.type} />
                    {result.status && (
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        background: `${statusColor}18`, color: statusColor,
                      }}>
                        {result.status}
                      </span>
                    )}
                    {isSelected && <ArrowRight size={14} style={{ color: 'var(--primary)', marginLeft: '4px' }} />}
                  </div>
                </button>
              );
            })
          ) : (
            <div style={{
              padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)',
            }}>
              <Search size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 500 }}>No results found</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                Try a different search term or category
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px', color: 'var(--text-tertiary)',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '10px' }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '10px' }}>↵</kbd> Open</span>
            <span><kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '10px' }}>esc</kbd> Close</span>
          </div>
          <div>{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  );
}
