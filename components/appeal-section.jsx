"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import * as Icons from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Safe icon picker with inline SVG fallbacks so the component never crashes if lucide icon names change.
const DefaultSuccessIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props} aria-hidden>
    <circle cx="12" cy="12" r="9" strokeWidth="1.5" className="text-green-600" />
    <path d="M9 12.5l1.8 1.8L15 10" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" />
  </svg>
)
const DefaultLoadingIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props} aria-hidden>
    <path d="M21 12a9 9 0 11-6.219-8.48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/90" />
  </svg>
)

function pickIcon(candidateNames) {
  for (const n of candidateNames) {
    if (Icons && Icons[n]) return Icons[n]
  }
  return null
}

const SuccessIcon = pickIcon(["CheckCircle2", "CheckCircle", "Check"]) || DefaultSuccessIcon
const LoadingIcon = pickIcon(["Loader2", "Loader", "RotateCcw"]) || DefaultLoadingIcon

export function AppealSection() {
  const [form, setForm] = useState({ name: "", email: "", appeal: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  // Frontend-only submit simulation so UI always displays success for testing
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 700))
      setDone(true)
      setForm({ name: "", email: "", appeal: "" })
    } catch (err) {
      // keep a console trace to help debugging if something else fails
      // but do not throw so UI can still render
      // eslint-disable-next-line no-console
      console.error("Simulated submit error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            {/* Header */}
            <CardHeader className="text-center bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white px-6 py-10">
              <CardTitle className="text-3xl md:text-4xl font-semibold tracking-tight">
                Submit an Appeal
              </CardTitle>
              <p className="mt-3 md:mt-4 text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
                If you believe there’s been an error with your account or decision, please submit your appeal below. Our
                support team reviews every case within <strong>24–48 hours</strong>.
              </p>
            </CardHeader>

            {/* Content */}
            {/* Added min-h so the form/content area is visible and doesn't collapse */}
            <CardContent className="p-8 md:p-12 bg-white min-h-[420px]">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl border border-green-100"
                  >
                    <SuccessIcon className="h-10 w-10 text-green-600 mb-3" />
                    <p className="text-green-700 font-medium text-lg">Thank you! Your appeal has been received.</p>
                    <p className="text-green-600 text-sm mt-1">
                      You’ll receive an email update once our team has reviewed it.
                    </p>
                    <Button
                      className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:scale-[1.03]"
                      onClick={() => setDone(false)}
                    >
                      Submit Another Appeal
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Full Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="fullName" className="font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={handleChange("name")}
                          required
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="font-medium text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={form.email}
                          onChange={handleChange("email")}
                          required
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Appeal Message */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="message" className="font-medium text-gray-700">
                        Appeal Message
                      </Label>
                      <Textarea
                        id="message"
                        rows={6}
                        placeholder="Describe your situation and why an appeal is warranted..."
                        value={form.appeal}
                        onChange={handleChange("appeal")}
                        required
                        className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-[1.03] transition-all rounded-xl py-3 text-lg font-medium text-white shadow-md"
                      >
                        {loading ? (
                          <>
                            <LoadingIcon className="h-5 w-5 animate-spin" /> Sending...
                          </>
                        ) : (
                          "Submit Appeal"
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setForm({ name: "", email: "", appeal: "" })}
                        variant="outline"
                        className="border-gray-300 rounded-xl py-3 text-gray-700 hover:bg-gray-50"
                      >
                        Reset
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
