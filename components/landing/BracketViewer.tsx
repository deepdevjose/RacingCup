import './BracketViewer.css'

/**
 * BracketViewer - Interactive tournament bracket
 * Displays single elimination bracket tree
 */

interface Match {
    id: string
    teamA: string
    teamB: string
    winner: string | null
}

interface Round {
    name: string
    matches: Match[]
}

interface Bracket {
    rounds: Round[]
}

interface BracketViewerProps {
    eventId: string
}

function BracketViewer({ eventId }: BracketViewerProps) {
    // Demo bracket data - 8 teams, 3 rounds
    const bracket: Bracket = {
        rounds: [
            // Round 1 (Quarterfinals)
            {
                name: 'Cuartos',
                matches: [
                    { id: 'm1', teamA: 'Velocity Demons', teamB: 'Asphalt Runners', winner: 'Velocity Demons' },
                    { id: 'm2', teamA: 'Speed Phantoms', teamB: 'Track Blazers', winner: 'Speed Phantoms' },
                    { id: 'm3', teamA: 'Turbo Warriors', teamB: 'Drift Masters', winner: 'Turbo Warriors' },
                    { id: 'm4', teamA: 'Nitro Kings', teamB: 'Racing Legends', winner: null },
                ]
            },
            // Round 2 (Semifinals)
            {
                name: 'Semifinales',
                matches: [
                    { id: 'm5', teamA: 'Velocity Demons', teamB: 'Speed Phantoms', winner: null },
                    { id: 'm6', teamA: 'Turbo Warriors', teamB: 'TBD', winner: null },
                ]
            },
            // Round 3 (Final)
            {
                name: 'Final',
                matches: [
                    { id: 'm7', teamA: 'TBD', teamB: 'TBD', winner: null },
                ]
            }
        ]
    }

    const MatchCard = ({ match }: { match: Match }) => {
        const isComplete = match.winner !== null

        return (
            <div className={`bracket-match ${isComplete ? 'bracket-match-complete' : ''}`}>
                <div className={`match-team ${match.winner === match.teamA ? 'match-winner' : ''}`}>
                    <span className="team-name">{match.teamA}</span>
                    {match.winner === match.teamA && <span className="winner-icon">✓</span>}
                </div>
                <div className="match-vs">VS</div>
                <div className={`match-team ${match.winner === match.teamB ? 'match-winner' : ''}`}>
                    <span className="team-name">{match.teamB}</span>
                    {match.winner === match.teamB && <span className="winner-icon">✓</span>}
                </div>
            </div>
        )
    }

    return (
        <div className="bracket-viewer">
            <h3 className="bracket-title section-title">
                <span className="bracket-icon">🎯</span>
                Bracket del Torneo
            </h3>

            <div className="bracket-container">
                {bracket.rounds.map((round, roundIndex) => (
                    <div key={round.name} className="bracket-round">
                        <h4 className="round-name">{round.name}</h4>
                        <div className="round-matches">
                            {round.matches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Trophy at the end */}
                <div className="bracket-trophy">
                    <span className="trophy-icon">🏆</span>
                    <span className="trophy-label">Campeón</span>
                </div>
            </div>

            <p className="bracket-note">
                🔄 Se actualiza en tiempo real
            </p>
        </div>
    )
}

export default BracketViewer
