import React, { useContext, useState, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import { isConfigured, configError } from '../firebase';
import { 
  ShieldCheck, Lock, Activity, Users, Settings, UserPlus, 
  RefreshCw, Play, CircleAlert, CheckCircle, Database,
  ArrowLeft, Folder, FolderOpen, FileText, Download, Trash, 
  Plus, ShieldAlert, Sparkles, Send, Coins, FileCheck, HelpCircle,
  TrendingUp, HardDrive, Calendar, CreditCard, ChevronRight, ChevronDown, LogOut,
  Sliders, Printer, Mail, MessageSquare, Briefcase, Eye, EyeOff,
  TrendingDown, Trash2, Filter
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
    setCurrentRoute,
    onboardingSteps,
    hospitalName
  } = useContext(QualiNABHContext);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);

  // Active Workspace Tab: 'dashboard', 'crm', 'finance', 'tickets', 'staff', 'emails', 'copilot', 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Chart Type State
  const [chartType, setChartType] = useState('line');

  // Client Explorer State
  const [clientSearch, setClientSearch] = useState('');
  const [selectedCrmClient, setSelectedCrmClient] = useState(null);
  const [dossierSubTab, setDossierSubTab] = useState('metadata'); // 'metadata', 'vault', 'tickets', 'payments', 'logs'
  
  // --- CLIENT DATABASE MANAGEMENT CENTER STATES ---
  const [crmTab, setCrmTab] = useState('list'); // 'list', 'analytics', 'add-client', 'newsletter'
  
  // Register Client Form States
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newClientBeds, setNewClientBeds] = useState(50);
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientGovId, setNewClientGovId] = useState('');
  const [newClientGovIdType, setNewClientGovIdType] = useState('GSTIN');
  const [newClientSuccess, setNewClientSuccess] = useState(false);

  // Newsletter Designer & Scheduler States
  const [newsletterSubject, setNewsletterSubject] = useState('VaidyaQ Bulletin - Operations Update');
  const [newsletterBody, setNewsletterBody] = useState('Hello {{hospitalName}},\n\nWe have exciting new accreditation tools available under your VaidyaQ secure vault panel!\n\nBest Regards,\nOperations Team');
  const [newsletterHeaderLogo, setNewsletterHeaderLogo] = useState('VaidyaQ');
  const [newsletterFooter, setNewsletterFooter] = useState('VaidyaQ Systems • DLF Cyber City, Phase 3, Gurugram');
  const [newsletterTheme, setNewsletterTheme] = useState('emerald'); // 'emerald', 'ocean', 'navy'
  const [newsletterSegment, setNewsletterSegment] = useState('all'); // 'all', 'trial', 'paid', 'expired'
  const [newsletterSendTimeMode, setNewsletterSendTimeMode] = useState('now'); // 'now', 'scheduled'
  const [newsletterScheduleDate, setNewsletterScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState(false);
  const [newsletterFeedbackMessage, setNewsletterFeedbackMessage] = useState('');
  
  // Scheduled Newsletters Ledger
  const [scheduledNewsletters, setScheduledNewsletters] = useState(() => {
    const saved = localStorage.getItem('qn_scheduled_newsletters');
    return saved ? JSON.parse(saved) : [
      { id: 'sch-1', subject: 'Monthly NABH Checklist Revision', segment: 'paid', scheduledAt: '2026-07-01T10:00', logoText: 'VaidyaQ', theme: 'navy' }
    ];
  });
  
  // Client Form Details Override States
  const [crmAddress, setCrmAddress] = useState('');
  const [crmBeds, setCrmBeds] = useState(0);
  const [crmRegId, setCrmRegId] = useState('');
  const [crmGovId, setCrmGovId] = useState('');
  const [crmGovIdType, setCrmGovIdType] = useState('GSTIN');
  const [crmGovIdStatus, setCrmGovIdStatus] = useState('Pending');
  const [crmSaveSuccess, setCrmSaveSuccess] = useState(false);

  // Tickets Desk States
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilterPriority, setTicketFilterPriority] = useState('All');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null); // Expand ticket to its own page state
  const [ticketStatusInput, setTicketStatusInput] = useState('Open');
  const [ticketAssigneeInput, setTicketAssigneeInput] = useState('Aarav Sharma');
  const [ticketResolutionNotes, setTicketResolutionNotes] = useState('');
  const [ticketSaveSuccess, setTicketSaveSuccess] = useState(false);

  // --- FINANCE MODULE EXTENDED STATES ---
  const [financeTimeScale, setFinanceTimeScale] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [statusFilters, setStatusFilters] = useState({
    Paid: true,
    Pending: true,
    'Awaiting Payment': true,
    Expired: true,
    Cancelled: true,
    'Under Trial': true
  });

  const [googleMailConnected, setGoogleMailConnected] = useState(() => {
    return localStorage.getItem('qn_finance_google_connected') === 'true';
  });
  const [googleMailAccount, setGoogleMailAccount] = useState(() => {
    return localStorage.getItem('qn_finance_google_account') || 'finance@vaidyaq.com';
  });
  const [showGoogleOAuthModal, setShowGoogleOAuthModal] = useState(false);
  const [focusedClientId, setFocusedClientId] = useState('all');

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('qn_vendor_expenses_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'exp-1', clientId: 'demo-hosp', clientName: 'City Central Metro Hospital', category: 'API Credits', amount: 8500, date: '2026-06-01', description: 'AI SOP generation API tokens usage.' },
      { id: 'exp-2', clientId: 'demo-hosp', clientName: 'City Central Metro Hospital', category: 'Server/Cloud', amount: 12000, date: '2026-06-05', description: 'AWS secure storage allocation.' }
    ];
  });

  // Expense logging form states
  const [expenseClientId, setExpenseClientId] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('API Credits');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseSuccess, setExpenseSuccess] = useState(false);

  // Invoice mailing simulation overlay
  const [invoiceMailedSuccess, setInvoiceMailedSuccess] = useState(false);
  const [mailFeedbackMessage, setMailFeedbackMessage] = useState('');

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

  // Sync expenses and Google connection to localstorage
  useEffect(() => {
    localStorage.setItem('qn_vendor_expenses_logs', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('qn_finance_google_connected', googleMailConnected ? 'true' : 'false');
    localStorage.setItem('qn_finance_google_account', googleMailAccount);
  }, [googleMailConnected, googleMailAccount]);

  useEffect(() => {
    localStorage.setItem('qn_scheduled_newsletters', JSON.stringify(scheduledNewsletters));
  }, [scheduledNewsletters]);

  // Prepopulate first client for Finance Invoice builder & expense on load
  useEffect(() => {
    if (clientsList.length > 0) {
      if (!financeSelectedClient) {
        setFinanceSelectedClient(clientsList[0].hospitalId);
      }
      if (!expenseClientId) {
        setExpenseClientId(clientsList[0].hospitalId);
      }
    }
  }, [clientsList, financeSelectedClient, expenseClientId]);

  // Sync internal gemini key input state if parent changes
  useEffect(() => {
    setApiKeyInput(vendorGeminiKey);
  }, [vendorGeminiKey]);

  // Prepopulate ticket inputs when a ticket is loaded into its own page
  useEffect(() => {
    if (selectedTicket) {
      const ticket = supportTickets.find(t => t.id === selectedTicket);
      if (ticket) {
        setTicketStatusInput(ticket.status);
        setTicketAssigneeInput(ticket.assignedOperator);
        setTicketResolutionNotes('');
        setTicketSaveSuccess(false);
      }
    }
  }, [selectedTicket, supportTickets]);

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

  // Onboarding Progress Mock/Calculation Helper
  const getClientOnboardingProgress = (client) => {
    if (client.hospitalName === hospitalName) {
      return onboardingSteps;
    }
    if (client.bounced) {
      return { identity: false, departments: false, importTemplates: false, firstSop: false };
    }
    if (client.status === 'Paid') {
      return { identity: true, departments: true, importTemplates: true, firstSop: true };
    }
    return { identity: true, departments: true, importTemplates: false, firstSop: false };
  };

  const getCompletedStepsCount = (steps) => {
    return Object.values(steps).filter(Boolean).length;
  };

  // Navigation from Dashboard summary row to specific CRM folder
  const handleViewFolder = (hospId) => {
    const client = clientsList.find(c => c.hospitalId === hospId);
    if (client) {
      loadCrmClient(client);
      setActiveTab('crm');
    }
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
    setDossierSubTab('metadata');
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

  // CRM - Add a new Client from Office end (mimicking signup fields)
  const handleOfficeAddClient = (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;

    const newHospitalId = `hosp-${Date.now()}`;
    const signup = new Date().toISOString();
    const expiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();

    const newClient = {
      hospitalId: newHospitalId,
      hospitalName: newClientName,
      email: newClientEmail,
      beds: Number(newClientBeds),
      trialStartDate: signup,
      signupDate: signup,
      planExpiryDate: expiry.slice(0, 10),
      isSubscribed: false,
      status: "Active Trial",
      address: newClientAddress || "Address pending...",
      regId: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      govId: newClientGovId || "PENDING_INPUT",
      govIdType: newClientGovIdType,
      govIdStatus: "Pending",
      storageUsed: 1048576,
      bounced: false
    };

    setClientsList(prev => [newClient, ...prev]);

    // Send Welcome newsletter simulated dispatch
    sendSimulatedEmail(
      newClientEmail,
      `Welcome to VaidyaQ - Sandbox Admin Registered`,
      `Hello ${newClientName},\n\nYour institution has been officially registered in the VaidyaQ accreditation directory by our office administrators. Your 7-day trial starts today.\n\nBest Regards,\nOffice Dispatch Desk`,
      "Signup"
    );

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPassword('');
    setNewClientBeds(50);
    setNewClientAddress('');
    setNewClientGovId('');
    setNewClientSuccess(true);
    setTimeout(() => setNewClientSuccess(false), 3000);
  };

  // CRM - Delete client account
  const handleOfficeDeleteClient = (hospId) => {
    if (window.confirm("Are you sure you want to permanently delete this client account from the VaidyaQ CRM database? This will wipe their directory vaults, support queues, and logs from our console views.")) {
      setClientsList(prev => prev.filter(c => c.hospitalId !== hospId));
      if (selectedCrmClient === hospId) {
        setSelectedCrmClient(null);
      }
    }
  };

  // CRM - Print Crm Registry Database Table
  const handlePrintCrmDatabase = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let tableRows = "";
    clientsList.forEach(c => {
      tableRows += `
        <tr>
          <td>${c.hospitalName}</td>
          <td><code>${c.hospitalId}</code></td>
          <td>${c.email}</td>
          <td>${c.beds} Beds</td>
          <td>${c.signupDate || c.trialStartDate || 'N/A'}</td>
          <td>${c.planExpiryDate || 'N/A'}</td>
          <td>${c.status}</td>
          <td>${c.govIdType}: ${c.govId} (${c.govIdStatus})</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>VaidyaQ CRM Client Registry Database</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h2 { border-bottom: 2px solid #1a73e8; padding-bottom: 8px; color: #1a73e8; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 0.8rem; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>VaidyaQ Client Registry Database (${clientsList.length} Active Records)</h2>
          <p>Export generated on ${new Date().toLocaleString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Hospital ID</th>
                <th>Owner Email</th>
                <th>Beds</th>
                <th>Signup Date</th>
                <th>Plan Expiry</th>
                <th>Status</th>
                <th>Gov Verification</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // CRM - Send Customizable Newsletter Broadcast
  const handleSendNewsletter = (e) => {
    if (e) e.preventDefault();

    if (!googleMailConnected) {
      setNewsletterFeedbackMessage("Error: Google Workspace account connection is required to broadcast newsletter campaigns. Please authorize mail connection first.");
      setNewsletterError(true);
      setTimeout(() => setNewsletterError(false), 4000);
      return;
    }

    // Filter recipients based on segment selector
    const targets = clientsList.filter(c => {
      const billingStatus = resolveClientBillingStatus(c);
      if (newsletterSegment === 'all') return true;
      if (newsletterSegment === 'trial') return billingStatus === 'Under Trial';
      if (newsletterSegment === 'paid') return billingStatus === 'Paid';
      if (newsletterSegment === 'expired') return billingStatus === 'Expired' || billingStatus === 'Cancelled';
      return true;
    });

    if (targets.length === 0) {
      setNewsletterFeedbackMessage("No client accounts match the selected segment filter.");
      setNewsletterError(true);
      setTimeout(() => setNewsletterError(false), 3000);
      return;
    }

    // Loop and simulate dispatching
    targets.forEach(client => {
      // dynamic token replacements
      let bodyText = newsletterBody
        .replace(/\{\{hospitalName\}\}/g, client.hospitalName)
        .replace(/\{\{email\}\}/g, client.email)
        .replace(/\{\{beds\}\}/g, String(client.beds));

      sendSimulatedEmail(
        client.email,
        newsletterSubject,
        `[Newsletter Campaign: ${newsletterHeaderLogo}]\n\n${bodyText}\n\n---\n${newsletterFooter}\n[Broadcast via Google Workspace: ${googleMailAccount}]`,
        "Newsletter"
      );
    });

    setNewsletterFeedbackMessage(`Newsletter broadcast sent successfully via Google Workspace to ${targets.length} subscriber mailboxes!`);
    setNewsletterSuccess(true);
    setTimeout(() => setNewsletterSuccess(false), 4000);
  };

  // CRM - Schedule Customizable Newsletter Campaign
  const handleScheduleNewsletter = (e) => {
    e.preventDefault();

    if (!googleMailConnected) {
      setNewsletterFeedbackMessage("Error: Google Workspace account connection is required to schedule newsletter campaigns.");
      setNewsletterError(true);
      setTimeout(() => setNewsletterError(false), 4000);
      return;
    }

    const newSchedule = {
      id: `sch-${Date.now()}`,
      subject: newsletterSubject,
      body: newsletterBody,
      segment: newsletterSegment,
      scheduledAt: newsletterScheduleDate,
      logoText: newsletterHeaderLogo,
      footerText: newsletterFooter,
      theme: newsletterTheme
    };

    setScheduledNewsletters(prev => [newSchedule, ...prev]);
    setNewsletterFeedbackMessage(`Newsletter campaign scheduled successfully for ${new Date(newsletterScheduleDate).toLocaleString('en-IN')}`);
    setNewsletterSuccess(true);
    setTimeout(() => setNewsletterSuccess(false), 3000);
  };

  // CRM - Cancel Scheduled Newsletter
  const handleCancelScheduledNewsletter = (schId) => {
    setScheduledNewsletters(prev => prev.filter(sch => sch.id !== schId));
  };

  // CRM - Print Expanded Client Dossier (PDF compilation)
  const handlePrintClientDossier = (client) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Filter payments & support cases for print layout
    const clientPayments = transactions.filter(t => t.hospitalName === client.hospitalName);
    const clientTickets = supportTickets.filter(t => t.clientName === client.hospitalName);
    const clientAudits = auditLogs.filter(log => log.user === client.email || log.action.includes(client.hospitalName));

    let paymentRows = "";
    clientPayments.forEach(p => {
      paymentRows += `
        <tr>
          <td>${p.date}</td>
          <td>₹${p.amount.toLocaleString()}</td>
          <td>₹${p.gst.toLocaleString()}</td>
          <td>₹${(p.amount + p.gst).toLocaleString()}</td>
          <td>${p.status}</td>
        </tr>
      `;
    });
    if (clientPayments.length === 0) {
      paymentRows = `<tr><td colspan="5" class="text-muted">No subscription payments logged.</td></tr>`;
    }

    let ticketRows = "";
    clientTickets.forEach(t => {
      ticketRows += `
        <tr>
          <td><code>${t.sequenceCode}</code></td>
          <td>${t.title}</td>
          <td>${t.priority}</td>
          <td>${t.status}</td>
          <td>${t.assignedOperator}</td>
        </tr>
      `;
    });
    if (clientTickets.length === 0) {
      ticketRows = `<tr><td colspan="5" class="text-muted">No troubleshoot routing cases logged.</td></tr>`;
    }

    let auditRows = "";
    clientAudits.forEach(a => {
      auditRows += `
        <tr>
          <td>${a.timestamp}</td>
          <td>${a.action}</td>
          <td>${a.user} (${a.role})</td>
        </tr>
      `;
    });
    if (clientAudits.length === 0) {
      auditRows = `<tr><td colspan="3" class="text-muted">No security audit activity logged.</td></tr>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${client.hospitalName} - Dossier Report</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; line-height: 1.4; }
            .header { border-bottom: 3px double #1a73e8; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 1.8rem; font-weight: 800; color: #1a73e8; margin: 0; }
            .subtitle { font-size: 0.85rem; color: #666; margin-top: 4px; }
            .section { margin-top: 25px; }
            h3 { font-size: 1.1rem; border-bottom: 1px solid #ccc; padding-bottom: 4px; color: #1a73e8; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 0.75rem; text-align: left; }
            th { background-color: #f9f9f9; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .meta-item { font-size: 0.8rem; margin: 4px 0; }
            .text-muted { text-align: center; color: #888; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🏢 ${client.hospitalName} Dossier Report</div>
            <div class="subtitle">System Generated Report • Exported on ${new Date().toLocaleString('en-IN')}</div>
          </div>

          <div class="grid">
            <div class="section">
              <h3>Account Credentials Details</h3>
              <div class="meta-item"><strong>Hospital ID:</strong> <code>${client.hospitalId}</code></div>
              <div class="meta-item"><strong>Admin Owner Email:</strong> ${client.email}</div>
              <div class="meta-item"><strong>Bed Size Category:</strong> ${client.beds} Beds</div>
              <div class="meta-item"><strong>Signup Onboarding Date:</strong> ${client.signupDate || client.trialStartDate || 'N/A'}</div>
              <div class="meta-item"><strong>Plan Expiry Date:</strong> ${client.planExpiryDate || 'N/A'}</div>
            </div>

            <div class="section">
              <h3>Accreditation & Registry Parameters</h3>
              <div class="meta-item"><strong>Corporate Address:</strong> ${client.address || 'India'}</div>
              <div class="meta-item"><strong>Accreditation Registry ID:</strong> ${client.regId || 'PENDING'}</div>
              <div class="meta-item"><strong>Govt Verification:</strong> ${client.govIdType} - ${client.govId} (${client.govIdStatus})</div>
              <div class="meta-item"><strong>Disk storage quota used:</strong> ${(client.storageUsed / (1024 * 1024)).toFixed(2)} MB of 50.00 MB</div>
              <div class="meta-item"><strong>Subscription Status:</strong> ${client.status}</div>
            </div>
          </div>

          <div class="section">
            <h3>💳 Transaction Invoicing Records</h3>
            <table>
              <thead>
                <tr>
                  <th>Billing Date</th>
                  <th>Base Amount</th>
                  <th>GST Tax (18%)</th>
                  <th>Total Due</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                ${paymentRows}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>🎟️ Support Case history logs</h3>
            <table>
              <thead>
                <tr>
                  <th>Case Code</th>
                  <th>Case Summary</th>
                  <th>Priority</th>
                  <th>Resolution Status</th>
                  <th>Assigned Agent</th>
                </tr>
              </thead>
              <tbody>
                ${ticketRows}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>🛡️ Security Activity logs</h3>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Security Action Description</th>
                  <th>Trigger Operator</th>
                </tr>
              </thead>
              <tbody>
                ${auditRows}
              </tbody>
            </table>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // CRM - Download Client Dossier as Excel (CSV format)
  const handleDownloadClientDossierExcel = (client) => {
    const clientPayments = transactions.filter(t => t.hospitalName === client.hospitalName);
    const clientTickets = supportTickets.filter(t => t.clientName === client.hospitalName);
    
    let csvString = "";
    
    csvString += "=== CLIENT ACCOUNT PROFILE ===\n";
    csvString += `Hospital Name,${client.hospitalName}\n`;
    csvString += `Hospital ID,${client.hospitalId}\n`;
    csvString += `Owner Email,${client.email}\n`;
    csvString += `Beds Capacity,${client.beds}\n`;
    csvString += `Address,"${(client.address || '').replace(/"/g, '""')}"\n`;
    csvString += `Registry ID,${client.regId || 'N/A'}\n`;
    csvString += `Gov verification,${client.govIdType}: ${client.govId} (${client.govIdStatus})\n`;
    csvString += `Signup Date,${client.signupDate || client.trialStartDate}\n`;
    csvString += `Plan Expiry Date,${client.planExpiryDate}\n`;
    csvString += `Storage Used (MB),${(client.storageUsed / (1024 * 1024)).toFixed(2)}\n`;
    csvString += `Status,${client.status}\n\n`;
    
    csvString += "=== TRANSACTION INVOICES LEDGER ===\n";
    csvString += "Billing Date,Base Amount,GST (18%),Total Paid,Status\n";
    clientPayments.forEach(p => {
      csvString += `${p.date},${p.amount},${p.gst},${p.amount + p.gst},${p.status}\n`;
    });
    if (clientPayments.length === 0) csvString += "No transactions logged\n";
    csvString += "\n";
    
    csvString += "=== TROUBLESHOOT ROUTING CASES ===\n";
    csvString += "Case Code,Title,Priority,Status,Assigned Agent\n";
    clientTickets.forEach(t => {
      csvString += `${t.sequenceCode},"${t.title.replace(/"/g, '""')}",${t.priority},${t.status},${t.assignedOperator}\n`;
    });
    if (clientTickets.length === 0) csvString += "No cases logged\n";

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VQ_Dossier_${client.hospitalName.replace(/\s+/g, '_')}.csv`);
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

  // Resolve client billing status string mapping
  const resolveClientBillingStatus = (client) => {
    return client.billingStatus || (client.status === 'Paid' ? 'Paid' : client.status === 'Expired' ? 'Expired' : client.status === 'Restricted' ? 'Cancelled' : 'Under Trial');
  };

  // Update billing status and sync transactional entry
  const handleUpdateBillingStatus = (hospId, newBillingStatus) => {
    setClientsList(prev => prev.map(c => {
      if (c.hospitalId === hospId) {
        let updatedStatus = c.status;
        if (newBillingStatus === 'Paid') {
          updatedStatus = 'Paid';
          
          // Inject a successful payment transaction log dynamically if missing
          const transactionExists = transactions.some(
            t => (t.clientId === c.email || t.hospitalName === c.hospitalName) && t.status === 'Successful'
          );

          if (!transactionExists) {
            const priceAmount = c.beds <= 20 ? 55999 : c.beds <= 150 ? 129999 : 249999;
            const gstVal = Math.round(priceAmount * 0.18 * 100) / 100;
            const newTrans = {
              id: `trans-${Date.now()}`,
              clientId: c.email,
              hospitalName: c.hospitalName,
              amount: priceAmount,
              gst: gstVal,
              date: new Date().toISOString().slice(0, 10),
              status: "Successful",
              billingCycle: "H1 2026"
            };
            setTransactions(prevT => [newTrans, ...prevT]);
            
            // Log outgoing transactional invoice email duplicate
            sendSimulatedEmail(
              c.email,
              `VaidyaQ Payment Receipt - Subscription Active`,
              `Hello! Your subscription plan for ${c.hospitalName} has been marked as PAID. Base amount: ₹${priceAmount.toLocaleString()} + ₹${gstVal.toLocaleString()} GST. Subscription term is active.`,
              "Payment"
            );
          }
        } else if (newBillingStatus === 'Expired') {
          updatedStatus = 'Expired';
        } else if (newBillingStatus === 'Cancelled') {
          updatedStatus = 'Restricted';
        } else if (newBillingStatus === 'Under Trial') {
          updatedStatus = 'Active Trial';
        }

        return { ...c, billingStatus: newBillingStatus, status: updatedStatus };
      }
      return c;
    }));
  };

  // Toggle dynamic status filters
  const handleToggleStatusFilter = (statusKey) => {
    setStatusFilters(prev => ({
      ...prev,
      [statusKey]: !prev[statusKey]
    }));
  };

  // Add Vaidya Expense per Client Form Submission
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;

    const matchedClient = clientsList.find(c => c.hospitalId === expenseClientId);
    const newExpense = {
      id: `exp-${Date.now()}`,
      clientId: expenseClientId,
      clientName: matchedClient?.hospitalName || 'Unknown Hospital',
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      description: expenseDescription
    };

    setExpenses(prev => [newExpense, ...prev]);
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseSuccess(true);
    setTimeout(() => setExpenseSuccess(false), 3000);
  };

  // Delete expense log entry
  const handleDeleteExpense = (expId) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expId));
  };

  // Send Custom Invoice via connected Google Account Simulator
  const handleSendEmailInvoice = (client) => {
    if (!client) return;

    if (!googleMailConnected) {
      setMailFeedbackMessage(`Error: Google Workspace connection required. Please connect your Google Account in the billing panel first.`);
      setInvoiceMailedSuccess(true);
      setTimeout(() => setInvoiceMailedSuccess(false), 4000);
      return;
    }

    const beds = client.beds || 0;
    const baseFee = beds <= 20 ? 55999 : beds <= 150 ? 129999 : 249999;
    const gstTotal = Math.round(baseFee * 0.18 * 100) / 100;
    const invoiceTotal = baseFee + gstTotal;

    // Simulate sending email through VaidyaQ Gmail Workspace integration
    sendSimulatedEmail(
      client.email,
      `VQ-2026-0041: VaidyaQ Tax Invoice for ${client.hospitalName}`,
      `Hello Admin,\n\nPlease find attached the tax invoice for your digital accreditation subscription.\n\nSUMMARY:\n- Client: ${client.hospitalName}\n- Beds: ${beds} Beds\n- Base Annual Plan: ₹${baseFee.toLocaleString()}\n- GST Compliance (18%): ₹${gstTotal.toLocaleString()}\n- Total Amount Due: ₹${invoiceTotal.toLocaleString()}\n\nPayment terms: ${invoiceTerms}.\n\nBest Regards,\nBilling Operations Team\n${invoiceCompanyName}\n\n[Authorized via Google Mail API: ${googleMailAccount}]`,
      "Payment"
    );

    // Set flag in clients list that the bill has been sent
    setClientsList(prev => prev.map(c => {
      if (c.hospitalId === client.hospitalId) {
        return { ...c, billSent: true, billingStatus: c.billingStatus === 'Under Trial' ? 'Pending' : c.billingStatus };
      }
      return c;
    }));

    setMailFeedbackMessage(`Invoice successfully compiled and sent via Google mail servers (${googleMailAccount}) to: ${client.email}`);
    setInvoiceMailedSuccess(true);
    setTimeout(() => setInvoiceMailedSuccess(false), 5000);
  };

  // Download Invoice HTML template
  const handleDownloadInvoiceTemplate = (client) => {
    if (!client) return;
    const beds = client.beds || 0;
    const baseFee = beds <= 20 ? 55999 : beds <= 150 ? 129999 : 249999;
    const cgst = Math.round(baseFee * 0.09 * 100) / 100;
    const sgst = Math.round(baseFee * 0.09 * 100) / 100;
    const total = baseFee + cgst + sgst;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>VQ-2026-0041 - Tax Invoice</title>
          <style>
            body { font-family: sans-serif; color: #333; line-height: 1.4; padding: 20px; }
            .box { border: 1px solid #ccc; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; }
            th { background-color: #f7f7f7; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>${invoiceCompanyName}</h2>
            <p>Address: ${invoiceAddress}</p>
            <p>GSTIN: ${invoiceGst}</p>
            <hr />
            <h3>TAX INVOICE</h3>
            <p><strong>Billed To:</strong> ${client.hospitalName}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Accreditation Beds:</strong> ${beds} Beds</p>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Base Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>VaidyaQ Digital SaaS Subscription (1 Year)</td>
                  <td class="text-right">₹${baseFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>CGST (9%)</td>
                  <td class="text-right">₹${cgst.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>SGST (9%)</td>
                  <td class="text-right">₹${sgst.toLocaleString()}</td>
                </tr>
                <tr style="font-weight: bold;">
                  <td>Total (INR)</td>
                  <td class="text-right">₹${total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VQ_Invoice_${client.hospitalName.replace(/\s+/g, '_')}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Support Tickets - Expand & Save Action station
  const handleSaveTicketDetails = (e) => {
    e.preventDefault();
    setSupportTickets(prev => prev.map(t => {
      if (t.id === selectedTicket) {
        const updated = {
          ...t,
          status: ticketStatusInput,
          assignedOperator: ticketAssigneeInput
        };

        // If resolution notes are submitted
        if (ticketResolutionNotes.trim()) {
          updated.description = `${t.description}\n\n[Resolution Notes by ${currentOperator.name} (${new Date().toLocaleDateString()}): ${ticketResolutionNotes}]`;
        }

        // Notify via simulated email
        sendSimulatedEmail(
          "quality.head@hospital.org",
          `Troubleshooter Update - Case ${t.sequenceCode} - ${ticketStatusInput}`,
          `Hello, your troubleshoot request ${t.sequenceCode} has been updated to status: "${ticketStatusInput}". Assigned operator: ${ticketAssigneeInput}.\nNotes: ${ticketResolutionNotes || 'None'}`,
          "Ticket"
        );

        return updated;
      }
      return t;
    }));

    setTicketSaveSuccess(true);
    setTimeout(() => {
      setTicketSaveSuccess(false);
      setSelectedTicket(null); // Go back to Troubleshooter Queue list automatically after saving
    }, 1500);
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
  const storageQuotaMB = 50.0;
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

  // Target Client for Dossier detail card view
  const targetCrmClientDetails = clientsList.find(c => c.hospitalId === selectedCrmClient);

  // Target Ticket details
  const targetTicketDetails = supportTickets.find(t => t.id === selectedTicket);

  // --- DYNAMIC FINANCIAL CALCULATIONS AND CHART AGGREGATION ---
  const activeFilters = Object.keys(statusFilters).filter(k => statusFilters[k]);

  // Aggregate dynamic Revenue based on selected status filters
  const getDynamicFinancials = () => {
    let revenueSum = 0;
    let baseGstSum = 0;

    // Aggregate paid transaction records
    transactions.forEach(t => {
      const client = clientsList.find(c => c.hospitalName === t.hospitalName || c.email === t.clientId);
      const bStatus = client ? resolveClientBillingStatus(client) : 'Paid';
      if (activeFilters.includes(bStatus)) {
        if (focusedClientId === 'all' || (client && client.hospitalId === focusedClientId)) {
          revenueSum += t.amount;
          baseGstSum += t.gst;
        }
      }
    });

    // Also factor in Pending/Awaiting payment client contract projections if selected
    clientsList.forEach(c => {
      const bStatus = resolveClientBillingStatus(c);
      if (bStatus !== 'Paid' && bStatus !== 'Under Trial' && activeFilters.includes(bStatus)) {
        if (focusedClientId === 'all' || c.hospitalId === focusedClientId) {
          // Compute base fee projection
          const amount = c.beds <= 20 ? 55999 : c.beds <= 150 ? 129999 : 249999;
          revenueSum += amount;
          baseGstSum += Math.round(amount * 0.18 * 100) / 100;
        }
      }
    });

    // Aggregate expenses matching selected client billing status filters
    let expenseSum = 0;
    expenses.forEach(e => {
      const client = clientsList.find(c => c.hospitalId === e.clientId);
      const bStatus = client ? resolveClientBillingStatus(client) : 'Under Trial';
      if (activeFilters.includes(bStatus)) {
        if (focusedClientId === 'all' || e.clientId === focusedClientId) {
          expenseSum += e.amount;
        }
      }
    });

    const profit = revenueSum - expenseSum;
    const profitMargin = revenueSum > 0 ? Math.round((profit / revenueSum) * 100) : 0;

    return {
      revenueSum,
      expenseSum,
      profit,
      profitMargin,
      baseGstSum
    };
  };

  const currentFinancials = getDynamicFinancials();

  // Aggregate monthly/quarterly/yearly values for visual SVG rendering
  const getChartCoordinates = () => {
    // Months indexes
    const monthlyRevArr = Array(12).fill(0);
    const monthlyExpArr = Array(12).fill(0);

    // Sum transactions
    transactions.forEach(t => {
      const client = clientsList.find(c => c.hospitalName === t.hospitalName || c.email === t.clientId);
      const bStatus = client ? resolveClientBillingStatus(client) : 'Paid';
      if (activeFilters.includes(bStatus)) {
        if (focusedClientId === 'all' || (client && client.hospitalId === focusedClientId)) {
          const month = new Date(t.date).getMonth();
          if (month >= 0 && month < 12) {
            monthlyRevArr[month] += t.amount;
          }
        }
      }
    });

    // Sum pending contracts (projections for June)
    clientsList.forEach(c => {
      const bStatus = resolveClientBillingStatus(c);
      if (bStatus !== 'Paid' && bStatus !== 'Under Trial' && activeFilters.includes(bStatus)) {
        if (focusedClientId === 'all' || c.hospitalId === focusedClientId) {
          monthlyRevArr[5] += c.beds <= 20 ? 55999 : c.beds <= 150 ? 129999 : 249999; // Project in June
        }
      }
    });

    // Sum expenses
    expenses.forEach(e => {
      const client = clientsList.find(c => c.hospitalId === e.clientId);
      const bStatus = client ? resolveClientBillingStatus(client) : 'Under Trial';
      if (activeFilters.includes(bStatus)) {
        if (focusedClientId === 'all' || e.clientId === focusedClientId) {
          const month = new Date(e.date).getMonth();
          if (month >= 0 && month < 12) {
            monthlyExpArr[month] += e.amount;
          }
        }
      }
    });

    if (financeTimeScale === 'monthly') {
      const rawMax = Math.max(...monthlyRevArr, ...monthlyExpArr, 10000);
      const maxVal = Math.ceil((rawMax * 1.25) / 10000) * 10000;
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        revValues: monthlyRevArr,
        expValues: monthlyExpArr,
        maxVal: maxVal
      };
    } else if (financeTimeScale === 'quarterly') {
      // Group by quarters
      const qRev = [
        monthlyRevArr[0] + monthlyRevArr[1] + monthlyRevArr[2], // Q1
        monthlyRevArr[3] + monthlyRevArr[4] + monthlyRevArr[5], // Q2
        monthlyRevArr[6] + monthlyRevArr[7] + monthlyRevArr[8], // Q3
        monthlyRevArr[9] + monthlyRevArr[10] + monthlyRevArr[11] // Q4
      ];
      const qExp = [
        monthlyExpArr[0] + monthlyExpArr[1] + monthlyExpArr[2],
        monthlyExpArr[3] + monthlyExpArr[4] + monthlyExpArr[5],
        monthlyExpArr[6] + monthlyExpArr[7] + monthlyExpArr[8],
        monthlyExpArr[9] + monthlyExpArr[10] + monthlyExpArr[11]
      ];
      const rawMax = Math.max(...qRev, ...qExp, 30000);
      const maxVal = Math.ceil((rawMax * 1.25) / 20000) * 20000;
      return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        revValues: qRev,
        expValues: qExp,
        maxVal: maxVal
      };
    } else {
      // Yearly comparison FY 2025 vs FY 2026
      const currentFYRev = monthlyRevArr.reduce((a, b) => a + b, 0);
      const currentFYExp = monthlyExpArr.reduce((a, b) => a + b, 0);
      const prevFYRev = focusedClientId === 'all' ? 3030000 : 129999;
      const prevFYExp = focusedClientId === 'all' ? 1240000 : 45000;
      const rawMax = Math.max(currentFYRev, currentFYExp, prevFYRev, prevFYExp, 50000);
      const maxVal = Math.ceil((rawMax * 1.25) / 100000) * 100000;
      return {
        labels: ['FY 2025 (Prev)', 'FY 2026 (Curr)'],
        revValues: [prevFYRev, currentFYRev],
        expValues: [prevFYExp, currentFYExp],
        maxVal: maxVal
      };
    }
  };

  const chartData = getChartCoordinates();

  const getRenewalStatusLabel = (client) => {
    if (!client.planExpiryDate) return <span style={{ color: 'var(--text-tertiary)' }}>No date set</span>;
    const expiry = new Date(client.planExpiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Expired (Renew!)</span>;
    if (diffDays <= 30) return <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Up for Renewal ({diffDays}d)</span>;
    return <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active (Expires: {client.planExpiryDate})</span>;
  };

  const renderCrmVisualCharts = () => {
    const sortedHospitals = [...clientsList].sort((a, b) => b.beds - a.beds);
    const topHospitals = sortedHospitals.slice(0, 5);
    const maxBedsVal = Math.max(...topHospitals.map(h => h.beds), 50);
    const bedsMaxRange = Math.ceil((maxBedsVal * 1.2) / 50) * 50;

    const statusCounts = {
      'Paid': 0,
      'Active Trial': 0,
      'Expired': 0,
      'Restricted': 0
    };
    clientsList.forEach(c => {
      const status = c.status === 'Active' ? 'Active Trial' : c.status;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts['Active Trial']++;
      }
    });

    const totalClientsCount = clientsList.length || 1;
    const paidPct = Math.round((statusCounts['Paid'] / totalClientsCount) * 100);
    const trialPct = Math.round((statusCounts['Active Trial'] / totalClientsCount) * 100);
    const expiredPct = Math.round((statusCounts['Expired'] / totalClientsCount) * 100);
    const restrictedPct = Math.round((statusCounts['Restricted'] / totalClientsCount) * 100);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    const colors = {
      paid: '#22c55e',
      trial: '#3b82f6',
      expired: '#ef4444',
      restricted: '#6b7280'
    };

    const segments = [
      { key: 'Paid', count: statusCounts['Paid'], pct: paidPct, color: colors.paid },
      { key: 'Active Trial', count: statusCounts['Active Trial'], pct: trialPct, color: colors.trial },
      { key: 'Expired', count: statusCounts['Expired'], pct: expiredPct, color: colors.expired },
      { key: 'Restricted', count: statusCounts['Restricted'], pct: restrictedPct, color: colors.restricted }
    ].filter(s => s.count > 0);

    let currentOffset = 0;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
        
        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
            <Activity size={14} color="var(--primary)" /> <span>Hospital Beds Size Capacity (Top 5)</span>
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {topHospitals.map((hosp, i) => {
              const pctOfMax = (hosp.beds / bedsMaxRange) * 100;
              return (
                <div key={hosp.hospitalId} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>{hosp.hospitalName}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{hosp.beds} Beds</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ 
                      width: `${pctOfMax}%`, 
                      height: '100%', 
                      backgroundColor: i === 0 ? 'var(--primary)' : i === 1 ? '#3b82f6' : i === 2 ? '#8b5cf6' : '#ec4899', 
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-out'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
            <Database size={14} color="var(--primary)" /> <span>Subscription Segment Share</span>
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth="10" />
                {segments.map((seg, idx) => {
                  const dashArray = `${(seg.pct / 100) * circumference} ${circumference}`;
                  const dashOffset = currentOffset;
                  currentOffset -= (seg.pct / 100) * circumference;
                  return (
                    <circle 
                      key={idx}
                      cx="50" 
                      cy="50" 
                      r={radius} 
                      fill="transparent" 
                      stroke={seg.color} 
                      strokeWidth="10"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                fontSize: '0.75rem', fontWeight: 'bold'
              }}>
                <div>{clientsList.length}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total</div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem' }}>
              {segments.map((seg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: seg.color, borderRadius: '2px' }}></span>
                    <span>{seg.key}</span>
                  </div>
                  <strong style={{ color: 'var(--text-secondary)' }}>{seg.count} ({seg.pct}%)</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderFinancialChart = () => {
    const { labels, revValues, expValues, maxVal } = chartData;
    const paddingLeft = 70;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;
    const width = 800;
    const height = 250;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const getX = (index) => {
      if (labels.length <= 1) return paddingLeft + chartWidth / 2;
      return paddingLeft + index * (chartWidth / (labels.length - 1));
    };

    const getY = (val) => {
      const denom = maxVal || 10000;
      return (height - paddingBottom) - (val / denom) * chartHeight;
    };

    let revPath = "";
    let expPath = "";
    let revAreaPath = "";
    let expAreaPath = "";

    if (labels.length > 0) {
      revPath = `M ${getX(0)} ${getY(revValues[0])}`;
      revAreaPath = `M ${getX(0)} ${height - paddingBottom} L ${getX(0)} ${getY(revValues[0])}`;
      for (let i = 1; i < labels.length; i++) {
        revPath += ` L ${getX(i)} ${getY(revValues[i])}`;
        revAreaPath += ` L ${getX(i)} ${getY(revValues[i])}`;
      }
      revAreaPath += ` L ${getX(labels.length - 1)} ${height - paddingBottom} Z`;

      expPath = `M ${getX(0)} ${getY(expValues[0])}`;
      expAreaPath = `M ${getX(0)} ${height - paddingBottom} L ${getX(0)} ${getY(expValues[0])}`;
      for (let i = 1; i < labels.length; i++) {
        expPath += ` L ${getX(i)} ${getY(expValues[i])}`;
        expAreaPath += ` L ${getX(i)} ${getY(expValues[i])}`;
      }
      expAreaPath += ` L ${getX(labels.length - 1)} ${height - paddingBottom} Z`;
    }

    const gridTicks = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
              <TrendingUp size={16} color="var(--primary)" />
              <span>Revenue vs Expenses Visualizer</span>
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Comparing contract revenue projections against client-specific VaidyaQ operational costs
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgb(34, 197, 94)', borderRadius: '3px' }}></span>
              <span>Revenue (INR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '2px dashed rgb(239, 68, 68)', borderRadius: '3px' }}></span>
              <span>Expenses (INR)</span>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {gridTicks.map((tick, i) => {
              const y = getY(maxVal * tick);
              return (
                <g key={i}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="var(--border-color)" 
                    strokeWidth="1" 
                    strokeDasharray={tick === 0 ? "none" : "4,4"} 
                  />
                  <text 
                    x={paddingLeft - 10} 
                    y={y + 4} 
                    textAnchor="end" 
                    fontSize="10" 
                    fill="var(--text-secondary)"
                    fontWeight="500"
                  >
                    ₹{Math.round(maxVal * tick).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {labels.length > 0 && (
              <>
                <path d={revAreaPath} fill="url(#revGrad)" />
                <path d={expAreaPath} fill="url(#expGrad)" />
              </>
            )}

            {labels.length > 0 && (
              <>
                <path 
                  d={revPath} 
                  fill="none" 
                  stroke="rgb(34, 197, 94)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path 
                  d={expPath} 
                  fill="none" 
                  stroke="rgb(239, 68, 68)" 
                  strokeWidth="2.5" 
                  strokeDasharray="4,4" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {labels.map((label, i) => {
              const rx = getX(i);
              const ry = getY(revValues[i]);
              const ex = getX(i);
              const ey = getY(expValues[i]);

              return (
                <g key={i}>
                  <line 
                    x1={rx} 
                    y1={paddingTop} 
                    x2={rx} 
                    y2={height - paddingBottom} 
                    stroke="var(--border-color)" 
                    strokeWidth="1.5" 
                    opacity="0"
                    style={{ transition: 'opacity 0.2s' }}
                    className="hover-line"
                  />
                  
                  <circle 
                    cx={rx} 
                    cy={ry} 
                    r="4.5" 
                    fill="var(--bg-secondary)" 
                    stroke="rgb(34, 197, 94)" 
                    strokeWidth="3" 
                  />
                  <circle 
                    cx={ex} 
                    cy={ey} 
                    r="4" 
                    fill="var(--bg-secondary)" 
                    stroke="rgb(239, 68, 68)" 
                    strokeWidth="2.5" 
                  />

                  <text 
                    x={rx} 
                    y={height - paddingBottom + 18} 
                    textAnchor="middle" 
                    fontSize="11" 
                    fill="var(--text-secondary)"
                    fontWeight="600"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

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
            <Activity size={16} /> <span>Dashboard</span>
          </button>

          <button 
            onClick={() => { setActiveTab('crm'); setCrmTab('list'); }} 
            className={`tab-btn ${activeTab === 'crm' ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', width: '100%',
              borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'crm' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'crm' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'crm' ? 700 : 500
            }}
          >
            <Database size={16} /> <span>Client CRM</span>
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
            onClick={() => { setActiveTab('tickets'); setSelectedTicket(null); }} 
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
          
          {/* TAB 1: OPERATIONS DASHBOARD */}
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

                <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Firebase DB Status</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', color: isConfigured ? 'var(--color-success)' : 'rgb(217, 119, 6)' }}>
                    {isConfigured ? '🟢 Active' : '🟡 Simulated'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={configError || 'Auth & Firestore online.'}>
                    {isConfigured ? 'Auth & Firestore online.' : configError || 'Keys not set.'}
                  </div>
                </div>

              </div>

              {/* CLIENT SUMMARY TABLE SECTION */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>SaaS Customer Registry Summary</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Live overview of client tenants onboarding, subscription expiry logs, and access pathways.
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Hospital Name</th>
                        <th>Owner Email</th>
                        <th>Dynamic Beds</th>
                        <th>Onboarding Steps</th>
                        <th>Subscription Status</th>
                        <th>Expiry Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsList.map(client => {
                        const steps = getClientOnboardingProgress(client);
                        const completedCount = getCompletedStepsCount(steps);
                        const progressPercent = completedCount * 25;

                        return (
                          <tr key={client.hospitalId}>
                            <td>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{client.hospitalName}</div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{client.hospitalId}</span>
                            </td>
                            <td>{client.email}</td>
                            <td>
                              <span className="badge badge-neutral" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{client.beds} Beds</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '120px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  <span>{completedCount}/4 steps</span>
                                  <span>{progressPercent}%</span>
                                </div>
                                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: completedCount === 4 ? 'var(--color-success)' : 'var(--primary)' }}></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge" style={{ 
                                backgroundColor: client.status === 'Paid' ? 'var(--bg-success)' : client.status === 'Expired' ? 'var(--bg-danger)' : 'var(--primary-light)', 
                                color: client.status === 'Paid' ? 'var(--color-success)' : client.status === 'Expired' ? 'var(--color-danger)' : 'var(--primary)',
                                fontSize: '0.75rem', fontWeight: 700
                              }}>
                                {client.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {client.planExpiryDate ? new Date(client.planExpiryDate).toLocaleDateString('en-IN') : 'N/A'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                onClick={() => handleViewFolder(client.hospitalId)}
                                className="btn btn-secondary flex align-center gap-1"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', borderRadius: '6px' }}
                              >
                                <FolderOpen size={12} /> <span>View Folder</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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

          {/* TAB 2: CLIENT CRM */}
          {activeTab === 'crm' && renderPermissionGuard('view_crm', (
            <div className="flex flex-col gap-4">
              
              {/* Dossier Detail Card View if Selected (EXPANDS TO ITS OWN FULL PAGE) */}
              {selectedCrmClient && targetCrmClientDetails ? (
                <div className="flex flex-col gap-4">
                  {/* Dossier Header and navigation */}
                  <div className="flex justify-between align-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                    <div className="flex align-center gap-2">
                      <button 
                        onClick={() => setSelectedCrmClient(null)}
                        className="btn btn-secondary flex align-center gap-1"
                        style={{ padding: '0.45rem 0.8rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.8rem' }}
                      >
                        <ArrowLeft size={14} /> <span>← Back to CRM Registry</span>
                      </button>
                      <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                          🏢 {targetCrmClientDetails.hospitalName} Dossier Folder
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Accreditation ID: <code>{targetCrmClientDetails.regId || 'PENDING'}</code>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 align-center">
                      <button 
                        onClick={() => handleDownloadClientDossierExcel(targetCrmClientDetails)}
                        className="btn btn-secondary flex align-center gap-1"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                        title="Download profile as CSV spreadsheet"
                      >
                        <Download size={14} /> <span>Export Excel</span>
                      </button>
                      
                      <button 
                        onClick={() => handlePrintClientDossier(targetCrmClientDetails)}
                        className="btn btn-secondary flex align-center gap-1"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                        title="Print profile as compilation PDF report"
                      >
                        <Printer size={14} /> <span>Export PDF</span>
                      </button>

                      <span className="badge" style={{ 
                        backgroundColor: targetCrmClientDetails.status === 'Paid' ? 'var(--bg-success)' : targetCrmClientDetails.status === 'Expired' ? 'var(--bg-danger)' : 'var(--primary-light)', 
                        color: targetCrmClientDetails.status === 'Paid' ? 'var(--color-success)' : targetCrmClientDetails.status === 'Expired' ? 'var(--color-danger)' : 'var(--primary)',
                        fontWeight: 'bold', fontSize: '0.8rem'
                      }}>
                        {targetCrmClientDetails.status}
                      </span>
                    </div>
                  </div>

                  {/* Graphical Core Widgets Row */}
                  <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
                    
                    {/* Onboarding steps tracker */}
                    <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Onboarding Steps Completion
                      </h4>
                      {(() => {
                        const progress = getClientOnboardingProgress(targetCrmClientDetails);
                        const steps = [
                          { label: 'Identity Configured', key: 'identity' },
                          { label: 'Departments Setup', key: 'departments' },
                          { label: 'Templates Loaded', key: 'importTemplates' },
                          { label: 'First SOP Approved', key: 'firstSop' }
                        ];
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {steps.map((step, idx) => {
                              const done = progress[step.key];
                              return (
                                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                  <div style={{ 
                                    width: '18px', height: '18px', borderRadius: '50%', 
                                    backgroundColor: done ? 'var(--bg-success)' : 'var(--border-color)',
                                    color: done ? 'var(--color-success)' : 'var(--text-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold'
                                  }}>
                                    {done ? '✓' : idx + 1}
                                  </div>
                                  <span style={{ color: done ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: done ? 600 : 400 }}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Override & Deletion panel */}
                    <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Direct override controls
                      </h4>
                      <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        <strong>Term Expiry:</strong> {targetCrmClientDetails.planExpiryDate ? new Date(targetCrmClientDetails.planExpiryDate).toLocaleDateString() : 'Active Trial'}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setClientStatusOverride(targetCrmClientDetails.hospitalId, 'Paid')} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '0.3rem', fontSize: '0.65rem', color: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                          >
                            Set Paid
                          </button>
                          <button 
                            onClick={() => setClientStatusOverride(targetCrmClientDetails.hospitalId, 'Expired')} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '0.3rem', fontSize: '0.65rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', cursor: 'pointer' }}
                          >
                            Set Expired
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setClientStatusOverride(targetCrmClientDetails.hospitalId, 'Restricted')} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '0.3rem', fontSize: '0.65rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                          >
                            Suspend
                          </button>
                          <button 
                            onClick={() => handleOfficeDeleteClient(targetCrmClientDetails.hospitalId)} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '0.3rem', fontSize: '0.65rem', color: 'rgb(239, 68, 68)', borderColor: 'rgba(239, 68, 68, 0.4)', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Delete Client Record"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Dossier Dossier Sub Tab Selector */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    {[
                      { id: 'metadata', label: 'Client Metadata', icon: Sliders },
                      { id: 'vault', label: 'Vault Files', icon: Briefcase },
                      { id: 'tickets', label: 'Support Cases', icon: ShieldAlert },
                      { id: 'payments', label: 'Bill History', icon: Coins },
                      { id: 'logs', label: 'Security Audits', icon: Database }
                    ].map(tab => {
                      const IconComp = tab.icon;
                      const active = dossierSubTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDossierSubTab(tab.id)}
                          className="btn"
                          style={{
                            padding: '0.4rem 0.85rem', fontSize: '0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                            backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                            color: active ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: active ? 700 : 500,
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                          }}
                        >
                          <IconComp size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dossier Sub-tab Content Workspace */}
                  <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    
                    {/* Sub Tab: Client Metadata Form */}
                    {dossierSubTab === 'metadata' && (
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          Update Hospital Registration parameters
                        </h4>
                        
                        <form onSubmit={handleSaveCrmClientDetails} className="flex flex-col gap-3">
                          {crmSaveSuccess && (
                            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                              Metadata configurations committed successfully to database registries.
                            </div>
                          )}

                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Corporate Address</label>
                            <input 
                              type="text" required className="form-control"
                              value={crmAddress} onChange={(e) => setCrmAddress(e.target.value)}
                            />
                          </div>

                          <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Registration ID</label>
                              <input 
                                type="text" required className="form-control"
                                value={crmRegId} onChange={(e) => setCrmRegId(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Bed Capacity</label>
                              <input 
                                type="number" required className="form-control"
                                value={crmBeds} onChange={(e) => setCrmBeds(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Gov ID Type</label>
                              <select 
                                className="form-control" value={crmGovIdType} onChange={(e) => setCrmGovIdType(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                              >
                                <option value="GSTIN">GSTIN (Corporate Tax ID)</option>
                                <option value="PAN">PAN (Income Tax Registration)</option>
                                <option value="NABH ID">NABH Official Application Number</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Gov ID Number</label>
                              <input 
                                type="text" required className="form-control"
                                value={crmGovId} onChange={(e) => setCrmGovId(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Verification Audit Status</label>
                            <div className="flex gap-2">
                              <select 
                                className="form-control" value={crmGovIdStatus} onChange={(e) => setCrmGovIdStatus(e.target.value)}
                                style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', flex: 1 }}
                              >
                                <option value="Pending">Pending Office Review</option>
                                <option value="Approved">Approved (Verified & Unlocked)</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              <button 
                                type="button" onClick={() => setCrmGovIdStatus('Approved')}
                                className="btn btn-secondary" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)', cursor: 'pointer' }}
                              >
                                Auto Approve
                              </button>
                            </div>
                          </div>

                          <button type="submit" className="btn btn-primary glow-premium" style={{ padding: '0.6rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                            Apply Configurations
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Sub Tab: Secure Documents Vault */}
                    {dossierSubTab === 'vault' && (
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          📂 Client Encryption Vault Documents
                        </h4>
                        
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                          {[
                            { name: 'accreditation_assessment.pdf', size: '1.24 MB', type: 'PDF Document' },
                            { name: 'fire_drill_noc_audit.jpg', size: '2.84 MB', type: 'JPEG Image' },
                            { name: 'bio_waste_regulatory_noc.pdf', size: '920 KB', type: 'PDF Document' }
                          ].map(file => (
                            <div key={file.name} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <FileText size={24} color="var(--primary)" />
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', wordBreak: 'break-all' }}>{file.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{file.type} • {file.size}</div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => handleDownloadMockFile(targetCrmClientDetails.hospitalName, file.name)}
                                className="btn btn-secondary flex align-center gap-1"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
                              >
                                <Download size={12} /> <span>Download & Audit</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sub Tab: Support Tickets */}
                    {dossierSubTab === 'tickets' && (
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          🎟️ Logged Troubleshoot Queries & Case History
                        </h4>

                        <div className="flex flex-col gap-2">
                          {supportTickets.filter(t => t.clientName === targetCrmClientDetails.hospitalName).map(ticket => (
                            <div key={ticket.id} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                              <div className="flex justify-between" style={{ marginBottom: '0.4rem' }}>
                                <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{ticket.sequenceCode}</strong>
                                <div className="flex gap-1 align-center">
                                  <span className="badge" style={{ backgroundColor: 'var(--primary-light)', fontSize: '0.65rem' }}>{ticket.priority} Priority</span>
                                  <button 
                                    onClick={() => { setSelectedTicket(ticket.id); setActiveTab('tickets'); }}
                                    className="btn btn-secondary" 
                                    style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', cursor: 'pointer' }}
                                  >
                                    Inspect Case
                                  </button>
                                </div>
                              </div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{ticket.title}</div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{ticket.description}</p>
                              <div style={{ display: 'flex', justifyBetween: 'space-between', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                <span>Assigned: {ticket.assignedOperator}</span>
                                <span>Status: <strong>{ticket.status}</strong></span>
                              </div>
                            </div>
                          ))}

                          {supportTickets.filter(t => t.clientName === targetCrmClientDetails.hospitalName).length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                              No troubleshoot tickets logged by this hospital.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sub Tab: Payment Records */}
                    {dossierSubTab === 'payments' && (
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          💳 Client Subscriptions Transaction Ledger
                        </h4>

                        <table className="table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Base Fee</th>
                              <th>GST (18%)</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.filter(t => t.hospitalName === targetCrmClientDetails.hospitalName || t.clientId === targetCrmClientDetails.email).map(tx => (
                              <tr key={tx.id}>
                                <td>{tx.date}</td>
                                <td>₹{tx.amount.toLocaleString()}</td>
                                <td>₹{tx.gst.toLocaleString()}</td>
                                <td><strong>₹{(tx.amount + tx.gst).toLocaleString()}</strong></td>
                                <td><span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{tx.status}</span></td>
                              </tr>
                            ))}
                            {transactions.filter(t => t.hospitalName === targetCrmClientDetails.hospitalName || t.clientId === targetCrmClientDetails.email).length === 0 && (
                              <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '1.5rem' }}>
                                  No invoice transaction records found for this account.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Sub Tab: Audit Logs */}
                    {dossierSubTab === 'logs' && (
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          🛡️ Client Activity & Audit Trails
                        </h4>
                        
                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {auditLogs.filter(log => log.user === targetCrmClientDetails.email || log.action.includes(targetCrmClientDetails.hospitalName)).map(log => (
                            <div key={log.id} style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Filer: {log.user} ({log.role})</div>
                              </div>
                              <div style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{log.timestamp}</div>
                            </div>
                          ))}
                          {auditLogs.filter(log => log.user === targetCrmClientDetails.email || log.action.includes(targetCrmClientDetails.hospitalName)).length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                              No security logs archived for this account.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                
                // MAIN DATABASE MANAGEMENT CENTER ROOT
                <div className="flex flex-col gap-3">
                  
                  {/* Database Sub Tab Menu Bar */}
                  <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[
                        { id: 'list', label: '📂 Client Database Registry', icon: Database },
                        { id: 'analytics', label: '📊 CRM Visual Analytics', icon: Activity },
                        { id: 'add-client', label: '➕ Register New Client', icon: UserPlus },
                        { id: 'newsletter', label: '📢 Newsletter Campaign Designer', icon: Mail }
                      ].map(t => {
                        const IconComp = t.icon;
                        const active = crmTab === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setCrmTab(t.id)}
                            className="btn"
                            style={{
                              padding: '0.45rem 1rem', fontSize: '0.8rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                              backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                              color: active ? 'var(--primary)' : 'var(--text-secondary)',
                              fontWeight: active ? 700 : 500,
                              display: 'flex', alignItems: 'center', gap: '0.35rem'
                            }}
                          >
                            <IconComp size={14} />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SUB TAB VIEW 1: CLIENT DATABASE TABLE */}
                  {crmTab === 'list' && (
                    <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>📂 CRM Client Database Registry Directory</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '2px 0 0 0' }}>List of registered VaidyaQ hospitals. Open dossiers to configure vaults, override licenses, and review logs.</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={handlePrintCrmDatabase} 
                            className="btn btn-secondary flex align-center gap-1"
                            style={{ padding: '0.45rem 0.85rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.75rem' }}
                          >
                            <Printer size={14} /> <span>Print Database</span>
                          </button>
                          <button 
                            onClick={handleExportCsv} 
                            className="btn btn-secondary flex align-center gap-1"
                            style={{ padding: '0.45rem 0.85rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.75rem' }}
                          >
                            <Download size={14} /> <span>Export CSV Database</span>
                          </button>
                        </div>
                      </div>

                      {/* Filter Search */}
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search client accounts by name or email ID..." 
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem' }}
                      />

                      {/* Table List View */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Hospital Name / ID</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Owner Email</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Capacity</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Onboarding</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Term Expiry</th>
                              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCrmClients.map(client => {
                              const progress = getClientOnboardingProgress(client);
                              const completedCount = getCompletedStepsCount(progress);
                              const progressPercent = completedCount * 25;

                              return (
                                <tr key={client.hospitalId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{client.hospitalName}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{client.hospitalId}</div>
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>{client.email}</td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span className="badge badge-neutral">{client.beds} Beds</span>
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span className="badge" style={{ 
                                      backgroundColor: client.status === 'Paid' ? 'var(--bg-success)' : client.status === 'Expired' ? 'var(--bg-danger)' : 'var(--primary-light)', 
                                      color: client.status === 'Paid' ? 'var(--color-success)' : client.status === 'Expired' ? 'var(--color-danger)' : 'var(--primary)',
                                      fontSize: '0.7rem', fontWeight: 'bold'
                                    }}>
                                      {client.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', width: '100px' }}>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{completedCount}/4 steps ({progressPercent}%)</span>
                                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: completedCount === 4 ? 'var(--color-success)' : 'var(--primary)' }}></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {client.planExpiryDate || 'Active Trial'}
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                      <button 
                                        onClick={() => loadCrmClient(client)}
                                        className="btn btn-secondary flex align-center gap-1"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Open Dossier Folder"
                                      >
                                        <FolderOpen size={12} /> <span>View Folder</span>
                                      </button>
                                      <button 
                                        onClick={() => handleOfficeDeleteClient(client.hospitalId)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.3rem 0.4rem', borderRadius: '6px', color: 'rgb(239, 68, 68)', cursor: 'pointer' }}
                                        title="Delete Client Account"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SUB TAB VIEW 2: VISUAL ANALYTICS */}
                  {crmTab === 'analytics' && (
                    <div className="flex flex-col gap-3">
                      {/* Summary top metrics bar */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTERED CLIENTS</span>
                          <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{clientsList.length} Hospitals</h4>
                        </div>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL CAPACITY SERVED</span>
                          <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{clientsList.reduce((sum, c) => sum + c.beds, 0)} Beds</h4>
                        </div>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PAID LICENSE BASE</span>
                          <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{clientsList.filter(c => c.status === 'Paid').length} Accounts</h4>
                        </div>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TRIAL / EXPIRING BASE</span>
                          <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{clientsList.filter(c => c.status !== 'Paid').length} Accounts</h4>
                        </div>
                      </div>

                      {/* Render SVG graphs */}
                      {renderCrmVisualCharts()}
                    </div>
                  )}

                  {/* SUB TAB VIEW 3: SAAS-STYLED REGISTER FORM */}
                  {crmTab === 'add-client' && (
                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <UserPlus size={18} color="var(--primary)" /> <span>Register New Hospital Account (SaaS Flow)</span>
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Provision a new SaaS license folder directly into the database. Replicates the registration parameters from client onboarding.
                      </p>

                      {newClientSuccess && (
                        <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                          🏥 Hospital account successfully provisioned and welcome dispatch sent!
                        </div>
                      )}

                      <form onSubmit={handleOfficeAddClient} className="flex flex-col gap-3">
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Hospital / Institution Name</label>
                          <input 
                            type="text" required placeholder="e.g. Apollo Medical Center" className="form-control"
                            value={newClientName} onChange={(e) => setNewClientName(e.target.value)}
                          />
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Owner / Admin Email ID</label>
                            <input 
                              type="email" required placeholder="director@apollo.org" className="form-control"
                              value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Bed Capacity (Accreditation Size)</label>
                            <input 
                              type="number" required min="1" className="form-control"
                              value={newClientBeds} onChange={(e) => setNewClientBeds(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Secure Default Access Password</label>
                          <input 
                            type="password" placeholder="•••••••• (Temp password for onboarding login)" className="form-control"
                            value={newClientPassword} onChange={(e) => setNewClientPassword(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Institution Address</label>
                          <input 
                            type="text" placeholder="Corporate HQ Address, City, State" className="form-control"
                            value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)}
                          />
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Govt Tax Verification ID Class</label>
                            <select 
                              className="form-control" value={newClientGovIdType} onChange={(e) => setNewClientGovIdType(e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                              <option value="GSTIN">GSTIN (Corporate Tax ID)</option>
                              <option value="PAN">PAN (Income Tax Registration)</option>
                              <option value="NABH ID">NABH Official Application Number</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Govt ID Registration Number</label>
                            <input 
                              type="text" placeholder="e.g. 06AAAAA1111A1Z1" className="form-control"
                              value={newClientGovId} onChange={(e) => setNewClientGovId(e.target.value)}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary glow-premium" style={{ padding: '0.75rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
                          Provision SaaS License Account
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SUB TAB VIEW 4: CUSTOMIZABLE NEWSLETTER SCHEDULER */}
                  {crmTab === 'newsletter' && (
                    <div className="flex flex-col gap-4">
                      
                      {/* Enforce Google Workspace Mail Connection */}
                      <div className="card" style={{ 
                        padding: '1.25rem', 
                        backgroundColor: googleMailConnected ? 'rgba(52, 168, 83, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${googleMailConnected ? 'rgba(52, 168, 83, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            backgroundColor: googleMailConnected ? 'rgb(52, 168, 83)' : 'rgb(239, 68, 68)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#fff'
                          }}>
                            <Mail size={18} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>Google Workspace Campaign Dispatcher</span>
                              {googleMailConnected && <span style={{ fontSize: '0.65rem', backgroundColor: 'rgb(52, 168, 83)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>AUTHENTICATED</span>}
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                              {googleMailConnected 
                                ? `Campaigns will be sent as authenticated Workspace bulletins via: ${googleMailAccount}`
                                : `Google account connection is required to authenticate newsletters. Lock active.`
                              }
                            </p>
                          </div>
                        </div>
                        <div>
                          {!googleMailConnected && (
                            <button 
                              onClick={() => setShowGoogleOAuthModal(true)}
                              className="btn btn-primary flex align-center gap-1"
                              style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                            >
                              <Lock size={12} /> <span>Connect Google Mail</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Newsletter Designer Grid Workspace */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '1.5rem' }}>
                        
                        {/* Left Column Settings */}
                        <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Sliders size={16} color="var(--primary)" /> <span>Campaign Settings Designer</span>
                          </h3>

                          {newsletterSuccess && (
                            <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                              {newsletterFeedbackMessage}
                            </div>
                          )}

                          {newsletterError && (
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'rgb(239, 68, 68)', padding: '0.6rem', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.75rem' }}>
                              {newsletterFeedbackMessage}
                            </div>
                          )}

                          <form onSubmit={newsletterSendTimeMode === 'now' ? handleSendNewsletter : handleScheduleNewsletter} className="flex flex-col gap-3">
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                              <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Header Brand Text</label>
                                <input type="text" className="form-control" value={newsletterHeaderLogo} onChange={(e) => setNewsletterHeaderLogo(e.target.value)} style={{ padding: '0.4rem' }} />
                              </div>
                              <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Newsletter Theme color</label>
                                <select 
                                  className="form-control" value={newsletterTheme} onChange={(e) => setNewsletterTheme(e.target.value)}
                                  style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                >
                                  <option value="emerald">🟢 Emerald Green</option>
                                  <option value="ocean">🔵 Ocean Blue</option>
                                  <option value="navy">⚫ Corporate Navy</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Newsletter Subject Line</label>
                              <input type="text" required className="form-control" value={newsletterSubject} onChange={(e) => setNewsletterSubject(e.target.value)} style={{ padding: '0.45rem' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                              <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Recipient Segment</label>
                                <select 
                                  className="form-control" value={newsletterSegment} onChange={(e) => setNewsletterSegment(e.target.value)}
                                  style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                >
                                  <option value="all">👥 All Accounts ({clientsList.length} targets)</option>
                                  <option value="trial">⏳ Trial Accounts ({clientsList.filter(c => resolveClientBillingStatus(c) === 'Under Trial').length} targets)</option>
                                  <option value="paid">🟢 Paid Subscribers ({clientsList.filter(c => resolveClientBillingStatus(c) === 'Paid').length} targets)</option>
                                  <option value="expired">🔴 Expired / Suspended ({clientsList.filter(c => resolveClientBillingStatus(c) === 'Expired' || resolveClientBillingStatus(c) === 'Cancelled').length} targets)</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Delivery Timing</label>
                                <select 
                                  className="form-control" value={newsletterSendTimeMode} onChange={(e) => setNewsletterSendTimeMode(e.target.value)}
                                  style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                >
                                  <option value="now">⚡ Send Now (Google Dispatch)</option>
                                  <option value="scheduled">📅 Schedule Broadcast time</option>
                                </select>
                              </div>
                            </div>

                            {newsletterSendTimeMode === 'scheduled' && (
                              <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Scheduled Date & Time</label>
                                <input 
                                  type="datetime-local" className="form-control" required
                                  value={newsletterScheduleDate} onChange={(e) => setNewsletterScheduleDate(e.target.value)}
                                  style={{ padding: '0.4rem' }}
                                />
                              </div>
                            )}

                            <div className="form-group">
                              <div className="flex justify-between align-center" style={{ marginBottom: '0.2rem' }}>
                                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', margin: 0 }}>Newsletter Template Body</label>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <button 
                                    type="button" 
                                    onClick={() => setNewsletterBody(prev => prev + " {{hospitalName}}")}
                                    className="btn btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    + Hospital Name
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => setNewsletterBody(prev => prev + " {{email}}")}
                                    className="btn btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    + Email ID
                                  </button>
                                </div>
                              </div>
                              <textarea 
                                required className="form-control" value={newsletterBody} onChange={(e) => setNewsletterBody(e.target.value)}
                                style={{ width: '100%', minHeight: '120px', fontSize: '0.8rem', padding: '0.5rem' }}
                                placeholder="Write customized email body. Dynamic placeholders like {{hospitalName}} will render values."
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Footer Notice Address</label>
                              <input type="text" className="form-control" value={newsletterFooter} onChange={(e) => setNewsletterFooter(e.target.value)} style={{ padding: '0.4rem' }} />
                            </div>

                            <button 
                              type="submit" 
                              className="btn btn-primary flex align-center justify-center gap-1 glow-premium" 
                              style={{ padding: '0.6rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                              disabled={!googleMailConnected}
                            >
                              {newsletterSendTimeMode === 'now' ? (
                                <>
                                  <Send size={14} /> <span>Broadcast Newsletter Now</span>
                                </>
                              ) : (
                                <>
                                  <Calendar size={14} /> <span>Commit Scheduled Broadcast</span>
                                </>
                              )}
                            </button>

                          </form>
                        </div>

                        {/* Right Column previewer */}
                        <div className="flex flex-col gap-3">
                          
                          {/* Visual template previewer */}
                          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                              Visual Campaign Inbox Preview
                            </h4>

                            <div style={{ 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '8px', 
                              backgroundColor: '#ffffff', 
                              color: '#1f2937', 
                              overflow: 'hidden',
                              fontFamily: 'sans-serif',
                              fontSize: '0.85rem'
                            }}>
                              
                              {/* Brand header banner */}
                              <div style={{ 
                                padding: '1rem', 
                                backgroundColor: newsletterTheme === 'emerald' ? '#22c55e' : newsletterTheme === 'ocean' ? '#1a73e8' : '#1f2937', 
                                color: '#ffffff',
                                display: 'flex',
                                justifyBetween: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontWeight: 900, letterSpacing: '0.05em' }}>{newsletterHeaderLogo}</span>
                                <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>BETA BULLETIN</span>
                              </div>

                              {/* Email meta */}
                              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#5f6368', lineHeight: '1.4' }}>
                                <div><strong>From:</strong> VaidyaQ Dispatcher <code>&lt;{googleMailAccount}&gt;</code></div>
                                <div><strong>Subject:</strong> {newsletterSubject || '(No Subject)'}</div>
                                <div><strong>Segment:</strong> Target [{newsletterSegment}] category</div>
                              </div>

                              {/* Body preview */}
                              <div style={{ padding: '1.5rem 1rem', minHeight: '180px', lineHeight: '1.6', color: '#202124', backgroundColor: '#fafafa' }}>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {newsletterBody
                                    .replace(/\{\{hospitalName\}\}/g, "City Central Metro Hospital")
                                    .replace(/\{\{email\}\}/g, "director@metro.org")
                                    .replace(/\{\{beds\}\}/g, "150")}
                                </p>
                              </div>

                              {/* Footer preview */}
                              <div style={{ 
                                padding: '1rem', 
                                borderTop: '1px solid #e5e7eb', 
                                backgroundColor: '#f1f3f4', 
                                color: '#5f6368', 
                                fontSize: '0.65rem', 
                                textAlign: 'center',
                                lineHeight: '1.4'
                              }}>
                                <div>{newsletterFooter}</div>
                                <div style={{ marginTop: '0.2rem', color: '#9aa0a6' }}>You received this circular because your institution is registered with VaidyaQ.</div>
                              </div>

                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Scheduled campaigns ledger list queue */}
                      <div className="card flex flex-col gap-3" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} color="var(--primary)" /> <span>Scheduled Campaigns Dispatch Ledger Queue</span>
                        </h4>
                        
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '0.5rem' }}>Campaign Theme & Brand</th>
                                <th style={{ padding: '0.5rem' }}>Subject Line</th>
                                <th style={{ padding: '0.5rem' }}>Target Segment</th>
                                <th style={{ padding: '0.5rem' }}>Scheduled Time</th>
                                <th style={{ padding: '0.5rem' }}>Status</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scheduledNewsletters.length === 0 ? (
                                <tr>
                                  <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No scheduled bulletins.</td>
                                </tr>
                              ) : (
                                scheduledNewsletters.map(sch => (
                                  <tr key={sch.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}>
                                      <span style={{ 
                                        display: 'inline-block', width: '8px', height: '8px', 
                                        backgroundColor: sch.theme === 'emerald' ? '#22c55e' : sch.theme === 'ocean' ? '#1a73e8' : '#1f2937', 
                                        borderRadius: '2px', marginRight: '0.25rem' 
                                      }}></span>
                                      <strong>{sch.logoText}</strong>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{sch.subject}</td>
                                    <td style={{ padding: '0.5rem', textTransform: 'capitalize' }}>{sch.segment} Clients</td>
                                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{new Date(sch.scheduledAt).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Pending Queue</span>
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                      <button 
                                        onClick={() => handleCancelScheduledNewsletter(sch.id)}
                                        className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: 'rgb(239, 68, 68)', cursor: 'pointer' }}
                                        title="Cancel Broadcast"
                                      >
                                        Cancel Campaign
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          ))}

          {/* TAB 3: FINANCE & INVOICES */}
          {activeTab === 'finance' && renderPermissionGuard('manage_finance', (
            <div className="flex flex-col gap-4">
              
              {/* Top controls and selectors */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                  
                  {/* Focus Client */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Filter size={12} /> <span>Focus Client Account</span>
                    </label>
                    <select 
                      className="form-control"
                      value={focusedClientId}
                      onChange={(e) => setFocusedClientId(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      <option value="all">📊 All Client Accounts</option>
                      {clientsList.map(c => (
                        <option key={c.hospitalId} value={c.hospitalId}>🏥 {c.hospitalName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filters */}
                  <div>
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginBottom: '0.35rem' }}>
                      Filter Client Billing Status
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {Object.keys(statusFilters).map(statusKey => (
                        <label 
                          key={statusKey} 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            cursor: 'pointer', 
                            fontSize: '0.7rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            border: `1px solid ${statusFilters[statusKey] ? 'var(--primary)' : 'var(--border-color)'}`,
                            backgroundColor: statusFilters[statusKey] ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            color: statusFilters[statusKey] ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            userSelect: 'none'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={statusFilters[statusKey]} 
                            onChange={() => handleToggleStatusFilter(statusKey)} 
                            style={{ display: 'none' }}
                          />
                          <span>{statusKey}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Time scale selectors */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                      Time Scale Trend
                    </label>
                    <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-tertiary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      {['monthly', 'quarterly', 'yearly'].map(scale => (
                        <button
                          key={scale}
                          onClick={() => setFinanceTimeScale(scale)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: financeTimeScale === scale ? 'var(--bg-secondary)' : 'transparent',
                            color: financeTimeScale === scale ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: financeTimeScale === scale ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Visual SVG chart */}
              {renderFinancialChart()}

              {/* Profitability summary widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                {/* Revenue */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex justify-between align-center" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>TOTAL REVENUE</span>
                    <TrendingUp size={16} color="rgb(34, 197, 94)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0' }}>
                    ₹{currentFinancials.revenueSum.toLocaleString()}
                  </h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    Sum of matching contracts + base projections
                  </div>
                </div>

                {/* Expenses */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex justify-between align-center" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>TOTAL EXPENSES</span>
                    <TrendingDown size={16} color="rgb(239, 68, 68)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0' }}>
                    ₹{currentFinancials.expenseSum.toLocaleString()}
                  </h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    Total logged client-specific operations cost
                  </div>
                </div>

                {/* Net Profit */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex justify-between align-center" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>NET PROFIT</span>
                    <span className="badge" style={{ 
                      backgroundColor: currentFinancials.profit >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: currentFinancials.profit >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                      fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px'
                    }}>
                      {currentFinancials.profit >= 0 ? 'SURPLUS' : 'DEFICIT'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0', color: currentFinancials.profit >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
                    ₹{currentFinancials.profit.toLocaleString()}
                  </h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    Revenue minus logged expenses
                  </div>
                </div>

                {/* Profit Margin Ratio */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex justify-between align-center" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>NET PROFIT MARGIN</span>
                    <span>{currentFinancials.profitMargin}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ 
                      width: `${Math.max(0, Math.min(100, currentFinancials.profitMargin))}%`, 
                      height: '100%', 
                      backgroundColor: currentFinancials.profitMargin >= 40 ? 'rgb(34, 197, 94)' : currentFinancials.profitMargin >= 15 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)' 
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    Margin ratio of operational surplus
                  </div>
                </div>

                {/* GST Compliance */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex justify-between align-center" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>GST COMPLIANCE (18%)</span>
                    <FileCheck size={16} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.5rem 0 0.25rem 0' }}>
                    ₹{currentFinancials.baseGstSum.toLocaleString()}
                  </h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>CGST (9%): ₹{Math.round(currentFinancials.baseGstSum / 2).toLocaleString()}</span>
                    <span>SGST (9%): ₹{Math.round(currentFinancials.baseGstSum / 2).toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Google Mail Connector Header Panel */}
              <div className="card" style={{ 
                padding: '1.25rem', 
                backgroundColor: googleMailConnected ? 'rgba(52, 168, 83, 0.08)' : 'rgba(251, 188, 5, 0.08)',
                border: `1px solid ${googleMailConnected ? 'rgba(52, 168, 83, 0.2)' : 'rgba(251, 188, 5, 0.2)'}`,
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: googleMailConnected ? 'rgb(52, 168, 83)' : 'rgb(251, 188, 5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff'
                  }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Google Workspace OAuth Mail Connector</span>
                      {googleMailConnected && <span style={{ fontSize: '0.65rem', backgroundColor: 'rgb(52, 168, 83)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>ACTIVE</span>}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      {googleMailConnected 
                        ? `Connected to Google Mail API as: ${googleMailAccount}. Financial billing alerts will route via linked account.`
                        : `Not connected. Connecting your workspace Gmail account is required to dispatch formal billing PDFs to client contacts.`
                      }
                    </p>
                  </div>
                </div>
                <div>
                  {googleMailConnected ? (
                    <button 
                      onClick={() => {
                        setGoogleMailConnected(false);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Disconnect Gmail
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowGoogleOAuthModal(true)}
                      className="btn btn-primary flex align-center gap-1"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <Lock size={12} /> <span>Connect Google Mail</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Workspace Split Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '1.5rem' }}>
                
                {/* Left Column: Configurator & Expenses */}
                <div className="flex flex-col gap-4">
                  
                  {/* GST Invoice Layout Customizer */}
                  <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                      <Sliders size={16} color="var(--primary)" /> <span>GST Invoice Customizer</span>
                    </h3>
                    
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Billed Client Hospital</label>
                      <select 
                        className="form-control"
                        value={financeSelectedClient}
                        onChange={(e) => setFinanceSelectedClient(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                      >
                        {clientsList.map(c => (
                          <option key={c.hospitalId} value={c.hospitalId}>{c.hospitalName} ({c.beds} beds)</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Company Header Logo</label>
                        <input type="text" className="form-control" value={invoiceLogo} onChange={(e) => setInvoiceLogo(e.target.value)} style={{ padding: '0.45rem' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Company Name</label>
                        <input type="text" className="form-control" value={invoiceCompanyName} onChange={(e) => setInvoiceCompanyName(e.target.value)} style={{ padding: '0.45rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Our GSTIN Registry</label>
                        <input type="text" className="form-control" value={invoiceGst} onChange={(e) => setInvoiceGst(e.target.value)} style={{ padding: '0.45rem' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Payment Terms</label>
                        <input type="text" className="form-control" value={invoiceTerms} onChange={(e) => setInvoiceTerms(e.target.value)} style={{ padding: '0.45rem' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Our Address</label>
                      <input type="text" className="form-control" value={invoiceAddress} onChange={(e) => setInvoiceAddress(e.target.value)} style={{ padding: '0.45rem' }} />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Footer Inquiry Info</label>
                      <input type="text" className="form-control" value={invoiceFooterNotice} onChange={(e) => setInvoiceFooterNotice(e.target.value)} style={{ padding: '0.45rem' }} />
                    </div>

                    {/* Checklist toggles */}
                    <div>
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem' }}>Invoice Layout Configurator</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={layoutShowLogo} onChange={(e) => setLayoutShowLogo(e.target.checked)} />
                          <span>Show Header Logo</span>
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

                  {/* Client Expense Tracker Form & History Ledger */}
                  <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                      <TrendingDown size={16} color="rgb(239, 68, 68)" /> <span>Client Expense Tracker</span>
                    </h3>
                    
                    {expenseSuccess && (
                      <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                        Expense transaction logged successfully. Profit metrics updated.
                      </div>
                    )}

                    <form onSubmit={handleAddExpenseSubmit} className="flex flex-col gap-3">
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Target Client</label>
                          <select 
                            className="form-control"
                            value={expenseClientId}
                            onChange={(e) => setExpenseClientId(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                          >
                            {clientsList.map(c => (
                              <option key={c.hospitalId} value={c.hospitalId}>{c.hospitalName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Category</label>
                          <select 
                            className="form-control"
                            value={expenseCategory}
                            onChange={(e) => setExpenseCategory(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                          >
                            <option value="API Credits">🤖 API Credits (Gemini)</option>
                            <option value="Server/Cloud">☁️ Server/Cloud Hosting</option>
                            <option value="Support Staff">🎧 Support & Operator Staff</option>
                            <option value="Administrative">📁 Administrative/Govt</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Cost (INR)</label>
                          <input 
                            type="number" 
                            required 
                            min="1"
                            className="form-control" 
                            value={expenseAmount} 
                            onChange={(e) => setExpenseAmount(e.target.value)} 
                            placeholder="₹ Amount in INR" 
                            style={{ padding: '0.45rem' }} 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Date</label>
                          <input 
                            type="date" 
                            required
                            className="form-control" 
                            value={expenseDate} 
                            onChange={(e) => setExpenseDate(e.target.value)} 
                            style={{ padding: '0.45rem' }} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Description / Notes</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={expenseDescription} 
                          onChange={(e) => setExpenseDescription(e.target.value)} 
                          placeholder="e.g. AWS secure vault database backup logs" 
                          style={{ padding: '0.45rem' }} 
                        />
                      </div>

                      <button type="submit" className="btn btn-primary flex align-center justify-center gap-1" style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '8px', fontWeight: 700 }}>
                        <Plus size={14} /> <span>Log Operational Expense</span>
                      </button>
                    </form>

                    {/* Expense History Ledger */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginBottom: '0.35rem' }}>Ledger History Logs</label>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0 }}>
                              <th style={{ padding: '0.4rem', textAlign: 'left' }}>Hospital / Cat</th>
                              <th style={{ padding: '0.4rem', textAlign: 'left' }}>Date</th>
                              <th style={{ padding: '0.4rem', textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '0.4rem', textAlign: 'center' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses.length === 0 ? (
                              <tr>
                                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No expenses logged yet.</td>
                              </tr>
                            ) : (
                              expenses.map(exp => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.4rem' }}>
                                    <div style={{ fontWeight: 600 }}>{exp.clientName.length > 20 ? exp.clientName.substring(0, 20) + '...' : exp.clientName}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{exp.category} - <span style={{ fontStyle: 'italic' }}>{exp.description || 'N/A'}</span></div>
                                  </td>
                                  <td style={{ padding: '0.4rem', whiteSpace: 'nowrap' }}>{exp.date}</td>
                                  <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 'bold' }}>₹{exp.amount.toLocaleString()}</td>
                                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                                    <button 
                                      onClick={() => handleDeleteExpense(exp.id)} 
                                      style={{ border: 'none', backgroundColor: 'transparent', color: 'rgb(239, 68, 68)', cursor: 'pointer', padding: '0.2rem' }}
                                      title="Delete Log"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Right Column: Invoice Preview box */}
                <div className="flex flex-col gap-3">
                  <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Printer size={16} color="var(--primary)" /> <span>Live Invoice Draft Layout</span>
                      </h3>
                      
                      <div className="flex align-center gap-1">
                        {/* Download Invoice (HTML) */}
                        <button 
                          onClick={() => {
                            const matched = clientsList.find(c => c.hospitalId === financeSelectedClient);
                            if (matched) handleDownloadInvoiceTemplate(matched);
                          }} 
                          className="btn btn-secondary flex align-center gap-1" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                          title="Download Invoice File"
                        >
                          <Download size={12} /> <span>Download</span>
                        </button>
                        
                        {/* Send via Google Workspace / default */}
                        <button 
                          onClick={() => {
                            const matched = clientsList.find(c => c.hospitalId === financeSelectedClient);
                            if (matched) handleSendEmailInvoice(matched);
                          }} 
                          className="btn btn-primary flex align-center gap-1" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          <Mail size={12} /> <span>Send Invoice</span>
                        </button>

                        {/* Print Invoice PDF */}
                        <button onClick={handlePrintInvoice} className="btn btn-secondary flex align-center gap-1" style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}>
                          <Printer size={12} /> <span>Print</span>
                        </button>
                      </div>
                    </div>

                    {invoiceMailedSuccess && (
                      <div style={{ 
                        backgroundColor: mailFeedbackMessage.includes('Error') ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-success)', 
                        color: mailFeedbackMessage.includes('Error') ? 'rgb(239, 68, 68)' : 'var(--color-success)', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem', 
                        marginBottom: '1rem',
                        border: `1px solid ${mailFeedbackMessage.includes('Error') ? 'rgba(239, 68, 68, 0.3)' : 'var(--bg-success)'}`
                      }}>
                        {mailFeedbackMessage}
                      </div>
                    )}

                    {/* Invoice Printable Preview Container */}
                    <div id="invoice-preview-container" style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      
                      {/* Header */}
                      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          {layoutShowLogo && (
                            <h2 style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>
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

              {/* Client Financial Matrix Directory Table */}
              <div className="card flex flex-col gap-3" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                      <Database size={18} color="var(--primary)" /> <span>Client Accounts Billing Registry Matrix</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      Update customer subscriptions, track invoice dispatches, and check renewal timelines.
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Hospital Name</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Beds</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Expiry / Renewal Status</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Billing Status</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Invoice Sent Status</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsList.map(client => {
                        const clientBillingStatus = resolveClientBillingStatus(client);

                        return (
                          <tr key={client.hospitalId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{client.hospitalName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Owner: {client.email}</div>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <span className="badge badge-neutral">{client.beds} Beds</span>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              {getRenewalStatusLabel(client)}
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <select
                                className="form-control"
                                value={clientBillingStatus}
                                onChange={(e) => handleUpdateBillingStatus(client.hospitalId, e.target.value)}
                                style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 600,
                                  borderRadius: '6px', 
                                  backgroundColor: 'var(--bg-tertiary)',
                                  color: 'var(--text-primary)',
                                  width: '145px',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                <option value="Paid">🟢 Paid</option>
                                <option value="Pending">🟡 Pending</option>
                                <option value="Awaiting Payment">🟠 Awaiting Payment</option>
                                <option value="Expired">🔴 Expired</option>
                                <option value="Cancelled">❌ Cancelled</option>
                                <option value="Under Trial">⏳ Under Trial</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              {client.billSent ? (
                                <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <CheckCircle size={14} /> Sent & Awaiting Confirmation
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                  Not Sent (Awaiting dispatch)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleSendEmailInvoice(client)}
                                  className="btn btn-secondary flex align-center gap-1"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                                  title="Send tax invoice via email logs"
                                >
                                  <Mail size={12} />
                                </button>
                                <button
                                  onClick={() => handleDownloadInvoiceTemplate(client)}
                                  className="btn btn-secondary flex align-center gap-1"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                                  title="Download HTML receipt"
                                >
                                  <Download size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}

          {/* TAB 4: SUPPORT TICKET QUEUE */}
          {activeTab === 'tickets' && renderPermissionGuard('resolve_tickets', (
            <div className="flex flex-col gap-3">
              
              {/* TICKET DETAILS DEDICATED CASE PAGE */}
              {selectedTicket && targetTicketDetails ? (
                <div className="card flex flex-col gap-4" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  
                  {/* Case Header */}
                  <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div className="flex align-center gap-2">
                      <button 
                        onClick={() => setSelectedTicket(null)}
                        className="btn btn-secondary flex align-center gap-1"
                        style={{ padding: '0.45rem 0.8rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.8rem' }}
                      >
                        <ArrowLeft size={14} /> <span>Back to Troubleshoot Queue</span>
                      </button>
                      <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                          Case File: {targetTicketDetails.sequenceCode}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Logged: {targetTicketDetails.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <span className={`badge ${targetTicketDetails.priority === 'High' ? 'badge-danger' : targetTicketDetails.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                        {targetTicketDetails.priority} Priority
                      </span>
                      <span className={`badge ${targetTicketDetails.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                        {targetTicketDetails.status}
                      </span>
                    </div>
                  </div>

                  {/* Case Details grid */}
                  <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Case Core Information */}
                    <div className="flex flex-col gap-3">
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Client Hospital Profile
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>{targetTicketDetails.clientName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filer ID: {targetTicketDetails.clientId}</div>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          Issue Summary
                        </div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{targetTicketDetails.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                          {targetTicketDetails.description}
                        </p>
                      </div>
                    </div>

                    {/* Troubleshooting Action Station */}
                    <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px', height: 'fit-content' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Troubleshooting Action Station
                      </h4>

                      {ticketSaveSuccess && (
                        <div style={{ backgroundColor: 'var(--bg-success)', color: 'var(--color-success)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                          Actions committed. Returning to dispatch queue...
                        </div>
                      )}

                      <form onSubmit={handleSaveTicketDetails} className="flex flex-col gap-3">
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Set Case Status</label>
                          <select 
                            className="form-control"
                            value={ticketStatusInput}
                            onChange={(e) => setTicketStatusInput(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <option value="Open">Open (Pending Dispatch)</option>
                            <option value="In Progress">In Progress (Investigation)</option>
                            <option value="Resolved">Resolved (Close Case)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Assign Dispatch Operator</label>
                          <select 
                            className="form-control"
                            value={ticketAssigneeInput}
                            onChange={(e) => setTicketAssigneeInput(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <option value="Aarav Sharma">Aarav Sharma (Support Supervisor)</option>
                            <option value="Priya Nair">Priya Nair (Billing Manager)</option>
                            {vendorEmployees.map(emp => (
                              <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Resolution/Comments Log</label>
                          <textarea 
                            className="form-control"
                            placeholder="Add fix details or diagnostic comments to push to notifications logs..."
                            value={ticketResolutionNotes}
                            onChange={(e) => setTicketResolutionNotes(e.target.value)}
                            style={{ width: '100%', minHeight: '80px', fontSize: '0.8rem', padding: '0.5rem' }}
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          style={{ padding: '0.5rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                        >
                          Commit Case Action
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              ) : (
                // TICKET QUEUE LIST TABLE (ROOT SCREEN)
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
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>{ticket.sequenceCode}</td>
                          <td style={{ fontWeight: 'bold' }}>{ticket.clientName}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>{ticket.description.substring(0, 70)}...</div>
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
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => setSelectedTicket(ticket.id)} 
                              className="btn btn-secondary flex align-center gap-1" 
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', borderRadius: '6px' }}
                            >
                              <FolderOpen size={12} /> <span>Expand Case</span>
                            </button>
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
              )}

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

      {showGoogleOAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            color: '#1f2937',
            width: '100%',
            maxWidth: '440px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            {/* Google Logo Header */}
            <div style={{ padding: '2.25rem 2rem 1.25rem 2rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '1.25rem' }}>
                <span style={{ color: '#4285F4', fontSize: '2.1rem', fontWeight: 'bold' }}>G</span>
                <span style={{ color: '#EA4335', fontSize: '2.1rem', fontWeight: 'bold' }}>o</span>
                <span style={{ color: '#FBBC05', fontSize: '2.1rem', fontWeight: 'bold' }}>o</span>
                <span style={{ color: '#4285F4', fontSize: '2.1rem', fontWeight: 'bold' }}>g</span>
                <span style={{ color: '#34A853', fontSize: '2.1rem', fontWeight: 'bold' }}>l</span>
                <span style={{ color: '#EA4335', fontSize: '2.1rem', fontWeight: 'bold' }}>e</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#202124', margin: 0 }}>Sign in with Google</h3>
              <p style={{ fontSize: '0.85rem', color: '#5f6368', marginTop: '0.35rem' }}>to continue to VaidyaQ Finance Hub</p>
            </div>
            
            {/* Body content */}
            <div style={{ padding: '1.75rem 2rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#3c4043', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                VaidyaQ requires authorization to connect to your corporate Google account to dispatch invoice PDFs directly via Google Workspace APIs.
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Google Account Email Address</label>
                <input 
                  type="email" 
                  value={googleMailAccount}
                  onChange={(e) => setGoogleMailAccount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff',
                    color: '#202124',
                    outline: 'none'
                  }}
                  placeholder="finance@vaidyaq.com"
                />
              </div>

              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#5f6368',
                marginBottom: '1.75rem',
                border: '1px solid #e8eaed',
                lineHeight: '1.4'
              }}>
                🔒 <strong>Workspace Sandbox Security Notice:</strong> Authentication tokens are stored inside local browser memory. VaidyaQ Super Admin operators do not log passwords.
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  onClick={() => setShowGoogleOAuthModal(false)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#1a73e8',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'background-color 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setGoogleMailConnected(true);
                    setShowGoogleOAuthModal(false);
                  }}
                  style={{
                    padding: '0.55rem 1.35rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    backgroundColor: '#1a73e8',
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 1px 2px rgba(66, 133, 244, 0.3)'
                  }}
                >
                  Authorize Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
