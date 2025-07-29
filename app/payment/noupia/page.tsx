"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAlert } from "../../components/CustomAlert";

interface PaymentForm {
  amount: number;
  phone: string;
  email: string;
  name: string;
  reference: string;
  method: 'mobilemoney' | 'noupia';
  country: string;
  currency: string;
}

interface PaymentResponse {
  response: string;
  code: string;
  message: string;
  data?: {
    transaction: string;
    channel_ussd?: string;
    channel_name?: string;
    status?: string;
    amount?: string;
    fee?: string;
    currency?: string;
    date?: string;
    time?: string;
  };
}

export default function NoupiaPaymentPage() {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'successful' | 'failed' | null>(null);
  const [formData, setFormData] = useState<PaymentForm>({
    amount: 1000,
    phone: '',
    email: '',
    name: '',
    reference: `BE_STRONG_${Date.now()}`,
    method: 'mobilemoney',
    country: 'CM',
    currency: 'XAF'
  });

  // Validation du formulaire
  const isFormValid = () => {
    return formData.amount > 0 && 
           formData.phone.length >= 8 && 
           formData.email.includes('@') && 
           formData.name.length > 0;
  };

  // Initier le paiement
  const initiatePayment = async () => {
    if (!isFormValid()) {
      showAlert("Veuillez remplir tous les champs correctement", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/noupia/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: PaymentResponse = await response.json();

      if (result.response === 'success') {
        setTransactionId(result.data?.transaction || null);
        showAlert("Paiement initié avec succès ! Vérifiez votre téléphone pour confirmer.", "success");
        
        // Démarrer la vérification automatique
        startVerification(result.data?.transaction);
      } else {
        showAlert(`Erreur: ${result.message}`, "error");
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      showAlert("Erreur lors de l'initiation du paiement", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier le statut du paiement
  const verifyPayment = async (transactionId: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/payment/noupia/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction: transactionId }),
      });

      const result: PaymentResponse = await response.json();

      if (result.response === 'success' && result.data) {
        const status = result.data.status;
        setPaymentStatus(status as 'pending' | 'successful' | 'failed');
        
        if (status === 'successful') {
          showAlert("Paiement réussi ! Votre compte a été crédité.", "success");
        } else if (status === 'failed') {
          showAlert("Paiement échoué. Veuillez réessayer.", "error");
        }
      }
    } catch (error) {
      console.error('Erreur de vérification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Vérification automatique
  const startVerification = (transactionId: string | undefined) => {
    if (!transactionId) return;
    
    const interval = setInterval(async () => {
      await verifyPayment(transactionId);
      
      // Arrêter la vérification si le paiement est terminé
      if (paymentStatus === 'successful' || paymentStatus === 'failed') {
        clearInterval(interval);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Arrêter après 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Paiement NOUPIA
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Paiement sécurisé via NOUPIA Pay
              </p>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Informations de paiement
            </h2>

            <div className="space-y-6">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant (XAF)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="1000"
                  min="100"
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Votre nom complet"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="671234567"
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({...formData, method: 'mobilemoney'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.method === 'mobilemoney' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium">Mobile Money</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setFormData({...formData, method: 'noupia'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.method === 'noupia' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Portefeuille NOUPIA</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bouton de paiement */}
              <button
                onClick={initiatePayment}
                disabled={!isFormValid() || isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initialisation du paiement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Payer {formData.amount.toLocaleString()} XAF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statut du paiement */}
          {transactionId && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Statut du paiement
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Transaction: {transactionId}
                  </span>
                </div>

                {paymentStatus && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    paymentStatus === 'successful' ? 'bg-green-50 dark:bg-green-900/20' :
                    paymentStatus === 'failed' ? 'bg-red-50 dark:bg-red-900/20' :
                    'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    {paymentStatus === 'successful' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : paymentStatus === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                    )}
                    <span className="font-medium">
                      {paymentStatus === 'successful' ? 'Paiement réussi !' :
                       paymentStatus === 'failed' ? 'Paiement échoué' :
                       'En attente de confirmation...'}
                    </span>
                  </div>
                )}

                {isVerifying && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification en cours...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations importantes
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div>• Le paiement est sécurisé et crypté</div>
              <div>• Vous recevrez un SMS de confirmation</div>
              <div>• Le statut sera mis à jour automatiquement</div>
              <div>• En cas de problème, contactez le support</div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
              <Link 
                href="/setup-noupia"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                <span>⚙️</span>
                Configurer les clés NOUPIA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 