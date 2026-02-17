"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUserTeams, type Team } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { TeamIcon } from '@/components/tournament/TeamIcon'

export default function TeamsWidget() {
    const { user } = useAuth()
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
                const userTeams = await getUserTeams(user.uid)
                setTeams(userTeams)
            } catch (error) {
                console.error("Error loading teams:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    if (loading) return <div className="widget-skeleton"></div>

    return (
        <div className="dashboard-widget teams-widget">
            <div className="widget-header">
                <h3 className="widget-title">Mis Equipos</h3>
                <Link href="/dashboard/equipos" className="widget-link">Gestionar</Link>
            </div>

            <div className="teams-list-widget">
                {teams.length > 0 ? (
                    teams.slice(0, 3).map(team => (
                        <Link key={team.id} href={`/dashboard/equipos/${team.id}`} className="team-item-mini">
                            <div className="team-icon-mini" style={{ backgroundColor: `${team.color || '#E32636'}20`, borderColor: `${team.color || '#E32636'}40` }}>
                                <TeamIcon icon={team.icon} color={team.color} size={16} />
                            </div>
                            <div className="team-info-mini">
                                <span className="team-name-mini">{team.name}</span>
                                <span className={`team-status-dot ${team.isConfirmed ? 'confirmed' : 'pending'}`}>
                                    {team.isConfirmed ? 'Confirmado' : 'Pendiente'}
                                </span>
                            </div>
                            <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </Link>
                    ))
                ) : (
                    <div className="empty-widget">
                        <div className="empty-icon-small">🛡️</div>
                        <p>No perteneces a ningún equipo aún.</p>
                        <Link href="/dashboard/equipos" className="btn-text-action">Crear o unirse</Link>
                    </div>
                )}

                {teams.length > 3 && (
                    <Link href="/dashboard/equipos" className="more-teams-link">
                        + {teams.length - 3} equipos más
                    </Link>
                )}
            </div>
        </div>
    )
}
