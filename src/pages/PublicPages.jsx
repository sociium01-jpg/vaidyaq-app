import React, { useState, useContext, useEffect, useRef } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import VaidyaQLogo from '../components/VaidyaQLogo';
import {
  Shield,
  Brain,
  Calendar,
  FileText,
  CheckCircle2,
  ChevronRight,
  Lock,
  Users,
  Sparkles,
  Building,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowRight,
  FileSearch,
  CheckCircle,
  Volume2,
  Tv,
  SkipForward,
  Star,
  ChevronLeft,
  BookOpen,
  Mail,
  Phone,
  Menu,
  X,
  MessageSquare,
  Gift,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

// Signature Element: Concentric Audit-Readiness Activity Ring
function AuditReadinessRing({ completion, docked }) {
  const outerCircum = 2 * Math.PI * 80; // ~502.6
  const middleCircum = 2 * Math.PI * 60; // ~377.0
  const innerCircum = 2 * Math.PI * 40; // ~251.3

  const outerOffset = outerCircum - (completion.outer / 100) * outerCircum;
  const middleOffset = middleCircum - (completion.middle / 100) * middleCircum;
  const innerOffset = innerCircum - (completion.inner / 100) * innerCircum;

  // Calculate overall average for center text
  const overallAverage = Math.round((completion.outer + completion.middle + completion.inner) / 3);

  return (
    <div className={`readiness-ring-wrapper ${docked ? 'docked' : ''}`}>
      {/* Orbiting compliance chips */}
      <div className="orbit-container">
        <div className="orbiting-chip" style={{ top: '2%', left: '50%', transform: 'translateX(-50%)' }}>DOC-CTRL</div>
        <div className="orbiting-chip" style={{ top: '50%', right: '2%', transform: 'translateY(-50%)' }}>CAPA-07</div>
        <div className="orbiting-chip" style={{ bottom: '2%', left: '50%', transform: 'translateX(-50%)' }}>NABH 5th Ed.</div>
        <div className="orbiting-chip" style={{ top: '50%', left: '2%', transform: 'translateY(-50%)' }}>IR-2231</div>
        <div className="orbiting-chip" style={{ top: '15%', left: '15%' }}>QI: HAI Rate</div>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Background Track Rings */}
        <circle cx="100" cy="100" r="80" fill="transparent" stroke="rgba(14, 95, 216, 0.05)" strokeWidth="12" />
        <circle cx="100" cy="100" r="60" fill="transparent" stroke="rgba(15, 181, 166, 0.05)" strokeWidth="12" />
        <circle cx="100" cy="100" r="40" fill="transparent" stroke="rgba(245, 165, 36, 0.05)" strokeWidth="12" />

        {/* Outer Ring: Document Control & SOPs */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="transparent"
          stroke="var(--primary)"
          strokeWidth="12"
          strokeDasharray={outerCircum}
          strokeDashoffset={outerOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Middle Ring: Internal Audits & CAPAs */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="transparent"
          stroke="var(--signal-teal)"
          strokeWidth="12"
          strokeDasharray={middleCircum}
          strokeDashoffset={middleOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Inner Ring: Incident reporting & alerts */}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="transparent"
          stroke={completion.inner >= 90 ? 'var(--signal-teal)' : 'var(--amber)'}
          strokeWidth="12"
          strokeDasharray={innerCircum}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease' }}
        />
      </svg>

      {/* Center Label */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: docked ? '0.9rem' : '2rem',
          fontWeight: 700,
          color: 'var(--ink)',
          lineHeight: 1
        }}>
          {overallAverage}%
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: docked ? '0.45rem' : '0.65rem',
          fontWeight: 500,
          color: 'rgba(11, 18, 32, 0.5)',
          textTransform: 'uppercase',
          marginTop: '2px',
          letterSpacing: '0.05em'
        }}>
          {docked ? 'Ready' : 'Readiness'}
        </span>
      </div>
    </div>
  );
}

