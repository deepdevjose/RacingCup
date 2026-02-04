"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Calendar, MapPin, Users, Trophy, Clock, ChevronRight, 
  Loader2, Search, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  getAllEvents, 
  type Event,
  type EventStatus 
} from "@/lib/firebase"

const statusLabels: Record<EventStatus, string> = {
  registro_abierto: "Registro abierto",
  cerrado: "Registro cerrado",
  en_curso: "En curso",
  finalizado: "Finalizado",
}

const statusColors: Record<EventStatus, string> = {
  registro_abierto: "bg-green-500/20 text-green-400 border-green-500/30",
  cerrado: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  en_curso: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finalizado: "bg-muted text-muted-foreground border-border",
}

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadEvents() {
      try {
        const allEvents = await getAllEvents()
        // Sort by date, most recent first
        allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setEvents(allEvents)
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeEvents = filteredEvents.filter(e => e.status === "registro_abierto" || e.status === "en_curso")
  const pastEvents = filteredEvents.filter(e => e.status === "cerrado" || e.status === "finalizado")

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" />
              <span>Eventos disponibles</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Torneos y Competencias</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explora los eventos disponibles y registra tu equipo para competir
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-20 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay eventos disponibles</h3>
                <p className="text-muted-foreground">
                  Los eventos se publicaran proximamente. Mantente atento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Events */}
              {activeEvents.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Eventos activos
                  </h2>
                  <div className="space-y-4">
                    {activeEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} featured={index === 0} />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                    Eventos anteriores
                  </h2>
                  <div className="space-y-4">
                    {pastEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

function EventCard({ event, index, featured = false }: { event: Event; index: number; featured?: boolean }) {
  const eventDate = new Date(event.date)
  const isRegistrationOpen = event.status === "registro_abierto"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Card className={`border-border/50 hover:border-primary/50 transition-all ${featured ? "ring-1 ring-primary/30" : ""}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Date badge */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary">{eventDate.getDate()}</span>
                <span className="text-xs text-primary uppercase">
                  {eventDate.toLocaleString("es-MX", { month: "short" })}
                </span>
              </div>
            </div>

            {/* Event info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold truncate">{event.name}</h3>
                <Badge className={statusColors[event.status]}>
                  {statusLabels[event.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {event.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.minTeamSize}-{event.maxTeamSize} integrantes
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {event.categories.length} categorias
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="flex-shrink-0">
              <Button asChild disabled={!isRegistrationOpen}>
                <Link href={`/evento/${event.id}`}>
                  {isRegistrationOpen ? "Ver evento" : "Ver detalles"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
