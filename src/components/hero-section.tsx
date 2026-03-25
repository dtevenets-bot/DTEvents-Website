"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react"

const VIDEO_ID = "LFbbv8wL00k"

const slides = [
  {
    id: 1,
    title: "Crafting Excellence.",
    subtitle: "Delivering Experiences.",
    description: "Premium product manufacturing and bespoke custom commissions. We transform visions into reality with uncompromising quality.",
    buttonText: "Explore Products",
    buttonHref: "#products",
    secondaryText: "Our Services",
    secondaryHref: "#services",
  },
  {
    id: 2,
    title: "🎉 NEW RELEASE!",
    subtitle: "Pioneer DJM V10 Mixer",
    description: "Professional DJ mixer with premium sound quality and intuitive controls. Now available for 130R$!",
    buttonText: "View Product",
    buttonHref: "#products",
    secondaryText: "All Products",
    secondaryHref: "#products",
  },
  {
    id: 3,
    title: "Custom Commissions.",
    subtitle: "Built For You.",
    description: "Need something unique? We create bespoke fixtures tailored to your exact specifications. Join our Discord to discuss.",
    buttonText: "Request Commission",
    buttonHref: "https://discord.gg/YrsyVzxk8H",
    secondaryText: "Learn More",
    secondaryHref: "#commissions",
  },
  {
    id: 4,
    title: "Flux Kit Ready.",
    subtitle: "Plug & Play.",
    description: "Most of our products work with Flux Kit straight from the box. No extra setup required – just drop and enjoy.",
    buttonText: "Shop Now",
    buttonHref: "#products",
    secondaryText: "Product Hub",
    secondaryHref: "https://www.roblox.com/games/92326562289312/DT-Events-Hub",
  },
]

export function HeroSection() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const sectionRef = React.useRef<HTMLElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)
  const [currentSlide, setCurrentSlide] = React.useState(0)

  // Auto-rotate slides every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle visibility-based playback
  React.useEffect(() => {
    const section = sectionRef.current
    const iframe = iframeRef.current
    if (!section || !iframe) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
          } else {
            iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [isLoaded])

  const toggleMute = () => {
    const iframe = iframeRef.current
    if (!iframe) return
    if (isMuted) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', "*")
    } else {
      iframe.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', "*")
    }
    setIsMuted(!isMuted)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const embedUrl = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1`

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <iframe ref={iframeRef} src={embedUrl} className="absolute top-1/2 left-1/2 min-w-[100vw] min-h-[100vh] w-auto h-auto -translate-x-1/2 -translate-y-1/2 aspect-video" style={{ border: 0 }} allow="autoplay; encrypted-media" allowFullScreen onLoad={() => setIsLoaded(true)} title="DT Events Hero Video" />
        <div className="absolute inset-0 backdrop-blur-[4px] bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {slides[currentSlide].title}
              <br />
              <span className="text-white/80">{slides[currentSlide].subtitle}</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              {slides[currentSlide].description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {slides[currentSlide].buttonHref.startsWith("http") ? (
                <a
                  href={slides[currentSlide].buttonHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-colors duration-300"
                >
                  {slides[currentSlide].buttonText}
                </a>
              ) : (
                <a
                  href={slides[currentSlide].buttonHref}
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector(slides[currentSlide].buttonHref)?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="px-8 py-4 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-colors duration-300"
                >
                  {slides[currentSlide].buttonText}
                </a>
              )}
              {slides[currentSlide].secondaryHref.startsWith("http") ? (
                <a
                  href={slides[currentSlide].secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-black transition-colors duration-300"
                >
                  {slides[currentSlide].secondaryText}
                </a>
              ) : (
                <a
                  href={slides[currentSlide].secondaryHref}
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector(slides[currentSlide].secondaryHref)?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-black transition-colors duration-300"
                >
                  {slides[currentSlide].secondaryText}
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Sound Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-20 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-300"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
      </motion.button>
    </section>
  )
}