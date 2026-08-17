"use client";

import React, { useState, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ImageUploader({ onAnalysisComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const promptInputRef = useRef(null);

  // Canvas API ile Client-Side Sıkıştırma (Railway upload limitini aşmamak için)
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Kalite %70
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Resim yüklenemedi.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Dosya okunamadı.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    try {
      const base64Image = await compressImage(file);
      setPreviewUrl(base64Image);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewUrl) {
      setError('Lütfen önce bir fotoğraf seçin.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const prompt = promptInputRef.current?.value || '';

    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: previewUrl,
          prompt: prompt,
          guestId: localStorage.getItem('guestId') || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      setError(err.message);
      Sentry.captureException(err, { tags: { context: 'vision_upload' } });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>Hasar Tespiti (Vision AI)</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label htmlFor="vehicle-photo-input" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)', fontWeight: '500' }}>
            Arızalı Parçanın Fotoğrafı
          </label>
          <input
            id="vehicle-photo-input"
            aria-label="Arızalı Parçanın Fotoğrafı"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'var(--text-light)',
              cursor: 'pointer'
            }}
          />
        </div>

        {previewUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <img 
              src={previewUrl} 
              alt="Önizleme" 
              style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
            />
          </div>
        )}

        <div>
          <label htmlFor="vehicle-prompt-input" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)', fontWeight: '500' }}>
            Ek Açıklama (Opsiyonel)
          </label>
          <input
            id="vehicle-prompt-input"
            aria-label="Ek Açıklama (Opsiyonel)"
            type="text"
            ref={promptInputRef}
            placeholder="Örn: Sağ kapıdaki çizik, Motor bloğundaki yağ kaçağı"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !previewUrl}
          className="btn btn-gold"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            opacity: (isUploading || !previewUrl) ? 0.6 : 1,
            cursor: (isUploading || !previewUrl) ? 'not-allowed' : 'pointer'
          }}
        >
          {isUploading ? 'Yapay Zeka Analiz Ediyor...' : 'Analiz Et'}
        </button>
      </form>
    </div>
  );
}
