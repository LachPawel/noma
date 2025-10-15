// app/layout.tsx
import './globals.css'
import { WalletContextProvider } from '@/app/components/WalletProvider'

export const metadata = {
  title: 'Anonbank - Privacy-First Neobank',
  description: 'Earn yield on stablecoins with financial privacy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
}