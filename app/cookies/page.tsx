import Link from "next/link";
import { Shield, Settings, Eye, Lock } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                BE STRONG
              </Link>
            </div>
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Politique des Cookies
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Qu'est-ce qu'un cookie */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-pink-500" />
                Qu&apos;est-ce qu&apos;un cookie ?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. 
                Les cookies permettent au site de se souvenir de vos actions et préférences (comme votre langue, votre nom d&apos;utilisateur, 
                et vos choix) sur une période donnée, afin que vous n&apos;ayez pas à les saisir à nouveau à chaque fois que vous visitez le site.
              </p>
            </section>

            {/* Cookies utilisés par BE STRONG */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-pink-500" />
                Cookies utilisés par BE STRONG
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🍪 Cookies essentiels
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Ces cookies sont nécessaires au fonctionnement de l&apos;application :
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Session de navigation</strong> : Maintient votre connexion pendant votre visite</li>
                    <li><strong>Préférences de sécurité</strong> : Protège contre les attaques CSRF</li>
                    <li><strong>Fonctionnalités de base</strong> : Permet l&apos;utilisation des échanges et du système de crédits</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    📊 Cookies de performance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Ces cookies nous aident à améliorer l&apos;expérience utilisateur :
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Analytics</strong> : Comprendre comment vous utilisez l&apos;application</li>
                    <li><strong>Optimisation</strong> : Améliorer la vitesse de chargement</li>
                    <li><strong>Détection d&apos;erreurs</strong> : Identifier et corriger les problèmes</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ⚙️ Cookies de fonctionnalité
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Ces cookies mémorisent vos préférences :
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Thème</strong> : Mode clair ou sombre</li>
                    <li><strong>Langue</strong> : Français par défaut</li>
                    <li><strong>Préférences d&apos;échange</strong> : Vos paramètres de tâches</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Gestion des cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-pink-500" />
                Comment gérer vos cookies
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Dans votre navigateur
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur :
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité</li>
                    <li><strong>Firefox</strong> : Options → Vie privée et sécurité</li>
                    <li><strong>Safari</strong> : Préférences → Confidentialité</li>
                    <li><strong>Edge</strong> : Paramètres → Cookies et permissions</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Sur BE STRONG
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Nous respectons vos choix et vous donnons le contrôle :
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Consentement</strong> : Vous choisissez ce que vous acceptez</li>
                    <li><strong>Rétractation</strong> : Vous pouvez changer d&apos;avis à tout moment</li>
                    <li><strong>Transparence</strong> : Nous expliquons chaque type de cookie</li>
                    <li><strong>Minimisation</strong> : Nous n&apos;utilisons que le strict nécessaire</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Durée de conservation */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Durée de conservation des cookies
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li><strong>Cookies de session</strong> : Supprimés à la fermeture du navigateur</li>
                  <li><strong>Cookies de préférences</strong> : Conservés jusqu&apos;à 1 an</li>
                  <li><strong>Cookies de sécurité</strong> : Conservés jusqu&apos;à 6 mois</li>
                  <li><strong>Cookies d&apos;analytics</strong> : Conservés jusqu&apos;à 2 ans</li>
                </ul>
              </div>
            </section>

            {/* Cookies tiers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Cookies tiers
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                BE STRONG peut utiliser des services tiers pour améliorer l&apos;expérience utilisateur :
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li><strong>Google Analytics</strong> : Analyse de l&apos;utilisation du site (si activé)</li>
                  <li><strong>Stripe</strong> : Paiements sécurisés (si vous utilisez les services payants)</li>
                  <li><strong>Vercel</strong> : Hébergement et performance</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Questions sur les cookies ?
              </h2>
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
                <p className="mb-4">
                  Si vous avez des questions sur notre utilisation des cookies ou souhaitez exercer vos droits, 
                  contactez-nous :
                </p>
                <ul className="space-y-2">
                  <li>📧 <strong>Email</strong> : privacy@bestrong.com</li>
                  <li>📱 <strong>Support</strong> : Via notre page de contact</li>
                  <li>📄 <strong>RGPD</strong> : Consultez notre politique de confidentialité</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Cette politique des cookies fait partie de notre engagement envers la transparence et la protection de vos données.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link href="/privacy" className="text-pink-600 dark:text-pink-400 hover:underline">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="text-pink-600 dark:text-pink-400 hover:underline">
                Conditions d&apos;utilisation
              </Link>
                          <a href="https://wa.me/672886348" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 hover:underline">
              Contact
            </a>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
} 