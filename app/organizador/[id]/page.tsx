"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
    getEventById,
    getConfirmedTeamsByEvent,
    type Event,
    type Team
} from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import {
    Loader2,
    ChevronLeft,
    Layers,
    Trophy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchList } from "@/components/organizer/match-list"
import { BracketGenerator } from "@/components/organizer/bracket-generator"
import { QualifiersGenerator } from "@/components/organizer/qualifiers-generator"
import { generateMockTeams } from "@/scripts/generate-mock-teams"
import { Separator } from "@/components/ui/separator"

export default function OrganizerEventPage() {
    const { id } = useParams()
    const { user, profile, loading: authLoading } = useAuth()
    const router = useRouter()

    const [event, setEvent] = useState<Event | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)

    // Reload trigger for match list
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        async function loadData() {
            if (!id) return
            try {
                const [eventData, teamsData] = await Promise.all([
                    getEventById(id as string),
                    getConfirmedTeamsByEvent(id as string)
                ])
                setEvent(eventData)
                setTeams(teamsData)
            } catch (error) {
                console.error("Error loading event:", error)
            } finally {
                setLoading(false)
            }
        }

        if (profile?.isOrganizer || profile?.admin) {
            loadData()
        }
    }, [id, profile])

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <h1 className="text-xl font-bold mb-4">Evento no encontrado</h1>
                <Button asChild><Link href="/organizador">Volver</Link></Button>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-24 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                            <Link href="/organizador">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Volver al Panel
                            </Link>
                        </Button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">{event.name}</h1>
                                <p className="text-muted-foreground mt-1">
                                    Gestion de Torneo • {teams.length} equipos confirmados
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mock Generator (Dev Tool) */}
                    <div className="mb-6 p-4 bg-muted/30 border rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium">Herramientas de Desarrollo</h3>
                            <p className="text-xs text-muted-foreground">Generar datos de prueba para el torneo.</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                                if (!confirm("Esto creará 32 equipos de prueba en Minisumo. ¿Seguro?")) return
                                try {
                                    await generateMockTeams(event.id!, 32)
                                    alert("32 Equipos generados. Recarga la página.")
                                    window.location.reload()
                                } catch (e) {
                                    console.error(e)
                                    alert("Error generando equipos")
                                }
                            }}
                        >
                            <Loader2 className="h-3 w-3 mr-2" />
                            Generar 32 Equipos (Minisumo)
                        </Button>
                    </div>

                    {/* WINNER SECTION */}
                    {event.winnersConfirmed && event.firstTeamId && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 border rounded-xl flex items-center gap-6">
                            <div className="p-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/20">
                                <Trophy className="h-8 w-8 text-yellow-900" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">
                                    ¡Torneo Finalizado!
                                </h2>
                                <p className="text-lg font-medium mt-1">
                                    Ganador: <span className="font-bold text-foreground">
                                        {teams.find(t => t.id === event.firstTeamId)?.name || "Cargando..."}
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    El evento ha concluido y los resultados han sido registrados.
                                </p>
                            </div>
                        </div>
                    )}


                    <Tabs defaultValue={event.categories[0]}>
                        <TabsList className="w-full justify-start overflow-x-auto">
                            {event.categories.map(cat => (
                                <TabsTrigger key={cat} value={cat}>
                                    {cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {event.categories.map(cat => {
                            const catTeams = teams.filter(t =>
                                t.categories?.some(c => c.category === cat)
                                // Fallback for legacy teams without categories or if category logic differs
                                || (event.categories.length === 1)
                            )

                            return (
                                <TabsContent key={cat} value={cat} className="space-y-6 mt-6">
                                    <Tabs defaultValue="management" className="w-full">
                                        <TabsList className="grid w-[400px] grid-cols-3 mb-6">
                                            <TabsTrigger value="management">Gestión</TabsTrigger>
                                            <TabsTrigger value="qualifiers">Clasificatorias</TabsTrigger>
                                            <TabsTrigger value="bracket">Eliminatorias</TabsTrigger>
                                        </TabsList>

                                        {/* TAB 1: GESTIÓN & TOOLS */}
                                        <TabsContent value="management" className="space-y-8 animate-in fade-in-50">
                                            <div className="grid lg:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        <Layers className="h-5 w-5" /> Generadores
                                                    </h3>
                                                    <div className="p-4 border rounded-lg bg-card shadow-sm space-y-6">
                                                        <QualifiersGenerator
                                                            eventId={event.id!}
                                                            categoryId={cat}
                                                            teams={catTeams}
                                                            onGenerated={() => setRefreshKey(prev => prev + 1)}
                                                        />
                                                        <Separator className="my-4" />
                                                        <BracketGenerator
                                                            eventId={event.id!}
                                                            categoryId={cat}
                                                            teams={catTeams}
                                                            onGenerated={() => setRefreshKey(prev => prev + 1)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        <Trophy className="h-5 w-5" /> Información
                                                    </h3>
                                                    <div className="bg-muted/30 p-4 rounded-lg border text-sm text-muted-foreground space-y-2">
                                                        <p>
                                                            Usa las pestañas <strong>Clasificatorias</strong> y <strong>Eliminatorias</strong> para gestionar los partidos.
                                                        </p>
                                                        <ul className="list-disc list-inside space-y-1 ml-1">
                                                            <li>Genera primero las clasificatorias si es necesario.</li>
                                                            <li>Registra los resultados en la pestaña correspondiente.</li>
                                                            <li>Genera el bracket seleccionando los mejores clasificados.</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* TAB 2: CLASIFICATORIAS */}
                                        <TabsContent value="qualifiers" className="space-y-6 animate-in fade-in-50">
                                            <MatchList
                                                key={`qual-${cat}-${refreshKey}`}
                                                eventId={event.id!}
                                                categoryId={cat}
                                                teams={catTeams}
                                                filterStage="group"
                                                viewMode="list"
                                            />
                                        </TabsContent>

                                        {/* TAB 3: ELIMINATORIAS (BRACKET) */}
                                        <TabsContent value="bracket" className="space-y-6 animate-in fade-in-50">
                                            <MatchList
                                                key={`brack-${cat}-${refreshKey}`}
                                                eventId={event.id!}
                                                categoryId={cat}
                                                teams={catTeams}
                                                filterStage="bracket"
                                                viewMode="list"
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </TabsContent>
                            )
                        })}
                    </Tabs>
                </div>
            </div>
        </main >
    )
}
