"use client";

import { useState } from "react";
import { ArrowLeft, Key, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SetupNoupiaPage() {
  const [developerKey, setDeveloperKey] = useState("");
  const [subscriptionKey, setSubscriptionKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testNoupiaConnection = async () => {
    if (!developerKey || !subscriptionKey) {
      setTestResult({
        success: false,
        message: "Veuillez entrer vos clés NOUPIA"
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/payment/noupia/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developerKey,
          subscriptionKey
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: "Connexion NOUPIA réussie ! Vos clés sont valides."
        });
      } else {
        setTestResult({
          success: false,
          message: `Erreur: ${result.message}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Erreur de connexion à l'API NOUPIA"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configuration NOUPIA Pay
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Configurez vos clés API NOUPIA pour activer les paiements
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Comment obtenir vos clés NOUPIA
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Ouvrez l'app NOUPIA</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Assurez-vous que votre compte est vérifié et activé
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Allez dans "Compte"</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Naviguez vers la page de votre compte
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Tapez 3 fois sur la version</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Descendez en bas et tapez 3 fois sur le numéro de version
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Copiez vos clés</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Appuyez sur "Voir la clé" et copiez vos clés API
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Ne partagez jamais vos clés API. Elles doivent rester confidentielles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Test de connexion
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clé Développeur NOUPIA
                  </label>
                  <input
                    type="password"
                    value={developerKey}
                    onChange={(e) => setDeveloperKey(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Votre clé développeur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clé d'Abonnement NOUPIA
                  </label>
                  <input
                    type="password"
                    value={subscriptionKey}
                    onChange={(e) => setSubscriptionKey(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Votre clé d'abonnement"
                  />
                </div>

                <button
                  onClick={testNoupiaConnection}
                  disabled={isTesting || !developerKey || !subscriptionKey}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isTesting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      Tester la connexion
                    </>
                  )}
                </button>

                {testResult && (
                  <div className={`p-4 rounded-xl ${
                    testResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {testResult.message}
                      </span>
                    </div>
                  </div>
                )}
              </div>

                             <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                 <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                   Configuration NOUPIA
                 </h4>
                 <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                   Vos clés NOUPIA sont configurées :
                 </p>
                 <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono">
                   <div>✅ Clé Développeur: Configurée</div>
                   <div>✅ Clé Abonnement: Configurée</div>
                   <div>✅ Signature: sig_c1e95a7fbdd06b2a488d7577eecdbbcf</div>
                   <div>✅ Webhook Email: bestrong9124@gmail.com</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Liens utiles
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <a 
                href="https://noupia.com/developers/pay" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Documentation API
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Documentation complète de l'API NOUPIA Pay
                </p>
              </a>

              <a 
                href="https://noupia.com/rates" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Taux de change
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Consultez les taux de change supportés
                </p>
              </a>

              <Link 
                href="/payment/noupia"
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Tester le paiement
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Testez votre intégration NOUPIA
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 