"use client" 

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import {SessionProvider} from "next-auth/react"
import "./globals.css"; 

export default function RootLayout({
  children,
}) {
  return (
   <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/brand.png" />
        <title>IMF Grant Application System</title>
        <meta name="description" content="IMF Grant Application System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
      <SessionProvider>
        {children}
      </SessionProvider>
      </body>
    </html> 
    
  )
}
