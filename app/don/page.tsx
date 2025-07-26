"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

export default function DonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-10 border-2 border-orange-200 dark:border-orange-400 text-center relative overflow-hidden">
        {/* Mot de présentation */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-2 animate-fade-in-up">Bienvenue sur la page de soutien à <span className="underline decoration-wavy decoration-orange-400 whitespace-nowrap">BE STRONG</span></h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto animate-fade-in-up">
            BE STRONG, c&apos;est bien plus qu&apos;une plateforme : c&apos;est une communauté engagée pour la croissance éthique et solidaire sur TikTok. Grâce à votre générosité, nous pouvons continuer à innover, à accompagner les créateurs et à offrir des outils accessibles à tous.
          </p>
        </div>
        <div className="flex flex-col items-center mb-6">
          <Heart className="w-20 h-20 text-orange-500 mb-4 animate-bounce drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">Soutenez <span className="whitespace-nowrap">BE STRONG</span></h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">Votre don, même le plus petit, a un impact immense sur la vie de nombreux créateurs. <span className="text-orange-600 dark:text-orange-400 font-semibold">Merci de croire en notre mission !</span></p>
        </div>
        {/* Phrase d'encouragement */}
        <div className="mb-8">
          <p className="text-xl italic text-pink-700 dark:text-pink-300 font-semibold animate-fade-in-up">« Ensemble, faisons grandir la solidarit&eacute; et la cr&eacute;ativit&eacute; sur TikTok&nbsp;! »</p>
        </div>
        <div className="text-left space-y-8 mt-8">
          <div className="bg-gradient-to-r from-yellow-200 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-2">1. Mobile Money</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-700 dark:text-gray-200">
              <div className="flex flex-col items-center gap-1">
                <img src="/orange-money.png" alt="Orange Money" className="w-[90px] h-[40px] object-contain inline-block" />
                <span className="text-center font-semibold">Orange Money</span>
                <span className="text-center font-bold">+237 699 486 146</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <img src="/mtn-momo.png" alt="MTN Mobile Money" className="w-[90px] h-[40px] object-contain inline-block" />
                <span className="text-center font-semibold">MTN Mobile Money</span>
                <span className="text-center font-bold">+237 672 886 348</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-200 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-md flex flex-col sm:flex-row items-center gap-6">
            <img src="/uba-logo.png" alt="UBA Logo" className="w-20 h-20 object-contain rounded-lg bg-white border-2 border-red-600 shadow-md mb-4 sm:mb-0" />
            <div>
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">2. Virement bancaire (UBA)</h2>
              <ul className="text-gray-700 dark:text-gray-200 text-base space-y-1">
                <li><span className="font-semibold">Code SWIFT :</span> UNAFCMCX</li>
                <li><span className="font-semibold">IBAN :</span> CM21 10033 05207 07002026857 58</li>
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-200 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-2">3. Autres moyens</h2>
            <p className="text-gray-700 dark:text-gray-200">Pour tout autre moyen de don, (WesyerUnion, MoneyGram etc...) contactez-nous directement :</p>
            <a href="https://wa.me/672886348" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg">WhatsApp : +237 672 88 63 48</a>
          </div>
          <div className="bg-gradient-to-r from-yellow-200 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">4. PayPal <span className="ml-2">🅿️</span></h2>
            <p className="text-gray-700 dark:text-gray-200 mb-4">Vous pouvez aussi soutenir BE STRONG via PayPal en scannant ce QR code&nbsp;:</p>
            <div className="flex flex-col items-center">
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-200 mb-2"
                onClick={() => window.location.href = "/paypal-qr.png"}
              >
                Scanner le code
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-200 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-md flex flex-col sm:flex-row items-center gap-6">
            <img src="/wave.png" alt="Wave Logo" className="w-20 h-20 object-contain rounded-lg bg-white border-2 border-blue-400 shadow-md mb-4 sm:mb-0" />
            <div>
              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">Wave</h2>
              <ul className="text-gray-700 dark:text-gray-200 text-base space-y-1">
                <li>
                  <span
                    className="inline-flex flex-col md:flex-row bg-blue-50 dark:bg-blue-900 border border-blue-400 dark:border-blue-500 rounded-lg px-4 py-2 sm:px-1 sm:py-0.5 font-semibold text-blue-800 dark:text-blue-200 w-full whitespace-nowrap overflow-x-auto text-center text-base sm:text-xs md:text-lg items-center justify-center gap-1"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <span>Numéro Wave&nbsp;:</span>
                    <span className="mt-1 md:mt-0">00237 672886348</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold hover:underline text-lg">
            <ArrowLeft className="w-5 h-5" /> Retour à l'accueil
          </Link>
        </div>
        {/* Décorations */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-200/40 rounded-full blur-2xl z-0 animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-200/40 rounded-full blur-2xl z-0 animate-pulse" />
      </div>
    </div>
  );
} 