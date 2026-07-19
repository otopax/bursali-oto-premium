'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import faultCodesIndex from '../content/fault-codes-index.json';

export default function FaultCodeSearch({ locale }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef(null);

  // Fallback direct array of keys for search
  const availableKeys = Object.keys(faultCodesIndex);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 1) {
      const formattedValue = value.trim().toUpperCase();
      const matched = availableKeys.filter(key => key.includes(formattedValue)).slice(0, 5);
      setSuggestions(matched);
      setIsDropdownOpen(matched.length > 0);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const executeSearch = (searchKey) => {
    setIsDropdownOpen(false);
    const targetSlug = faultCodesIndex[searchKey] || searchKey.replace(/\s+/g, '');
    router.push(`/${locale}/ariza-cozumleri/${targetSlug}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      const formattedQuery = query.trim().toUpperCase();
      executeSearch(formattedQuery);
    }
  };

  return (
    <div ref={wrapperRef} style={{ width: '100%', position: 'relative' }}>
      <form onSubmit={handleSearch} style={{ width: '100%' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if(suggestions.length > 0) setIsDropdownOpen(true); }}
            placeholder="Arıza kodunu girin (Örn: P0420, P0171 BMW)..."
            style={{
              width: '100%',
              padding: '1.5rem 2rem',
              paddingRight: '6rem',
              fontSize: '1.2rem',
              borderRadius: '999px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              background: 'rgba(24, 24, 27, 0.8)',
              color: 'var(--text-light)',
              outline: 'none',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onFocusCapture={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
            onBlurCapture={(e) => {
               // Don't revert border color immediately to allow click on dropdown
               setTimeout(() => { if(e.target) e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'; }, 200);
            }}
          />
          <button 
            type="submit"
            style={{
              position: 'absolute',
              right: '10px',
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              borderRadius: '999px',
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#facc15'}
            onMouseOut={(e) => e.target.style.background = 'var(--accent-gold)'}
          >
            Ara
          </button>
        </div>
      </form>

      {/* Live Search Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          marginTop: '0.5rem',
          background: 'rgba(24, 24, 27, 0.95)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 50,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          {suggestions.map((suggestion, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setQuery(suggestion);
                executeSearch(suggestion);
              }}
              style={{
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-light)',
                transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', marginRight: '8px' }}>🔎</span>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
