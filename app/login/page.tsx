'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './login.css'

/**
 * Login/Signup Page
 * Split layout with branding and form
 */
export default function LoginPage() {
    const formRef = useRef<HTMLDivElement>(null)
    const brandRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline()

        // Brand side animation
        tl.from('.login-brand-logo', {
            scale: 0.5,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        })

        tl.from('.login-heading', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')

        tl.from('.stat-item', {
            scale: 0,
            opacity: 0,
            stagger: 0.2,
            duration: 0.6,
            ease: 'elastic.out(1, 0.7)'
        }, '-=0.3')

        // Form side animation
        tl.from('.login-form-wrapper', {
            opacity: 0,
            x: 50,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')

    }, { scope: formRef })

    return (
        <div className="login-page" ref={formRef}>
            {/* Back Button */}
            <Link href="/" className="login-back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver al inicio
            </Link>

            <div className="login-split">
                {/* Left: Branding */}
                <div className="login-brand" ref={brandRef}>
                    <div className="login-brand-content">
                        <Link href="/" className="login-brand-logo">
                            <img src="/logotypes/logo.png" alt="Racing Cup Logo" className="w-24 h-auto" />
                        </Link>
                        <h1 className="login-heading">
                            Racing Cup <br />
                            Manager
                        </h1>
                        <p className="login-brand-text">
                            La plataforma oficial para gestionar equipos, puntajes y estadísticas del torneo.
                        </p>

                        <div className="stat-row">
                            <div className="stat-item">
                                <span className="stat-number">4ª</span>
                                <span className="stat-label">Edición</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">#1</span>
                                <span className="stat-label">Torneo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="login-form-side">
                    <div className="login-form-wrapper">
                        <h2 className="form-title">Iniciar Sesión</h2>
                        <p className="form-subtitle">
                            ¿No tienes cuenta?
                            <Link href="/signup">Regístrate aquí</Link>
                        </p>

                        {/* Form */}
                        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="tu@correo.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <Link href="/dashboard" className="btn btn-primary login-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                Entrar
                            </Link>

                            <a href="#" className="forgot-password">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
