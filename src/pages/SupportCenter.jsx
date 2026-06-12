import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { 
  ShieldAlert, Send, Clock, CheckCircle, AlertCircle, 
  MessageSquareCode, User
} from 'lucide-react';

export default function SupportCenter() {
  const { 
    currentUser, 
    hospitalName, 
    addSupportTicket, 
    supportTickets 
  } = useContext(QualiNABHContext);

  const [category, setCategory] = useState('AI SOP Compiler');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const mockSeq = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastSubmittedCode(mockSeq);
    addSupportTicket(title, description, priority, category);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  // Filter tickets to show only this hospital's logged issues
  const myTickets = supportTickets.filter(t => t.clientName === hospitalName);

  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Header Banner */}
      <div className="flex align-center justify-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>VaidyaQ Help & Troubleshooting Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Report system issues, log errors, and coordinate directly with VaidyaQ troubleshoot managers.</p>
        </div>
        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          🔒 Vault-Protected Support
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
        
        {/* Left: Troubleshooting Request Form */}
        <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldAlert size={20} color="var(--primary)" />
            <span>File Troubleshooting Ticket</span>
          </h3>

          {ticketSubmitted && (
            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-success)', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} />
              <span>Ticket logged successfully! Routed as case code <strong>{lastSubmittedCode}</strong>.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Troubleshoot Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="form-control"
                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
              >
                <option value="HIMS Integration">HIMS Integration / ABDM sync</option>
                <option value="Document Upload">Document Upload & Vault Encryption</option>
                <option value="AI SOP Compiler">AI SOP Compiler & Gap Analysis</option>
                <option value="User Roles & Permissions">User Roles & Permissions restrict</option>
                <option value="Payment / Billing Checkout">Payment & Subscription checkout</option>
                <option value="Other">Other Software Errors</option>
              </select>
            </div>

            <div className="form-group-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Priority Level</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)} 
                  className="form-control"
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <option value="Low">Low Priority (Minor UI tweak)</option>
                  <option value="Medium">Medium Priority (Standard functional issue)</option>
                  <option value="High">High Priority (Access Blocked / Errors)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Filer Account</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentUser.role} 
                  disabled 
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Issue Summary</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Invoices are showing CGST instead of local SGST breakdown"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Error Details & Steps to Reproduce</label>
              <textarea 
                required 
                placeholder="Please describe exactly what happened, including any system error messages, or logs..."
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary glow-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}>
              <Send size={16} /> Submit & Route Ticket
            </button>
          </form>
        </div>

        {/* Right: Tracing Client Tickets Queue */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Clock size={20} color="var(--secondary)" />
            <span>Active Tickets Registry ({myTickets.length})</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Trace resolution progress, view assigned support team members, and check active queues.</p>

          <div className="flex flex-col gap-2" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {myTickets.length > 0 ? (
              myTickets.map(ticket => (
                <div key={ticket.id} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {ticket.sequenceCode}
                    </span>
                    <div className="flex gap-1 align-center">
                      <span className={`badge ${ticket.priority === 'High' ? 'badge-danger' : ticket.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`badge ${ticket.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{ticket.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ticket.description}</p>

                  <div className="flex justify-between align-center" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <User size={10} /> Assigned to: <strong>{ticket.assignedOperator}</strong>
                    </span>
                    <span>Logged: {ticket.createdAt}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                <MessageSquareCode size={36} style={{ marginBottom: '0.5rem', color: 'var(--text-tertiary)' }} />
                <p style={{ fontWeight: 600 }}>No active support tickets found</p>
                <p style={{ fontSize: '0.75rem' }}>If you experience software anomalies, use the left form to log them.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
