import { ImageResponse } from 'next/og';
import { getPostData } from '@/lib/blog';

export const runtime = 'edge';
export const alt = 'Bursalı Oto Servis Arıza Kodu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { kod } = await params;
  
  let title = `OBD2 Arıza Kodu: ${kod.toUpperCase()}`;
  let description = 'Profesyonel Çözüm ve Tamir Rehberi';
  
  try {
    const postData = await getPostData('faults', kod);
    if (postData && postData.title) {
      title = postData.title;
      if (postData.description) {
        description = postData.description;
      }
    }
  } catch (error) {
    // If not found, fallback to generic
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right bottom, #111827, #030712)',
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
          color: '#e11d48', // Red for faults
          fontSize: '32px',
          fontWeight: 'bold',
          letterSpacing: '2px',
        }}>
          BURSALI OTO SERVİS
        </div>
        
        <div style={{
          background: 'rgba(225, 29, 72, 0.2)',
          color: '#f43f5e',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '30px',
          letterSpacing: '3px',
        }}>
          ARIZA ÇÖZÜM REHBERİ
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
            color: '#9ca3af',
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
          borderTop: '2px solid rgba(225, 29, 72, 0.3)',
          paddingTop: '20px',
          color: '#e11d48',
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
