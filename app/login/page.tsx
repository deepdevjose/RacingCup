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
    const [isSignup, setIsSignup] = useState(false)
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

        tl.from('.login-brand-text', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.3')

        // Form side animation
        tl.from('.login-form-container', {
            opacity: 0,
            x: 50,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')

    }, { scope: formRef })

    const handleTabChange = (signup: boolean) => {
        if (signup === isSignup) return

        // Animate form switch
        gsap.to('.login-form', {
            opacity: 0,
            y: -20,
            duration: 0.2,
            onComplete: () => {
                setIsSignup(signup)
                gsap.fromTo('.login-form',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3 }
                )
            }
        })
    }

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
                            RC!
                        </Link>
                        <p className="login-brand-text">
                            Únete al torneo de robótica más emocionante de la región
                        </p>
                        <div className="login-brand-features">
                            <div className="feature-item">
                                <span className="feature-icon">🏎️</span>
                                <span>Racing Cars</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🤖</span>
                                <span>Sumo RC</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚽</span>
                                <span>RoboFut</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="login-form-side">
                    <div className="login-form-container">
                        {/* Tab Toggle */}
                        <div className="login-tabs">
                            <button
                                className={`login-tab ${!isSignup ? 'active' : ''}`}
                                onClick={() => handleTabChange(false)}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                className={`login-tab ${isSignup ? 'active' : ''}`}
                                onClick={() => handleTabChange(true)}
                            >
                                Registrarse
                            </button>
                        </div>

                        {/* Form */}
                        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                            {isSignup && (
                                <div className="form-group">
                                    <label htmlFor="name">Nombre Completo</label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>
                            )}

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

                            {isSignup && (
                                <div className="form-group">
                                    <label htmlFor="institution">Institución</label>
                                    <input
                                        type="text"
                                        id="institution"
                                        placeholder="Nombre de tu escuela"
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary login-submit">
                                {isSignup ? 'Crear Cuenta' : 'Entrar'}
                            </button>

                            {!isSignup && (
                                <a href="#" className="forgot-password">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            )}
                        </form>

                        {/* Divider */}
                        <div className="login-divider">
                            <span>o continúa con</span>
                        </div>

                        {/* Social Login */}
                        <div className="social-login">
                            <button className="social-btn google">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button className="social-btn facebook">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
