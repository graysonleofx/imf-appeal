import { Shield, FileText, HelpCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] flex items-center justify-center">
              <div className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-white"></div>
            </div>
            <span className="text-lg md:text-xl font-light text-white">Platform</span>
          </div>

          <nav className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8">
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-base">Privacy Policy</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-base">Terms of Use</span>
            </a>
            <a
              href="#"
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
