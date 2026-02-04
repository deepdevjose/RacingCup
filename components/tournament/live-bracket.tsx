"use client"

import { useEffect, useState } from "react"
import { getMatchesByCategory, type Match, type Team } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy } from "lucide-react"

interface LiveBracketProps {
    event: any // Using specific Event type requires import, trying to reuse existing imports or minimal change
    categoryId: string
    teams: Team[]
}

export function LiveBracket({ event, categoryId, teams }: LiveBracketProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    // Derived event ID from event object
    const eventId = event.id

    useEffect(() => {
        // Real-time listener would be better, but for MVP polling or simple load is fine.
        // We'll use simple load for now.
        loadMatches()

        // Optional: Poll every 30s
        const interval = setInterval(loadMatches, 30000)
        return () => clearInterval(interval)
    }, [eventId, categoryId])

    async function loadMatches() {
        try {
            const data = await getMatchesByCategory(eventId, categoryId)
            // Filter out qualifier matches (stage='group') to show only the Elimination Bracket
            const bracketMatches = data.filter(m => m.stage !== 'group')
            setMatches(bracketMatches)
        } catch (error) {
            console.error("Error loading bracket:", error)
        } finally {
            setLoading(false)
        }
    }

    const getTeamName = (id?: string) => {
        if (!id) return "TBD"
        return teams.find(t => t.id === id)?.name || "Desconocido"
    }

    const getTeamColor = (id?: string) => {
        if (!id) return "#666"
        return teams.find(t => t.id === id)?.color || "#666"
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>El bracket aun no ha sido generado.</p>
            </div>
        )
    }

    // Bracket visualization logic
    // Group matches by round
    const roundsMap = new Map<number, Match[]>()
    matches.forEach(m => {
        const list = roundsMap.get(m.round) || []
        list.push(m)
        roundsMap.set(m.round, list)
    })

    const rounds = Array.from(roundsMap.keys()).sort((a, b) => a - b)

    // Winner Logic: Check per-category winner map first, fall back to global if old format
    const categoryResult = event.categoryWinners?.[categoryId]
    const winnerId = categoryResult?.firstTeamId || (event.winnersConfirmed && !event.categoryWinners ? event.firstTeamId : null)

    return (
        <div className="space-y-6">
            {/* WINNER SECTION */}
            {winnerId && (
                <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 border rounded-xl flex items-center gap-6">
                    <div className="p-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/20">
                        <Trophy className="h-8 w-8 text-yellow-900" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">
                            ¡Torneo Finalizado!
                        </h2>
                        <p className="text-lg font-medium mt-1">
                            Ganador: <span className="font-bold text-foreground">
                                {teams.find(t => t.id === winnerId)?.name || "Cargando..."}
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            El evento ha concluido para esta categoría.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-8 overflow-x-auto pb-6 pt-2 snap-x">
                {rounds.map((round, rIndex) => {
                    const roundMatches = roundsMap.get(round) || []
                    // Sort by matchNumber to keep vertical order consistent
                    roundMatches.sort((a, b) => a.matchNumber - b.matchNumber)

                    // Label logic same as organizer
                    const title = (
                        round === rounds[rounds.length - 1] && rounds.length > 1 ? "Final" :
                            round === rounds[rounds.length - 2] && rounds.length > 2 ? "Semifinal" :
                                `Ronda ${round}`
                    )

                    return (
                        <div key={round} className="min-w-[300px] flex-shrink-0 snap-center">
                            <h3 className="text-center font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4 sticky left-0">
                                {title}
                            </h3>

                            <div className="flex flex-col gap-6 justify-center h-full">
                                {roundMatches.map(match => {
                                    const winnerId = match.winnerId
                                    return (
                                        <Card key={match.id} className="relative border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                                            <div className="flex flex-col">
                                                {/* Team A */}
                                                <div className={`flex justify-between items-center p-3 px-4 border-b border-border/10 ${winnerId === match.teamAId ? "bg-green-500/10 font-bold" : ""}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: getTeamColor(match.teamAId) }} />
                                                        <span className="text-sm truncate max-w-[140px]" title={getTeamName(match.teamAId)}>
                                                            {getTeamName(match.teamAId)}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono font-bold text-muted-foreground mr-1">{match.scoreA ?? "-"}</span>
                                                </div>

                                                {/* Team B */}
                                                <div className={`flex justify-between items-center p-3 px-4 ${winnerId === match.teamBId ? "bg-green-500/10 font-bold" : ""}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: getTeamColor(match.teamBId) }} />
                                                        <span className="text-sm truncate max-w-[140px]" title={getTeamName(match.teamBId)}>
                                                            {getTeamName(match.teamBId)}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono font-bold text-muted-foreground mr-1">{match.scoreB ?? "-"}</span>
                                                </div>
                                            </div>

                                            {/* Status Connector (Visual sugar) */}
                                            {match.status === "in_progress" && (
                                                <div className="absolute top-1 right-1">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
