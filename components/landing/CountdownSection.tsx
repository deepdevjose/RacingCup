'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './CountdownSection.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Target date for the countdown timer
 * Set to Friday, March 13, 2026 at 10:00 AM
 */
const TARGET_DATE = new Date('2026-03-13T10:00:00').getTime()

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

/**
 * CountdownSection - Displays a countdown timer to the Racing Cup event
 * Styled to match the TournamentSection dimensions
 */
export default function CountdownSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    /**
     * Calculate remaining time until target date
     */
    const calculateTimeLeft = useCallback((): TimeLeft => {
        const now = new Date().getTime()
        const difference = TARGET_DATE - now

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
        }
    }, [])

    /**
     * Update countdown every second
     */
    useEffect(() => {
        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [calculateTimeLeft])

    /**
     * GSAP entrance animations
     */
    useGSAP(() => {
        const section = sectionRef.current
        if (!section) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reset"
            }
        })

        // Animate title
        tl.from(".countdown-title", {
            autoAlpha: 0,
            y: 50,
            duration: 1,
            ease: "power3.out"
        })

        // Animate countdown blocks with stagger
        tl.from(".countdown-block", {
            autoAlpha: 0,
            y: 60,
            scale: 0.8,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)"
        }, "-=0.5")

        // Animate subtitle
        tl.from(".countdown-subtitle", {
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.3")

    }, { scope: sectionRef })

    /**
     * Format number with leading zero
     */
    const formatNumber = (num: number): string => {
        return num.toString().padStart(2, '0')
    }

    return (
        <section className="countdown-section" ref={sectionRef}>
            <div className="countdown-container">

                {/* Title */}
                <h2 className="countdown-title">
                    El evento comienza en
                </h2>

                {/* Countdown Timer */}
                <div className="countdown-grid">
                    <div className="countdown-block">
                        <span className="countdown-number">{formatNumber(timeLeft.days)}</span>
                        <span className="countdown-label">Días</span>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-block">
                        <span className="countdown-number">{formatNumber(timeLeft.hours)}</span>
                        <span className="countdown-label">Horas</span>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-block">
                        <span className="countdown-number">{formatNumber(timeLeft.minutes)}</span>
                        <span className="countdown-label">Minutos</span>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-block">
                        <span className="countdown-number">{formatNumber(timeLeft.seconds)}</span>
                        <span className="countdown-label">Segundos</span>
                    </div>
                </div>

                {/* Subtitle */}
                <p className="countdown-subtitle">
                    <br />Viernes 13 de Marzo, 2026 <br />
                    Insituto Tecnológico Superior del Occidente del Estado de Hidalgo
                </p>

            </div>
        </section>
    )
}