export default function PublicPages() {
  const { 
    setCurrentRoute, 
    theme, 
    setTheme, 
    currentUser, 
    setCurrentUser, 
    logActivity, 
    signUpClient, 
    clientsList,
    setHospitalName,
    setHospitalBeds,
    setTrialStartDate,
    setIsSubscribed,
    setHospitalLogo,
    setTeamMembers,
    setClientsList,
    verifyPassword
  } = useContext(QualiNABHContext);

  useEffect(() => {
    if (currentUser) {
      setCurrentRoute('/app/dashboard');
    }
  }, [currentUser, setCurrentRoute]);

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'solutions', 'pricing', 'login', 'book-demo'
  const [bedSize, setBedSize] = useState(75);
  
  // 9. Sign Up/Sign In Flow
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ hospitalName: '', beds: '50', email: '', password: '', confirmPassword: '' });
  const [signUpError, setSignUpError] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleCustomSignIn = (e) => {
    e.preventDefault();
    const existingClient = (clientsList || []).find(c => c && c.email && c.email.toLowerCase() === signInEmail.toLowerCase());
    if (existingClient) {
      const storedPassword = existingClient.password || "demo123";
      if (!verifyPassword(signInPassword, storedPassword)) {
        setSignInError("Incorrect password. Please verify your credentials and try again.");
        return;
      }

      let clientToLoad = { ...existingClient };
      
      // Moment client logs in, trial countdown starts (if trial not started)
      if (!existingClient.isSubscribed && !existingClient.firstLoginDate) {
        const localNow = new Date().toISOString();
        const trialExpiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();
        
        clientToLoad.firstLoginDate = localNow;
        clientToLoad.trialStartDate = localNow;
        clientToLoad.planExpiryDate = trialExpiry;
        clientToLoad.status = "Active Trial";
        
        setClientsList(prev => (prev || []).map(c => c && c.email && c.email.toLowerCase() === signInEmail.toLowerCase() ? clientToLoad : c));
      }

      setHospitalName(clientToLoad.hospitalName);
      setHospitalBeds(String(clientToLoad.beds));
      setTrialStartDate(clientToLoad.trialStartDate || new Date().toISOString());
      setIsSubscribed(clientToLoad.status === 'Paid');
      setHospitalLogo('🛡️');
      
      const loggedUser = {
        name: "Hospital Director",
        email: clientToLoad.email,
        role: "Super Admin",
        department: "Board",
        hospitalId: clientToLoad.hospitalId
      };
      setCurrentUser(loggedUser);
      setSignInError(false);
      logActivity(`Logged in client: ${clientToLoad.hospitalName} (${clientToLoad.email})`);
      setCurrentRoute('/app/dashboard');
    } else {
      // Look up sub-users database
      let globalSubUsers = [];
      try {
        globalSubUsers = JSON.parse(localStorage.getItem('qn_global_sub_users') || '[]');
      } catch (e) {
        console.warn("[Login] Failed to parse qn_global_sub_users", e);
      }
      const subUser = (globalSubUsers || []).find(u => u && u.email && u.email.toLowerCase() === signInEmail.toLowerCase());
      if (subUser) {
        if (!verifyPassword(signInPassword, subUser.password)) {
          setSignInError("Incorrect password. Please verify your credentials and try again.");
          return;
        }

        // Find the parent client to load their configuration
        const parentClient = (clientsList || []).find(c => c && c.email && c.email.toLowerCase() === subUser.parentEmail.toLowerCase());
        if (parentClient) {
          setHospitalName(parentClient.hospitalName);
          setHospitalBeds(String(parentClient.beds));
          setTrialStartDate(parentClient.trialStartDate || new Date().toISOString());
          setIsSubscribed(parentClient.status === 'Paid');
          setHospitalLogo('🛡️');
        }

        const loggedUser = {
          name: subUser.name,
          email: subUser.email,
          role: subUser.role,
          department: subUser.department,
          parentEmail: subUser.parentEmail,
          hospitalId: parentClient ? parentClient.hospitalId : 'demo-hosp'
        };
        setCurrentUser(loggedUser);
        setSignInError(false);
        logActivity(`Logged in team member: ${subUser.name} (${subUser.email}) under parent ${subUser.parentEmail}`);
        setCurrentRoute('/app/dashboard');
      } else {
        setSignInError("No client or team member registered with this email address. Please sign up or try again.");
      }
    }
  };

  // 1. Landing Page Mockup Simulated States
  const [typing, setTyping] = useState(false);

  // 2. Interactive Audit Readiness Checker Widget States
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '' });
  
  // 3. Interactive Video Walkthrough Simulator States (Step 5 Walkthrough)
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const [videoActiveFrame, setVideoActiveFrame] = useState(0);
  const [videoVolumeMuted, setVideoVolumeMuted] = useState(false);
 
  // 4. Hero Section States
  const heroVideoRef = useRef(null);

  // 5. Testimonial Slider States
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // 6. Blog Section States
  const [selectedBlogArticle, setSelectedBlogArticle] = useState(null);
  // Note: showBlogIndexModal replaced by navigateToTab('blog')

  // 7. Legal & Corporate Pages — rendered via navigateToTab('privacy-policy') / navigateToTab('accessibility')
  // (showPrivacyModal and showAccessibilityModal removed — using tab navigation instead)

  // Demo request state
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', hospital: '', phone: '', coupon: '' });

  // Mobile Header Toggle State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Immersive Landing Page States & Scroll Handlers
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [ringCompletion, setRingCompletion] = useState({ outer: 20, middle: 10, inner: 30, docked: false });
  const [activePlatformTab, setActivePlatformTab] = useState('dashboard');

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      setIsScrolled(sy > 40);
      
      if (sy < 450) {
        setActiveSection('hero');
        setRingCompletion({ outer: 20, middle: 10, inner: 30, docked: false });
      } else if (sy >= 450 && sy < 1100) {
        setActiveSection('problem');
        setRingCompletion({ outer: 35, middle: 20, inner: 40, docked: true });
      } else if (sy >= 1100 && sy < 2000) {
        setActiveSection('platform');
        setRingCompletion({ outer: 55, middle: 35, inner: 50, docked: true });
      } else if (sy >= 2000 && sy < 2900) {
        setActiveSection('modules');
        setRingCompletion({ outer: 70, middle: 60, inner: 65, docked: true });
      } else if (sy >= 2900 && sy < 3700) {
        setActiveSection('ai');
        setRingCompletion({ outer: 85, middle: 80, inner: 78, docked: true });
      } else if (sy >= 3700 && sy < 4300) {
        setActiveSection('accreditation');
        setRingCompletion({ outer: 95, middle: 90, inner: 88, docked: true });
      } else if (sy >= 4300 && sy < 4900) {
        setActiveSection('outcomes');
        setRingCompletion({ outer: 100, middle: 95, inner: 94, docked: true });
      } else {
        setActiveSection('cta');
        setRingCompletion({ outer: 100, middle: 100, inner: 100, docked: true });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Contact Us state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  // 8. Interactive NABH Policy Intelligence & News Search States
  const nabhPolicyNews = [
    {
      id: "news-1",
      title: "6th Edition Standards Made Fully Mandatory",
      type: "Official Policy Change",
      chapter: "General Operations",
      coreOE: "105 Core Elements",
      date: "Jan 01, 2025",
      impact: "HIGH",
      color: "var(--color-danger)",
      summary: "The 6th Edition of the NABH Accreditation Standards for Hospitals is now the absolute benchmark. Total Objective Elements (OEs) are pruned to 639, but mandatory Core OEs have risen to 105. Crucially, NABH has replaced standard phrasing with the word 'Shall,' making strict conformity mandatory.",
      recommendation: "Ensure your quality team performs a gap analysis mapped precisely against the 105 Core OEs, as any non-compliance in these core elements results in automatic audit deferrals."
    },
    {
      id: "news-2",
      title: "Digital Health EMR & ABDM Integration Evaluation",
      type: "Cybersecurity & SaaS Guideline",
      chapter: "AAC & Information Management",
      coreOE: "IM.1.a (Cybersecurity)",
      date: "Feb 15, 2025",
      impact: "HIGH",
      color: "var(--primary)",
      summary: "Hospitals undergo assessment on their cybersecurity maturity, Tele-ICU protocols, and Electronic Medical Record (EMR) implementation. Integration with the Ayushman Bharat Digital Mission (ABDM) framework is heavily examined during site surveys.",
      recommendation: "Implement secure local isolation and encrypted digital document backup systems. Prepare incident response SOPs and proof of recent penetration testing audits."
    },
    {
      id: "news-3",
      title: "Mandatory Antimicrobial Stewardship Committees",
      type: "Clinical Policy Update",
      chapter: "COP (Care of Patients)",
      coreOE: "COP.4.c (Antimicrobial)",
      date: "March 20, 2025",
      impact: "CRITICAL",
      color: "var(--color-warning)",
      summary: "All accredited hospitals must establish an Antimicrobial Stewardship Committee. Quality audits will evaluate the regular compilation of hospital antibiograms, and doctors must follow double-authorization procedures before prescribing restricted antibiotics.",
      recommendation: "Set up a digital register to capture restricted antibiotic prescriptions, showing signs of double-authorization by clinical superintendents."
    },
    {
      id: "news-4",
      title: "Transition to Infection Prevention & Control (IPC)",
      type: "Accreditation Update",
      chapter: "IPC (Infection Prevention)",
      coreOE: "IPC.2.d (Hand Hygiene)",
      date: "April 08, 2025",
      impact: "MODERATE",
      color: "var(--color-success)",
      summary: "The old 'Hospital Infection Control (HIC)' chapter is officially renamed to 'Infection Prevention & Control (IPC).' Assessment criteria shift from reactive reporting of healthcare-associated infections to proactive clinical hand-hygiene scoring and CAPA tracking.",
      recommendation: "Use digital compliance checklists to log daily hand-hygiene audits at ward-levels, showing continuous corrective actions."
    },
    {
      id: "news-5",
      title: "Patient-Reported Outcomes (PROMs & PREMs) Mandatory",
      type: "Patient Safety Indicator",
      chapter: "Quality Management",
      coreOE: "QM.3.b (Outcome Indicators)",
      date: "May 12, 2025",
      impact: "MODERATE",
      color: "var(--primary)",
      summary: "Hospitals with a bed capacity of 200 or more must present quarterly trends of Patient-Reported Outcome Measures (PROMs) and Patient-Reported Experience Measures (PREMs) during accreditation renewals.",
      recommendation: "Build a feedback widget at registration counters to capture standardized post-discharge patient health indexes."
    },
    {
      id: "news-6",
      title: "Eco-Friendly Operations & Sustainability Audits",
      type: "Facility Policy Change",
      chapter: "FMS (Facility Management)",
      coreOE: "FMS.3.e (Waste Audits)",
      date: "June 02, 2025",
      impact: "LOW",
      color: "var(--color-success)",
      summary: "New sustainability standards encourage hospitals to track and document carbon footprints, waste-to-energy segregation rates, and water harvesting infrastructure. Standard FMS audits will review environmental authorization logs.",
      recommendation: "Ensure all Pollution Control Board certificates, waste agreements, and quarterly audits are catalogued."
    }
  ];

  const [newsFeed, setNewsFeed] = useState(nabhPolicyNews);
  const [policySearchQuery, setPolicySearchQuery] = useState('');
  const [isFetchingUpdates, setIsFetchingUpdates] = useState(false);
  const [lastFetchedTime, setLastFetchedTime] = useState('June 11, 2026, 06:48 PM');
  const [selectedPolicyNews, setSelectedPolicyNews] = useState(nabhPolicyNews[0]);
  const [showPromoPopup] = useState(false); // Reserved for future promo campaign
  const [promoClosed] = useState(false);
  const [copiedCoupon] = useState(false);

  // Suppress lint: promo popup state reserved for future release
  void showPromoPopup; void promoClosed; void copiedCoupon;

  const testimonials = [
    {
      quote: "VaidyaQ AI completely transformed our accreditation process. We transitioned from massive paper binders to a 100% digital evidence dashboard in just 2 weeks. The dynamic score calculation kept us on track daily.",
      author: "Dr. Amit Verma",
      role: "Chief Quality Director, Apex Multi-Specialty Hospital",
      location: "New Delhi",
      rating: 5
    },
    {
      quote: "The AI SOP Generator drafted our Medication Expiry Audit Protocol (MOM.3.a) in under 60 seconds. Our clinical committee reviewed, edited, and approved it instantly. The digital sign-off trail was highly appreciated by the assessors.",
      author: "Sister Priyadarshini",
      role: "Chief Nursing Superintendent, St. Jude Medical Center",
      location: "Mumbai",
      rating: 5
    },
    {
      quote: "Using the Gap Analysis module, we identified critical licensing delays that could have halted our operations. The local isolation guarantees HIPAA compliance and patient data privacy. An absolute must-have for hospitals.",
      author: "Col. S. K. Roy",
      role: "Chief Operating Officer, Metro Heart & Vascular Care",
      location: "Kolkata",
      rating: 5
    }
  ];

  const blogArticles = [
    {
      id: "blog-1",
      title: "Unpacking the Jan 2025 NABH 6th Edition Guidelines",
      excerpt: "What are the major shifts in the latest NABH release? Discover the new focus areas in patient safety, digital documentation, and consent records.",
      date: "May 28, 2026",
      readTime: "6 min read",
      author: "Dr. Sarah Paul (Quality Specialist)",
      content: `The National Accreditation Board for Hospitals & Healthcare Providers (NABH) recently released its 6th Edition standards. This release represents a significant shift towards digital health standards and de-identified clinical auditing.

Key Changes in the 6th Edition:
1. DIGITAL HEALTH SYSTEMS INTEGRATION: Hospitals are encouraged to integrate secure digital document storage and audit logs. The old system of paper binders is being phased out in favor of structured electronic registers.
2. ENHANCED INCIDENT MANAGEMENT: Incidents like medication errors, patient falls, and needle stick injuries must be logged immediately. The target response cycle for a Corrective & Preventive Action (CAPA) is now strictly monitored.
3. DATA DE-IDENTIFICATION: Compliance tools must operate on anonymized data sheets to preserve patient confidentiality under the local Sandbox privacy guidelines.

How to Prepare:
Accreditation heads should perform a thorough Gap Analysis on all chapters (AAC, COP, MOM, FMS, HRM) and map digital proof policies to each objective element to ensure compliance before assessment day.`
    },
    {
      id: "blog-2",
      title: "Medication Safety: Auditing High-Alert Medicines (MOM.2.c)",
      excerpt: "High-alert drugs present a heightened risk of patient harm. Learn how to design a complaint storage, locking, and double-checking SOP.",
      date: "June 03, 2026",
      readTime: "5 min read",
      author: "Dr. K. Sen (Pharmacy HOD)",
      content: `Under the Management of Medication (MOM) chapter of NABH, objective standard MOM.2.c requires that high-alert medications are identified, stored securely, and dispensed with absolute accuracy.

Critical Safety Steps:
1. PHYSICAL IDENTIFICATION: High-alert medications (such as concentrated electrolytes, insulin, and anticoagulants) must be labelled with highly visible warning badges.
2. DOUBLE-LOCKED STORAGE: These drugs must be housed in a designated locked cabinet or cupboard within the pharmacy and critical wards. Only authorized nursing heads should hold the key access.
3. DOUBLE-SIGNATURE PROTOCOL: Prior to administering any high-alert medication, two qualified nurses must independently cross-verify the prescription, drug name, dosage, dilution, and expiry date, signing off in the register.
4. DAILY STOCK AUDITS: A check sheet must be signed at every nurse shift handover, verifying the lock integrity and stock balances.`
    },
    {
      id: "blog-3",
      title: "Digital Evidence Mapping: Shifting from Binders to SaaS",
      excerpt: "How City Central Central Hospital systems can automate their accreditation readiness score. Learn the engineering behind live evidence registers.",
      date: "June 08, 2026",
      readTime: "7 min read",
      author: "Amit Kumar (Accreditation Consultant)",
      content: `For years, hospitals prepared for accreditation audits by filling physical ring binders with paper SOPs, printouts, and sign-off sheets. When assessors arrived, retrieving proof was slow and error-prone.

The Power of Digital Evidence Mapping:
By linking uploaded policies, forms, and license cards directly to the standard codes (e.g. FMS.1.d for Fire Safety), hospitals can maintain a continuous, live compliance grade.

Key Benefits of the SaaS Model:
- LIVE READINESS SCORES: Shifting from static checklists to an active state calculator gives the management team real-time visibility into audit risks.
- AUTOMATED LICENSING ALERTS: Digital license trackers notify managers 90 days before cards expire, preventing operational downtime.
- COLLABORATION: Wards can upload evidence files and checklists independently, distributing the compliance workload across the entire clinical staff.`
    }
  ];



  const videoFrames = [
    {
      title: "1. Take a Demo & Estimate Readiness",
      desc: "Submit a demo request or run the Preparedness Quiz on the landing page to gauge your baseline.",
      caption: "Click 'Book Demo' in the header to request a callback, or complete the 3 preparedness questions below to check your baseline compliance rating.",
      render: () => (
        <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📋</span>
            <h4 style={{ fontSize: '0.8rem', margin: '0.25rem 0', color: '#fff' }}>Interactive Preparedness Quiz</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.7rem' }}>
            <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              💬 <strong>Quiz Check:</strong> High-Alert medications storage protocol locked?
            </div>
            <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-warning)', fontWeight: 'bold' }}>
              📈 <strong>Estimated Tier:</strong> Tier C (High Risk Gaps Detected)
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Sign In to the Sandbox Session",
      desc: "Access the preloaded demo sandbox instantly without needing email activation codes.",
      caption: "Click the 'Sign In' button, choose a simulated access role (e.g. Quality Head Dr. Sarah Paul or COO Col. Roy) to launch the compliance command center.",
      render: () => (
        <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="flex justify-between" style={{ fontSize: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span>Sign In to VaidyaQ</span>
            <span style={{ color: 'var(--primary)' }}>Demo Workspace</span>
          </div>
          <div className="flex flex-col gap-1">
            <button style={{ backgroundColor: '#1e293b', border: '1px solid var(--primary)', padding: '0.4rem', borderRadius: '6px', fontSize: '0.7rem', color: '#fff', textAlign: 'left', display: 'flex', justifyContent: 'space-between', cursor: 'default' }} disabled>
              <span>🔑 Quality Head (Sarah Paul)</span>
              <span>Launch ➔</span>
            </button>
            <button style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '6px', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'left', cursor: 'default' }} disabled>
              🔑 COO / Super Admin (Col. Roy)
            </button>
          </div>
        </div>
      )
    },
    {
      title: "3. Set Up Hospital Details & Departments",
      desc: "Define your clinical profile and active wards inside the Interactive Setup Control Panel.",
      caption: "Complete Onboarding Step 1 & 2: enter your hospital's name, bed size, and check the active clinical wards (ICU, Pharmacy, Emergency, OT, HR) to filter risks.",
      render: () => (
        <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>Setup Steps 1 & 2: Profile Settings</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', fontSize: '0.65rem' }}>
            <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px' }}>
              <strong>Hospital:</strong> Central Central City Hospital<br />
              <strong>Beds:</strong> 120 beds capacity<br />
              <strong>Tier:</strong> Full Accreditation
            </div>
            <div style={{ background: '#1e293b', padding: '0.4rem', borderRadius: '6px' }}>
              <strong>Active Wards:</strong><br />
              ☑ ICU  ☑ OT<br />
              ☑ Pharmacy  ☑ Emergency
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Load the NABH Starter Pack",
      desc: "Import pre-configured policy guidelines to bootstrap your compliance registers.",
      caption: "On Onboarding Step 3, click 'Import Templates' to load 7 official 6th edition SOP templates in a 'Pending Review' state. Mapped score initializes to 38.5%.",
      render: () => (
        <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="flex justify-between align-center" style={{ fontSize: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <strong>Step 3: NABH Starter Pack Loaded</strong>
            <span className="badge badge-warning" style={{ fontSize: '0.55rem', padding: '0.1rem 0.25rem' }}>7 SOPs Imported</span>
          </div>
          <div style={{ fontSize: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ padding: '0.25rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px' }}>
              📄 Medication Expiry SOP (Template) ➔ <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>Pending Review</span>
            </div>
            <div style={{ padding: '0.25rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px' }}>
              📄 Admission Emergency Triage SOP ➔ <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>Pending Review</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "5. Edit SOPs & Electronically Sign Off",
      desc: "Customize templates, review guidelines, and authenticate to raise standard scores.",
      caption: "Under Documents tab, select a template, click Edit to customize, then click 'Verify & Authenticate' (PIN 1234) to generate a SHA-256 hash and bump score.",
      render: () => (
        <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem', marginBottom: '0.4rem' }}>
            <strong>Step 4: Authenticate SOP</strong>
            <span className="badge badge-success" style={{ fontSize: '0.55rem', padding: '0.1rem 0.25rem', background: 'var(--color-success)' }}>Approved</span>
          </div>
          <div style={{ fontSize: '0.65rem', background: '#111b27', border: '1px solid var(--color-success)', padding: '0.4rem', borderRadius: '6px' }}>
            🔑 <strong>Signatory:</strong> Dr. Sarah Paul (Quality Head)<br />
            🛡️ <strong>Signature:</strong> <code>SHA256-B81C9A0F0D8E</code><br />
            📊 <strong>Standard Bump:</strong> MOM.3.a score set to 10 (Fully Met)
          </div>
        </div>
      )
    }
  ];


  // Video Walkthrough player loop (Lower section)
  useEffect(() => {
    let interval = null;
    if (videoIsPlaying) {
      interval = setInterval(() => {
        setVideoActiveFrame(prev => (prev + 1) % 5);
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [videoIsPlaying]);

  const handleLogin = (role) => {
    const defaultUsers = {
      "Quality Head": { name: "Dr. Sarah Paul", email: "quality.head@hospital.org", role: "Quality Head", hospitalId: "sarah-hosp" },
      "Super Admin": { name: "Col. Roy (COO)", email: "super@vaidyaq.com", role: "Super Admin", hospitalId: "demo-hosp", parentEmail: "demo@vaidyaq.com" },
      "Auditor": { name: "Ramesh Kumar (Officer)", email: "auditor@hospital.org", role: "Auditor", hospitalId: "demo-hosp", parentEmail: "demo@vaidyaq.com" }
    };
    const selected = defaultUsers[role] || defaultUsers["Quality Head"];
    setCurrentUser(selected);
    logActivity("Logged in via Landing Page Quick Portal");
    setCurrentRoute('/app/dashboard');
  };

  const getQuizResult = () => {
    let yesCount = 0;
    if (quizAnswers.q1 === 'yes') yesCount += 1;
    if (quizAnswers.q2 === 'yes') yesCount += 1;
    if (quizAnswers.q3 === 'active') yesCount += 1;

    if (yesCount === 3) return { pct: 100, grade: 'Tier A: Audit Ready', color: 'var(--color-success)', desc: 'Your facility has robust digital protocols, mapped training, and active environmental certificates. You are ready for the mock assessments.', rating: 'Excellent' };
    if (yesCount === 2) return { pct: 66, grade: 'Tier B: Minor Gaps Detected', color: 'var(--color-warning)', desc: 'You have structured policies but need to link your operational check sheets and license counts to prevent non-conformities.', rating: 'Moderate' };
    return { pct: 33, grade: 'Tier C: High Risk Compliance Status', color: 'var(--color-danger)', desc: 'Critical compliance elements are stored in physical paper folders or expired. Implement the VaidyaQ digital templates to build your evidence ledger.', rating: 'Critical' };
  };

  const pricingDetails = {
    tier: bedSize <= 20 ? "Clinic Tier" : bedSize <= 150 ? "Secondary Care Tier" : "Tertiary Enterprise Tier",
    price: bedSize <= 20 ? "₹55,999" : bedSize <= 150 ? "₹1,29,999" : "₹2,49,999",
    color: bedSize <= 20 ? "var(--primary)" : bedSize <= 150 ? "var(--secondary)" : "#8b5cf6",
    features: bedSize <= 20 
      ? ["Up to 20 beds capacity", "5 Core Wards config", "AI SOP Generator (5 drafts)", "Local storage backup", "Support via Email"]
      : bedSize <= 150 
        ? ["Up to 150 beds capacity", "12 Active Wards config", "AI SOP Generator (Unlimited)", "Audit Finding to CAPA mapper", "Weekly CEO briefing summaries", "Dedicated Account manager"]
        : ["Unlimited beds & branches", "All clinical wards preloaded", "Dedicated private database instance", "Full consultant collaboration panel", "API HIMS integration", "24/7 Priority support hotline"]
  };

  // Helper to navigate to tabs and scroll to top
  const navigateToTab = (tabName) => {
    if (tabName === '/platform/dashboard') {
      setCurrentRoute('/platform/dashboard');
      return;
    }
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFetchUpdates = () => {
    setIsFetchingUpdates(true);
    logActivity("User requested live scan for latest NABH policies from Google");
    
    setTimeout(() => {
      // Create a live fetched update
      const liveArticle = {
        id: "news-live",
        title: "ABDM 2nd Edition Digital Health Accreditation Standard Active",
        type: "Live Feed Alert",
        chapter: "Information Systems",
        coreOE: "ABDM.DH.v2",
        date: "June 11, 2026",
        impact: "CRITICAL",
        color: "var(--secondary)",
        summary: "The National Accreditation Board for Hospitals (NABH) has activated the 2nd Edition guidelines for Digital Health Accreditation. The new metrics focus heavily on HIMS interoperability, client-side encryption of patient identifiers, and electronic diagnostic sign-off audit trails.",
        recommendation: "Conduct audit trials on local-first data configurations. VaidyaQ's AES-256 local database architecture ensures instant alignment with the ABDM 2nd Edition."
      };
      
      setNewsFeed(prev => {
        if (prev.some(item => item.id === "news-live")) {
          return prev;
        }
        return [liveArticle, ...prev];
      });
      setSelectedPolicyNews(liveArticle);
      
      const now = new Date();
      const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
      setLastFetchedTime(now.toLocaleString('en-US', options));
      
      setIsFetchingUpdates(false);
      logActivity("Successfully fetched and parsed ABDM 2nd Edition digital health standard");
    }, 1200);
  };

  const filteredNews = newsFeed.filter(item => {
    const q = policySearchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q) ||
      item.coreOE.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.recommendation.toLowerCase().includes(q)
    );
  });


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Inline styles for 3D Map and animations */}
      {/* Scoped CSS Style Definitions for Immersive Landing Page */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

        /* Scoped Landing Page Design System */
        .vaidyaq-landing-body {
          --surface: #FAFBFD;
          --ink: #0B1220;
          --primary: #0E5FD8;
          --primary-deep: #06318A;
          --signal-teal: #0FB5A6;
          --amber: #F5A524;
          --font-display: 'Instrument Sans', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          background-color: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          overflow-x: hidden;
          position: relative;
        }

        /* Glass Pill Navigation */
        .vaidyaq-pill-nav {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 3rem);
          max-width: 1100px;
          height: 64px;
          border-radius: 9999px;
          background: rgba(250, 251, 253, 0.7);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(11, 18, 32, 0.06);
          box-shadow: 0 10px 30px -10px rgba(11, 18, 32, 0.04);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.75rem;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vaidyaq-pill-nav.scrolled {
          top: 1rem;
          max-width: 840px;
          height: 54px;
          background: rgba(250, 251, 253, 0.85);
          border: 1px solid rgba(11, 18, 32, 0.1);
          box-shadow: 0 20px 40px -15px rgba(11, 18, 32, 0.08);
          padding: 0 1.25rem;
        }

        .vaidyaq-nav-links {
          display: flex;
          align-items: center;
          gap: 1.75rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (max-width: 768px) {
          .vaidyaq-nav-links { display: none; }
        }

        .vaidyaq-nav-link {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(11, 18, 32, 0.65);
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .vaidyaq-nav-link:hover, .vaidyaq-nav-link.active {
          color: var(--primary);
        }

        /* Responsive Ring Container */
        .readiness-ring-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 320px;
          height: 320px;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .readiness-ring-wrapper.docked {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 140px;
          height: 140px;
          transform: scale(0.7);
          transform-origin: bottom right;
          z-index: 9999;
          background: rgba(250, 251, 253, 0.85);
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 24px;
          box-shadow: 0 20px 45px rgba(11, 18, 32, 0.12);
          backdrop-filter: blur(16px);
          padding: 8px;
        }

        /* Ambient Glow Mesh */
        .ambient-mesh {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.08;
          background: radial-gradient(circle at 10% 20%, var(--primary) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, var(--signal-teal) 0%, transparent 40%),
                      radial-gradient(circle at 50% 50%, #7c8cf8 0%, transparent 50%);
          filter: blur(80px);
          animation: pulseGlow 15s infinite alternate ease-in-out;
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.06; }
          100% { transform: scale(1.1); opacity: 0.1; }
        }

        /* Orbiting micro-chips */
        .orbit-container {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: orbitRotate 45s linear infinite;
        }
        .readiness-ring-wrapper.docked .orbit-container {
          display: none;
        }
        @keyframes orbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .orbiting-chip {
          position: absolute;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--primary);
          background: rgba(250, 251, 253, 0.95);
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 999px;
          padding: 0.2rem 0.5rem;
          box-shadow: 0 4px 10px rgba(11, 18, 32, 0.03);
          animation: counterRotate 45s linear infinite;
        }
        @keyframes counterRotate {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Keynote styling */
        .landing-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .landing-title {
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--ink);
          line-height: 1.05;
        }
        .landing-subtitle {
          font-family: var(--font-body);
          font-size: 1.15rem;
          line-height: 1.6;
          color: rgba(11, 18, 32, 0.7);
        }

        /* Tonal elevation Cards */
        .tonal-card {
          background-color: #ffffff;
          border: 1px solid rgba(11, 18, 32, 0.05);
          border-radius: 24px;
          padding: 2.25rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tonal-card:hover {
          transform: translateY(-4px);
          border-color: rgba(14, 95, 216, 0.15);
          box-shadow: 0 20px 40px -15px rgba(11, 18, 32, 0.05);
        }

        /* Problem Section Strikethrough */
        .problem-row {
          opacity: 0.3;
          transform: translateY(12px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .problem-row.active {
          opacity: 1;
          transform: translateY(0);
        }
        .strikethrough-line {
          position: relative;
          display: inline-block;
        }
        .strikethrough-line::after {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 0;
          height: 2px;
          background: #ef4444;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .problem-row.active .strikethrough-line::after {
          width: 100%;
        }

        /* Browser Mock UI */
        .browser-mock {
          border-radius: 16px;
          border: 1px solid rgba(11, 18, 32, 0.1);
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 30px 60px -20px rgba(11, 18, 32, 0.1);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Micro-illustrations */
        .micro-ill-pageflip {
          width: 28px;
          height: 36px;
          border: 2px solid var(--primary);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        .micro-ill-pageflip::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: var(--surface);
          border-left: 2px solid var(--primary);
          border-bottom: 2px solid var(--primary);
          transition: transform 0.3s ease;
        }
        .tonal-card:hover .micro-ill-pageflip::after {
          transform: translate(-2px, 2px) scale(0.8);
        }

        .micro-ill-loop {
          width: 32px;
          height: 32px;
          border: 2.5px solid var(--signal-teal);
          border-radius: 50%;
          position: relative;
        }
        .micro-ill-loop::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 14px;
          font-weight: bold;
          color: var(--signal-teal);
          opacity: 0.3;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .tonal-card:hover .micro-ill-loop::after {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.1);
        }

        /* Animations */
        .hero-video-fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Navigation Header */}
      <header className={`vaidyaq-pill-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo cursor-pointer" onClick={() => navigateToTab('home')} style={{ display: 'flex', alignItems: 'center' }}>
          <VaidyaQLogo size={24} showText={true} showSlogan={false} />
        </div>

        <ul className="vaidyaq-nav-links">
          <li>
            <button 
              onClick={() => navigateToTab('home')} 
              className={`vaidyaq-nav-link ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToTab('solutions')} 
              className={`vaidyaq-nav-link ${activeTab === 'solutions' ? 'active' : ''}`}
            >
              Modules
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToTab('pricing')} 
              className={`vaidyaq-nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
            >
              Pricing
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToTab('book-demo')} 
              className={`vaidyaq-nav-link ${activeTab === 'book-demo' ? 'active' : ''}`}
            >
              Book Demo
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToTab('contact')} 
              className={`vaidyaq-nav-link ${activeTab === 'contact' ? 'active' : ''}`}
            >
              Contact
            </button>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="flex align-center gap-2">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ 
              padding: '0.35rem', 
              border: '1px solid rgba(11, 18, 32, 0.08)', 
              borderRadius: '50%', 
              color: 'var(--primary)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(250, 251, 253, 0.5)'
            }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={() => navigateToTab('login')} 
            className="vaidyaq-nav-link" 
            style={{ 
              fontSize: '0.85rem', 
              fontWeight: 500, 
              padding: '0.4rem 0.8rem',
              display: 'inline-block'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => navigateToTab('book-demo')} 
            className="btn btn-primary" 
            style={{ 
              padding: isScrolled ? '0.4rem 1rem' : '0.5rem 1.25rem', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              borderRadius: '9999px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              transition: 'all 0.3s ease'
            }}
          >
            Book Demo
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'none', // Managed in responsive media queries
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-menu glassmorphic-menu" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.75rem',
            background: 'rgba(250, 251, 253, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(11, 18, 32, 0.1)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(11,18,32,0.1)',
            zIndex: 9999
          }}>
            <ul className="mobile-nav-links" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><button onClick={() => { navigateToTab('home'); setMobileMenuOpen(false); }} className="vaidyaq-nav-link" style={{ fontSize: '1rem', width: '100%', textAlign: 'left' }}>Home</button></li>
              <li><button onClick={() => { navigateToTab('solutions'); setMobileMenuOpen(false); }} className="vaidyaq-nav-link" style={{ fontSize: '1rem', width: '100%', textAlign: 'left' }}>Modules</button></li>
              <li><button onClick={() => { navigateToTab('pricing'); setMobileMenuOpen(false); }} className="vaidyaq-nav-link" style={{ fontSize: '1rem', width: '100%', textAlign: 'left' }}>Pricing Plans</button></li>
              <li><button onClick={() => { navigateToTab('book-demo'); setMobileMenuOpen(false); }} className="vaidyaq-nav-link" style={{ fontSize: '1rem', width: '100%', textAlign: 'left' }}>Book Demo</button></li>
              <li><button onClick={() => { navigateToTab('contact'); setMobileMenuOpen(false); }} className="vaidyaq-nav-link" style={{ fontSize: '1rem', width: '100%', textAlign: 'left' }}>Contact Us</button></li>
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid rgba(11,18,32,0.08)', paddingTop: '1.25rem' }}>
              <button onClick={() => { navigateToTab('login'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ padding: '0.75rem', width: '100%', borderRadius: '12px' }}>
                Sign In
              </button>
              <button onClick={() => { navigateToTab('book-demo'); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ padding: '0.75rem', width: '100%', borderRadius: '12px', backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                Book Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page View Controller */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="vaidyaq-landing-body">
            {/* Ambient background mesh */}
            <div className="ambient-mesh" />

            {/* Floating corner readiness ring */}
            <AuditReadinessRing completion={ringCompletion} docked={ringCompletion.docked} />

            {/* 1. HERO SECTION */}
            <section style={{ padding: '8rem 0 6rem 0', position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
              <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }}>
                <div style={{ zIndex: 10 }}>
                  <div className="landing-eyebrow">Hospital Quality OS • NABH 5th & 6th Ed • JCI</div>
                  <h1 className="landing-title" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)', marginBottom: '1.5rem', fontWeight: 800 }}>
                    Audit-ready.<br />Every single day.
                  </h1>
                  <p className="landing-subtitle" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '580px', color: 'rgba(11,18,32,0.65)' }}>
                    VaidyaQ runs your entire quality program — documents, audits, CAPAs, incidents, and indicators — so accreditation day is just another Tuesday.
                  </p>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => navigateToTab('book-demo')} 
                      className="btn btn-primary" 
                      style={{ 
                        padding: '0.95rem 2.25rem', 
                        fontSize: '0.95rem', 
                        fontWeight: 700, 
                        borderRadius: '9999px',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(14, 95, 216, 0.22)',
                        cursor: 'pointer'
                      }}
                    >
                      Book a Demo
                    </button>
                    <button 
                      onClick={() => navigateToTab('solutions')} 
                      className="btn btn-secondary" 
                      style={{ 
                        padding: '0.95rem 2.25rem', 
                        fontSize: '0.95rem', 
                        fontWeight: 700, 
                        borderRadius: '9999px',
                        border: '1px solid rgba(11, 18, 32, 0.15)',
                        backgroundColor: 'transparent',
                        color: 'var(--ink)',
                        cursor: 'pointer'
                      }}
                    >
                      Watch 2-min tour
                    </button>
                  </div>
                </div>

                {/* Right: Hero Activity Ring */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '320px' }}>
                  {!ringCompletion.docked && (
                    <AuditReadinessRing completion={ringCompletion} docked={false} />
                  )}
                </div>
              </div>
            </section>

            {/* Trust Marquee */}
            <div style={{ borderTop: '1px solid rgba(11,18,32,0.06)', borderBottom: '1px solid rgba(11,18,32,0.06)', padding: '1.25rem 0', background: 'rgba(250,251,253,0.5)' }}>
              <div className="container flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(11,18,32,0.45)', letterSpacing: '0.05em' }}>
                <span>✓ NABH 6TH EDITION COMPLIANCE MAPPED</span>
                <span>✓ DPDP ACT COMPLIANT SANDBOX</span>
                <span>✓ ENGINEERED FOR INDIAN ACCREDITATION</span>
              </div>
            </div>

            {/* 2. THE PROBLEM — Cinematic Contrast (Dark Section) */}
            <section style={{ background: 'var(--ink)', color: '#ffffff', padding: '7rem 0', position: 'relative' }}>
              <div className="container" style={{ maxWidth: '960px' }}>
                <div className="landing-eyebrow" style={{ color: 'var(--signal-teal)' }}>The Accreditation Crisis</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '4.5rem', color: '#ffffff' }}>
                  Accreditation prep shouldn't be a 6-month fire drill.
                </h2>

                <div className="flex flex-col gap-3">
                  <div className={`problem-row flex justify-between align-center ${activeSection !== 'hero' ? 'active' : ''}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2rem' }}>
                    <span className="strikethrough-line" style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.45)' }}>Chasing signatures via WhatsApp and paper binders</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--signal-teal)', fontWeight: 700 }}>[VAIDYAQ] Local document encryption & revisions</span>
                  </div>
                  <div className={`problem-row flex justify-between align-center ${activeSection !== 'hero' && activeSection !== 'problem' ? 'active' : ''}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2rem', paddingTop: '1rem' }}>
                    <span className="strikethrough-line" style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.45)' }}>Last-minute CAPAs formulated after audit failures</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--signal-teal)', fontWeight: 700 }}>[VAIDYAQ] Automated CAPA triggers & assignments</span>
                  </div>
                  <div className={`problem-row flex justify-between align-center ${activeSection !== 'hero' && activeSection !== 'problem' && activeSection !== 'platform' ? 'active' : ''}`} style={{ paddingTop: '1rem' }}>
                    <span className="strikethrough-line" style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.45)' }}>Scattered quality indicator spreadsheets that crash</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--signal-teal)', fontWeight: 700 }}>[VAIDYAQ] Real-time clinical outcome telemetry</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. PLATFORM OVERVIEW — Interactive Keynote Screenshot Mock */}
            <section style={{ padding: '7rem 0', background: 'rgba(250,251,253,0.5)', borderBottom: '1px solid rgba(11,18,32,0.05)' }}>
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
                  <div className="landing-eyebrow">Real-Time Quality Console</div>
                  <h2 className="landing-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}>Accreditation telemetry at a glance</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '0.35fr 0.65fr', gap: '3.5rem', alignItems: 'center' }}>
                  {/* Left Sidebar Selectors */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setActivePlatformTab('dashboard')} 
                      className="tonal-card" 
                      style={{ 
                        textAlign: 'left', 
                        padding: '1.25rem', 
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: activePlatformTab === 'dashboard' ? 'rgba(14, 95, 216, 0.2)' : 'rgba(11,18,32,0.04)',
                        backgroundColor: activePlatformTab === 'dashboard' ? '#ffffff' : 'transparent',
                        boxShadow: activePlatformTab === 'dashboard' ? '0 10px 25px rgba(11,18,32,0.03)' : 'none'
                      }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: 0, color: activePlatformTab === 'dashboard' ? 'var(--primary)' : 'var(--ink)' }}>Executive Dashboard</h4>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)', margin: '4px 0 0 0' }}>Overall hospital compliance grades & outstanding action tasks.</p>
                    </button>
                    <button 
                      onClick={() => setActivePlatformTab('doc-ctrl')} 
                      className="tonal-card" 
                      style={{ 
                        textAlign: 'left', 
                        padding: '1.25rem', 
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: activePlatformTab === 'doc-ctrl' ? 'rgba(14, 95, 216, 0.2)' : 'rgba(11,18,32,0.04)',
                        backgroundColor: activePlatformTab === 'doc-ctrl' ? '#ffffff' : 'transparent',
                        boxShadow: activePlatformTab === 'doc-ctrl' ? '0 10px 25px rgba(11,18,32,0.03)' : 'none'
                      }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: 0, color: activePlatformTab === 'doc-ctrl' ? 'var(--primary)' : 'var(--ink)' }}>Document Control</h4>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)', margin: '4px 0 0 0' }}>SOP management, digital signatures, and revision history logs.</p>
                    </button>
                    <button 
                      onClick={() => setActivePlatformTab('capa')} 
                      className="tonal-card" 
                      style={{ 
                        textAlign: 'left', 
                        padding: '1.25rem', 
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: activePlatformTab === 'capa' ? 'rgba(14, 95, 216, 0.2)' : 'rgba(11,18,32,0.04)',
                        backgroundColor: activePlatformTab === 'capa' ? '#ffffff' : 'transparent',
                        boxShadow: activePlatformTab === 'capa' ? '0 10px 25px rgba(11,18,32,0.03)' : 'none'
                      }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: 0, color: activePlatformTab === 'capa' ? 'var(--primary)' : 'var(--ink)' }}>CAPA Engine</h4>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)', margin: '4px 0 0 0' }}>Root cause analysis logs and corrective actions tracking board.</p>
                    </button>
                    <button 
                      onClick={() => setActivePlatformTab('indicators')} 
                      className="tonal-card" 
                      style={{ 
                        textAlign: 'left', 
                        padding: '1.25rem', 
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: activePlatformTab === 'indicators' ? 'rgba(14, 95, 216, 0.2)' : 'rgba(11,18,32,0.04)',
                        backgroundColor: activePlatformTab === 'indicators' ? '#ffffff' : 'transparent',
                        boxShadow: activePlatformTab === 'indicators' ? '0 10px 25px rgba(11,18,32,0.03)' : 'none'
                      }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: 0, color: activePlatformTab === 'indicators' ? 'var(--primary)' : 'var(--ink)' }}>Quality Indicators</h4>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)', margin: '4px 0 0 0' }}>Automatic charts for clinical outcomes, HAI rates, and mortality tracking.</p>
                    </button>
                  </div>

                  {/* Right Viewport Mockups */}
                  <div className="browser-mock">
                    <div style={{ display: 'flex', gap: '6px', background: 'rgba(11,18,32,0.03)', padding: '10px 16px', borderBottom: '1px solid rgba(11,18,32,0.08)', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(11,18,32,0.4)', marginLeft: '12px', letterSpacing: '0.05em' }}>
                        HTTPS://CONSOLE.VAIDYAQ.AI/FACILITY/SARAH-HOSPITAL
                      </span>
                    </div>

                    <div style={{ padding: '1.75rem', minHeight: '340px', background: '#ffffff', color: 'var(--ink)' }}>
                      {activePlatformTab === 'dashboard' && (
                        <div>
                          <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(11,18,32,0.06)', paddingBottom: '1rem' }}>
                            <div>
                              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Fortis Hospital Delhi</h3>
                              <p style={{ fontSize: '0.72rem', color: 'rgba(11,18,32,0.45)', margin: 0, fontFamily: 'var(--font-mono)' }}>IPID: DEL-FHD-2026</p>
                            </div>
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✓ Compliant</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(11,18,32,0.05)' }}>
                              <span style={{ fontSize: '0.7rem', color: 'rgba(11,18,32,0.5)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Readiness Grade</span>
                              <h4 style={{ fontSize: '1.5rem', margin: '4px 0 0 0', color: 'var(--primary)' }}>94.2%</h4>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(11,18,32,0.05)' }}>
                              <span style={{ fontSize: '0.7rem', color: 'rgba(11,18,32,0.5)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Open CAPAs</span>
                              <h4 style={{ fontSize: '1.5rem', margin: '4px 0 0 0', color: 'var(--amber)' }}>3</h4>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(11,18,32,0.05)' }}>
                              <span style={{ fontSize: '0.7rem', color: 'rgba(11,18,32,0.5)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Pending SOPs</span>
                              <h4 style={{ fontSize: '1.5rem', margin: '4px 0 0 0', color: 'var(--ink)' }}>2</h4>
                            </div>
                          </div>

                          <div style={{ background: 'rgba(14,95,216,0.04)', border: '1px solid rgba(14,95,216,0.1)', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span>🛡️</span>
                            <span><strong>Audit Notification:</strong> Continuous validation cycle active. Last system scan completed successfully at 18:30 IST.</span>
                          </div>
                        </div>
                      )}

                      {activePlatformTab === 'doc-ctrl' && (
                        <div>
                          <div className="flex justify-between align-center" style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Approved Document Register</h3>
                            <button className="badge badge-neutral" style={{ border: '1px solid rgba(11,18,32,0.08)' }}>+ Add SOP</button>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between align-center" style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(11,18,32,0.03)' }}>
                              <div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary)' }}>SOP-ICU-04</span>
                                <h4 style={{ fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: 600 }}>Emergency Code Blue Protocol</h4>
                              </div>
                              <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>v2.4 Active</span>
                            </div>
                            <div className="flex justify-between align-center" style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(11,18,32,0.03)' }}>
                              <div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary)' }}>SOP-PHAR-12</span>
                                <h4 style={{ fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: 600 }}>High-Alert Medications Storage & Dispensing</h4>
                              </div>
                              <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>v1.9 Active</span>
                            </div>
                            <div className="flex justify-between align-center" style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(11,18,32,0.03)' }}>
                              <div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary)' }}>SOP-IPD-08</span>
                                <h4 style={{ fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: 600 }}>Patient Triage & Admission Records</h4>
                              </div>
                              <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>In Revision</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activePlatformTab === 'capa' && (
                        <div>
                          <div className="flex justify-between align-center" style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Corrective & Preventive Actions (CAPA)</h3>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(11,18,32,0.45)', fontFamily: 'var(--font-mono)' }}>NABH Chapter 5</span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(11,18,32,0.04)' }}>
                              <div className="flex justify-between align-center" style={{ marginBottom: '4px' }}>
                                <span className="badge badge-danger" style={{ fontSize: '0.55rem' }}>High Risk</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(11,18,32,0.4)' }}>Due in 2 days</span>
                              </div>
                              <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>Procure safety needle canisters for ICU Wing B</h4>
                              <p style={{ fontSize: '0.72rem', color: 'rgba(11,18,32,0.5)', margin: '4px 0 0 0' }}>Assigned: Facilities Manager | Ref: Incident #IR-2231</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(11,18,32,0.04)' }}>
                              <div className="flex justify-between align-center" style={{ marginBottom: '4px' }}>
                                <span className="badge badge-warning" style={{ fontSize: '0.55rem' }}>Medium Risk</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(11,18,32,0.4)' }}>Due in 5 days</span>
                              </div>
                              <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>Conduct BLS training drills for night-shift nurses</h4>
                              <p style={{ fontSize: '0.72rem', color: 'rgba(11,18,32,0.5)', margin: '4px 0 0 0' }}>Assigned: Sister Gracy | Ref: Audit Gap #AUD-91</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activePlatformTab === 'indicators' && (
                        <div>
                          <div className="flex justify-between align-center" style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Quality Telemetry Dashboard</h3>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(11,18,32,0.45)', fontFamily: 'var(--font-mono)' }}>Monthly Metrics</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem' }}>
                            {/* Bar Graphic representation */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(11,18,32,0.7)' }}>
                                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                  <span>Patient Fall Rate (per 1k days)</span>
                                  <strong>0.15</strong>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ width: '15%', height: '100%', background: 'var(--signal-teal)' }} />
                                </div>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(11,18,32,0.7)' }}>
                                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                  <span>Medication Errors</span>
                                  <strong>0.02</strong>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ width: '5%', height: '100%', background: 'var(--signal-teal)' }} />
                                </div>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(11,18,32,0.7)' }}>
                                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                  <span>Surgical Site Infection Rate</span>
                                  <strong>0.08%</strong>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ width: '8%', height: '100%', background: 'var(--signal-teal)' }} />
                                </div>
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(11,18,32,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.65rem', color: 'rgba(11,18,32,0.5)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>HAI Grade</span>
                              <h4 style={{ fontSize: '1.75rem', margin: '2px 0', color: 'var(--signal-teal)' }}>A+</h4>
                              <p style={{ fontSize: '0.65rem', color: 'rgba(11,18,32,0.4)', margin: 0 }}>Complies with JCI chapter 7 guidelines.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. MODULES GRID — Six Cards */}
            <section style={{ padding: '7rem 0', background: '#ffffff' }}>
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
                  <div className="landing-eyebrow">Enterprise Suite</div>
                  <h2 className="landing-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}>Six modules, one source of truth</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="tonal-card flex flex-col gap-3">
                    <div className="flex justify-between align-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(11,18,32,0.4)', fontWeight: 700 }}>DOC-CTRL</span>
                      <div className="micro-ill-pageflip" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0' }}>Document Control</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.5' }}>
                      Collaborate on SOP drafts, request electronic signatures, and enforce automatic version numbering without paperwork overheads.
                    </p>
                  </div>

                  <div className="tonal-card flex flex-col gap-3">
                    <div className="flex justify-between align-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(11,18,32,0.4)', fontWeight: 700 }}>AUD-INT</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <span style={{ width: '6px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }} />
                        <span style={{ width: '6px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }} />
                        <span style={{ width: '6px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0' }}>Internal Audits</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.5' }}>
                      Enforce schedule compliance, auto-generate auditor checklists mapped to NABH criteria, and assign audit non-conformances on-site.
                    </p>
                  </div>

                  <div className="tonal-card flex flex-col gap-3">
                    <div className="flex justify-between align-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(11,18,32,0.4)', fontWeight: 700 }}>CAPA-ENG</span>
                      <div className="micro-ill-loop" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0' }}>CAPA Engine</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.5' }}>
                      Run structured root cause analyses (5-Whys, Fishbone diagrams), set preventive workflows, and verify action plans.
                    </p>
                  </div>

                  <div className="tonal-card flex flex-col gap-3">
                    <div className="flex justify-between align-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(11,18,32,0.4)', fontWeight: 700 }}>INC-REP</span>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '2px solid var(--amber)', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: 'var(--amber)', fontSize: '12px' }}>!</span>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0' }}>Incident Reporting</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.5' }}>
                      Empower field nurses to log needle-sticks, medication errors, and near-misses under 60 seconds with automated escalation paths.
                    </p>
                  </div>

                  <div className="tonal-card flex flex-col gap-3">
                    <div className="flex justify-between align-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(11,18,32,0.4)', fontWeight: 700 }}>QI-TELE</span>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
                        <div style={{ width: '6px', height: '10px', background: 'var(--signal-teal)', borderRadius: '2px' }} />
                        <div style={{ width: '6px', height: '18px', background: 'var(--signal-teal)', borderRadius: '2px' }} />
                        <div style={{ width: '6px', height: '24px', background: 'var(--signal-teal)', borderRadius: '2px' }} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0' }}>Quality Indicators</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.5' }}>
                      Gather clinical indicators, track mortality rates, inpatient days, and generate analytics charts for regulatory audit exports.
                    </p>
                  </div>

                  <div className="tonal-card flex flex-col gap-3">
                    <div className="flex justify-between align-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(11,18,32,0.4)', fontWeight: 700 }}>EVI-VAU</span>
                      <div style={{ width: '28px', height: '24px', border: '2px solid var(--primary)', borderRadius: '4px', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-6px', left: '6px', width: '12px', height: '8px', border: '2px solid var(--primary)', borderBottom: 'none', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0' }}>Evidence Vault</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.5' }}>
                      Upload fire certificates, elevator licenses, pollution checks, and set automated SMS/Email alerts for expiry schedules.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. AI LAYER — "Your Quality Co-pilot" */}
            <section style={{ padding: '7rem 0', background: 'rgba(250,251,253,0.5)', borderTop: '1px solid rgba(11,18,32,0.05)', borderBottom: '1px solid rgba(11,18,32,0.05)' }}>
              <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
                {/* Left: Chat Terminal Simulator */}
                <div style={{ background: 'var(--ink)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyBetween: 'align-center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>CO-PILOT TERM</span>
                  </div>

                  <div style={{ padding: '1.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', minHeight: '280px', display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#cbd5e1' }}>
                    <div>
                      <span style={{ color: 'var(--signal-teal)' }}>user@fortis_quality:~$</span>
                      <span style={{ color: '#ffffff', marginLeft: '6px' }}>Show me all open CAPAs overdue for NABH Chapter 3</span>
                    </div>

                    {typing ? (
                      <div style={{ color: 'rgba(255,255,255,0.4)' }}>Thinking...</div>
                    ) : (
                      <div className="hero-video-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <span style={{ color: 'var(--primary)' }}>[vaidyaq-copilot]:</span>
                          <span style={{ marginLeft: '6px' }}>Searching active compliance database. Found 1 overdue action plan matching Chapter 3 (Care of Patients):</span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                          <div className="flex justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '4px', fontWeight: 'bold', color: '#ffffff' }}>
                            <span>Action Plan</span>
                            <span>Assigned</span>
                          </div>
                          <div className="flex justify-between" style={{ color: '#ef4444' }}>
                            <span>Procure emergency syringes (ICU B)</span>
                            <span>Facilities Mgr</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setTyping(true);
                            setTimeout(() => setTyping(false), 900);
                          }} 
                          style={{
                            alignSelf: 'flex-start',
                            background: 'rgba(14,95,216,0.15)',
                            border: '1px solid var(--primary)',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ↻ Run Live System Diagnostics
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: AI capability features */}
                <div>
                  <div className="landing-eyebrow">Accreditation Intelligence</div>
                  <h2 className="landing-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '1.5rem' }}>Your compliance co-pilot</h2>
                  <p className="landing-subtitle" style={{ fontSize: '1.05rem', color: 'rgba(11,18,32,0.6)', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                    Avoid last-minute panic. VaidyaQ AI monitors data entry streams to predict audit bottlenecks, tag evidence automatically, and alert indicators out of threshold.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="flex align-center gap-3">
                      <span style={{ background: 'rgba(14,95,216,0.06)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Automated Evidence Auto-Tagging</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)' }}>Upload certificates; AI links them directly to corresponding NABH chapters.</p>
                      </div>
                    </div>
                    <div className="flex align-center gap-3" style={{ borderTop: '1px solid rgba(11,18,32,0.04)', paddingTop: '1rem' }}>
                      <span style={{ background: 'rgba(15,181,166,0.06)', color: 'var(--signal-teal)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Compliance Gap Prediction</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)' }}>Flag missing evidence documents weeks before standard audit dates.</p>
                      </div>
                    </div>
                    <div className="flex align-center gap-3" style={{ borderTop: '1px solid rgba(11,18,32,0.04)', paddingTop: '1rem' }}>
                      <span style={{ background: 'rgba(245,165,36,0.06)', color: 'var(--amber)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Indicator Threshold Alerts</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(11,18,32,0.55)' }}>Instantly triggers alerts when incident numbers cross thresholds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* VIDEO WALKTHROUGH SECTION (LOWER PAGE) */}
            <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>SaaS Product Walkthrough</span>
                  <h2>Interactive Demo Walkthrough Video</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Click Play to watch the VaidyaQ AI continuous readiness cycle or click timeline tabs below to jump sections.
                  </p>
                </div>

                {/* Simulated Video Player */}
                <div className="video-player-container">
                  {/* Screen Content Wrapper */}
                  <div className="video-screen">
                    <div className="video-screen-bg" />
                    
                    <div className="video-screen-content">
                      {/* Frame Title Info */}
                      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>VaidyaQ Operating System Walkthrough</span>
                          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginTop: '0.1rem' }}>{videoFrames[videoActiveFrame].title}</h3>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem', color: '#ffffff', background: 'rgba(255,255,255,0.1)' }}>STEP {videoActiveFrame + 1} OF 5</span>
                      </div>

                      {/* Display frame layout */}
                      <div style={{ flex: 1, minHeight: '160px' }}>
                        {videoFrames[videoActiveFrame].render()}
                      </div>

                      {/* Video Caption Subtitle */}
                      <div className="video-caption">
                        💬 {videoFrames[videoActiveFrame].caption}
                      </div>
                    </div>
                  </div>

                  {/* Video Controls Bar */}
                  <div className="video-controls">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => setVideoIsPlaying(!videoIsPlaying)}
                      style={{ color: '#ffffff', padding: '0.25rem', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {videoIsPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    {/* Reset button */}
                    <button
                      onClick={() => { setVideoActiveFrame(0); setVideoIsPlaying(true); }}
                      style={{ color: 'var(--text-tertiary)', padding: '0.25rem', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Restart Demo Video"
                    >
                      <RotateCcw size={16} />
                    </button>

                    {/* Scrubber Bar */}
                    <div
                      className="video-scrubber-bg"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const width = rect.width;
                        const clickPercent = clickX / width;
                        const targetFrame = Math.min(Math.floor(clickPercent * 5), 4);
                        setVideoActiveFrame(targetFrame);
                        logActivity(`Scrubbed demo video to frame: ${targetFrame}`);
                      }}
                    >
                      <div
                        className="video-scrubber-fill"
                        style={{ width: `${(videoActiveFrame + 1) * 20}%` }}
                      />
                    </div>

                    {/* Time Counter */}
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      0:{(videoActiveFrame * 4).toString().padStart(2, '0')} / 0:20
                    </span>

                    {/* Volume Mute */}
                    <button
                      onClick={() => setVideoVolumeMuted(!videoVolumeMuted)}
                      style={{ color: videoVolumeMuted ? 'var(--color-danger)' : '#ffffff', padding: '0.25rem', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Volume2 size={16} />
                    </button>

                    <span className="badge" style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 'bold' }}>HD</span>
                  </div>
                </div>

                {/* Sub-selector timeline buttons */}
                <div className="video-timeline-grid">
                  {videoFrames.map((frame, index) => (
                    <button
                      key={index}
                      onClick={() => { setVideoActiveFrame(index); setVideoIsPlaying(false); }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: videoActiveFrame === index ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: videoActiveFrame === index ? 'var(--primary-light)' : 'var(--bg-secondary)',
                        color: videoActiveFrame === index ? 'var(--primary-hover)' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {index + 1}. {frame.title.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* TRUST TESTIMONIALS RIBBON */}
            <section style={{ padding: '1.5rem 0', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div className="container flex justify-between align-center gap-3" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TRUSTED BY COMPLIANCE TEAMS NATIONWIDE</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>🛡️ Metro Clinical Labs</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>🏥 St. Jude Care Circle</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>🩺 Apex Heart Hospital</span>
              </div>
            </section>

            {/* NABH POLICY COMPLIANCE & LATEST NEWS SEARCH HUB */}
            <section id="compliance-news-hub" style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Real-time Policy Intelligence</span>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>NABH Policy Compliance & Latest News Search Hub</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Explore, query, and search official guidelines and news updates on the 6th Edition standards fetched directly from public portals.
                  </p>
                </div>

                {/* Control panel: Search Box + Fetch button */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Search policies by chapter, code, or keyword (e.g. 6th, ABDM, IPC, restricted)..."
                      value={policySearchQuery}
                      onChange={(e) => setPolicySearchQuery(e.target.value)}
                      style={{ width: '100%', paddingLeft: '1rem', backgroundColor: 'var(--bg-primary)' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFetchUpdates}
                      className="btn btn-primary flex align-center gap-1"
                      disabled={isFetchingUpdates}
                      style={{ cursor: isFetchingUpdates ? 'not-allowed' : 'pointer' }}
                    >
                      {isFetchingUpdates ? (
                        <>
                          <span className="spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '0.25rem' }} />
                          Scanning Portals...
                        </>
                      ) : (
                        <>🔄 Fetch Latest Updates</>
                      )}
                    </button>
                    {policySearchQuery && (
                      <button onClick={() => setPolicySearchQuery('')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Grid: Left is list of matching updates, Right is detailed panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', minHeight: '400px' }}>
                  
                  {/* Left Column: Filtered Policy updates list */}
                  <div className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
                    <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                        UPDATES LOG ({filteredNews.length} FOUND)
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        Last scan: {lastFetchedTime}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {filteredNews.length > 0 ? (
                        filteredNews.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedPolicyNews(item)}
                            className="card cursor-pointer"
                            style={{
                              padding: '1rem',
                              borderLeft: `4px solid ${item.color || 'var(--primary)'}`,
                              backgroundColor: selectedPolicyNews?.id === item.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                              borderColor: selectedPolicyNews?.id === item.id ? 'var(--primary)' : 'var(--border-color)',
                              transition: 'all 0.2s',
                              textAlign: 'left'
                            }}
                          >
                            <div className="flex justify-between" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                              <span>{item.type} • {item.chapter}</span>
                              <span style={{ fontWeight: 800, color: item.impact === 'CRITICAL' ? 'var(--color-danger)' : item.impact === 'HIGH' ? 'var(--color-warning)' : 'var(--text-secondary)', fontSize: '0.65rem' }}>
                                {item.impact} IMPACT
                              </span>
                            </div>
                            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', margin: '0.25rem 0' }}>
                              {item.title}
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.summary}
                            </p>
                            <div className="flex justify-between" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                              <span>Code: <strong>{item.coreOE}</strong></span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="card flex align-center justify-center text-center" style={{ padding: '3rem', backgroundColor: 'var(--bg-secondary)', border: '1.5px dashed var(--border-color)' }}>
                          <div>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: 0 }}>
                              🔍 No policies match your search term. Try searching for "6th", "ABDM", "IPC", "restricted", or "committee".
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Detail Inspector Panel */}
                  <div style={{ textAlign: 'left' }}>
                    {selectedPolicyNews ? (
                      <div className="glow-card" style={{ padding: '1.5rem', border: `1.5px solid ${selectedPolicyNews.color}`, backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: '20px' }}>
                        <div className="flex justify-between" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.65rem' }}>
                            {selectedPolicyNews.type}
                          </span>
                          <span style={{ color: 'var(--text-tertiary)' }}>{selectedPolicyNews.date}</span>
                        </div>
                        
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                          {selectedPolicyNews.title}
                        </h3>
                        
                        <div className="responsive-grid-2" style={{ gap: '0.5rem', fontSize: '0.75rem', margin: '0.75rem 0', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                          <div>Chapter: <strong>{selectedPolicyNews.chapter}</strong></div>
                          <div>Impact: <strong style={{ color: selectedPolicyNews.color }}>{selectedPolicyNews.impact}</strong></div>
                          <div style={{ gridColumn: 'span 2' }}>Objective Element: <strong>{selectedPolicyNews.coreOE}</strong></div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5', margin: '0.75rem 0' }}>
                          {selectedPolicyNews.summary}
                        </p>

                        <div style={{ marginTop: '1rem', borderTop: '1.5px solid var(--border-color)', paddingTop: '1rem' }}>
                          <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                            Compliance Recommendation:
                          </h5>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, fontStyle: 'italic' }}>
                            {selectedPolicyNews.recommendation}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="card flex align-center justify-center text-center" style={{ padding: '3rem', backgroundColor: 'var(--bg-secondary)', border: '1.5px dashed var(--border-color)', height: '100%', minHeight: '350px' }}>
                        <div>
                          <span style={{ fontSize: '2.5rem' }}>📰</span>
                          <h4 style={{ margin: '0.5rem 0', fontWeight: 700 }}>Policy Inspector</h4>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', maxWidth: '240px', margin: '0 auto' }}>
                            Select an update from the log to view the full impact analysis and official compliance recommendation.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </section>

            {/* TESTIMONIALS SLIDER SECTION */}
            <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Accredited Hospital Reviews</span>
                  <h2>What Healthcare Leaders Say</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Read verification cases from Quality Heads, HODs, and Medical Directors.
                  </p>
                </div>

                {/* Testimonial Active Slider Card */}
                <div className="card flex flex-col gap-3" style={{ padding: '2.5rem', position: 'relative', borderLeft: '5px solid var(--primary)', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
                  
                  {/* Stars rating */}
                  <div className="flex gap-1" style={{ color: '#f59e0b' }}>
                    {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                      <Star key={i} size={16} fill="#f59e0b" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p style={{ fontSize: '1.15rem', fontStyle: 'italic', lineHeight: '1.6', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    "{testimonials[activeTestimonial].quote}"
                  </p>

                  {/* Review Profile info */}
                  <div className="flex justify-between align-center" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{testimonials[activeTestimonial].author}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                        {testimonials[activeTestimonial].role} ({testimonials[activeTestimonial].location})
                      </p>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* WHY VAIDYAQ AI? BENEFITS SECTION */}
            <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div className="container" style={{ maxWidth: '1000px', textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Platform Benefits</span>
                  <h2>Why VaidyaQ AI is the Industry Leader</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem', maxWidth: '600px', margin: '0.25rem auto 0 auto' }}>
                    Unlike generic document drives or spreadsheets, VaidyaQ is an integrated, active compliance ecosystem built specifically for NABH guidelines.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>⚡</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>De-risked Preloaded Templates</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Get started in minutes with 7 pre-configured SOPs and policy guidelines mapped exactly to the 6th Edition requirements, complete with dynamic scoring logic.
                    </p>
                  </div>
                  <div className="glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>🔒</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Privacy-First Design</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      All files and credentials are saved locally in your browser sandbox, and you can plug in your own Google Gemini API Key. No patient data ever exits your machine.
                    </p>
                  </div>
                  <div className="glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>🎯</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Closed-loop CAPA Tracking</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Audit findings are instantly mapped to Corrective & Preventive Action (CAPA) sheets. Assign issues to specific heads and monitor overdue items before accreditation inspections.
                    </p>
                  </div>
                  <div className="glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>📈</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Interactive Clinical Dashboard</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Trace patient falls, needle sticks, medication errors, and hospital infections by department and month. Export pivot sheets directly to CSV, PDF, or MS Word.
                    </p>
                  </div>
                  <div className="glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>👩‍⚕️</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Dynamic Bed Pricing</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Pay only for what you use. VaidyaQ automatically scales pricing based on your hospital's bed size—making it affordable for small clinics and comprehensive for enterprise chains.
                    </p>
                  </div>
                  <div className="glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>🎟️</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>7-Day Full Access Trial</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Test the complete software suite free for 7 days. Add your team, upload evidence docs, run fire safety logs, and try the AI features without any initial commitment.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* INTERACTIVE COMPLIANCE ESTIMATOR WIDGET */}
            <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div className="container" style={{ maxWidth: '750px' }}>
                <div className="interactive-tool-box glow-card" style={{ padding: '2rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      <FileSearch size={28} />
                    </div>
                    <h2>Interactive Audit Preparedness Estimator</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Answer 3 questions to estimate your hospital's compliance tier
                    </p>
                  </div>

                  {/* Step Progress */}
                  <div className="flex justify-between" style={{ marginBottom: '2rem', padding: '0 2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: quizStep >= 1 ? 'var(--primary)' : 'var(--text-tertiary)' }}>1. Pharmacy Control</span>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: quizStep >= 2 ? 'var(--primary)' : 'var(--text-tertiary)' }}>2. Training Records</span>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: quizStep >= 3 ? 'var(--primary)' : 'var(--text-tertiary)' }}>3. Regulatory Licenses</span>
                  </div>

                  {/* STEP 1: Q1 */}
                  {quizStep === 1 && (
                    <div className="flex flex-col gap-2">
                      <h4 style={{ marginBottom: '0.5rem' }}>Question 1: Does your pharmacy identify and lock away High-Alert Medications?</h4>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q1: 'yes' }); setQuizStep(2); }} className="quiz-choice-btn">
                        Yes - We have double-signature checks, color codes, and locked cupboards.
                      </button>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q1: 'partial' }); setQuizStep(2); }} className="quiz-choice-btn">
                        Partially - We keep them in pharmacy, but do not double-check or log shift seals.
                      </button>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q1: 'no' }); setQuizStep(2); }} className="quiz-choice-btn">
                        No - They are stored with standard medicines on open shelves.
                      </button>
                    </div>
                  )}

                  {/* STEP 2: Q2 */}
                  {quizStep === 2 && (
                    <div className="flex flex-col gap-2">
                      <h4 style={{ marginBottom: '0.5rem' }}>Question 2: Are your staff training attendance logs digitally archived?</h4>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q2: 'yes' }); setQuizStep(3); }} className="quiz-choice-btn">
                        Yes - All hand hygiene and fire drill certificates are mapped digitally.
                      </button>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q2: 'no' }); setQuizStep(3); }} className="quiz-choice-btn">
                        No - We maintain signatures in paper registers.
                      </button>
                    </div>
                  )}

                  {/* STEP 3: Q3 */}
                  {quizStep === 3 && (
                    <div className="flex flex-col gap-2">
                      <h4 style={{ marginBottom: '0.5rem' }}>Question 3: What is the current status of your Biomedical Waste Authorization?</h4>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q3: 'active' }); setQuizStep(4); }} className="quiz-choice-btn">
                        Active - Validated by the Pollution Control Board.
                      </button>
                      <button onClick={() => { setQuizAnswers({ ...quizAnswers, q3: 'expired' }); setQuizStep(4); }} className="quiz-choice-btn">
                        Expired / Expiring within 30 days.
                      </button>
                    </div>
                  )}

                  {/* STEP 4: Evaluation Result */}
                  {quizStep === 4 && (
                    <div style={{ textAlign: 'center' }} className="flex flex-col gap-3">
                      <span className="badge" style={{ alignSelf: 'center', fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        Preparedness Score: {getQuizResult().pct}%
                      </span>
                      <h3 style={{ fontSize: '1.25rem', color: getQuizResult().color }}>{getQuizResult().grade}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                        {getQuizResult().desc}
                      </p>

                      <div className="flex justify-center gap-2" style={{ marginTop: '1.5rem' }}>
                        <button onClick={() => { setQuizStep(1); setQuizAnswers({ q1: '', q2: '', q3: '' }); }} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                          <RotateCcw size={16} /> Retake Test
                        </button>
                        <button onClick={() => setActiveTab('book-demo')} className="btn btn-primary" style={{ cursor: 'pointer' }}>
                          Request Gap Analysis Demo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
            {/* DIRECT DEMO REQUEST FORM SECTION */}
            <section id="direct-demo-form" style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div className="container" style={{ maxWidth: '650px' }}>
                <div className="glow-card" style={{ padding: '2.5rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      <Calendar size={28} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Ready to Automate Your Accreditation?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      Book a private 15-minute dashboard walk-through with our clinical quality specialists.
                    </p>
                  </div>

                  {demoSubmitted ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{ color: 'var(--color-success)', marginBottom: '1rem' }}><CheckCircle2 size={48} style={{ margin: '0 auto' }} /></div>
                      <h3>Demo Registered Successfully!</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                        We have registered your request for <strong>{demoForm.hospital}</strong>. A quality consultant will contact you at <strong>{demoForm.email}</strong> within 24 hours.
                        {demoForm.coupon === 'NABH5' && (
                          <div style={{ color: 'var(--color-success)', fontWeight: 'bold', marginTop: '0.75rem', backgroundColor: 'var(--bg-success)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block' }}>
                            🎉 Coupon NABH5 registered: Your 5% discount is locked in!
                          </div>
                        )}
                      </p>
                      <button onClick={() => { setDemoSubmitted(false); setDemoForm(prev => ({ ...prev, name: '', email: '', hospital: '', phone: '', coupon: '' })); }} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setDemoSubmitted(true); }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Full Name</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="e.g. Dr. Sarah Paul"
                          value={demoForm.name}
                          onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Hospital Email</label>
                        <input
                          type="email"
                          required
                          className="form-control"
                          placeholder="e.g. quality@hospital.in"
                          value={demoForm.email}
                          onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Hospital Name</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="e.g. City Central Metro Hospital"
                          value={demoForm.hospital}
                          onChange={(e) => setDemoForm({ ...demoForm, hospital: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Phone Number</label>
                        <input
                          type="tel"
                          required
                          className="form-control"
                          placeholder="e.g. +91 88508 22250"
                          value={demoForm.phone}
                          onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Coupon Code (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. NABH5"
                          value={demoForm.coupon}
                          onChange={(e) => setDemoForm({ ...demoForm, coupon: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)', textTransform: 'uppercase' }}
                        />
                        {demoForm.coupon.toUpperCase() === 'NABH5' && (
                          <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={12} /> 5% discount coupon applied successfully!
                          </div>
                        )}
                      </div>
                      <button type="submit" className="btn btn-primary glow-premium" style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' }}>
                        Request Live Demo & Gap Analysis
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>

            {/* ACCREDITATION & QUALITY BLOG SECTION (JUST ABOVE FOOTER) */}
            <section id="compliance-blog" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
              <div className="container" style={{ maxWidth: '960px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Compliance Knowledge Hub</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>NABH 6th Edition Quality Resources</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Stay updated with the latest clinical audit guidelines, medication safety regulations, and digital mapping protocols.
                  </p>
                </div>

                {/* Main Blog cover image & featured post */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', overflow: 'hidden', padding: 0, border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: '320px', position: 'relative' }}>
                    <img src="/compliance_blog_cover.png" alt="Clinical Quality Blog" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="badge badge-success" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.65rem' }}>Featured Publication</span>
                  </div>
                  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
                    <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                      <span>{blogArticles[0].date}</span>
                      <span>{blogArticles[0].readTime}</span>
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: '1.3', marginBottom: '1rem', color: 'var(--primary)' }}>
                      {blogArticles[0].title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      {blogArticles[0].excerpt}
                    </p>
                    <button
                      onClick={() => setSelectedBlogArticle(blogArticles[0])}
                      className="btn btn-primary flex align-center gap-1"
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', alignSelf: 'flex-start', cursor: 'pointer' }}
                    >
                      <BookOpen size={14} /> Read Full Article
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SOLUTIONS VIEW */}
        {activeTab === 'solutions' && (
          <section style={{ padding: '4rem 0' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
              <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '3rem' }}>Solutions Engineered for Healthcare</h2>
              
              <div className="flex flex-col gap-3">
                <div className="card flex gap-3 align-center">
                  <div style={{ color: 'var(--primary)', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                    <Building size={36} />
                  </div>
                  <div>
                    <h3>For Hospital Owners & CEOs</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Get full transparency into your quality risks. See which departments have pending CAPAs, expiring operating licenses, or missing documents, and prevent audit failure or compliance fines.
                    </p>
                  </div>
                </div>

                <div className="card flex gap-3 align-center">
                  <div style={{ color: 'var(--secondary)', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                    <Users size={36} />
                  </div>
                  <div>
                    <h3>For Quality & Accreditation Managers</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Replace slow spreadsheets and binder files. Draft SOPs using AI, automate audit notifications to departments, collect evidence digitally, and compile assessment reports at the click of a button.
                    </p>
                  </div>
                </div>

                <div className="card flex gap-3 align-center">
                  <div style={{ color: '#8b5cf6', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                    <Sparkles size={36} />
                  </div>
                  <div>
                    <h3>For NABH Consultants</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Collaborate with multiple hospital accounts remotely. Oversee gap analysis, check uploaded evidence quality, and approve compliance documents inside a dedicated consultant panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PRICING VIEW */}
        {activeTab === 'pricing' && (
          <section style={{ padding: '4rem 0' }}>
            <div className="container">
              <div className="pricing-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2>Simple, Transparent Bed-Size Pricing</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Adjust the slider below to match your hospital's operational bed strength</p>
              </div>

              <div className="slider-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
                <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700 }}>Hospital Size:</span>
                  <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>{bedSize} Beds</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="350"
                  value={bedSize}
                  onChange={(e) => setBedSize(Number(e.target.value))}
                  className="pricing-slider"
                  style={{ width: '100%' }}
                />
                <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                  <span>5 Beds (Clinics)</span>
                  <span>150 Beds (Mid-size)</span>
                  <span>350+ Beds (Chains)</span>
                </div>
              </div>

              {/* Pricing Display Card */}
              <div className="glow-card pricing-card-responsive" style={{ borderTop: `6px solid ${pricingDetails.color}` }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {pricingDetails.tier}
                </h3>
                <div style={{ margin: '1rem 0' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800 }}>{pricingDetails.price}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}> / year</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                  * All prices exclude standard local taxes. Software updates are included.
                </p>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 700 }}>Plan Includes:</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', padding: 0 }}>
                  {pricingDetails.features.map((feat, idx) => (
                    <li key={idx} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setActiveTab('login'); setIsSignUp(true); }} className="btn btn-primary glow-premium-btn" style={{ width: '100%', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Start 7-Day Free Trial
                </button>
              </div>
            </div>
          </section>
        )}

        {/* BOOK DEMO VIEW */}
        {activeTab === 'book-demo' && (
          <section style={{ padding: '4rem 0' }}>
            <div className="container" style={{ maxWidth: '500px' }}>
              <div className="card">
                <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={24} color="var(--primary)" />
                  <span>Book a Private Demo</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Let our quality specialists show you how VaidyaQ AI helps your clinical team automate audit checklists, log incidents in 60s, and secure files.
                </p>

                {demoSubmitted ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '1rem' }}><CheckCircle2 size={48} style={{ margin: '0 auto' }} /></div>
                    <h3>Demo Registered Successfully!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      We have sent a confirmation email to <strong>{demoForm.email}</strong>. Our quality consultant will contact you within 24 hours.
                      {demoForm.coupon === 'NABH5' && (
                        <div style={{ color: 'var(--color-success)', fontWeight: 'bold', marginTop: '0.75rem', backgroundColor: 'var(--bg-success)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block' }}>
                          🎉 Coupon NABH5 registered: Your 5% discount is locked in!
                        </div>
                      )}
                    </p>
                    <button onClick={() => { setDemoSubmitted(false); setDemoForm({ name: '', email: '', hospital: '', phone: '', coupon: '' }); }} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setDemoSubmitted(true); }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Dr. Sarah Paul"
                        value={demoForm.name}
                        onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hospital Email</label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="e.g. quality@centralhospital.in"
                        value={demoForm.email}
                        onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hospital Name</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. City Central Hospital"
                        value={demoForm.hospital}
                        onChange={(e) => setDemoForm({ ...demoForm, hospital: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="form-control"
                        placeholder="e.g. +91 88508 22250"
                        value={demoForm.phone}
                        onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Coupon Code (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. NABH5"
                        value={demoForm.coupon}
                        onChange={(e) => setDemoForm({ ...demoForm, coupon: e.target.value })}
                        style={{ textTransform: 'uppercase' }}
                      />
                      {demoForm.coupon.toUpperCase() === 'NABH5' && (
                        <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={12} /> 5% discount coupon applied successfully!
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary glow-premium" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      Confirm Demo Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}

        {/* LOGIN PORTAL */}
        {activeTab === 'login' && (
          <div className="login-container" style={{ padding: '3rem 0' }}>
            <div className="login-card">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}><VaidyaQLogo size={40} showText={false} /></div>
                <h2 style={{ marginTop: '0.5rem' }}>{isSignUp ? "Register with VaidyaQ" : "Sign In to VaidyaQ"}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Hospital Accreditation & Quality OS
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.2rem' }}>
                <button 
                  onClick={() => { setIsSignUp(false); setSignInError(false); }}
                  style={{ flex: 1, padding: '0.6rem', border: 'none', background: !isSignUp ? 'var(--primary-light)' : 'transparent', color: !isSignUp ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsSignUp(true)}
                  style={{ flex: 1, padding: '0.6rem', border: 'none', background: isSignUp ? 'var(--primary-light)' : 'transparent', color: isSignUp ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}
                >
                  Sign Up (7-Day Trial)
                </button>
              </div>

              {signInError && (
                <div style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-danger)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  ❌ {typeof signInError === 'string' ? signInError : "No client registered with this email address. Please sign up or try again."}
                </div>
              )}

              {signUpError && (
                <div style={{ backgroundColor: 'var(--bg-danger)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-danger)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  ❌ {signUpError}
                </div>
              )}

              {isSignUp ? (
                /* SIGN UP FORM */
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (signUpForm.password !== signUpForm.confirmPassword) {
                    setSignUpError("Passwords do not match. Please reconfirm your password.");
                    return;
                  }
                  setSignUpError('');
                  signUpClient(signUpForm.email, signUpForm.password, signUpForm.hospitalName, Number(signUpForm.beds));
                }} className="flex flex-col gap-3">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Hospital Name</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Apollo Metro Clinic"
                      value={signUpForm.hospitalName}
                      onChange={(e) => setSignUpForm({ ...signUpForm, hospitalName: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Bed Strength</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-control"
                      placeholder="e.g. 50"
                      value={signUpForm.beds}
                      onChange={(e) => setSignUpForm({ ...signUpForm, beds: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Owner Email ID</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="e.g. director@hospital.org"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        className="form-control"
                        placeholder="••••••••"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(prev => !prev)}
                        style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: '4px' }}
                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                      >
                        {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Confirm Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showSignUpConfirmPassword ? "text" : "password"}
                        required
                        className="form-control"
                        placeholder="••••••••"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpConfirmPassword(prev => !prev)}
                        style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: '4px' }}
                        aria-label={showSignUpConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showSignUpConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary glow-premium" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    Register & Start 7-Day Trial
                  </button>
                </form>
              ) : (
                /* SIGN IN FORM */
                <div>
                  <form onSubmit={handleCustomSignIn} className="flex flex-col gap-3">
                    <div className="form-group" style={{ textAlign: 'left' }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Hospital Email</label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="e.g. director@hospital.org"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          className="form-control"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          style={{ width: '100%', paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(prev => !prev)}
                          style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: '4px' }}
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary animate-fade-in" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      Log In Securely
                    </button>
                  </form>
                </div>
              )}

              {/* Quick Demo Access Section */}
              {!isSignUp && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600 }}>⚡ Quick Demo Access — No password required</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleLogin('Quality Head')}
                      style={{ padding: '0.55rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', textAlign: 'left' }}
                    >
                      🔑 Quality Head — Dr. Sarah Paul (quality.head@hospital.org)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLogin('Super Admin')}
                      style={{ padding: '0.55rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', textAlign: 'left' }}
                    >
                      🔑 COO / Super Admin — Col. Roy (super@vaidyaq.com)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLogin('Auditor')}
                      style={{ padding: '0.55rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', textAlign: 'left' }}
                    >
                      🔑 Internal Auditor — Ramesh Kumar (auditor@hospital.org)
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="button"
                onClick={() => navigateToTab('home')} 
                className="btn btn-secondary" 
                style={{ padding: '0.75rem', width: '100%', marginTop: '1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px' }}
              >
                ← Return to Landing Page
              </button>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY VIEW */}
        {activeTab === 'privacy-policy' && (
          <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-primary)' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
              <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Compliance & Privacy</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Privacy Policy</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  Last updated: June 11, 2026. Learn how VaidyaQ secures your clinical and audit data.
                </p>
              </div>

              <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', lineHeight: '1.6' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>1. Local-First Sandbox & Data Isolation</h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    VaidyaQ operates under a strict client-side database model. All documents, uploaded checklists, CAPA entries, and audit logs are stored exclusively in your browser's local memory (localStorage). We do not transmit clinical records, policies, or staff directories to any remote servers. This guarantees full data sovereignty and zero accidental external data leaks.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>2. ABDM Sandbox Guidelines Compliance</h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    In accordance with the Ayushman Bharat Digital Mission (ABDM) guidelines, compliance monitoring is structured around anonymized indicators. All clinical audits and incident reporting registers strip patients' Personally Identifiable Information (PII) before logging compliance scores.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>3. Data Backups & Portability</h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    You have full control over your data. You can export your evidence records and registers as reports, or wipe the local database entirely by resetting browser cookies or clicking "New Hospital" inside the sandbox.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>4. Security & Encryption Standards</h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    All local data is isolated on your device. Cryptographic SHA-256 signature hashes are generated on-device during document sign-off to ensure version control integrity without exposing passwords or PINs.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ACCESSIBILITY VIEW */}
        {activeTab === 'accessibility' && (
          <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-primary)' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
              <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Inclusivity & Access</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Accessibility Statement</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  VaidyaQ is committed to ensuring digital accessibility for all healthcare professionals.
                </p>
              </div>

              <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', lineHeight: '1.6' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>
                  We continuously improve the user experience of VaidyaQ to satisfy the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards.
                </p>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Accessibility Features Implemented:</h3>
                  <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <li>
                      <strong>Contrast:</strong> Curated high-contrast clinical color palettes tailored for maximum legibility. Full support for dark and light modes.
                    </li>
                    <li>
                      <strong>Typography:</strong> Clear, highly readable font family integrations (Outfit and Inter) with customizable scaling options.
                    </li>
                    <li>
                      <strong>Keyboard Navigation:</strong> Logical tab sequences for forms, modal dialogs, and setup panels.
                    </li>
                    <li>
                      <strong>ARIA Labels:</strong> Distinct ARIA landmarks and description labels for screen readers.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Ongoing Feedback</h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    If you encounter any accessibility barriers while using VaidyaQ, please contact our support team at <a href="mailto:am@sociium.biz" style={{ color: 'var(--primary)' }}>am@sociium.biz</a>. We strive to address compatibility issues promptly.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ALL BLOG ARTICLES VIEW */}
        {activeTab === 'blog' && (
          <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-primary)' }}>
            <div className="container" style={{ maxWidth: '960px' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Publications Directory</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>All Compliance Blog Articles</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  Explore our complete library of articles on NABH 6th Edition guidelines, clinical audit practices, and digital workflows.
                </p>
              </div>
              
              {/* Grid of all articles */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {blogArticles.map(article => (
                  <div key={article.id} className="card flex flex-col justify-between" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'left' }}>
                    <div>
                      <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: '1.3', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                        {article.excerpt}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setSelectedBlogArticle(article)}
                      className="btn btn-secondary flex align-center gap-1"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', alignSelf: 'flex-start', cursor: 'pointer' }}
                    >
                      <BookOpen size={14} /> Read Full Article
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* CONTACT US VIEW */}
      {activeTab === 'contact' && (
        <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-primary)' }}>
          <div className="container" style={{ maxWidth: '960px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Get in Touch</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Contact VaidyaQ</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Have questions about our clinical quality OS? Connect with a specialist today.
              </p>
            </div>

            <div className="contact-grid">
              {/* Left Side: Contact Form Card */}
              <div className="card shadow-lg" style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
                {contactSubmitted ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '1.25rem' }}><CheckCircle2 size={54} style={{ margin: '0 auto' }} /></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Message Sent Successfully!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      Thank Dr./Mr. <strong>{contactForm.name}</strong>. We have received your inquiry regarding <strong>{contactForm.subject}</strong>. A VaidyaQ specialist will reply to you at <strong>{contactForm.email}</strong> within 2 hours.
                    </p>
                    <button onClick={() => { setContactSubmitted(false); setContactForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="btn btn-secondary" style={{ marginTop: '1.5rem', padding: '0.6rem 1.25rem' }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="flex flex-col gap-3">
                    <div className="form-group-split responsive-grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Your Name</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="Dr. Sarah Paul"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Email Address</label>
                        <input
                          type="email"
                          required
                          className="form-control"
                          placeholder="quality@hospital.in"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                    </div>

                    <div className="form-group-split responsive-grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Phone Number (Optional)</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+91 88508 22250"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Subject</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="e.g. Custom Bed Pricing"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Your Message</label>
                      <textarea
                        required
                        rows="5"
                        className="form-control"
                        placeholder="How can our clinical accreditation experts help you?"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        style={{ width: '100%', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary glow-premium" style={{ padding: '0.85rem', fontWeight: 'bold', fontSize: '0.95rem', width: '100%', marginTop: '0.5rem', cursor: 'pointer' }}>
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* Right Side: Office Contact Info Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>Direct Contact Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="flex align-center gap-3">
                      <div style={{ color: 'var(--primary)', padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%', display: 'flex' }}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Email Support</div>
                        <a href="mailto:am@sociium.biz" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700 }}>am@sociium.biz</a>
                      </div>
                    </div>

                    <div className="flex align-center gap-3">
                      <div style={{ color: 'var(--primary)', padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%', display: 'flex' }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Call Helpline</div>
                        <a href="tel:8850822250" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700 }}>+91 88508 22250</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>Response Guarantee</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Our clinical compliance helpdesk is active Monday to Saturday from 9:00 AM to 6:00 PM IST. We guarantee a response to all queries in under 2 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Detail Modal */}
      {selectedBlogArticle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedBlogArticle.title}</h3>
              <button onClick={() => setSelectedBlogArticle(null)} style={{ fontSize: '1.2rem', fontWeight: 700 }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
              <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span>Published: {selectedBlogArticle.date}</span>
                <span>By: {selectedBlogArticle.author}</span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {selectedBlogArticle.content}
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedBlogArticle(null)} className="btn btn-primary">Close Article</button>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* Footer Branding & Links */}
      <footer style={{ padding: '3rem 0', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div className="container footer-grid-layout">
          
          {/* Column 1: Brand & Contact */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <VaidyaQLogo size={24} showText={true} showSlogan={false} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
              The premium digital operating system designed specifically for Indian hospitals seeking NABH 6th Edition compliance and continuous audit readiness.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
              <span className="flex align-center gap-1">
                <Mail size={12} color="var(--primary)" /> 
                <a href="mailto:am@sociium.biz" style={{ color: 'var(--primary)' }}>am@sociium.biz</a>
              </span>
              <span className="flex align-center gap-1">
                <Phone size={12} color="var(--primary)" /> 
                <a href="tel:8850822250" style={{ color: 'var(--primary)' }}>+91 88508 22250</a>
              </span>
            </div>
          </div>

          {/* Column 2: Resources & Support */}
          <div>
            <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Resources & Support
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <button
                  onClick={() => navigateToTab('blog')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}
                >
                  📰 Blog Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('contact')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}
                >
                  📞 Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate */}
          <div>
            <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Legal & Privacy
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <button
                  onClick={() => navigateToTab('privacy-policy')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  🔒 Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('accessibility')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  ♿ Accessibility Statement
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('/platform/dashboard')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-tertiary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', marginTop: '0.5rem', fontStyle: 'italic' }}
                >
                  ⚙️ Platform Admin (Internal)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & branding credit */}
        <div className="container" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.75rem' }}>
          <p>© 2026 VaidyaQ AI Inc. All rights reserved. Built for NABH 6th Edition compliance.</p>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            A <strong style={{ color: 'var(--primary)' }}>Sociium</strong> Product. For details, email us at <a href="mailto:am@sociium.biz" style={{ color: 'var(--primary)' }}>am@sociium.biz</a> or call us at <a href="tel:8850822250" style={{ color: 'var(--primary)' }}>+91 88508 22250</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
