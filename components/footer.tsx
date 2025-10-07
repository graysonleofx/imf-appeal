import { Shield, FileText, HelpCircle } from "lucide-react"
import React from "react"
import brand from "@/public/brand.png"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3">
            <Image src={brand} alt="Brand Logo" className="h-10 md:h-12 lg:h-14" />
            {/* <span className="text-lg md:text-xl font-light text-white">IMF Grant</span> */}
          </div>

          <nav className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8">
            <a
              href="/policy"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-base">Privacy Policy</span>
            </a>
            <a
              href="/terms"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-base">Terms of Use</span>
            </a>
            <a
              href="/#actions"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-base">Help / Contact</span>
            </a>
          </nav>
        </div>

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm md:text-base">© 2025 Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
