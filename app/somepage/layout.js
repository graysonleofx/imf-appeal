import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata = {
  title: 'IMF Grant Application System',
  description: 'IMF Grant Application System',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function Layout({ children }) {
  return (
    <html lang="en">

      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
