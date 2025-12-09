
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6EE7B7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      <g transform="translate(100, 100)" stroke="url(#logoGradient)" strokeWidth="2" fill="none" filter="url(#glow)">
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 22.5})`}>
            <path d="M 0 -90 L 20 -70 L 0 -50" />
            <path d="M 0 -90 L -20 -70 L 0 -50" />
            <path d="M 0 -70 L 10 -65 L 0 -60" />
            <path d="M 0 -70 L -10 -65 L 0 -60" />
          </g>
        ))}
        <circle cx="0" cy="0" r="80" strokeWidth="3" />
      </g>
    </svg>
  );
};

export default Logo;
