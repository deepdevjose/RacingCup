'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../login/login.css'
import { registerUser, createProfile, isGamertagAvailable } from '@/lib/firebase'
import { useEffect } from 'react'

/**
 * Login/Signup Page
 * Split layout with branding and form
 */
export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        gamerTag: '',
        institution: '',
        isTeacher: false,
        educationLevel: 'superior'
    })
    const [gamertagStatus, setGamertagStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

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

    useEffect(() => {
        const checkAvailability = async () => {
            if (formData.gamerTag.length === 8) {
                setGamertagStatus('checking')
                const available = await isGamertagAvailable(formData.gamerTag)
                setGamertagStatus(available ? 'available' : 'taken')
            } else {
                setGamertagStatus('idle')
            }
        }
        checkAvailability()
    }, [formData.gamerTag])

    const handleNextStep = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (step === 1) {
            // ... (keep step 1 logic)
            if (formData.password !== formData.confirmPassword) {
                setError("Las contraseñas no coinciden")
                return
            }
            if (formData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres")
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
            if (formData.gamerTag.length !== 8) {
                setError("El Gamertag debe tener exactamente 8 caracteres")
                return
            }
            if (gamertagStatus === 'taken') {
                setError("Este Gamertag ya está en uso")
                return
            }
            if (gamertagStatus === 'checking') {
                setError("Validando disponibilidad del Gamertag...")
                return
            }
            setLoading(true)
            try {
                // 1. Register user
                const user = await registerUser(formData.email, formData.password)

                // 2. Create profile
                await createProfile({
                    userId: user.uid,
                    email: formData.email,
                    displayName: formData.fullName,
                    gamertag: formData.gamerTag,
                    school: formData.institution,
                    isTeacher: Boolean(formData.isTeacher),
                    educationLevel: formData.educationLevel
                })

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
            } catch (err: any) {
                console.error(err)
                if (err.code === 'auth/email-already-in-use') {
                    setError("Este correo ya está registrado")
                } else {
                    setError("Error al crear la cuenta. Intenta de nuevo.")
                }
            } finally {
                setLoading(false)
            }
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target as HTMLInputElement
        const checked = (e.target as HTMLInputElement).checked

        // Special handling for gamerTag: 8 alphanumeric characters, force uppercase
        if (id === 'gamerTag') {
            const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
            setFormData(prev => ({
                ...prev,
                gamerTag: alphanumericValue
            }))
            return
        }

        setFormData(prev => ({
            ...prev,
            [id || e.target.name]: type === 'checkbox' ? checked : value
        }))
    }

    return (
        <div className="login-page" ref={formRef}>
            <Link href="/" className="login-back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver al inicio
            </Link>

            <div className="login-split">
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

                <div className="login-form-side">
                    <div className="login-form-wrapper">
                        <h2 className="form-title">Crear Cuenta</h2>
                        {error && (
                            <div className="error-message" style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
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
                                            <label htmlFor="gamerTag">Gamertag (8 caracteres alfanuméricos)</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    id="gamerTag"
                                                    value={formData.gamerTag}
                                                    onChange={handleChange}
                                                    placeholder="Ej: PLAYER01"
                                                    maxLength={8}
                                                    required
                                                    style={{
                                                        textTransform: 'uppercase',
                                                        borderColor: gamertagStatus === 'available' ? '#10B981' : gamertagStatus === 'taken' ? '#EF4444' : 'rgba(255,255,255,0.1)'
                                                    }}
                                                />
                                                {gamertagStatus === 'checking' && (
                                                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                                        <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                    </div>
                                                )}
                                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                                    {formData.gamerTag.length}/8 caracteres
                                                </small>
                                                {gamertagStatus === 'available' && <small style={{ color: '#10B981', fontSize: '0.75rem' }}>Disponible</small>}
                                                {gamertagStatus === 'taken' && <small style={{ color: '#EF4444', fontSize: '0.75rem' }}>No disponible</small>}
                                            </div>
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

                                        <div className="form-group">
                                            <label htmlFor="educationLevel">Nivel Educativo</label>
                                            <select
                                                id="educationLevel"
                                                value={formData.educationLevel}
                                                onChange={handleChange as any}
                                                className="form-select"
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                            >
                                                <option value="media_superior" style={{ background: '#1a1a1a' }}>Media Superior</option>
                                                <option value="superior" style={{ background: '#1a1a1a' }}>Superior</option>
                                            </select>
                                        </div>

                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                            <input
                                                type="checkbox"
                                                id="isTeacher"
                                                checked={formData.isTeacher}
                                                onChange={handleChange}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="isTeacher" style={{ cursor: 'pointer', marginBottom: 0 }}>¿Eres docente?</label>
                                        </div>

                                        <div className="flex gap-4" style={{ marginTop: '20px' }}>
                                            <button
                                                type="button"
                                                className="btn login-submit outline"
                                                onClick={handleBack}
                                                style={{ background: 'transparent', border: '2px solid #E32636', color: '#fff', flex: 1 }}
                                            >
                                                Atrás
                                            </button>
                                            <button type="submit" className="btn btn-primary login-submit" disabled={loading} style={{ flex: 2 }}>
                                                {loading ? "Creando..." : "Finalizar"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="step-3 verification-container" style={{ textAlign: 'center' }}>
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
