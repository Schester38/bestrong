"use client";

import { useState } from 'react';

export default function TestNoupia() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('mobilemoney');
  const [operator, setOperator] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('237612345678');
  const [amount, setAmount] = useState('1000');

  const testInitiatePayment = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const requestBody: any = {
        amount: parseInt(amount),
        phone: phoneNumber,
        email: "test@bestrong.com",
        name: "Test BeStrong",
        reference: `BSTEST${Date.now()}`, // Référence simplifiée sans caractères spéciaux
        method: paymentMethod,
        country: "CM",
        currency: "XAF"
      };

      // Ajouter l'opérateur seulement pour mobilemoney
      if (paymentMethod === 'mobilemoney') {
        requestBody.operator = operator;
      }

      console.log('Sending payment request:', requestBody);

      const response = await fetch('/api/payment/noupia/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      console.log('Response text length:', responseText.length);

      if (!responseText || responseText.trim() === '') {
        console.error('Empty response received');
        setError('Réponse vide reçue du serveur');
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response text was:', responseText);
        setError(`Réponse invalide: ${responseText.substring(0, 200)}`);
        return;
      }

      setResult(data);
      
      if (data.response === 'success') {
        console.log('✅ Paiement initié avec succès:', data);
      } else {
        console.error('❌ Erreur lors de l\'initiation:', data);
        // Afficher l'erreur même si c'est un 400
        setError(`Erreur API: ${data.message || data.code || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testVerifyPayment = async () => {
    if (!result?.data?.transaction) {
      setError('Aucune transaction à vérifier. Initiez d\'abord un paiement.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/noupia/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: result.data.transaction
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.response === 'success') {
        console.log('✅ Vérification réussie:', data);
      } else {
        console.error('❌ Erreur lors de la vérification:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testSimpleEndpoint = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/simple-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          test: true,
          phone: phoneNumber // Envoyer le vrai numéro de téléphone
        })
      });

      const responseText = await response.text();
      console.log('Simple test response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Simple test result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAllOperators = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-operators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test operators response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test operators result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testWithDocs = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-with-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test with docs response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test with docs result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAutoDetection = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-auto-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test auto-detection response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test auto-detection result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrangeNumbers = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-orange-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test Orange Numbers response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Orange Numbers result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testMtnVsOrange = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-mtn-vs-orange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const responseText = await response.text();
      console.log('Test MTN vs Orange response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test MTN vs Orange result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testMtnSimple = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-mtn-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const responseText = await response.text();
      console.log('Test MTN Simple response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test MTN Simple result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrangeSimple = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-orange-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const responseText = await response.text();
      console.log('Test Orange Simple response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Orange Simple result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testNoupiaCodes = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-noupia-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test Noupia codes response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Noupia codes result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testFinal = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test final response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test final result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrange = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-orange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test Orange response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Orange result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrangeSupport = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-orange-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test Orange support response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Orange support result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testRealOrange = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-real-orange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: '699486146' // Votre vrai numéro Orange
        })
      });

      const responseText = await response.text();
      console.log('Test Real Orange response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Real Orange result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrangeMoney = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-orange-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: '699486146' // Votre vrai numéro Orange
        })
      });

      const responseText = await response.text();
      console.log('Test Orange Money response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Orange Money result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testMtnCountries = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-mtn-countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test MTN Countries response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test MTN Countries result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOfficialCountries = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-official-countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test Official Countries response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Official Countries result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrangeCM = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-orange-cm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber
        })
      });

      const responseText = await response.text();
      console.log('Test Orange CM response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Orange CM result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const testSimpleInitiate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/noupia/test-simple-initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000,
          phone: phoneNumber,
          email: 'test@example.com',
          name: 'Test User',
          reference: `TEST_${Date.now()}`,
          method: 'mobilemoney',
          operator: 'auto',
          country: 'CM',
          currency: 'XAF'
        })
      });

      const responseText = await response.text();
      console.log('Test Simple Initiate response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Réponse invalide: ${responseText}`);
        return;
      }

      setResult(data);
      console.log('Test Simple Initiate result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Test API NOUPIA</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test d'initiation de paiement</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone :
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="237612345678"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Format: 237612345678 (avec l'indicatif pays)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (XAF) :
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement :
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="mobilemoney">Mobile Money</option>
                <option value="invoice">Invoice (Facture)</option>
                <option value="withdraw">Withdraw (Retrait)</option>
              </select>

              {paymentMethod === 'mobilemoney' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opérateur :
                  </label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Aucun (détection automatique)</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="orange">Orange Money</option>
                    <option value="moov">Moov Money</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <button
              onClick={testInitiatePayment}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
            >
              {loading ? '⏳ Test en cours...' : '🚀 Tester l\'initiation'}
            </button>

            <button
              onClick={testVerifyPayment}
              disabled={loading || !result?.data?.transaction}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Vérification...' : '🔍 Vérifier le paiement'}
            </button>

            <button
              onClick={testSimpleEndpoint}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test simple endpoint...' : '🧪 Tester l\'endpoint simple'}
            </button>

            <button
              onClick={testAllOperators}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test tous les opérateurs...' : '🧪 Tester tous les opérateurs'}
            </button>

            <button
              onClick={testWithDocs}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test avec documentation...' : '📚 Test avec Documentation'}
            </button>

            <button
              onClick={testAutoDetection}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Auto-détection...' : '🔍 Test Auto-détection'}
            </button>

            <button
              onClick={testNoupiaCodes}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Codes Noupia...' : '🎯 Test Codes Noupia'}
            </button>

            <button
              onClick={testFinal}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Final...' : '✅ Test Final (Sans 237)'}
            </button>

            <button
              onClick={testOrange}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Orange...' : '🍊 Test Orange'}
            </button>

            <button
              onClick={testOrangeSupport}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Support Orange...' : '🔍 Test Support Orange'}
            </button>

            <button
              onClick={testRealOrange}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Vrai Orange...' : '🍊 Test Vrai Orange (699486146)'}
            </button>

            <button
              onClick={testOrangeMoney}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Orange Money...' : '💰 Test Orange Money'}
            </button>

            <button
              onClick={testMtnCountries}
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Pays MTN...' : '🌍 Test Pays MTN'}
            </button>

            <button
              onClick={testOfficialCountries}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Pays Officiels...' : '🏆 Test Pays Officiels'}
            </button>

            <button
              onClick={testOrangeCM}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Orange CM...' : '🍊 Test Orange CM'}
            </button>

            <button
              onClick={testSimpleInitiate}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Simple...' : '🧪 Test Simple'}
            </button>

            <button
              onClick={testAutoDetection}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Auto-Détection...' : '🔍 Test Auto-Détection'}
            </button>

            <button
              onClick={testOrangeNumbers}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Numéros Orange...' : '🍊 Test Numéros Orange'}
            </button>

            <button
              onClick={testMtnVsOrange}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test MTN vs Orange...' : '⚖️ Test MTN vs Orange'}
            </button>

            <button
              onClick={testMtnSimple}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test MTN Simple...' : '📱 Test MTN Simple'}
            </button>

            <button
              onClick={testOrangeSimple}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg ml-4"
            >
              {loading ? '⏳ Test Orange Simple...' : '🍊 Test Orange Simple'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Résultat :</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions :</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Entrez votre vrai numéro de téléphone (avec l'indicatif pays)</li>
            <li>Choisissez le montant à tester</li>
            <li>Sélectionnez la méthode de paiement</li>
            <li>Si vous choisissez Mobile Money, sélectionnez l'opérateur</li>
            <li>Cliquez sur "Tester l'initiation" pour créer un paiement</li>
            <li>Si l'initiation réussit, vous obtiendrez un ID de transaction</li>
            <li>Utilisez cet ID pour tester la vérification</li>
            <li>Vérifiez les logs dans la console du navigateur</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Attention :</h3>
          <p className="text-yellow-700">
            Ce test utilise de vrais appels à l'API Noupia. Assurez-vous d'utiliser un numéro de téléphone valide 
            et un montant approprié pour vos tests.
          </p>
        </div>
      </div>
    </div>
  );
} 