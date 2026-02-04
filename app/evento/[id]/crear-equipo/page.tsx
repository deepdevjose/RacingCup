"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ChevronLeft, Loader2, Check, Users, Palette, ImageIcon
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
  createTeam,
  getUserTeamInEvent,
  type Event,
  TEAM_ICONS,
  TEAM_COLORS,
} from "@/lib/firebase"
import { TeamIcon } from "@/components/team-icon"

export default function CrearEquipoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const [teamName, setTeamName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState<typeof TEAM_ICONS[number]>("robot")
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].value)

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

  useEffect(() => {
    async function checkExistingTeam() {
      if (user && eventId) {
        const existingTeam = await getUserTeamInEvent(user.uid, eventId)
        if (existingTeam) {
          router.push(`/equipo/${existingTeam.id}`)
        }
      }
    }
    if (!authLoading && user) {
      checkExistingTeam()
    }
  }, [user, authLoading, eventId, router])

  const handleCreate = async () => {
    if (!user || !teamName.trim()) return

    setCreating(true)
    setError("")

    try {
      const teamId = await createTeam(
        eventId,
        teamName.trim(),
        user.uid,
        selectedIcon,
        selectedColor
      )
      router.push(`/equipo/${teamId}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el equipo"
      setError(errorMessage)
      setCreating(false)
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
        <div className="max-w-xl mx-auto">
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
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Crear equipo</CardTitle>
                <CardDescription>
                  Crea tu equipo para participar en {event.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="teamName">Nombre del equipo</Label>
                  <Input
                    id="teamName"
                    placeholder="Nombre de tu equipo"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    maxLength={30}
                  />
                </div>

                {/* Icon Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Icono del equipo
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {TEAM_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedIcon === icon
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <TeamIcon icon={icon} color={selectedColor} size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color del equipo
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {TEAM_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedColor === color.value
                            ? "border-foreground ring-2 ring-foreground/20"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <Check className="h-5 w-5 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-sm text-muted-foreground mb-3">Vista previa:</p>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedColor + "20" }}
                    >
                      <TeamIcon icon={selectedIcon} color={selectedColor} size={28} />
                    </div>
                    <div>
                      <p className="font-semibold">{teamName || "Nombre del equipo"}</p>
                      <p className="text-sm text-muted-foreground">{event.name}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleCreate}
                  disabled={!teamName.trim() || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando equipo...
                    </>
                  ) : (
                    "Crear equipo"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
