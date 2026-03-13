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

const DEVELOPERS = [
    { name: 'José Developer', role: 'Lead Developer', github: 'deepdevjose' },
    { name: 'Measly543', role: 'Backend', github: 'EDUARDOVAZQUE' },
]

const SPONSORS = [
    {
        name: 'Zaragoza Boxing',
        category: 'Escuela de boxeo',
        map: 'https://maps.app.goo.gl/YjejDfFmg35t2iD77',
        facebook: 'https://www.facebook.com/profile.php?id=100095632082401',
        image: '/partners/zarbox.png'
    },
    {
        name: 'Bateria Express',
        category: 'Local de venta de baterias',
        map: 'https://maps.app.goo.gl/HkHTDBrcUHXYsXo58',
        facebook: 'https://www.facebook.com/profile.php?id=61579509916298',
        image: '/partners/bateriaexpress.jpg'
    },
    {
        name: 'El mero mero',
        category: 'Asados',
        map: 'https://maps.app.goo.gl/JbmcMpHWNkWguxbg6',
        image: '/partners/meromero.png'
    },
    {
        name: 'Ing. Gustavo Antonio Rojas Morales',
        category: 'Laboratorios STEM',
        image: '/partners/gus.png'
    },
    {
        name: 'Christian Elias Cruz González',
        category: 'Egresado',
        image: '/partners/cristian.png'
    },
    {
        name: 'Jorge Alberto Villeda',
        category: 'Egresado',
        image: '/partners/villeda.png'
    },
    {
        name: 'Edwin Jair Castillo',
        category: 'Egresado',
        image: '/partners/castillo.png'
    },
]

/**
 * About Page
 * Information about Racing Cup and ITSOEH
 */
export default function AboutPage() {
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

            {/* Sponsors Section */}
            <section className="about-sponsors-section">
                <div className="about-sponsors-container">
                    <h2 className="about-sponsors-title">Patrocinadores</h2>
                    <div className="sponsors-grid">
                        {SPONSORS.map((sponsor) => (
                            <div key={sponsor.name} className="sponsor-card">
                                <div className="sponsor-photo-container">
                                    {sponsor.image ? (
                                        <Image
                                            src={sponsor.image}
                                            alt={sponsor.name}
                                            fill
                                            className="sponsor-photo"
                                        />
                                    ) : (
                                        <div className="sponsor-photo-placeholder">
                                            <span className="sponsor-icon">📸</span>
                                        </div>
                                    )}
                                </div>
                                <div className="sponsor-info">
                                    <h3 className="sponsor-name">{sponsor.name}</h3>
                                    <p className="sponsor-category">{sponsor.category}</p>
                                </div>
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
