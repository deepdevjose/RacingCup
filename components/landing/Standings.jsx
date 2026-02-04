import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Standings.css'

/**
 * Standings - Real-time rankings display
 * Uses demo data (will connect to Firestore onSnapshot)
 */
function Standings({ eventId }) {
    const containerRef = useRef(null)

    useGSAP(() => {
        gsap.from(".standings-row", {
            scrollTrigger: {
                trigger: ".standings-table",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        })
    }, { scope: containerRef })

    // Demo data - will be replaced with Firestore listener
    const standings = [
        { rank: 1, teamId: 'team-1', name: 'Velocity Demons', points: 1500, wins: 5, losses: 0 },
        { rank: 2, teamId: 'team-2', name: 'Speed Phantoms', points: 1350, wins: 4, losses: 1 },
        { rank: 3, teamId: 'team-3', name: 'Turbo Warriors', points: 1200, wins: 3, losses: 1 },
        { rank: 4, teamId: 'team-4', name: 'Nitro Kings', points: 1100, wins: 3, losses: 2 },
        { rank: 5, teamId: 'team-5', name: 'Racing Legends', points: 950, wins: 2, losses: 2 },
        { rank: 6, teamId: 'team-6', name: 'Drift Masters', points: 800, wins: 2, losses: 3 },
        { rank: 7, teamId: 'team-7', name: 'Track Blazers', points: 650, wins: 1, losses: 3 },
        { rank: 8, teamId: 'team-8', name: 'Asphalt Runners', points: 500, wins: 0, losses: 4 },
    ]

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return <span className="rank-badge badge-gold">🥇</span>
            case 2: return <span className="rank-badge badge-silver">🥈</span>
            case 3: return <span className="rank-badge badge-bronze">🥉</span>
            default: return <span className="rank-number">{rank}</span>
        }
    }

    return (
        <div className="standings" ref={containerRef}>
            <h3 className="standings-title section-title">
                <span className="standings-icon">🏆</span>
                Standings en Tiempo Real
            </h3>

            <div className="standings-table-wrapper">
                <table className="standings-table">
                    <thead>
                        <tr>
                            <th className="col-rank">#</th>
                            <th className="col-team">Equipo</th>
                            <th className="col-points">Puntos</th>
                            <th className="col-record">W/L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team, index) => (
                            <tr
                                key={team.teamId}
                                className={`standings-row ${team.rank <= 3 ? 'standings-row-top' : ''}`}
                            >
                                <td className="col-rank">
                                    {getRankBadge(team.rank)}
                                </td>
                                <td className="col-team">
                                    <span className="team-name">{team.name}</span>
                                </td>
                                <td className="col-points">
                                    <span className="points-value">{team.points.toLocaleString()}</span>
                                </td>
                                <td className="col-record">
                                    <span className="record-wins">{team.wins}</span>
                                    <span className="record-separator">/</span>
                                    <span className="record-losses">{team.losses}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="standings-note">
                ⚡ Actualización en tiempo real
            </p>
        </div>
    )
}

export default Standings
