'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './login.css'
import { loginUser } from '@/lib/firebase'

/**
 * Login/Signup Page
 * Split layout with branding and form
 */
export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const user = await loginUser(email, password)
            if (!user.emailVerified) {
                setError("Por favor verifica tu correo electrónico antes de iniciar sesión.")
                setLoading(false)
                return
            }
            router.push("/dashboard")
        } catch (err: any) {
            console.error(err)
            const errorMessage = err.message || ""
            if (errorMessage.includes("invalid-credential") || errorMessage.includes("wrong-password")) {
                setError("Correo o contraseña incorrectos")
            } else if (errorMessage.includes("user-not-found")) {
                setError("No existe una cuenta con este correo")
            } else {
                setError("Error al iniciar sesión. Intenta de nuevo.")
            }
            setLoading(false)
        }
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
                        {error && (
                            <div className="error-message" style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        <p className="form-subtitle">
                            ¿No tienes cuenta?
                            <Link href="/signup">Regístrate aquí</Link>
                        </p>

                        {/* Form */}
                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                                {loading ? "Entrando..." : "Entrar"}
                            </button>

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
