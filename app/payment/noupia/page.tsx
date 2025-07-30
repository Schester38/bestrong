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
    return formData.amount > 0 &&
           formData.phone.length >= 9 &&
           formData.phone.length <= 9;
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
      alert("Veuillez remplir tous les champs correctement");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Paiement NOUPIA
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            MTN Mobile Money
          </p>
        </div>

        {/* Formulaire de paiement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <form onSubmit={(e) => { e.preventDefault(); initiatePayment(); }} className="space-y-4">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant (XAF)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                placeholder="1000"
                min="100"
                required
              />
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro MTN
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                placeholder="Votre numéro MTN"
                required
              />
            </div>

            {/* Bouton de paiement */}
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className={`w-full py-4 px-4 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 text-base ${
                isFormValid() && !isLoading
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Payer {formData.amount} XAF
                </>
              )}
            </button>
          </form>

          {/* Statut du paiement */}
          {paymentStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              paymentStatus === 'successful' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
              paymentStatus === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
              'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-3">
                {paymentStatus === 'successful' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                      Paiement réussi ! Redirection...
                    </span>
                  </>
                ) : paymentStatus === 'failed' ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300 font-medium text-sm">
                      Paiement échoué. Réessayez.
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-700 dark:text-yellow-300 font-medium text-sm">
                      Vérification en cours...
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bouton de réessai */}
          {paymentStatus === 'failed' && (
            <div className="mt-4">
              <button 
                onClick={() => {
                  setFormData({ ...formData, amount: 1000, phone: formData.phone, reference: `BE_STRONG_${Date.now()}` });
                  setTransactionId(null);
                  setPaymentStatus(null);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 text-sm"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Informations importantes
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-lg">✅</span>
              <span>Paiement sécurisé via NOUPIA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-lg">✅</span>
              <span>USSD *126# • Frais : 2 XAF</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-lg">✅</span>
              <span>Vérification automatique</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 