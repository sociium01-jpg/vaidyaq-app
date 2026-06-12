import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { 
  ShieldCheck, Lock, Activity, Users, Settings, UserPlus, 
  RefreshCw, Play, CircleAlert, CheckCircle, Database,
  ArrowLeft, Folder, FolderOpen, FileText, Download, Trash, 
  Plus, ShieldAlert, Sparkles, Send, Coins, FileCheck, HelpCircle,
  TrendingUp, HardDrive, Calendar, CreditCard, ChevronRight, ChevronDown, LogOut,
  Sliders, Printer, Mail, MessageSquare
} from 'lucide-react';

export default function VendorAdminConsole() {
  const {
    clientsList,
    setClientsList,
    vendorAdminCredentials,
    setVendorAdminCredentials,
    vendorEmployees,
    setVendorEmployees,
    setClientStatusOverride,
    auditLogs,
    supportTickets,
    setSupportTickets,
    emailLogs,
    transactions,
    vendorGeminiKey,
    saveVendorGeminiKey,
    sendSimulatedEmail,
    logSimulatedDownload,
    setCurrentRoute
  } = useContext(QualiNABHContext);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'crm', 'finance', 'tickets', 'staff', 'emails', 'copilot', 'settings'

  // Chart Type State
  const [chartType, setChartType] = useState('line');

  // Client Explorer State
  const [clientSearch, setClientSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedCrmClient, setSelectedCrmClient] = useState(null);
  
  // Client Form Details Override States
  const [crmAddress, setCrmAddress] = useState('');
  const [crmBeds, setCrmBeds] = useState(0);
  const [crmRegId, setCrmRegId] = useState('');
  const [crmGovId, setCrmGovId] = useState('');
  const [crmGovIdType, setCrmGovIdType] = useState('GSTIN');
  const [crmGovIdStatus, setCrmGovIdStatus] = useState('Pending');
  const [crmSaveSuccess, setCrmSaveSuccess] = useState(false);

  // Finance Customizer States
  const [financeSelectedClient, setFinanceSelectedClient] = useState('');
  const [invoiceLogo, setInvoiceLogo] = useState('VaidyaQ');
  const [invoiceCompanyName, setInvoiceCompanyName] = useState('VaidyaQ Technologies Pvt. Ltd.');
  const [invoiceAddress, setInvoiceAddress] = useState('DLF Cyber City, Phase 3, Gurugram, Haryana - 122002');
  const [invoiceGst, setInvoiceGst] = useState('06AAAAA1111A1Z1');
  const [invoiceTerms, setInvoiceTerms] = useState('Due within 30 days');
  const [invoiceFooterNotice, setInvoiceFooterNotice] = useState('For billing inquiries, contact billing@vaidyaq.com / +91 8850822250');
  
  // Customizer Checklist Toggles
  const [layoutShowLogo, setLayoutShowLogo] = useState(true);
  const [layoutShowGstSplit, setLayoutShowGstSplit] = useState(true);
  const [layoutIncludeBank, setLayoutIncludeBank] = useState(true);
  const [layoutIncludeTerms, setLayoutIncludeTerms] = useState(true);
  const [layoutIncludeFooter, setLayoutIncludeFooter] = useState(true);

  // Tickets Desk States
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilterPriority, setTicketFilterPriority] = useState('All');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');

  // Staff Console CRUD States
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState('Support Agent');
  const [empPermissions, setEmpPermissions] = useState(['view_crm', 'resolve_tickets']);
  const [empSuccess, setEmpSuccess] = useState(false);

  // Gemini AI Panel States
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(vendorGeminiKey || '');
  const [apiKeySuccess, setApiKeySuccess] = useState(false);

  // Email simulator search state
  const [emailSearch, setEmailSearch] = useState('');
  const [emailCategoryFilter, setEmailCategoryFilter] = useState('All');

  // Console Settings State
  const [newUsername, setNewUsername] = useState(vendorAdminCredentials.username);
  const [newPassword, setNewPassword] = useState(vendorAdminCredentials.password);
  const [credSuccess, setCredSuccess] = useState(false);

  // Prepopulate first client for Finance Invoice builder on load
  useEffect(() => {
    if (clientsList.length > 0 && !financeSelectedClient) {
      setFinanceSelectedClient(clientsList[0].hospitalId);
    }
  }, [clientsList, financeSelectedClient]);

  // Sync internal gemini key input state if parent changes
  useEffect(() => {
    setApiKeyInput(vendorGeminiKey);
  }, [vendorGeminiKey]);

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Check Super Admin Credentials
    if (usernameInput === vendorAdminCredentials.username && passwordInput === vendorAdminCredentials.password) {
      const superOperator = {
        name: "Super Admin",
        role: "Platform Administrator",
        permissions: ['view_crm', 'manage_finance', 'resolve_tickets', 'configure_staff']
      };
      setIsLoggedIn(true);
      setCurrentOperator(superOperator);
      setLoginError(false);
      return;
    }

    // Check Employee Credentials
    const matchedEmployee = vendorEmployees.find(
      emp => emp.username === usernameInput && emp.password === passwordInput
    );

    if (matchedEmployee) {
      const operator = {
        name: matchedEmployee.name,
        role: matchedEmployee.role,
        permissions: matchedEmployee.permissions || (matchedEmployee.role === 'Support Agent' ? ['view_crm', 'resolve_tickets'] : matchedEmployee.role === 'Billing Manager' ? ['view_crm', 'manage_finance'] : ['view_crm', 'manage_finance', 'resolve_tickets', 'configure_staff'])
      };
      setIsLoggedIn(true);
      setCurrentOperator(operator);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentOperator(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Helper to check user permission classes
  const hasPermission = (perm) => {
    if (!currentOperator) return false;
    return currentOperator.permissions.includes(perm);
  };

  // 1. CRM - Expand Client Folder
  const toggleFolder = (hospId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [hospId]: !prev[hospId]
    }));
  };

  // CRM - Load client into editable form
  const loadCrmClient = (client) => {
    setSelectedCrmClient(client.hospitalId);
    setCrmAddress(client.address || '');
    setCrmBeds(client.beds || 0);
    setCrmRegId(client.regId || '');
    setCrmGovId(client.govId || '');
    setCrmGovIdType(client.govIdType || 'GSTIN');
    setCrmGovIdStatus(client.govIdStatus || 'Pending');
    setCrmSaveSuccess(false);
  };

  // CRM - Save updated client metadata details
  const handleSaveCrmClientDetails = (e) => {
    e.preventDefault();
    setClientsList(prev => prev.map(c => {
      if (c.hospitalId === selectedCrmClient) {
        return {
          ...c,
          address: crmAddress,
          beds: Number(crmBeds),
          regId: crmRegId,
          govId: crmGovId,
          govIdType: crmGovIdType,
          govIdStatus: crmGovIdStatus
        };
      }
      return c;
    }));
    setCrmSaveSuccess(true);
    setTimeout(() => setCrmSaveSuccess(false), 3000);
  };

  // CRM - Export entire client list as CSV download
  const handleExportCsv = () => {
    const headers = ['Hospital ID', 'Hospital Name', 'Owner Email', 'Beds', 'Signup Date', 'Plan Expiry', 'Status', 'Gov ID Type', 'Gov ID Status', 'Gov ID Value', 'Storage (Bytes)', 'Bounced'];
    const rows = clientsList.map(c => [
      c.hospitalId,
      `"${c.hospitalName.replace(/"/g, '""')}"`,
      c.email,
      c.beds,
      c.signupDate || c.trialStartDate,
      c.planExpiryDate,
      c.status,
      c.govIdType,
      c.govIdStatus,
      c.govId || '',
      c.storageUsed || 0,
      c.bounced ? 'Yes' : 'No'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VaidyaQ_CRM_Database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CRM - Documents Vault simulated file download
  const handleDownloadMockFile = (clientName, filename) => {
    logSimulatedDownload(`${clientName}/${filename}`);
    
    const blob = new Blob([
      `--------------------------------------------------\n`,
      `VAIDYAQ SECURE CLINICAL VAULT: DOWNLOAD RECEIPT\n`,
      `--------------------------------------------------\n`,
      `Client: ${clientName}\n`,
      `Document: ${filename}\n`,
      `Download Date: ${new Date().toLocaleString()}\n`,
      `Authorized Operator: ${currentOperator.name} (${currentOperator.role})\n`,
      `Status: Decrypted and Audited Successfully.\n`,
      `--------------------------------------------------\n\n`,
      `This is a secure simulation representing VaidyaQ CRM Document Vault exports.`
    ], { type: 'text/plain;charset=utf-8' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith('.txt') ? filename : filename + '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Finance - Print Custom Invoice
  const handlePrintInvoice = () => {
    const invoiceContent = document.getElementById('invoice-preview-container').innerHTML;
    const printWindow = window.open('about:blank', '_blank', 'width=800,height=900');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>VaidyaQ Tax Invoice Preview</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 2rem; color: #333; line-height: 1.5; }
            .invoice-container { border: 1px solid #ccc; padding: 2rem; border-radius: 8px; max-width: 700px; margin: auto; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .align-center { align-items: center; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            .mb-4 { margin-bottom: 1rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
            th, td { border-bottom: 1px solid #eee; padding: 0.75rem 0.5rem; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .text-right { text-align: right; }
            .text-muted { color: #666; font-size: 0.85rem; }
            .badge-success { background-color: #e6f4ea; color: #137333; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
            .border-top { border-top: 2px solid #ddd; font-weight: bold; }
            .bank-details { background: #fdfdfd; border: 1px dashed #ccc; padding: 1rem; border-radius: 6px; font-size: 0.85rem; margin-top: 1.5rem; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invoiceContent}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Support Tickets - Change status
  const updateTicketStatus = (ticketId, nextStatus) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = { ...t, status: nextStatus };
        // Log action and send simulated confirmation email to hospital
        sendSimulatedEmail(
          "quality.head@hospital.org",
          `Support Ticket ${t.sequenceCode} Status Update: ${nextStatus}`,
          `Hello, your support ticket ${t.sequenceCode} regarding "${t.title}" is now marked as: ${nextStatus}. Assigned staff: ${t.assignedOperator}.`,
          "Ticket"
        );
        return updated;
      }
      return t;
    }));
  };

  // Support Staff - Register Operator
  const handleRegisterEmployee = (e) => {
    e.preventDefault();
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: empName,
      email: empEmail,
      role: empRole,
      username: empUsername,
      password: empPassword,
      permissions: empPermissions,
      assignedClients: ['demo-hosp']
    };
    setVendorEmployees(prev => [...prev, newEmp]);
    setEmpName('');
    setEmpEmail('');
    setEmpUsername('');
    setEmpPassword('');
    setEmpSuccess(true);
    setTimeout(() => setEmpSuccess(false), 3000);
  };

  // Support Staff - Delete Operator
  const handleDeleteEmployee = (empId) => {
    setVendorEmployees(prev => prev.filter(e => e.id !== empId));
  };

  // Staff Permissions Selector Helper
  const togglePermissionSelection = (perm) => {
    if (empPermissions.includes(perm)) {
      setEmpPermissions(prev => prev.filter(p => p !== perm));
    } else {
      setEmpPermissions(prev => [...prev, perm]);
    }
  };

  // Console Settings - Save Credentials
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    setVendorAdminCredentials({ username: newUsername, password: newPassword });
    setCredSuccess(true);
    setTimeout(() => setCredSuccess(false), 3000);
  };

  // Gemini AI Panel - Set API Key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    saveVendorGeminiKey(apiKeyInput);
    setApiKeySuccess(true);
    setTimeout(() => setApiKeySuccess(false), 3000);
  };

  // Gemini AI Panel - Query LLM
  const handleQueryCopilot = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    const contextSummary = `
You are the VaidyaQ AI Operations Co-pilot, assisting VaidyaQ internal employees.
We have ${clientsList.length} clients registered in the SaaS CRM.
Clients: ${JSON.stringify(clientsList.map(c => ({ name: c.hospitalName, beds: c.beds, status: c.status, govIdStatus: c.govIdStatus, bounced: c.bounced, storageUsed: c.storageUsed })))}
Active Support Tickets: ${JSON.stringify(supportTickets.map(t => ({ title: t.title, priority: t.priority, status: t.status, assignee: t.assignedOperator })))}
Recent transactions: ${JSON.stringify(transactions.map(t => ({ hospital: t.hospitalName, amount: t.amount, date: t.date, status: t.status })))}

Answer the user query precisely based on this data. Use markdown tables or lists when appropriate.
`;

    if (vendorGeminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${vendorGeminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${contextSummary}\n\nUser Question: ${aiQuery}` }]
              }]
            })
          }
        );
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received. Verify API key privileges.";
        setAiResponse(text);
      } catch (err) {
        setAiResponse(`Failed to contact Google Gemini API: ${err.message}`);
      }
    } else {
      // Mock LLM Response parsing
      setTimeout(() => {
        const queryLower = aiQuery.toLowerCase();
        if (queryLower.includes('storage') || queryLower.includes('hard drive') || queryLower.includes('backup')) {
          setAiResponse(`### VaidyaQ Storage Analysis (Mock Response)
- **Aggregated Vault Size**: ${(clientsList.reduce((sum, c) => sum + (c.storageUsed || 0), 0) / (1024 * 1024)).toFixed(2)} MB
- **Highest Storage Consumer**: Dwarka Metro Hospital (3.14 MB)
- **Recommendations**: Auto-archive clinical checklist logs older than 90 days. Backups are active via local storage mirroring. Input a live Google Gemini key to run full automated checks.`);
        } else if (queryLower.includes('revenue') || queryLower.includes('sale') || queryLower.includes('gst') || queryLower.includes('invoice')) {
          const totalRev = transactions.reduce((sum, t) => sum + t.amount, 0);
          const totalGst = transactions.reduce((sum, t) => sum + t.gst, 0);
          setAiResponse(`### Financial Audit Co-pilot Insights (Mock Response)
- **Total Revenue Collected**: ₹${totalRev.toLocaleString()}
- **Dynamic GST CGST/SGST collected (18%)**: ₹${totalGst.toLocaleString()}
- **Key Accounts**: 1 Paid, 1 Active Trial (Expected upgrade date: 2026-06-19).
*Tip: Configure a Google Gemini key for real-time comparative forecasting metrics.*`);
        } else if (queryLower.includes('ticket') || queryLower.includes('error') || queryLower.includes('support') || queryLower.includes('troubleshoot')) {
          const open = supportTickets.filter(t => t.status === 'Open').length;
          setAiResponse(`### Support Desk Dispatch Summary (Mock Response)
- **Active Tickets Queue**: ${supportTickets.length} (${open} Open, 0 Resolved)
- **Sequence Route mapping**:
  - High Priority: Routed to Aarav Sharma (Assigned: ${supportTickets.filter(t => t.assignedOperator === 'Aarav Sharma').length})
  - Low/Medium Priority: Routed to Priya Nair (Assigned: ${supportTickets.filter(t => t.assignedOperator === 'Priya Nair').length})
*All outbound auto-notification templates for tickets are firing successfully.*`);
        } else {
          setAiResponse(`### VaidyaQ Operations Assistant (Mock Response)
I am currently running in **Mock Fallback Mode** because no Google Gemini API key is configured.
I can analyze:
1. SaaS clients storage status.
2. Troubleshooting tickets and seq routing queues.
3. Billings, invoices, and CGST/SGST tax balances.

Please enter a valid **Google Gemini API Key** in the chat header to enable live LLM reasoning.`);
        }
      }, 700);
    }
    setAiLoading(false);
  };

  // Security Lock Overlay Guard
  const renderPermissionGuard = (requiredPermission, children) => {
    if (hasPermission(requiredPermission)) {
      return children;
    }
    return (
      <div style={{ 
        position: 'relative', 
        minHeight: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px', 
        padding: '3rem',
        marginTop: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ display: 'inline-flex', padding: '1.25rem', backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Lock size={36} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Access Restructured</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Your operator profile (<strong>{currentOperator?.name}</strong> - <em>{currentOperator?.role}</em>) does not possess the <code>{requiredPermission}</code> permission privilege required for this sub-desk.
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            Please coordinate with a Platform Administrator (Super Admin) to alter security clearances.
          </div>
        </div>
      </div>
    );
  };

  // 1. PUBLIC CREDENTIALS LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', textAlign: 'left', backgroundColor: 'var(--bg-primary)' }}>
        <div className="card shadow-lg" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <ShieldCheck size={36} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Vendor Admin Console</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              VaidyaQ Internal Operations & CRM Manager
            </p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-danger)', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CircleAlert size={16} /> <span>Incorrect office credentials. Try again.</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Office Username</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. admin or aarav"
                className="form-control"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{ width: '100%', padding: '0.7rem' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Security Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="form-control"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '0.7rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary glow-premium" style={{ padding: '0.8rem', width: '100%', marginTop: '1.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
              Unlock Console
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.7rem', lineHeight: '1.4' }}>
            🔒 256-bit vault protection. Unauthorized logins are audited.<br />
            (Mocks: <strong>admin</strong>/<strong>123</strong>, <strong>aarav</strong>/<strong>123</strong>, <strong>priya</strong>/<strong>123</strong>)
          </div>
        </div>
      </div>
    );
  }

  // Calculate SaaS Metrics
  const totalClientsCount = clientsList.length;
  const trialClientsCount = clientsList.filter(c => c.status === 'Active Trial').length;
  const paidClientsCount = clientsList.filter(c => c.status === 'Paid').length;
  const restrictedClientsCount = clientsList.filter(c => c.status === 'Restricted' || c.status === 'Expired').length;
  const bouncedClientsCount = clientsList.filter(c => c.bounced).length;
  const bounceRatePercent = totalClientsCount > 0 ? Math.round((bouncedClientsCount / totalClientsCount) * 100) : 0;
  
  // Aggregate Storage size (convert to MB)
  const totalStorageSize = clientsList.reduce((sum, c) => sum + (c.storageUsed || 0), 0);
  const totalStorageSizeMB = (totalStorageSize / (1024 * 1024)).toFixed(2);
  const storageQuotaMB = 50.0; // Vendor standard server quota cap
  const storagePercentage = Math.min(100, Math.round((parseFloat(totalStorageSizeMB) / storageQuotaMB) * 100));

  // Finance Selected Client Detail Calculations
  const selectedClient = clientsList.find(c => c.hospitalId === financeSelectedClient);
  const billingBeds = selectedClient?.beds || 0;
  const billingBaseAmount = billingBeds <= 20 ? 55999 : billingBeds <= 150 ? 129999 : 249999;
  const calculatedCgst = Math.round(billingBaseAmount * 0.09 * 100) / 100;
  const calculatedSgst = Math.round(billingBaseAmount * 0.09 * 100) / 100;
  const calculatedGstTotal = calculatedCgst + calculatedSgst;
  const calculatedInvoiceTotal = billingBaseAmount + calculatedGstTotal;

  // Filtered lists
  const filteredCrmClients = clientsList.filter(c => 
    c.hospitalName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredTickets = supportTickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(ticketSearch.toLowerCase()) || 
                          t.sequenceCode.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.clientName.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesPriority = ticketFilterPriority === 'All' || t.priority === ticketFilterPriority;
    const matchesStatus = ticketFilterStatus === 'All' || t.status === ticketFilterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const filteredEmails = emailLogs.filter(m => {
    const matchesSearch = m.recipient.toLowerCase().includes(emailSearch.toLowerCase()) ||
                          m.subject.toLowerCase().includes(emailSearch.toLowerCase()) ||
                          m.body.toLowerCase().includes(emailSearch.toLowerCase());
    const matchesCategory = emailCategoryFilter === 'All' || m.category === emailCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', textAlign: 'left', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Upper Navigation Bar */}
      <div className="flex align-center justify-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div className="flex align-center gap-2">
          <button 
            onClick={() => setCurrentRoute('/')} 
            className="btn btn-secondary flex align-center gap-1"
            style={{ padding: '0.5rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', borderRadius: '8px' }}
          >
            <ArrowLeft size={16} /> <span>Landing Page</span>
          </button>
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
          <div className="flex align-center gap-1">
            <ShieldCheck size={26} color="var(--primary)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>VaidyaQ Employee Console</h1>
          </div>
        </div>

        <div className="flex align-center gap-2">
          <div className="card" style={{ padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', animate: 'pulse 2s infinite' }}></div>
            <span>Logged: <strong>{currentOperator?.name}</strong> ({currentOperator?.role})</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary flex align-center gap-1" style={{ padding: '0.45rem 0.75rem', cursor: 'pointer', borderRadius: '8px' }}>
            <LogOut size={14} /> <span>Lock</span>
          </button>
        </div>
      </div>

      {/* HubSpot Style Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side Navigation Menu */}
        <div className="card flex flex-col gap-1" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workspaces
          </div>
          
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'dashboard' ? 700 : 500
            }}
          >
            <Activity size={16} /> <span>HubSpot Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('crm')} 
            className={`tab-btn ${activeTab === 'crm' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'crm' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'crm' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'crm' ? 700 : 500
            }}
          >
            <Database size={16} /> <span>Client CRM Folders</span>
          </button>

          <button 
            onClick={() => setActiveTab('finance')} 
            className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'finance' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'finance' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'finance' ? 700 : 500
            }}
          >
            <Coins size={16} /> <span>Finance & Invoices</span>
          </button>

          <button 
            onClick={() => setActiveTab('tickets')} 
            className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'tickets' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'tickets' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'tickets' ? 700 : 500
            }}
          >
            <ShieldAlert size={16} /> <span>Troubleshoot Queue</span>
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }}></div>
          <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Tools
          </div>

          <button 
            onClick={() => setActiveTab('staff')} 
            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'staff' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'staff' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'staff' ? 700 : 500
            }}
          >
            <Users size={16} /> <span>Support Staff CRUD</span>
          </button>

          <button 
            onClick={() => setActiveTab('emails')} 
            className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'emails' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'emails' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'emails' ? 700 : 500
            }}
          >
            <Mail size={16} /> <span>Email Simulation Logs</span>
          </button>

          <button 
            onClick={() => setActiveTab('copilot')} 
            className={`tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'copilot' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'copilot' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'copilot' ? 700 : 500
            }}
          >
            <Sparkles size={16} /> <span>Gemini AI Chat Co-pilot</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'settings' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'settings' ? 700 : 500
            }}
          >
            <Settings size={16} /> <span>Console Settings</span>
          </button>
        </div>

        {/* Right Main Panel Container */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* TAB 1: HUBSPOT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-3">
              {/* Marketing Metrics Row */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                
                <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Trial Accounts</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>{trialClientsCount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Auto-locks app after 7 days</div>
                </div>

                <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Paid SaaS Customers</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-success)' }}>{paidClientsCount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Renewals: 365d term cycles</div>
                </div>

                <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CRM Bounce Rate</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-danger)' }}>{bounceRatePercent}%</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Bounced client hospitals count: {bouncedClientsCount}</div>
                </div>

                <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Database Storage Meter</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalStorageSizeMB} MB / {storageQuotaMB} MB</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${storagePercentage}%`, height: '100%', backgroundColor: storagePercentage > 80 ? 'var(--color-danger)' : 'var(--primary)', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{storagePercentage}%</span>
                  </div>
                </div>

              </div>

              {/* Comparative Charts Workspace */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '0.5rem' }}>
                <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Monthly Comparative Sales Operations (INR)</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Comparing current FY 2026 performance with previous Year FY 2025</p>
                  </div>
                  <div className="flex gap-1" style={{ border: '1px solid var(--border-color)', padding: '2px', borderRadius: '8px' }}>
                    <button 
                      onClick={() => setChartType('line')} 
                      className="btn" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: 'none', background: chartType === 'line' ? 'var(--primary-light)' : 'transparent', color: chartType === 'line' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px' }}
                    >
                      Line Graph
                    </button>
                    <button 
                      onClick={() => setChartType('bar')} 
                      className="btn" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: 'none', background: chartType === 'bar' ? 'var(--primary-light)' : 'transparent', color: chartType === 'bar' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px' }}
                    >
                      Bar Graph
                    </button>
                  </div>
                </div>

                {/* SVG Visual Renderer */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <svg viewBox="0 0 600 240" style={{ width: '100%', height: 'auto', minWidth: '500px' }}>
                    {/* Background Grid Lines */}
                    {[0, 50, 100, 150, 200].map((y, i) => (
                      <line 
                        key={i} 
                        x1="40" 
                        y1={y + 10} 
                        x2="580" 
                        y2={y + 10} 
                        stroke="var(--border-color)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                    ))}
                    
                    {/* Graph Axes */}
                    <line x1="40" y1="10" x2="40" y2="210" stroke="var(--text-tertiary)" strokeWidth="1.5" />
                    <line x1="40" y1="210" x2="580" y2="210" stroke="var(--text-tertiary)" strokeWidth="1.5" />

                    {/* Chart Core Data Points Mapping */}
                    {(() => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const sales2025 = [120000, 150000, 180000, 200000, 220000, 250000, 270000, 300000, 310000, 350000, 380000, 420000];
                      const sales2026 = [250000, 300000, 350000, 420000, 490000, 530000, null, null, null, null, null, null];

                      const getX = (idx) => 50 + (idx * 46);
                      const getY = (val) => 210 - (val * 180 / 600000);

                      if (chartType === 'line') {
                        // Polylines representation
                        const pts2025 = sales2025.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
                        const pts2026 = sales2026.filter(v => v !== null).map((v, i) => `${getX(i)},${getY(v)}`).join(' ');

                        return (
                          <>
                            {/* 2025 Line */}
                            <polyline fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeDasharray="3 2" points={pts2025} />
                            {sales2025.map((v, i) => (
                              <circle key={`pt25-${i}`} cx={getX(i)} cy={getY(v)} r="3.5" fill="var(--text-tertiary)">
                                <title>2025 {months[i]}: ₹{v.toLocaleString()}</title>
                              </circle>
                            ))}

                            {/* 2026 Line */}
                            <polyline fill="none" stroke="var(--primary)" strokeWidth="3.5" points={pts2026} />
                            {sales2026.map((v, i) => v !== null && (
                              <circle key={`pt26-${i}`} cx={getX(i)} cy={getY(v)} r="5" fill="var(--primary)" stroke="var(--bg-secondary)" strokeWidth="1.5">
                                <title>2026 {months[i]}: ₹{v.toLocaleString()}</title>
                              </circle>
                            ))}
                          </>
                        );
                      } else {
                        // Bar representation
                        return (
                          <>
                            {/* Render pairs of bars */}
                            {months.map((m, i) => {
                              const x = getX(i) - 14;
                              const h25 = (sales2025[i] * 180 / 600000);
                              const h26 = sales2026[i] !== null ? (sales2026[i] * 180 / 600000) : 0;
                              return (
                                <g key={`bar-group-${i}`}>
                                  {/* 2025 Bar */}
                                  <rect x={x} y={210 - h25} width="10" height={h25} fill="var(--text-tertiary)" opacity="0.6">
                                    <title>2025 {m}: ₹{sales2025[i].toLocaleString()}</title>
                                  </rect>
                                  {/* 2026 Bar */}
                                  {sales2026[i] !== null && (
                                    <rect x={x + 12} y={210 - h26} width="10" height={h26} fill="var(--primary)" rx="2">
                                      <title>2026 {m}: ₹{sales2026[i].toLocaleString()}</title>
                                    </rect>
                                  )}
                                </g>
                              );
                            })}
                          </>
                        );
                      }
                    })()}

                    {/* Month X Labels */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <text key={i} x={50 + (i * 46)} y="228" fontSize="10" fill="var(--text-secondary)" textAnchor="middle">
                        {m}
                      </text>
                    ))}

                    {/* Y Axis Labels */}
                    {['0', '1.5L', '3L', '4.5L', '6L'].map((label, i) => (
                      <text key={i} x="32" y={210 - (i * 45)} fontSize="9" fill="var(--text-secondary)" textAnchor="end" dominantBaseline="middle">
                        ₹{label}
                      </text>
                    ))}
                  </svg>
                </div>

                {/* Graph Legend */}
                <div className="flex gap-4 justify-center" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
                  <div className="flex align-center gap-1">
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'var(--text-tertiary)', borderRadius: '2px', opacity: 0.6 }}></span>
                    <span style={{ color: 'var(--text-secondary)' }}>FY 2025 Revenue History</span>
                  </div>
                  <div className="flex align-center gap-1">
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></span>
                    <span style={{ color: 'var(--text-secondary)' }}>FY 2026 Target Subscription Payments</span>
                  </div>
                </div>
              </div>

              {/* Bounced Client Analytics Desk */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)' }}>
                  <CircleAlert size={16} /> <span>Bounced Client Funnel Tracking</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Hospitals that registered accounts but dropped out before configuring their digital standards, uploading SOPs, or validating licensing details.
                </p>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Hospital Name</th>
                      <th>Owner Email</th>
                      <th>Dynamic Beds</th>
                      <th>Onboarding Complete Steps</th>
                      <th>Subscription Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsList.filter(c => c.bounced).map(bc => (
                      <tr key={bc.hospitalId}>
                        <td style={{ fontWeight: 'bold' }}>{bc.hospitalName}</td>
                        <td>{bc.email}</td>
                        <td>{bc.beds} Beds</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', fontSize: '0.7rem' }}>
                            0 Steps (Bounced)
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{bc.status}</span>
                        </td>
                      </tr>
                    ))}
                    {clientsList.filter(c => c.bounced).length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '1.5rem', fontSize: '0.8rem' }}>
                          No bounced leads registered. All accounts have initialized onboarding configuration parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT CRM FOLDERS */}
          {activeTab === 'crm' && renderPermissionGuard('view_crm', (
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
              
              {/* Left Column: Explorer Directory Tree */}
              <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Database size={18} /> <span>Client Controls CRM Folder Tree</span>
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>HubSpot CRM folder explorer. Click hospital root node directories to expand vaults.</p>
                  </div>
                  <button onClick={handleExportCsv} className="btn btn-secondary flex align-center gap-1" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <Download size={14} /> <span>Export CRM Database (CSV)</span>
                  </button>
                </div>

                {/* Filter and Search */}
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search hospitals by owner email, city names..." 
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem' }}
                />

                {/* Folders List Tree */}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredCrmClients.map(client => {
                    const isExpanded = expandedFolders[client.hospitalId];
                    return (
                      <div key={client.hospitalId} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                        
                        {/* Folder Header Accordion */}
                        <div 
                          onClick={() => toggleFolder(client.hospitalId)} 
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                            padding: '0.85rem 1rem', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)',
                            transition: 'background 0.2s', borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isExpanded ? <FolderOpen size={18} color="var(--primary)" /> : <Folder size={18} color="var(--text-tertiary)" />}
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{client.hospitalName}</span>
                          </div>

                          <div className="flex align-center gap-2">
                            <span className="badge" style={{ 
                              backgroundColor: client.status === 'Paid' ? 'var(--bg-success)' : client.status === 'Expired' ? 'var(--bg-danger)' : 'var(--primary-light)', 
                              color: client.status === 'Paid' ? 'var(--color-success)' : client.status === 'Expired' ? 'var(--color-danger)' : 'var(--primary)',
                              fontSize: '0.7rem' 
                            }}>
                              {client.status}
                            </span>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        </div>

                        {/* Expanded folder contents (Subdirectories) */}
                        {isExpanded && (
                          <div style={{ padding: '0.5rem 1rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: 'none', backgroundColor: 'var(--bg-secondary)', opacity: 0.95 }}>
                            
                            {/* Directory Item 1: Profile metadata form trigger */}
                            <div 
                              onClick={() => loadCrmClient(client)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                              className="crm-tree-item"
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                📂 <span>Client Metadata & Verification</span>
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Click to Edit</span>
                            </div>

                            {/* Directory Item 2: Secure document vault manager */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.4rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }} className="crm-tree-folder">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                📂 <span>Documents Vault & Evidence Storage</span>
                              </span>
                              
                              <div style={{ padding: '0.25rem 0.25rem 0.25rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <div className="flex justify-between align-center" style={{ fontSize: '0.75rem', padding: '0.2rem 0' }}>
                                  <span>📄 accreditation_assessment.pdf</span>
                                  <button onClick={() => handleDownloadMockFile(client.hospitalName, 'accreditation_assessment.pdf')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.7rem' }}>
                                    <Download size={10} /> Download
                                  </button>
                                </div>
                                <div className="flex justify-between align-center" style={{ fontSize: '0.75rem', padding: '0.2rem 0' }}>
                                  <span>📄 fire_drill_noc_audit.jpg</span>
                                  <button onClick={() => handleDownloadMockFile(client.hospitalName, 'fire_drill_noc_audit.jpg')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.7rem' }}>
                                    <Download size={10} /> Download
                                  </button>
                                </div>
                                <div className="flex justify-between align-center" style={{ fontSize: '0.75rem', padding: '0.2rem 0' }}>
                                  <span>📄 bio_waste_regulatory_noc.pdf</span>
                                  <button onClick={() => handleDownloadMockFile(client.hospitalName, 'bio_waste_regulatory_noc.pdf')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.7rem' }}>
                                    <Download size={10} /> Download
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Directory Item 3: Support issues ticket query list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.4rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }} className="crm-tree-folder">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                📂 <span>Client Support Queries</span>
                              </span>
                              <div style={{ padding: '0.25rem 0.25rem 0.25rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
                                {supportTickets.filter(t => t.clientName === client.hospitalName).map(tick => (
                                  <div key={tick.id} className="flex justify-between align-center" style={{ padding: '0.2rem 0' }}>
                                    <span>🎟️ {tick.sequenceCode} - {tick.title.substring(0, 30)}...</span>
                                    <span style={{ fontStyle: 'italic', color: tick.status === 'Resolved' ? 'var(--color-success)' : 'var(--primary)' }}>
                                      {tick.status}
                                    </span>
                                  </div>
                                ))}
                                {supportTickets.filter(t => t.clientName === client.hospitalName).length === 0 && (
                                  <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No tickets reported by this client.</span>
                                )}
                              </div>
                            </div>

                            {/* Directory Item 4: Payment transactions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.4rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }} className="crm-tree-folder">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                📂 <span>Payment Receipts & Invoices</span>
                              </span>
                              <div style={{ padding: '0.25rem 0.25rem 0.25rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
                                {transactions.filter(t => t.hospitalName === client.hospitalName).map(tx => (
                                  <div key={tx.id} className="flex justify-between align-center" style={{ padding: '0.2rem 0' }}>
                                    <span>₹{tx.amount.toLocaleString()} ({tx.date})</span>
                                    <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>{tx.status}</span>
                                  </div>
                                ))}
                                {transactions.filter(t => t.hospitalName === client.hospitalName).length === 0 && (
                                  <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No transaction history found.</span>
                                )}
                              </div>
                            </div>

                            {/* Subscription Force Override Buttons */}
                            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.3rem', fontWeight: 700 }}>SUBSCRIPTION DIRECT OVERRIDES:</span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => setClientStatusOverride(client.hospitalId, 'Paid')} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                                >
                                  Upgrade Paid
                                </button>
                                <button 
                                  onClick={() => setClientStatusOverride(client.hospitalId, 'Expired')} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', cursor: 'pointer' }}
                                >
                                  Force Expire
                                </button>
                                <button 
                                  onClick={() => setClientStatusOverride(client.hospitalId, 'Restricted')} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                                >
                                  Suspend
                                </button>
                                <button 
                                  onClick={() => setClientStatusOverride(client.hospitalId, 'Active Trial')} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                  Reset Trial
                                </button>
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Dynamic CRUD Editor Form */}
              <div className="flex flex-col gap-3">
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <Sliders size={18} color="var(--primary)" /> <span>Client Profiles CRM Editor</span>
                  </h3>

                  {selectedCrmClient ? (
                    <form onSubmit={handleSaveCrmClientDetails} className="flex flex-col gap-3">
                      {crmSaveSuccess && (
                        <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                          Client profile metadata updated successfully in registry vault.
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Hospital Corporate Address</label>
                        <input 
                          type="text" 
                          required 
                          className="form-control"
                          value={crmAddress}
                          onChange={(e) => setCrmAddress(e.target.value)}
                        />
                      </div>

                      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Corporate Registration ID</label>
                          <input 
                            type="text" 
                            required 
                            className="form-control"
                            value={crmRegId}
                            onChange={(e) => setCrmRegId(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Bed Count</label>
                          <input 
                            type="number" 
                            required 
                            className="form-control"
                            value={crmBeds}
                            onChange={(e) => setCrmBeds(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Government ID auto verifications */}
                      <div className="form-group-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Government ID Type</label>
                          <select 
                            className="form-control"
                            value={crmGovIdType}
                            onChange={(e) => setCrmGovIdType(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <option value="GSTIN">GSTIN (Indian Corporate Tax)</option>
                            <option value="PAN">PAN (Income Tax Department)</option>
                            <option value="NABH ID">NABH Reference Certification ID</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Government ID Value</label>
                          <input 
                            type="text" 
                            required 
                            className="form-control"
                            value={crmGovId}
                            onChange={(e) => setCrmGovId(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Government ID Approval Status</label>
                        <div className="flex gap-2 align-center" style={{ marginTop: '0.25rem' }}>
                          <select 
                            className="form-control"
                            value={crmGovIdStatus}
                            onChange={(e) => setCrmGovIdStatus(e.target.value)}
                            style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', flex: 1 }}
                          >
                            <option value="Pending">Pending Audit Check</option>
                            <option value="Approved">Approved (Automatic Bypass)</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          
                          <button 
                            type="button" 
                            onClick={() => setCrmGovIdStatus('Approved')}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                          >
                            Auto Approve
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary glow-premium" style={{ padding: '0.65rem', marginTop: '0.75rem', cursor: 'pointer', fontWeight: 700 }}>
                        Save CRM Client Profile
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                      <HelpCircle size={32} style={{ marginBottom: '0.5rem', color: 'var(--text-tertiary)' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No client selected for editing</p>
                      <p style={{ fontSize: '0.75rem' }}>Expand a hospital directory on the left and select "Client Metadata" to configure verification parameters.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}

          {/* TAB 3: FINANCE & INVOICES */}
          {activeTab === 'finance' && renderPermissionGuard('manage_finance', (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '1.5rem' }}>
              
              {/* Left Column: Finance Configurator */}
              <div className="flex flex-col gap-3">
                
                {/* Billing Summary metrics */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <Coins size={16} /> <span>Dynamic Billing Collections</span>
                  </h3>
                  <div className="flex justify-between align-center" style={{ fontSize: '0.85rem', padding: '0.35rem 0' }}>
                    <span>Total Subscriptions base:</span>
                    <strong style={{ fontSize: '1rem' }}>₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between align-center" style={{ fontSize: '0.85rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span>Dynamic GST (18%) Collected:</span>
                    <strong>₹{transactions.reduce((sum, t) => sum + t.gst, 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between align-center" style={{ fontSize: '0.85rem', paddingTop: '0.5rem', fontWeight: 'bold' }}>
                    <span>Total Cash Flow (INR):</span>
                    <span style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>₹{transactions.reduce((sum, t) => sum + (t.amount + t.gst), 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Customizer Checklist Forms */}
                <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sliders size={16} /> <span>GST Invoice Customizer</span>
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Billed Client Hospital</label>
                    <select 
                      className="form-control"
                      value={financeSelectedClient}
                      onChange={(e) => setFinanceSelectedClient(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                    >
                      {clientsList.map(c => (
                        <option key={c.hospitalId} value={c.hospitalId}>{c.hospitalName} ({c.beds} beds)</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Our Corporate Name</label>
                    <input type="text" className="form-control" value={invoiceCompanyName} onChange={(e) => setInvoiceCompanyName(e.target.value)} style={{ padding: '0.45rem' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Our GSTIN Registry</label>
                    <input type="text" className="form-control" value={invoiceGst} onChange={(e) => setInvoiceGst(e.target.value)} style={{ padding: '0.45rem' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Our Address</label>
                    <input type="text" className="form-control" value={invoiceAddress} onChange={(e) => setInvoiceAddress(e.target.value)} style={{ padding: '0.45rem' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Payment Terms</label>
                    <input type="text" className="form-control" value={invoiceTerms} onChange={(e) => setInvoiceTerms(e.target.value)} style={{ padding: '0.45rem' }} />
                  </div>

                  {/* Checklist toggles */}
                  <div>
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Invoice Layout Configurator</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={layoutShowLogo} onChange={(e) => setLayoutShowLogo(e.target.checked)} />
                        <span>Show VQ Logo</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={layoutShowGstSplit} onChange={(e) => setLayoutShowGstSplit(e.target.checked)} />
                        <span>Show CGST/SGST Split</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={layoutIncludeBank} onChange={(e) => setLayoutIncludeBank(e.target.checked)} />
                        <span>Include Bank Details</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={layoutIncludeTerms} onChange={(e) => setLayoutIncludeTerms(e.target.checked)} />
                        <span>Include Terms Notice</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={layoutIncludeFooter} onChange={(e) => setLayoutIncludeFooter(e.target.checked)} />
                        <span>Include Footer Notice</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Invoice Preview box */}
              <div className="flex flex-col gap-3">
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Printer size={16} /> <span>Live Invoice Draft Layout</span>
                    </h3>
                    <button onClick={handlePrintInvoice} className="btn btn-primary flex align-center gap-1" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                      <Printer size={12} /> <span>Print / Save PDF</span>
                    </button>
                  </div>

                  {/* Invoice Printable Preview Container */}
                  <div id="invoice-preview-container" style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    
                    {/* Header */}
                    <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        {layoutShowLogo && (
                          <h2 style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>
                            {invoiceLogo}
                          </h2>
                        )}
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-secondary)' }}>
                          GST TAX INVOICE
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold' }}>Invoice #: VQ-2026-0041</div>
                        <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Company info */}
                    <div className="flex justify-between" style={{ marginBottom: '1rem', fontSize: '0.75rem', lineHeight: '1.4' }}>
                      <div>
                        <strong>From:</strong>
                        <div>{invoiceCompanyName}</div>
                        <div>{invoiceAddress}</div>
                        <div>GSTIN: <code>{invoiceGst}</code></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>To:</strong>
                        <div>{selectedClient?.hospitalName}</div>
                        <div>{selectedClient?.address || 'India'}</div>
                        <div>Contact: {selectedClient?.email}</div>
                        {selectedClient?.govId && <div>GSTIN: <code>{selectedClient?.govId}</code></div>}
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontWeight: 'bold' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item Description</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Unit Base</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Tax Class</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.5rem' }}>
                            <strong>VaidyaQ AI Accreditation Annual Subscription</strong>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                              SaaS license access mapped to {billingBeds} beds. Mapped standard models.
                            </div>
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>1 Year</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>18% GST</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{billingBaseAmount.toLocaleString()}</td>
                        </tr>

                        {/* Calculations */}
                        <tr>
                          <td colSpan="2" style={{ border: 'none' }}></td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>₹{billingBaseAmount.toLocaleString()}</td>
                        </tr>

                        {layoutShowGstSplit ? (
                          <>
                            <tr>
                              <td colSpan="2" style={{ border: 'none' }}></td>
                              <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CGST (9.0%):</td>
                              <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{calculatedCgst.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colSpan="2" style={{ border: 'none' }}></td>
                              <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SGST (9.0%):</td>
                              <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{calculatedSgst.toLocaleString()}</td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan="2" style={{ border: 'none' }}></td>
                            <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GST Total (18.0%):</td>
                            <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{calculatedGstTotal.toLocaleString()}</td>
                          </tr>
                        )}

                        <tr style={{ borderTop: '2px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          <td colSpan="2" style={{ border: 'none' }}></td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>Total Due:</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--primary)' }}>₹{calculatedInvoiceTotal.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Bank credentials */}
                    {layoutIncludeBank && (
                      <div style={{ marginTop: '1.25rem', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.7rem', lineHeight: '1.4', backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>🏦 Bank Payment Information:</strong>
                        <div>Beneficiary Name: <strong>VaidyaQ Technologies Private Limited</strong></div>
                        <div>Bank: <strong>ICICI Bank Limited</strong> • A/C No: <code>109205002931</code></div>
                        <div>IFSC Code: <code>ICIC0001092</code> • Branch: Dwarka Sector 5, New Delhi</div>
                      </div>
                    )}

                    {/* Terms */}
                    {layoutIncludeTerms && (
                      <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <strong>Terms & Conditions:</strong> {invoiceTerms}
                      </div>
                    )}

                    {/* Footer Notice */}
                    {layoutIncludeFooter && (
                      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        {invoiceFooterNotice}
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>
          ))}

          {/* TAB 4: SUPPORT TICKET QUEUE */}
          {activeTab === 'tickets' && renderPermissionGuard('resolve_tickets', (
            <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              
              <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={18} /> <span>Software Error Routing Queue</span>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>High priority tickets automatically routed to supervisor Aarav Sharma. Medium/Low priority routed to Priya Nair.</p>
                </div>
                
                {/* Active queues status counter */}
                <div className="flex gap-2">
                  <span className="badge" style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', fontSize: '0.75rem' }}>
                    Aarav Queue (High): {supportTickets.filter(t => t.assignedOperator === 'Aarav Sharma' && t.status !== 'Resolved').length} Open
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem' }}>
                    Priya Queue (Med/Low): {supportTickets.filter(t => t.assignedOperator === 'Priya Nair' && t.status !== 'Resolved').length} Open
                  </span>
                </div>
              </div>

              {/* Filters grid */}
              <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search tickets by title, customer hospital, or sequence code (TS-xxxx)..." 
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
                
                <select 
                  className="form-control" 
                  value={ticketFilterPriority} 
                  onChange={(e) => setTicketFilterPriority(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select 
                  className="form-control" 
                  value={ticketFilterStatus} 
                  onChange={(e) => setTicketFilterStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Table list */}
              <table className="table" style={{ marginTop: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>Seq Code</th>
                    <th>Customer Hospital</th>
                    <th>Issue Title</th>
                    <th>Priority</th>
                    <th>Assigned Operator</th>
                    <th>Resolution Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>{ticket.sequenceCode}</td>
                      <td style={{ fontWeight: 'bold' }}>{ticket.clientName}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>{ticket.description}</div>
                      </td>
                      <td>
                        <span className={`badge ${ticket.priority === 'High' ? 'badge-danger' : ticket.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}><strong>{ticket.assignedOperator}</strong></td>
                      <td>
                        <span className={`badge ${ticket.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => updateTicketStatus(ticket.id, 'In Progress')} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', cursor: 'pointer' }}
                            disabled={ticket.status === 'Resolved'}
                          >
                            In Progress
                          </button>
                          <button 
                            onClick={() => updateTicketStatus(ticket.id, 'Resolved')} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                            disabled={ticket.status === 'Resolved'}
                          >
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                        No support tickets match the selected filter query criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          ))}

          {/* TAB 5: SUPPORT STAFF CRUD */}
          {activeTab === 'staff' && renderPermissionGuard('configure_staff', (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
              
              {/* Left Column: Staff Directory */}
              <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={18} /> <span>VaidyaQ Employee Directory</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>List of authorized company accounts capable of database status overrides and support assignments.</p>

                <table className="table" style={{ marginTop: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th>Operator Name</th>
                      <th>System Credentials</th>
                      <th>Access Role</th>
                      <th>Permission Classes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Super Admin hardcoded row */}
                    <tr>
                      <td><strong>Super Admin</strong></td>
                      <td><code>{vendorAdminCredentials.username}</code> / <code>••••</code></td>
                      <td><span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Super Administrator</span></td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                          {['view_crm', 'manage_finance', 'resolve_tickets', 'configure_staff'].map(p => (
                            <code key={p} style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', padding: '0.1rem 0.2rem', borderRadius: '3px' }}>{p}</code>
                          ))}
                        </div>
                      </td>
                      <td><span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>System Owned</span></td>
                    </tr>

                    {/* Employee database rows */}
                    {vendorEmployees.map(emp => (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong><br /><span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{emp.email}</span></td>
                        <td><code>{emp.username}</code> / <code>{emp.password}</code></td>
                        <td><span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{emp.role}</span></td>
                        <td style={{ maxWidth: '200px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                            {emp.permissions.map(p => (
                              <code key={p} style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', padding: '0.1rem 0.2rem', borderRadius: '3px' }}>{p}</code>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="btn" style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Column: Register Form */}
              <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserPlus size={18} /> <span>Register Office Account</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Create restricted operator profiles with custom permission checks.</p>

                {empSuccess && (
                  <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                    New VaidyaQ employee registered successfully.
                  </div>
                )}

                <form onSubmit={handleRegisterEmployee} className="flex flex-col gap-3">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Full Name</label>
                    <input type="text" required className="form-control" value={empName} onChange={(e) => setEmpName(e.target.value)} style={{ padding: '0.45rem' }} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Office Email</label>
                    <input type="email" required className="form-control" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} style={{ padding: '0.45rem' }} />
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Login Username</label>
                      <input type="text" required className="form-control" value={empUsername} onChange={(e) => setEmpUsername(e.target.value)} style={{ padding: '0.45rem' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Login Password</label>
                      <input type="text" required className="form-control" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} style={{ padding: '0.45rem' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Corporate Role Title</label>
                    <select 
                      className="form-control" 
                      value={empRole} 
                      onChange={(e) => setEmpRole(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <option value="Support Agent">Support Agent (Troubleshoot client errors)</option>
                      <option value="Billing Manager">Billing Manager (Trigger plan pricing hooks)</option>
                      <option value="Platform Administrator">Platform Administrator (Full system access)</option>
                    </select>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Assign Security Clearances</label>
                    <div className="flex flex-col gap-1" style={{ fontSize: '0.8rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={empPermissions.includes('view_crm')} onChange={() => togglePermissionSelection('view_crm')} />
                        <span><code>view_crm</code> (CRM Explorer, export CSV, emails)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={empPermissions.includes('manage_finance')} onChange={() => togglePermissionSelection('manage_finance')} />
                        <span><code>manage_finance</code> (Billing collections, customize invoices)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={empPermissions.includes('resolve_tickets')} onChange={() => togglePermissionSelection('resolve_tickets')} />
                        <span><code>resolve_tickets</code> (Assign/Close troubleshooting tickets)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={empPermissions.includes('configure_staff')} onChange={() => togglePermissionSelection('configure_staff')} />
                        <span><code>configure_staff</code> (CRUD employee operators)</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', marginTop: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>
                    Register Employee Account
                  </button>
                </form>
              </div>

            </div>
          ))}

          {/* TAB 6: EMAIL SIMULATOR LOGS */}
          {activeTab === 'emails' && renderPermissionGuard('view_crm', (
            <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                <Mail size={18} /> <span>Email Transaction Notification Logs</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Transactional notifications sent automatically to hospital administrators. Represents local copies archived under the <code>qn_vendor_emails</code> folder.
              </p>

              {/* Email search and filters */}
              <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search emails by recipient address or keyword..." 
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                />

                <select 
                  className="form-control"
                  value={emailCategoryFilter}
                  onChange={(e) => setEmailCategoryFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <option value="All">All Notifications</option>
                  <option value="Signup">Welcome / Signups</option>
                  <option value="Payment">Payments & GST Bills</option>
                  <option value="Ticket">Troubleshooting Support</option>
                  <option value="Download">Vault Security Alerts</option>
                </select>
              </div>

              {/* Table registry */}
              <table className="table" style={{ marginTop: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Recipient</th>
                    <th>Email Subject</th>
                    <th>Simulated Output Body</th>
                    <th>Notification Class</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map(mail => (
                    <tr key={mail.id}>
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{mail.sentAt}</td>
                      <td><strong>{mail.recipient}</strong></td>
                      <td><span style={{ fontWeight: 600 }}>{mail.subject}</span></td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {mail.body}
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: mail.category === 'Payment' ? 'var(--bg-success)' : mail.category === 'Signup' ? 'var(--primary-light)' : 'var(--bg-danger)',
                          color: mail.category === 'Payment' ? 'var(--color-success)' : mail.category === 'Signup' ? 'var(--primary)' : 'var(--color-danger)',
                          fontSize: '0.65rem'
                        }}>
                          {mail.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredEmails.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                        No transactional notifications recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          ))}

          {/* TAB 7: GEMINI AI CHAT CO-PILOT */}
          {activeTab === 'copilot' && (
            <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              
              {/* Gemini Chat Header */}
              <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} color="var(--primary)" /> <span>VaidyaQ AI Operations Co-pilot</span>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Query client databases, check ticket queues, and forecast sales trends using Google Gemini.</p>
                </div>
                
                {/* Gemini key setup form inline */}
                <form onSubmit={handleSaveApiKey} className="flex align-center gap-1">
                  <input 
                    type="password" 
                    placeholder="Enter Google Gemini API Key" 
                    className="form-control"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', width: '220px' }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '6px' }}>
                    Save Token
                  </button>
                </form>
              </div>

              {apiKeySuccess && (
                <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                  Gemini API Token saved to local storage. Live connections enabled.
                </div>
              )}

              {/* Chat Viewport */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                
                {/* Chat responses container */}
                <div style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--border-color)', overflowY: 'auto', maxHeight: '380px' }}>
                  {aiResponse ? (
                    <div style={{ lineHeight: '1.6', fontSize: '0.85rem' }} className="markdown-body">
                      {/* Standard render for response text */}
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {aiResponse}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-tertiary)' }}>
                      <MessageSquare size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '0.5rem' }} />
                      <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Co-pilot Standby</h4>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', maxWidth: '400px', margin: '0.25rem auto 0 auto' }}>
                        Ask questions like: "Analyze database storage usage by client" or "Summarize active support tickets priority".
                      </p>
                    </div>
                  )}
                  {aiLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem', marginTop: '1rem' }}>
                      <RefreshCw size={14} className="animate-spin" /> <span>Consulting Google Gemini models...</span>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleQueryCopilot} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ask Co-pilot..." 
                    className="form-control"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    style={{ flex: 1, padding: '0.7rem' }}
                    disabled={aiLoading}
                  />
                  <button type="submit" className="btn btn-primary flex align-center gap-1" style={{ padding: '0.7rem 1.25rem', cursor: 'pointer', fontWeight: 700 }} disabled={aiLoading}>
                    <Send size={14} /> <span>Query</span>
                  </button>
                </form>

              </div>

            </div>
          )}

          {/* TAB 8: CONSOLE SETTINGS */}
          {activeTab === 'settings' && renderPermissionGuard('configure_staff', (
            <div className="card flex flex-col gap-3" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                <Settings size={18} /> <span>Update Vendor Admin Credentials</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Change the Super Admin username and password used to unlock this secure Vendor Console.</p>

              {credSuccess && (
                <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-success)', fontSize: '0.8rem' }}>
                  Super Admin credentials updated successfully in context vault.
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="flex flex-col gap-3" style={{ maxWidth: '500px', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Office Username</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Office Password</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '1rem', cursor: 'pointer', fontWeight: 700 }}>
                  Apply Credentials
                </button>
              </form>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
