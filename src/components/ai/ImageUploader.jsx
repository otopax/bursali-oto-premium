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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Hasar Tespiti (Vision AI)</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arızalı Parçanın Fotoğrafı
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

        {previewUrl && (
          <div className="mt-4 flex justify-center">
            <img 
              src={previewUrl} 
              alt="Önizleme" 
              className="max-h-48 rounded border border-gray-200 shadow-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ek Açıklama (Opsiyonel)
          </label>
          <input
            type="text"
            ref={promptInputRef}
            placeholder="Örn: Sağ kapıdaki çizik, Motor bloğundaki yağ kaçağı"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !previewUrl}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isUploading ? 'Yapay Zeka Analiz Ediyor...' : 'Analiz Et'}
        </button>
      </form>
    </div>
  );
}
