'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            if (email === 'admin@racingcup.com' && password === 'admin123') {
                router.push('/admin/dashboard')
            } else {
                setError('Credenciales inválidas. Intente nuevamente.')
                setIsLoading(false)
            }
        }, 1000)
    }

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-brand">
                    <img src="/logotypes/logo.png" alt="Racing Cup Admin" style={{ height: '50px', width: 'auto' }} />
                    <h1>Panel de Administración</h1>
                    <p>Inicia sesión para gestionar la plataforma</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="admin-form-group">
                        <label className="admin-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className={`admin-input ${error ? 'input-error' : ''}`}
                            placeholder="admin@racingcup.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Contraseña</label>
                        <input
                            type="password"
                            className={`admin-input ${error ? 'input-error' : ''}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn-admin-login"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verificando...' : 'Ingresar al Panel'}
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Solo personal autorizado. <br />
                            <span style={{ opacity: 0.5 }}>Demo: admin@racingcup.com / admin123</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
