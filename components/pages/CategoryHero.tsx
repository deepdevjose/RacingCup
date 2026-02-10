'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './CategoryHero.css'

interface CategoryHeroProps {
    title: string
    subtitle?: string
    description?: string
    accentColor?: string
    backgroundColor?: string
    backgroundImage?: string
    titleImage?: string
}

/**
 * CategoryHero - Reusable hero component for category pages
 * Follows the Racing Cup design system with GSAP animations
 */
export default function CategoryHero({
    title,
    subtitle,
    description,
    accentColor = '#E32636',
    backgroundColor,
    backgroundImage,
    titleImage
}: CategoryHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline()

        // Title/Logo entrance - scale up with bounce
        tl.from('.category-hero-title, .category-hero-logo', {
            scale: 0.5,
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'back.out(1.7)'
        })

        // Subtitle fade in
        if (subtitle) {
            tl.from('.category-hero-subtitle', {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5')
        }

        // Description fade in
        if (description) {
            tl.from('.category-hero-description', {
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.3')
        }

    }, { scope: containerRef })

    return (
        <div
            className="category-hero"
            ref={containerRef}
            style={{
                '--accent-color': accentColor,
                backgroundColor: backgroundColor || '#101020',
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
            } as React.CSSProperties}
        >
            <div className="category-hero-content">
                {titleImage ? (
                    <img
                        src={titleImage}
                        alt={title}
                        className="category-hero-logo"
                    />
                ) : (
                    <h1 className="category-hero-title">{title}</h1>
                )}

                {subtitle && (
                    <p className="category-hero-subtitle">{subtitle}</p>
                )}

                {description && (
                    <p className="category-hero-description">{description}</p>
                )}
            </div>

            {/* Scroll indicator (Manita) */}
            <div className="category-hero-hand">
                <img src="/cursors/manita.png" alt="Scroll Down" className="hand-icon-img" />
            </div>
        </div>
    )
}
