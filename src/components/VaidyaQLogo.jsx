import React from 'react';

/**
 * VaidyaQ official vector logo component.
 * Renders the custom compliance checkmark person inside a shield with gradient styling.
 * 
 * @param {Object} props
 * @param {number} props.size - Dimension of the logo mark (width/height)
 * @param {boolean} props.showText - Toggle rendering of the "VaidyaQ" wordmark
 * @param {boolean} props.showSlogan - Toggle rendering of the "Quality. Compliance. Audit Ready." subtitle
 * @param {string} props.textColor - Color of the wordmark (defaults to theme variables)
 * @param {string} props.logoColorStyle - Styling mode: 'standard' (gradients) or 'white' (monochrome white for dark headers)
 */
export default function VaidyaQLogo({ 
  size = 36, 
  showText = true, 
  showSlogan = false, 
  textColor = 'var(--text-primary)',
  logoColorStyle = 'standard'
}) {
  const navyColor = logoColorStyle === 'white' ? '#ffffff' : 'var(--text-primary)';
  const greenColor = '#0d9488';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-body)', verticalAlign: 'middle' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="vaidyaqShieldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="var(--text-primary)" />
          </linearGradient>
          <linearGradient id="vaidyaqGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Shield Outline Outer Ribbon */}
        <path 
          d="M 100,26 C 130,16 155,20 168,34 C 168,96 142,156 100,186 C 58,156 32,96 32,34 C 45,20 70,16 100,26 Z" 
          fill="none" 
          stroke="url(#vaidyaqShieldGrad)" 
          strokeWidth="13" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Left Arm of checkmark/V (Dark Navy/Blue) */}
        <path 
          d="M 68,82 C 73,82 86,102 98,136 C 90,118 80,98 68,88 Z" 
          fill={navyColor} 
        />
        
        {/* Right checkmark vector sweeping up (Green/Teal Gradient) */}
        <path 
          d="M 82,125 C 88,122 93,126 97,133 L 138,70 C 141,65 146,65 149,69 C 151,73 148,80 140,89 L 103,142 C 100,146 95,146 92,141 L 82,125 Z" 
          fill="url(#vaidyaqGreenGrad)" 
        />
        
        {/* Person/Doctor Head Dot at top center */}
        <circle cx="100" cy="58" r="12" fill="#0d9488" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: `${size * 0.55}px`, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            <span style={{ color: navyColor }}>Vaidya</span>
            <span style={{ color: greenColor }}>Q</span>
          </div>
          {showSlogan && (
            <div style={{ fontSize: `${size * 0.17}px`, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', marginTop: '2px', opacity: 0.9 }}>
              Quality. Compliance. Audit Ready.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
