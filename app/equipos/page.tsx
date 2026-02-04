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
  MapPin,
  Building2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Loader2,
  Bot,
} from "lucide-react"
import { getPublicTeams, type Team, type TeamStatus } from "@/lib/firebase"

const categories = [
  { value: "all", label: "Todas las categorías" },
  { value: "sumo_3kg", label: "Sumo 3kg" },
  { value: "seguidor_linea", label: "Seguidor de línea" },
  { value: "innovacion", label: "Innovación" },
]

const statusLabels: Record<TeamStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  preregistrado: { label: "Preregistrado", variant: "outline" },
  por_confirmar: { label: "Por confirmar", variant: "secondary" },
  confirmado: { label: "Confirmado", variant: "default" },
}

function getCategoryLabel(value: string): string {
  const cat = categories.find((c) => c.value === value)
  return cat?.label || value
}

export default function EquiposPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await getPublicTeams()
        setTeams(data)
        setFilteredTeams(data)
      } catch (error) {
        console.error("[v0] Error loading teams:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTeams()
  }, [])

  useEffect(() => {
    let result = [...teams]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.institution.toLowerCase().includes(query) ||
          team.city.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((team) => team.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((team) => team.status === statusFilter)
    }

    setFilteredTeams(result)
  }, [teams, searchQuery, categoryFilter, statusFilter])

  const confirmedCount = teams.filter((t) => t.status === "confirmado").length
  const pendingCount = teams.filter((t) => t.status === "por_confirmar").length

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
              Conoce a los equipos que competirán en el torneo de robótica más
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
                  {teams.reduce((acc, t) => acc + t.members.length, 0)}
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
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
                <SelectItem value="confirmado">Confirmados</SelectItem>
                <SelectItem value="por_confirmar">Por confirmar</SelectItem>
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
                    ? "Aún no hay equipos registrados"
                    : "No se encontraron equipos"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {teams.length === 0
                    ? "Sé el primero en registrar tu equipo"
                    : "Intenta con otros filtros de búsqueda"}
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
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {team.name}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {getCategoryLabel(team.category)}
                        </Badge>
                      </div>
                      <Badge variant={statusLabels[team.status].variant}>
                        {team.status === "confirmado" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {statusLabels[team.status].label}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{team.institution}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{team.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{team.members.length} integrantes</span>
                      </div>
                    </div>

                    {/* Members preview */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-2">
                        Integrantes:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {team.members.slice(0, 3).map((member, i) => (
                          <span
                            key={i}
                            className="text-xs bg-muted px-2 py-1 rounded-full"
                          >
                            {member.name.split(" ")[0]}
                          </span>
                        ))}
                        {team.members.length > 3 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            +{team.members.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
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
                  ¿Quieres participar?
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
