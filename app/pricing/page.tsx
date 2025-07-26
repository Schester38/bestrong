"use client";

import Link from "next/link";
import { Check, Star, Zap, Shield, Users, TrendingUp } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
import { useEffect, useState } from 'react';
import { getUserCountry, getAbonnementPrixByCountry } from '../utils/geo';

export default function PricingPage() {
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

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4 mr-2" />
              Offre Unique
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Accès Complet
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">à BE STRONG</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Un seul tarif, toutes les fonctionnalités. Commencez votre croissance TikTok dès aujourd&apos;hui !
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Plan BE STRONG Pro
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Accès illimité à toutes les fonctionnalités
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {prix}
                </span>
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold mt-2">
                ✓ Accès d&apos;un mois - Renouvellement mensuel
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Si vous payez par <b>PayPal</b>, le prix est de <b>5€</b> ou <b>5$</b>.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Accès illimité aux échanges organiques</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Système de crédits complet (150 crédits de départ)</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Création de tâches d&apos;échange illimitée</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Participation aux échanges de la communauté</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Support prioritaire et assistance</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Accès aux futures fonctionnalités</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link 
                href="/inscription" 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full text-xl font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Commencer Maintenant
                <Zap className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Paiement mobile sécurisé Orange Money / MTN Mobile Money • Accès immédiat • Abonnement mensuel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BE STRONG */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir BE STRONG ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Une approche éthique et efficace pour votre croissance TikTok
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                100% Éthique
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Respect total des conditions TikTok. Aucun bot, aucune manipulation. 
                Seulement des échanges authentiques entre créateurs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Communauté Active
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Rejoignez des milliers de créateurs qui s&apos;entraident pour grandir ensemble. 
                Une communauté bienveillante et motivée.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Résultats Garantis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Augmentez vos abonnés, vues et likes de manière organique. 
                Des résultats durables et naturels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🤔 Pourquoi un seul tarif ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nous croyons en la simplicité. Un seul tarif vous donne accès à tout ce dont vous avez besoin 
                pour réussir sur TikTok. Pas de confusion, pas de limitations cachées.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                💳 Comment fonctionne le paiement ?
               </h3>
               <p className="text-gray-600 dark:text-gray-300">
                 Paiement sécurisé de 1000 FCFA via les moyens de paiement disponibles sur la{' '}
                 <Link href="/thank-you" className="text-pink-600 underline hover:text-pink-800">page de paiement</Link>.
                 Accès immédiat après confirmation. Renouvellement mensuel.
               </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                 ⏰ Combien de temps dure l&apos;accès ?
               </h3>
               <p className="text-gray-600 dark:text-gray-300">
                 Accès d&apos;un mois ! Après 30 jours, vous devrez renouveler votre abonnement 
                 pour continuer à utiliser toutes les fonctionnalités de BE STRONG.
               </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔒 C&apos;est sûr pour mon compte TikTok ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Absolument ! Nous respectons strictement les conditions TikTok. Aucun bot, aucune manipulation. 
                Seulement des échanges authentiques entre créateurs réels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à booster votre visibilité TikTok ?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Rejoignez la communauté BE STRONG et commencez votre croissance dès aujourd&apos;hui !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/inscription" 
              className="bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
            >
              Commencer Maintenant - {prix}
              <Zap className="w-5 h-5" />
            </Link>
            <Link 
              href="/" 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-pink-600 transition-all duration-200"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            BE STRONG
          </h3>
          <p className="text-gray-400 mb-6">
            La plateforme éthique pour augmenter votre visibilité TikTok.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Conditions
            </Link>
            <a href="https://wa.me/672886348" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
            <p>&copy; 2024 BE STRONG. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
} 