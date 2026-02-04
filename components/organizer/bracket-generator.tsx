"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    type Team,
    getMatchesByCategory,
    createMatch
} from "@/lib/firebase"
import { generateBracket } from "@/lib/bracket-utils"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Loader2, GitMerge, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BracketGeneratorProps {
    eventId: string
    categoryId: string
    teams: Team[]
    onGenerated: () => void
}

export function BracketGenerator({ eventId, categoryId, teams, onGenerated }: BracketGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [strategy, setStrategy] = useState<"random" | "seeded">("seeded")
    const [bracketSize, setBracketSize] = useState<string>("all")
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        let teamsToUse = [...teams]

        if (teams.length < 2) {
            setError("Se necesitan al menos 2 equipos para generar un bracket.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // 1. Check if matches already exist
            const existing = await getMatchesByCategory(eventId, categoryId)
            if (existing.length > 0) {
                if (!confirm("Ya existen partidas para esta categoria. ¿Estas seguro de querer regenerar el bracket? Esto duplicara las partidas.")) {
                    setLoading(false)
                    return
                }
            }

            // 1.5. Filter by Bracket Size (Top N)
            if (bracketSize !== "all") {
                const limit = parseInt(bracketSize)
                if (teamsToUse.length > limit) {
                    // Fetch stats to sort by performance
                    // Dynamic import to avoid circular dep issues if any, or just import at top. 
                    // Existing imports check: getTournamentStats is likely needed.
                    // We'll trust it's imported (need to add import).
                    const { getTournamentStats } = await import("@/lib/firebase")
                    const stats = await getTournamentStats(eventId, categoryId)

                    // Map stats for easy access
                    const statsMap = new Map(stats.map(s => [s.teamId, s]))

                    // Sort teams by stats
                    // Priority: Points > (KO/Goals/Time) > Wins
                    // We need to know the category mode (Sumo/Soccer/Race) to know tie-breaker.
                    // Simple heuristic: Points -> KO points (desc) -> Goals (desc) -> TotalTime (asc if race)
                    // If totalTime is used for "Best Time", lower is better.

                    const catLower = categoryId.toLowerCase()
                    const isRace = catLower.includes("race") || catLower.includes("carrera")

                    teamsToUse.sort((a, b) => {
                        const statA = statsMap.get(a.id!)
                        const statB = statsMap.get(b.id!)

                        if (!statA) return 1 // No stats = bottom
                        if (!statB) return -1

                        // 1. Points
                        if (statA.points !== statB.points) return statB.points - statA.points

                        // 2. Specifics
                        // If race, check time (lower is better, assuming totalTime holds best time as typically stored)
                        if (isRace) {
                            // If both have time, lower wins
                            // If one has 0 (no time), they lose? Or 0 is best? 
                            // Usually 0 means DNF or no run unless initialized to MAX. 
                            // Assuming MAX or non-zero. If 0, treat as bad.
                            const timeA = statA.totalTime || 999999
                            const timeB = statB.totalTime || 999999
                            if (timeA !== timeB) return timeA - timeB
                        } else {
                            // Sumo/Soccer: Higher KO/Goals is better
                            const breakerA = (statA.koPoints || 0) + (statA.goals || 0)
                            const breakerB = (statB.koPoints || 0) + (statB.goals || 0)
                            if (breakerA !== breakerB) return breakerB - breakerA
                        }

                        // 3. Wins
                        return statB.won - statA.won
                    })

                    // Take Top N
                    teamsToUse = teamsToUse.slice(0, limit)
                }
            }

            // 2. Generate
            const { matches } = generateBracket(eventId, categoryId, teamsToUse, strategy)

            // 3. Save to DB
            await Promise.all(matches.map(m => createMatch(m)))

            onGenerated()
        } catch (err) {
            console.error("Error generating bracket:", err)
            setError("Error al generar el bracket. Revisa la consola.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitMerge className="h-5 w-5" />
                    Generar Bracket
                </CardTitle>
                <CardDescription>
                    Crea el cuadro de eliminatorias automatico. Puedes filtrar por los mejores equipos de la tabla.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <span className="text-sm font-medium mb-1 block">Tamaño del Bracket</span>
                        <Select value={bracketSize} onValueChange={setBracketSize}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los equipos ({teams.length})</SelectItem>
                                <SelectItem value="64">Top 64 (Mejores puntajes)</SelectItem>
                                <SelectItem value="32">Top 32</SelectItem>
                                <SelectItem value="16">Top 16</SelectItem>
                                <SelectItem value="8">Top 8</SelectItem>
                                <SelectItem value="4">Top 4 (Semifinales)</SelectItem>
                                <SelectItem value="2">Top 2 (Gran Final)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <span className="text-sm font-medium mb-1 block">Estrategia de Sembrado</span>
                        <Select value={strategy} onValueChange={(v) => setStrategy(v as "random" | "seeded")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seeded">Por Ranking (Seed)</SelectItem>
                                <SelectItem value="random">Aleatorio</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={loading || teams.length < 2}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generando...
                        </>
                    ) : (
                        "Generar Partidas"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
