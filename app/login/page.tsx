"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, LogIn, Bot, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginUser } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await loginUser(email, password)
      if (!user.emailVerified) {
        setError("Por favor verifica tu correo electronico antes de iniciar sesion.")
        setLoading(false)
        return
      }
      router.push("/perfil")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesion"
      if (errorMessage.includes("invalid-credential") || errorMessage.includes("wrong-password")) {
        setError("Correo o contrasena incorrectos")
      } else if (errorMessage.includes("user-not-found")) {
        setError("No existe una cuenta con este correo")
      } else {
        setError("Error al iniciar sesion. Intenta de nuevo.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.25_0.08_25_/_0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.3_0.1_190_/_0.15),transparent_50%)]" />
      
      {/* Grid pattern */}
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
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mx-auto">
              <Bot className="h-8 w-8 text-primary" />
              <span className="font-mono text-xl font-bold">Racing Cup TICs</span>
            </Link>
            <div>
              <CardTitle className="text-2xl">Iniciar Sesion</CardTitle>
              <CardDescription className="mt-2">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                    placeholder="Tu contrasena"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesion...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesion
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-6">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="text-primary hover:underline inline-flex items-center gap-1">
                  Registrate aqui
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
