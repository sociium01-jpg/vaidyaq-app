import React, { useContext, useState } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { runAIOrchestration } from '../services/aiOrchestrator';
import {
  BarChart3, Printer, FileDown, CheckCircle2, AlertTriangle, 
  ClipboardList, FileText, LayoutGrid, CheckCircle, Sparkles, RefreshCw, Copy
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
    licenses,
    hospitalName,
    logActivity,
    aiSettings,
    getDecryptedKey,
    createAiOutput,
    logAiUsage,
    logAiSafety,
    aiMemory,
    aiOutputs,
    updateAiOutputStatus,
    currentUser
  } = useContext(QualiNABHContext);

  const [exportSuccess, setExportSuccess] = useState('');
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);

  const handleAnalyzeReportWithAI = async () => {
    setIsAnalyzingReport(true);
    try {
      const prompt = `Perform a comprehensive data analysis and compliance health audit for hospital leadership at ${hospitalName}. 
      Key metrics to analyze:
      - Overall Readiness Score: ${readinessScore}%
      - Open CAPA Items: ${openCapasCount}
      - Missing Evidence Gaps: ${missingEvidenceCount}
      - Scheduled Audits: ${pendingAuditsCount}
      - Monthly reported patient incidents: ${incidentsThisMonthCount}
      - Pre-loaded Quality Indicators monthly data: ${JSON.stringify(qualityIndicators)}

      Please structure your analysis into:
      1. Compliance Score Assessment (Explain what 85% threshold implies)
      2. Trends in Quality Indicators (Falls, Medication Errors, Infections, Needle Sticks)
      3. Critical statutory renewal warnings and CAPA completion bottlenecks
      4. Key actionable recommendations to boost readiness.`;

      await runAIOrchestration({
        module: 'reports',
        agentType: 'Reports Agent',
        prompt: prompt,
        chatHistory: [],
        contextData: {
          readinessScore,
          openCapasCount,
          missingEvidenceCount,
          pendingAuditsCount,
          incidentsThisMonthCount,
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
      logActivity("Generated AI Reports analysis summary.");
    } catch (e) {
      console.error(e);
      alert(`API Connection Error: ${e.message}`);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  // 1. Export PDF (Print Layout)
  const handlePrint = () => {
    window.print();
    logActivity("Printed / Exported PDF format of compliance dossier.");
  };

  // 2. Export CSV (Standards Ledger)
  const handleExportCSV = () => {
    let csv = "NABH Criteria ID,Chapter,Criteria Title,Responsible Department,Status,Score (out of 10)\n";
    standards.forEach(std => {
      // Escape strings containing commas
      const titleClean = std.title.replace(/"/g, '""');
      const deptClean = std.department.replace(/"/g, '""');
      csv += `"${std.id}","${std.chapter}","${titleClean}","${deptClean}","${std.status}",${std.score}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VaidyaQ_NABH_Readiness_${hospitalName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportSuccess("Accreditation standards CSV compiled and downloaded!");
    setTimeout(() => setExportSuccess(''), 3000);
    logActivity("Exported accreditation scorecard in CSV format.");
  };

  // 3. Export Excel (XLS)
  const handleExportXLS = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/><style>
      table { border-collapse: collapse; font-family: sans-serif; font-size: 10pt; }
      th { background-color: #3b82f6; color: white; font-weight: bold; border: 1px solid #d1d5db; padding: 6px; }
      td { border: 1px solid #d1d5db; padding: 6px; }
      .header { font-size: 14pt; font-weight: bold; color: #1e3a8a; }
      .meta { font-size: 9pt; color: #4b5563; }
    </style></head>
    <body>
      <div class="header">Accreditation Readiness Scorecard - ${hospitalName}</div>
      <div class="meta">Overall Readiness Score: <b>${readinessScore}%</b></div>
      <div class="meta">Exported Date: ${new Date().toLocaleDateString('en-IN')}</div>
      <div class="meta">Accreditation Version: ABDM & NABH 6th Edition Validated</div>
      <br/>
      <table>
        <thead>
          <tr>
            <th>NABH Criteria ID</th>
            <th>Chapter</th>
            <th>Criteria Title</th>
            <th>Department</th>
            <th>Status</th>
            <th>Score (out of 10)</th>
          </tr>
        </thead>
        <tbody>`;
        
    standards.forEach(std => {
      html += `<tr>
        <td><b>${std.id}</b></td>
        <td>${std.chapter}</td>
        <td>${std.title}</td>
        <td>${std.department}</td>
        <td>${std.status}</td>
        <td>${std.score}</td>
      </tr>`;
    });

    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VaidyaQ_Readiness_${hospitalName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess("Accreditation spreadsheet XLS compiled and downloaded!");
    setTimeout(() => setExportSuccess(''), 3000);
    logActivity("Exported accreditation spreadsheet in XLS format.");
  };

  // 4. Export Word (DOC)
  const handleExportDOC = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/><style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
      h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; font-size: 20pt; }
      h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; font-size: 14pt; margin-top: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th { background-color: #f3f4f6; font-weight: bold; border: 1px solid #d1d5db; padding: 8px; text-align: left; }
      td { border: 1px solid #d1d5db; padding: 8px; }
      .summary-box { background-color: #eff6ff; padding: 12px; border: 1px solid #bfdbfe; border-radius: 6px; margin-bottom: 20px; }
    </style></head>
    <body>
      <h1>VaidyaQ Accreditation Audit Summary Dossier</h1>
      <div class="summary-box">
        <p><b>Hospital / Facility Name:</b> ${hospitalName}</p>
        <p><b>NABH Accreditation Cycle:</b> Cycle 6 (6th Edition Standard)</p>
        <p><b>ABDM Sandbox Integration:</b> Validated & Approved</p>
        <p><b>Readiness score:</b> ${readinessScore}%</p>
        <p><b>Open CAPA Corrective Items:</b> ${openCapasCount}</p>
        <p><b>Missing Evidence Proof Uploads:</b> ${missingEvidenceCount}</p>
        <p><b>Dossier Compiled On:</b> ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <h2>1. Standards Chapter Scoring</h2>
      <table>
        <thead>
          <tr>
            <th>Criteria ID</th>
            <th>Standard Description</th>
            <th>Department</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>`;
        
    standards.forEach(std => {
      html += `<tr>
        <td><b>${std.id}</b></td>
        <td>${std.title}</td>
        <td>${std.department}</td>
        <td>${std.score}/10</td>
        <td>${std.status}</td>
      </tr>`;
    });

    html += `</tbody></table>
      <h2>2. Clinical Quality Indicators</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Patient Falls</th>
            <th>Medication Errors</th>
            <th>HAI Infections</th>
            <th>Needle-Sticks</th>
          </tr>
        </thead>
        <tbody>`;
        
    qualityIndicators.forEach(ind => {
      html += `<tr>
        <td><b>${ind.month}</b></td>
        <td>${ind.falls}</td>
        <td>${ind.medicationErrors}</td>
        <td>${ind.infections}</td>
        <td>${ind.needleSticks}</td>
      </tr>`;
    });

    html += `</tbody></table>
      <h2>3. Regulatory Compliance Licenses</h2>
      <table>
        <thead>
          <tr>
            <th>License Name</th>
            <th>Responsible Authority</th>
            <th>Current Status</th>
          </tr>
        </thead>
        <tbody>`;
        
    licenses.forEach(lic => {
      html += `<tr>
        <td><b>${lic.name}</b></td>
        <td>${lic.authority}</td>
        <td>${lic.status}</td>
      </tr>`;
    });

    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VaidyaQ_Compliance_Dossier_${hospitalName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess("Accreditation summary DOC compiled and downloaded!");
    setTimeout(() => setExportSuccess(''), 3000);
    logActivity("Exported accreditation dossier in Word format.");
  };

  return (
    <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
      {/* Title */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Accreditation Reports Compiler</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
            Generate, compile, and download consolidated quality trend portfolios and NABH compliance dossiers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={handlePrint} className="btn btn-secondary flex align-center gap-1.5" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
            <Printer size={14} /> PDF / Print Layout
          </button>
          <button onClick={handleExportDOC} className="btn btn-secondary flex align-center gap-1.5" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
            <FileText size={14} /> Word (.DOC)
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary flex align-center gap-1.5" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
            <FileDown size={14} /> CSV Spreadsheet
          </button>
          <button onClick={handleExportXLS} className="btn btn-primary flex align-center gap-1.5 glow-premium" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
            <LayoutGrid size={14} /> Excel (.XLS)
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {exportSuccess && (
        <div className="card" style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', border: '1px solid var(--color-success)', padding: '0.8rem 1.2rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {exportSuccess}
        </div>
      )}

      {/* Compiler Layout Grid */}
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* AI Reports Agent Card */}
        {(!aiSettings || !aiSettings.enabled) ? (
          <div className="card" style={{ borderLeft: '4px solid var(--border-color)', padding: '1.5rem', opacity: 0.7 }}>
            <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="flex align-center gap-2">
                <Sparkles size={20} color="var(--text-tertiary)" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>VaidyaQ AI Reports Agent</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Generates professional executive commentary, gap analysis, and statutory warnings.
                  </p>
                </div>
              </div>
              <button 
                disabled
                className="btn btn-secondary flex align-center gap-1.5" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'not-allowed' }}
              >
                <Sparkles size={12} />
                AI Disabled (Enable in Admin Settings)
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ borderLeft: '4px solid #7C3AED', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="flex align-center gap-2">
                <Sparkles size={20} color="#7C3AED" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>VaidyaQ AI Reports Agent</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Generates professional executive commentary, gap analysis, and statutory warnings.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleAnalyzeReportWithAI} 
                disabled={isAnalyzingReport}
                className="btn btn-primary flex align-center gap-1.5" 
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  border: 'none'
                }}
              >
                {isAnalyzingReport ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Generate AI Analysis Report
                  </>
                )}
              </button>
            </div>

            {/* Render reports drafts */}
            {(() => {
              const reportOutputs = aiOutputs.filter(out => out.module === 'reports' && out.agentType === 'Reports Agent');
              if (reportOutputs.length === 0) return null;

              // Show latest output
              const latest = reportOutputs[0];
              const isDraft = latest.status === 'draft';
              
              return (
                <div className="flex flex-col gap-3 animate-fade-in" style={{ marginTop: '0.5rem' }}>
                  <div 
                    className={isDraft ? 'ai-draft-watermark' : ''} 
                    style={{ 
                      fontSize: '0.8rem', 
                      whiteSpace: 'pre-wrap', 
                      lineHeight: '1.5', 
                      maxHeight: '300px', 
                      overflowY: 'auto', 
                      padding: '1rem', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderRadius: '6px', 
                      border: isDraft ? '1px dashed #7C3AED' : '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      position: 'relative'
                    }}
                  >
                    {latest.content}
                  </div>

                  <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="flex align-center gap-2">
                      {isDraft ? (
                        <span className="badge" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', fontSize: '0.65rem' }}>
                          Draft awaiting review
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          ✓ Approved & Verified by {latest.reviewedBy || 'Admin'}
                        </span>
                      )}
                      {latest.structuredOutput?.confidence && (
                        <span className={`ai-confidence-badge ai-confidence-${latest.structuredOutput.confidence}`} style={{ fontSize: '0.65rem' }}>
                          Confidence: {latest.structuredOutput.confidence}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="btn btn-secondary-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          navigator.clipboard.writeText(latest.content);
                          alert("Copied AI report text to clipboard!");
                        }}
                      >
                        <Copy size={12} /> Copy Text
                      </button>
                      {isDraft && (
                        <>
                          <button
                            className="btn btn-secondary-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', color: 'var(--color-danger)' }}
                            onClick={() => updateAiOutputStatus(latest.outputId, 'rejected', currentUser?.name || 'Admin')}
                          >
                            Reject
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ 
                              padding: '0.35rem 0.65rem', 
                              fontSize: '0.7rem',
                              background: 'var(--color-success)',
                              border: 'none'
                            }}
                            onClick={() => updateAiOutputStatus(latest.outputId, 'approved', currentUser?.name || 'Admin')}
                          >
                            Approve & Publish
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Consolidated summary card */}
        <div className="card" style={{ borderTop: '6px solid var(--primary)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Consolidated Quality Audit Dossier</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
              Standard Compliance Cycle: <strong>Jan 2025 - Jan 2029 (Cycle 6)</strong>
            </p>
            <span className="badge badge-success" style={{ display: 'inline-flex', alignSelf: 'center', fontSize: '0.65rem' }}>
              ABDM Sandbox Validated & Certified
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Readiness Index</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>{readinessScore}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Open CAPA Items</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: openCapasCount > 0 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '0.2rem' }}>{openCapasCount}</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Missing Proof Files</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: missingEvidenceCount > 0 ? 'var(--color-warning)' : 'var(--text-primary)', marginTop: '0.2rem' }}>{missingEvidenceCount}</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active SOP Policies</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{documents.length}</div>
            </div>
          </div>

          {/* Section 1: Standard Scores */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              1. Standards Chapters Scorecard
            </h3>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Criteria ID</th>
                  <th>Standard Description</th>
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
                      <span className={`badge ${std.score === 10 ? 'badge-success' : std.score === 5 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {std.score}/10 - {std.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Clinical Indicators */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              2. Clinical Quality Indicators (Monthly Trend)
            </h3>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Audit Month</th>
                  <th>Patient Falls</th>
                  <th>Medication Errors</th>
                  <th>Healthcare Infections</th>
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              3. Regulatory License Status
            </h3>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {licenses.map((lic, idx) => (
                <li key={idx} className="flex justify-between align-center" style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span><strong>{lic.name}</strong> ({lic.authority})</span>
                  <span className={`badge ${lic.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>{lic.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
