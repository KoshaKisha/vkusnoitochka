import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Вкусно и точка — приложение для сотрудников",
  description: "Удобное и функциональное приложение для управления сменами, отпусками и задачами сотрудников всех уровней.",
  icons: {
    icon: "/burger.png", // favicon
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
