import './globals.css'

export const metadata = {
  title: 'NeuraSlot',
  description: 'AI-powered intelligent scheduling platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        {children}
      </body>
    </html>
  )
}
