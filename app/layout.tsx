import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'vkusno i tochka',
  description: "Удобное приложение для сотрудников разных должностей",
  icons: {
    icon: "/burger.png",
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
