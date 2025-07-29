"use client";

import { useState, useEffect } from "react";
import { ArrowDown, Download, Smartphone, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DownloadAPK() {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showDirectLink, setShowDirectLink] = useState(false);

  const apkUrl = "/api/download-apk";
  const apkSize = "7.6 MB";

  // Fonction pour démarrer le téléchargement avec suivi de progression
  const startDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const startTime = Date.now();
      const response = await fetch(apkUrl);
      
      if (!response.ok) {
        throw new Error('Erreur de téléchargement');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Impossible de lire le flux');

      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        receivedLength += value.length;
        const progress = total > 0 ? (receivedLength / total) * 100 : 0;
        setDownloadProgress(progress);
        
        // Calculer la vitesse de téléchargement
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (receivedLength / 1024 / 1024 / elapsed).toFixed(2);
        setDownloadSpeed(`${speed} MB/s`);
        
        // Calculer le temps restant
        if (parseFloat(speed) > 0) {
          const remaining = ((total - receivedLength) / 1024 / 1024) / parseFloat(speed);
          setTimeRemaining(`${remaining.toFixed(1)}s`);
        }
      }
      
      // Téléchargement terminé
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setShowDirectLink(true);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      setIsDownloading(false);
      setShowDirectLink(true);
    }
  };

  // Fonction pour téléchargement direct
  const downloadDirect = () => {
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'BeStrong.apk';
    link.click();
  };

  // Préchargement de l'APK
  useEffect(() => {
    const preloadAPK = () => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'fetch';
      link.href = apkUrl;
      document.head.appendChild(link);
    };
    
    preloadAPK();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Télécharger BE STRONG
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Application Android officielle - Optimisée pour la vitesse
            </p>
          </div>

          {/* Carte principale de téléchargement */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Informations APK */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  BE STRONG APK
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Version officielle</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Taille: {apkSize}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Compatible Android 6.0+</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Sécurisé et vérifié</span>
                  </div>
                </div>

                {/* Boutons de téléchargement */}
                <div className="space-y-4">
                  {!isDownloading && !showDirectLink && (
                    <button
                      onClick={startDownload}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Download className="w-6 h-6" />
                      Télécharger avec suivi
                    </button>
                  )}

                  {showDirectLink && (
                    <button
                      onClick={downloadDirect}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <ArrowDown className="w-6 h-6" />
                      Téléchargement direct
                    </button>
                  )}

                  <a
                    href={apkUrl}
                    download
                    className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                  >
                    Lien de téléchargement direct
                  </a>
                </div>
              </div>

              {/* Progression de téléchargement */}
              <div className="space-y-6">
                {isDownloading && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Téléchargement en cours...
                    </h3>
                    
                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progression</span>
                        <span>{downloadProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Vitesse:</span>
                        <div className="font-semibold text-green-600">{downloadSpeed}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Temps restant:</span>
                        <div className="font-semibold text-blue-600">{timeRemaining}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optimisations */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Optimisations activées
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div>• CDN Netlify pour vitesse maximale</div>
                    <div>• Compression automatique</div>
                    <div>• Préchargement intelligent</div>
                    <div>• Support des téléchargements résumables</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions d'installation */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Instructions d'installation
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Télécharger
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Cliquez sur le bouton de téléchargement ci-dessus
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Autoriser
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Autorisez l'installation depuis des sources inconnues
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Installer
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Ouvrez le fichier APK et suivez les instructions
                </p>
              </div>
            </div>
          </div>

          {/* Retour à l'accueil */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 