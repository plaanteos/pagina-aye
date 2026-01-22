'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBagIcon, Bars3Icon as MenuIcon, XMarkIcon as XIcon, MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const menuItems = [
  { name: 'Inicio', href: '/' },
  { name: 'Collares', href: '/categoria/collares' },
  { name: 'Pulseras', href: '/categoria/pulseras' },
  { name: 'Anillos', href: '/categoria/anillos' },
  { name: 'Aros', href: '/categoria/aros' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-ihara-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="text-2xl font-bold text-ihara-brown-dark hover:text-ihara-gold transition-colors">
              Ihara & London
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={item.href}
                  className="text-ihara-brown hover:text-ihara-gold transition-colors hover-lift"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-ihara-gold/10 rounded-full"
            >
              <SearchIcon className="h-6 w-6 text-ihara-brown-dark" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-ihara-gold/10 rounded-full"
            >
              <ShoppingBagIcon className="h-6 w-6 text-ihara-brown-dark" />
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 hover:bg-ihara-gold/10 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="h-6 w-6 text-ihara-brown-dark" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-ihara-white border-t border-ihara-gold/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-ihara-brown hover:text-ihara-gold hover:bg-ihara-gold/10 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
