"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Bot, User, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Eventos", href: "/eventos" },
  { name: "Equipos", href: "/equipos" },
  { name: "Contacto", href: "/#contacto" },
]

export function Navbar() {
  const { user, profile, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-mono text-xl font-bold tracking-tight">
              Racing Cup TICs
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user && profile ? (
                  <Link href="/perfil">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <User className="h-4 w-4" />
                      <span className="font-mono">{profile.gamertag}</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Iniciar sesion
                      </Button>
                    </Link>
                    <Link href="/registro">
                      <Button size="sm">
                        Crear cuenta
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {!loading && (
                  <>
                    {user && profile ? (
                      <Link href="/perfil" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 bg-transparent">
                          <User className="h-4 w-4" />
                          Mi perfil ({profile.gamertag})
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full gap-2 bg-transparent">
                            <LogIn className="h-4 w-4" />
                            Iniciar sesion
                          </Button>
                        </Link>
                        <Link href="/registro" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Crear cuenta</Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
