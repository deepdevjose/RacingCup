import { ReactNode } from 'react'
import './globals.css'

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

import SmoothScroll from '../components/common/SmoothScroll'

import { AuthProvider } from '../lib/auth-context'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Pirata+One&family=Racing+Sans+One&family=UnifrakturMaguntia&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    <SmoothScroll />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
