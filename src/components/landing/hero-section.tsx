'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  title: string;
  subtitle?: string;
}

const defaultSlides: Slide[] = [
  {
    title: 'Premium Roblox Development',
    subtitle: 'Professional gamepasses, assets, and plugins crafted for excellence.',
  },
  {
    title: 'Custom Commissions Available',
    subtitle: 'Tailored solutions for your unique Roblox project needs.',
  },
  {
    title: 'Trusted by the Community',
    subtitle: 'Join hundreds of satisfied developers using our products.',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch('/api/site-config');
        const data = await res.json();
        if (data.announcedProduct) {
          const announcement: Slide = {
            title: `New: ${data.announcedProduct.name}`,
            subtitle: `${data.announcedProduct.description || 'Check out our latest release!'} — R$${data.announcedProduct.price || 0}`,
          };
          setSlides((prev) => [announcement, ...prev]);
          setApiReady(true);
        }
      } catch {
      }
    }
    fetchAnnouncement();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section id="hero-section" className="relative w-full h-screen min-h-[600px] -mt-14 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <video
          src="/Promotional.mp4"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <img src="/logo.png" alt="DT Events" className="size-20 sm:size-24 mx-auto mb-6 drop-shadow-lg" />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {apiReady && currentSlide === 0 && (
              <span className="inline-block mb-3 px-3 py-1 text-xs font-medium uppercase tracking-wider border border-white/30 rounded-full text-white/80">
                Announcement
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                {slide.subtitle}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 hover:text-white border border-white/20"
            onClick={prevSlide}
          >
            <ChevronLeftIcon className="size-5" />
          </Button>

          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 hover:text-white border border-white/20"
            onClick={nextSlide}
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-6 right-6 z-10 text-white/60 hover:text-white hover:bg-white/10 border border-white/20"
        onClick={() => setIsMuted((prev) => !prev)}
      >
        {isMuted ? <SpeakerXMarkIcon className="size-4" /> : <SpeakerWaveIcon className="size-4" />}
      </Button>
    </section>
  );
}
