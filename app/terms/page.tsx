"use client";

import Link from "next/link";
import { FileText, Shield, CreditCard, CheckCircle, XCircle } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
import { useEffect, useState } from 'react';
import { getUserCountry, getAbonnementPrixByCountry } from '../utils/geo';

export default function TermsPage() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Conditions d&apos;Utilisation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                En utilisant BE STRONG, vous acceptez ces conditions d&apos;utilisation. 
                Ces conditions régissent votre utilisation de notre plateforme d&apos;échanges TikTok 
                et constituent un accord légal entre vous et BE STRONG.
              </p>
            </section>

            {/* Définitions */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Définitions
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li><strong>BE STRONG</strong> : La plateforme d&apos;échanges TikTok</li>
                  <li><strong>Utilisateur</strong> : Toute personne utilisant la plateforme</li>
                  <li><strong>Crédits</strong> : Monnaie virtuelle de la plateforme</li>
                  <li><strong>Tâche</strong> : Demande d&apos;échange entre utilisateurs</li>
                  <li><strong>Service</strong> : L&apos;ensemble des fonctionnalités de BE STRONG</li>
                </ul>
              </div>
            </section>

            {/* Acceptation des conditions */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Acceptation des Conditions
              </h2>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  En créant un compte ou en utilisant BE STRONG, vous :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Acceptez d&apos;être lié par ces conditions</li>
                  <li>Confirmez que vous avez au moins 13 ans</li>
                  <li>Vous engagez à respecter toutes les règles de la plateforme</li>
                  <li>Acceptez de recevoir des communications importantes</li>
                </ul>
              </div>
            </section>

            {/* Compte utilisateur */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Compte Utilisateur
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    ✅ Vos Responsabilités
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Fournir des informations exactes</li>
                    <li>Protéger vos identifiants</li>
                    <li>Signaler toute utilisation non autorisée</li>
                    <li>Respecter les règles de la communauté</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    ❌ Interdictions
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Partager votre compte</li>
                    <li>Créer plusieurs comptes</li>
                    <li>Utiliser des informations falsifiées</li>
                    <li>Contourner les mesures de sécurité</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Système de crédits */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-pink-500" />
                Système de Crédits
              </h2>
              
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  💰 Gestion des Crédits
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Achat de crédits</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Les crédits sont achetés via notre système de paiement sécurisé.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Utilisation</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Les crédits sont utilisés pour créer des tâches d&apos;échange.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Remboursement</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Les crédits ne sont pas remboursables sauf en cas de problème technique.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Règles d'échange */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Règles d&apos;Échange
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🎯 Création de Tâches
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Décrivez clairement votre demande</li>
                    <li>Fixez un délai raisonnable</li>
                    <li>Proposez une récompense équitable</li>
                    <li>Respectez les règles TikTok</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    ✅ Exécution des Tâches
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Effectuez le travail demandé</li>
                    <li>Respectez les délais convenus</li>
                    <li>Communiquez en cas de problème</li>
                    <li>Fournissez des preuves si demandé</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    ⚠️ Interdictions
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>Demandes illégales ou immorales</li>
                    <li>Harcèlement ou intimidation</li>
                    <li>Fausses déclarations</li>
                    <li>Contournement des règles TikTok</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Paiements */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Paiements et Abonnements
              </h2>
              
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  💳 Informations de Paiement
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prix</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Abonnement mensuel : {prix} (paiement via Orange Money ou MTN Mobile Money uniquement)
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      Si vous payez par <b>PayPal</b>, le prix est de <b>5€</b> ou <b>5$</b>.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Renouvellement</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      L&apos;abonnement se renouvelle chaque mois après paiement mobile confirmé (pas de prélèvement automatique).
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Résiliation</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vous pouvez annuler votre abonnement à tout moment. L&apos;accès reste actif jusqu&apos;à la fin de la période payée.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Propriété Intellectuelle
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  BE STRONG et son contenu sont protégés par les droits d&apos;auteur et autres lois sur la propriété intellectuelle.
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Vous conservez les droits sur votre contenu</li>
                  <li>Vous accordez une licence d&apos;utilisation à BE STRONG</li>
                  <li>Vous ne pouvez pas copier ou reproduire notre contenu</li>
                  <li>Les marques déposées restent notre propriété</li>
                </ul>
              </div>
            </section>

            {/* Limitation de responsabilité */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-pink-500" />
                Limitation de Responsabilité
              </h2>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  BE STRONG ne peut être tenu responsable de :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Perte de données ou interruption de service</li>
                  <li>Actions des autres utilisateurs</li>
                  <li>Contenu créé par les utilisateurs</li>
                  <li>Dommages indirects ou consécutifs</li>
                  <li>Problèmes techniques indépendants de notre volonté</li>
                </ul>
              </div>
            </section>

            {/* Résiliation */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Résiliation de Compte
              </h2>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nous pouvons suspendre ou résilier votre compte dans les cas suivants :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Violation de ces conditions</li>
                  <li>Comportement frauduleux</li>
                  <li>Harcèlement d&apos;autres utilisateurs</li>
                  <li>Création de contenu illégal</li>
                  <li>Non-paiement de l&apos;abonnement</li>
                </ul>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Modifications des Conditions
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <p className="text-gray-600 dark:text-gray-300">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. 
                  Les modifications importantes seront notifiées par email et affichées sur cette page. 
                  Votre utilisation continue de BE STRONG après les modifications constitue votre acceptation 
                  des nouvelles conditions.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact et Support
              </h2>
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
                <p className="mb-4">
                  Pour toute question concernant ces conditions :
                </p>
                <ul className="space-y-2">
                  <li>📧 <strong>Email</strong> : <a href="mailto:bestrong435@gmail.com" className="underline">bestrong435@gmail.com</a></li>
                  <li>📱 <strong>WhatsApp</strong> : <a href="https://wa.me/672886348" target="_blank" rel="noopener noreferrer" className="underline">+237 672886348</a></li>
                  <li>📄 <strong>Page d&apos;aide</strong> : <Link href="/help" className="underline">Consulter notre guide</Link></li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Ces conditions d&apos;utilisation constituent l&apos;accord complet entre vous et BE STRONG.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link href="/privacy" className="text-pink-600 dark:text-pink-400 hover:underline">
                Politique de confidentialité
              </Link>
              <Link href="/cookies" className="text-pink-600 dark:text-pink-400 hover:underline">
                Politique des cookies
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