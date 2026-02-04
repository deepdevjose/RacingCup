import { ReactNode } from 'react'
import './globals.css'

export const metadata = {
    title: 'Racing Cup',
    description: 'Torneo de carreras con los mejores equipos de la región',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Racing+Sans+One&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
