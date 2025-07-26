import Link from "next/link";
import { Shield, Lock, Eye, Users, Database, Mail } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

export default function PrivacyPage() {
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
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-pink-500" />
                Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                BE STRONG s&apos;engage à protéger votre vie privée et vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons 
                vos informations lorsque vous utilisez notre plateforme d&apos;échanges TikTok.
              </p>
            </section>

            {/* Données collectées */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-pink-500" />
                Données que nous collectons
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    📝 Informations d&apos;identification
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Pseudo</strong> : Nom d&apos;utilisateur unique pour vous identifier</li>
                    <li><strong>Email</strong> : Pour la communication et la récupération de compte</li>
                    <li><strong>Mot de passe</strong> : Chiffré et sécurisé</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    💰 Données d&apos;activité
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Crédits</strong> : Solde et historique des transactions</li>
                    <li><strong>Tâches créées</strong> : Vos échanges et leurs statistiques</li>
                    <li><strong>Tâches complétées</strong> : Historique de vos participations</li>
                    <li><strong>Préférences</strong> : Paramètres de votre compte</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🌐 Données techniques
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Adresse IP</strong> : Pour la sécurité et la géolocalisation</li>
                    <li><strong>Navigateur</strong> : Type et version pour l&apos;optimisation</li>
                    <li><strong>Appareil</strong> : Type d&apos;appareil et système d&apos;exploitation</li>
                    <li><strong>Cookies</strong> : Pour améliorer votre expérience</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Utilisation des données */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-500" />
                Comment nous utilisons vos données
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🎯 Fonctionnalités principales
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Gérer votre compte et vos crédits</li>
                    <li>Faciliter les échanges entre utilisateurs</li>
                    <li>Prévenir la fraude et les abus</li>
                    <li>Améliorer nos services</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    📧 Communication
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Notifications importantes</li>
                    <li>Support client</li>
                    <li>Mises à jour de sécurité</li>
                    <li>Newsletters (optionnel)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Partage des données */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-pink-500" />
                Partage des données
              </h2>
              
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, 
                  sauf dans les cas suivants :
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Avec votre consentement</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Nous pouvons partager vos données si vous nous donnez votre autorisation explicite.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Prestataires de services</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Stripe (paiements), Vercel (hébergement), services techniques nécessaires.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Obligation légale</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Si la loi l&apos;exige ou pour protéger nos droits et notre sécurité.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sécurité */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-pink-500" />
                Sécurité des données
              </h2>
              
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nous mettons en place des mesures de sécurité appropriées pour protéger vos données :
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔐 Chiffrement</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 ml-4">
                      <li>HTTPS pour toutes les communications</li>
                      <li>Mots de passe chiffrés</li>
                      <li>Données sensibles cryptées</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🛡️ Protection</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 ml-4">
                      <li>Accès restreint aux données</li>
                      <li>Surveillance continue</li>
                      <li>Sauvegardes sécurisées</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Vos droits */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Vos droits (RGPD)
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    📋 Droits principaux
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Accès</strong> : Consulter vos données</li>
                    <li><strong>Rectification</strong> : Corriger vos informations</li>
                    <li><strong>Effacement</strong> : Supprimer votre compte</li>
                    <li><strong>Portabilité</strong> : Récupérer vos données</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🚫 Limitations
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>Opposition</strong> : Refuser certains traitements</li>
                    <li><strong>Restriction</strong> : Limiter l&apos;utilisation</li>
                    <li><strong>Réclamation</strong> : Contacter la CNIL</li>
                    <li><strong>Consentement</strong> : Retirer votre accord</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Conservation */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Durée de conservation
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li><strong>Compte actif</strong> : Conservé tant que vous utilisez BE STRONG</li>
                  <li><strong>Compte inactif</strong> : Supprimé après 2 ans d&apos;inactivité</li>
                  <li><strong>Données de paiement</strong> : Conservées 5 ans (obligation légale)</li>
                  <li><strong>Logs de sécurité</strong> : Conservés 1 an maximum</li>
                  <li><strong>Cookies</strong> : Voir notre politique des cookies</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-pink-500" />
                Exercer vos droits
              </h2>
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
                <p className="mb-4">
                  Pour exercer vos droits ou poser des questions sur cette politique :
                </p>
                <ul className="space-y-2">
                  <li>📧 <strong>Email</strong> : <a href="mailto:bestrong435@gmail.com" className="underline">bestrong435@gmail.com</a></li>
                  <li>📱 <strong>WhatsApp</strong> : <a href="https://wa.me/672886348" target="_blank" rel="noopener noreferrer" className="underline">+237 672886348</a></li>
                  <li>📄 <strong>Formulaire</strong> : Via notre page de contact</li>
                </ul>
                <p className="mt-4 text-pink-100">
                  Nous répondons sous 30 jours maximum à toute demande.
                </p>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Modifications de cette politique
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300">
                  Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes 
                  seront notifiées par email et affichées sur cette page. Nous vous encourageons à consulter 
                  régulièrement cette politique pour rester informé de nos pratiques.
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Cette politique de confidentialité fait partie de notre engagement envers la transparence et la protection de vos données.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link href="/cookies" className="text-pink-600 dark:text-pink-400 hover:underline">
                Politique des cookies
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