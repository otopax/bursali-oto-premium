'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) navLinks.classList.remove('mobile-open');
    }
  }, [pathname]);

  const toggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      if (nextState) navLinks.classList.add('mobile-open');
      else navLinks.classList.remove('mobile-open');
    }
    
    if (nextState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  return (
    <button 
      onClick={toggle} 
      className="hamburger-icon"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
      </svg>
    </button>
  );
}
