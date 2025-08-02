'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft, Globe, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PaymentForm {
  amount: number;
  phone: string;
  email: string;
  name: string;
  reference: string;
  method: 'mobilemoney';
  operator: 'mtn' | 'orange' | 'moov' | 'airtel' | 'free' | 'auto';
  country: string;
  currency: string;
}

interface Country {
  code: string;
  name: string;
  currency: string;
  operators: Array<{
    code: string;
    name: string;
    color: string;
    icon: string;
  }>;
}

const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: 'CM',
    name: 'Cameroun',
    currency: 'XAF',
    operators: [
      { code: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-500 to-orange-500', icon: '📱' },
      { code: 'orange', name: 'Orange Money', color: 'from-orange-500 to-red-500', icon: '🍊' },
      { code: 'moov', name: 'Moov Money', color: 'from-blue-500 to-purple-500', icon: '🌊' }
    ]
  },
  {
    code: 'SN',
    name: 'Sénégal',
    currency: 'XOF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: 'from-orange-500 to-red-500', icon: '🍊' },
      { code: 'free', name: 'Free Money', color: 'from-green-500 to-blue-500', icon: '🆓' },
      { code: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-500 to-orange-500', icon: '📱' }
    ]
  },
  {
    code: 'CI',
    name: 'Côte d\'Ivoire',
    currency: 'XOF',
    operators: [
      { code: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-500 to-orange-500', icon: '📱' },
      { code: 'moov', name: 'Moov Money', color: 'from-blue-500 to-purple-500', icon: '🌊' },
      { code: 'orange', name: 'Orange Money', color: 'from-orange-500 to-red-500', icon: '🍊' }
    ]
  },
  {
    code: 'CG',
    name: 'Congo',
    currency: 'XAF',
    operators: [
      { code: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-500 to-orange-500', icon: '📱' },
      { code: 'airtel', name: 'Airtel Money', color: 'from-red-500 to-pink-500', icon: '📞' }
    ]
  },
  {
    code: 'BJ',
    name: 'Bénin',
    currency: 'XOF',
    operators: [
      { code: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-500 to-orange-500', icon: '📱' },
      { code: 'moov', name: 'Moov Money', color: 'from-blue-500 to-purple-500', icon: '🌊' }
    ]
  }
];

export default function MultiPaysPaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'successful' | 'failed' | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(SUPPORTED_COUNTRIES[0]);
  const [selectedOperator, setSelectedOperator] = useState<string>('auto');
  
  const [formData, setFormData] = useState<PaymentForm>({
    amount: 1000,
    phone: '',
    email: 'user@bestrong.com',
    name: 'BeStrong User',
    reference: `BE_STRONG_${Date.now()}`,
    method: 'mobilemoney',
    operator: 'auto',
    country: 'CM',
    currency: 'XAF'
  });

  const isFormValid = () => {
    return formData.amount >= 100 && // Minimum selon la documentation NOUPIA
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

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setFormData({
      ...formData,
      country: country.code,
      currency: country.currency,
      operator: 'auto'
    });
    setSelectedOperator('auto');
  };

  const handleOperatorSelect = (operatorCode: string) => {
    setSelectedOperator(operatorCode);
    setFormData({
      ...formData,
      operator: operatorCode as any
    });
  };

  const initiatePayment = async () => {
    if (!isFormValid()) {
      if (formData.amount < 100) {
        alert("❌ Montant minimum requis : 100 XAF");
      } else {
        alert("Veuillez remplir tous les champs correctement");
      }
      return;
    }
    
    setIsLoading(true);
    setPaymentStatus(null);
    setTransactionId(null);

    try {
      // Nettoyer le numéro de téléphone selon la documentation NOUPIA
      const cleanPhone = formData.phone.replace(/\D/g, '');
      let phoneWithoutPrefix = cleanPhone.startsWith('237') ? cleanPhone.slice(3) : cleanPhone;
      
      // Pour Orange Money, essayer avec le format complet si le format court échoue
      if (selectedOperator === 'orange' && phoneWithoutPrefix.length === 9) {
        // Garder le format 9 chiffres pour Orange
        phoneWithoutPrefix = phoneWithoutPrefix;
      }
      
      console.log('📞 Numéro nettoyé:', { original: formData.phone, cleaned: phoneWithoutPrefix });
      console.log('🔍 Debug selectedOperator:', { 
        selectedOperator, 
        isAuto: selectedOperator === 'auto',
        finalOperator: selectedOperator === 'auto' ? undefined : selectedOperator
      });

      // Préparer les données selon la documentation NOUPIA
      const paymentData = {
        amount: formData.amount,
        phone: phoneWithoutPrefix, // Sera converti en number dans l'API
        email: formData.email,
        name: formData.name,
        reference: formData.reference,
        method: 'mobilemoney' as const,
        country: selectedCountry.code,
        currency: selectedCountry.currency,
        user_id: 123, // À remplacer par l'ID utilisateur réel
        operator: selectedOperator === 'auto' ? undefined : selectedOperator
      };

      console.log('📤 Données de paiement envoyées:', paymentData);

      const response = await fetch('/api/payment/noupia/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      console.log('📡 Réponse API:', result);

      if (result.response === 'success' && result.data?.transaction) {
        setTransactionId(result.data.transaction);
        alert(`🎉 Paiement initié avec succès ! 
        
📱 Transaction ID: ${result.data.transaction}
💰 Montant: ${formData.amount} ${selectedCountry.currency}
📞 Numéro: ${phoneWithoutPrefix}
🌍 Pays: ${selectedCountry.name}
📱 Opérateur: ${selectedOperator === 'auto' ? 'Auto-détection' : selectedOperator.toUpperCase()}

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
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link 
            href="/thank-you"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-3xl opacity-20"></div>
            <h1 className="relative text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Paiement Multi-Pays
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Support Orange Money, MTN et autres opérateurs
          </p>
        </div>

        {/* Formulaire de paiement */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
          <form onSubmit={(e) => { e.preventDefault(); initiatePayment(); }} className="space-y-6">
            
            {/* Sélection du pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Globe className="inline w-4 h-4 mr-2" />
                Pays
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SUPPORTED_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountryChange(country)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      selectedCountry.code === country.code
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-bold">{country.name}</div>
                    <div className="text-xs opacity-75">{country.currency}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection de l'opérateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Smartphone className="inline w-4 h-4 mr-2" />
                Opérateur Mobile Money
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleOperatorSelect('auto')}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                    selectedOperator === 'auto'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-bold">🔄 Auto-détection</div>
                  <div className="text-xs opacity-75">Recommandé</div>
                </button>
                
                {selectedCountry.operators.map((operator) => (
                  <button
                    key={operator.code}
                    type="button"
                    onClick={() => handleOperatorSelect(operator.code)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      selectedOperator === operator.code
                        ? `border-${operator.color.split('-')[1]}-500 bg-${operator.color.split('-')[1]}-50 dark:bg-${operator.color.split('-')[1]}-900/20 text-${operator.color.split('-')[1]}-700 dark:text-${operator.color.split('-')[1]}-300`
                        : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-bold">{operator.icon} {operator.name}</div>
                    <div className="text-xs opacity-75">{operator.code.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant ({formData.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/30 focus:border-green-500 text-base transition-all duration-300 backdrop-blur-sm"
                  placeholder="100"
                  min="100"
                  max="500000"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-bold">
                  {formData.currency}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                💡 Montant minimum: 100 {formData.currency} | Maximum: 500,000 {formData.currency}
              </div>
              
              {/* Boutons de montant rapide */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[100, 500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({...formData, amount})}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                      formData.amount === amount
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    {amount} {formData.currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/30 focus:border-green-500 text-base transition-all duration-300 backdrop-blur-sm"
                  placeholder={`Votre numéro ${selectedCountry.name}`}
                  required
                />
              </div>
            </div>

            {/* Bouton de paiement */}
            <div>
              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-500 flex items-center justify-center gap-4 text-lg relative overflow-hidden ${
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
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>Payer {formData.amount} {formData.currency}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Statut du paiement */}
          {paymentStatus && (
            <div className={`mt-6 p-6 rounded-xl backdrop-blur-xl border-2 ${
              paymentStatus === 'successful' ? 'bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-green-500/25' :
              paymentStatus === 'failed' ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-red-500/25' :
              'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-yellow-500/25'
            }`}>
              <div className="flex items-center gap-4">
                {paymentStatus === 'successful' ? (
                  <>
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <span className="text-green-700 dark:text-green-300 font-medium text-lg">
                      Paiement réussi ! Redirection vers le tableau de bord...
                    </span>
                  </>
                ) : paymentStatus === 'failed' ? (
                  <>
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="text-red-700 dark:text-red-300 font-medium text-lg">
                      Paiement échoué. Veuillez réessayer.
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                      <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="text-yellow-700 dark:text-yellow-300 font-medium text-lg">
                      Vérification du paiement en cours...
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bouton de réessai */}
          {paymentStatus === 'failed' && (
            <div className="mt-6">
              <button 
                onClick={() => {
                  setFormData({ ...formData, amount: 1000, phone: formData.phone, reference: `BE_STRONG_${Date.now()}` });
                  setTransactionId(null);
                  setPaymentStatus(null);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 text-lg shadow-xl hover:shadow-red-500/25 hover:scale-105"
              >
                Réessayer le paiement
              </button>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Informations importantes
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                <span className="text-green-500 text-xl">✅</span>
              </div>
              <span className="font-medium">Paiement sécurisé via NOUPIA</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <span className="text-blue-500 text-xl">📱</span>
              </div>
              <span className="font-medium">Support: MTN, Orange, Moov, Airtel, Free</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <span className="text-purple-500 text-xl">⚡</span>
              </div>
              <span className="font-medium">Vérification automatique</span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Problème ? <a href="https://wa.me/237672886348" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Contactez-nous</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 