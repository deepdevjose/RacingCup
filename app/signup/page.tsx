'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../login/login.css'

/**
 * Login/Signup Page
 * Split layout with branding and form
 */
export default function SignupPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        gamerTag: '',
        institution: ''
    })

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

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault()
        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                alert("Las contraseñas no coinciden")
                return
            }
            // Animate transition
            gsap.to('.step-1', {
                x: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    setStep(2)
                    gsap.fromTo('.step-2',
                        { x: 50, opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.3 }
                    )
                }
            })
        } else if (step === 2) {
            // Submit logic here (mock)
            console.log("Form Submitted", formData)

            // Animate transition to Step 3
            gsap.to('.step-2', {
                x: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    setStep(3)
                    gsap.fromTo('.step-3',
                        { scale: 0.8, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
                    )
                }
            })
        }
    }

    const handleBack = () => {
        gsap.to('.step-2', {
            x: 50,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                setStep(1)
                gsap.fromTo('.step-1',
                    { x: -50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.3 }
                )
            }
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }))
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
                            <img src="/logotypes/logo.png" alt="Racing Cup Logo" className="w-24 h-auto" />
                        </Link>
                        <h1 className="login-heading">
                            Únete a la <br />
                            Competencia
                        </h1>
                        <p className="login-brand-text">
                            Registra tu equipo y prepárate para desafiar los límites de la robótica.
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
                        <h2 className="form-title">Crear Cuenta</h2>
                        <p className="form-subtitle">
                            {step < 3 ? `Paso ${step} de 2` : 'Registro Completado'}
                            {step === 1 && (
                                <span> - ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></span>
                            )}
                        </p>

                        <div className="signup-steps-container">
                            <form className="login-form" onSubmit={handleNextStep}>

                                {step === 1 && (
                                    <div className="step-1">
                                        <div className="form-group">
                                            <label htmlFor="email">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="tu@correo.com"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password">Contraseña</label>
                                            <input
                                                type="password"
                                                id="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        <button type="submit" className="btn btn-primary login-submit">
                                            Siguiente
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="step-2">
                                        <div className="form-group">
                                            <label htmlFor="fullName">Nombre Completo</label>
                                            <input
                                                type="text"
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Tu nombre real"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="gamerTag">Gamer Tag / Alias</label>
                                            <input
                                                type="text"
                                                id="gamerTag"
                                                value={formData.gamerTag}
                                                onChange={handleChange}
                                                placeholder="Como te verán los demás"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="institution">Institución</label>
                                            <input
                                                type="text"
                                                id="institution"
                                                value={formData.institution}
                                                onChange={handleChange}
                                                placeholder="Nombre de tu escuela o equipo"
                                                required
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                className="btn login-submit outline"
                                                onClick={handleBack}
                                                style={{ background: 'transparent', border: '2px solid #E32636', color: '#fff' }}
                                            >
                                                Atrás
                                            </button>
                                            <button type="submit" className="btn btn-primary login-submit">
                                                Finalizar
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="step-3 verification-container">
                                        <div className="verification-icon">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                        </div>

                                        <h3 className="verification-title">¡Verifica tu correo!</h3>

                                        <p className="verification-text">
                                            Te hemos enviado un correo de verificación a <strong>{formData.email}</strong>.<br />
                                            Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                                        </p>

                                        <Link href="/login" className="btn btn-primary login-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                            Iniciar Sesión
                                        </Link>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
