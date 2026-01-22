'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Datos de ejemplo - luego se pueden reemplazar con datos reales de una API o CMS
const featuredProducts = [
  {
    id: 1,
    name: 'Collar Elegance',
    price: 24900,
    description: 'Collar bañado en oro con detalles artesanales',
    image: '/images/products/collar-elegance.jpg',
    category: 'Collares'
  },
  {
    id: 2,
    name: 'Pulsera Infinity',
    price: 18500,
    description: 'Pulsera con diseño entrecruzado y acabado premium',
    image: '/images/products/pulsera-infinity.jpg',
    category: 'Pulseras'
  },
  {
    id: 3,
    name: 'Anillo Aurora',
    price: 15900,
    description: 'Anillo ajustable con piedras naturales',
    image: '/images/products/anillo-aurora.jpg',
    category: 'Anillos'
  },
  {
    id: 4,
    name: 'Aros Luna',
    price: 12900,
    description: 'Aros con diseño de media luna y cristales',
    image: '/images/products/aros-luna.jpg',
    category: 'Aros'
  }
]

export default function FeaturedProducts() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  return (
    <section className="py-16 bg-ihara-beige">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-ihara-brown-dark mb-4">
            Productos Destacados
          </h2>
          <p className="text-ihara-brown text-lg max-w-2xl mx-auto">
            Descubre nuestras piezas más exclusivas, donde la elegancia se encuentra con la artesanía
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-ihara-white shadow-md">
                {/* Placeholder para la imagen - reemplazar con Image cuando tengamos las imágenes */}
                <div className="absolute inset-0 bg-ihara-brown-light/20" />
                
                <motion.div
                  className={`absolute inset-0 bg-ihara-brown-dark/80 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p className="text-ihara-white text-sm mb-4 text-center">
                    {product.description}
                  </p>
                  <button className="px-6 py-2 bg-ihara-gold hover:bg-ihara-gold-light text-ihara-brown-dark font-semibold rounded-full transition-colors duration-300">
                    Ver Detalles
                  </button>
                </motion.div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-ihara-brown-dark font-semibold text-lg group-hover:text-ihara-gold transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-ihara-brown text-sm mb-1">
                  {product.category}
                </p>
                <p className="text-ihara-brown-dark font-bold">
                  ${product.price.toLocaleString('es-AR')}
                </p>
              </div>

              <motion.div
                className="absolute -inset-2 border-2 border-ihara-gold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                animate={hoveredProduct === product.id ? { scale: 1.05 } : { scale: 1 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 bg-ihara-brown-dark text-ihara-white hover:bg-ihara-brown transition-colors duration-300 rounded-full">
            Ver Todos los Productos
          </button>
        </motion.div>
      </div>
    </section>
  )
}
