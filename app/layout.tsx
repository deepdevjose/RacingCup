import { ReactNode } from 'react'
import './globals.css'
import { Outfit, Racing_Sans_One, UnifrakturMaguntia } from 'next/font/google'
import SmoothScroll from '../components/common/SmoothScroll'
import { AuthProvider } from '../lib/auth-context'

const outfit = Outfit({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-outfit',
})

const racingSansOne = Racing_Sans_One({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-racing',
})

const unifraktur = UnifrakturMaguntia({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-unifraktur',
})

export const metadata = {
    title: 'Racing Cup',
    description: 'Torneo de carreras con los mejores equipos de la región',
    icons: {
        icon: [
            { url: '/logo.png' },
            { url: '/logo.png', sizes: '32x32' },
            { url: '/logo.png', sizes: '192x192' },
        ],
        apple: { url: '/logo.png' },
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 0.8,
}

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning className={`${outfit.variable} ${racingSansOne.variable} ${unifraktur.variable}`}>
            <head />
            <body>
                <AuthProvider>
                    <SmoothScroll />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
