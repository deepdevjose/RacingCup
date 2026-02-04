import './Footer.css'

/**
 * Footer - Site footer with social links
 */
function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer section-dark">
            <div className="container footer-container">
                {/* Logo */}
                <div className="footer-brand">
                    <span className="footer-logo">RACING CUP</span>
                    <p className="footer-tagline">Competencia. Velocidad. Gloria.</p>
                </div>

                {/* Links */}
                <div className="footer-links">
                    <div className="footer-section">
                        <h4 className="footer-title">Plataforma</h4>
                        <ul>
                            <li><a href="/">Inicio</a></li>
                            <li><a href="/auth">Iniciar Sesión</a></li>
                            <li><a href="/auth?register=true">Registrarse</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-title">Comunidad</h4>
                        <ul>
                            <li><a href="#">Discord</a></li>
                            <li><a href="#">Twitter</a></li>
                            <li><a href="#">Instagram</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Racing Cup. Todos los derechos reservados.
                    </p>
                    <p className="footer-credits">
                        Hecho con 🏎️ por el equipo Racing Cup
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
