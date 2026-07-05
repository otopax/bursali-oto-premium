"use client";

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/tracking';

export default function SanalUstaTeaser({ locale }) {
  const t = useTranslations('SanalUstaTeaser');
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Fallback questions if translations are missing
  const questions = [
    t('q1') || "Motor arıza lambası yandı, ne yapmalıyım?",
    t('q2') || "Klima soğutmuyor, sebebi ne olabilir?",
    t('q3') || "Şanzıman vuruntu yapıyor, tehlikeli mi?"
  ];

  // Intersection Observer to start typing only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayText(questions[0]);
      setIsTyping(false);
      return;
    }

    let timeout;
    const currentQ = questions[currentQuestionIndex];

    if (isTyping) {
      if (displayText.length < currentQ.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentQ.slice(0, displayText.length + 1));
        }, 50); // Typing speed
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause at end of sentence
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentQ.slice(0, displayText.length - 1));
        }, 25); // Deleting speed
      } else {
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentQuestionIndex, isVisible]);

  const handleCTA = () => {
    trackEvent('sanal_usta_teaser_tikla', { sayfa: 'anasayfa' });
    router.push(`/${locale}/sanal-usta`);
  };

  return (
    <div ref={containerRef} className="glass-panel" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      border: '1px solid rgba(212, 175, 55, 0.4)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          marginRight: '12px',
          boxShadow: '0 0 10px #10b981',
          animation: 'pulse 2s infinite'
        }}></div>
        <h3 style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: '500' }}>
          Sanal Usta <span style={{ color: '#888', fontSize: '0.9rem' }}>- 7/24 Online AI</span>
        </h3>
      </div>

      {/* Chat Area */}
      <div style={{ padding: '24px 20px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            background: 'var(--accent-gold)',
            color: '#000',
            padding: '12px 18px',
            borderRadius: '16px 16px 0 16px',
            maxWidth: '85%',
            fontSize: '1rem',
            fontWeight: '500',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
          }}>
            {displayText}
            <span style={{ 
              opacity: isTyping ? 1 : 0, 
              animation: 'blink 1s step-end infinite',
              borderRight: '2px solid #000',
              marginLeft: '2px'
            }}></span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px 20px' }}>
        <button 
          onClick={handleCTA}
          className="btn btn-gold"
          style={{ width: '100%', padding: '14px', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          {t('cta') || "Sen de Sor - Ücretsiz"} 🚀
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink { 50% { border-color: transparent; } }
      `}} />
    </div>
  );
}
