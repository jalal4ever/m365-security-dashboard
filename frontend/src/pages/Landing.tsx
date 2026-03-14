import { Shield, ArrowRight, Network, Zap, HeartHandshake, Mail, Linkedin, Twitter } from 'lucide-react'

interface LandingProps {
  onEnter?: () => void
}

export default function Landing({ onEnter }: LandingProps) {
  void onEnter
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen font-body text-corporate-dark bg-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-primary">GROUPE</span>
                <span className="font-display font-bold text-xl text-accent">ENTIS</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('presentation')} className="font-display font-medium text-sm text-corporate-dark hover:text-primary transition-colors">
                Le groupe
              </button>
              <button onClick={() => scrollToSection('atouts')} className="font-display font-medium text-sm text-corporate-dark hover:text-primary transition-colors">
                Nos atouts
              </button>
              <button onClick={() => scrollToSection('actualites')} className="font-display font-medium text-sm text-corporate-dark hover:text-primary transition-colors">
                Actualités
              </button>
            </nav>

            {/* CTA Button */}
            <button className="bg-accent hover:bg-accent-dark text-white font-display font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center gap-2">
              Nous contacter
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary via-primary-light to-primary">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-3xl">
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Engagés pour assurer l'avenir !
            </h1>
            <p className="font-body text-xl text-white/90 mb-10 leading-relaxed">
              Nous rassemblons les acteurs de la protection sociale pour bâtirdes solutions de haut niveau.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-primary font-display font-semibold px-8 py-4 rounded-lg hover:shadow-xl transition-all text-center">
                En savoir plus
              </button>
              <button className="bg-accent text-white font-display font-semibold px-8 py-4 rounded-lg hover:bg-accent-dark hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Découvrir nos offres
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFFFF"/>
          </svg>
        </div>
      </section>

      {/* PRÉSENTATION SECTION */}
      <section id="presentation" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div>
              <span className="font-display font-semibold text-accent text-sm uppercase tracking-wider">
                Qui sommes-nous ?
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-primary mt-2 mb-6">
                Agilité et expertises différenciantes
              </h2>
              <div className="space-y-4 font-body text-corporate-dark leading-relaxed">
                <p>
                  Le Groupe Entis représente un modèle unique dans le secteur de la protection sociale et de l'assurance. Notre force réside dans notre capacité à fédérer les acteurs du domaine pour créer des synergies innovantes.
                </p>
                <p>
                  Nous avons développé un dispositif <strong>omnicanal</strong> qui nous permet d'accompagner nos partenaires et bénéficiaires avec une agilité incomparable. Notre potentiel de croissance repose sur des fondations solides : expertise métier, innovation technologique et engagement humain.
                </p>
                <p>
                  Chaque jour, nos équipes travaillent avec passion pour construire les solutions de demain, au service d'une protection sociale plus accessible et plus efficace.
                </p>
              </div>
              <button className="mt-8 text-accent font-display font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                En savoir plus sur notre histoire
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-card text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Network className="w-7 h-7 text-primary" />
                    </div>
                    <span className="font-display font-bold text-3xl text-primary">15+</span>
                    <p className="font-body text-sm text-corporate-gray mt-1">Années d'expertise</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-card text-center">
                    <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HeartHandshake className="w-7 h-7 text-accent" />
                    </div>
                    <span className="font-display font-bold text-3xl text-primary">50+</span>
                    <p className="font-body text-sm text-corporate-gray mt-1">Partenaires</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-card text-center">
                    <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-7 h-7 text-accent" />
                    </div>
                    <span className="font-display font-bold text-3xl text-primary">100%</span>
                    <p className="font-body text-sm text-corporate-gray mt-1">Engagement</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-card text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <span className="font-display font-bold text-3xl text-primary">24/7</span>
                    <p className="font-body text-sm text-corporate-gray mt-1">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOS ATOUTS SECTION */}
      <section id="atouts" className="py-20 bg-corporate-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-display font-semibold text-accent text-sm uppercase tracking-wider">
              Nos forces
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-primary mt-2">
              Nos atouts
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Carte 1 */}
            <div className="bg-white rounded-card shadow-card p-8 hover:shadow-card-hover transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-6">
                <Network className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-primary mb-4">
                Modèle unique
              </h3>
              <p className="font-body text-corporate-gray leading-relaxed">
                Notre modèle de réseau fédéré est inédit dans le secteur. Nous réunissons les meilleurs acteurs de la protection sociale pour créer des solutions collectives à forte valeur ajoutée.
              </p>
            </div>

            {/* Carte 2 */}
            <div className="bg-white rounded-card shadow-card p-8 hover:shadow-card-hover transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-primary mb-4">
                Agilité
              </h3>
              <p className="font-body text-corporate-gray leading-relaxed">
                Nous savons nous adapter rapidement aux évolutions du marché et aux besoins de nos partenaires. Notre structure légère et réactivenous permet de prendre des décisions rapidement.
              </p>
            </div>

            {/* Carte 3 */}
            <div className="bg-white rounded-card shadow-card p-8 hover:shadow-card-hover transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center mb-6">
                <HeartHandshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-primary mb-4">
                Offre globale
              </h3>
              <p className="font-body text-corporate-gray leading-relaxed">
                Nous proposons une gamme complète de services : assurance, protection sociale, prévoyance et retraite. Une offre intégrée pour répondre à tous les besoins de nos clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-6">
            Rejoignez-nous !
          </h2>
          <p className="font-body text-xl text-white/90 mb-10">
            Contribuez à un projet riche de sens. Ensemble, bâtissons l'avenir de la protection sociale.
          </p>
          <button className="bg-white text-primary font-display font-semibold px-10 py-4 rounded-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
            Découvrez toutes nos offres
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-display font-bold text-lg text-white">GROUPE</span>
                  <span className="font-display font-bold text-lg text-accent">ENTIS</span>
                </div>
              </div>
              <p className="font-body text-white/70 leading-relaxed max-w-md">
                Nous rassembler pour@innover. Le Groupe Entis réunit les acteurs de la protection sociale afin de proposer des solutions de haut niveau au service de tous.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
                Liens rapides
              </h4>
              <ul className="space-y-3">
                <li><a href="#" className="font-body text-white/70 hover:text-accent transition-colors">Le groupe</a></li>
                <li><a href="#" className="font-body text-white/70 hover:text-accent transition-colors">Nos offres</a></li>
                <li><a href="#" className="font-body text-white/70 hover:text-accent transition-colors">Actualités</a></li>
                <li><a href="#" className="font-body text-white/70 hover:text-accent transition-colors">Carrières</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-white/70">
                  <Mail className="w-4 h-4 text-accent" />
                  <span className="font-body">contact@groupe-entis.fr</span>
                </li>
              </ul>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-sm text-white/50">
              © {new Date().getFullYear()} Groupe Entis. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-body text-sm text-white/50 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="font-body text-sm text-white/50 hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="font-body text-sm text-white/50 hover:text-white transition-colors">Plan du site</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
