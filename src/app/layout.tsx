// app/layout.tsx
import './globals.css'
import { WalletContextProvider } from '@/app/components/WalletProvider'
import { TwentyFirstToolbar } from '@21st-extension/toolbar-next'
import { ReactPlugin } from '@21st-extension/react'

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
        <TwentyFirstToolbar config={{ plugins: [ReactPlugin] }} />
      </body>
    </html>
  )
}