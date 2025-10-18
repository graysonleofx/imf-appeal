"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useState } from "react"

export function AppealSection() {
  const [form, setForm] = useState({ name: "", email: "", appeal: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setDone(true)
      setForm({ name: "", email: "", appeal: "" })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-10 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-6 md:pb-8 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white px-4 md:px-6">
              <CardTitle className="text-2xl md:text-3xl font-light">Submit an Appeal</CardTitle>
              <p className="text-blue-100 text-base md:text-lg text-pretty mt-3 md:mt-4">
                If you believe there has been an error with your account, please submit an appeal below and our team
                will review your case within 24-48 hours.
              </p>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
              {done ? (
                <div className="p-4 bg-green-50 rounded-md text-green-700">
                  Thank you — we received your appeal.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="fullName" className="text-sm md:text-base font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className="bg-white border-2 border-gray-200 focus:border-[#4a90e2] rounded-lg h-10 md:h-12 text-sm md:text-base transition-colors"
                        required
                        value={form.name}
                        onChange={handleChange("name")}
                      />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="email" className="text-sm md:text-base font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="bg-white border-2 border-gray-200 focus:border-[#4a90e2] rounded-lg h-10 md:h-12 text-sm md:text-base transition-colors"
                        required
                        value={form.email}
                        onChange={handleChange("email")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="message" className="text-sm md:text-base font-medium text-gray-700">
                      Appeal Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your situation and why you believe an appeal is warranted. Include any relevant details that might help us understand your case..."
                      rows={6}
                      className="bg-white border-2 border-gray-200 focus:border-[#4a90e2] rounded-lg text-sm md:text-base resize-none transition-colors"
                      required
                      value={form.appeal}
                      onChange={handleChange("appeal")}
                    />
                  </div>

                  <div className="flex items-center flex-col gap-3">
                    <Button
                      className="w-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c5aa0] text-white py-3 md:py-4 text-base md:text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      size="lg"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Submit Appeal"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setForm({ name: "", email: "", appeal: "" })}
                      className="px-4 py-2 border rounded-md"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
