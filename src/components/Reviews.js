"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setReviews(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}
      
      // Controlled fallback if API credentials/endpoint is offline
      setReviews([
        {
          author_name: "Ergün Baysal",
          profile_photo_url: null,
          rating: 5,
          text: "Almanya'dan Fethiye'ye geldim ve arabam arıza verdi. İbrahim ustaya gittim ve sorunum çözüldü. Gerçek bir usta.",
          relative_time_description: "1 ay önce"
        },
        {
          author_name: "Brian Se",
          profile_photo_url: null,
          rating: 5,
          text: "Volvo'muzla ilgili bize çok yardımcı oldular. Berlin'den sevgilerle...",
          relative_time_description: "2 ay önce"
        },
        {
          author_name: "Hasan CiL",
          profile_photo_url: null,
          rating: 5,
          text: "Mercedes W204 aracımın arızasını titizlikle çözdüler. Fethiye'de güvenilir adres.",
          relative_time_description: "3 ay önce"
        },
        {
          author_name: "Олена (Olena)",
          profile_photo_url: null,
          rating: 5,
          text: "Excellent car service! Quality, speed of repair and great service. Mechanics are true professionals.",
          relative_time_description: "4 ay önce"
        }
      ]);
      setLoading(false);
    }

    fetchReviews();
  }, []);

  const totalReviews = reviews.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, totalReviews));
  };

  const renderStars = (rating) => {
    const stars = Math.min(5, Math.max(1, rating || 5));
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
        Canlı Google müşteri yorumları yükleniyor...
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {reviews.slice(0, visibleCount).map((review, index) => (
          <div key={index} className="review-card" style={{ 
            flex: '1 1 280px',
            maxWidth: '350px',
            padding: '2rem', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <div className="review-stars" style={{ color: 'var(--accent-gold)', letterSpacing: '2px', marginBottom: '1rem' }}>
                {renderStars(review.rating)}
              </div>
              <p style={{ fontStyle: 'italic', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                "{review.text}"
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              {review.profile_photo_url ? (
                <Image src={review.profile_photo_url} alt={review.author_name} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                  {review.author_name ? review.author_name.charAt(0) : 'G'}
                </div>
              )}
              <div>
                <p style={{ color: 'var(--text-light)', fontWeight: 'bold', margin: 0 }}>{review.author_name}</p>
                {review.relative_time_description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{review.relative_time_description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {visibleCount < totalReviews && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleLoadMore} 
            className="btn btn-gold" 
            style={{ padding: '1rem 3rem', fontSize: '1.2rem', cursor: 'pointer', border: 'none', background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold', borderRadius: '8px' }}
          >
            Daha Fazla Yorum Yükle ({totalReviews - visibleCount} Kaldı) ⬇️
          </button>
        </div>
      )}
    </div>
  );
}
