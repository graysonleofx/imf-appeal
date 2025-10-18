import { Shield, FileText, HelpCircle } from "lucide-react"
import React from "react"
import brand from "@/public/brand.png"
import Image from "next/image"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="w-10 h-10  rounded-md flex items-center justify-center text-white">
                <Image src={brand} alt="IMF"  objectFit="contain" className="h-12 md:h-16 lg:h-20 object-contain" />
              </div> */}
              <h3 className="text-lg font-semibold">IMF Grant Access</h3>
            </div>
            <p className="text-sm text-gray-600">
              IMF Grant Access — portal for submitting grant applications, checking eligibility, and filing appeals. Submit documents, track your application status, and contact support for help with appeals or eligibility questions. All submissions are handled securely.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="/privacy" className="hover:text-[#cba135]">Privacy</a></li>
                <li><a href="/terms" className="hover:text-[#cba135]">Terms</a></li>
                <li><a href="/#contact" className="hover:text-[#cba135]">Support</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-sm text-gray-500 text-center">
          © {year} IMF Grant Access. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
