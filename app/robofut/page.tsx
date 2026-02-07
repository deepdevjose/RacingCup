'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'

/**
 * RoboFut Category Page
 * Robot soccer competition details
 */
export default function RoboFutPage() {
    return (
        <div className="category-page">
            <Navbar />

            <CategoryHero
                title="RoboFut"
                subtitle="Fútbol Robótico"
                description="Robots autónomos compitiendo en el deporte más popular del mundo. Programación + estrategia = victoria."
                accentColor="#00C853"
            />

            <ContentSection title="¿Qué es RoboFut?" variant="dark">
                <p>
                    <strong>RoboFut</strong> lleva el fútbol al siguiente nivel. Equipos de robots
                    autónomos se enfrentan en una cancha miniatura, utilizando sensores y algoritmos
                    para localizar la pelota, coordinar jugadas y anotar goles.
                </p>
                <p>
                    Esta categoría combina programación avanzada, diseño mecánico y trabajo en equipo.
                    Los robots deben tomar decisiones en tiempo real sin intervención humana.
                </p>
            </ContentSection>

            <ContentSection title="Reglas del Juego" variant="light">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">⚽</div>
                        <h3 className="rule-card-title">Equipos</h3>
                        <p className="rule-card-text">
                            Cada equipo consta de 2 robots. Uno actúa como delantero y otro como
                            portero/defensa. Intercambio de roles permitido.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🥅</div>
                        <h3 className="rule-card-title">Cancha</h3>
                        <p className="rule-card-text">
                            Dimensiones: 120x80 cm. Superficie lisa color verde. Porterías de
                            20 cm de ancho. Pelota: esfera de golf naranja.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⏰</div>
                        <h3 className="rule-card-title">Tiempo</h3>
                        <p className="rule-card-text">
                            Partidos de 2 tiempos de 5 minutos cada uno. Medio tiempo de 2 minutos
                            para ajustes técnicos.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">📏</div>
                        <h3 className="rule-card-title">Robots</h3>
                        <p className="rule-card-text">
                            Dimensiones máximas: 7.5 cm de diámetro. Deben caber en un cilindro
                            de esas medidas. Peso máximo: 250g.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Sistema de Puntuación" variant="dark">
                <p>
                    El equipo que anote más goles gana el partido. En caso de empate al final
                    del tiempo reglamentario:
                </p>
                <ul>
                    <li><strong>Tiempo extra:</strong> 2 minutos de muerte súbita</li>
                    <li><strong>Penales:</strong> 3 tiros por equipo desde el centro</li>
                    <li>En fase de grupos, empate otorga 1 punto a cada equipo</li>
                </ul>
                <div className="cta-container">
                    <a href="/" className="btn btn-primary">Inscríbete Ahora</a>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
