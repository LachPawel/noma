// app/layout.tsx
import './globals.css'
import { WalletContextProvider } from '@/app/components/WalletProvider'
import { TwentyFirstToolbar } from '@21st-extension/toolbar-next'
import { ReactPlugin } from '@21st-extension/react'
import AmbientSound from '@/components/AmbientSound'
import SoundControl from '@/components/SoundControl'

export const metadata = {
  title: 'Noma.cash - Privacy-First Neobank',
  description: 'Earn yield on stablecoins with financial privacy',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body>
        <WalletContextProvider>
          <AmbientSound 
            volume={0.15} 
            fadeInDuration={3000} 
            fadeOutDuration={2000}
            playbackRate={1.0}
          />
          <SoundControl />
          {children}
        </WalletContextProvider>
        <TwentyFirstToolbar config={{ plugins: [ReactPlugin] }} />
      </body>
    </html>
  )
}