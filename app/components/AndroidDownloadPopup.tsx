"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, CheckCircle } from "lucide-react";

interface AndroidDownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function AndroidDownloadPopup({ isOpen, onClose, onDownload }: AndroidDownloadPopupProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = '/api/download-apk';
      link.download = 'BeStrong.apk';
      link.style.display = 'none';
      
      // Ajouter au DOM et déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simuler la progression (car on ne peut pas suivre le téléchargement natif)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsDownloading(false);
            onClose();
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      setIsDownloading(false);
    }
  };

  // Fermer le popup si l'utilisateur clique en dehors
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative animate-popup-slide-in">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Contenu */}
        <div className="text-center">
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Télécharger BE STRONG
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Installez l'application BE STRONG pour une expérience optimale sur votre appareil Android
          </p>

          {/* Avantages */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Accès hors ligne</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Notifications push</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Performance optimisée</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Interface native</span>
            </div>
          </div>

          {/* Progression de téléchargement */}
          {isDownloading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Téléchargement en cours...</span>
                <span>{downloadProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="space-y-3">
            {!isDownloading && (
              <button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger maintenant
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDownloading ? 'Fermer' : 'Plus tard'}
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            L'installation se fera automatiquement après le téléchargement
          </p>
        </div>
      </div>
    </div>
  );
} 