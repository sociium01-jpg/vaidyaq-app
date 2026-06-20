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
    currentUser,
    logActivity,
    clearWorkspaceData
  } = useContext(QualiNABHContext);

  const [step, setStep] = useState(1);
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
    logActivity(`Completed Onboarding for ${hName}. Beds: ${beds}. Accreditation Goal: ${goalTier} (Strict Clean Slate).`);
  };

  // Icon stepper renderer
  const stepsList = [
    { num: 1, label: 'Profile', icon: Building2 },
    { num: 2, label: 'Goal', icon: Target },
    { num: 3, label: 'Depts', icon: ClipboardList },
    { num: 4, label: 'Team', icon: Users2 },
    { num: 5, label: 'Scan', icon: Sparkles },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)',
      color: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      overflowX: 'hidden'
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
          <VaidyaQLogo size={26} showText={true} showSlogan={false} logoColorStyle="white" />
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
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ArrowLeft size={12} /> Exit Onboarding
        </button>
      </div>

      {/* Container Card */}
      <div className="glassmorphic-card" style={{
        width: '100%',
        maxWidth: '780px',
        background: 'rgba(30, 41, 59, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
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
            background: 'rgba(255,255,255,0.06)',
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
                      : 'var(--bg-tertiary)',
                  border: isCurrent 
                    ? '3px solid rgba(255,255,255,0.2)' 
                    : '1px solid var(--border-color)',
                  color: isActive ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none'
                }}>
                  {isActive && step > s.num ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : isActive ? 'var(--text-primary)' : 'var(--text-tertiary)'
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
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Setup Hospital Profile
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                Let's configure VaidyaQ for your hospital. This sets up the correct NABH checklist size and rules.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="flex flex-col gap-1" style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hospital / Healthcare Facility Name</label>
                  <input 
                    type="text" 
                    value={hName} 
                    onChange={e => setHName(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Facility Type</label>
                  <select 
                    value={hType} 
                    onChange={e => setHType(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Multispecialty">Multispecialty Hospital</option>
                    <option value="General">General Hospital</option>
                    <option value="Single Specialty">Single Specialty Clinic</option>
                    <option value="Super Specialty">Super Specialty Institute</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Beds Count: <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{beds} Beds</strong></label>
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
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>City</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>State</label>
                  <input 
                    type="text" 
                    value={state} 
                    onChange={e => setState(e.target.value)}
                    style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACCREDITATION GOAL */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Accreditation Goal & Target
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
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
                        background: goalTier === item.title ? 'rgba(13, 148, 136, 0.15)' : 'var(--bg-secondary)',
                        border: goalTier === item.title ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        textAlign: 'left'
                      }}
                    >
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 6px 0', color: goalTier === item.title ? 'var(--primary)' : '#fff' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Assessment Date</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="date" 
                        value={targetDate} 
                        onChange={e => setTargetDate(e.target.value)}
                        style={{ padding: '0.75rem 1rem', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Accreditation Status</label>
                    <select 
                      value={prevStatus} 
                      onChange={e => setPrevStatus(e.target.value)}
                      style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                    >
                      <option value="None">Not Yet Accredited</option>
                      <option value="Entry Level">NABH Entry Level Certified</option>
                      <option value="Full">Full Accreditation Active</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: DEPARTMENT SETUP */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Active Departments & Owners
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Select departments active in your hospital. Assign department heads to delegate checklist ownership.
              </p>

              <div style={{ maxHeight: '230px', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {depts.map((d, idx) => (
                  <div 
                    key={d.name} 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      background: d.selected ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: '1px solid var(--border-color)', padding: '0.6rem 1rem', borderRadius: '10px' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleToggleDept(idx)}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: d.selected ? 'var(--primary)' : 'transparent',
                        borderColor: d.selected ? 'var(--primary)' : 'var(--border-color)',
                      }}>
                        {d.selected && <Check size={14} strokeWidth={3} color="#fff" />}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: d.selected ? '#fff' : 'var(--text-tertiary)' }}>{d.name}</span>
                    </div>

                    {d.selected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dept Head:</span>
                        <input 
                          type="text" 
                          placeholder="Name of Head"
                          value={d.head}
                          onChange={e => handleUpdateDeptHead(idx, e.target.value)}
                          style={{
                            padding: '4px 8px', fontSize: '12px', background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff',
                            width: '160px'
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
                  style={{ flex: 1, padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <button 
                  onClick={handleAddDept}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INVITE TEAM */}
          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Build Your Quality Team
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Quality is a collaborative effort. Invite key administrators and heads to VaidyaQ.
              </p>

              {/* Add Team Member Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '8px', marginBottom: '1rem' }}>
                <input 
                  type="email"
                  placeholder="Email Address"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <input 
                  type="text"
                  placeholder="Full Name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  <option value="Quality Head">Quality Head</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Consultant">Accreditation Consultant</option>
                  <option value="Staff">Nursing/Clinical Staff</option>
                </select>
                <button 
                  onClick={handleAddInvite}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Invites List */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teamInvites.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                    No pending invitations. Add members above.
                  </div>
                ) : (
                  teamInvites.map((invite, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div className="flex flex-col" style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{invite.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{invite.email}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{invite.role}</span>
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

          {/* STEP 5: AI BASELINE SCAN */}
          {step === 5 && (
            <div style={{ animation: 'fadeIn 0.4s ease', textAlign: 'center' }}>
              
              {scanning ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem 0' }}>
                  {/* Rotating AI Logo */}
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '4px solid rgba(124, 58, 237, 0.1)',
                      borderTopColor: '#7c3aed',
                      animation: 'spin 1.5s linear infinite'
                    }} />
                    <div style={{
                      position: 'absolute', inset: '10px', borderRadius: '50%',
                      background: 'radial-gradient(circle, #7c3aed 0%, #4f46e5 100%)',
                      display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(124,58,237,0.5)'
                    }}>
                      <Sparkles size={36} color="#fff" />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>AI Compliance Baseline Scanning...</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '400px', margin: '0 auto', minHeight: '36px' }}>
                      "{scanStatusText}"
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', maxWidth: '360px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', transition: 'width 0.1s linear' }} />
                  </div>
                </div>
              ) : (
                <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <CheckCircle2 size={40} />
                  </div>

                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--color-success)' }}>Hospital Scanned Successfully!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.5' }}>
                      VaidyaQ AI has compiled your custom accreditation roadmap. Based on your configuration of <strong>{beds} Beds</strong> and <strong>{depts.filter(d=>d.selected).length} departments</strong>, here is your starting compliance profile.
                    </p>
                  </div>

                  {/* Scoring Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem',
                    width: '100%', maxWidth: '640px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)', borderRadius: '16px',
                    padding: '1.25rem', textAlign: 'left', marginTop: '0.5rem'
                  }}>
                    {/* Score Circle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>{baselineScore}%</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Readiness Score</span>
                    </div>

                    {/* Report Bulletins */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓ Quick Wins:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Pre-mapped licenses loaded (6 statutory documents required).</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>⚠️ Critical Gaps:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>38 core SOP files missing. Chapter COP (Care of Patients) is high risk.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>🤖 Recommended First Step:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Generate clinical SOP template inside the Document Module.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem',
          marginTop: 'auto'
        }}>
          {/* Back button */}
          {step > 1 && step < 5 && (
            <button 
              onClick={handleBack}
              className="btn btn-secondary"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.7rem 1.25rem', borderRadius: '10px',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600
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
