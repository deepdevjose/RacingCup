"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ChevronLeft, Loader2, Key, Users, AlertCircle, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { 
  getEventById, 
  getTeamByInviteCode,
  addTeamMember,
  getUserTeamInEvent,
  deleteTeam,
  getUserLeadingTeams,
  type Event,
  type Team,
} from "@/lib/firebase"
import { TeamIcon } from "@/components/team-icon"

export default function UnirsePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [foundTeam, setFoundTeam] = useState<Team | null>(null)
  const [searching, setSearching] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEventById(eventId)
        setEvent(eventData)
      } catch (error) {
        console.error("Error loading event:", error)
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [eventId])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleSearch = async () => {
    if (!code.trim()) return

    setSearching(true)
    setError("")
    setFoundTeam(null)

    try {
      const team = await getTeamByInviteCode(code.toUpperCase())
      if (!team) {
        setError("Codigo de invitacion no valido")
      } else if (team.eventId !== eventId) {
        setError("Este codigo pertenece a otro evento")
      } else {
        setFoundTeam(team)
      }
    } catch (error) {
      setError("Error al buscar el equipo")
    } finally {
      setSearching(false)
    }
  }

  const handleJoin = async () => {
    if (!user || !foundTeam) return

    setJoining(true)
    setError("")

    try {
      // Check if user already has a team
      const existingTeam = await getUserTeamInEvent(user.uid, eventId)
      if (existingTeam) {
        // If user is leader, delete their team
        const leadingTeams = await getUserLeadingTeams(user.uid)
        const isLeader = leadingTeams.some(t => t.id === existingTeam.id)
        if (isLeader && existingTeam.id) {
          await deleteTeam(existingTeam.id)
        }
      }

      // Join the new team
      await addTeamMember(eventId, foundTeam.id!, user.uid, "accepted")
      router.push(`/equipo/${foundTeam.id}`)
    } catch (error) {
      console.error("Error joining team:", error)
      setError("Error al unirse al equipo")
      setJoining(false)
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

  if (!event) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
          <Button asChild>
            <Link href="/eventos">Volver a eventos</Link>
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
        <div className="max-w-md mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/evento/${eventId}`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al evento
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Unirse a un equipo</CardTitle>
                <CardDescription>
                  Ingresa el codigo de invitacion para unirte a un equipo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Codigo de invitacion</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      placeholder="Ej: ABC123"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="font-mono uppercase"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={!code.trim() || searching}
                      variant="secondary"
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>
                </div>

                {foundTeam && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: foundTeam.color + "20" }}
                      >
                        <TeamIcon icon={foundTeam.icon} color={foundTeam.color} size={28} />
                      </div>
                      <div>
                        <p className="font-semibold">{foundTeam.name}</p>
                        <p className="text-sm text-muted-foreground">{event.name}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    </div>

                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Si eres lider de otro equipo en este evento, tu equipo sera eliminado al unirte a este.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      className="w-full"
                      onClick={handleJoin}
                      disabled={joining}
                    >
                      {joining ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uniendo...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Unirse al equipo
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes un codigo?{" "}
                  <Link href={`/evento/${eventId}/crear-equipo`} className="text-primary hover:underline">
                    Crea tu propio equipo
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
