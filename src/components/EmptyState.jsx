import React from 'react';
import { Inbox, FileText, ClipboardList, AlertTriangle, CheckSquare, Users, BookOpen, BarChart3, Shield } from 'lucide-react';

const iconMap = {
  documents: FileText,
  tasks: CheckSquare,
  audits: ClipboardList,
  incidents: AlertTriangle,
  capas: Shield,
  training: BookOpen,
  committees: Users,
  reports: BarChart3,
  default: Inbox
};

const messageMap = {
  documents: { title: 'No Documents Yet', subtitle: 'Upload your first SOP, policy, or protocol to get started with document control.' },
  tasks: { title: 'All Clear!', subtitle: 'No tasks found. Create a new task or tasks will auto-generate from CAPAs, audits, and committees.' },
  audits: { title: 'No Audits Scheduled', subtitle: 'Schedule your first internal audit to begin tracking compliance and findings.' },
  incidents: { title: 'No Incidents Reported', subtitle: 'A clean slate! Report incidents here to track root causes and drive CAPA actions.' },
  capas: { title: 'No Active CAPAs', subtitle: 'CAPAs are generated from audit findings, incidents, or logged manually for continuous improvement.' },
  training: { title: 'No Training Records', subtitle: 'Add training sessions to track staff competency and compliance readiness.' },
  committees: { title: 'No Committees Configured', subtitle: 'Set up quality committees to manage meetings, minutes, and action tracking.' },
  reports: { title: 'No Reports Generated', subtitle: 'Generate executive summaries, department reports, and trend analyses here.' },
  default: { title: 'Nothing Here Yet', subtitle: 'Get started by adding your first entry.' }
};

/**
 * EmptyState — Reusable illustrated empty state placeholder
 * @param {'documents'|'tasks'|'audits'|'incidents'|'capas'|'training'|'committees'|'reports'} type
 * @param {string} [customTitle] - Override default title
 * @param {string} [customSubtitle] - Override default subtitle
 * @param {React.ReactNode} [action] - Optional CTA button
 */
export default function EmptyState({ type = 'default', customTitle, customSubtitle, action }) {
  const IconComponent = iconMap[type] || iconMap.default;
  const messages = messageMap[type] || messageMap.default;
  const title = customTitle || messages.title;
  const subtitle = customSubtitle || messages.subtitle;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      minHeight: 220
    }}>
      {/* Illustrated circle */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(124, 58, 237, 0.08) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        animation: 'emptyPulse 3s ease-in-out infinite'
      }}>
        <IconComponent size={36} style={{ color: 'var(--primary)', opacity: 0.7 }} />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: '0 0 0.4rem 0'
      }}>
        {title}
      </h3>

      {/* Subtitle */}
      <p style={{
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        maxWidth: 380,
        lineHeight: 1.5,
        margin: 0
      }}>
        {subtitle}
      </p>

      {/* Optional CTA */}
      {action && (
        <div style={{ marginTop: '1.25rem' }}>
          {action}
        </div>
      )}

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes emptyPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
