"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
    Loader2, Calendar, Trophy, Lock,
    ChevronRight, Users, LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getActiveEvents, type Event } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"

export default function OrganizerDashboard() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [events, setEvents] = useState<Event[]>([])
    const [loadingEvents, setLoadingEvents] = useState(true)

    useEffect(() => {
        async function loadEvents() {
            try {
                // In a real app, filtering by "organizedEvents" would happen here.
                // For this version, organizers see all active events.
                const activeEvents = await getActiveEvents()
                setEvents(activeEvents)
            } catch (error) {
                console.error("Error loading events:", error)
            } finally {
                setLoadingEvents(false)
            }
        }

        if (profile?.isOrganizer || profile?.admin) {
            loadEvents()
        }
    }, [profile])

    if (loading || loadingEvents) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Permission check
    if (!user || (!profile?.isOrganizer && !profile?.admin)) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
                            <Lock className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl">Acceso Restringido</CardTitle>
                        <CardDescription>
                            Esta área es exclusiva para organizadores del evento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/">
                            <Button className="w-full">Volver al inicio</Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-24 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <LayoutDashboard className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Panel de Organizador</h1>
                            <p className="text-muted-foreground">Gestiona los resultados y la logística del evento</p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Eventos Activos
                        </h2>

                        {events.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-muted-foreground">
                                    No hay eventos activos en este momento.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {events.map(event => (
                                    <Card key={event.id} className="hover:border-primary/50 transition-colors">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant={event.status === "en_curso" ? "default" : "secondary"}>
                                                    {event.status === "en_curso" ? "En Curso" : "Registro Abierto"}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {event.categories.map(cat => (
                                                    <Badge key={cat} variant="outline" className="text-xs">
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    Participantes
                                                </div>
                                                <Button asChild>
                                                    <Link href={`/organizador/${event.id}`}>
                                                        Gestionar
                                                        <ChevronRight className="h-4 w-4 ml-2" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
