"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Mail, HelpCircle } from "lucide-react"
import { ContactForm } from "./contact-form"
import { signIn } from "next-auth/react"
import { useToast } from "./ui/use-toast"

export function MainSection() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // keep session handling logic intact — moved to top-level effect to run on session changes
  useEffect(() => {
    console.log("Session data in MainSection:", session)
    console.log("Authentication status in MainSection:", status)

    if (status === "authenticated" && session?.user?.email) {
      toast({
        title: "Sign-in successful",
        description: "You have been signed in successfully.",
      })

      const logUser = async () => {
        try {
          const response = await fetch("/api/log-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session?.user?.email, name: session?.user?.name }),
          })
          const data = await response.json()
          console.log("User logged successfully:", data)
        } catch (error) {
          console.error("Error logging user:", error)
        }
      }
      logUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status])

  // Google sign-in (behavior unchanged)
  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/notepad" })
      if (!result?.ok) {
        toast({
          title: "Sign-in failed",
          description: "Please try again.",
          variant: "destructive",
        })
        console.error("Google sign-in error:", result)
      }
      // session handling and logging are handled in the useEffect above
    } catch (error) {
      console.error("Google sign-in failed:", error)
      toast({
        title: "Sign-in failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }



  //   const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  // const { toast } = useToast();
  // const { data: session , status } = useSession();
  // console.log("Session data in MainSection:", session);
  // console.log("Authentication status in MainSection:", status);

  // // Function to handle Google sign-in
  // const handleGoogleSignIn = async () => {
  //   try {
  //     const result = await signIn('google', { callbackUrl: '/notepad' });
  //     if (!result?.ok) {
  //       // Sign-in failed, show an error toast
  //       toast({
  //         title: "Sign-in failed",
  //         description: "Please try again.",
  //         variant: "destructive",
  //       });
  //       console.error("Google sign-in error:", result);
  //     } else {
  //       // The useEffect hook will handle logging the user once session is updated
  //       useEffect(() => {
  //         console.log("Session data:", session);
  //         console.log("Authentication status:", status);
  //         if(status === "authenticated" && session?.user?.email){
  //           console.log("User is signed in:", session?.user);
  //           toast({
  //             title: "Sign-in successful",
  //             description: "You have been signed in successfully.",
  //           });
  //           const logUser = async () => {
  //             try {
  //               const response = await fetch('/api/log-user', {
  //                 method: 'POST',
  //                 headers: {
  //                   'Content-Type': 'application/json',
  //                 },
  //                 body: JSON.stringify({ email: session?.user?.email, name: session?.user?.name }),
  //               });
  //               const data = await response.json();
  //               console.log('User logged successfully:', data);
  //             } catch (error) {
  //               console.error('Error logging user:', error);
  //             }
  //           };
  //           logUser();
  //         }
  //       }, [session, status]);
  //       // console.log("Google sign-in successful:", result);
  //     }
  //   } catch (error) {
  //     // Handle sign-in error (e.g., show a toast or alert)
  //     console.error("Google sign-in failed:", error);
  //     toast({
  //       title: "Sign-in failed",
  //       description: "Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // }

  return (
    <>
      <section
        className="bg-gradient-to-b from-[#0f274f] via-[#15366d] to-[#1e3a8a] py-12 md:py-20"
        id="actions"
      >
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Left: intro text */}
            <div className="text-white order-2 md:order-1">
              <span className="inline-block bg-[#f0d48a] text-[#1e3a8a] font-semibold px-3 py-1 rounded-full text-sm mb-4">
                Grant Services
              </span>

              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                Sign up to Access Grants and Appeal Resources
              </h2>

              <p className="mt-4 text-slate-100 max-w-xl leading-relaxed">
                Apply, track and manage your grant requests. Receive official updates, supporting documents and timely decisions — all from a single, secure portal.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleGoogleSignIn}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#1e3a8a] to-[#254b8b] hover:from-[#163160] hover:to-[#1b2f59] text-white px-6 py-3 rounded-full shadow-lg transition-all transform hover:scale-[1.02]"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Sign Up / Log In with Google
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setIsContactFormOpen(true)}
                  className="w-full sm:w-auto text-[#f0d48a] hover:text-[#e0be66] hover:bg-white/5 px-5 py-2 rounded-full transition-all"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>

              <a
                href="#"
                className="inline-flex items-center mt-6 text-[#f8f3e7] hover:text-[#f0d48a] font-medium transition-colors"
              >
                CURRENT SUBSCRIBERS
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </div>

            {/* Right: white card with features */}
            <Card className="order-1 md:order-2 rounded-2xl shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Grants & Resources</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Browse country reports, guidelines and application portals. Start new applications and monitor their progress.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-4 rounded-lg bg-slate-50 border hover:shadow-md transition-all">
                        <h4 className="font-medium text-slate-800">Apply for Grant</h4>
                        <p className="text-sm text-gray-500 mt-1">Begin a new grant application and upload supporting documents.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-50 border hover:shadow-md transition-all">
                        <h4 className="font-medium text-slate-800">Track Application</h4>
                        <p className="text-sm text-gray-500 mt-1">View status updates, messages, and decision timelines.</p>
                      </div>
                    </div>

                    <div className="mt-6 border-t pt-4">
                      <p className="text-sm text-gray-600">Need immediate assistance?</p>
                      <div className="flex flex-col sm:flex-row gap-4 mt-3 items-start sm:items-center">
                        <div className="flex items-center gap-2 text-[#1e3a8a] font-medium">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="text-sm">+1 (213) 556-6897</span>
                        </div>

                        <div className="flex items-center gap-2 text-[#1e3a8a] font-medium">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">support@imfgrant.org</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">Available Monday - Friday, 9:00 AM - 5:00 PM EST</p>
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
