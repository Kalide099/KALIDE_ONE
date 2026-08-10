'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { apiService } from '@/services/api';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  onSuccess?: () => void;
}

export default function ReviewFormModal({ isOpen, onClose, workerId, workerName, onSuccess }: ReviewFormModalProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await apiService.submitReview({
        reviewee: workerId,
        rating,
        comment,
      });

      if (res.success) {
        setComment('');
        setRating(5);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert(res.message || 'Failed to submit review');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">{t.ReviewModal?.title || 'Submit a Review'}</h3>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">For {workerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <span className="text-2xl font-light">×</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
              {t.ReviewModal?.rating || 'Your Rating'}
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all ${rating >= star ? 'text-orange-400 scale-110 drop-shadow-md' : 'text-gray-200 hover:text-orange-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
              {t.ReviewModal?.comment || 'Your Experience'}
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none font-medium"
              placeholder={t.ReviewModal?.placeholder || 'Tell us about the quality of work, professionalism, and overall experience...'}
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
            >
              {t.ReviewModal?.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? '...' : (t.ReviewModal?.submit || 'Publish Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
