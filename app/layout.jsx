"use client"
import { SessionProvider } from 'next-auth/react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export default function RootLayout({
  children,
}) {
  return (
   <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
      <SessionProvider>
        {children}
      </SessionProvider>
      </body>
    </html>
    
  )
}
