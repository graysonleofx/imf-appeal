"use client"

import { Search, Twitter, Facebook, Linkedin, Instagram, Youtube, Mic, Printer, Phone, Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import brand from "@/public/brand.png"
import Image from "next/image"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className=" top-0 z-50 bg-white shadow-sm">
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Twitter className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer" />
              <Facebook className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer" />
              <Linkedin className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer hidden sm:block" />
              <Instagram className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer hidden sm:block" />
              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">@</span>
              </div>
              <Youtube className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer hidden md:block" />
              <Mic className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer hidden md:block" />
              <Printer className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer hidden md:block" />
              <Phone className="h-4 w-4 text-primary hover:text-primary/80 cursor-pointer hidden md:block" />
              <div className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold rounded">IMF GRANT LIVE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="flex-1 hidden md:block"></div>

          <div className="flex flex-col items-center space-y-2 md:space-y-4">
            <Image src={brand} alt="Brand Logo" className="h-12 md:h-16 lg:h-20" />

            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary tracking-wide text-center">
              INTERNATIONAL MONETARY FUND GRANT PROGRAM
            </h1>
          </div>

          <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
            <div className="relative w-full max-w-sm md:max-w-none md:w-64">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <nav className="border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between md:justify-center py-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center space-x-8">
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                ABOUT
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                RESEARCH
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                COUNTRIES
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                CAPACITY DEVELOPMENT
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                NEWS
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                VIDEOS
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                DATA
              </Link>
              <Link
                href="/#actions"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                PUBLICATIONS
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>

            {/* Mobile Menu Title */}
            <div className="md:hidden flex-1 text-center">
              <span className="text-sm font-medium text-foreground">MENU</span>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background">
              <div className="py-4 space-y-4">
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ABOUT
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  RESEARCH
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  COUNTRIES
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CAPACITY DEVELOPMENT
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  NEWS
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  VIDEOS
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  DATA
                </Link>
                <Link
                  href="#"
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  PUBLICATIONS
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
