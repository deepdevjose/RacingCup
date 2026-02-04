"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Mail, Lock, User, School, Hash, Bot, ArrowRight, 
  AlertCircle, Loader2, Check, X, GraduationCap 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { registerUser, createProfile, isGamertagAvailable } from "@/lib/firebase"

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form data
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [school, setSchool] = useState("")
  const [isTeacher, setIsTeacher] = useState(false)
  const [gamertag, setGamertag] = useState("")
  const [gamertagAvailable, setGamertagAvailable] = useState<boolean | null>(null)
  const [checkingGamertag, setCheckingGamertag] = useState(false)

  // Gamertag validation
  const validateGamertag = (tag: string): boolean => {
    const regex = /^#[A-Z0-9]{8}$/i
    return regex.test(tag)
  }

  // Check gamertag availability with debounce
  useEffect(() => {
    if (!gamertag || !validateGamertag(gamertag)) {
      setGamertagAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingGamertag(true)
      const available = await isGamertagAvailable(gamertag.toUpperCase())
      setGamertagAvailable(available)
      setCheckingGamertag(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [gamertag])

  const handleGamertagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase()
    if (!value.startsWith("#")) {
      value = "#" + value.replace("#", "")
    }
    // Limit to 9 chars (# + 8 alphanumeric)
    value = value.slice(0, 9)
    // Remove invalid characters
    value = "#" + value.slice(1).replace(/[^A-Z0-9]/g, "")
    setGamertag(value)
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateGamertag(gamertag)) {
      setError("El gamertag debe tener el formato #XXXXXXXX (8 caracteres alfanumericos)")
      return
    }

    if (!gamertagAvailable) {
      setError("Este gamertag ya esta en uso")
      return
    }

    setLoading(true)

    try {
      const user = await registerUser(email, password)
      await createProfile({
        userId: user.uid,
        email,
        displayName,
        gamertag: gamertag.toUpperCase(),
        school,
        isTeacher,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrarse"
      if (errorMessage.includes("email-already-in-use")) {
        setError("Este correo ya esta registrado")
      } else {
        setError("Error al crear la cuenta. Intenta de nuevo.")
      }
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.25_0.08_25_/_0.2),transparent_50%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verifica tu correo</h2>
              <p className="text-muted-foreground mb-6">
                Te hemos enviado un correo de verificacion a <strong>{email}</strong>. 
                Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
              <Button asChild>
                <Link href="/login">
                  Ir a iniciar sesion
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.25_0.08_25_/_0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.3_0.1_190_/_0.15),transparent_50%)]" />
      
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                           linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mx-auto">
              <Bot className="h-8 w-8 text-primary" />
              <span className="font-mono text-xl font-bold">Racing Cup TICs</span>
            </Link>
            <div>
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription className="mt-2">
                Paso {step} de 2 - {step === 1 ? "Datos de acceso" : "Perfil de usuario"}
              </CardDescription>
            </div>
            
            {/* Progress indicator */}
            <div className="flex gap-2 justify-center">
              <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimo 6 caracteres"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu contrasena"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Tu nombre"
                      className="pl-10"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gamertag">Gamertag (ID unico)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="gamertag"
                      type="text"
                      placeholder="#ABCD1234"
                      className="pl-10 pr-10 font-mono uppercase"
                      value={gamertag}
                      onChange={handleGamertagChange}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingGamertag ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : gamertagAvailable === true ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : gamertagAvailable === false ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    8 caracteres alfanumericos. Ej: #RACE2026
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">Escuela / Institucion</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="school"
                      type="text"
                      placeholder="Nombre de tu escuela"
                      className="pl-10"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
                  <Checkbox
                    id="isTeacher"
                    checked={isTeacher}
                    onCheckedChange={(checked) => setIsTeacher(checked === true)}
                  />
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <Label htmlFor="isTeacher" className="cursor-pointer">
                      Soy docente / asesor
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Atras
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={loading || !gamertagAvailable}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      "Crear cuenta"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center text-sm text-muted-foreground mt-6">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1">
                Inicia sesion
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
