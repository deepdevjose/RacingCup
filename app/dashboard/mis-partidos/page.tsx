'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'
import { useAuth } from '@/lib/auth-context'
import { getUserTeams, getMatchesByEvent, type Team, type Match } from '@/lib/firebase'

export default function MisPartidosPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    
    const [loadingData, setLoadingData] = useState(true)
    const [myTeams, setMyTeams] = useState<Team[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [filterMyMatches, setFilterMyMatches] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        async function loadData() {
            if (!user) return
            try {
                const teams = await getUserTeams(user.uid)
                setMyTeams(teams)

                const myEventIds = Array.from(new Set(teams.map(t => t.eventId)))
                
                const allMatches = await Promise.all(
                    myEventIds.map(eventId => getMatchesByEvent(eventId!))
                )

                const flatMatches = allMatches.flat().sort((a, b) => {
                    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
                    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
                    return (a.matchNumber || 0) - (b.matchNumber || 0)
                })

                setMatches(flatMatches)
            } catch (err) {
                console.error("Error loading matches:", err)
            } finally {
                setLoadingData(false)
            }
        }

        if (user) {
            loadData()
        }
    }, [user, authLoading, router])

    if (loadingData || authLoading) {
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

    const myTeamIds = myTeams.map(t => t.id)
    const displayedMatches = filterMyMatches
        ? matches.filter(m => (m.teamAId && myTeamIds.includes(m.teamAId)) || (m.teamBId && myTeamIds.includes(m.teamBId)))
        : matches

    return (
        <div className="dashboard-layout">
            <DashboardNavbar />

            <main className="dashboard-main container">
                <header className="page-header" style={{ marginBottom: '2rem' }}>
                    <h1 className="page-title">Mis Partidos</h1>
                    <p className="page-subtitle">Sigue en vivo tus próximos partidos y resultados.</p>
                </header>

                <div className="matches-list-container">
                    <div className="list-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <label className="filter-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <input
                                type="checkbox"
                                checked={filterMyMatches}
                                onChange={(e) => setFilterMyMatches(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#E32636' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Solo mis equipos</span>
                        </label>
                    </div>

                    {displayedMatches.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <h3 className="empty-title">No hay partidos para mostrar</h3>
                            <p className="empty-subtitle">
                                {filterMyMatches ? "Tus equipos no tienen partidos programados en este momento." : "No hay partidos programados en tus eventos."}
                            </p>
                        </div>
                    ) : (
                        <div className="list-container">
                            {displayedMatches.map(match => {
                                const teamA = myTeams.find(t => t.id === match.teamAId)
                                const teamB = myTeams.find(t => t.id === match.teamBId)

                                const isTeamAMine = !!teamA
                                const isTeamBMine = !!teamB

                                let teamAName = teamA?.name || (match.teamAId ? "Equipo Rival" : "TBD")
                                let teamBName = teamB?.name || (match.teamBId ? "Equipo Rival" : "TBD")

                                return (
                                    <div key={match.id} className="match-card-item" style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                                            <span>Ronda {match.round} • Partido {match.matchNumber}</span>
                                            <span style={{
                                                color: match.status === 'in_progress' ? '#fbbf24' : match.status === 'completed' ? '#10b981' : 'rgba(255,255,255,0.5)',
                                                fontWeight: 'bold'
                                            }}>
                                                {match.status === 'in_progress' ? 'En Curso' : match.status === 'completed' ? 'Finalizado' : 'Pendiente'}
                                            </span>
                                        </div>

                                        <div className="match-versus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                            <div style={{ flex: 1, textAlign: 'right', opacity: match.winnerId && match.winnerId !== match.teamAId ? 0.5 : 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isTeamAMine ? '#E32636' : '#fff' }}>{teamAName}</div>
                                                {match.status !== 'pending' && <div style={{ fontSize: '1.5rem', fontFamily: "'Racing Sans One', cursive" }}>{match.scoreA || 0}</div>}
                                            </div>

                                            <div style={{ padding: '0 1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>VS</div>

                                            <div style={{ flex: 1, textAlign: 'left', opacity: match.winnerId && match.winnerId !== match.teamBId ? 0.5 : 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isTeamBMine ? '#E32636' : '#fff' }}>{teamBName}</div>
                                                {match.status !== 'pending' && <div style={{ fontSize: '1.5rem', fontFamily: "'Racing Sans One', cursive" }}>{match.scoreB || 0}</div>}
                                            </div>
                                        </div>

                                        {match.winnerId && (
                                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
                                                Ganador: {match.winnerId === match.teamAId ? teamAName : teamBName}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
