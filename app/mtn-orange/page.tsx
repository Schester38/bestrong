"use client";

import Link from "next/link";

export default function MtnOrangePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-orange-200 dark:border-orange-400">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">1000 F CFA / mois</div>
        <h1 className="text-3xl font-bold mb-6 text-orange-600 dark:text-orange-400">Paiement Mobile Money</h1>
        <div className="mb-6">
          <div className="mb-4">
            <span className="block text-lg font-semibold text-orange-700 dark:text-orange-300 mb-1">Orange Money</span>
            <span className="block text-xl font-bold text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900 rounded-lg px-4 py-2 mx-auto w-fit">00237 699486146</span>
          </div>
          <div>
            <span className="block text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-1">MTN Mobile Money</span>
            <span className="block text-xl font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900 rounded-lg px-4 py-2 mx-auto w-fit">00237 672886348</span>
          </div>
        </div>
        <Link href="/thank-you" className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200">Retour</Link>
      </div>
    </div>
  );
} 