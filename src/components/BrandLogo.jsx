'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function BrandLogo({ brand }) {
  const [error, setError] = useState(false);
  const domain = brand.slug.replace('-benz', '') + '.com';

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-dark-800 text-accent-gold font-bold text-xl rounded-full uppercase z-10">
        {brand.name.substring(0, 2)}
      </div>
    );
  }

  return (
    <Image 
      src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`}
      alt={`${brand.name} Logosu`}
      width={48}
      height={48}
      className="object-contain w-full h-full z-10"
      unoptimized
      onError={() => setError(true)}
    />
  );
}
