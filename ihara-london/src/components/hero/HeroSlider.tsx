'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const slides = [
  {
    id: 1,
    title: 'Colección Elegancia',
    description: 'Descubre nuestra nueva colección de accesorios exclusivos',
    image: '/images/hero/slide1.jpg',
    cta: 'Explorar Colección'
  },
  {
    id: 2,
    title: 'Artesanía Premium',
    description: 'Cada pieza cuenta una historia única',
    image: '/images/hero/slide2.jpg',
    cta: 'Ver Detalles'
  },
  {
    id: 3,
    title: 'Diseños Únicos',
    description: 'Creaciones que reflejan tu estilo personal',
    image: '/images/hero/slide3.jpg',
    cta: 'Descubrir Más'
  }
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative h-[80vh] w-full overflow-hidden bg-ihara-brown-dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Fondo temporal hasta que tengamos las imágenes */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-ihara-brown-dark via-ihara-brown to-ihara-brown-light"
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-ihara-brown-dark/80 via-transparent to-transparent" />

          {/* Contenido */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-ihara-white px-4 max-w-4xl mx-auto">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold mb-4"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl mb-8"
              >
                {slides[currentSlide].description}
              </motion.p>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="px-8 py-3 bg-ihara-gold hover:bg-ihara-gold-light text-ihara-brown-dark font-semibold rounded-full transition-colors duration-300"
              >
                {slides[currentSlide].cta}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index)
              setIsAutoPlaying(false)
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-ihara-gold w-8' 
                : 'bg-ihara-white/50 hover:bg-ihara-white'
            }`}
          />
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ihara-white/10 hover:bg-ihara-white/20 text-ihara-white transition-colors duration-300"
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ihara-white/10 hover:bg-ihara-white/20 text-ihara-white transition-colors duration-300"
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>
    </div>
  )
}
