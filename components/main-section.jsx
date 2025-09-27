"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Mail, HelpCircle } from "lucide-react"
import { ContactForm } from "./contact-form"
import {signIn} from "next-auth/react"

export function MainSection() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)

  // Create a function that triggers Google Sign In using NextAuth,
  // and then uses the accessToken to call an API route to fetch Gmail inbox.
  const handleGoogleSignIn = async () =>{
    signIn('google', {callbackUrl: '/'});
  }

  return (
    <>
      <section className="py-10 md:py-20 bg-[#1e3a8a] min-h-[500px] md:min-h-[700px] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white rounded-xl overflow-hidden">
              <CardContent className="p-6 sm:p-10 md:p-16 lg:p-20 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6 md:mb-10 text-balance">
                  {"Sign Up and Submit Appeal"}
                </h1>

                <div className="mb-6 md:mb-10">
                  <a
                    href="#"
                    className="inline-flex items-center text-[#4a90e2] hover:text-[#357abd] font-medium text-base md:text-lg transition-colors"
                  >
                    CURRENT SUBSCRIBERS
                    <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </a>
                </div>

                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed">
                  Sign up to receive free e-mail notices when new series and/or country items are posted on the IMF
                  website. Start by selecting either Countries or Series below:
                </p>

                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col items-center gap-4 md:gap-6">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c5aa0] text-white px-8 sm:px-12 py-3 md:py-4 text-base md:text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto sm:min-w-[280px]"
                      onClick={handleGoogleSignIn}
                    >
                      <Mail className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" />
                      Sign Up with Email
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setIsContactFormOpen(true)}
                      className="text-[#4a90e2] hover:text-[#357abd] hover:bg-blue-50 px-6 md:px-8 py-2 md:py-3 text-sm md:text-base font-medium rounded-full transition-all duration-300"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-gray-200">
                    <div className="mb-6 md:mb-8 text-center">
                      <p className="text-gray-600 mb-3 text-sm md:text-base font-medium">Need immediate assistance?</p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <div className="flex items-center gap-2 text-[#4a90e2]">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="font-medium text-sm md:text-base">+1 (202) 623-7000</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4a90e2]">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium text-sm md:text-base">support@imf.org</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs md:text-sm mt-2">
                        Available Monday - Friday, 9:00 AM - 5:00 PM EST
                      </p>
                    </div>

                    
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                      

                      
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </>
  )
}
