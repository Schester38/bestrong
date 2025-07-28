"use client";

import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ShareButton({ 
  title = "BE STRONG", 
  text = "Découvre BE STRONG : la plateforme éthique qui booste ta visibilité TikTok", 
  url = "https://mybestrong.netlify.app",
  className = "",
  children 
}: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text,
    url
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShowOptions(false);
      } else {
        // Fallback vers le menu d'options
        setShowOptions(true);
      }
    } catch (error) {
      console.log('Erreur lors du partage:', error);
      setShowOptions(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      const message = `${title}\n\n${text} ${url}`;
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = `${title}\n\n${text} ${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${title}\n\n${text} ${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowOptions(false);
  };

  const handleTelegramShare = () => {
    const message = encodeURIComponent(`${title}\n\n${text} ${url}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${message}`, '_blank');
    setShowOptions(false);
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowOptions(false);
  };

  const handleTwitterShare = () => {
    const message = encodeURIComponent(`${title} - ${text}`);
    window.open(`https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(url)}`, '_blank');
    setShowOptions(false);
  };

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${className}`}
      >
        {children || (
          <>
            <Share2 className="w-4 h-4" />
            Partager BE STRONG
          </>
        )}
      </button>

      {/* Menu d'options de partage */}
      {showOptions && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowOptions(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Partager BE STRONG
                </h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {/* Copier le lien */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {copied ? 'Lien copié !' : 'Copier le lien'}
                  </span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W</span>
                  </div>
                  <span className="text-sm">WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleTelegramShare}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-sm">Telegram</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleFacebookShare}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span className="text-sm">Facebook</span>
                </button>

                {/* Twitter */}
                <button
                  onClick={handleTwitterShare}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">𝕏</span>
                  </div>
                  <span className="text-sm">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 