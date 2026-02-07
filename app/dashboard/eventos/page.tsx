'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../dashboard.css'
import './eventos.css'

export default function EventosPage() {
    const containerRef = useRef(null)

    useGSAP(() => {
        gsap.set('.categoria-card', { opacity: 1, y: 0 })
        gsap.from('.categoria-card', {
            y: 30,
            opacity: 0,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.2
        })
    }, { scope: containerRef })

    const categorias = [
        {
            id: 1,
            title: "Carrera RC - Velocidad",
            day: "13",
            month: "MAR",
            location: "Pista Principal",
            status: "Registro Abierto",
            description: "Demuestra la velocidad de tu prototipo en nuestro circuito profesional."
        },
        {
            id: 2,
            title: "Mini Sumo Autónomo",
            day: "13",
            month: "MAR",
            location: "Arena 1",
            status: "Cupo Limitado",
            description: "Estrategia y fuerza. Saca a tu oponente del dojo automáticamente."
        },
        {
            id: 3,
            title: "Robo Fut",
            day: "13",
            month: "MAR",
            location: "Cancha B",
            status: "Registro Abierto",
            description: "El clásico deporte en versión robótica. Equipos de 3 robots."
        }
    ]

    const getStatusClass = (status: string) => {
        return status.toLowerCase().replace(' ', '-')
    }

    return (
        <div className="dashboard-layout">
            {/* Navbar */}
            <nav className="dashboard-nav">
                <div className="container nav-content">
                    <Link href="/dashboard" className="nav-logo">
                        <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                        <span>Racing Cup TICs</span>
                    </Link>
                    <div className="nav-links">
                        <Link href="/dashboard" className="nav-link">Inicio</Link>
                        <Link href="/dashboard/eventos" className="nav-link active">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link">Equipos</Link>
                    </div>
                    <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div className="pill-content">
                            <span className="pill-gamertag">#JOSEPO23</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="dashboard-main container" ref={containerRef}>
                {/* Hero Section */}
                <div className="eventos-hero">
                    <img
                        src="/images/hero-car.png"
                        alt="Racing Cup"
                        className="eventos-hero-bg"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <div className="eventos-hero-overlay"></div>
                    <div className="eventos-hero-content">
                        <h1 className="eventos-hero-title">Racing Cup TICs 2026</h1>
                        <p className="eventos-hero-subtitle">
                            Explora las categorías disponibles y registra a tu equipo en la competencia.
                        </p>
                    </div>
                </div>

                {/* Categories Section */}
                <section className="categorias-section">
                    <h2 className="section-title">Categorías Disponibles</h2>

                    <div className="categorias-list">
                        {categorias.map(cat => (
                            <div key={cat.id} className="categoria-card">
                                {/* Date Badge */}
                                <div className="categoria-date-badge">
                                    <span className="categoria-date-day">{cat.day}</span>
                                    <span className="categoria-date-month">{cat.month}</span>
                                </div>

                                {/* Category Info */}
                                <div className="categoria-info">
                                    <span className={`categoria-status ${getStatusClass(cat.status)}`}>
                                        {cat.status}
                                    </span>
                                    <h3 className="categoria-title">{cat.title}</h3>
                                    <div className="categoria-meta">
                                        <span>📅 {cat.day} {cat.month} 2026</span>
                                        <span>📍 {cat.location}</span>
                                    </div>
                                    <p className="categoria-desc">{cat.description}</p>
                                </div>

                                {/* Action Button */}
                                <div className="categoria-action">
                                    <Link href={`/dashboard/eventos/${cat.id}`} className="btn-ver-detalles">
                                        Ver Detalles
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
