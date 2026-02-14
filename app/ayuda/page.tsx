"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/common/Navbar"
import { ChevronDown, LifeBuoy, Book, MessageCircle } from "lucide-react"
import "./ayuda.css"

interface FAQItem {
    question: string
    answer: string
}

const faqs: FAQItem[] = [
    {
        question: "¿Como crear una cuenta?",
        answer: "Para crear una cuenta, navega a la página de registro desde la pantalla de inicio. Completa el formulario con tu correo electrónico, contraseña y nombre de usuario. Una vez registrado, recibirás un correo de verificación."
    },
    {
        question: "¿Como unirse a un equipo?",
        answer: "Una vez que hayas iniciado sesión, ve a la sección de 'Equipos'. Si tienes un código de invitación, úsalo para unirte a un equipo existente, o solicita unirte a uno público desde la lista de equipos disponibles."
    }
]

const AccordionItem = ({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) => {
    return (
        <div className="faq-item">
            <button
                onClick={onClick}
                className="faq-question"
                aria-expanded={isOpen}
            >
                <span>{item.question}</span>
                <ChevronDown className={`w-5 h-5 faq-chevron ${isOpen ? 'open' : ''}`} />
            </button>
            <div
                className={`faq-answer-wrapper ${isOpen ? "open" : "closed"}`}
            >
                <p className="faq-answer">{item.answer}</p>
            </div>
        </div>
    )
}

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="help-page">
            <Navbar />

            <main className="help-container">
                <div className="help-header">
                    <h1 className="help-title">
                        Centro de Ayuda
                    </h1>
                    <p className="help-subtitle">
                        Todo lo que necesitas saber para gestionar tus equipos y participar en la Racing Cup.
                    </p>
                </div>

                <Tabs defaultValue="soporte" className="w-full">
                    <div className="flex justify-center">
                        <TabsList className="help-tabs-list">
                            <TabsTrigger value="soporte" className="help-tab-trigger">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Soporte
                            </TabsTrigger>
                            <TabsTrigger value="recursos" className="help-tab-trigger">
                                <Book className="w-4 h-4 mr-2" />
                                Recursos
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="soporte" className="animate-enter">
                        <div className="help-content-card">
                            <h2 className="help-section-title">
                                <LifeBuoy className="w-6 h-6 help-icon-primary" />
                                Preguntas Frecuentes
                            </h2>
                            <div className="faq-list">
                                {faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        item={faq}
                                        isOpen={openIndex === index}
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="recursos" className="animate-enter">
                        <div className="help-content-card resources-placeholder">
                            <div className="resources-icon-container">
                                <Book className="resources-icon" />
                            </div>
                            <h3 className="resources-title">Recursos Próximamente</h3>
                            <p className="resources-text">
                                Estamos preparando documentación detallada y guías de uso para ayudarte a sacar el máximo provecho de la plataforma.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
