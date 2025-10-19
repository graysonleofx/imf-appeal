"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function AppealSection() {
  const [form, setForm] = useState({ name: "", email: "", appeal: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDone(true)
        setForm({ name: "", email: "", appeal: "" })
      }
    } catch (err) {
      console.error("Error submitting appeal:", err)
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
            <CardContent className="p-8 md:p-12 bg-white">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl border border-green-100"
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
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
                            <Loader2 className="h-5 w-5 animate-spin" /> Sending...
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
