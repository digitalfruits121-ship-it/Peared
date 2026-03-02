import React from 'react';

/**
 * 3D Pear Logo Component
 * Neon AI green themed pear logo for the Pears app
 */
const PearLogo = ({ size = 40, className = '', glow = true }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-60"
          style={{
            background: 'radial-gradient(circle, #39FF14 0%, transparent 70%)',
            transform: 'scale(1.3)'
          }}
        />
      )}
      
      {/* SVG Pear */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        style={{ width: size, height: size }}
      >
        {/* Pear body gradient definitions */}
        <defs>
          {/* Main pear body gradient - 3D effect */}
          <linearGradient id="pearBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7CFF00" />
            <stop offset="30%" stopColor="#39FF14" />
            <stop offset="70%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#00C853" />
          </linearGradient>
          
          {/* Highlight gradient for 3D shine */}
          <linearGradient id="pearHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCFF90" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#B2FF59" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          
          {/* Shadow gradient for depth */}
          <linearGradient id="pearShadow" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1B5E20" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          
          {/* Stem gradient */}
          <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#5D4037" />
          </linearGradient>
          
          {/* Leaf gradient */}
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#76FF03" />
            <stop offset="100%" stopColor="#00E676" />
          </linearGradient>
          
          {/* Neon glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Pear body - main shape */}
        <path
          d="M32 58C42 58 50 48 50 38C50 28 45 22 45 18C45 14 42 8 32 8C22 8 19 14 19 18C19 22 14 28 14 38C14 48 22 58 32 58Z"
          fill="url(#pearBody)"
          filter="url(#neonGlow)"
        />
        
        {/* 3D shadow overlay */}
        <path
          d="M32 58C42 58 50 48 50 38C50 28 45 22 45 18C45 14 42 8 32 8C22 8 19 14 19 18C19 22 14 28 14 38C14 48 22 58 32 58Z"
          fill="url(#pearShadow)"
        />
        
        {/* 3D highlight overlay */}
        <path
          d="M26 52C34 52 40 44 40 36C40 28 36 24 36 21C36 18 34 14 28 14C22 14 20 18 20 21C20 24 17 28 17 36C17 44 20 52 26 52Z"
          fill="url(#pearHighlight)"
        />
        
        {/* Inner shine spot */}
        <ellipse
          cx="24"
          cy="32"
          rx="4"
          ry="6"
          fill="white"
          fillOpacity="0.4"
        />
        
        {/* Stem */}
        <path
          d="M32 8C32 8 33 4 35 3C37 2 38 2 38 3C38 4 36 6 34 7C33 8 32 8 32 8Z"
          fill="url(#stemGradient)"
          stroke="#5D4037"
          strokeWidth="0.5"
        />
        
        {/* Leaf */}
        <path
          d="M36 5C36 5 40 3 44 4C48 5 50 8 49 10C48 12 44 10 40 8C38 7 36 5 36 5Z"
          fill="url(#leafGradient)"
          filter="url(#neonGlow)"
        />
        
        {/* Leaf vein */}
        <path
          d="M38 6C38 6 42 5 46 7"
          stroke="#00C853"
          strokeWidth="0.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default PearLogo;
