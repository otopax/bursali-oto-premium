'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LiveSearch({ locale }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Debounced search effect
  useEffect(() => {
    if (query.length < 3) {
      setIsSearching(false);
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.length >= 3 && results.length > 0) {
      router.push(results[0].url);
    }
  };

  return (
    <div className="search-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .search-box {
          position: relative;
          width: 100%;
          border-radius: 50px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          display: flex;
          align-items: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          z-index: 10;
        }
        .search-box:focus-within {
          border-color: rgba(212, 175, 55, 0.6);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
          background: rgba(15, 23, 42, 0.8);
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
          color: white;
          outline: none;
        }
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .search-button {
          background: var(--gold);
          color: #0f172a;
          border: none;
          border-radius: 50px;
          padding: 1rem 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .search-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }
        .search-spinner {
          animation: spin 1s linear infinite;
        }
        .search-dropdown {
          position: absolute;
          top: 80px;
          left: 0;
          width: 100%;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
          backdrop-filter: blur(16px);
          z-index: 5;
          overflow: hidden;
          max-height: 400px;
          overflow-y: auto;
        }
        .search-result-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: block;
          text-decoration: none;
          transition: background 0.2s;
        }
        .search-result-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .search-result-title {
          color: var(--gold);
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.3rem;
        }
        .search-result-desc {
          color: #cbd5e1;
          font-size: 0.9rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

      <form className="search-box" onSubmit={handleSearch}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '1rem' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        
        <input 
          type="text" 
          className="search-input"
          placeholder={locale === 'tr' ? "Arıza kodu (Örn: P0171) veya parça arayın..." : "Search for fault codes or parts..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setShowDropdown(true); }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        
        <button type="submit" className="search-button">
          {isSearching ? (
            <svg className="search-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
          ) : (
            locale === 'tr' ? 'Bul' : 'Search'
          )}
        </button>
      </form>

      {showDropdown && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            results.map((res, idx) => (
              <Link href={res.url} key={idx} className="search-result-item">
                <div className="search-result-title">{res.brand} {res.model} - {res.code}</div>
                <div className="search-result-desc">{res.description}</div>
              </Link>
            ))
          ) : query.length >= 3 && !isSearching ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              {locale === 'tr' ? 'Sonuç bulunamadı. Yapay zekaya sormayı deneyin.' : 'No results found. Try asking the AI.'}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
