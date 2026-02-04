"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  User, Hash, School, Mail, Calendar, Users, Trophy, 
  LogOut, Settings, Bell, ChevronRight, Loader2, Plus,
  GraduationCap, Check, X
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
  getTeamMembers,
  getProfile,
  type Team,
  type Event,
  type TeamInvite,
  type UserProfile,
  TEAM_ICONS,
  TEAM_COLORS,
} from "@/lib/firebase"
import { TeamIcon } from "@/components/team-icon"

interface InviteWithDetails extends TeamInvite {
  team?: Team
  event?: Event
  inviterProfile?: UserProfile
}

interface TeamWithDetails extends Team {
  event?: Event
  memberCount?: number
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [invites, setInvites] = useState<InviteWithDetails[]>([])
  const [myTeams, setMyTeams] = useState<TeamWithDetails[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [processingInvite, setProcessingInvite] = useState<string | null>(null)

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

        // Load my teams (where I'm leader)
        const teams = await getUserLeadingTeams(user.uid)
        const teamsWithDetails = await Promise.all(
          teams.map(async (team) => {
            const event = team.eventId ? await getEventById(team.eventId) : null
            const members = team.id ? await getTeamMembers(team.id) : []
            return {
              ...team,
              event: event || undefined,
              memberCount: members.length,
            }
          })
        )
        setMyTeams(teamsWithDetails)
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

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

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
                    <User className="h-10 w-10 text-muted-foreground" />
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
                  <Button variant="outline" onClick={handleLogout} className="sm:self-center bg-transparent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesion
                  </Button>
                </div>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equipos" className="gap-2">
                  <Users className="h-4 w-4" />
                  Mis equipos
                  {myTeams.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{myTeams.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="invitaciones" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Invitaciones
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
                              <Badge variant={team.isConfirmed ? "default" : "secondary"}>
                                {team.isConfirmed ? "Confirmado" : "Pendiente"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {team.event?.name || "Evento"} - {team.memberCount} miembros
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/equipo/${team.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
    </main>
  )
}
