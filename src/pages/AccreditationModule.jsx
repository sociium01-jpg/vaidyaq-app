import React, { useState, useContext } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import {
  ShieldCheck,
  TrendingUp,
  FileSearch,
  Grid3X3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Upload,
  Brain
} from 'lucide-react';

export default function AccreditationModule() {
  const {
    standards,
    updateStandardScore,
    documents,
    readinessScore,
    evidenceUploadedCount,
    missingEvidenceCount,
    openCapasCount,
    logActivity
  } = useContext(QualiNABHContext);

  const [activeSubTab, setActiveSubTab] = useState('assessment'); // 'assessment', 'gap', 'matrix'
  const [evidenceFileAlert, setEvidenceFileAlert] = useState(null);

  // Group by chapter helper
  const getChapterData = () => {
    const chapters = ['AAC', 'COP', 'MOM', 'FMS', 'HRM'];
    const names = {
      AAC: 'Access, Assessment & Continuity of Care',
      COP: 'Care of Patients',
      MOM: 'Management of Medication',
      FMS: 'Facility Management & Safety',
      HRM: 'Human Resource Management'
    };

    return chapters.map(ch => {
      const chStandards = standards.filter(s => s.chapter === ch);
      const totalElements = chStandards.length;
      const maxScore = totalElements * 10;
      const currentScore = chStandards.reduce((sum, s) => sum + s.score, 0);
      const pct = totalElements > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

      return {
        code: ch,
        name: names[ch],
        standards: chStandards,
        score: pct
      };
    });
  };

  const chaptersData = getChapterData();

  const handleScoreClick = (stdId, score) => {
    updateStandardScore(stdId, score);
  };

  const handleSimulateEvidenceUpload = (stdId) => {
    setEvidenceFileAlert(`Successfully mapped mock evidence to standard element: ${stdId}. Score upgraded to Partially Met!`);
    setTimeout(() => {
      setEvidenceFileAlert(null);
    }, 4000);
    
    // Automatically improve standard score to Partially Met if it was Not Met
    const stdObj = standards.find(s => s.id === stdId);
    if (stdObj && stdObj.score === 0) {
      updateStandardScore(stdId, 5);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sub Tabs */}
      <div className="tabs-container">
        <button onClick={() => setActiveSubTab('assessment')} className={`tab-btn ${activeSubTab === 'assessment' ? 'active' : ''}`}>
          Self-Assessment Toolkit
        </button>
        <button onClick={() => setActiveSubTab('gap')} className={`tab-btn ${activeSubTab === 'gap' ? 'active' : ''}`}>
          Chapter Gap Analysis
        </button>
        <button onClick={() => setActiveSubTab('matrix')} className={`tab-btn ${activeSubTab === 'matrix' ? 'active' : ''}`}>
          Evidence Mapping Matrix
        </button>
      </div>

      {/* Floating Alert for Upload */}
      {evidenceFileAlert && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{evidenceFileAlert}</span>
        </div>
      )}

      {/* 1. SELF-ASSESSMENT TOOLKIT VIEW */}
      {activeSubTab === 'assessment' && (
        <div className="flex flex-col gap-3">
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem' }}>Interactive Accreditation scoring matrix</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Score elements: <strong>Fully Met (10 pts)</strong>, <strong>Partially Met (5 pts)</strong>, or <strong>Not Met (0 pts)</strong>.
              </p>
            </div>
            <div className="flex gap-3 align-center">
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Score:</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{readinessScore}%</div>
              </div>
            </div>
          </div>

          <div className="standards-grid-list">
            {standards.map((std, idx) => {
              // Find mapped docs
              const mappedDocs = documents.filter(d => d.mappedStandards.includes(std.id));
              return (
                <div key={idx} className="standards-requirement-card flex justify-between gap-3 align-center" style={{ flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="flex align-center gap-2">
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{std.id}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{std.department}</span>
                    </div>
                    <h4 style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{std.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{std.description}</p>
                    
                    {/* Evidence details */}
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>Required Proofs:</span> {std.evidenceRequired}
                    </div>

                    {/* Mapped documents list */}
                    {mappedDocs.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }} className="flex flex-col gap-1">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Attached Evidence:</span>
                        {mappedDocs.map((doc, dIdx) => (
                          <div key={dIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
                            <CheckCircle2 size={12} color="var(--primary)" />
                            <span>{doc.title} (v{doc.version})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 align-center" style={{ minWidth: '220px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Scoring assessment</span>
                    <div className="score-selector">
                      <button
                        onClick={() => handleScoreClick(std.id, 0)}
                        className={`score-btn score-0 ${std.score === 0 ? 'active' : ''}`}
                      >
                        Not Met (0)
                      </button>
                      <button
                        onClick={() => handleScoreClick(std.id, 5)}
                        className={`score-btn score-5 ${std.score === 5 ? 'active' : ''}`}
                      >
                        Partial (5)
                      </button>
                      <button
                        onClick={() => handleScoreClick(std.id, 10)}
                        className={`score-btn score-10 ${std.score === 10 ? 'active' : ''}`}
                      >
                        Fully (10)
                      </button>
                    </div>

                    <button
                      onClick={() => handleSimulateEvidenceUpload(std.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', width: '100%', marginTop: '0.25rem' }}
                    >
                      <Upload size={12} /> Upload Evidence File
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CHAPTER GAP ANALYSIS VIEW */}
      {activeSubTab === 'gap' && (
        <div className="flex flex-col gap-3">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Chapters Scores list */}
            <div className="flex flex-col gap-2">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Chapter Readiness Scores</h3>
              {chaptersData.map((ch, idx) => (
                <div key={idx} className="card flex justify-between align-center" style={{ padding: '1rem' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', fontWeight: 800 }}>{ch.code}</span>
                    <h4 style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{ch.name}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: ch.score >= 80 ? 'var(--color-success)' : ch.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                      {ch.score}%
                    </div>
                    <span className="badge" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', backgroundColor: ch.score >= 80 ? 'var(--bg-success)' : 'var(--bg-danger)', color: ch.score >= 80 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {ch.score >= 80 ? 'PASSING' : 'GAP ALERT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Gap Checker suggestions */}
            <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
              <div className="flex align-center gap-2" style={{ marginBottom: '1rem' }}>
                <Brain size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>AI Actionable Gap Advice</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Based on active self-assessment scores and evidence mappings, the AI recommends taking these actions to increase the readiness percentage:
              </p>

              <div className="flex flex-col gap-2" style={{ fontSize: '0.85rem' }}>
                {standards.filter(s => s.score < 10).map((std, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="flex align-center gap-2" style={{ marginBottom: '0.25rem' }}>
                      <AlertTriangle size={14} color="var(--color-danger)" />
                      <strong>{std.id} Gap Alert ({std.status})</strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {std.id} ({std.title}) score is currently {std.score}/10. 
                      {std.score === 0 ? " Action needed: Draft the mandated standard SOP and schedule an internal department audit immediately." : 
                       " Action needed: Upload the staff quiz sheets and verify training attendance logs to close the final 5 points."}
                    </p>
                  </div>
                ))}

                {standards.filter(s => s.score < 10).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-success)' }}>
                    <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: 600 }}>All standards are Fully Met!</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No gaps detected. Hospital is 100% ready for assessment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EVIDENCE MAPPING MATRIX VIEW */}
      {activeSubTab === 'matrix' && (
        <div className="flex flex-col gap-3">
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Accreditation Proof Matrix</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              A horizontal verification panel. Cross-checks whether target files are mapped as evidence to each objective element.
            </p>
          </div>

          <div className="table-container">
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Standard ID</th>
                  <th>Objective Element</th>
                  <th>1. Policy Mapped</th>
                  <th>2. SOP Mapped</th>
                  <th>3. Audit Logs</th>
                  <th>4. Training Records</th>
                  <th>5. CAPA Action Log</th>
                </tr>
              </thead>
              <tbody>
                {standards.map((std, idx) => {
                  const mappedDocs = documents.filter(d => d.mappedStandards.includes(std.id));
                  const hasPolicy = mappedDocs.some(d => d.type === 'Policy');
                  const hasSOP = mappedDocs.some(d => d.type === 'SOP');
                  
                  // Mock linking audit status
                  const hasAudit = std.score >= 5;
                  // Mock training status
                  const hasTraining = std.score === 10;
                  // Mock CAPA status
                  const hasCAPA = std.score === 10;

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{std.id}</td>
                      <td><strong>{std.title}</strong></td>
                      
                      {/* Policy */}
                      <td style={{ textAlign: 'center' }}>
                        {hasPolicy ? <CheckCircle2 size={18} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <XCircle size={18} color="var(--color-danger)" style={{ margin: '0 auto' }} />}
                      </td>

                      {/* SOP */}
                      <td style={{ textAlign: 'center' }}>
                        {hasSOP ? <CheckCircle2 size={18} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <XCircle size={18} color="var(--color-danger)" style={{ margin: '0 auto' }} />}
                      </td>

                      {/* Audit */}
                      <td style={{ textAlign: 'center' }}>
                        {hasAudit ? <CheckCircle2 size={18} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <XCircle size={18} color="var(--color-danger)" style={{ margin: '0 auto' }} />}
                      </td>

                      {/* Training */}
                      <td style={{ textAlign: 'center' }}>
                        {hasTraining ? <CheckCircle2 size={18} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <XCircle size={18} color="var(--color-danger)" style={{ margin: '0 auto' }} />}
                      </td>

                      {/* CAPA */}
                      <td style={{ textAlign: 'center' }}>
                        {hasCAPA ? <CheckCircle2 size={18} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <XCircle size={18} color="var(--color-danger)" style={{ margin: '0 auto' }} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
