"use client"

import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import {
  Calendar,
  Users,
  Trophy,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const requirements = [
  "(Demo) Equipo de 2 a 5 integrantes",
  "(Demo) Robot funcional en la categoria elegida",
  "(Demo) Registro completado en la plataforma",
  "(Demo) Pago de inscripcion verificado",
  "(Demo) Autorizacion del comite organizador",
]

const timeline = [
  {
    date: "Febrero 2026",
    title: "Apertura de inscripciones",
    description: "(Demo) Periodo de preregistro de equipos",
    icon: Calendar,
    active: true,
  },
  {
    date: "Marzo 2026",
    title: "Cierre de inscripciones",
    description: "(Demo) Ultimo dia para completar el registro",
    icon: Clock,
    active: false,
  },
  {
    date: "12 Mar 2026",
    title: "Revision de equipos",
    description: "(Demo) Verificacion de requisitos",
    icon: Users,
    active: false,
  },
  {
    date: "13 Mar 2026",
    title: "Racing Cup TICs",
    description: "(Demo) Dia de competencia en ITSOEH",
    icon: Trophy,
    active: false,
  },
]

const categories = [
  {
    name: "Carrera RC",
    description: "(Demo) Velocidad maxima en circuito",
    slots: "Cupo limitado",
  },
  {
    name: "Robo Fut",
    description: "(Demo) Categoria para principiantes",
    slots: "Cupo limitado",
  },
  {
    name: "Mini Sumo",
    description: "(Demo) Robots de combate en arena",
    slots: "Cupo limitado",
  },
]

export function ConvocatoriaSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { threshold: 0.1 })

  return (
    <section
      id="convocatoria"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.25_0.08_25_/_0.15),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Convocatoria (Demo)
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Esta seccion es una demostracion. La informacion real del torneo
            Racing Cup TICs se publicara en los canales oficiales del ITSOEH.
          </p>
        </div>

        {/* Timeline */}
        <div
          className={`mb-20 transition-all duration-700 delay-200 ${
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h3 className="text-xl font-semibold mb-8 text-center">
            Calendario del evento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {timeline.map((item, index) => (
              <Card
                key={item.title}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  item.active ? "border-primary bg-primary/5" : "bg-card"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm text-primary font-medium mb-1">
                    {item.date}
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
                {item.active && (
                  <div className="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg">
                    Activo
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Categories and Requirements grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Categories */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Categorias de competencia
            </h3>
            <div className="space-y-4">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="group hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <div className="text-sm text-primary font-medium whitespace-nowrap">
                      {category.slots}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Requisitos de participacion
            </h3>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
