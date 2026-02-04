"use client"

import React from "react"

import { useRef, useState } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    label: "Email (Demo)",
    value: "demo@racingcup-tics.example",
    href: "#",
  },
  {
    icon: Phone,
    label: "Telefono (Demo)",
    value: "+52 (XXX) XXX-XXXX",
    href: "#",
  },
  {
    icon: MapPin,
    label: "Ubicacion",
    value: "ITSOEH - Instituto Tecnologico Superior del Occidente del Estado de Hidalgo",
    href: "#",
  },
]

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { threshold: 0.1 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section
      id="contacto"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.25_0.08_25_/_0.15),transparent_50%)]" />

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
            Contacto (Demo)
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Esta es una seccion de demostracion. Para informacion real del Racing Cup TICs,
            contacta directamente con el departamento de TICs del ITSOEH.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${
              isInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group block"
                >
                  <Card className="hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {item.label}
                        </div>
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {item.value}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Social links */}
            <div className="pt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Siguenos en redes sociales
              </h4>
              <div className="flex gap-3">
                {["Facebook", "Instagram", "Twitter"].map((social) => (
                  <Button
                    key={social}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
                  >
                    {social}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <Card>
              <CardContent className="p-6 sm:p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Mensaje enviado
                    </h3>
                    <p className="text-muted-foreground">
                      Te responderemos lo antes posible
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium"
                        >
                          Nombre
                        </label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium"
                        >
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-medium"
                      >
                        Asunto
                      </label>
                      <Input
                        id="subject"
                        placeholder="¿Sobre que quieres consultar?"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-sm font-medium"
                      >
                        Mensaje
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Escribe tu mensaje aqui..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
