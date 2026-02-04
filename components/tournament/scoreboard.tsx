"use client"

import { useEffect, useState } from "react"
import { getTournamentStats, type TournamentStats, type Team, getConfirmedTeamsByEvent } from "@/lib/firebase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Trophy, Medal } from "lucide-react"

interface ScoreboardProps {
    eventId: string
    categoryId: string
}

export function Scoreboard({ eventId, categoryId }: ScoreboardProps) {
    const [stats, setStats] = useState<TournamentStats[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)

    // Determine mode
    const getScoringMode = (cat: string) => {
        const lower = cat.toLowerCase()
        if (lower.includes("sumo")) return "sumo"
        if (lower.includes("fut") || lower.includes("soccer") || lower.includes("robofut")) return "soccer"
        if (lower.includes("race") || lower.includes("carrera") || lower.includes("rc")) return "race"
        return "standard"
    }
    const mode = getScoringMode(categoryId)

    useEffect(() => {
        loadData()
    }, [eventId, categoryId])

    async function loadData() {
        try {
            const [statsData, teamsData] = await Promise.all([
                getTournamentStats(eventId, categoryId),
                getConfirmedTeamsByEvent(eventId)
            ])
            setStats(statsData)
            setTeams(teamsData)
        } catch (error) {
            console.error("Error loading scoreboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const getTeam = (teamId: string) => teams.find(t => t.id === teamId)

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (stats.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Aún no hay estadísticas registradas para esta categoría.</p>
            </div>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Equipo</TableHead>
                            <TableHead className="text-center">PJ</TableHead>
                            <TableHead className="text-center">G</TableHead>
                            <TableHead className="text-center">E</TableHead>
                            <TableHead className="text-center">P</TableHead>

                            {mode === "sumo" && <TableHead className="text-center text-orange-600">KO</TableHead>}
                            {mode === "soccer" && <TableHead className="text-center text-blue-600">Goles</TableHead>}
                            {mode === "race" && <TableHead className="text-center text-purple-600">Mejor T</TableHead>}

                            <TableHead className="text-center font-bold text-primary">Pts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.map((stat, index) => {
                            const team = getTeam(stat.teamId)
                            return (
                                <TableRow key={stat.id}>
                                    <TableCell className="font-medium">
                                        {index === 0 && <Medal className="h-4 w-4 text-yellow-500" />}
                                        {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                                        {index === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                                        {index > 2 && index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-8 rounded-full"
                                                style={{ backgroundColor: team?.color || "#666" }}
                                            />
                                            <div>
                                                <span className="font-semibold block">{team?.name || "Equipo Eliminado"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{stat.played}</TableCell>
                                    <TableCell className="text-center text-green-600 font-medium">{stat.won}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">{stat.draw}</TableCell>
                                    <TableCell className="text-center text-red-500">{stat.lost}</TableCell>

                                    {mode === "sumo" && <TableCell className="text-center font-mono">{stat.koPoints || 0}</TableCell>}
                                    {mode === "soccer" && <TableCell className="text-center font-mono">{stat.goals || 0}</TableCell>}
                                    {mode === "race" && <TableCell className="text-center font-mono">{stat.totalTime?.toFixed(2) || "-"}</TableCell>}

                                    <TableCell className="text-center font-bold text-lg">{stat.points}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
