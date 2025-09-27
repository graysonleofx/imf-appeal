import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

export function AppealSection() {
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="fullName" className="text-sm md:text-base font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    className="bg-white border-2 border-gray-200 focus:border-[#4a90e2] rounded-lg h-10 md:h-12 text-sm md:text-base transition-colors"
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
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2c5aa0] text-white py-3 md:py-4 text-base md:text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                <Send className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" />
                Submit Appeal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
