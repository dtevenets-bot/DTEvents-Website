"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"

const VIDEO_ID = "LFbbv8wL00k"

export function HeroSection() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const sectionRef = React.useRef<HTMLElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)

  // Handle visibility-based playback
  React.useEffect(() => {
    const section = sectionRef.current
    const iframe = iframeRef.current
    if (!section || !iframe) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play video
            iframe.contentWindow?.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              "*"
            )
          } else {
            // Pause video
            iframe.contentWindow?.postMessage(
              '{"event":"command","func":"pauseVideo","args":""}',
              "*"
            )
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [isLoaded])

  // Toggle mute/unmute
  const toggleMute = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    if (isMuted) {
      // Unmute
      iframe.contentWindow?.postMessage(
        '{"event":"command","func":"unMute","args":""}',
        "*"
      )
    } else {
      // Mute
      iframe.contentWindow?.postMessage(
        '{"event":"command","func":"mute","args":""}',
        "*"
      )
    }
    setIsMuted(!isMuted)
  }

  // YouTube embed URL with all required parameters (starts muted for autoplay to work)
  const embedUrl = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1`

  return (
    <section 
      ref={sectionRef}
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute top-1/2 left-1/2 min-w-[100vw] min-h-[100vh] w-auto h-auto -translate-x-1/2 -translate-y-1/2 aspect-video"
          style={{ border: 0 }}
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          title="DT Events Hero Video"
        />
        {/* Lighter Gaussian Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-[4px] bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Crafting Excellence.
          <br />
          <span className="text-white/80">Delivering Experiences.</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Premium product manufacturing and bespoke custom commissions. 
          We transform visions into reality with uncompromising quality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#products"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="px-8 py-4 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-colors duration-300"
          >
            Explore Products
          </a>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="px-8 py-4 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-black transition-colors duration-300"
          >
            Our Services
          </a>
        </motion.div>
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
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </motion.button>
    </section>
  )
}
