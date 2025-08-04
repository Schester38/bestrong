'use client';

import { useState } from 'react';

export default function TikTokVerificationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState('');
  const [verificationKey, setVerificationKey] = useState('MrrkyxAZOWBAYx6Rla9ONr7vhx2zqXzY');

  const testVerification = async () => {
    setIsLoading(true);
    setVerificationResult('');
    
    try {
      // Test 1: API endpoint
      const apiResponse = await fetch('/api/tiktok/verify');
      const apiText = await apiResponse.text();
      
      // Test 2: Direct file access
      const fileResponse = await fetch('/tiktok-verification-simple.txt');
      const fileText = await fileResponse.text();
      
      // Test 3: HTML file
      const htmlResponse = await fetch('/tiktok-verification-simple.html');
      const htmlText = await htmlResponse.text();
      
      let result = '✅ Tests de vérification TikTok :\n\n';
      result += `🔗 API (/api/tiktok/verify): ${apiText.trim()}\n`;
      result += `📄 Fichier TXT (/tiktok-verification-simple.txt): ${fileText.trim()}\n`;
      result += `🌐 Fichier HTML (/tiktok-verification-simple.html): Accessible\n\n`;
      
      if (apiText.trim() === verificationKey && fileText.trim() === verificationKey) {
        result += '✅ Tous les tests sont réussis !\n';
        result += '📋 Copiez cette clé dans TikTok Developer Portal :\n';
        result += `🔑 ${verificationKey}`;
      } else {
        result += '❌ Certains tests ont échoué.\n';
        result += '🔧 Vérifiez la configuration des fichiers.';
      }
      
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult(`❌ Erreur lors du test : ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(verificationKey);
    setVerificationResult('📋 Clé copiée dans le presse-papiers !');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔍 Testeur de Vérification TikTok
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={testVerification}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? '⏳ Test...' : '🧪 Tester'}
          </button>
          <button
            onClick={copyKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📋 Copier Clé
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Clé de vérification actuelle :
          </label>
          <input
            type="text"
            value={verificationKey}
            onChange={(e) => setVerificationKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {verificationResult && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
              {verificationResult}
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2">
          📋 Instructions de vérification :
        </h4>
        <ol className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-decimal list-inside">
          <li>Cliquez sur "Tester" pour vérifier les fichiers</li>
          <li>Copiez la clé de vérification</li>
          <li>Dans TikTok Developer Portal, utilisez l'option "URL Prefix"</li>
          <li>Entrez : <code>https://mybestrong.netlify.app/tiktok-verification-simple.txt</code></li>
          <li>Cliquez sur "Vérifier"</li>
        </ol>
      </div>
    </div>
  );
} 