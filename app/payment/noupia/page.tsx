'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PaymentForm {
  amount: number;
  phone: string;
  email: string;
  name: string;
  reference: string;
  method: 'mobilemoney' | 'noupia';
  operator?: 'mtn' | 'orange' | 'auto';
  country: string;
  currency: string;
}

export default function NoupiaPaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'successful' | 'failed' | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [formData, setFormData] = useState<PaymentForm>({
    amount: 1000,
    phone: '',
    email: 'user@bestrong.com',
    name: 'BeStrong User',
    reference: `BE_STRONG_${Date.now()}`,
    method: 'mobilemoney',
    operator: 'mtn',
    country: 'CM',
    currency: 'XAF'
  });

  const isFormValid = () => {
    return formData.amount >= 1000 &&
           formData.phone.length >= 9;
  };

  const createSubscription = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('❌ Utilisateur non trouvé dans localStorage');
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('👤 Utilisateur trouvé:', user);

      const response = await fetch('/api/auth/update-payment-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          days: 30
        }),
      });

      if (!response.ok) {
        console.error('❌ Erreur API update-payment-date:', response.status);
        return;
      }

      const result = await response.json();
      console.log('✅ Abonnement créé:', result);
    } catch (error) {
      console.error('❌ Erreur création abonnement:', error);
    }
  };

  const initiatePayment = async () => {
    if (!isFormValid()) {
      if (formData.amount < 1000) {
        alert("❌ Montant minimum requis : 1000 XAF");
      } else {
        alert("Veuillez remplir tous les champs correctement");
      }
      return;
    }
    
    setIsLoading(true);
    setPaymentStatus(null);
    setTransactionId(null);

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const phoneWithoutPrefix = cleanPhone.startsWith('237') ? cleanPhone.slice(3) : cleanPhone;
      
      console.log('📞 Numéro nettoyé:', { original: formData.phone, cleaned: phoneWithoutPrefix });

      const response = await fetch('/api/payment/noupia/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount,
          phone: phoneWithoutPrefix,
          email: formData.email,
          name: formData.name,
          reference: formData.reference,
          method: formData.method,
          operator: formData.operator,
          country: formData.country,
          currency: formData.currency
        }),
      });

      const result = await response.json();
      console.log('📡 Réponse API:', result);

      if (result.success && result.data) {
        setTransactionId(result.data.transaction);
        alert(`🎉 Paiement initié avec succès ! 
        
📱 USSD Code: ${result.data.ussd || '*126#'}
💰 Montant: ${result.data.amount} XAF
📞 Numéro: ${phoneWithoutPrefix}

✅ Vérifiez votre téléphone et confirmez le paiement.`);
        
        startVerification(result.data.transaction);
      } else {
        alert(`❌ Erreur de paiement
        
${result.message || 'Erreur lors de l\'initiation du paiement'}

Veuillez vérifier vos informations et réessayer.`);
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      alert(`❌ Erreur de connexion

Impossible de contacter le serveur de paiement.

Vérifiez votre connexion internet et réessayez.`);
    } finally {
      setIsLoading(false);
    }
  };

  const startVerification = (transactionId: string) => {
    if (!transactionId) return;
    
    setPaymentStatus('pending');
    
    let verificationCount = 0;
    const maxVerifications = 60;
    
    const interval = setInterval(async () => {
      verificationCount++;
      
      try {
        const response = await fetch('/api/payment/noupia/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId }),
        });

        const result = await response.json();

        if (result.response === 'success' && result.data) {
          const status = result.data.status;
          setPaymentStatus(status as 'pending' | 'successful' | 'failed');
          
          if (status === 'successful' && !isRedirecting) {
            setIsRedirecting(true);
            alert("Paiement réussi ! Redirection vers le tableau de bord...");
            
            await createSubscription();
            
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            
            clearInterval(interval);
          } else if (status === 'failed') {
            alert("Paiement échoué. Le paiement n'a pas été effectué. Veuillez réessayer.");
            setFormData({
              ...formData,
              amount: 1000,
              phone: formData.phone,
              reference: `BE_STRONG_${Date.now()}`
            });
            setTransactionId(null);
            setPaymentStatus(null);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Erreur de vérification:', error);
      }
      
      if (verificationCount >= maxVerifications) {
        clearInterval(interval);
        if (paymentStatus === 'pending') {
          alert("Délai d'attente dépassé. Vérifiez manuellement le statut de votre paiement.");
          setPaymentStatus(null);
        }
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-1 sm:mb-2">
          <Link 
            href="/"
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-1 group"
          >
            <ArrowLeft className="w-2 h-2 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-3xl opacity-20"></div>
            <h1 className="relative text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Paiement NOUPIA
            </h1>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            MTN Mobile Money
          </p>
        </div>

        {/* Formulaire de paiement */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 sm:p-3 shadow-2xl mb-2 sm:mb-3 border border-white/20 dark:border-gray-700/50">
          <form onSubmit={(e) => { e.preventDefault(); initiatePayment(); }} className="space-y-3">
                        {/* Montant */}
            <div className="mb-2 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Montant (XAF)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                  className="w-full p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/30 focus:border-green-500 text-sm sm:text-base transition-all duration-300 backdrop-blur-sm"
                  placeholder="1000"
                  min="1000"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm font-bold">
                  XAF
                </div>
              </div>
            </div>
            
            {/* Séparateur */}
            <div className="h-1 bg-gradient-to-r from-transparent via-green-200 dark:via-green-800 to-transparent rounded-full mb-4 sm:mb-8"></div>

            {/* Numéro de téléphone */}
            <div className="mb-2 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Numéro MTN
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/30 focus:border-green-500 text-sm sm:text-base transition-all duration-300 backdrop-blur-sm"
                  placeholder="Votre numéro MTN"
                  required
                />
 
              </div>
            </div>
            
            {/* Séparateur */}
            <div className="h-1 bg-gradient-to-r from-transparent via-green-200 dark:via-green-800 to-transparent rounded-full mb-4 sm:mb-8"></div>

            {/* Bouton de paiement */}
            <div>
              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className={`w-full py-4 sm:py-8 px-4 sm:px-8 rounded-xl font-bold text-white transition-all duration-500 flex items-center justify-center gap-4 text-sm sm:text-xl relative overflow-hidden ${
                  isFormValid() && !isLoading
                    ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 shadow-2xl hover:shadow-green-500/25 hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isFormValid() && !isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-1000 hover:translate-x-full"></div>
                )}
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                    <span className="text-xs sm:text-base">Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-base">Payer {formData.amount} XAF</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Statut du paiement */}
          {paymentStatus && (
            <div className={`mt-4 sm:mt-8 p-4 sm:p-6 rounded-xl backdrop-blur-xl border-2 ${
              paymentStatus === 'successful' ? 'bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-green-500/25' :
              paymentStatus === 'failed' ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-red-500/25' :
              'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-yellow-500/25'
            }`}>
              <div className="flex items-center gap-2 sm:gap-4">
                {paymentStatus === 'successful' ? (
                  <>
                    <div className="p-1 sm:p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
                    </div>
                    <span className="text-green-700 dark:text-green-300 font-medium text-xs sm:text-lg">
                      Paiement réussi ! Redirection vers le tableau de bord...
                    </span>
                  </>
                ) : paymentStatus === 'failed' ? (
                  <>
                    <div className="p-1 sm:p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                      <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
                    </div>
                    <span className="text-red-700 dark:text-red-300 font-medium text-xs sm:text-lg">
                      Paiement échoué. Veuillez réessayer.
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-1 sm:p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="text-yellow-700 dark:text-yellow-300 font-medium text-xs sm:text-lg">
                      Vérification du paiement en cours...
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bouton de réessai */}
          {paymentStatus === 'failed' && (
            <div className="mt-4 sm:mt-8">
              <button 
                onClick={() => {
                  setFormData({ ...formData, amount: 1000, phone: formData.phone, reference: `BE_STRONG_${Date.now()}` });
                  setTransactionId(null);
                  setPaymentStatus(null);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 sm:py-6 px-4 sm:px-8 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-lg shadow-xl hover:shadow-red-500/25 hover:scale-105"
              >
                Réessayer le paiement
              </button>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-2 sm:p-3 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Informations importantes
          </h3>
          <div className="space-y-1 sm:space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
              <div className="p-1 sm:p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                <span className="text-green-500 text-sm sm:text-xl">✅</span>
              </div>
              <span className="font-medium text-xs sm:text-sm">Paiement sécurisé via NOUPIA</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
              <div className="p-1 sm:p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <span className="text-blue-500 text-sm sm:text-xl">📱</span>
              </div>
              <span className="font-medium text-xs sm:text-sm">Frais: 2%</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
              <div className="p-1 sm:p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <span className="text-purple-500 text-sm sm:text-xl">⚡</span>
              </div>
              <span className="font-medium text-xs sm:text-sm">Vérification automatique</span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-2 sm:mt-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-2 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              Problème ? <a href="https://wa.me/237672886348" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Contactez-nous</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 