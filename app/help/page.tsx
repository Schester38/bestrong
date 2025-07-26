"use client";

import Link from "next/link";
import { HelpCircle, Users, Coins, Zap, MessageCircle } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
import { useEffect, useState } from 'react';
import { getUserCountry, getAbonnementPrixByCountry } from '../utils/geo';

export default function HelpPage() {
  const [prix, setPrix] = useState('1000 FCFA');
  useEffect(() => {
    getUserCountry().then(code => {
      if (code) setPrix(getAbonnementPrixByCountry(code));
    });
  }, []);

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Centre d&apos;Aide BE STRONG
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tout ce que vous devez savoir pour utiliser BE STRONG efficacement
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="#getting-started" className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-pink-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Premiers Pas</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Comment commencer avec BE STRONG
            </p>
          </Link>

          <Link href="#credits-system" className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <Coins className="w-6 h-6 text-pink-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Système de Crédits</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Comprendre les crédits et les échanges
            </p>
          </Link>

          <Link href="#exchange-tasks" className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-pink-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Tâches d&apos;Échange</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Créer et participer aux échanges
            </p>
          </Link>
        </div>

        <div className="space-y-12">
          {/* Getting Started */}
          <section id="getting-started">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-pink-500" />
                Premiers Pas avec BE STRONG
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    🚀 Étape 1 : Inscription et Paiement
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Cliquez sur &quot;Créer un compte&quot; sur la page d&apos;accueil</li>
                    <li>Remplissez vos informations (pseudo, email, mot de passe)</li>
                    <li>Effectuez le paiement de {prix}</li>
                    <li>Accédez immédiatement à votre dashboard</li>
                    <li className="text-xs text-gray-500 mt-1">Si vous payez par <b>PayPal</b>, le prix est de <b>5€</b> ou <b>5$</b>.</li>
                  </ol>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    🎯 Étape 2 : Configuration de votre Profil
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Choisissez un pseudo unique pour vous identifier</li>
                    <li>Recevez vos 150 crédits de départ</li>
                    <li>Configurez vos préférences d&apos;échange</li>
                    <li>Ajoutez votre compte TikTok (optionnel)</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    💡 Étape 3 : Commencer les Échanges
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Créez votre première tâche d&apos;échange</li>
                    <li>Participez aux tâches d&apos;autres utilisateurs</li>
                    <li>Gagnez des crédits en complétant des tâches</li>
                    <li>Utilisez vos crédits pour créer vos propres tâches</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Credits System */}
          <section id="credits-system">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Coins className="w-8 h-8 text-pink-500" />
                Système de Crédits
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    💰 Comment fonctionnent les crédits ?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Gagner des crédits</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Complétez les tâches d&apos;autres utilisateurs pour gagner des crédits
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">-</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Dépenser des crédits</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Créez vos propres tâches en dépensant des crédits
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📊 Valeurs des Crédits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Like</span>
                      <span className="font-semibold text-pink-600">5 crédits</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Follow</span>
                      <span className="font-semibold text-pink-600">10 crédits</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Commentaire</span>
                      <span className="font-semibold text-pink-600">15 crédits</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Partage</span>
                      <span className="font-semibold text-pink-600">20 crédits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Exchange Tasks */}
          <section id="exchange-tasks">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-pink-500" />
                Tâches d&apos;Échange
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📝 Créer une Tâche
                  </h3>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                    <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                      <li><strong>Choisissez le type</strong> : Like, Follow, Commentaire ou Partage</li>
                      <li><strong>Ajoutez le lien</strong> : URL de votre vidéo TikTok</li>
                      <li><strong>Définissez la récompense</strong> : Nombre de crédits à gagner</li>
                      <li><strong>Spécifiez le nombre</strong> : Combien d&apos;actions vous voulez</li>
                      <li><strong>Publiez la tâche</strong> : Elle devient visible pour la communauté</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    ✅ Compléter une Tâche
                  </h3>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                    <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                      <li><strong>Parcourez les tâches</strong> : Trouvez des tâches intéressantes</li>
                      <li><strong>Cliquez sur &quot;Compléter&quot;</strong> : Accédez à la vidéo</li>
                      <li><strong>Effectuez l&apos;action</strong> : Like, Follow, Commentaire ou Partage</li>
                      <li><strong>Confirmez la complétion</strong> : Marquez la tâche comme terminée</li>
                      <li><strong>Recevez vos crédits</strong> : Les crédits sont ajoutés à votre compte</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    ⚠️ Règles Importantes
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Ne pas faire</h4>
                      <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                        <li>• Utiliser des bots ou comptes fake</li>
                        <li>• Compléter vos propres tâches</li>
                        <li>• Spammer ou harceler d&apos;autres utilisateurs</li>
                        <li>• Violer les conditions TikTok</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Bonnes pratiques</h4>
                      <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                        <li>• Être authentique dans vos interactions</li>
                        <li>• Respecter les autres créateurs</li>
                        <li>• Participer régulièrement à la communauté</li>
                        <li>• Créer du contenu de qualité</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Questions Fréquentes
              </h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🤔 Comment gagner plus de crédits rapidement ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complétez régulièrement les tâches d&apos;autres utilisateurs, participez aux échanges 
                    de la communauté, et créez du contenu de qualité pour attirer plus d&apos;interactions.
                  </p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    ⏰ Combien de temps dure mon abonnement ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Votre abonnement dure 30 jours. Après expiration, vous devrez renouveler 
                    pour continuer à utiliser BE STRONG.
                  </p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🔒 C&apos;est sûr pour mon compte TikTok ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Absolument ! Nous respectons strictement les conditions TikTok. Aucun bot, 
                    aucune manipulation. Seulement des échanges authentiques entre créateurs réels.
                  </p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    💳 Comment fonctionne le paiement ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Paiement sécurisé de {prix} via les moyens de paiement disponibles sur la{' '}
                    <Link href="/thank-you" className="text-pink-600 underline hover:text-pink-800">page de paiement</Link>.
                    Accès immédiat après confirmation. Renouvellement mensuel.
                  </p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🆘 Que faire si j&apos;ai un problème ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Contactez notre support via la page Contact ou par email. Nous répondons 
                    généralement sous 24h.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    📱 BE STRONG fonctionne-t-il sur mobile ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Oui ! BE STRONG est entièrement responsive et fonctionne parfaitement 
                    sur smartphone et tablette.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">
                  Besoin d&apos;aide supplémentaire ?
                </h2>
                <p className="text-xl mb-6 opacity-90">
                  Notre équipe est là pour vous aider à réussir sur TikTok
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://wa.me/672886348" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-pink-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Contacter le Support
                  </a>
                  <Link 
                    href="/dashboard" 
                    className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-all duration-200"
                  >
                    Aller au Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
} 