import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { heroSlidesApi } from '@/lib/api';

// Button Component
const Button = ({ className = "", children, ...props }) => {
  return (
    <button className={`inline-flex items-center justify-center transition-colors ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function HeroSlider({ data = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { lang } = useLanguage();

  const slides = data && data.length > 0 ? data : [{
    image_url: 'ASA.webp',
    title: 'Coffee Time',
    subtitle: 'اطلب الآن',
  }];

  // Auto-play: 6 seconds for a more relaxed, premium feel
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return <section className="w-full h-[70vh] md:h-[85vh] bg-[#3d2817] animate-pulse" />;
  }

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] bg-[#1b1b1b] overflow-hidden flex items-center justify-center">
      
      {/* Slides Backgrounds */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Ken Burns subtle zoom effect */}
          <div className={`absolute inset-0 w-full h-full transition-transform duration-[10000ms] ease-out ${
            index === currentSlide ? 'scale-105' : 'scale-100'
          }`}>
            <img
              src={slide.image_url || slide.image}
              alt={slide.title || "Coffee Hero"}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Premium Gradient Overlays */}
          {/* Dark overlay for perfect text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Bottom gradient to seamlessly blend into the next section (bg-[#f5f5f5]) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f5f5f5] via-transparent to-transparent opacity-100"></div>
        </div>
      ))}

      {/* Main Content Area */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col justify-center items-center text-center">
        
        {/* Animated Text Container (Key changes on slide change to re-trigger animations) */}
        <div key={currentSlide} className="flex flex-col items-center gap-4 md:gap-6 mt-12 md:mt-24">
          
          {slides[currentSlide].subtitle && (
             <span className="inline-block text-[#D5C69E] font-medium tracking-wider text-sm md:text-xl uppercase bg-black/30 backdrop-blur-md px-5 py-2 rounded-full border border-[#D5C69E]/30 animate-fade-in-up">
               {lang === 'tr' && slides[currentSlide].subtitle_tr ? slides[currentSlide].subtitle_tr : slides[currentSlide].subtitle}
             </span>
          )}

          {slides[currentSlide].title && (
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] drop-shadow-2xl animate-fade-in-up animation-delay-100">
              {lang === 'tr' && slides[currentSlide].title_tr ? slides[currentSlide].title_tr : slides[currentSlide].title}
            </h1>
          )}

        </div>

      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animation-delay-100 { animation-delay: 150ms; }
        .animation-delay-200 { animation-delay: 300ms; }
        
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation Indicators */}
      <div className="absolute z-30 bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-500 rounded-full h-1.5 ${
              index === currentSlide 
                ? 'w-8 bg-[#D5C69E]' 
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}