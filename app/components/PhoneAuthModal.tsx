"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import PaymentForm from "./PaymentForm";

const countryCodes = [
  { code: "+1", name: "États-Unis/Canada" },
  { code: "+7", name: "Russie" },
  { code: "+20", name: "Égypte" },
  { code: "+27", name: "Afrique du Sud" },
  { code: "+30", name: "Grèce" },
  { code: "+31", name: "Pays-Bas" },
  { code: "+32", name: "Belgique" },
  { code: "+33", name: "France" },
  { code: "+34", name: "Espagne" },
  { code: "+36", name: "Hongrie" },
  { code: "+39", name: "Italie" },
  { code: "+40", name: "Roumanie" },
  { code: "+41", name: "Suisse" },
  { code: "+43", name: "Autriche" },
  { code: "+44", name: "Royaume-Uni" },
  { code: "+45", name: "Danemark" },
  { code: "+46", name: "Suède" },
  { code: "+47", name: "Norvège" },
  { code: "+48", name: "Pologne" },
  { code: "+49", name: "Allemagne" },
  { code: "+51", name: "Pérou" },
  { code: "+52", name: "Mexique" },
  { code: "+54", name: "Argentine" },
  { code: "+55", name: "Brésil" },
  { code: "+56", name: "Chili" },
  { code: "+57", name: "Colombie" },
  { code: "+58", name: "Venezuela" },
  { code: "+60", name: "Malaisie" },
  { code: "+61", name: "Australie" },
  { code: "+62", name: "Indonésie" },
  { code: "+63", name: "Philippines" },
  { code: "+64", name: "Nouvelle-Zélande" },
  { code: "+65", name: "Singapour" },
  { code: "+66", name: "Thaïlande" },
  { code: "+81", name: "Japon" },
  { code: "+82", name: "Corée du Sud" },
  { code: "+84", name: "Vietnam" },
  { code: "+86", name: "Chine" },
  { code: "+90", name: "Turquie" },
  { code: "+91", name: "Inde" },
  { code: "+92", name: "Pakistan" },
  { code: "+93", name: "Afghanistan" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+95", name: "Myanmar" },
  { code: "+98", name: "Iran" },
  { code: "+212", name: "Maroc" },
  { code: "+213", name: "Algérie" },
  { code: "+216", name: "Tunisie" },
  { code: "+218", name: "Libye" },
  { code: "+220", name: "Gambie" },
  { code: "+221", name: "Sénégal" },
  { code: "+222", name: "Mauritanie" },
  { code: "+223", name: "Mali" },
  { code: "+224", name: "Guinée" },
  { code: "+225", name: "Côte d'Ivoire" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+227", name: "Niger" },
  { code: "+228", name: "Togo" },
  { code: "+229", name: "Bénin" },
  { code: "+230", name: "Maurice" },
  { code: "+231", name: "Libéria" },
  { code: "+232", name: "Sierra Leone" },
  { code: "+233", name: "Ghana" },
  { code: "+234", name: "Nigeria" },
  { code: "+235", name: "Tchad" },
  { code: "+236", name: "Centrafrique" },
  { code: "+237", name: "Cameroun" },
  { code: "+238", name: "Cap-Vert" },
  { code: "+239", name: "São Tomé-et-Principe" },
  { code: "+240", name: "Guinée équatoriale" },
  { code: "+241", name: "Gabon" },
  { code: "+242", name: "Congo-Brazzaville" },
  { code: "+243", name: "RDC" },
  { code: "+244", name: "Angola" },
  { code: "+245", name: "Guinée-Bissau" },
  { code: "+246", name: "Territoire britannique de l'océan Indien" },
  { code: "+247", name: "Ascension" },
  { code: "+248", name: "Seychelles" },
  { code: "+249", name: "Soudan" },
  { code: "+250", name: "Rwanda" },
  { code: "+251", name: "Éthiopie" },
  { code: "+252", name: "Somalie" },
  { code: "+253", name: "Djibouti" },
  { code: "+254", name: "Kenya" },
  { code: "+255", name: "Tanzanie" },
  { code: "+256", name: "Ouganda" },
  { code: "+257", name: "Burundi" },
  { code: "+258", name: "Mozambique" },
  { code: "+260", name: "Zambie" },
  { code: "+261", name: "Madagascar" },
  { code: "+262", name: "Réunion" },
  { code: "+263", name: "Zimbabwe" },
  { code: "+264", name: "Namibie" },
  { code: "+265", name: "Malawi" },
  { code: "+266", name: "Lesotho" },
  { code: "+267", name: "Botswana" },
  { code: "+268", name: "Eswatini" },
  { code: "+269", name: "Comores" },
  { code: "+290", name: "Sainte-Hélène" },
  { code: "+291", name: "Érythrée" },
  { code: "+297", name: "Aruba" },
  { code: "+298", name: "Îles Féroé" },
  { code: "+299", name: "Groenland" },
  { code: "+350", name: "Gibraltar" },
  { code: "+351", name: "Portugal" },
  { code: "+352", name: "Luxembourg" },
  { code: "+353", name: "Irlande" },
  { code: "+354", name: "Islande" },
  { code: "+355", name: "Albanie" },
  { code: "+356", name: "Malte" },
  { code: "+357", name: "Chypre" },
  { code: "+358", name: "Finlande" },
  { code: "+359", name: "Bulgarie" },
  { code: "+370", name: "Lituanie" },
  { code: "+371", name: "Lettonie" },
  { code: "+372", name: "Estonie" },
  { code: "+373", name: "Moldavie" },
  { code: "+374", name: "Arménie" },
  { code: "+375", name: "Biélorussie" },
  { code: "+376", name: "Andorre" },
  { code: "+377", name: "Monaco" },
  { code: "+378", name: "Saint-Marin" },
  { code: "+380", name: "Ukraine" },
  { code: "+381", name: "Serbie" },
  { code: "+382", name: "Monténégro" },
  { code: "+383", name: "Kosovo" },
  { code: "+385", name: "Croatie" },
  { code: "+386", name: "Slovénie" },
  { code: "+387", name: "Bosnie-Herzégovine" },
  { code: "+389", name: "Macédoine du Nord" },
  { code: "+420", name: "République tchèque" },
  { code: "+421", name: "Slovaquie" },
  { code: "+423", name: "Liechtenstein" },
  { code: "+500", name: "Îles Malouines" },
  { code: "+501", name: "Belize" },
  { code: "+502", name: "Guatemala" },
  { code: "+503", name: "El Salvador" },
  { code: "+504", name: "Honduras" },
  { code: "+505", name: "Nicaragua" },
  { code: "+506", name: "Costa Rica" },
  { code: "+507", name: "Panama" },
  { code: "+508", name: "Saint-Pierre-et-Miquelon" },
  { code: "+509", name: "Haïti" },
  { code: "+590", name: "Guadeloupe" },
  { code: "+591", name: "Bolivie" },
  { code: "+592", name: "Guyana" },
  { code: "+593", name: "Équateur" },
  { code: "+594", name: "Guyane française" },
  { code: "+595", name: "Paraguay" },
  { code: "+596", name: "Martinique" },
  { code: "+597", name: "Suriname" },
  { code: "+598", name: "Uruguay" },
  { code: "+599", name: "Antilles néerlandaises" },
  { code: "+670", name: "Timor oriental" },
  { code: "+672", name: "Territoire antarctique australien" },
  { code: "+673", name: "Brunei" },
  { code: "+674", name: "Nauru" },
  { code: "+675", name: "Papouasie-Nouvelle-Guinée" },
  { code: "+676", name: "Tonga" },
  { code: "+677", name: "Îles Salomon" },
  { code: "+678", name: "Vanuatu" },
  { code: "+679", name: "Fidji" },
  { code: "+680", name: "Palaos" },
  { code: "+681", name: "Wallis-et-Futuna" },
  { code: "+682", name: "Îles Cook" },
  { code: "+683", name: "Niue" },
  { code: "+685", name: "Samoa" },
  { code: "+686", name: "Kiribati" },
  { code: "+687", name: "Nouvelle-Calédonie" },
  { code: "+688", name: "Tuvalu" },
  { code: "+689", name: "Polynésie française" },
  { code: "+690", name: "Tokelau" },
  { code: "+691", name: "Micronésie" },
  { code: "+692", name: "Îles Marshall" },
  { code: "+850", name: "Corée du Nord" },
  { code: "+852", name: "Hong Kong" },
  { code: "+853", name: "Macao" },
  { code: "+855", name: "Cambodge" },
  { code: "+856", name: "Laos" },
  { code: "+880", name: "Bangladesh" },
  { code: "+886", name: "Taïwan" },
  { code: "+960", name: "Maldives" },
  { code: "+961", name: "Liban" },
  { code: "+962", name: "Jordanie" },
  { code: "+963", name: "Syrie" },
  { code: "+964", name: "Irak" },
  { code: "+965", name: "Koweït" },
  { code: "+966", name: "Arabie saoudite" },
  { code: "+967", name: "Yémen" },
  { code: "+968", name: "Oman" },
  { code: "+970", name: "Palestine" },
  { code: "+971", name: "Émirats arabes unis" },
  { code: "+972", name: "Israël" },
  { code: "+973", name: "Bahreïn" },
  { code: "+974", name: "Qatar" },
  { code: "+975", name: "Bhoutan" },
  { code: "+976", name: "Mongolie" },
  { code: "+977", name: "Népal" },
  { code: "+994", name: "Azerbaïdjan" },
  { code: "+995", name: "Géorgie" },
  { code: "+996", name: "Kirghizistan" },
  { code: "+998", name: "Ouzbékistan" },
  { code: "+999", name: "Tadjikistan" },
].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export default function PhoneAuthModal({ open, onClose, mode, onModeChange }: { open: boolean; onClose: () => void; mode: "login" | "register"; onModeChange?: (mode: "login" | "register") => void }) {
  const [country, setCountry] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Détecter si on est sur Android
  const isAndroid = typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Filtrer les pays selon la recherche
  const filteredCountries = countryCodes.filter(country => 
    country.name.toLowerCase().startsWith(searchFilter.toLowerCase())
  );

  function validatePhone(num: string) {
    // Simple validation: at least 6 digits
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
    if (!password || password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (mode === "register" && !pseudo.trim()) {
      setError("Le pseudo est obligatoire");
      return;
    }
    // Appel API réel
    const apiUrl = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        password,
        country,
        ...(mode === "register" ? { pseudo } : {}),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.message);
          // Stocker les données utilisateur en session/localStorage
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          if (mode === "register") {
            // Déclencher l'événement pour mettre à jour le compteur uniquement si l'API le demande
            if (data.triggerUserCountIncrement) {
              window.dispatchEvent(new Event("user-registered"));
            }
            router.push("/thank-you");
          } else {
            // Pour la connexion, s'assurer que l'utilisateur a accès au dashboard
            if (data.hasAccess) {
              localStorage.setItem("dashboardAccessGranted", "true");
            }
            setTimeout(() => {
              setSuccess("");
              onClose();
              // Utiliser la même méthode que le bouton de la page d'accueil
              router.push("/dashboard");
            }, 1500);
          }
        }
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setError("Erreur de connexion. Veuillez réessayer.");
      });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl">×</button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {mode === "register" ? "Créer un compte" : "Se connecter"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Numéro sans l&apos;indicatif"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={15}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                  placeholder="Répétez le mot de passe"
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
          )}
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1">Pseudo</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                placeholder="Votre pseudo (obligatoire)"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                minLength={2}
                maxLength={30}
                required={mode === "register"}
              />
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 mt-2"
          >
            {mode === "register" ? "Créer mon compte" : "Se connecter"}
          </button>
          
          {onModeChange && (
            <div className="text-center mt-4 space-y-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {mode === "register" ? "Vous avez déjà un compte ?" : "Vous n&apos;avez pas de compte ?"}
                <button
                  type="button"
                  onClick={() => onModeChange(mode === "register" ? "login" : "register")}
                  className="ml-1 text-pink-500 hover:text-pink-600 font-medium"
                >
                  {mode === "register" ? "Se connecter" : "Créer un compte"}
                </button>
              </p>
              {mode === "login" && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  <Link href="/forgot-password" className="text-pink-500 hover:text-pink-600 font-medium">
                    Mot de passe oublié ?
                  </Link>
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 