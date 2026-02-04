import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './TeamsList.css'
import { Team } from '@/types'

/**
 * TeamsList - Display registered teams
 */
interface TeamsListProps {
    eventId: string
}

function TeamsList({ eventId }: TeamsListProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.from(".team-card", {
            scrollTrigger: {
                trigger: ".teams-grid",
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.2)"
        })
    }, { scope: containerRef })

    // Demo teams data
    const teams: Team[] = [
        { id: 'team-1', name: 'Velocity Demons', members: ['Player1', 'Player2', 'Player3'], seed: 1 },
        { id: 'team-2', name: 'Speed Phantoms', members: ['Alpha', 'Beta', 'Gamma'], seed: 2 },
        { id: 'team-3', name: 'Turbo Warriors', members: ['Racer1', 'Racer2'], seed: 3 },
        { id: 'team-4', name: 'Nitro Kings', members: ['King1', 'King2', 'King3', 'King4'], seed: 4 },
        { id: 'team-5', name: 'Racing Legends', members: ['Legend1', 'Legend2'], seed: 5 },
        { id: 'team-6', name: 'Drift Masters', members: ['Drifter1', 'Drifter2', 'Drifter3'], seed: 6 },
        { id: 'team-7', name: 'Track Blazers', members: ['Blazer1', 'Blazer2'], seed: 7 },
        { id: 'team-8', name: 'Asphalt Runners', members: ['Runner1', 'Runner2', 'Runner3'], seed: 8 },
    ]

    return (
        <div className="teams-list" ref={containerRef}>
            <h3 className="teams-title section-title">
                <span className="teams-icon">👥</span>
                Equipos Registrados
            </h3>

            <div className="teams-count">
                <span className="count-number">{teams.length}</span>
                <span className="count-label">equipos participantes</span>
            </div>

            <div className="teams-grid">
                {teams.map((team, index) => (
                    <div
                        key={team.id}
                        className="team-card card"
                    >
                        <div className="team-header">
                            <span className="team-seed">#{team.seed}</span>
                            <h4 className="team-name">{team.name}</h4>
                        </div>

                        <div className="team-members">
                            <span className="members-label">👤 Miembros:</span>
                            <div className="members-list">
                                {team.members?.map((member: string, mIndex: number) => (
                                    <span key={mIndex} className="member-tag">{member}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TeamsList
