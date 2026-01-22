'use client'

import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  GiftIcon, 
  TruckIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'

const features = [
  {
    id: 1,
    title: 'Diseños Exclusivos',
    description: 'Cada pieza es única y está diseñada con atención al detalle',
    icon: SparklesIcon
  },
  {
    id: 2,
    title: 'Calidad Premium',
    description: 'Utilizamos materiales de la más alta calidad',
    icon: ShieldCheckIcon
  },
  {
    id: 3,
    title: 'Envíos Seguros',
    description: 'Tu pedido llegará perfectamente protegido',
    icon: TruckIcon
  },
  {
    id: 4,
    title: 'Packaging Elegante',
    description: 'Presentación perfecta para regalo o uso personal',
    icon: GiftIcon
  }
]

export default function WhyChooseUs() {
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
            ¿Por qué Elegirnos?
          </h2>
          <p className="text-ihara-brown text-lg max-w-2xl mx-auto">
            Nos destacamos por nuestra dedicación a la excelencia y atención personalizada
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-block p-4 rounded-full bg-ihara-gold/10 mb-4"
              >
                <feature.icon className="w-8 h-8 text-ihara-gold" />
              </motion.div>
              <h3 className="text-xl font-semibold text-ihara-brown-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-ihara-brown">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
