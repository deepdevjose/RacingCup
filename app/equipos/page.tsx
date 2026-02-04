"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Loader2,
  Bot,
} from "lucide-react"
import { getAllTeams, getTeamMembers, getAllEvents, type Team, type Event, type TeamMember } from "@/lib/firebase"
import { TeamIcon } from "@/components/team-icon"

interface TeamWithDetails extends Team {
  members: TeamMember[]
  event?: Event
}

export default function EquiposPage() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([])
  const [filteredTeams, setFilteredTeams] = useState<TeamWithDetails[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [eventFilter, setEventFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function loadData() {
      try {
        const [teamsData, eventsData] = await Promise.all([
          getAllTeams(),
          getAllEvents(),
        ])
        
        // Load members for each team
        const teamsWithDetails = await Promise.all(
          teamsData.map(async (team) => {
            const members = await getTeamMembers(team.id!)
            const event = eventsData.find((e) => e.id === team.eventId)
            return { ...team, members, event }
          })
        )
        
        setTeams(teamsWithDetails)
        setFilteredTeams(teamsWithDetails)
        setEvents(eventsData)
      } catch (error) {
        console.error("Error loading teams:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    let result = [...teams]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((team) =>
        team.name.toLowerCase().includes(query)
      )
    }

    // Event filter
    if (eventFilter !== "all") {
      result = result.filter((team) => team.eventId === eventFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "confirmed") {
        result = result.filter((team) => team.isConfirmed)
      } else {
        result = result.filter((team) => !team.isConfirmed)
      }
    }

    setFilteredTeams(result)
  }, [teams, searchQuery, eventFilter, statusFilter])

  const confirmedCount = teams.filter((t) => t.isConfirmed).length
  const pendingCount = teams.filter((t) => !t.isConfirmed).length
  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Equipos Participantes
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conoce a los equipos que competiran en el torneo de robotica mas
              importante del año
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {teams.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Equipos totales
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {confirmedCount}
                </div>
                <div className="text-sm text-muted-foreground">Confirmados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {pendingCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Por confirmar
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {totalMembers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Participantes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar equipos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id!}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Por confirmar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Teams grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {teams.length === 0
                    ? "Aun no hay equipos registrados"
                    : "No se encontraron equipos"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {teams.length === 0
                    ? "Se el primero en registrar tu equipo"
                    : "Intenta con otros filtros de busqueda"}
                </p>
                {teams.length === 0 && (
                  <Link href="/registro">
                    <Button>Registrar mi equipo</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team, index) => (
                <Card
                  key={team.id}
                  className="group hover:border-primary/50 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TeamIcon icon={team.icon} color={team.color} size="md" />
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {team.name}
                          </h3>
                          {team.event && (
                            <Badge variant="outline" className="mt-1">
                              {team.event.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={team.isConfirmed ? "default" : "secondary"}>
                        {team.isConfirmed ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {team.isConfirmed ? "Confirmado" : "Pendiente"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{team.members.length} integrantes</span>
                      </div>
                      {team.seed && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Seed: #{team.seed}</span>
                        </div>
                      )}
                    </div>

                    {/* Categories & Prototypes */}
                    {team.categories && team.categories.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-2">
                          Categorias y prototipos:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {team.categories.map((entry, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Bot className="h-3 w-3 mr-1" />
                              {entry.prototypeName} ({entry.category})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members count */}
                    {team.members.length > 0 && !team.categories?.length && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-2">
                          {team.members.length} miembro{team.members.length !== 1 ? "s" : ""} en el equipo
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-10">
                <h3 className="text-xl font-semibold mb-2">
                  Quieres participar?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Registra a tu equipo y compite contra los mejores
                </p>
                <Link href="/registro">
                  <Button size="lg">Registrar mi equipo</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
