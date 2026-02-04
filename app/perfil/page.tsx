"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  User, Hash, School, Mail, Calendar, Users, Trophy, 
  LogOut, Settings, Bell, ChevronRight, Loader2, Plus,
  GraduationCap, Check, X, Edit2, AlertCircle, Megaphone,
  AlertTriangle, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { 
  logoutUser, 
  getUserPendingInvites, 
  acceptInvite, 
  rejectInvite,
  getTeamById,
  getEventById,
  getUserLeadingTeams,
  getUserTeams,
  getTeamMembers,
  getProfile,
  updateProfile,
  canUserEditProfile,
  getUserNotifications,
  markNotificationAsRead,
  leaveTeam,
  type Team,
  type Event,
  type TeamInvite,
  type UserProfile,
  type Notification,
  TEAM_ICONS,
  TEAM_COLORS,
  PLAYER_ICONS,
} from "@/lib/firebase"
import { PlayerIcon } from "@/components/player-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TeamIcon } from "@/components/team-icon"

interface InviteWithDetails extends TeamInvite {
  team?: Team
  event?: Event
  inviterProfile?: UserProfile
}

interface TeamWithDetails extends Team {
  event?: Event
  memberCount?: number
  isLeader?: boolean
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, profile, loading, refreshProfile } = useAuth()
  const [invites, setInvites] = useState<InviteWithDetails[]>([])
  const [myTeams, setMyTeams] = useState<TeamWithDetails[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [processingInvite, setProcessingInvite] = useState<string | null>(null)
  
  // Edit profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [canEdit, setCanEdit] = useState({ canEdit: true, reason: undefined as string | undefined })
  const [editForm, setEditForm] = useState({
    displayName: "",
    school: "",
    playerIcon: "user" as typeof PLAYER_ICONS[number],
  })
  const [savingProfile, setSavingProfile] = useState(false)
  
  // Leave team state
  const [teamToLeave, setTeamToLeave] = useState<TeamWithDetails | null>(null)
  const [leavingTeam, setLeavingTeam] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        // Load pending invites
        const pendingInvites = await getUserPendingInvites(user.uid)
        const invitesWithDetails = await Promise.all(
          pendingInvites.map(async (invite) => {
            const team = invite.teamId ? await getTeamById(invite.teamId) : null
            const event = invite.eventId ? await getEventById(invite.eventId) : null
            const inviterProfile = invite.inviterUserId ? await getProfile(invite.inviterUserId) : null
            return {
              ...invite,
              team: team || undefined,
              event: event || undefined,
              inviterProfile: inviterProfile || undefined,
            }
          })
        )
        setInvites(invitesWithDetails)

        // Load ALL my teams (where I'm member, not just leader)
        const allMyTeams = await getUserTeams(user.uid)
        const teamsWithDetails = await Promise.all(
          allMyTeams.map(async (team) => {
            const event = team.eventId ? await getEventById(team.eventId) : null
            const members = team.id ? await getTeamMembers(team.id) : []
            return {
              ...team,
              event: event || undefined,
              memberCount: members.length,
              isLeader: team.leaderUserId === user.uid,
            }
          })
        )
        setMyTeams(teamsWithDetails)
        
        // Load notifications
        const userNotifications = await getUserNotifications(user.uid)
        setNotifications(userNotifications)
        
        // Check if user can edit profile
        const editStatus = await canUserEditProfile(user.uid)
        setCanEdit(editStatus)
      } catch (error) {
        console.error("Error loading profile data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])
  
  // Initialize edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || "",
        school: profile.school || "",
        playerIcon: profile.playerIcon || "user",
      })
    }
  }, [profile])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const handleSaveProfile = async () => {
    if (!user || !canEdit.canEdit) return
    setSavingProfile(true)
    try {
      await updateProfile(user.uid, {
        displayName: editForm.displayName,
        school: editForm.school,
        playerIcon: editForm.playerIcon,
      })
      await refreshProfile()
      setIsEditProfileOpen(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!user || !teamToLeave?.id) return
    setLeavingTeam(true)
    try {
      await leaveTeam(user.uid, teamToLeave.id)
      setMyTeams(myTeams.filter(t => t.id !== teamToLeave.id))
      setTeamToLeave(null)
    } catch (error) {
      console.error("Error leaving team:", error)
    } finally {
      setLeavingTeam(false)
    }
  }

  const handleMarkNotificationRead = async (notificationId: string) => {
    if (!user) return
    try {
      await markNotificationAsRead(notificationId, user.uid)
      setNotifications(notifications.map(n => 
        n.id === notificationId 
          ? { ...n, readBy: [...(n.readBy || []), user.uid] }
          : n
      ))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const unreadNotifications = notifications.filter(n => !n.readBy?.includes(user?.uid || ""))

  const handleAcceptInvite = async (inviteId: string) => {
    if (!user) return
    setProcessingInvite(inviteId)
    try {
      await acceptInvite(inviteId, user.uid)
      setInvites(invites.filter(i => i.id !== inviteId))
      // Reload teams
      const teams = await getUserLeadingTeams(user.uid)
      const teamsWithDetails = await Promise.all(
        teams.map(async (team) => {
          const event = team.eventId ? await getEventById(team.eventId) : null
          const members = team.id ? await getTeamMembers(team.id) : []
          return { ...team, event: event || undefined, memberCount: members.length }
        })
      )
      setMyTeams(teamsWithDetails)
    } catch (error) {
      console.error("Error accepting invite:", error)
    } finally {
      setProcessingInvite(null)
    }
  }

  const handleRejectInvite = async (inviteId: string) => {
    setProcessingInvite(inviteId)
    try {
      await rejectInvite(inviteId)
      setInvites(invites.filter(i => i.id !== inviteId))
    } catch (error) {
      console.error("Error rejecting invite:", error)
    } finally {
      setProcessingInvite(null)
    }
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
              <CardContent className="pt-0 pb-6 px-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                  <div className="w-20 h-20 rounded-full bg-background border-4 border-background flex items-center justify-center">
                    <PlayerIcon icon={profile.playerIcon || "user"} size={40} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                      {profile.isTeacher && (
                        <Badge variant="secondary" className="gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Docente
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground font-mono">{profile.gamertag}</p>
                  </div>
                  <div className="flex gap-2 sm:self-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditProfileOpen(true)} 
                      className="bg-transparent"
                      disabled={!canEdit.canEdit}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="bg-transparent">
                      <LogOut className="h-4 w-4 mr-2" />
                      Salir
                    </Button>
                  </div>
                </div>
                {!canEdit.canEdit && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {canEdit.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50 bg-card/80">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="truncate">{profile.email}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50 bg-card/80">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Escuela:</span>
                    <span className="truncate">{profile.school}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 bg-card/80">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Gamertag:</span>
                    <span className="font-mono">{profile.gamertag}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Tabs defaultValue="equipos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equipos" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Mis equipos</span>
                  <span className="sm:hidden">Equipos</span>
                  {myTeams.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{myTeams.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notificaciones" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificaciones</span>
                  <span className="sm:hidden">Avisos</span>
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="ml-1">{unreadNotifications.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="invitaciones" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Invitaciones</span>
                  <span className="sm:hidden">Invites</span>
                  {invites.length > 0 && (
                    <Badge variant="destructive" className="ml-1">{invites.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equipos" className="space-y-4">
                {loadingData ? (
                  <Card className="border-border/50">
                    <CardContent className="py-10 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : myTeams.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="py-10 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No tienes equipos</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Unete a un evento para crear o unirte a un equipo
                      </p>
                      <Button asChild>
                        <Link href="/eventos">
                          <Plus className="h-4 w-4 mr-2" />
                          Ver eventos disponibles
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  myTeams.map((team) => (
                    <Card key={team.id} className="border-border/50 hover:border-primary/50 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: team.color + "20" }}
                          >
                            <TeamIcon icon={team.icon} color={team.color} size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{team.name}</h3>
                              {team.isLeader && (
                                <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-500/50">
                                  <Trophy className="h-3 w-3" />
                                  Lider
                                </Badge>
                              )}
                              <Badge variant={team.isConfirmed ? "default" : "secondary"}>
                                {team.isConfirmed ? "Confirmado" : "Pendiente"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {team.event?.name || "Evento"} - {team.memberCount} miembros
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setTeamToLeave(team)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/equipo/${team.id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="notificaciones" className="space-y-4">
                {loadingData ? (
                  <Card className="border-border/50">
                    <CardContent className="py-10 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : notifications.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="py-10 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Sin notificaciones</h3>
                      <p className="text-sm text-muted-foreground">
                        No tienes notificaciones nuevas
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((notification) => {
                    const isUnread = !notification.readBy?.includes(user?.uid || "")
                    return (
                      <Card 
                        key={notification.id} 
                        className={`border-border/50 transition-colors ${isUnread ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full shrink-0 ${
                              notification.type === "announcement" ? "bg-primary/10 text-primary" :
                              notification.type === "warning" ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-blue-500/10 text-blue-500"
                            }`}>
                              {notification.type === "announcement" ? <Megaphone className="h-5 w-5" /> :
                               notification.type === "warning" ? <AlertTriangle className="h-5 w-5" /> :
                               <Info className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{notification.title}</h3>
                                {isUnread && (
                                  <Badge variant="default" className="text-xs">Nuevo</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString("es-MX", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }) : ""}
                              </p>
                            </div>
                            {isUnread && notification.id && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkNotificationRead(notification.id!)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </TabsContent>

              <TabsContent value="invitaciones" className="space-y-4">
                {loadingData ? (
                  <Card className="border-border/50">
                    <CardContent className="py-10 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : invites.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="py-10 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Sin invitaciones</h3>
                      <p className="text-sm text-muted-foreground">
                        No tienes invitaciones pendientes a equipos
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  invites.map((invite) => (
                    <Card key={invite.id} className="border-border/50 border-l-4 border-l-primary">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: (invite.team?.color || "#666") + "20" }}
                          >
                            <TeamIcon 
                              icon={invite.team?.icon || "robot"} 
                              color={invite.team?.color || "#666"} 
                              size={24} 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {invite.team?.name || "Equipo"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {invite.event?.name} - Invitado por {invite.inviterProfile?.displayName || "Usuario"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => invite.id && handleRejectInvite(invite.id)}
                              disabled={processingInvite === invite.id}
                            >
                              {processingInvite === invite.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => invite.id && handleAcceptInvite(invite.id)}
                              disabled={processingInvite === invite.id}
                            >
                              {processingInvite === invite.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu informacion personal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Escuela</Label>
              <Input
                value={editForm.school}
                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                placeholder="Nombre de tu escuela"
              />
            </div>
            <div className="space-y-3">
              <Label>Icono de jugador</Label>
              <div className="grid grid-cols-5 gap-2">
                {PLAYER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, playerIcon: icon })}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                      editForm.playerIcon === icon
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <PlayerIcon icon={icon} size={24} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Team Confirmation */}
      <AlertDialog open={!!teamToLeave} onOpenChange={(open) => !open && setTeamToLeave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salir del equipo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que quieres salir del equipo "{teamToLeave?.name}"?
              {teamToLeave?.isLeader && (
                <span className="block mt-2 text-destructive">
                  Eres el lider de este equipo. Si sales, el equipo sera eliminado.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveTeam}
              disabled={leavingTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {leavingTeam ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
