'use client'

import { useEffect, ReactNode } from 'react'
import Footer from '@/components/common/Footer'

/**
 * Dashboard Layout
 * Disables Lenis smooth scroll for the dashboard pages
 * to allow native scrolling within the dashboard container.
 * Includes the shared Footer component.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Disable Lenis by adding data attribute that prevents smooth scroll
        document.documentElement.setAttribute('data-lenis-prevent', '')

        // Force native scrolling on the page
        document.documentElement.style.overflow = 'auto'
        document.body.style.overflow = 'auto'
        document.body.style.height = 'auto'
        document.documentElement.style.height = 'auto'

        return () => {
            // Re-enable when leaving dashboard
            document.documentElement.removeAttribute('data-lenis-prevent')
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
            document.body.style.height = ''
            document.documentElement.style.height = ''
        }
    }, [])

    return (
        <>
            {children}
            <Footer />
        </>
    )
}
