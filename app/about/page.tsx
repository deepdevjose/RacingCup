'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'
import './about.css'

gsap.registerPlugin(ScrollTrigger)

const PARTNERS = [
    { name: 'Racing Cup', src: '/logotypes/logo.png', width: 150, height: 150 },
    { name: 'TICS', src: '/logotypes/tics.png', width: 80, height: 80 },
    { name: 'ITSOEH', src: '/logotypes/itsoeg.png', width: 200, height: 80 },
    { name: 'Educación', src: '/logotypes/educacion.png', width: 200, height: 80 },
    { name: 'Sparko', src: '/logotypes/sparko.png', width: 180, height: 80 },
]

const DEVELOPERS = [
    { name: 'José Developer', role: 'Lead Developer', github: 'deepdevjose' },
    { name: 'Measly543', role: 'Backend', github: 'EDUARDOVAZQUE' },
]

/**
 * About Page
 * Information about Racing Cup and ITSOEH
 */
export default function AboutPage() {
    const partnersRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const section = partnersRef.current
        if (!section) return

        gsap.from('.partner-card', {
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                toggleActions: 'play none none reset'
            },
            autoAlpha: 0,
            y: 40,
            scale: 0.9,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.7)'
        })
    }, { scope: partnersRef })

    return (
        <div className="category-page">
            <Navbar />

            <CategoryHero
                title="Acerca de"
                subtitle="Racing Cup TIC's"
                description="Conoce la historia y misión del torneo de robótica más emocionante de la región."
                accentColor="#6366F1"
            />

            <ContentSection title="Nuestra Historia" variant="dark">
                <p>
                    El <strong>Racing Cup TIC's</strong> nació en 2022 como una iniciativa de la carrera
                    de Ingeniería en Tecnologías de la Información y Comunicaciones del Instituto
                    Tecnológico Superior del Occidente del Estado de Hidalgo (ITSOEH).
                </p>
                <p>
                    Lo que comenzó como una pequeña competencia interna ha crecido hasta convertirse
                    en un evento regional que reúne a estudiantes de nivel medio superior y superior
                    para demostrar sus habilidades en electrónica, programación, diseño mecánico y control.
                </p>
                <p>
                    En esta 4ª edición, contamos con tres categorías principales: Racing Cars, Sumo RC
                    y RoboFut, cada una diseñada para poner a prueba diferentes aspectos de la ingeniería
                    y la creatividad de los participantes.
                </p>
            </ContentSection>

            <ContentSection title="Nuestra Misión" variant="light">
                <p>
                    Fomentar el interés por la ciencia, tecnología, ingeniería y matemáticas (STEM)
                    a través de competencias prácticas y emocionantes que inspiren a las nuevas
                    generaciones de ingenieros.
                </p>
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">🎓</div>
                        <h3 className="rule-card-title">Educación</h3>
                        <p className="rule-card-text">
                            Aprendizaje práctico fuera del aula tradicional.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🤝</div>
                        <h3 className="rule-card-title">Colaboración</h3>
                        <p className="rule-card-text">
                            Trabajo en equipo y networking entre instituciones.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">💡</div>
                        <h3 className="rule-card-title">Innovación</h3>
                        <p className="rule-card-text">
                            Espacio para experimentar y crear soluciones únicas.
                        </p>
                    </div>
                </div>
            </ContentSection>

            {/* Partners Section */}
            <section className="about-partners-section" ref={partnersRef}>
                <div className="about-partners-container">
                    <h2 className="about-partners-title">Nuestros Patrocinadores</h2>
                    <div className="partners-grid">
                        {PARTNERS.map((partner) => (
                            <div key={partner.name} className="partner-card">
                                <Image
                                    src={partner.src}
                                    alt={`${partner.name} Logo`}
                                    width={partner.width}
                                    height={partner.height}
                                    className="partner-card-img"
                                />
                                <span className="partner-card-name">{partner.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Developers Section */}
            <section className="about-devs-section">
                <div className="about-devs-container">
                    <h2 className="about-devs-title">Equipo de Desarrollo</h2>
                    <p className="about-devs-subtitle">El equipo detrás del sitio web de Racing Cup</p>
                    <div className="devs-grid">
                        {DEVELOPERS.map((dev) => (
                            <a
                                key={dev.name}
                                href={`https://github.com/${dev.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dev-card"
                            >
                                <div className="dev-avatar">
                                    <img
                                        src={`https://github.com/${dev.github}.png`}
                                        alt={dev.name}
                                        className="dev-avatar-img"
                                    />
                                </div>
                                <h3 className="dev-name">{dev.name}</h3>
                                <span className="dev-role">{dev.role}</span>
                                <span className="dev-github">@{dev.github}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
