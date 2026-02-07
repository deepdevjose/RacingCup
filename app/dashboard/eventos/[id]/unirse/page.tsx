'use client'

import React, { useState, use } from 'react'
import Link from 'next/link'
import '../../../dashboard.css'
import '../../eventos.css'
import '../evento-detail.css'
import './unirse.css'

export default function UnirseEquipoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [codigo, setCodigo] = useState('')

    const handleBuscar = () => {
        if (codigo.trim()) {
            alert(`Buscando equipo con código: ${codigo}`)
            // In real app, this would search for the team
        }
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

            <main className="dashboard-main container">
                {/* Back Link */}
                <Link href={`/dashboard/eventos/${resolvedParams.id}`} className="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Volver al evento
                </Link>

                {/* Join Form */}
                <div className="unirse-container">
                    {/* Key Icon */}
                    <div className="unirse-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                    </div>

                    <h1 className="unirse-title">Unirse a un equipo</h1>
                    <p className="unirse-subtitle">
                        Ingresa el código de invitación para unirte a un equipo
                    </p>

                    {/* Code Input */}
                    <div className="unirse-form">
                        <label className="input-label">Código de invitación</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="code-input"
                                placeholder="EJ: ABC123"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                            />
                            <button className="btn-buscar" onClick={handleBuscar}>
                                Buscar
                            </button>
                        </div>
                    </div>

                    {/* Alternative Action */}
                    <p className="unirse-alt">
                        ¿No tienes un código?{' '}
                        <Link href={`/dashboard/eventos/${resolvedParams.id}/crear-equipo`} className="link-crear">
                            Crea tu propio equipo
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
