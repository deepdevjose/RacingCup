'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll() {
    useEffect(() => {
        // Disable smooth scroll on mobile for better performance
        const isMobile = window.matchMedia('(max-width: 768px)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0

        if (isMobile) {
            // Use native scroll on mobile - it's more performant
            return
        }

        // Initialize Lenis only on desktop
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
        })

        // Sync Lenis scroll with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update)

        // Add Lenis to GSAP's ticker for smooth animation loop
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })

        // Turn off GSAP's default lag smoothing to avoid jitter with Lenis
        gsap.ticker.lagSmoothing(0)

        // Cleanup
        return () => {
            gsap.ticker.remove(lenis.raf)
            lenis.destroy()
        }
    }, [])

    return null
}
