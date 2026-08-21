'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function BrandLogo({ brand }) {
  const [error, setError] = useState(false);
  const domain = (brand?.slug || '').replace('-benz', '') + '.com';

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-dark-800 text-accent-gold font-bold text-xl rounded-full uppercase z-10">
        {(brand?.name || 'OT').substring(0, 2)}
      </div>
    );
  }

  return (
    <img 
      src={`https://logo.clearbit.com/${domain}`}
      alt={`${brand.name} Logosu`}
      width={48}
      height={48}
      className="object-contain w-full h-full z-10"
      onError={() => setError(true)}
    />
  );
}
