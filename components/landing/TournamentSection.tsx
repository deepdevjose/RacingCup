'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './TournamentSection.css'

// Register ScrollTrigger if not already done globally
gsap.registerPlugin(ScrollTrigger)

const PARTNERS = [
    { name: 'Racing Cup', src: '/logotypes/logo.png', width: 150, height: 150 },
    { name: 'TICS', src: '/logotypes/tics.png', width: 80, height: 80 },
    { name: 'ITSOEH', src: '/logotypes/itsoeg.png', width: 200, height: 80 },
    { name: 'Educación', src: '/logotypes/educacion.png', width: 200, height: 80 },
    { name: 'Sparko', src: '/logotypes/sparko.png', width: 180, height: 80 },
]

// Fire particle creation function
function createFireParticle(container: HTMLElement) {
    const particle = document.createElement('div')
    particle.classList.add('fire-particle')

    const size = Math.random() * 10 + 8
    const offsetX = Math.random() * 100 // Random position along text width
    const rotation = Math.random() * 20 - 10

    particle.style.width = `${size}px`
    particle.style.height = `${size * 1.5}px`
    particle.style.left = `${offsetX}%`
    particle.style.top = '50%'
    particle.style.transform += ` rotate(${rotation}deg)`

    container.appendChild(particle)

    setTimeout(() => {
        particle.remove()
    }, 1000)
}

export default function TournamentSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const fireContainerRef = useRef<HTMLDivElement>(null)
    const isFireActive = useRef(false)

    // Fire spawning effect when scrolling (DISABLED ON MOBILE)
    useEffect(() => {
        // Skip fire particles on mobile for performance
        const isMobile = window.matchMedia('(max-width: 768px)').matches ||
            'ontouchstart' in window

        if (isMobile) return

        let intervalId: NodeJS.Timeout | null = null

        const handleScroll = () => {
            const container = document.getElementById('fire-container')
            if (!container) return

            // Only spawn if CTA is visible
            const rect = container.getBoundingClientRect()
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0

            if (isVisible && !isFireActive.current) {
                isFireActive.current = true
                // Spawn particles rapidly for 1 second
                intervalId = setInterval(() => {
                    createFireParticle(container)
                }, 50)

                setTimeout(() => {
                    if (intervalId) clearInterval(intervalId)
                    isFireActive.current = false
                }, 1500)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (intervalId) clearInterval(intervalId)
        }
    }, [])

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

        // 1. Logos Row - Fade in from BOTTOM to TOP, left-to-right stagger
        tl.from(".partner-logo-wrapper", {
            autoAlpha: 0,
            y: 40, // Start below, move up
            duration: 0.8,
            stagger: 0.2, // Left to right, one by one
            ease: "power2.out"
        })

        // 2. Title - Fade in from BOTTOM to TOP
        tl.from(".tournament-title", {
            autoAlpha: 0,
            y: 50, // Start below, move up
            duration: 1,
            ease: "power3.out"
        }, "-=0.3")

        // 3. Tagline - Fade in after title
        tl.from(".tournament-tagline", {
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5")

        // 4. Icon - Fade in from BOTTOM to TOP
        tl.from(".tournament-icon-wrapper", {
            autoAlpha: 0,
            y: 40,
            duration: 0.9,
            ease: "power2.out"
        }, "-=0.4")

        // 5. Description - Fade in from BOTTOM to TOP
        tl.from(".tournament-description", {
            autoAlpha: 0,
            y: 30,
            duration: 1,
            ease: "power2.out"
        }, "-=0.5")

        // 6. CTA Fire Text - Final reveal with bounce
        tl.from(".tournament-cta", {
            autoAlpha: 0,
            scale: 0.8,
            y: 20,
            duration: 0.8,
            ease: "back.out(1.5)"
        }, "-=0.3")

        // Video is now a separate section, no need for background color transition here.

    }, { scope: sectionRef })

    return (
        <section className="tournament-section" ref={sectionRef}>
            <div className="tournament-container">

                {/* 1. Partner Logos (Top) */}
                <div className="partners-grid">
                    {PARTNERS.map((partner) => (
                        <div key={partner.name} className="partner-logo-wrapper">
                            <Image
                                src={partner.src}
                                alt={`${partner.name} Logo`}
                                width={partner.width}
                                height={partner.height}
                                className={`partner-logo ${partner.name === 'TICS' ? 'partner-logo-tics' : ''}`}
                            />
                        </div>
                    ))}
                </div>

                {/* 2. Main Content Split (Bottom) */}
                <div className="tournament-split">
                    {/* Left: Big Title */}
                    <div className="tournament-left">
                        <h2 className="tournament-title">
                            Racing Cup <br />
                            TIC's
                        </h2>
                        <p className="tournament-tagline">
                            Compite. Domina. Conquista la pista.
                        </p>
                    </div>

                    {/* Right: Icon + Text */}
                    <div className="tournament-right">
                        <div className="tournament-icon-wrapper">


                        </div>
                        <div className="tournament-description">
                            <p>
                                El 4to. Racing Cup TIC's es el torneo oficial de robótica y vehículos RC de la carrera de Ingeniería en Tecnologías de la Información y Comunicaciones del Instituto Tecnológico Superior del Occidente del Estado de Hidalgo. Un evento que combina la emoción de las carreras todoterreno con la intensidad estratégica de las batallas Sumo.
                            </p>
                            <p>
                                En la categoría <strong>Racing Cars</strong>, los competidores deberán dominar velocidad, control y toma de decisiones en pistas con obstáculos reales. No se trata solo de acelerar: cada curva exige precisión, cada salto requiere cálculo y cada segundo cuenta.
                            </p>
                            <p>
                                En <strong>Sumo RC</strong>, la estrategia es la clave. Dos robots, un dojo y un solo objetivo: sacar al oponente del área de combate. Programación, sensores y diseño mecánico se enfrentan en batallas cortas pero intensas donde cada movimiento puede definir la victoria.
                            </p>
                            <p>
                                Este evento reúne a estudiantes de nivel medio superior y superior para demostrar habilidades en electrónica, programación, diseño mecánico y control. Más que una competencia, es un escenario donde la ingeniería se pone a prueba en tiempo real.
                            </p>
                        </div>
                        <div className="tournament-cta fire-text">
                            <div className="fire-container" id="fire-container"></div>
                            ¿Tienes lo necesario para competir?
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
