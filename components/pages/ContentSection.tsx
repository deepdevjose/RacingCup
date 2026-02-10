'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ContentSection.css'

gsap.registerPlugin(ScrollTrigger)

interface ContentSectionProps {
    title: string
    children: React.ReactNode
    variant?: 'dark' | 'light' | 'primary' | 'accent'
    id?: string
    backgroundColor?: string
    accentColor?: string
}

/**
 * ContentSection - Reusable content section with scroll animations
 */
export default function ContentSection({
    title,
    children,
    variant = 'dark',
    id,
    backgroundColor,
    accentColor
}: ContentSectionProps) {
    const sectionRef = useRef<HTMLElement>(null)

    useGSAP(() => {
        const section = sectionRef.current
        if (!section) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                end: 'bottom 20%',
                toggleActions: 'play none none reset'
            }
        })

        tl.from(section.querySelector('.content-section-title'), {
            autoAlpha: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out'
        })

        tl.from(section.querySelector('.content-section-body'), {
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.4')

    }, { scope: sectionRef })

    return (
        <section
            className={`content-section content-section--${variant}`}
            ref={sectionRef}
            id={id}
            style={{
                backgroundColor: backgroundColor,
                '--color-primary': accentColor
            } as React.CSSProperties}
        >
            <div className="content-section-container">
                <h2 className="content-section-title">{title}</h2>
                <div className="content-section-body">
                    {children}
                </div>
            </div>
        </section>
    )
}
