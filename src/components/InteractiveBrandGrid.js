'use client';
import { useState } from 'react';
import Image from 'next/image';

const premiumBrands = [
  { id: 'bmw', name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
  { id: 'mercedes', name: 'Mercedes-Benz', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' },
  { id: 'audi', name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
  { id: 'porsche', name: 'Porsche', logo: 'https://upload.wikimedia.org/wikipedia/de/2/2d/Porsche_Wappen.svg' },
  { id: 'volkswagen', name: 'Volkswagen', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg' },
  { id: 'land-rover', name: 'Land Rover', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4a/LandRover.svg' },
  { id: 'volvo', name: 'Volvo', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo-Iron-Mark-Black.svg' },
  { id: 'opel', name: 'Opel', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Opel_logo_2020.svg' }
];

export default function InteractiveBrandGrid({ locale }) {
  const [hoveredBrand, setHoveredBrand] = useState(null);

  return (
    <div className="brand-grid-container" style={{ margin: '3rem 0' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .brand-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
          gap: 1rem;
          margin-top: 2rem;
        }
        @media (min-width: 640px) {
          .brand-grid {
            grid-template-columns: repeat(3, 1fr); /* Tablet: 3 columns */
            gap: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .brand-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* Desktop: Auto fill */
          }
        }
        .brand-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          text-decoration: none;
        }
        .brand-card:hover {
          transform: translateY(-10px);
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 20px 40px -10px rgba(212, 175, 55, 0.2);
        }
        .brand-logo-wrapper {
          position: relative;
          width: 70px;
          height: 70px;
          margin-bottom: 1rem;
          transition: all 0.4s ease;
          /* Filter for Volvo and others that are black, we invert them to whiteish, 
             but we leave BMW/Porsche untouched */
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.1));
        }
        .brand-card[href*="volvo"] .brand-logo-wrapper,
        .brand-card[href*="audi"] .brand-logo-wrapper {
          filter: invert(1) drop-shadow(0 0 5px rgba(255,255,255,0.2));
        }
        .brand-card:hover .brand-logo-wrapper {
          transform: scale(1.15);
          filter: drop-shadow(0 0 15px rgba(255,255,255,0.4));
        }
        .brand-card:hover[href*="volvo"] .brand-logo-wrapper,
        .brand-card:hover[href*="audi"] .brand-logo-wrapper {
          filter: invert(1) drop-shadow(0 0 15px rgba(255,255,255,0.6));
        }
        .brand-name {
          color: #e2e8f0;
          font-weight: 500;
          font-size: 1rem;
          transition: color 0.3s ease;
        }
        .brand-card:hover .brand-name {
          color: #d4af37; /* Gold accent */
        }
      `}} />
      
      <div className="brand-grid">
        {premiumBrands.map((brand) => (
          <a 
            key={brand.id} 
            href={`/${locale}/katalog/${brand.id}`} 
            className="brand-card"
            onMouseEnter={() => setHoveredBrand(brand.id)}
            onMouseLeave={() => setHoveredBrand(null)}
          >
            <div className="brand-logo-wrapper">
              <Image 
                src={brand.logo} 
                alt={`${brand.name} Logo`}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="brand-name">{brand.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
