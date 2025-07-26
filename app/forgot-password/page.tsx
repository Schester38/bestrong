"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

const countryCodes = [
  { code: "+33", name: "France" },
  { code: "+225", name: "Côte d'Ivoire" },
  { code: "+237", name: "Cameroun" },
  { code: "+221", name: "Sénégal" },
  { code: "+32", name: "Belgique" },
  { code: "+41", name: "Suisse" },
  { code: "+1", name: "États-Unis/Canada" },
  { code: "+44", name: "Royaume-Uni" },
  { code: "+49", name: "Allemagne" },
  { code: "+34", name: "Espagne" },
  { code: "+216", name: "Tunisie" },
  { code: "+212", name: "Maroc" },
  { code: "+213", name: "Algérie" },
  { code: "+228", name: "Togo" },
  { code: "+229", name: "Bénin" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+241", name: "Gabon" },
  { code: "+240", name: "Guinée équatoriale" },
  { code: "+7", name: "Russie" },
  { code: "+86", name: "Chine" },
  { code: "+91", name: "Inde" },
  { code: "+81", name: "Japon" },
  { code: "+218", name: "Libye" },
  { code: "+20", name: "Égypte" },
  { code: "+27", name: "Afrique du Sud" },
  { code: "+351", name: "Portugal" },
  { code: "+39", name: "Italie" },
  { code: "+352", name: "Luxembourg" },
];

export default function ForgotPassword() {
  const [country, setCountry] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filtrer les pays selon la recherche
  const filteredCountries = countryCodes.filter(country => 
    country.name.toLowerCase().startsWith(searchFilter.toLowerCase())
  );

  function validatePhone(num: string) {
    return /^\d{6,15}$/.test(num);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePhone(phone)) {
      setError("Numéro de téléphone invalide");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Appel API pour réinitialiser le mot de passe
    fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        newPassword,
        country,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.message);
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setError("Erreur de connexion. Veuillez réessayer.");
      });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-pink-500 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Entrez votre numéro de téléphone et choisissez un nouveau mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Pays</label>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 mb-2"
                placeholder="Tapez la première lettre du pays..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
              />
              <select
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                value={country}
                onChange={e => setCountry(e.target.value)}
                aria-label="Sélectionner un pays"
              >
                {filteredCountries.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
              {searchFilter && (
                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  {filteredCountries.map(c => (
                    <div
                      key={c.code}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setCountry(c.code);
                        setSearchFilter("");
                      }}
                    >
                      {c.name} ({c.code})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">{country}</span>
              <input
                type="tel"
                className="w-full rounded-r-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                placeholder="Numéro sans l'indicatif"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={15}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                placeholder="Répétez le nouveau mot de passe"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
          >
            Réinitialiser le mot de passe
          </button>

          <div className="text-center">
            <Link href="/" className="text-pink-500 hover:text-pink-600 font-medium">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 