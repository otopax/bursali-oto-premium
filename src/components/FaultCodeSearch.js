'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FaultCodeSearch({ locale }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      const formattedCode = query.trim().toUpperCase().replace(/\s+/g, '');
      router.push(`/${locale}/ariza-cozumleri/${formattedCode}`);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Arıza kodunu girin (Örn: P0171, U0100)..."
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
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
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
  );
}
