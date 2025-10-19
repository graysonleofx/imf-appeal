"use client";

import Image from "next/image";
import { ContactForm } from "./contact-form";
import { Button } from "./ui/button";
import { useState } from "react";

export default function HeroSection() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <>
      <section className="relative isolate">
        {/* 🧱 Hero background */}
        <div className="relative h-[60vh] md:h-[72vh] overflow-hidden">
          {/* ✅ Add z-index and parent relative */}
          <div className="absolute inset-0 z-0">
          <Image
            src="/imfc-am2025.jpg"
            alt="IMF style hero"
            fill
            className="object-cover"
            priority
          />
          {/* ✅ Move gradient overlay *after* image, within same stacking context */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-transparent will-change-transform z-10" />
        </div>

        {/* ✅ Ensure content sits *above* both layers */}
        <div className="relative z-20 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
              IMF Grant Access — Apply, Track and Manage
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-lg">
              Access grant resources, submit appeals and receive timely updates on your application status.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="#actions"
                className="inline-block bg-[#cba135] hover:scale-[1.02] transition-all px-6 py-3 rounded-md font-semibold text-slate-800 shadow"
              >
                Get Access
              </a>
              <Button
                variant="outline"
                onClick={() => setIsContactFormOpen(true)}
                className="inline-block border border-white/30 bg-transparent px-5 py-2 rounded-md h-12 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
      </section>
      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </> 
  )
}
