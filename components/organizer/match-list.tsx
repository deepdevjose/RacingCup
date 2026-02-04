"use client"

import { useState, useEffect } from "react"
import {
    getMatchesByCategory,
    updateMatch,
    updateStandingStats,
    type Match,
    type Team
} from "@/lib/firebase"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, Edit2, Trophy, Gavel, Timer, Target } from "lucide-react"

interface MatchListProps {
    eventId: string
    categoryId: string
    teams: Team[]
    filterStage?: "group" | "bracket"
    viewMode?: "list" | "columns"
}

export function MatchList({ eventId, categoryId, teams, filterStage, viewMode = "columns" }: MatchListProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        scoreA: "0",
        scoreB: "0",
        koA: "0",
        koB: "0",
        goalsA: "0",
        goalsB: "0",
        timeA: "0",
        timeB: "0",
        winnerId: ""
    })

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
        loadMatches()
    }, [eventId, categoryId])

    async function loadMatches() {
        setLoading(true)
        try {
            const data = await getMatchesByCategory(eventId, categoryId)
            setMatches(data)
        } catch (error) {
            console.error("Error fetching matches:", error)
        } finally {
            setLoading(false)
        }
    }

    const getTeamName = (id?: string) => {
        if (!id) return "TBD"
        return teams.find(t => t.id === id)?.name || "Desconocido"
    }

    const openEdit = (match: Match) => {
        // Populate form
        setFormData({
            scoreA: match.scoreA?.toString() || (mode === 'standard' ? "0" : ""), // Default 0 for standard?
            scoreB: match.scoreB?.toString() || (mode === 'standard' ? "0" : ""),
            koA: match.koPointsA?.toString() || "0",
            koB: match.koPointsB?.toString() || "0",
            goalsA: match.goalsA?.toString() || "0",
            goalsB: match.goalsB?.toString() || "0",
            timeA: match.timeA?.toString() || "0",
            timeB: match.timeB?.toString() || "0",
            winnerId: match.winnerId || ""
        })
        setSelectedMatch(match)
        setIsOpen(true)
    }

    const saveMatch = async () => {
        if (!selectedMatch?.id) return

        setIsSaving(true)
        try {
            const updates: Partial<Match> = {
                status: "completed"
            }

            // Logic Split based on Stage
            const stage = selectedMatch.stage || "bracket" // Default to bracket if undefined? Or group? 
            // Older matches might not have stage. 
            // Standard: If round < 10 ?? No using stage.
            // Assuming we added 'group' to qualifiers.

            if (stage === "group") {
                // QUALIFIER LOGIC
                // Save Points + Stats
                updates.scoreA = parseInt(formData.scoreA) || 0
                updates.scoreB = parseInt(formData.scoreB) || 0

                if (mode === "sumo") {
                    updates.koPointsA = parseInt(formData.koA) || 0
                    updates.koPointsB = parseInt(formData.koB) || 0
                } else if (mode === "soccer") {
                    updates.goalsA = parseInt(formData.goalsA) || 0
                    updates.goalsB = parseInt(formData.goalsB) || 0
                } else if (mode === "race") {
                    updates.timeA = parseFloat(formData.timeA) || 0
                    updates.timeB = parseFloat(formData.timeB) || 0
                }

                // Winner logic for Qualifiers? 
                // Usually Qualifiers are accumulating points. WinnerId helps with "Won" count.
                // Simple calculation based on Points (Score).
                if (updates.scoreA! > updates.scoreB!) updates.winnerId = selectedMatch.teamAId
                else if (updates.scoreB! > updates.scoreA!) updates.winnerId = selectedMatch.teamBId
                else updates.winnerId = undefined // Tie

            } else {
                // BRACKET LOGIC
                // Simply select winner. Scores are secondary or ignored visually.
                if (!formData.winnerId) {
                    alert("Debes seleccionar un ganador para avanzar en el bracket.")
                    setIsSaving(false)
                    return
                }
                updates.winnerId = formData.winnerId
            }

            await updateMatch(selectedMatch.id, updates)

            if (stage !== "group" && updates.winnerId) {
                // Determine all matches to pass context
                // We have `matches` in state, but let's pass a fresh reference or the current state
                // Ideally we should await this to ensure UI update is consistent
                const { advanceBracket } = await import("@/lib/bracket-utils")
                await advanceBracket(selectedMatch, updates.winnerId, matches)
            }

            // Trigger STATS Aggregation!
            if (stage === "group") {
                await updateStandingStats(eventId, categoryId)
            }

            // Update local
            // For simplicity in MVP, we just reload all matches to get the propagate updates
            await loadMatches()
            // setMatches(matches.map(m => m.id === selectedMatch.id ? { ...m, ...updates } : m))
            setIsOpen(false)

        } catch (error) {
            console.error("Error saving match:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    // Filter matches based on props
    const filteredMatches = matches.filter(m => {
        if (!filterStage) return true
        return (m.stage || "bracket") === filterStage
    })

    if (filteredMatches.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
                <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium">No hay partidas</h3>
                <p className="text-sm text-muted-foreground">
                    {filterStage === "group" ? "Genera la fase de grupos primero." : "Genera el bracket o termina la fase de grupos."}
                </p>
            </div>
        )
    }

    const sortedMatches = [...filteredMatches].sort((a, b) => {
        if (a.stage !== b.stage) return (a.stage === "group" ? -1 : 1)
        return a.round - b.round || a.matchNumber - b.matchNumber
    })

    // Unique rounds handles
    const rounds = Array.from(new Set(sortedMatches.map(m => `${m.stage || "bracket"}-${m.round}`)))

    return (
        <div className="space-y-8">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Resultado de Partida</DialogTitle>
                        <DialogDescription>
                            Ingresa los puntos y estadísticas para la tabla.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMatch && (
                        // Unified Dialog Content (Visual Selector for ALL stages)
                        // We reuse the simplified visual form. In "bracket" mode, selecting "3 points" implies Winning.
                        <div className="space-y-6 py-4">
                            {/* VS Header */}
                            <div className="flex justify-between items-center text-sm font-medium">
                                <div className="text-center w-1/3">
                                    <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center">A</div>
                                    <span className="block truncate">{getTeamName(selectedMatch.teamAId)}</span>
                                </div>
                                <div className="font-bold text-muted-foreground">vs</div>
                                <div className="text-center w-1/3">
                                    <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center">B</div>
                                    <span className="block truncate">{getTeamName(selectedMatch.teamBId)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Team A Inputs */}
                                <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-border/50 flex flex-col items-center">
                                    <div className="w-full">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3 block text-center">Win Points</Label>
                                        <div
                                            className={`w-16 h-16 mx-auto rounded-full border-4 cursor-pointer flex items-center justify-center transition-all ${formData.scoreA === "3"
                                                ? "bg-red-600 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                                : "bg-transparent border-muted-foreground/30 hover:border-red-600/50"
                                                }`}
                                            onClick={() => setFormData(prev => ({ ...prev, scoreA: "3", scoreB: "0", winnerId: selectedMatch.teamAId || "" }))}
                                        >
                                            {formData.scoreA === "3" && <Trophy className="h-8 w-8 text-white" />}
                                        </div>
                                    </div>

                                    {mode === 'sumo' && (
                                        <div className="w-full">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2 block text-center flex items-center justify-center gap-1">
                                                <Target className="w-3 h-3" /> KO Pts
                                            </Label>
                                            <div className="flex justify-center gap-3">
                                                {[1, 2].map(i => {
                                                    const current = parseInt(formData.koA || "0")
                                                    return (
                                                        <button
                                                            key={i}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${i <= current
                                                                ? "bg-red-600 border-red-600"
                                                                : "bg-transparent border-muted-foreground/30 hover:border-red-600/50"
                                                                }`}
                                                            onClick={() => {
                                                                const newVal = i === current ? i - 1 : i
                                                                const otherVal = parseInt(formData.koB || "0")
                                                                if (newVal + otherVal > 3) return // Max 3 rule
                                                                setFormData(prev => ({ ...prev, koA: newVal.toString() }))
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'soccer' && (
                                        <div className="w-full">
                                            <Label className="text-xs text-center block mb-1">Goles</Label>
                                            <Input
                                                type="number"
                                                className="text-center text-lg font-bold"
                                                value={formData.goalsA}
                                                onChange={e => setFormData(prev => ({ ...prev, goalsA: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Team B Inputs */}
                                <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-border/50 flex flex-col items-center">
                                    <div className="w-full">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3 block text-center">Win Points</Label>
                                        <div
                                            className={`w-16 h-16 mx-auto rounded-full border-4 cursor-pointer flex items-center justify-center transition-all ${formData.scoreB === "3"
                                                ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                                : "bg-transparent border-muted-foreground/30 hover:border-blue-600/50"
                                                }`}
                                            onClick={() => setFormData(prev => ({ ...prev, scoreB: "3", scoreA: "0", winnerId: selectedMatch.teamBId || "" }))}
                                        >
                                            {formData.scoreB === "3" && <Trophy className="h-8 w-8 text-white" />}
                                        </div>
                                    </div>

                                    {mode === 'sumo' && (
                                        <div className="w-full">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2 block text-center flex items-center justify-center gap-1">
                                                <Target className="w-3 h-3" /> KO Pts
                                            </Label>
                                            <div className="flex justify-center gap-3">
                                                {[1, 2].map(i => {
                                                    const current = parseInt(formData.koB || "0")
                                                    return (
                                                        <button
                                                            key={i}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${i <= current
                                                                ? "bg-blue-600 border-blue-600"
                                                                : "bg-transparent border-muted-foreground/30 hover:border-blue-600/50"
                                                                }`}
                                                            onClick={() => {
                                                                const newVal = i === current ? i - 1 : i
                                                                const otherVal = parseInt(formData.koA || "0")
                                                                if (newVal + otherVal > 3) return // Max 3 rule
                                                                setFormData(prev => ({ ...prev, koB: newVal.toString() }))
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'soccer' && (
                                        <div className="w-full">
                                            <Label className="text-xs text-center block mb-1">Goles</Label>
                                            <Input
                                                type="number"
                                                className="text-center text-lg font-bold"
                                                value={formData.goalsB}
                                                onChange={e => setFormData(prev => ({ ...prev, goalsB: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Race Time needs full width or different layout */}
                            {mode === 'race' && (
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <Label className="text-xs text-center block mb-1">Tiempo (seg)</Label>
                                        <Input
                                            type="number" step="0.01"
                                            className="text-center"
                                            value={formData.timeA}
                                            onChange={e => setFormData(prev => ({ ...prev, timeA: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-center block mb-1">Tiempo (seg)</Label>
                                        <Input
                                            type="number" step="0.01"
                                            className="text-center"
                                            value={formData.timeB}
                                            onChange={e => setFormData(prev => ({ ...prev, timeB: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button onClick={saveMatch} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Guardar Resultado
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Container: Vertical List vs Horizontal Columns */}
            <div className={viewMode === "list" ? "space-y-8" : "flex gap-8 overflow-x-auto pb-6 pt-2 snap-x"}>
                {rounds.map(roundKey => {
                    const [stage, roundStr] = roundKey.split('-')
                    const round = parseInt(roundStr)
                    const roundMatches = sortedMatches.filter(m => (m.stage || "bracket") === stage && m.round === round)

                    const title = stage === "group" ? `Clasificatoria - Ronda ${round}` : (
                        round === rounds.length ? "Final" :
                            round === rounds.length - 1 ? "Semifinal" :
                                `Ronda ${round}`
                    )

                    return (
                        <div key={roundKey} className={viewMode === "list" ? "" : "min-w-[320px] flex-shrink-0 snap-center"}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 sticky left-0 ${viewMode === 'list' ? 'text-left border-b pb-2' : 'text-center'}`}>
                                {title}
                            </h3>
                            <div className={viewMode === "list" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-6 justify-center h-full"}>
                                {roundMatches.map(match => {
                                    /* MATCH CARD RENDER */
                                    const isEditable = (match.teamAId && match.teamBId && match.teamAId !== match.teamBId) || false

                                    // Helper for direct winner selection (Still valid for quick access, or we keep it as dual option)
                                    // User asked to add the same format. 
                                    const handleWinSelect = async (winnerId: string) => {
                                        if (!isEditable) return
                                        if (match.winnerId === winnerId) return // Already set

                                        try {
                                            const updates = { status: "completed" as const, winnerId }
                                            await updateMatch(match.id!, updates)
                                            // Advance Bracket
                                            const { advanceBracket } = await import("@/lib/bracket-utils")
                                            await advanceBracket(match, winnerId, matches)
                                            await loadMatches()
                                        } catch (e) {
                                            console.error(e)
                                        }
                                    }

                                    // Helper for KO Circles
                                    const handleKoClick = async (team: 'A' | 'B', targetScore: number) => {
                                        if (!match.id || !isEditable) return

                                        const currentA = match.koPointsA || 0
                                        const currentB = match.koPointsB || 0

                                        // Max 3 constraint
                                        const newA = team === 'A' ? targetScore : currentA
                                        const newB = team === 'B' ? targetScore : currentB

                                        if ((newA + newB) > 3) return // Block change

                                        try {
                                            await updateMatch(match.id, {
                                                [team === 'A' ? 'koPointsA' : 'koPointsB']: targetScore
                                            })
                                            await loadMatches()
                                        } catch (e) {
                                            console.error(e)
                                        }
                                    }

                                    const renderCircles = (team: 'A' | 'B', currentScore: number) => {
                                        return null // Removed inline circles
                                    }

                                    return (
                                        <Card key={match.id} className={`relative transition-colors ${match.status === "completed" ? "bg-muted/30 border-green-500/20" : "hover:border-primary/50"}`}>

                                            <CardHeader className="py-2 px-4 pb-1">
                                                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase">
                                                    <span>Match #{match.matchNumber}</span>
                                                    <Badge variant={match.status === "completed" ? "secondary" : "outline"} className="text-[10px] h-5 px-1">
                                                        {match.status === "completed" ? "Fin" : "Pendiente"}
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-3 pt-2">
                                                <div className="space-y-3">
                                                    {/* Team A */}
                                                    <div
                                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${match.winnerId === match.teamAId ? "bg-green-500/10 ring-1 ring-green-500/50" : "hover:bg-accent"
                                                            }`}
                                                        onClick={() => stage !== "group" && isEditable && handleWinSelect(match.teamAId!)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* Removed inline renderCircles */}
                                                            <span className={`text-sm truncate font-medium max-w-[120px] ${match.winnerId === match.teamAId ? "text-green-600 font-bold" : ""}`}>
                                                                {getTeamName(match.teamAId)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {match.winnerId === match.teamAId && <Trophy className="h-4 w-4 text-green-600" />}
                                                            {stage === "group" && <span className="text-sm font-mono text-muted-foreground">{match.scoreA ?? "-"}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Team B */}
                                                    <div
                                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${match.winnerId === match.teamBId ? "bg-green-500/10 ring-1 ring-green-500/50" : "hover:bg-accent"
                                                            }`}
                                                        onClick={() => stage !== "group" && isEditable && handleWinSelect(match.teamBId!)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* Removed inline renderCircles */}
                                                            <span className={`text-sm truncate font-medium max-w-[120px] ${match.winnerId === match.teamBId ? "text-green-600 font-bold" : ""}`}>
                                                                {getTeamName(match.teamBId)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {match.winnerId === match.teamBId && <Trophy className="h-4 w-4 text-green-600" />}
                                                            {stage === "group" && <span className="text-sm font-mono text-muted-foreground">{match.scoreB ?? "-"}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full h-8 text-xs mt-3"
                                                    onClick={() => openEdit(match)}
                                                    disabled={!isEditable}
                                                >
                                                    <Edit2 className="h-3 w-3 mr-2" />
                                                    Gestionar
                                                </Button>
                                            </CardContent>
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
