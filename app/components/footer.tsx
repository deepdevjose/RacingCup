import Link from "next/link"
import { Bot } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-mono text-lg font-bold">Racing Cup TICs</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              DEMO - Sistema de registro para el torneo de robotica del ITSOEH
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#inicio"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="#convocatoria"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Convocatoria
                </Link>
              </li>
              <li>
                <Link
                  href="/equipos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Equipos
                </Link>
              </li>
              <li>
                <Link
                  href="#contacto"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Participar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/registro"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Registrar equipo
                </Link>
              </li>
              <li>
                <Link
                  href="#convocatoria"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Requisitos
                </Link>
              </li>
              <li>
                <Link
                  href="#convocatoria"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Categorias
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terminos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>DEMO - Racing Cup TICs 2026 - ITSOEH Ingenieria en TICs</p>
        </div>
      </div>
    </footer>
  )
}
