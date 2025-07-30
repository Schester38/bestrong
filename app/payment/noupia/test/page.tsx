"use client";

import { useState } from "react";
import { ArrowLeft, Smartphone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAlert } from "../../../components/CustomAlert";

export default function NoupiaTestPage() {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('672886348');
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState<any>(null);

  const testPayment = async () => {
    if (!phone || phone.length !== 9) {
      showAlert("Veuillez entrer un numéro MTN valide (9 chiffres)", "error");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          phone: phone,
          email: 'test@example.com',
          name: 'Test User',
          reference: `TEST_${Date.now()}`,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF'
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        showAlert(
          `Test réussi ! USSD: ${data.data.ussd} - Transaction: ${data.data.transaction}`, 
          "success"
        );
      } else {
        showAlert(`Erreur: ${data.message}`, "error");
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert("Erreur lors du test", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/payment/noupia"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au paiement
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Test NOUPIA MTN
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Test de l'intégration MTN Mobile Money
              </p>
            </div>
          </div>

          {/* Formulaire de test */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test de paiement
            </h2>

            <div className="space-y-4">
              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro MTN Cameroun
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    let phone = e.target.value.replace(/\D/g, '');
                    phone = phone.replace(/^237/, '');
                    setPhone(phone);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="672886348"
                  maxLength={9}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format : 9 chiffres sans 237
                </p>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant (XAF)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 100)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="100"
                  max="10000"
                />
              </div>

              {/* Bouton de test */}
              <button
                onClick={testPayment}
                disabled={isLoading || phone.length !== 9}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Tester le paiement
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Résultat */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Résultat du test
              </h3>
              
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${
                  result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Test réussi !' : 'Test échoué'}
                  </span>
                </div>

                {result.success && result.data && (
                  <div className="space-y-2 text-sm">
                    <div><strong>Transaction:</strong> {result.data.transaction}</div>
                    <div><strong>USSD:</strong> {result.data.ussd}</div>
                    <div><strong>Channel:</strong> {result.data.channel}</div>
                    <div><strong>Montant:</strong> {result.data.amount} XAF</div>
                    <div><strong>Frais:</strong> {result.data.fee} XAF</div>
                  </div>
                )}

                {!result.success && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <strong>Erreur:</strong> {result.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Informations de test
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div>• Ce test envoie un vrai USSD MTN</div>
              <div>• Utilisez un numéro MTN valide</div>
              <div>• Le montant de test est de 100 XAF</div>
              <div>• Vérifiez votre téléphone pour l'USSD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 