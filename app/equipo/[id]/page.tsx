"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ChevronLeft, Loader2, Users, Copy, Check, Share2, 
  UserPlus, Trash2, Crown, Hash, AlertCircle, LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { 
  getTeamById,
  getEventById,
  getTeamMembers,
  getProfile,
  getProfileByGamertag,
  createInvite,
  deleteTeam,
  removeMemberFromTeam,
  type Team,
  type Event,
  type TeamMember,
  type UserProfile,
} from "@/lib/firebase"
import { TeamIcon } from "@/components/team-icon"

interface MemberWithProfile extends TeamMember {
  profile?: UserProfile
}

export default function EquipoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [inviteGamertag, setInviteGamertag] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const teamId = params.id as string
  const isLeader = user && team?.leaderUserId === user.uid
  const isMember = user && members.some(m => m.userId === user.uid)

  useEffect(() => {
    async function loadTeam() {
      try {
        const teamData = await getTeamById(teamId)
        setTeam(teamData)

        if (teamData) {
          const eventData = await getEventById(teamData.eventId)
          setEvent(eventData)

          const teamMembers = await getTeamMembers(teamId)
          const membersWithProfiles = await Promise.all(
            teamMembers.map(async (member) => {
              const profile = await getProfile(member.userId)
              return { ...member, profile: profile || undefined }
            })
          )
          setMembers(membersWithProfiles)
        }
      } catch (error) {
        console.error("Error loading team:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [teamId])

  const copyInviteCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleInvite = async () => {
    if (!user || !team || !inviteGamertag.trim()) return

    setInviting(true)
    setInviteError("")
    setInviteSuccess(false)

    try {
      const profile = await getProfileByGamertag(inviteGamertag.toUpperCase())
      if (!profile) {
        setInviteError("Usuario no encontrado")
        setInviting(false)
        return
      }

      if (profile.userId === user.uid) {
        setInviteError("No puedes invitarte a ti mismo")
        setInviting(false)
        return
      }

      await createInvite(teamId, team.eventId, profile.userId, user.uid)
      setInviteSuccess(true)
      setInviteGamertag("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al enviar invitacion"
      setInviteError(errorMessage)
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!team?.id) return
    setDeleting(true)
    try {
      await deleteTeam(team.id)
      router.push("/perfil")
    } catch (error) {
      console.error("Error deleting team:", error)
      setDeleting(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!user) return
    setLeaving(true)
    try {
      const memberToRemove = members.find(m => m.userId === user.uid)
      if (memberToRemove?.id) {
        await removeMemberFromTeam(memberToRemove.id)
        router.push("/perfil")
      }
    } catch (error) {
      console.error("Error leaving team:", error)
      setLeaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (!team) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Equipo no encontrado</h1>
          <Button asChild>
            <Link href="/perfil">Volver a mi perfil</Link>
          </Button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/perfil">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Mi perfil
            </Link>
          </Button>

          {/* Team Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 mb-6 overflow-hidden">
              <div 
                className="h-24"
                style={{ 
                  background: `linear-gradient(135deg, ${team.color}30 0%, ${team.color}10 100%)`
                }}
              />
              <CardContent className="pt-0 pb-6 px-6 -mt-8">
                <div className="flex items-end gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl border-4 border-background flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: team.color + "30" }}
                  >
                    <TeamIcon icon={team.icon} color={team.color} size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold">{team.name}</h1>
                      <Badge variant={team.isConfirmed ? "default" : "secondary"}>
                        {team.isConfirmed ? "Confirmado" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{event?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Invite Code */}
          {isLeader && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Codigo de invitacion
                  </CardTitle>
                  <CardDescription>
                    Comparte este codigo con otros usuarios para que se unan a tu equipo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={team.inviteCode}
                        readOnly
                        className="font-mono text-lg tracking-widest text-center"
                      />
                    </div>
                    <Button onClick={copyInviteCode} variant="secondary">
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Invite by Gamertag */}
          {isLeader && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Invitar por Gamertag
                  </CardTitle>
                  <CardDescription>
                    Busca un usuario por su gamertag para enviarle una invitacion directa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inviteError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{inviteError}</AlertDescription>
                    </Alert>
                  )}
                  {inviteSuccess && (
                    <Alert className="border-green-500/50 bg-green-500/10">
                      <Check className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-500">
                        Invitacion enviada correctamente
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ABCD1234"
                        value={inviteGamertag.replace("#", "")}
                        onChange={(e) => setInviteGamertag("#" + e.target.value.toUpperCase().replace("#", ""))}
                        className="pl-8 font-mono uppercase"
                        maxLength={9}
                      />
                    </div>
                    <Button 
                      onClick={handleInvite}
                      disabled={inviteGamertag.length < 9 || inviting}
                    >
                      {inviting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Invitar"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Team Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Miembros del equipo
                  </span>
                  <Badge variant="secondary">{members.length} miembros</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {member.profile?.displayName || "Usuario"}
                          </p>
                          {member.userId === team.leaderUserId && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {member.profile?.gamertag}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex gap-3 justify-end"
          >
            {isLeader ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar equipo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar equipo</DialogTitle>
                    <DialogDescription>
                      Esta accion no se puede deshacer. Se eliminaran todos los miembros e invitaciones del equipo.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteTeam}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : isMember ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Salir del equipo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Salir del equipo</DialogTitle>
                    <DialogDescription>
                      ¿Estas seguro de que quieres salir de este equipo?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleLeaveTeam}
                      disabled={leaving}
                    >
                      {leaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-2" />
                      )}
                      Salir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
