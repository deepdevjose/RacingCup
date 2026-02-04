"use client"

import { useState } from "react"
import {
    type Team,
    getMatchesByCategory,
    createMatch,
    updateTeamStats
} from "@/lib/firebase"
import { generateQualifiers } from "@/lib/bracket-utils"
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
import { Loader2, Shuffle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface QualifiersGeneratorProps {
    eventId: string
    categoryId: string
    teams: Team[]
    onGenerated: () => void
}

export function QualifiersGenerator({ eventId, categoryId, teams, onGenerated }: QualifiersGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [rounds, setRounds] = useState("3")
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (teams.length < 2) {
            setError("Se necesitan al menos 2 equipos.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // 1. Check existing
            const existing = await getMatchesByCategory(eventId, categoryId)
            // Filter for qualifier matches (round 1, 2, 3... and usually stage='group')
            const hasQualifiers = existing.some(m => m.stage === 'group')

            if (hasQualifiers) {
                if (!confirm("Ya existen clasificatorias. ¿Generar más?")) {
                    setLoading(false)
                    return
                }
            }

            // 2. Init Stats for everyone (if not exist)
            // We can just upsert safely.
            await Promise.all(teams.map(team =>
                updateTeamStats(eventId, categoryId, team.id!, {
                    teamId: team.id,
                    // Stats default to 0 in updateTeamStats logic if new
                })
            ))

            // 3. Generate Matches
            const numRounds = parseInt(rounds)
            const { matches } = generateQualifiers(eventId, categoryId, teams, numRounds)

            // 4. Save
            await Promise.all(matches.map(m => createMatch(m)))

            onGenerated()
        } catch (err) {
            console.error("Error generating qualifiers:", err)
            setError("Error al generar clasificatorias.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5" />
                    Fase Clasificatoria
                </CardTitle>
                <CardDescription>
                    Genera partidas aleatorias (todos contra todos o rondas) para definir la tabla de puntos.
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
                        <span className="text-sm font-medium mb-1 block">Rondas por Equipo</span>
                        <Select value={rounds} onValueChange={setRounds}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Ronda</SelectItem>
                                <SelectItem value="2">2 Rondas</SelectItem>
                                <SelectItem value="3">3 Rondas (Recomendado)</SelectItem>
                                <SelectItem value="4">4 Rondas</SelectItem>
                                <SelectItem value="5">5 Rondas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <span className="text-sm font-medium mb-1 block">Equipos</span>
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm">
                            {teams.length} confirmados
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={loading || teams.length < 2}
                    variant="secondary"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generando...
                        </>
                    ) : (
                        "Generar Clasificatorias"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
