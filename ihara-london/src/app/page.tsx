'use client'

import { motion } from 'framer-motion'
import HeroSlider from '@/components/hero/HeroSlider'
import FeaturedProducts from '@/components/products/FeaturedProducts'
import CategoriesGrid from '@/components/categories/CategoriesGrid'
import WhyChooseUs from '@/components/features/WhyChooseUs'

export default function Home() {
  return (
    <div className="w-full">
      <HeroSlider />
      
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="py-16 container mx-auto px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ihara-brown-dark mb-6">
            Bienvenidos a Ihara & London
          </h2>
          <p className="text-ihara-brown text-lg mb-8">
            Descubre nuestra exclusiva colección de accesorios donde cada pieza cuenta una historia única.
            Diseños elegantes que combinan artesanía tradicional con un toque contemporáneo.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-ihara-brown-dark text-ihara-white hover:bg-ihara-brown transition-colors duration-300 rounded-full"
          >
            Explorar Colección
          </motion.button>
        </div>
      </motion.section>

      <FeaturedProducts />
      <CategoriesGrid />
      <WhyChooseUs />
    </div>
  )
}
