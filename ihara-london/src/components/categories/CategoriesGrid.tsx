'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const categories = [
  {
    id: 1,
    name: 'Collares',
    description: 'Diseños únicos que realzan tu elegancia',
    image: '/images/categories/collares.jpg',
    size: 'large'
  },
  {
    id: 2,
    name: 'Pulseras',
    description: 'El complemento perfecto para tu estilo',
    image: '/images/categories/pulseras.jpg',
    size: 'medium'
  },
  {
    id: 3,
    name: 'Anillos',
    description: 'Detalles que marcan la diferencia',
    image: '/images/categories/anillos.jpg',
    size: 'small'
  },
  {
    id: 4,
    name: 'Aros',
    description: 'Elegancia en cada detalle',
    image: '/images/categories/aros.jpg',
    size: 'medium'
  },
  {
    id: 5,
    name: 'Accesorios',
    description: 'El toque final para tu look',
    image: '/images/categories/accesorios.jpg',
    size: 'large'
  }
]

export default function CategoriesGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-ihara-brown-dark mb-4">
            Nuestras Categorías
          </h2>
          <p className="text-ihara-brown text-lg max-w-2xl mx-auto">
            Explora nuestra colección de accesorios cuidadosamente seleccionados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-lg overflow-hidden shadow-lg ${
                category.size === 'large' 
                  ? 'lg:col-span-2 aspect-[2/1]' 
                  : category.size === 'medium'
                  ? 'aspect-square'
                  : 'aspect-[3/4]'
              }`}
            >
              {/* Fondo temporal hasta que tengamos las imágenes */}
              <div 
                className="absolute inset-0 bg-ihara-brown-light/20 transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${category.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-ihara-brown-dark/90 via-ihara-brown-dark/40 to-transparent" />

              {/* Contenido */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-ihara-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-ihara-white/90 mb-4">
                    {category.description}
                  </p>
                  <Link 
                    href={`/categoria/${category.name.toLowerCase()}`}
                    className="inline-block px-6 py-2 bg-ihara-gold hover:bg-ihara-gold-light text-ihara-brown-dark font-semibold rounded-full transition-colors duration-300"
                  >
                    Explorar
                  </Link>
                </motion.div>
              </div>

              {/* Borde decorativo */}
              <motion.div
                className="absolute inset-0 border-2 border-ihara-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                whileHover={{ scale: 1.05 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
