import React, { useState, useContext, useEffect } from 'react';
import { QualiNABHContext } from '../context/QualiNABHContext';
import VaidyaQLogo from './VaidyaQLogo';
import { 
  Building2, ShieldCheck, ClipboardList, Users2, Sparkles, 
  ArrowRight, ArrowLeft, Check, Plus, Trash2, Calendar, Target,
  RefreshCw, CheckCircle2, AlertTriangle, Play
} from 'lucide-react';

export default function OnboardingWizard() {
  const { 
    setHospitalName, 
    setHospitalBeds, 
    setHospitalTier, 
    setActiveDepts,
    setHospitalMode,
    setOnboardingSteps,
    onboardingStep,
    setOnboardingStep,
    currentUser,
    logActivity,
    clearWorkspaceData,
    theme,
    setCurrentRoute
  } = useContext(QualiNABHContext);

  const isDark = theme === 'dark';
  const pageBg = isDark 
    ? 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)' 
    : 'radial-gradient(ellipse at top, #f8fafc 0%, #cbd5e1 100%)';
  const cardBg = isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff';
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1';
  const cardShadow = isDark 
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)' 
    : '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 0 20px rgba(99, 102, 241, 0.05)';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const textSecColor = isDark ? '#cbd5e1' : '#334155';
  const textMutedColor = isDark ? '#94a3b8' : '#64748b';
  
  // Inputs
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff';
  const inputBorder = isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1';
  const inputColor = isDark ? '#ffffff' : '#0f172a';

  // Select dropdown option styles
  const optionBg = isDark ? '#0f172a' : '#ffffff';
  const optionColor = isDark ? '#ffffff' : '#0f172a';

  // Stepper connection line
  const stepLineBg = isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';
  
  // Exit button
  const exitBtnBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff';
  const exitBtnBorder = isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1';
  const exitBtnColor = isDark ? '#f8fafc' : '#334155';

  // Section Headers background gradient
  const headerGrad = isDark ? 'linear-gradient(135deg, #fff, #cbd5e1)' : 'linear-gradient(135deg, #0f172a, #334155)';

  const step = onboardingStep;
  const setStep = setOnboardingStep;
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'

  // Step 1: Hospital Profile
  const [hName, setHName] = useState('City Central Hospital');
  const [beds, setBeds] = useState(75);
  const [hType, setHType] = useState('Multispecialty');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');

  // Step 2: Accreditation Goal
  const [goalTier, setGoalTier] = useState('Full Accreditation'); // Entry Level, Full, Renewal
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [prevStatus, setPrevStatus] = useState('None'); // None, Entry Level, Full

  // Step 3: Departments
  const defaultDepts = [
    { name: 'ICU', selected: true, head: 'Dr. Ramesh Sharma' },
    { name: 'Pharmacy', selected: true, head: 'Mrs. Priya Nair' },
    { name: 'Emergency', selected: true, head: 'Dr. Anil Gupta' },
    { name: 'OT', selected: true, head: 'Dr. Sunita Patel' },
    { name: 'OPD / Outpatient', selected: true, head: 'Dr. Vivek Roy' },
    { name: 'Housekeeping & Facilities', selected: true, head: 'Mr. Sandeep Patil' },
    { name: 'HR & Staffing', selected: true, head: 'Mrs. Kirti Sen' },
    { name: 'Laboratory', selected: false, head: '' },
    { name: 'Radiology', selected: false, head: '' },
  ];
  const [depts, setDepts] = useState(defaultDepts);
  const [newDeptName, setNewDeptName] = useState('');

  // Step 4: Invite Team
  const [teamInvites, setTeamInvites] = useState([
    { email: 'quality@centralhosp.org', name: 'Dr. Amit Mehta', role: 'Quality Head' },
    { email: 'clinical.head@centralhosp.org', name: 'Dr. Sunita Patel', role: 'Department Head' },
  ]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Department Head');

  // Step 5: AI Baseline Scan
  const [scanning, setScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Initializing AI baseline analysis engine...');
  const [baselineScore, setBaselineScore] = useState(0);

  // Scan steps simulation
  useEffect(() => {
    if (step !== 5) return;
    setScanning(true);
    setScanProgress(0);
    
    const statusMessages = [
      { p: 15, text: 'Mapping active departments to NABH 6th Edition requirements...' },
      { p: 40, text: 'Checking statutory licenses and compliance dates...' },
      { p: 65, text: 'Running pre-gap analysis on SOP Templates...' },
      { p: 85, text: 'Predicting initial audit risk indicators...' },
      { p: 100, text: 'AI Readiness Analysis complete!' }
    ];

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setScanning(false);
          setBaselineScore(14); // starting score (e.g. 14%)
          return 100;
        }
        // Update status text
        const currentMsg = statusMessages.find(m => next <= m.p);
        if (currentMsg) {
          setScanStatusText(currentMsg.text);
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step]);

  const handleNext = () => {
    setDirection('next');
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setDirection('prev');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleToggleDept = (index) => {
    setDepts(prev => prev.map((d, i) => i === index ? { ...d, selected: !d.selected } : d));
  };

  const handleUpdateDeptHead = (index, headName) => {
    setDepts(prev => prev.map((d, i) => i === index ? { ...d, head: headName } : d));
  };

  const handleAddDept = () => {
    if (!newDeptName.trim()) return;
    setDepts(prev => [...prev, { name: newDeptName.trim(), selected: true, head: '' }]);
    setNewDeptName('');
  };

  const handleAddInvite = () => {
    if (!newEmail.trim() || !newName.trim()) return;
    setTeamInvites(prev => [...prev, { email: newEmail.trim(), name: newName.trim(), role: newRole }]);
    setNewEmail('');
    setNewName('');
  };

  const handleRemoveInvite = (idx) => {
    setTeamInvites(prev => prev.filter((_, i) => i !== idx));
  };

  const handleComplete = () => {
    // Commit everything to Context State
    setHospitalName(hName);
    setHospitalBeds(String(beds));
    setHospitalTier(goalTier);
    
    const finalSelectedDepts = depts.filter(d => d.selected).map(d => d.name);
    setActiveDepts(finalSelectedDepts);

    // Initialize workspace data - strictly a clean slate for new signups
    clearWorkspaceData();

    // Set onboarding completed
    setOnboardingSteps({
      identity: true,
      departments: true,
      importTemplates: true,
      firstSop: true
    });

    // Enter Command Center
    setHospitalMode('active');
    setCurrentRoute('/app/dashboard');
    logActivity(`Completed Onboarding for ${hName}. Beds: ${beds}. Accreditation Goal: ${goalTier} (Strict Clean Slate).`);
  };

  // Icon stepper renderer
  const stepsList = [
    { num: 1, label: 'Profile', icon: Building2 },
    { num: 2, label: 'Goal', icon: Target },
    { num: 3, label: 'Depts', icon: ClipboardList },
    { num: 4, label: 'Team', icon: Users2 },
    { num: 5, label: 'Review', icon: ShieldCheck },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      color: textColor,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      overflowX: 'hidden',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      
      {/* Top Header with Brand and Logout */}
      <div style={{
        width: '100%',
        maxWidth: '780px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <VaidyaQLogo size={26} showText={true} showSlogan={false} logoColorStyle={isDark ? "white" : "dark"} />
        </div>
        <button 
          onClick={() => {
            // Log out
            localStorage.removeItem('qn_user');
            window.location.reload();
          }}
          className="btn btn-secondary"
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            borderRadius: '8px',
            backgroundColor: exitBtnBg,
            border: exitBtnBorder,
            color: exitBtnColor,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowLeft size={12} /> Exit Onboarding
        </button>
      </div>

      {/* Container Card */}
      <div className="onboarding-card" style={{
        width: '100%',
        maxWidth: '780px',
        background: cardBg,
        border: cardBorder,
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: cardShadow,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Stepper Progress */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '0 1rem',
          marginBottom: '1rem'
        }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '2rem',
            right: '2rem',
            height: '2px',
            background: stepLineBg,
            zIndex: 1
          }} />
          
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '2rem',
            width: `${((step - 1) / 4) * 90}%`,
            height: '2px',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 0.4s ease',
            zIndex: 1
          }} />

          {stepsList.map(s => {
            const Icon = s.icon;
            const isActive = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 2
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCurrent 
                    ? 'linear-gradient(135deg, var(--primary), var(--secondary))' 
                    : isActive 
                      ? 'var(--primary)' 
                      : (isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9'),
                  border: isCurrent 
                    ? '3px solid rgba(255, 255, 255, 0.2)' 
                    : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1'),
                  color: isActive ? '#fff' : (isDark ? '#64748b' : '#94a3b8'),
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none'
                }}>
                  {isActive && step > s.num ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : isActive ? textSecColor : textMutedColor
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP CONTENT SWITCHER */}
        <div style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* STEP 1: WELCOME & PROFILE */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: textColor }}>
                Setup Hospital Profile
              </h2>
              <p style={{ color: textSecColor, fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                Let's configure VaidyaQ for your hospital. This sets up the correct NABH checklist size and rules.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="flex flex-col gap-1" style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>Hospital / Healthcare Facility Name</label>
                  <input 
                    type="text" 
                    value={hName} 
                    onChange={e => setHName(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: inputBg, border: inputBorder, borderRadius: '10px', color: inputColor, transition: 'all 0.3s ease' }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>Facility Type</label>
                  <select 
                    value={hType} 
                    onChange={e => setHType(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: inputBg, border: inputBorder, borderRadius: '10px', color: inputColor, outline: 'none', transition: 'all 0.3s ease' }}
                  >
                    <option value="Multispecialty" style={{ background: optionBg, color: optionColor }}>Multispecialty Hospital</option>
                    <option value="General" style={{ background: optionBg, color: optionColor }}>General Hospital</option>
                    <option value="Single Specialty" style={{ background: optionBg, color: optionColor }}>Single Specialty Clinic</option>
                    <option value="Super Specialty" style={{ background: optionBg, color: optionColor }}>Super Specialty Institute</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>Beds Count: <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{beds} Beds</strong></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <input 
                      type="range" 
                      min="10" 
                      max="500" 
                      value={beds} 
                      onChange={e => setBeds(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>City</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: inputBg, border: inputBorder, borderRadius: '10px', color: inputColor, transition: 'all 0.3s ease' }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>State</label>
                  <input 
                    type="text" 
                    value={state} 
                    onChange={e => setState(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: inputBg, border: inputBorder, borderRadius: '10px', color: inputColor, transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACCREDITATION GOAL */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: textColor }}>
                Accreditation Goal & Target
              </h2>
              <p style={{ color: textSecColor, fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                Define your accreditation program. VaidyaQ maps chapters based on your target level.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Cards for Goal */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { title: 'Entry Level', desc: 'Pre-Accreditation Entry Level Standards (Less complex)' },
                    { title: 'Full Accreditation', desc: 'Complete NABH 6th Edition Standards (Comprehensive)' },
                    { title: 'Accreditation Renewal', desc: 'Re-assessment cycle preparation & audit history' }
                  ].map(item => (
                    <div 
                      key={item.title}
                      onClick={() => setGoalTier(item.title)}
                      style={{
                        padding: '1.25rem',
                        background: goalTier === item.title ? 'rgba(13, 148, 136, 0.15)' : (isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc'),
                        border: goalTier === item.title ? '2px solid var(--primary)' : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1'),
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        textAlign: 'left'
                      }}
                    >
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 6px 0', color: goalTier === item.title ? 'var(--primary)' : textColor }}>{item.title}</h4>
                      <p style={{ fontSize: '0.7rem', color: textMutedColor, margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>Target Assessment Date</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="date" 
                        value={targetDate} 
                        onChange={e => setTargetDate(e.target.value)}
                        style={{ padding: '0.75rem 1rem', width: '100%', background: inputBg, border: inputBorder, borderRadius: '10px', color: inputColor, outline: 'none', transition: 'all 0.3s ease' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: textSecColor }}>Current Accreditation Status</label>
                    <select 
                      value={prevStatus} 
                      onChange={e => setPrevStatus(e.target.value)}
                      style={{ padding: '0.75rem 1rem', background: inputBg, border: inputBorder, borderRadius: '10px', color: inputColor, outline: 'none', transition: 'all 0.3s ease' }}
                    >
                      <option value="None" style={{ background: optionBg, color: optionColor }}>Not Yet Accredited</option>
                      <option value="Entry Level" style={{ background: optionBg, color: optionColor }}>NABH Entry Level Certified</option>
                      <option value="Full" style={{ background: optionBg, color: optionColor }}>Full Accreditation Active</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: DEPARTMENT SETUP */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: textColor }}>
                Active Departments & Owners
              </h2>
              <p style={{ color: textSecColor, fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Select departments active in your hospital. Assign department heads to delegate checklist ownership.
              </p>

              <div style={{ maxHeight: '230px', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {depts.map((d, idx) => (
                  <div 
                    key={d.name} 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      background: d.selected ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13, 148, 136, 0.05)') : 'transparent',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0', padding: '0.6rem 1rem', borderRadius: '10px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleToggleDept(idx)}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '4px', border: isDark ? '2px solid rgba(255, 255, 255, 0.25)' : '2px solid #94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: d.selected ? 'var(--primary)' : 'transparent',
                        borderColor: d.selected ? 'var(--primary)' : (isDark ? 'rgba(255, 255, 255, 0.25)' : '#94a3b8'),
                      }}>
                        {d.selected && <Check size={14} strokeWidth={3} color="#fff" />}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: d.selected ? textColor : textMutedColor }}>{d.name}</span>
                    </div>

                    {d.selected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: textSecColor }}>Dept Head:</span>
                        <input 
                          type="text" 
                          placeholder="Name of Head"
                          value={d.head}
                          onChange={e => handleUpdateDeptHead(idx, e.target.value)}
                          style={{
                            padding: '4px 8px', fontSize: '12px', background: inputBg,
                            border: inputBorder, borderRadius: '6px', color: inputColor,
                            width: '160px', transition: 'all 0.3s ease'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Dept */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <input 
                  type="text"
                  placeholder="Add custom department..."
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 0.8rem', background: inputBg, border: inputBorder, borderRadius: '8px', color: inputColor, fontSize: '13px', transition: 'all 0.3s ease' }}
                />
                <button 
                  onClick={handleAddDept}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', background: exitBtnBg, border: exitBtnBorder, color: exitBtnColor, transition: 'all 0.3s ease' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INVITE TEAM */}
          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: textColor }}>
                Build Your Quality Team
              </h2>
              <p style={{ color: textSecColor, fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Quality is a collaborative effort. Invite key administrators and heads to VaidyaQ.
              </p>

              {/* Add Team Member Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '8px', marginBottom: '1rem' }}>
                <input 
                  type="email"
                  placeholder="Email Address"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', background: inputBg, border: inputBorder, borderRadius: '8px', color: inputColor, fontSize: '13px', transition: 'all 0.3s ease' }}
                />
                <input 
                  type="text"
                  placeholder="Full Name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', background: inputBg, border: inputBorder, borderRadius: '8px', color: inputColor, fontSize: '13px', transition: 'all 0.3s ease' }}
                />
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', background: inputBg, border: inputBorder, borderRadius: '8px', color: inputColor, fontSize: '13px', outline: 'none', transition: 'all 0.3s ease' }}
                >
                  <option value="Quality Head" style={{ background: optionBg, color: optionColor }}>Quality Head</option>
                  <option value="Department Head" style={{ background: optionBg, color: optionColor }}>Department Head</option>
                  <option value="Consultant" style={{ background: optionBg, color: optionColor }}>Accreditation Consultant</option>
                  <option value="Staff" style={{ background: optionBg, color: optionColor }}>Nursing/Clinical Staff</option>
                </select>
                <button 
                  onClick={handleAddInvite}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: exitBtnBg, border: exitBtnBorder, color: exitBtnColor, transition: 'all 0.3s ease' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Invites List */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teamInvites.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: textMutedColor, fontSize: '13px', border: isDark ? '1px dashed rgba(255, 255, 255, 0.15)' : '1px dashed #cbd5e1', borderRadius: '10px' }}>
                    No pending invitations. Add members above.
                  </div>
                ) : (
                  teamInvites.map((invite, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 1rem', border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1', borderRadius: '8px',
                        background: isDark ? 'rgba(255,255,255,0.01)' : '#f8fafc', transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="flex flex-col" style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{invite.name}</span>
                        <span style={{ fontSize: '11px', color: textSecColor }}>{invite.email}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: textSecColor }}>{invite.role}</span>
                        <button 
                          onClick={() => handleRemoveInvite(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 5: INITIAL SETUP REVIEW */}
          {step === 5 && (
            <div style={{ animation: 'fadeIn 0.4s ease', textAlign: 'left', maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'rgba(13, 148, 136, 0.15)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.5rem auto'
                }}>
                  <ShieldCheck size={40} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', color: textColor }}>Initial Setup Review</h2>
                <p style={{ color: textSecColor, fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Please confirm the initial configurations for <strong>{hName}</strong>. Once approved, your clean-slate workspace will be initialized.
                </p>
              </div>

              {/* Review card */}
              <div style={{
                background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                fontSize: '0.85rem', color: textSecColor
              }}>
                <div style={{ display: 'flex', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <div style={{ width: '150px', fontWeight: 'bold', color: textColor }}>Hospital Name:</div>
                  <div>{hName}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <div style={{ width: '150px', fontWeight: 'bold', color: textColor }}>Bed Capacity:</div>
                  <div>{beds} Beds ({hType})</div>
                </div>
                <div style={{ display: 'flex', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <div style={{ width: '150px', fontWeight: 'bold', color: textColor }}>Location:</div>
                  <div>{city}, {state}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <div style={{ width: '150px', fontWeight: 'bold', color: textColor }}>Accreditation Goal:</div>
                  <div>{goalTier}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <div style={{ width: '150px', fontWeight: 'bold', color: textColor }}>Active Wards:</div>
                  <div style={{ flex: 1 }}>{depts.filter(d => d.selected).map(d => d.name).join(', ') || 'None selected'}</div>
                </div>
                <div style={{ display: 'flex', paddingBottom: '0.25rem' }}>
                  <div style={{ width: '150px', fontWeight: 'bold', color: textColor }}>Invited Team:</div>
                  <div>{teamInvites.length} members registered</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: textMutedColor, marginTop: '1rem', padding: '0 0.5rem' }}>
                <input type="checkbox" defaultChecked required id="certify-check" style={{ marginTop: '2px', cursor: 'pointer' }} />
                <label htmlFor="certify-check" style={{ cursor: 'pointer', lineHeight: 1.4 }}>
                  I certify that the above clinical setup details are correct. Initialize VaidyaQ in clean slate mode (no dummy/mock records will be preloaded).
                </label>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
          paddingTop: '1.5rem',
          marginTop: 'auto',
          transition: 'all 0.3s ease'
        }}>
          {/* Back button */}
          {step > 1 && step < 5 && (
            <button 
              onClick={handleBack}
              className="btn btn-secondary"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.7rem 1.25rem', borderRadius: '10px',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                background: exitBtnBg, border: exitBtnBorder, color: exitBtnColor,
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />

          {/* Next / Complete button */}
          {step < 5 ? (
            <button 
              onClick={handleNext}
              className="btn btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.7rem 1.5rem', borderRadius: '10px',
                cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                border: 'none', boxShadow: 'var(--shadow-glow)'
              }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            !scanning && (
              <button 
                onClick={handleComplete}
                className="btn btn-primary glow-premium"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '0.85rem 2rem', borderRadius: '12px',
                  cursor: 'pointer', fontSize: '15px', fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                  border: 'none', boxShadow: '0 0 25px rgba(16,185,129,0.3)',
                  animation: 'pulse 2s infinite'
                }}
              >
                <Play size={18} fill="#fff" /> Enter Command Center
              </button>
            )
          )}
        </div>

      </div>

      {/* Background spin keyframe style */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
