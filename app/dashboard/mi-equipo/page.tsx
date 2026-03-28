'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'
import { useAuth } from '@/lib/auth-context'
import { getUserTeams, type Team } from '@/lib/firebase'

export default function MiEquipoPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [teams, setTeams] = useState<Team[]>([])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        async function loadTeams() {
            if (!user) return
            try {
                const myTeams = await getUserTeams(user.uid)
                if (myTeams.length === 1) {
                    router.push(`/dashboard/equipos/${myTeams[0].id}`)
                } else if (myTeams.length > 1) {
                    setTeams(myTeams)
                    setLoading(false)
                } else {
                    setLoading(false)
                }
            } catch (err) {
                console.error(err)
                setLoading(false)
            }
        }

        if (user) {
            loadTeams()
        }
    }, [user, authLoading, router])

    if (loading || authLoading) {
        return (
            <div className="dashboard-layout">
                <DashboardNavbar />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        )
    }

    if (teams.length === 0) {
        return (
            <div className="dashboard-layout">
                <DashboardNavbar />
                <main className="dashboard-main container">
                    <div className="empty-state" style={{ marginTop: '4rem' }}>
                        <div className="empty-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3 className="empty-title">No estás en ningún equipo aún</h3>
                        <p className="empty-subtitle">Únete a un evento para crear o unirte a un equipo.</p>
                        <Link href="/dashboard/eventos" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
                            Ver eventos disponibles
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    // fallback for > 1 teams
    return (
        <div className="dashboard-layout">
            <DashboardNavbar />
            <main className="dashboard-main container">
                <header className="page-header" style={{ marginBottom: '2rem' }}>
                    <h1 className="page-title" style={{ color: '#fff' }}>Selecciona tu equipo</h1>
                    <p className="page-subtitle">Perteneces a múltiples equipos. Selecciona uno para ver los detalles.</p>
                </header>
                <div className="equipos-grid">
                    {teams.map(team => (
                        <Link key={team.id} href={`/dashboard/equipos/${team.id}`} style={{ textDecoration: 'none' }}>
                            <div className="equipo-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                                <div className="equipo-header">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: (team.color || '#E32636') + '20',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: team.color || '#E32636',
                                        fontSize: '1.2rem'
                                    }}>
                                        🏎️
                                    </div>
                                    <h4 className="equipo-name" style={{ color: '#fff', marginLeft: '1rem' }}>{team.name}</h4>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
