'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import './admin.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, profile, loading } = useAuth()

    useEffect(() => {
        // Wait for auth to load
        if (loading) return

        // If no user or no profile, redirect to home
        if (!user || !profile) {
            router.push('/')
            return
        }

        // If user is not admin, redirect to home
        if (!profile.admin) {
            console.warn('Unauthorized access attempt to admin area')
            router.push('/')
            return
        }
    }, [user, profile, loading, router])

    // Show loading state while checking auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#fff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(255,255,255,0.1)',
                        borderTopColor: '#E32636',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#94a3b8' }}>Verificando permisos...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        )
    }

    // Don't render admin content if not authorized
    if (!user || !profile || !profile.admin) {
        return null
    }

    // Render admin content
    return <>{children}</>
}
