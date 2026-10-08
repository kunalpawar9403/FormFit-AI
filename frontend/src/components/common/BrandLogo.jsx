import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';

export function BrandLogo({ size = 32, showText = true, className = '' }) {
  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = !!themeContext?.isDark;
  } catch (e) {
    // Fallback if rendered outside ThemeProvider
  }

  if (!showText) {
    return (
      <Link to="/" className={`inline-flex items-center shrink-0 no-underline ${className}`} title="FormFit AI">
        <img
          src="/assets/logo-mark.png"
          alt="FormFit AI"
          style={{ width: size, height: size }}
          className="object-contain shrink-0 select-none"
        />
      </Link>
    );
  }

  return (
    <Link to="/" className={`inline-flex items-center shrink-0 no-underline ${className}`} title="FormFit AI">
      <img
        src={isDark ? '/assets/logo-dark.png' : '/assets/logo.png'}
        alt="FormFit AI"
        style={{ height: `${size}px` }}
        className="w-auto max-h-9 object-contain select-none"
      />
    </Link>
  );
}
