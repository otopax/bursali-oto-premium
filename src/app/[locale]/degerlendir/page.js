'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReviewForm() {
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get('wid') || '';
  const tenantId = searchParams.get('tid') || '';

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const submitReview = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId, tenantId, rating, comment })
      });
      const data = await res.json();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setResultMessage(data.message || 'Geri bildiriminiz için teşekkürler.');
      }
    } catch (err) {
      console.error(err);
      setResultMessage('Bir hata oluştu, lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resultMessage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-4xl mb-4">🙏</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Teşekkürler</h1>
          <p className="text-slate-600">{resultMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <img 
          src="/images/logo.png" 
          alt="Bursalı Oto" 
          className="h-16 mx-auto mb-6" 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Hizmetimizi Değerlendirin</h1>
        <p className="text-slate-600 mb-6">
          Servis deneyiminiz bizim için çok değerli. Lütfen aşağıdaki yıldızlardan birine tıklayarak bizi değerlendirin.
        </p>

        <div className="flex justify-center gap-2 mb-6" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`text-5xl transition-colors duration-200 ${
                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-slate-200'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        {rating > 0 && rating <= 3 && (
          <div className="mb-6 text-left transition-all duration-300 ease-in-out">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sizi tam olarak memnun edemediğimiz için üzgünüz. Neyi daha iyi yapabilirdik?
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="4"
              placeholder="Görüşlerinizi bizimle paylaşın..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
        )}

        {rating > 0 && (
          <button
            onClick={submitReview}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-70"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ReviewForm />
    </Suspense>
  );
}
