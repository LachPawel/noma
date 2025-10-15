// app/layout.tsx
import './globals.css'
import { WalletContextProvider } from '@/app/components/WalletProvider'
import { TwentyFirstToolbar } from '@21st-extension/toolbar-next'
import { ReactPlugin } from '@21st-extension/react'
import AmbientSound from '@/components/AmbientSound'
import SoundControl from '@/components/SoundControl'

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