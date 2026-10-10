'use client'
import Link from 'next/link'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-8xl font-bold text-primary-200 mb-4">404</div>
            <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/" className="btn-primary flex items-center justify-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </Link>
              
              <Link href="/products" className="btn-secondary flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Browse Products</span>
              </Link>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => window.history.back()}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}