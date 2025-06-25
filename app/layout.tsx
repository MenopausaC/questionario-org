import type React from "react"
import "./globals.css"
import { Poppins, Nunito, Mulish, Work_Sans } from "next/font/google" // Importa todas as fontes

// Configura a fonte Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // Regular, Medium, SemiBold, Bold, ExtraBold
  variable: "--font-poppins",
})

// Configura a fonte Nunito
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600"], // SemiBold
  variable: "--font-nunito",
})

// Configura a fonte Mulish
const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400"], // Regular
  variable: "--font-mulish",
})

// Configura a fonte Work Sans
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["500"], // Medium
  variable: "--font-work-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      {/* Aplica as variáveis CSS das fontes ao body */}
      <body className={`${poppins.variable} ${nunito.variable} ${mulish.variable} ${workSans.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
