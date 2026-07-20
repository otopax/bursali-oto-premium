import { ImageResponse } from 'next/og';
import { articles } from '@/lib/articles';

// export const runtime = 'edge';
export const alt = 'Bursalı Oto Servis Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { slug } = await params;
  
  const article = articles.find(a => a.slug === slug);
  const title = article ? article.title : 'Bursalı Oto Servis Blog';
  const description = article ? article.description : 'Fethiye Oto Servis Uzmanlık Yazıları';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right bottom, #1a1a1a, #09090b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          display: 'flex',
          alignItems: 'center',
          color: '#d4af37',
          fontSize: '32px',
          fontWeight: 'bold',
          letterSpacing: '2px',
        }}>
          BURSALI OTO SERVİS
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: '900',
            color: '#ffffff',
            lineHeight: 1.2,
            textAlign: 'center',
            marginBottom: '20px',
            textWrap: 'balance',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: '32px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
        
        <div style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'calc(100% - 80px)',
          borderTop: '2px solid rgba(212, 175, 55, 0.2)',
          paddingTop: '20px',
          color: '#d4af37',
          fontSize: '24px',
        }}>
          <span>www.bursaliotoservis.com</span>
          <span>Fethiye / Muğla</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
