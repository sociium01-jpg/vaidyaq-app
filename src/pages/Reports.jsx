import React, { useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  BarChart3,
  Printer,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

export default function Reports() {
  const {
    readinessScore,
    openCapasCount,
    missingEvidenceCount,
    pendingAuditsCount,
    incidentsThisMonthCount,
    standards,
    qualityIndicators,
    documents,
    capaItems,
    licenses
  } = useContext(QualiNABHContext);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex justify-between align-center">
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Accreditation Reports Compiler</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Generate and export consolidated compliance portfolios and clinical quality trends
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Report Dossier
          </button>
          <button onClick={() => alert("Downloading CSV backup bundle...")} className="btn btn-primary">
            <FileDown size={16} /> Export CSV Bundle
          </button>
        </div>
      </div>

      {/* Compiler Layout Grid */}
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Consolidated summary card */}
        <div className="card" style={{ borderTop: '6px solid var(--primary)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Consolidated Hospital Quality Audit Dossier</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Standard Compliance Cycle: <strong>Jan 2025 - Jan 2029 (Cycle 6)</strong>
            </p>
            <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>ABDM Sandbox Validated</span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Readiness Index</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{readinessScore}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open CAPA Items</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: openCapasCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{openCapasCount}</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Missing Proof files</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{missingEvidenceCount}</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Policies</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{documents.length}</div>
            </div>
          </div>

          {/* Section 1: Standard Scores */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              1. Standards Chapters Scorecard
            </h3>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Chapter Code</th>
                  <th>Standard description</th>
                  <th>Responsible Department</th>
                  <th>Scoring Status</th>
                </tr>
              </thead>
              <tbody>
                {standards.map((std, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{std.id}</td>
                    <td>{std.title}</td>
                    <td>{std.department}</td>
                    <td>
                      <span className={`badge ${std.score === 10 ? 'badge-success' : std.score === 5 ? 'badge-warning' : 'badge-danger'}`}>
                        {std.score}/10 - {std.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Clinical Indicators */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              2. Clinical Quality Indicators (Monthly Trend)
            </h3>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Audit Month</th>
                  <th>Patient Falls</th>
                  <th>Medication Errors</th>
                  <th>Hospital Infections</th>
                  <th>Needle-Stick Incidents</th>
                </tr>
              </thead>
              <tbody>
                {qualityIndicators.map((ind, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{ind.month}</td>
                    <td>{ind.falls}</td>
                    <td>{ind.medicationErrors}</td>
                    <td>{ind.infections}</td>
                    <td>{ind.needleSticks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Licenses */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              3. Regulatory License Status
            </h3>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {licenses.map((lic, idx) => (
                <li key={idx} className="flex justify-between align-center" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <span><strong>{lic.name}</strong> ({lic.authority})</span>
                  <span className={`badge ${lic.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{lic.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
