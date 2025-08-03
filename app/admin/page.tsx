"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2, RefreshCw, Lock, Eye, EyeOff, Edit, Search, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { useAlert } from "../components/CustomAlert";

// Interface Suggestion pour typage global
interface Suggestion {
  id: string;
  nom: string;
  numeroOuId: string;
  suggestion: string;
  date: string;
}

interface User {
  id: string;
  phone: string;
  credits: number;
  pseudo: string | null;
  createdAt: string;
  updatedAt: string;
  dashboardAccess?: boolean;
  dashboardAccessExpiresAt?: string;
  dashboardAccessDaysLeft?: number;
  dateInscription?: string;
}

interface Activity {
  id: string;
  userId: string;
  userPhone: string;
  userPseudo: string | null;
  type: string;
  description: string;
  credits?: number;
  details?: unknown;
  timestamp: string;
}

export default function AdminPage() {
  const { showConfirm } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [selectedUserActivities, setSelectedUserActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dashboardAccessLoading, setDashboardAccessLoading] = useState<{[userId: string]: boolean}>({});
  const [bulkCreditsLoading, setBulkCreditsLoading] = useState(false);
  const [bulkCreditsAmount, setBulkCreditsAmount] = useState("");
  const [deleteAllTasksLoading, setDeleteAllTasksLoading] = useState(false);
  // Suggestions admin (toujours en haut !)
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");

  // --- Notification admin vers utilisateur(s) ---
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState("");

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifMessage.trim()) {
      setNotifResult("Le message ne peut pas être vide.");
      return;
    }
    setNotifSending(true);
    setNotifResult("");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: notifTarget,
          message: notifMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifResult("Notification envoyée !");
        setNotifMessage("");
        setNotifTarget("all");
      } else {
        setNotifResult(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setNotifResult("Erreur lors de l'envoi");
    } finally {
      setNotifSending(false);
    }
  };

  // --- Changement de mot de passe admin ---
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdError("Tous les champs sont obligatoires.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch("/api/admin/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
      });
      const data = await res.json();
      if (data.success) {
        setPwdSuccess("Mot de passe modifié avec succès !");
        setOldPwd(""); setNewPwd(""); setConfirmPwd("");
        setShowPwdForm(false);
      } else {
        setPwdError(data.error || "Erreur lors du changement de mot de passe.");
      }
    } catch {
      setPwdError("Erreur réseau ou serveur.");
    } finally {
      setPwdLoading(false);
    }
  };

  // Authentification
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/password/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAuthError("");
        sessionStorage.setItem("admin_authenticated", "true");
      } else {
        setAuthError(data.error || "Mot de passe incorrect");
      }
    } catch {
      setAuthError("Erreur réseau ou serveur");
    }
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const authenticated = sessionStorage.getItem("admin_authenticated");
    if (authenticated === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Filtrer les utilisateurs selon la recherche
  useEffect(() => {
    if (searchPhone.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.phone.includes(searchPhone) || 
        (user.pseudo && user.pseudo.toLowerCase().includes(searchPhone.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchPhone]);

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000) // 10 secondes de timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        
        if (response.status === 401) {
          setError("Accès non autorisé - Vérifiez vos identifiants admin");
        } else if (response.status === 500) {
          setError("Erreur serveur - Vérifiez la configuration de la base de données");
        } else {
          setError(`Erreur serveur: ${response.status} - ${errorText}`);
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (!Array.isArray(data.users)) {
        console.warn('⚠️ Données reçues ne sont pas un tableau:', data);
        setUsers([]);
        return;
      }
      
      console.log(`✅ ${data.users.length} utilisateurs récupérés`);
      
        // S'assurer que tous les utilisateurs ont le champ dashboardAccess
        const usersWithAccess = await Promise.all((data.users || []).map(async (user: User) => {
        try {
          if (user.dashboardAccess) {
            // Appel API pour récupérer dashboardAccessDaysLeft
            const infoRes = await fetch(`/api/auth/user-info?userId=${user.id}`, {
              signal: AbortSignal.timeout(5000) // 5 secondes pour l'enrichissement
            });
            if (infoRes.ok) {
              const infoData = await infoRes.json();
              return {
                ...user,
                dashboardAccessExpiresAt: infoData.user?.dashboardAccessExpiresAt,
                dashboardAccessDaysLeft: infoData.dashboardAccessDaysLeft
              };
            }
          }
          return user;
        } catch (enrichmentError) {
          console.warn('⚠️ Erreur enrichissement utilisateur:', user.id, enrichmentError);
          return user;
        }
        }));
      
        setUsers(usersWithAccess);
      setFilteredUsers(usersWithAccess);
      console.log('✅ Utilisateurs enrichis et mis à jour');
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      
      let errorMessage = 'Erreur lors du chargement des utilisateurs';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Délai d\'attente dépassé - Vérifiez votre connexion';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de contacter le serveur - Vérifiez votre connexion internet';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Utiliser des données de démonstration en cas d'erreur
      const demoUsers = [
        {
          id: 'demo-1',
          phone: '+237699486146',
          credits: 150,
          pseudo: 'Admin Demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dashboardAccess: true,
          dashboardAccessDaysLeft: 30
        },
        {
          id: 'demo-2',
          phone: '+237612345678',
          credits: 75,
          pseudo: 'User Demo',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          dashboardAccess: false
        }
      ];
      
      setUsers(demoUsers);
      setFilteredUsers(demoUsers);
      console.log('📱 Utilisation des données de démonstration');
      
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'accès au tableau de bord
  const toggleDashboardAccess = async (userId: string, currentAccess: boolean) => {
    setDashboardAccessLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          dashboardAccess: !currentAccess 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Mettre à jour l'état local
        const updateUsersWithAccess = async () => {
          const updated = await Promise.all(users.map(async user => {
            if (user.id === userId) {
              // Si accès donné, récupérer les jours restants
              if (!currentAccess) {
                const infoRes = await fetch(`/api/auth/user-info?userId=${userId}`);
                if (infoRes.ok) {
                  const infoData = await infoRes.json();
                  return {
                    ...user,
                    dashboardAccess: true,
                    dashboardAccessExpiresAt: infoData.user.dashboardAccessExpiresAt,
                    dashboardAccessDaysLeft: infoData.dashboardAccessDaysLeft
                  };
                }
              }
              // Si accès retiré, supprimer les champs
              return {
                ...user,
                dashboardAccess: false,
                dashboardAccessExpiresAt: undefined,
                dashboardAccessDaysLeft: undefined
              };
            }
            return user;
          }));
          setUsers(updated);
        };
        updateUsersWithAccess();
        setFilteredUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, dashboardAccess: !currentAccess }
              : user
          )
        );
        setSuccess(`Accès au tableau de bord ${!currentAccess ? 'donné' : 'révoqué'} avec succès`);
      } else {
        setError(data.error || "Erreur lors de la modification de l'accès");
      }
    } catch {
      setError("Erreur réseau lors de la modification de l'accès");
    } finally {
      setDashboardAccessLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Ajouter des crédits à tous les utilisateurs
  const addCreditsToAllUsers = async () => {
    if (!bulkCreditsAmount || isNaN(parseInt(bulkCreditsAmount))) {
      setError("Veuillez entrer un nombre valide de crédits");
      return;
    }

    showConfirm(`Êtes-vous sûr de vouloir ajouter ${bulkCreditsAmount} crédits à TOUS les utilisateurs ?`, async () => {
    setBulkCreditsLoading(true);
    try {
      const response = await fetch("/api/admin/users/bulk-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          creditsToAdd: parseInt(bulkCreditsAmount)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Mettre à jour l'état local
        const creditsToAdd = parseInt(bulkCreditsAmount);
        setUsers(prev => 
          prev.map(user => ({
            ...user,
            credits: user.credits + creditsToAdd
          }))
        );
        setFilteredUsers(prev => 
          prev.map(user => ({
            ...user,
            credits: user.credits + creditsToAdd
          }))
        );
        setSuccess(`${bulkCreditsAmount} crédits ajoutés à tous les utilisateurs avec succès`);
        setBulkCreditsAmount("");
      } else {
        setError(data.error || "Erreur lors de l'ajout des crédits");
      }
    } catch {
      setError("Erreur réseau lors de l'ajout des crédits");
    } finally {
      setBulkCreditsLoading(false);
    }
    });
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId: string, userPhone: string) => {
    showConfirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userPhone} ?`, async () => {
    try {
      console.log(`Tentative de suppression de l'utilisateur ${userPhone} (ID: ${userId})`);
      
      const response = await fetch("/api/auth/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        console.error('Erreur API:', data.error);
      } else {
        setSuccess(data.message);
        console.log('Utilisateur supprimé avec succès');
        // Recharger la liste
        await loadUsers();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      console.error('Erreur lors de la suppression:', error);
      setError("Erreur lors de la suppression");
    }
    });
  };

  // Supprimer toutes les tâches
  const deleteAllTasks = async () => {
    showConfirm(
      "⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer TOUTES les tâches en cours ? Cette action est irréversible !",
      async () => {
        setDeleteAllTasksLoading(true);
        setError("");
        setSuccess("");
        try {
          const res = await fetch(`/api/admin/delete-all-tasks`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
          });
          const data = await res.json();
          if (data.success) {
            setSuccess(data.message || "Toutes les tâches ont été supprimées avec succès");
          } else {
            setError(data.error || "Erreur lors de la suppression des tâches");
          }
        } catch {
          setError("Erreur réseau ou serveur");
        } finally {
          setDeleteAllTasksLoading(false);
        }
      }
    );
  };

  // Ouvrir le modal d'édition
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewCredits(user.credits.toString());
    setShowEditModal(true);
  };

  // Modifier les crédits
  const updateCredits = async () => {
    if (!selectedUser || !newCredits) return;

    const credits = parseInt(newCredits);
    if (isNaN(credits) || credits < 0) {
      setError("Le nombre de crédits doit être un nombre positif");
      return;
    }

    try {
      setEditLoading(true);
      const response = await fetch("/api/admin/update-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          credits: credits
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Crédits mis à jour pour ${selectedUser.pseudo || selectedUser.phone}`);
        setShowEditModal(false);
        setSelectedUser(null);
        setNewCredits("");
        // Recharger la liste
        await loadUsers();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Erreur lors de la mise à jour des crédits");
    } finally {
      setEditLoading(false);
    }
  };

  // Charger les activités d'un utilisateur
  const loadUserActivities = useCallback(async (user: User) => {
    setActivitiesLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/activities?userId=${user.id}`);
      const data = await res.json();
      setSelectedUserActivities(data.activities || []);
      setSelectedUser(user);
      setShowActivitiesModal(true);
    } catch {
      setError("Erreur lors du chargement des activités");
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // Rafraîchir les activités automatiquement
  const refreshActivities = useCallback(async () => {
    if (selectedUser && showActivitiesModal) {
      await loadUserActivities(selectedUser);
    }
  }, [selectedUser, showActivitiesModal, loadUserActivities]);

  // Extraire le pays et le numéro d'un téléphone complet
  const parsePhone = (fullPhone: string) => {
    // Logique simple pour extraire le pays et le numéro
    // Vous pouvez ajuster selon vos besoins
    const countryMap: { [key: string]: string } = {
      "+33": "France",
      "+225": "Côte d'Ivoire",
      "+237": "Cameroun",
      "+221": "Sénégal",
      "+32": "Belgique",
      "+41": "Suisse",
      "+1": "États-Unis/Canada",
      "+44": "Royaume-Uni",
      "+49": "Allemagne",
      "+34": "Espagne",
      "+216": "Tunisie",
      "+212": "Maroc",
      "+213": "Algérie",
      "+228": "Togo",
      "+229": "Bénin",
      "+226": "Burkina Faso",
      "+241": "Gabon",
      "+240": "Guinée équatoriale",
      "+7": "Russie",
      "+86": "Chine",
      "+91": "Inde",
      "+81": "Japon",
      "+218": "Libye",
      "+20": "Égypte",
      "+27": "Afrique du Sud",
      "+351": "Portugal",
      "+39": "Italie",
      "+352": "Luxembourg",
    };

    for (const [code, country] of Object.entries(countryMap)) {
      if (fullPhone.startsWith(code)) {
        return {
          country: code,
          countryName: country,
          number: fullPhone.substring(code.length)
        };
      }
    }

    return {
      country: "+33",
      countryName: "Inconnu",
      number: fullPhone
    };
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Obtenir l'icône et la couleur selon le type d'activité
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return { icon: '🔐', color: 'text-blue-500' };
      case 'register':
        return { icon: '📝', color: 'text-green-500' };
      case 'credits_earned':
        return { icon: '💰', color: 'text-yellow-500' };
      case 'credits_spent':
        return { icon: '💸', color: 'text-red-500' };
      case 'task_created':
        return { icon: '📋', color: 'text-purple-500' };
      case 'task_completed':
        return { icon: '✅', color: 'text-green-500' };
      default:
        return { icon: '📊', color: 'text-gray-500' };
    }
  };

  // Fonction utilitaire pour calculer les jours restants d'essai (déplacée ici pour portée globale)
  const getFreeTrialDaysLeft = (dateInscription?: string) => {
    if (!dateInscription) return null;
    const date = new Date(dateInscription);
    const now = new Date();
    const diff = Math.ceil(45 - (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  // Rafraîchissement automatique des activités toutes les 10 secondes si le modal est ouvert
  useEffect(() => {
    if (showActivitiesModal && selectedUser) {
      const interval = setInterval(() => {
        refreshActivities();
      }, 10000); // 10 secondes

      return () => clearInterval(interval);
    }
  }, [showActivitiesModal, selectedUser, refreshActivities]);

  // Page d'authentification
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
              <Lock className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Accès administrateur
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Cette page est réservée au développeur
            </p>
          </div>

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe administrateur
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {authError && (
              <div className="text-red-600 text-sm text-center">
                {authError}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
              >
                Accéder à l&apos;administration
              </button>
            </div>

            <div className="text-center">
              <Link href="/" className="text-pink-500 hover:text-pink-600 font-medium">
                Retour à l&apos;accueil
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Page d'administration (après authentification)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Formulaire de changement de mot de passe admin */}
      <div className="max-w-2xl mx-auto mt-8 mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowPwdForm(!showPwdForm)}
          className="mb-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded font-semibold hover:shadow-lg transition-all duration-200"
        >
          {showPwdForm ? "Fermer" : "Changer le mot de passe administrateur"}
        </button>
        {showPwdForm && (
          <form onSubmit={handleChangePwd} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ancien mot de passe</label>
              <div className="relative">
                <input type={showOldPwd ? "text" : "password"} value={oldPwd} onChange={e => setOldPwd(e.target.value)} className="w-full rounded p-2 border" required title="Ancien mot de passe" placeholder="Ancien mot de passe" />
                <button type="button" onClick={() => setShowOldPwd(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">{showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input type={showNewPwd ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full rounded p-2 border" required title="Nouveau mot de passe" placeholder="Nouveau mot de passe" />
                <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">{showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input type={showConfirmPwd ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full rounded p-2 border" required title="Confirmer le nouveau mot de passe" placeholder="Confirmer le nouveau mot de passe" />
                <button type="button" onClick={() => setShowConfirmPwd(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {pwdError && <div className="text-red-600 text-sm">{pwdError}</div>}
            {pwdSuccess && <div className="text-green-600 text-sm">{pwdSuccess}</div>}
            <button type="submit" disabled={pwdLoading} className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 disabled:opacity-60">{pwdLoading ? "Changement..." : "Valider le changement"}</button>
          </form>
        )}
      </div>
      {/* Formulaire d'envoi de notification */}
      <div className="max-w-2xl mx-auto mt-8 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">Envoyer une notification</h2>
        <form onSubmit={handleSendNotif} className="flex flex-col gap-4">
          <textarea
            className="rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm sm:text-base"
            placeholder="Votre message..."
            value={notifMessage}
            onChange={e => setNotifMessage(e.target.value)}
            rows={2}
            required
          />
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label htmlFor="notifTarget" className="font-medium text-gray-700 dark:text-gray-300">Destinataire :</label>
            <select
              id="notifTarget"
              className="rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm sm:text-base"
              value={notifTarget}
              onChange={e => setNotifTarget(e.target.value)}
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.phone} (ID: {u.id})</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 text-sm sm:text-base"
            disabled={notifSending}
          >
            {notifSending ? "Envoi..." : "Envoyer la notification"}
          </button>
          {notifResult && (
            <div className={`text-sm mt-2 ${notifResult.includes('envoyée') ? 'text-green-600' : 'text-red-500'}`}>{notifResult}</div>
          )}
        </form>
      </div>

      {/* Formulaire d'ajout de crédits en masse */}
      <div className="max-w-2xl mx-auto mt-8 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">Ajouter des crédits à tous les utilisateurs</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <label htmlFor="bulkCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de crédits à ajouter :
            </label>
            <input
              id="bulkCredits"
              type="number"
              min="1"
              value={bulkCreditsAmount}
              onChange={e => setBulkCreditsAmount(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm sm:text-base"
              placeholder="Ex: 50"
            />
          </div>
          <button
            onClick={addCreditsToAllUsers}
            disabled={bulkCreditsLoading || !bulkCreditsAmount}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 text-sm sm:text-base"
          >
            {bulkCreditsLoading ? "Ajout..." : "Ajouter à tous"}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Cette action ajoutera le nombre de crédits spécifié à TOUS les utilisateurs.
        </p>
      </div>

      {/* Suppression de toutes les tâches */}
      <div className="max-w-2xl mx-auto mt-8 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">Gestion des tâches</h2>
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">⚠️ Zone dangereuse</h3>
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">
              Cette action supprimera définitivement toutes les tâches en cours et leurs complétions. 
              Cette opération est irréversible !
            </p>
            <button
              onClick={deleteAllTasks}
              disabled={deleteAllTasksLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-60 text-sm"
            >
              {deleteAllTasksLoading ? "Suppression..." : "🗑️ Supprimer toutes les tâches"}
            </button>
          </div>
        </div>
      </div>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 gap-4 md:gap-0 py-2 md:py-0">

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
              <button
                onClick={loadUsers}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              <Link 
                href="/admin/activities" 
                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-green-600 w-full sm:w-auto"
              >
                <span>Activités utilisateurs</span>
              </Link>
                                   <Link
                       href="/admin/tutorials"
                       className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-purple-600 w-full sm:w-auto"
                     >
                       <span>Gestion tutoriels</span>
                     </Link>
                     <Link
                       href="/admin/intelligence"
                       className="flex items-center justify-center space-x-2 bg-indigo-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-indigo-600 w-full sm:w-auto"
                     >
                       <span>IA Intelligente</span>
                     </Link>
                     <Link
                       href="/admin/challenges"
                       className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-orange-600 w-full sm:w-auto"
                     >
                       <span>Gestion Défis</span>
                     </Link>
                     <button
                       onClick={async () => {
                         try {
                           const response = await fetch('/api/admin/create-default-challenges', {
                             method: 'POST'
                           });
                           const data = await response.json();
                           if (response.ok) {
                             alert(data.message);
                           } else {
                             console.error('Erreur API:', data.error);
                             alert('Erreur: ' + data.error);
                           }
                         } catch (error) {
                           console.error('Erreur réseau:', error);
                           alert('Erreur réseau lors de la création automatique');
                         }
                       }}
                       className="flex items-center justify-center space-x-2 bg-yellow-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-yellow-600 w-full sm:w-auto"
                     >
                       <span>Créer Auto Défis</span>
                     </button>
              <button
                onClick={async () => {
                  setShowSuggestionsModal(true);
                  setSuggestionsLoading(true);
                  setSuggestionsError("");
                  try {
                    const res = await fetch("/api/suggestions");
                    const data = await res.json();
                    if (data.suggestions) setSuggestionsList(data.suggestions);
                    else setSuggestionsError(data.error || "Erreur lors du chargement");
                  } catch {
                    setSuggestionsError("Erreur réseau");
                  } finally {
                    setSuggestionsLoading(false);
                  }
                }}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
              >
                <span>Voir les suggestions</span>
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  sessionStorage.removeItem("admin_authenticated");
                }}
                className="bg-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-red-600 w-full sm:w-auto"
              >
                Déconnexion
              </button>
              <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-3 py-2 rounded-full font-medium transition-colors w-full sm:w-auto text-center">
                Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des utilisateurs
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length} utilisateur(s)
              </span>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro de téléphone ou pseudo..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-500" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchPhone ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur trouvé'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm md:text-base">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pays
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Crédits
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date de création
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => {
                    const phoneInfo = parsePhone(user.phone);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.pseudo || "Sans pseudo"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {phoneInfo.number}
                            </div>
                            {/* Affichage du compteur d'accès admin sous le numéro de téléphone */}
                            {user.dashboardAccess && user.dashboardAccessDaysLeft !== null && user.dashboardAccessDaysLeft !== undefined && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <div className={`text-xs font-semibold border rounded px-2 py-1 inline-block ${user.dashboardAccessDaysLeft <= 2 ? 'text-red-600 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700' : 'text-blue-600 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'}`}> 
                                  Accès admin : {user.dashboardAccessDaysLeft} jour{user.dashboardAccessDaysLeft > 1 ? 's' : ''} restant{user.dashboardAccessDaysLeft > 1 ? 's' : ''}
                              </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {phoneInfo.countryName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {phoneInfo.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {user.credits} crédits
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          {/* Affichage du compteur de jours restants d'essai SOUS la date de création */}
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {user.dateInscription && getFreeTrialDaysLeft(user.dateInscription) !== null && (
                              <div className={`text-xs font-semibold border rounded px-2 py-1 inline-block ${getFreeTrialDaysLeft(user.dateInscription)! <= 2 ? 'text-red-600 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700' : 'text-green-600 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700'}`}> 
                                {getFreeTrialDaysLeft(user.dateInscription)} j essai restant{getFreeTrialDaysLeft(user.dateInscription)! > 1 ? 's' : ''} / 45
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => loadUserActivities(user)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Voir les activités"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Modifier les crédits"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id, user.phone)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleDashboardAccess(user.id, user.dashboardAccess || false)}
                              disabled={dashboardAccessLoading[user.id]}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                user.dashboardAccess 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              } ${dashboardAccessLoading[user.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {dashboardAccessLoading[user.id] ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : user.dashboardAccess ? (
                                'Refuser'
                              ) : (
                                'Accepter'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition des crédits */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md relative">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl"
            >
              ×
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Modifier les crédits
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Utilisateur</label>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedUser.pseudo || selectedUser.phone}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Crédits actuels</label>
                <p className="text-2xl font-bold text-yellow-600">
                  {selectedUser.credits} crédits
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nouveaux crédits</label>
                <input
                  type="number"
                  min="0"
                  value={newCredits}
                  onChange={(e) => setNewCredits(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                  placeholder="Entrez le nouveau nombre de crédits"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setNewCredits((parseInt(newCredits) + 10).toString())}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  +10
                </button>
                <button
                  onClick={() => setNewCredits((parseInt(newCredits) + 50).toString())}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  +50
                </button>
                <button
                  onClick={() => setNewCredits((parseInt(newCredits) + 100).toString())}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  +100
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setNewCredits((parseInt(newCredits) - 10).toString())}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  -10
                </button>
                <button
                  onClick={() => setNewCredits((parseInt(newCredits) - 50).toString())}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  -50
                </button>
                <button
                  onClick={() => setNewCredits((parseInt(newCredits) - 100).toString())}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  -100
                </button>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={updateCredits}
                  disabled={editLoading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {editLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des activités utilisateur */}
      {showActivitiesModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-4xl max-h-[80vh] relative overflow-hidden">
            <button 
              onClick={() => setShowActivitiesModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl z-10"
            >
              ×
            </button>
            
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="w-6 h-6 text-pink-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Activités de {selectedUser.pseudo || selectedUser.phone}
              </h3>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-500" />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des activités...</p>
                </div>
              ) : selectedUserActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Aucune activité trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedUserActivities.map((activity) => {
                    const activityInfo = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`text-2xl ${activityInfo.color}`}>
                              {activityInfo.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {activity.description}
                              </p>
                              {activity.credits && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {activity.credits} crédit(s)
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(activity.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowActivitiesModal(false)}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suggestions Admin */}
      {showSuggestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-2xl relative">
            <button onClick={() => setShowSuggestionsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl">×</button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">Suggestions des utilisateurs</h3>
            {suggestionsLoading ? (
              <div className="text-center text-gray-600">Chargement...</div>
            ) : suggestionsError ? (
              <div className="text-center text-red-600">{suggestionsError}</div>
            ) : suggestionsList.length === 0 ? (
              <div className="text-center text-gray-500">Aucune suggestion pour le moment.</div>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {(suggestionsList as Suggestion[]).map((s, i) => (
                  s && (
                  <div key={s.id || i} className="py-3 px-2">
                    <div className="font-semibold text-gray-900 dark:text-white">{s.nom} <span className="text-xs text-gray-400">({s.numeroOuId})</span></div>
                    <div className="text-gray-700 dark:text-gray-200 mb-1">{s.suggestion}</div>
                    <div className="text-xs text-gray-500">{new Date(s.date).toLocaleString('fr-FR')}</div>
                  </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 