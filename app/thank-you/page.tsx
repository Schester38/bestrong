"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { useAlert } from "../components/CustomAlert";

declare global {
  interface Window {
    CinetPay: {
      setConfig: (config: Record<string, unknown>) => void;
      getCheckout: (params: Record<string, unknown>) => void;
      waitResponse: (cb: (data: { status: string }) => void) => void;
    };
  }
}

export default function ThankYouPage() {
  const { showAlert } = useAlert();
  const [showTrialButton, setShowTrialButton] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [noteReason, setNoteReason] = useState<'admin' | 'trial' | 'payment' | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.cinetpay.com/seamless/main.js";
      script.async = true;
      document.body.appendChild(script);

      const interval = setInterval(() => {
        if (window.CinetPay) {
          window.CinetPay.setConfig({
            apikey: "200290337868757be2603959.83572739",
            site_id: "105901975",
            notify_url: "https://mondomaine.com/api/payment/cinetpay/notify",
            close_after_response: true,
            mode: "PRODUCTION"
          });
          clearInterval(interval);
        }
      }, 100);

      // Vérification période d'essai
      const user = getCurrentUser();
      if (user && user.id) {
        fetch(`/api/auth/user-info?userId=${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.user) {
              const userData = data.user;
              
              // Vérifier si l'utilisateur a été bloqué par l'admin
              if (typeof userData.dashboardAccess === 'boolean' && userData.dashboardAccess === false) {
                setShowNote(true);
                setNoteReason('admin');
                setShowTrialButton(false);
              } 
              // Vérifier si la période d'essai est terminée
              else if (userData.dateInscription) {
                const dateInscription = new Date(userData.dateInscription);
                const now = new Date();
                const diffJours = (now.getTime() - dateInscription.getTime()) / (1000 * 60 * 60 * 24);
                
                if (diffJours >= 45) {
                  setShowNote(true);
                  setNoteReason('trial');
                  setShowTrialButton(false);
                } else {
                  // Nouvel utilisateur dans sa période d'essai
                  setShowTrialButton(true);
                  setShowNote(false);
                }
              } 
              // Vérifier si la période de paiement est terminée
              else if (userData.date_dernier_paiement) {
                const datePaiement = new Date(userData.date_dernier_paiement);
                const now = new Date();
                const diffJours = (now.getTime() - datePaiement.getTime()) / (1000 * 60 * 60 * 24);
                
                if (diffJours >= 30) {
                  setShowNote(true);
                  setNoteReason('payment');
                  setShowTrialButton(false);
                } else {
                  // Utilisateur avec paiement valide
                  setShowTrialButton(false);
                  setShowNote(false);
                }
              } else {
                // Utilisateur sans date d'inscription (nouveau)
                setShowTrialButton(true);
                setShowNote(false);
              }
            }
            setLoading(false);
          })
          .catch(() => {
            // En cas d'erreur, on affiche le bouton d'essai par défaut
            setShowTrialButton(true);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }

      return () => {
        clearInterval(interval);
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const handlePay = () => {
    if (window.CinetPay) {
      window.CinetPay.getCheckout({
        transaction_id: Date.now().toString(),
        amount: 1000,
        currency: "XAF",
        channels: "MOBILE_MONEY",
        description: "Paiement accès 30 jours",
        customer_name: "Joe",
        customer_surname: "Down",
        customer_email: "down@test.com",
        customer_phone_number: "088767611",
        customer_address: "BP 0024",
        customer_city: "Antananarivo",
        customer_country: "CM",
        customer_state: "CM",
        customer_zip_code: "06510",
      });
      window.CinetPay.waitResponse(function (data: { status: string }) {
        if (data.status === "REFUSED") {
          showAlert("Votre paiement a échoué", "error");
          window.location.reload();
        } else if (data.status === "ACCEPTED") {
          showAlert("Votre paiement a été effectué avec succès", "success");
          window.location.href = "/dashboard";
        }
      });
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">Merci pour votre inscription !</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-200">
          Votre compte a bien été créé.<br />
          {showTrialButton 
            ? "Vous avez accès gratuitement à toutes les fonctionnalités pendant 45 jours !"
            : "Pour accéder à toutes les fonctionnalités, veuillez régler votre accès pour 30 jours."
          }
        </p>
        
        {showTrialButton && (
          <button
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 mb-4"
            onClick={() => window.location.href = "/dashboard"}
          >
            🎉 Accès gratuit pour 45 jours
          </button>
        )}

        {showNote && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 flex flex-col items-center">
            <p className="mb-3 text-base font-medium text-center">
              <span className="font-bold">Note :</span> {noteReason === 'admin' ? (
                <>Votre accès a été temporairement bloqué par l'administrateur. Veuillez effectuer un nouveau paiement pour réactiver votre accès aux fonctionnalités de l'application.</>
              ) : noteReason === 'trial' ? (
                <>Votre période d'essai gratuit de 45 jours est terminée. Veuillez effectuer un paiement pour obtenir l'accès aux fonctionnalités de l'application.</>
              ) : noteReason === 'payment' ? (
                <>Votre période de paiement de 30 jours est terminée. Veuillez effectuer un nouveau paiement pour continuer à accéder aux fonctionnalités de l'application.</>
              ) : null}
            </p>
            <button
              onClick={() => window.location.href = "/payment/noupia"}
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-semibold text-lg transition-all duration-200 shadow-md"
            >
              Effectuer le paiement
            </button>
          </div>
        )}

        <button
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 mb-4"
          onClick={() => window.location.href = "/payment/noupia"}
        >
          Payer avec NOUPIA
        </button>
        <Link href="/" className="text-pink-500 hover:text-pink-600 font-medium">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}