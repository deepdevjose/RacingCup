"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bot,
  Users,
  Trophy,
  Calendar,
  Search,
  Loader2,
  Lock,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Settings2,
  Hash,
  Bell,
  Megaphone,
  AlertTriangle,
  Info,
} from "lucide-react"
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllTeams,
  getTeamMembers,
  getProfile,
  updateTeamConfirmation,
  updateTeamSeed,
  deleteTeam,
  getAllProfiles,
  createNotification,
  getAllNotifications,
  deleteNotification,
  type Event,
  type EventStatus,
  type Team,
  type UserProfile,
  type TeamMember,
  type Notification,
  type NotificationType,
  type NotificationTarget,
} from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { TeamIcon } from "@/components/team-icon"

const statusLabels: Record<EventStatus, string> = {
  registro_abierto: "Registro abierto",
  cerrado: "Cerrado",
  en_curso: "En curso",
  finalizado: "Finalizado",
}

interface TeamWithDetails extends Team {
  members?: (TeamMember & { profile?: UserProfile })[]
  leaderProfile?: UserProfile
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const isAdmin = profile?.admin === true

  // Data
  const [events, setEvents] = useState<Event[]>([])
  const [teams, setTeams] = useState<TeamWithDetails[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [teamFilter, setTeamFilter] = useState<"all" | "confirmed" | "pending">("all")

  // Dialogs
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | null>(null)
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null)
  const [updating, setUpdating] = useState(false)
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isNewNotificationOpen, setIsNewNotificationOpen] = useState(false)
  
  // New notification form
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "announcement" as NotificationType,
    target: "all" as NotificationTarget,
    targetId: "",
  })

  // New event form
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    minTeamSize: 2,
    maxTeamSize: 5,
    format: "",
    categories: "",
    status: "registro_abierto" as EventStatus,
  })

  // Load data when admin is authenticated
  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  async function loadData() {
    setLoading(true)
    try {
      const [eventsData, teamsData, usersData, notificationsData] = await Promise.all([
        getAllEvents(),
        getAllTeams(),
        getAllProfiles(),
        getAllNotifications(),
      ])
      
      setEvents(eventsData)
      setUsers(usersData)
      setNotifications(notificationsData)

      // Load team details
      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          const members = team.id ? await getTeamMembers(team.id) : []
          const membersWithProfiles = await Promise.all(
            members.map(async (m) => ({
              ...m,
              profile: (await getProfile(m.userId)) || undefined,
            }))
          )
          const leaderProfile = team.leaderUserId 
            ? (await getProfile(team.leaderUserId)) || undefined
            : undefined
          return {
            ...team,
            members: membersWithProfiles,
            leaderProfile,
          }
        })
      )
      setTeams(teamsWithDetails)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    setUpdating(true)
    try {
      await createEvent({
        name: newEvent.name,
        date: new Date(newEvent.date),
        location: newEvent.location,
        description: newEvent.description,
        minTeamSize: newEvent.minTeamSize,
        maxTeamSize: newEvent.maxTeamSize,
        format: newEvent.format,
        categories: newEvent.categories.split(",").map((c) => c.trim()).filter(Boolean),
        status: newEvent.status,
      })
      await loadData()
      setIsNewEventOpen(false)
      setNewEvent({
        name: "",
        date: "",
        location: "",
        description: "",
        minTeamSize: 2,
        maxTeamSize: 5,
        format: "",
        categories: "",
        status: "registro_abierto",
      })
    } catch (error) {
      console.error("Error creating event:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleEditEvent = async () => {
    if (!selectedEventForEdit?.id) return
    setUpdating(true)
    try {
      await updateEvent(selectedEventForEdit.id, {
        name: selectedEventForEdit.name,
        date: selectedEventForEdit.date instanceof Date 
          ? selectedEventForEdit.date 
          : new Date(selectedEventForEdit.date),
        location: selectedEventForEdit.location,
        description: selectedEventForEdit.description,
        minTeamSize: selectedEventForEdit.minTeamSize,
        maxTeamSize: selectedEventForEdit.maxTeamSize,
        format: selectedEventForEdit.format,
        categories: selectedEventForEdit.categories,
        status: selectedEventForEdit.status,
      })
      await loadData()
      setIsEditEventOpen(false)
      setSelectedEventForEdit(null)
    } catch (error) {
      console.error("Error updating event:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete?.id) return
    setUpdating(true)
    try {
      await deleteEvent(eventToDelete.id)
      await loadData()
      setIsDeleteEventOpen(false)
      setEventToDelete(null)
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setUpdating(false)
    }
  }

  const openEditEvent = (event: Event) => {
    setSelectedEventForEdit({ ...event })
    setIsEditEventOpen(true)
  }

  const handleCreateNotification = async () => {
    if (!user) return
    setUpdating(true)
    try {
      await createNotification({
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        target: newNotification.target,
        targetId: newNotification.target !== "all" ? newNotification.targetId : undefined,
        createdBy: user.uid,
      })
      await loadData()
      setIsNewNotificationOpen(false)
      setNewNotification({
        title: "",
        message: "",
        type: "announcement",
        target: "all",
        targetId: "",
      })
    } catch (error) {
      console.error("Error creating notification:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    setUpdating(true)
    try {
      await deleteNotification(id)
      await loadData()
    } catch (error) {
      console.error("Error deleting notification:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmTeam = async (teamId: string, confirmed: boolean) => {
    setUpdating(true)
    try {
      await updateTeamConfirmation(teamId, confirmed)
      await loadData()
    } catch (error) {
      console.error("Error updating team:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateSeed = async (teamId: string, seed: number) => {
    try {
      await updateTeamSeed(teamId, seed)
      await loadData()
    } catch (error) {
      console.error("Error updating seed:", error)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    setUpdating(true)
    try {
      await deleteTeam(teamId)
      await loadData()
      setSelectedTeam(null)
      setIsEditTeamOpen(false)
    } catch (error) {
      console.error("Error deleting team:", error)
    } finally {
      setUpdating(false)
    }
  }

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    if (selectedEvent !== "all" && team.eventId !== selectedEvent) return false
    if (teamFilter === "confirmed" && !team.isConfirmed) return false
    if (teamFilter === "pending" && team.isConfirmed) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        team.name.toLowerCase().includes(query) ||
        team.leaderProfile?.displayName?.toLowerCase().includes(query) ||
        team.leaderProfile?.gamertag?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.displayName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.gamertag?.toLowerCase().includes(query)
    )
  })

  // Stats
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter((e) => e.status === "registro_abierto" || e.status === "en_curso").length,
    totalTeams: teams.length,
    confirmedTeams: teams.filter((t) => t.isConfirmed).length,
    totalUsers: users.length,
    teachers: users.filter((u) => u.isTeacher).length,
  }

  // Loading state
  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Panel de Administracion</CardTitle>
            <CardDescription>
              Debes iniciar sesion para acceder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full">Iniciar sesion</Button>
            </Link>
            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Acceso denegado</CardTitle>
            <CardDescription>
              No tienes permisos de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Contacta al administrador del sistema si crees que esto es un error.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-mono text-lg font-bold">Racing Cup Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {profile?.displayName}
              </span>
              <Link href="/">
                <Button variant="ghost" size="sm">Ver sitio</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <div className="text-xs text-muted-foreground">Eventos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeEvents}</div>
                  <div className="text-xs text-muted-foreground">Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalTeams}</div>
                  <div className="text-xs text-muted-foreground">Equipos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.confirmedTeams}</div>
                  <div className="text-xs text-muted-foreground">Confirmados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">Usuarios</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.teachers}</div>
                  <div className="text-xs text-muted-foreground">Docentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList>
              <TabsTrigger value="events" className="gap-2">
                <Trophy className="h-4 w-4" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="teams" className="gap-2">
                <Users className="h-4 w-4" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Hash className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </TabsTrigger>
            </TabsList>

            {/* EVENTS TAB */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestion de Eventos</h2>
                <Button onClick={() => setIsNewEventOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo evento
                </Button>
              </div>

              <div className="grid gap-4">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay eventos creados</p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{event.name}</h3>
                              <Badge variant={event.status === "registro_abierto" ? "default" : "secondary"}>
                                {statusLabels[event.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })} - {event.location}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {event.categories.map((cat) => (
                                <Badge key={cat} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {teams.filter((t) => t.eventId === event.id).length} equipos
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditEvent(event)}
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEventToDelete(event)
                                setIsDeleteEventOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* TEAMS TAB */}
            <TabsContent value="teams" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id!}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={teamFilter} onValueChange={(v) => setTeamFilter(v as typeof teamFilter)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  {filteredTeams.length === 0 ? (
                    <div className="py-10 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay equipos</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipo</TableHead>
                          <TableHead>Lider</TableHead>
                          <TableHead>Evento</TableHead>
                          <TableHead>Miembros</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Seed</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeams.map((team) => {
                          const event = events.find((e) => e.id === team.eventId)
                          return (
                            <TableRow key={team.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-8 h-8 rounded flex items-center justify-center"
                                    style={{ backgroundColor: team.color + "30" }}
                                  >
                                    <TeamIcon icon={team.icon} color={team.color} size={18} />
                                  </div>
                                  <span className="font-medium">{team.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div>{team.leaderProfile?.displayName || "—"}</div>
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {team.leaderProfile?.gamertag}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{event?.name || "—"}</TableCell>
                              <TableCell>{team.members?.length || 0}</TableCell>
                              <TableCell>
                                {team.isConfirmed ? (
                                  <Badge className="bg-green-500/20 text-green-500">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirmado
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pendiente
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  className="w-16 h-8"
                                  value={team.seed || ""}
                                  onChange={(e) => team.id && handleUpdateSeed(team.id, Number(e.target.value))}
                                  placeholder="—"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {team.isConfirmed ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => team.id && handleConfirmTeam(team.id, false)}
                                      disabled={updating}
                                    >
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => team.id && handleConfirmTeam(team.id, true)}
                                      disabled={updating}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTeam(team)
                                      setIsEditTeamOpen(true)
                                    }}
                                  >
                                    <Settings2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  {filteredUsers.length === 0 ? (
                    <div className="py-10 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay usuarios registrados</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gamertag</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Escuela</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Registro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell className="font-mono">{user.gamertag}</TableCell>
                            <TableCell>{user.displayName}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>{user.school}</TableCell>
                            <TableCell>
                              {user.isTeacher ? (
                                <Badge variant="secondary">Docente</Badge>
                              ) : (
                                <Badge variant="outline">Estudiante</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-MX") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestion de Notificaciones</h2>
                <Button onClick={() => setIsNewNotificationOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva notificacion
                </Button>
              </div>

              <div className="grid gap-4">
                {notifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay notificaciones creadas</p>
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((notification) => {
                    const targetEvent = notification.target === "event" 
                      ? events.find(e => e.id === notification.targetId)
                      : null
                    const targetTeam = notification.target === "team"
                      ? teams.find(t => t.id === notification.targetId)
                      : null
                    
                    return (
                      <Card key={notification.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                notification.type === "announcement" ? "bg-primary/10 text-primary" :
                                notification.type === "warning" ? "bg-yellow-500/10 text-yellow-500" :
                                "bg-blue-500/10 text-blue-500"
                              }`}>
                                {notification.type === "announcement" ? <Megaphone className="h-4 w-4" /> :
                                 notification.type === "warning" ? <AlertTriangle className="h-4 w-4" /> :
                                 <Info className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{notification.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {notification.target === "all" ? "Todos" :
                                     notification.target === "event" ? `Evento: ${targetEvent?.name || "—"}` :
                                     `Equipo: ${targetTeam?.name || "—"}`}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString("es-MX", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })} - Leido por {notification.readBy?.length || 0} usuarios
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => notification.id && handleDeleteNotification(notification.id)}
                              disabled={updating}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* New Event Dialog */}
      <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear nuevo evento</DialogTitle>
            <DialogDescription>
              Configura los detalles del nuevo evento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del evento</Label>
              <Input
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                placeholder="Ej: Racing Cup TICs 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ubicacion</Label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ej: ITSOEH"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descripcion del evento..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Min miembros</Label>
                <Input
                  type="number"
                  value={newEvent.minTeamSize}
                  onChange={(e) => setNewEvent({ ...newEvent, minTeamSize: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max miembros</Label>
                <Input
                  type="number"
                  value={newEvent.maxTeamSize}
                  onChange={(e) => setNewEvent({ ...newEvent, maxTeamSize: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={newEvent.status}
                  onValueChange={(v) => setNewEvent({ ...newEvent, status: v as EventStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registro_abierto">Registro abierto</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Input
                value={newEvent.format}
                onChange={(e) => setNewEvent({ ...newEvent, format: e.target.value })}
                placeholder="Ej: Eliminacion directa"
              />
            </div>
            <div className="space-y-2">
              <Label>Categorias (separadas por coma)</Label>
              <Input
                value={newEvent.categories}
                onChange={(e) => setNewEvent({ ...newEvent, categories: e.target.value })}
                placeholder="Ej: Sumo 3kg, Seguidor de linea, Innovacion"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEventOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEvent} disabled={updating || !newEvent.name}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crear evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar evento</DialogTitle>
            <DialogDescription>
              Modifica los detalles del evento
            </DialogDescription>
          </DialogHeader>
          {selectedEventForEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre del evento</Label>
                <Input
                  value={selectedEventForEdit.name}
                  onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={selectedEventForEdit.date instanceof Date 
                      ? selectedEventForEdit.date.toISOString().split('T')[0] 
                      : new Date(selectedEventForEdit.date).toISOString().split('T')[0]}
                    onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ubicacion</Label>
                  <Input
                    value={selectedEventForEdit.location}
                    onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={selectedEventForEdit.description}
                  onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min miembros</Label>
                  <Input
                    type="number"
                    value={selectedEventForEdit.minTeamSize}
                    onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, minTeamSize: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max miembros</Label>
                  <Input
                    type="number"
                    value={selectedEventForEdit.maxTeamSize}
                    onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, maxTeamSize: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={selectedEventForEdit.status}
                    onValueChange={(v) => setSelectedEventForEdit({ ...selectedEventForEdit, status: v as EventStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registro_abierto">Registro abierto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                      <SelectItem value="en_curso">En curso</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Formato</Label>
                <Input
                  value={selectedEventForEdit.format}
                  onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, format: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categorias (separadas por coma)</Label>
                <Input
                  value={selectedEventForEdit.categories.join(", ")}
                  onChange={(e) => setSelectedEventForEdit({ 
                    ...selectedEventForEdit, 
                    categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean) 
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditEvent} disabled={updating || !selectedEventForEdit?.name}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <Dialog open={isDeleteEventOpen} onOpenChange={setIsDeleteEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara el evento permanentemente.
            </DialogDescription>
          </DialogHeader>
          {eventToDelete && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Estas a punto de eliminar el evento:
              </p>
              <p className="font-semibold mt-2">{eventToDelete.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esto tambien afectara a {teams.filter((t) => t.eventId === eventToDelete.id).length} equipos registrados.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteEventOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Eliminar evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del equipo</DialogTitle>
            <DialogDescription>
              {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedTeam.color + "30" }}
                >
                  <TeamIcon icon={selectedTeam.icon} color={selectedTeam.color} size={28} />
                </div>
                <div>
                  <p className="font-semibold">{selectedTeam.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Codigo: {selectedTeam.inviteCode}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Miembros</Label>
                <div className="mt-2 space-y-2">
                  {selectedTeam.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded bg-secondary/20">
                      <div>
                        <p className="font-medium">{member.profile?.displayName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{member.profile?.gamertag}</p>
                      </div>
                      {member.userId === selectedTeam.leaderUserId && (
                        <Badge variant="secondary">Lider</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => selectedTeam?.id && handleDeleteTeam(selectedTeam.id)}
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Eliminar equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Notification Dialog */}
      <Dialog open={isNewNotificationOpen} onOpenChange={setIsNewNotificationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear notificacion</DialogTitle>
            <DialogDescription>
              Envia un anuncio o aviso a los participantes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titulo</Label>
              <Input
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Ej: Aviso importante"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="Escribe el contenido de la notificacion..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(v) => setNewNotification({ ...newNotification, type: v as NotificationType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4" />
                        Anuncio
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Advertencia
                      </div>
                    </SelectItem>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Informacion
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destinatarios</Label>
                <Select
                  value={newNotification.target}
                  onValueChange={(v) => setNewNotification({ ...newNotification, target: v as NotificationTarget, targetId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="event">Participantes de evento</SelectItem>
                    <SelectItem value="team">Miembros de equipo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newNotification.target === "event" && (
              <div className="space-y-2">
                <Label>Seleccionar evento</Label>
                <Select
                  value={newNotification.targetId}
                  onValueChange={(v) => setNewNotification({ ...newNotification, targetId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id!}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newNotification.target === "team" && (
              <div className="space-y-2">
                <Label>Seleccionar equipo</Label>
                <Select
                  value={newNotification.targetId}
                  onValueChange={(v) => setNewNotification({ ...newNotification, targetId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id!}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewNotificationOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateNotification} 
              disabled={updating || !newNotification.title || !newNotification.message || (newNotification.target !== "all" && !newNotification.targetId)}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              Enviar notificacion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
