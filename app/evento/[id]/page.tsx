"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Calendar, MapPin, Users, Trophy, ChevronLeft,
  Loader2, Plus, Clock, CheckCircle, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveBracket } from "@/components/tournament/live-bracket"
import { Scoreboard } from "@/components/tournament/scoreboard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import {
  getEventById,
  getConfirmedTeamsByEvent,
  getUserTeamInEvent,
  type Event,
  type Team,
  type EventStatus,
} from "@/lib/firebase"
import { TeamIcon } from "@/components/team-icon"

const statusLabels: Record<EventStatus, string> = {
  registro_abierto: "Registro abierto",
  cerrado: "Registro cerrado",
  en_curso: "En curso",
  finalizado: "Finalizado",
}

export default function EventoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  const eventId = params.id as string

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEventById(eventId)
        setEvent(eventData)

        if (eventData) {
          const confirmedTeams = await getConfirmedTeamsByEvent(eventId)
          setTeams(confirmedTeams)
        }
      } catch (error) {
        console.error("Error loading event:", error)
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [eventId])

  useEffect(() => {
    async function checkUserTeam() {
      if (user && eventId) {
        const team = await getUserTeamInEvent(user.uid, eventId)
        setUserTeam(team)
      }
    }
    if (!authLoading && user) {
      checkUserTeam()
    }
  }, [user, authLoading, eventId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
            <Button asChild>
              <Link href="/eventos">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a eventos
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const eventDate = new Date(event.date)
  const isRegistrationOpen = event.status === "registro_abierto"
  const canCreateTeam = isRegistrationOpen && user && !userTeam

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/eventos">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Todos los eventos
            </Link>
          </Button>

          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm mb-8 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.55_0.22_25_/_0.3),transparent_60%)]" />
              </div>
              <CardContent className="pt-0 pb-6 px-6 -mt-8 relative">
                <div className="w-16 h-16 rounded-lg bg-background border-4 border-background flex items-center justify-center mb-4 shadow-lg">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold">{event.name}</h1>
                      <Badge variant={isRegistrationOpen ? "default" : "secondary"}>
                        {statusLabels[event.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {eventDate.toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Status */}
          {!authLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              {!user ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Inicia sesion para crear o unirte a un equipo</span>
                    <Button size="sm" asChild>
                      <Link href="/login">Iniciar sesion</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : userTeam ? (
                <Alert className="border-primary/50 bg-primary/5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Ya eres parte del equipo <strong>{userTeam.name}</strong> en este evento
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/equipo/${userTeam.id}`}>Ver mi equipo</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : isRegistrationOpen ? (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">Participa en este evento</h3>
                        <p className="text-sm text-muted-foreground">
                          Crea un equipo o unete a uno existente con un codigo de invitacion
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/evento/${eventId}/unirse`}>
                            Unirse con codigo
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href={`/evento/${eventId}/crear-equipo`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear equipo
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    El registro para este evento esta cerrado
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}


          {/* Main Content Tabs */}
          <div className="mb-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="bracket">Eliminatorias</TabsTrigger>
                <TabsTrigger value="standings">Tabla de Puntos</TabsTrigger>
                <TabsTrigger value="teams">Equipos</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                {/* Event Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-border/50 h-full">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Requisitos de equipo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Minimo {event.minTeamSize} integrantes
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Maximo {event.maxTeamSize} integrantes
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Formato: {event.format}
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Card className="border-border/50 h-full">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-primary" />
                          Categorias
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {event.categories.map((category) => (
                            <Badge key={category} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="bracket">
                <div className="space-y-8">
                  {event.categories.map(cat => (
                    <div key={cat} className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        {cat}
                      </h3>
                      <LiveBracket event={event} categoryId={cat} teams={teams} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="standings">
                <div className="space-y-8">
                  {event.categories.map(cat => (
                    <div key={cat} className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        {cat}
                      </h3>
                      <Scoreboard eventId={event.id!} categoryId={cat} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="teams">
                {/* Confirmed Teams List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Equipos confirmados
                        </span>
                        <Badge variant="secondary">{teams.length} equipos</Badge>
                      </CardTitle>
                      <CardDescription>
                        Equipos que han sido confirmados por el administrador
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {teams.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aun no hay equipos confirmados</p>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {teams.map((team) => (
                            <div
                              key={team.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: team.color + "20" }}
                              >
                                <TeamIcon icon={team.icon} color={team.color} size={20} />
                              </div>
                              <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Seed: {team.seed || "Por asignar"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>


        </div>
      </div>
      <Footer />
    </main>
  )
}
