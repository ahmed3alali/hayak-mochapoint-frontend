"use client";

import { useRef, useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function ReviewsSection({ reviews = [] }) {
  const scrollRef = useRef(null);
  const { t, lang } = useLanguage();

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let currentIndex = 0;

    const timer = setInterval(() => {
      const cards = scrollContainer.querySelectorAll('.review-card');
      if (cards.length === 0) return;

      currentIndex = (currentIndex + 1) % cards.length;
      const targetCard = cards[currentIndex];

      if (targetCard) {

        const cardOffsetLeft = targetCard.offsetLeft;
        scrollContainer.scrollTo({
          left: cardOffsetLeft,
          behavior: 'smooth'
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-2 bg-[#f5f5f5]">
      <h2 className={`text-xl md:text-2xl font-bold md:font-normal text-[#2d2d2d] mb-5 md:text-center ${lang === 'tr' ? 'text-left' : 'text-right'}`}>{t('customerReviews')}</h2>

      {/* Mobile & Desktop - Horizontal Scroll */}
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide pb-0">
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="review-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 w-[calc(100vw-6rem)] md:min-w-[320px] md:w-auto"
            >
              {/*  Avatar  */}
              <div className="flex items-center justify-between mb-2">
                {/* Avatar + Name */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#3d2817] text-[#D5C69E] flex items-center justify-center font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-[#2d2d2d] text-sm">{review.name}</span>
                </div>

                {/*  Stars */}
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm md:text-base">
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className={`text-[#2d2d2d] text-xs md:text-sm leading-relaxed line-clamp-3 ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
                {lang === 'tr' && review.comment_tr ? review.comment_tr : review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}