"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Users, 
  Eye, 
  EyeOff, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Coins, 
  Settings, 
  Plus,
  BarChart3,
  Target,
  Zap,
  LogOut,
  RefreshCw,
  Brain,
  Megaphone,
  Construction,
  CheckCircle,
  Bell,
  Trophy,
  Calendar,
  Clock,
} from "lucide-react";
import AIDashboardWidget from "../components/AIDashboardWidget";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "../utils/auth";
import Script from "next/script";
import { useTheme } from "../hooks/useTheme";
import { useAlert } from "../components/CustomAlert";
import ChallengeSystem from "../components/ChallengeSystem";
import ContentRecommendations from "../components/ContentRecommendations";
import ContentScheduler from "../components/ContentScheduler";
import UserStats from "../components/UserStats";
import TikTokAnalytics from "../components/TikTokAnalytics";
import TikTokSparkAdsManager from "../components/TikTokSparkAdsManager";
import TikTokLatencyInfo from "../components/TikTokLatencyInfo";
import TikTokWebhookManager from "../components/TikTokWebhookManager";
import TikTokAuthTester from "../components/TikTokAuthTester";
import TikTokApiTester from "../components/TikTokApiTester";

import BadgeSystem from "../components/BadgeSystem";
import AdvancedStats from "../components/AdvancedStats";

// Type global pour les tâches d'échange
type ExchangeTask = {
  id: string;
  type: string;
  url: string;
  credits: number;
  actionsRestantes: number;
  createur: string;
  completions?: { id: string; userId: string }[];
  createurCredits?: number;
  createurPseudo?: string;
};


// Ajout du type Notification pour les notifications utilisateur

type Notification = {
  id: string;
  message: string;
  date: string;
  lu: boolean;
};

type User = {
  id: string;
  phone: string;
  credits: number;
  dateDernierPaiement?: string;
  dateInscription?: string; // Ajouté pour la période d'essai
};

export default function Dashboard() {
  const { isDark } = useTheme();
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState("exchange");
  const [credits, setCredits] = useState(150);
  const [tasks, setTasks] = useState<ExchangeTask[]>([]);
  const router = useRouter();
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [user] = useState<User|null>(() => getCurrentUser() as User | null);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [hasDashboardAccess, setHasDashboardAccess] = useState(false);
  const [dashboardAccessDaysLeft, setDashboardAccessDaysLeft] = useState<number|null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [parrainCode, setParrainCode] = useState("");
  const [copied, setCopied] = useState(false);
  // Suggestions (toujours en haut !)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionNom, setSuggestionNom] = useState("");
  const [suggestionNumero, setSuggestionNumero] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState("");
  const [suggestionError, setSuggestionError] = useState("");
  
  // États pour la modification du numéro de téléphone
  const [newPhone, setNewPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneResult, setPhoneResult] = useState("");
  
  // Compteur de jours d'essai accessible partout dans le composant
  const [freeTrialDaysLeft, setFreeTrialDaysLeft] = useState<number|null>(null);
  useEffect(() => {
    if (user && user.dateInscription) {
      const dateInscription = new Date(user.dateInscription);
      const now = new Date();
      const diffJours = Math.ceil(45 - (now.getTime() - dateInscription.getTime()) / (1000 * 60 * 60 * 24));
      setFreeTrialDaysLeft(diffJours > 0 ? diffJours : 0);
    } else {
      setFreeTrialDaysLeft(null);
    }
  }, [user]);

  // Appliquer le thème au chargement
  useEffect(() => {
    // Appliquer les variables CSS du thème
    document.documentElement.style.setProperty('--background', isDark ? '#0a0a0a' : '#ffffff');
    document.documentElement.style.setProperty('--foreground', isDark ? '#ededed' : '#171717');
    document.documentElement.style.setProperty('--card', isDark ? '#1a1a1a' : '#ffffff');
    document.documentElement.style.setProperty('--border', isDark ? '#404040' : '#e5e7eb');
    document.documentElement.style.setProperty('--input', isDark ? '#262626' : '#ffffff');
  }, [isDark]);

  // Notifications utilisateur
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [notifUnread, setNotifUnread] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Paramètres utilisateur
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pwdOld, setPwdOld] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdResult, setPwdResult] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // ... existing code ...
  const [showPwdOld, setShowPwdOld] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);

  interface Message {
    id: string;
    from: string;
    to: string;
    message: string;
    date: string;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<string[]>([]);
  const [selectedConv, setSelectedConv] = useState<string|null>(null);
  const [chatClosed, setChatClosed] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<{[key: string]: number}>({});
  // Supprimé - plus de gestion du statut de connexion
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Fonction pour créer des données de démonstration
  const getDemoTasks = () => [
    {
      id: 'demo-1',
      type: 'LIKE',
      url: 'https://www.tiktok.com/@demo/video/123456789',
      credits: 1,
      actionsRestantes: 5,
      createur: 'Demo User',
      createurCredits: 150,
      createurPseudo: 'Demo User',
      completions: []
    },
    {
      id: 'demo-2',
      type: 'FOLLOW',
      url: 'https://www.tiktok.com/@demo2/video/987654321',
      credits: 1,
      actionsRestantes: 3,
      createur: 'Demo User 2',
      createurCredits: 200,
      createurPseudo: 'Demo User 2',
      completions: []
    }
  ];
  
  // Ajouter une fonction de normalisation des numéros de téléphone (même logique que dans l'API)
  const normalizePhone = (phone: string): string => {
    // Enlever tous les espaces et caractères spéciaux
    let normalized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Si le numéro commence par 237, ajouter le +
    if (normalized.startsWith('237') && !normalized.startsWith('+237')) {
      normalized = '+' + normalized;
    }
    
    // Si le numéro commence par 6, 7, 8, 9 (numéro camerounais) sans indicatif, ajouter +237
    if (/^[6789]/.test(normalized) && !normalized.startsWith('+') && !normalized.startsWith('237')) {
      normalized = '+237' + normalized;
    }
    
    return normalized;
  };

  // Fonction pour mettre à jour les messages non lus
  const updateUnreadMessages = useCallback((data: Message[]) => {
    setUnreadMessages(prev => {
      const unread = {...prev};
      
      data.forEach((message: Message) => {
        const to = typeof message.to === 'string' ? message.to : '';
        const from = typeof message.from === 'string' ? message.from : '';
        const userPhone = typeof user?.phone === 'string' ? user.phone : '';
        if (
          normalizePhone(to) === normalizePhone(userPhone) &&
          normalizePhone(from) !== normalizePhone(userPhone)
        ) {
          const sender = normalizePhone(from);
          if (selectedConv !== sender) {
            unread[sender] = (unread[sender] || 0) + 1;
          }
        }
      });
      
      // Mettre à jour le compteur de notifications
      const totalUnread = Object.values(unread).reduce((sum, count) => sum + count, 0);
      setNotifUnread(totalUnread);
      
      return unread;
    });
  }, [user, selectedConv]);

  // Fonction pour mettre à jour la liste des conversations
  const updateConversations = useCallback((data: Message[]) => {
    if (!user) return;
    
    const convs = Array.from(
      new Set(
        data
          .map((m: Message) => normalizePhone(m.from) === normalizePhone(user.phone) ? m.to : m.from)
          .filter(conv => conv && normalizePhone(conv) !== normalizePhone(user.phone))
          .map(conv => normalizePhone(conv)) // Normaliser les conversations
      )
    );
    setConversations(convs);
  }, [user]);
  
     // Charger les messages de l'utilisateur connecté
  const fetchMessages = useCallback(async () => {
    if (!user || !user.phone) return;
    
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?user=${encodeURIComponent(user.phone)}`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
        
        // Générer la liste des conversations uniques (pseudo ou numéro)
        const convs = Array.from(
          new Set(
            data
              .map((m: Message) => normalizePhone(m.from) === normalizePhone(user.phone) ? m.to : m.from)
              .filter(conv => conv && normalizePhone(conv) !== normalizePhone(user.phone))
              .map(conv => normalizePhone(conv)) // Normaliser les conversations
          )
        );
        setConversations(convs);
        
        // Calculer les messages non lus pour chaque conversation
        const unread: {[key: string]: number} = {};
        
        // Trouver le dernier message reçu pour sélectionner automatiquement cette conversation
        let lastReceivedMessage: Message | null = null;
        
        data.forEach((message: Message) => {
          // Si le message est destiné à l'utilisateur et n'est pas de l'utilisateur lui-même
          const to = typeof message.to === 'string' ? message.to : '';
          const from = typeof message.from === 'string' ? message.from : '';
          const userPhone = typeof user?.phone === 'string' ? user.phone : '';
          if (
            normalizePhone(to) === normalizePhone(userPhone) &&
            normalizePhone(from) !== normalizePhone(userPhone)
          ) {
            const sender = normalizePhone(from);
            // Si la conversation n'est pas actuellement sélectionnée, compter comme non lu
            if (selectedConv !== sender) {
              unread[sender] = (unread[sender] || 0) + 1;
            }
            
            // Vérifier si c'est le message le plus récent
            if (!lastReceivedMessage || new Date(message.date) > new Date(lastReceivedMessage.date)) {
              lastReceivedMessage = message;
            }
          }
        });
        setUnreadMessages(unread);
        
        // Si aucune conversation n'est sélectionnée, sélectionner celle avec le dernier message reçu
        // ou la première conversation disponible
        if (!selectedConv && convs.length > 0) {
          if (lastReceivedMessage && (lastReceivedMessage as Message).from && typeof (lastReceivedMessage as Message).from === 'string') {
            const sender = normalizePhone((lastReceivedMessage as Message).from);
            setSelectedConv(sender);
            setChatClosed(false); // Ouvrir automatiquement la conversation
            
            // Réinitialiser le compteur de messages non lus pour cette conversation
            setUnreadMessages(prev => {
              const updated = {...prev};
              delete updated[sender];
              return updated;
            });
          } else {
            setSelectedConv(convs[0]);
          }
        }
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setLoadingMessages(false);
    }
  }, [user, selectedConv]);

  useEffect(() => {
    if (activeTab === "messages" && user) fetchMessages();
  }, [activeTab, user, fetchMessages]);

  // Actualisation seulement quand l'utilisateur change d'onglet ou de conversation
  useEffect(() => {
    if (activeTab === "messages" && user) {
      fetchMessages();
    }
  }, [activeTab, user, selectedConv, fetchMessages]);

  // Server-Sent Events pour les messages en temps réel
  useEffect(() => {
    if (user) { // Retirer la condition activeTab pour que le SSE reste actif
      let eventSource: EventSource | null = null;
      let reconnectTimeout: NodeJS.Timeout | null = null;
      let lastMessageCount = 0;
      
      const connectSSE = () => {
        if (eventSource) {
          eventSource.close();
        }
        
        eventSource = new EventSource(`/api/messages/stream?user=${encodeURIComponent(user.phone)}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data: Message[] = JSON.parse(event.data);
            
            // Éviter les mises à jour inutiles si le nombre de messages n'a pas changé
            if (data.length !== lastMessageCount) {
          setMessages(data);
              lastMessageCount = data.length;
              updateUnreadMessages(data);
              
              // Mettre à jour la liste des conversations
              updateConversations(data);
                }
        } catch (error) {
            console.error('Erreur parsing SSE:', error);
        }
      };
      
      eventSource.onerror = () => {
          console.log('SSE déconnecté, reconnexion dans 1 seconde...');
          if (eventSource) {
        eventSource.close();
            eventSource = null;
          }
          
          // Reconnexion automatique après 1 seconde
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
          }
          reconnectTimeout = setTimeout(connectSSE, 1000);
        };
        
        eventSource.onopen = () => {
          console.log('SSE connecté');
        };
      };
      
      
      
      // Démarrer SSE seulement
      connectSSE();
      
      return () => {
        if (eventSource) {
        eventSource.close();
        }
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
      };
    }
  }, [user, selectedConv, updateUnreadMessages, updateConversations]);

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (activeTab === "messages" && messages.length > 0) {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages, activeTab]);

  const handleInvite = () => {
    // setParrainCode("");
  };

  // Fonction centralisée pour rafraîchir la liste enrichie
  const fetchTasks = useCallback(async () => {
    try {
      console.log('🔄 Chargement des tâches...');
      
      // Vérifier si l'utilisateur est connecté
      const currentUser = getCurrentUser() as User | null;
      if (!currentUser) {
        console.log('⚠️ Utilisateur non connecté, arrêt du chargement');
        setTasks([]);
        return;
      }
      
      // Appel API réel avec gestion d'erreur robuste
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const res = await fetch("/api/exchange/tasks", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      
      if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status} ${res.statusText}`);
      }
      
    const data = await res.json();
      
    if (Array.isArray(data)) {
          console.log(`✅ ${data.length} tâches récupérées`);
          
          // Enrichissement simplifié des tâches
          const enrichedTasks = data.map(t => ({
            ...t,
            createurCredits: 0,
            createurPseudo: t.createur
          }));
          
          setTasks(enrichedTasks);
          console.log('✅ Tâches mises à jour');
    } else {
          throw new Error('Format de données invalide - attendu un tableau');
      }
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des tâches:', error);
      setTasks([]);
    }
  }, []); // Pas de dépendances car on utilise getCurrentUser()

  // Fonction unifiée pour rafraîchir les crédits
  const refreshCredits = useCallback(async () => {
    const currentUser = getCurrentUser() as User | null;
    if (!currentUser) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`/api/auth/user-info?userId=${currentUser.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
        
      const data = await response.json();
        
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCredits(data.user.credits);
          console.log('✅ Crédits mis à jour:', data.user.credits);
      } else {
          throw new Error('Données utilisateur manquantes dans la réponse');
      }
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des crédits:', error);
      // Garder les crédits actuels en cas d'erreur
    }
  }, []); // Pas de dépendances car on utilise getCurrentUser()

  // Charger les notifications
  const fetchNotifications = useCallback(async () => {
    const currentUser = getCurrentUser() as User | null;
    if (!currentUser) return;
    
    setNotifLoading(true);
    setNotifError("");
    try {
      const res = await fetch(`/api/admin/notifications?userId=${currentUser.id}`, {
        signal: AbortSignal.timeout(5000) // 5 secondes
      });
      
      if (!res.ok) {
        console.warn('⚠️ Réponse API notifications non OK, utilisation de données vides');
        setNotifications([]);
        setNotifUnread(0);
        return;
      }
      
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.warn('⚠️ Erreur parsing JSON notifications, utilisation de données vides');
        setNotifications([]);
        setNotifUnread(0);
        return;
      }
      
      if (Array.isArray(data)) {
        setNotifications(data);
        setNotifUnread(data.filter((n: Notification) => !n.lu).length);
      } else {
        setNotifications([]);
        setNotifUnread(0);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des notifications:', error);
      setNotifError("Erreur lors du chargement des notifications");
      setNotifications([]);
      setNotifUnread(0);
    } finally {
      setNotifLoading(false);
    }
  }, []); // Pas de dépendances car on utilise getCurrentUser()

  // useEffect de refreshCredits et fetchTasks au démarrage - UNE SEULE FOIS
  useEffect(() => {
    if (user && user.phone === "+237699486146") return;
    
    // Charger les données une seule fois au démarrage avec un délai
    const loadInitialData = async () => {
      try {
        setIsInitializing(true);
        // Attendre un peu que le serveur soit prêt
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await refreshCredits();
        await fetchTasks();
        await fetchNotifications(); // Charger les notifications aussi
      } catch (error) {
        console.warn('Erreur lors du chargement initial:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadInitialData();
  }, [user?.id, refreshCredits, fetchTasks, fetchNotifications]); // Ajouter les dépendances des fonctions
  
  // useEffect de polling automatique - DÉSACTIVÉ TEMPORAIREMENT
  // useEffect(() => {
  //   if (user && user.phone === "+237699486146") return;
  //   const interval = setInterval(() => {
  //     refreshCredits();
  //     fetchTasks();
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, [user?.id]); // Utiliser user.id au lieu de user complet

  // Vérifier l'accès au tableau de bord (paiement OU accès admin) - seulement au chargement initial
  useEffect(() => {
    const checkDashboardAccess = async () => {
      if (!user) {
        setAccessCheckLoading(false);
        setHasDashboardAccess(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/auth/user-info?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          // Nouvelle logique : priorité à la décision admin
          const hasAdminAccess = userData && typeof userData.dashboardAccess === 'boolean';
          const adminAccessValue = userData && userData.dashboardAccess === true;

          // Vérification paiement (30 jours)
          let hasPaid = false;
          if (userData && userData.dateDernierPaiement) {
            const dateDernierPaiement = new Date(userData.dateDernierPaiement);
            const now = new Date();
            const diffJoursPaiement = (now.getTime() - dateDernierPaiement.getTime()) / (1000 * 60 * 60 * 24);
            hasPaid = diffJoursPaiement < 30;
          }
          // Vérification période d'essai (45 jours après inscription)
          let hasFreeTrial = false;
          if (userData && userData.dateInscription) {
            const dateInscription = new Date(userData.dateInscription);
            const now = new Date();
            const diffJoursInscription = (now.getTime() - dateInscription.getTime()) / (1000 * 60 * 60 * 24);
            hasFreeTrial = diffJoursInscription < 45;
          }

          if (hasAdminAccess) {
            setHasDashboardAccess(adminAccessValue);
            if (adminAccessValue) {
              localStorage.setItem("dashboardAccessGranted", "true");
              setDashboardAccessDaysLeft(data.dashboardAccessDaysLeft ?? null);
            } else {
              localStorage.removeItem("dashboardAccessGranted");
              setDashboardAccessDaysLeft(null);
            }
          } else if (hasPaid || hasFreeTrial) {
            setHasDashboardAccess(true);
            localStorage.setItem("dashboardAccessGranted", "true");
            setDashboardAccessDaysLeft(null);
          } else {
            setHasDashboardAccess(false);
            localStorage.removeItem("dashboardAccessGranted");
            setDashboardAccessDaysLeft(null);
          }
        } else {
          setHasDashboardAccess(false);
          localStorage.removeItem("dashboardAccessGranted");
          setDashboardAccessDaysLeft(null);
        }
      } catch {
        setHasDashboardAccess(false);
        localStorage.removeItem("dashboardAccessGranted");
        setDashboardAccessDaysLeft(null);
      } finally {
        setAccessCheckLoading(false);
      }
    };

    checkDashboardAccess();
  }, [user?.id]); // Seulement quand l'utilisateur change

  // Rediriger vers la page de paiement si pas d'accès
  useEffect(() => {
    if (!accessCheckLoading && !hasDashboardAccess && user) {
      router.push('/thank-you');
    }
  }, [accessCheckLoading, hasDashboardAccess, user, router]);

  // useEffect de polling notifications - DÉSACTIVÉ TEMPORAIREMENT
  // useEffect(() => {
  //   if (user && user.phone === "+237699486146") return;
  //   fetchNotifications();
  //   const interval = setInterval(fetchNotifications, 30000);
  //   return () => clearInterval(interval);
  // }, [user, fetchNotifications]);

  // Marquer une notification comme lue au clic
  const markNotifAsRead = async (notifId: string) => {
    if (!user) return;
    try {
      const response = await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifId, userId: user.id })
    });
      if (!response.ok) {
        console.error('Erreur API lors du marquage comme lu:', response.status);
      }
    } catch {
      console.error('Erreur lors du marquage comme lu:', Error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.lu) {
      // Marquer comme lu immédiatement dans l'état local
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, lu: true } : n)
      );
      setNotifUnread(prev => Math.max(0, prev - 1));
      // Appeler l'API en arrière-plan
      markNotifAsRead(notification.id);
    }
  };

  const closeDetail = () => {
    setSelectedNotification(null);
  };



  // Changement de mot de passe
  const handlePwdChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdOld.trim() || !pwdNew.trim()) {
      setPwdResult("Tous les champs sont obligatoires");
      return;
    }
    
    setPwdLoading(true);
    setPwdResult("");
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          oldPassword: pwdOld,
          newPassword: pwdNew
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPwdResult("Mot de passe changé avec succès !");
        setPwdOld("");
        setPwdNew("");
      } else {
        setPwdResult(data.error || "Erreur lors du changement de mot de passe");
      }
    } catch (error) {
      setPwdResult("Erreur de connexion");
    } finally {
      setPwdLoading(false);
    }
  };

  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    
    setPhoneLoading(true);
    setPhoneResult("");
    
    try {
      console.log('Tentative de changement de numéro:', { userId: user?.id, oldPhone: user?.phone, newPhone: newPhone.trim() });
      
      const response = await fetch('/api/auth/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          oldPhone: user?.phone,
          newPhone: newPhone.trim()
        })
      });
      
      console.log('Réponse API:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données reçues:', data);
      
      if (data.success) {
        setPhoneResult("Numéro de téléphone changé avec succès !");
        setNewPhone("");
        // Mettre à jour l'utilisateur local
        if (user) {
          const updatedUser = { ...user, phone: newPhone.trim() };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          window.location.reload(); // Recharger pour mettre à jour l'interface
        }
      } else {
        setPhoneResult(data.error || "Erreur lors du changement de numéro");
      }
    } catch (error) {
      console.error('Erreur changement téléphone:', error);
      setPhoneResult("Erreur de connexion au serveur");
    } finally {
      setPhoneLoading(false);
    }
  };

  // Stats dynamiques réalistes, changent chaque 24h (stockées dans localStorage)
  const [stats, setStats] = useState({
    followers: 0,
    views: 0,
    likes: 0,
    comments: 0,
    growth: 0
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem('dashboardStats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setStats(parsed.stats);
        return;
      }
    }
    // Génération réaliste (croissance, variations)
    const base = {
      followers: 12000,
      views: 850000,
      likes: 42000,
      comments: 2000,
    };
    // Utiliser la date comme seed pour avoir la même valeur toute la journée
    function seededRand(seed: number, min: number, max: number) {
      const x = Math.sin(seed) * 10000;
      return Math.floor(min + (Math.abs(x) % 1) * (max - min + 1));
    }
    const seed = Number(today.replace(/-/g, ''));
    const newStats = {
      followers: base.followers + seededRand(seed, 100, 600),
      views: base.views + seededRand(seed + 1, 5000, 20000),
      likes: base.likes + seededRand(seed + 2, 1000, 4000),
      comments: base.comments + seededRand(seed + 3, 50, 200),
      growth: parseFloat((5 + (seededRand(seed + 4, 0, 100) / 10)).toFixed(1)),
    };
    setStats(newStats);
    localStorage.setItem('dashboardStats', JSON.stringify({ date: today, stats: newStats }));
  }, []);

  // const handleTaskComplete = (taskId: number) => {
  //   const task = exchangeTasks.find(t => t.id === taskId);
  //   setCredits(prev => prev + (task ? task.reward : 0));
  // };



  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.cinetpay.com/seamless/main.js";
      script.async = true;
      document.body.appendChild(script);
      const interval = setInterval(() => {
        if (window.CinetPay) {
          window.CinetPay.setConfig({
            apikey: "200290337868757be2603959.83572739", // <--- Mets ta clé API ici
            site_id: "105902113", // <--- Mets ton site_id ici
            notify_url: "https://mondomaine.com/api/payment/cinetpay/notify", // <--- Mets ton notify_url ici
            close_after_response: true,
            mode: "PRODUCTION"
          });
          clearInterval(interval);
        }
      }, 100);
      return () => {
        clearInterval(interval);
        document.body.removeChild(script);
      };
    }
  }, []);

  
    

  // Vérification d'accès au tableau de bord
  if (accessCheckLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Veuillez patienter svp...</p>
        </div>
      </div>
    );
  }

  if (!hasDashboardAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Redirection vers la page de paiement...</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }

  const logoutAndClearAccess = () => {
    localStorage.removeItem("dashboardAccessGranted");
    logout();
  };

 

  // Envoyer un message
  const sendMessage = async () => {
    if (!user || !selectedConv || !chatInput.trim()) return;
    
    const messageText = chatInput.trim();
    setChatInput("");

    // Normaliser le numéro du destinataire
    const toNormalized = normalizePhone(selectedConv);

    // Créer le nouveau message localement pour l'affichage immédiat
    const newMessage: Message = {
      id: Date.now().toString(),
      from: user.phone,
      to: toNormalized,
      message: messageText,
      date: new Date().toISOString()
    };
    
    // Ajouter le message à l'état local immédiatement
    setMessages(prev => [...prev, newMessage]);
    
    // Scroll automatique vers le bas
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
    
    // Envoyer le message au serveur en arrière-plan (non-bloquant)
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: user.phone, to: toNormalized, message: messageText })
    }).catch(() => {
      // Erreur silencieuse - le message reste affiché localement
    });
  };

  // Recherche d'utilisateur pour démarrer une nouvelle conversation
  const handleSearchUser = () => {
    if (!searchUser.trim()) return;
    setSelectedConv(searchUser.trim());
    setSearchUser("");
  };

  // Ajout des hooks d'invitation ici (et suppression de toute déclaration plus bas)
 

  return (
    <>
      <style jsx global>{`
        .blinking {
          animation: blinker 1s linear infinite;
        }
        @keyframes blinker {
          50% { opacity: 0.2; }
        }
        
        /* Styles pour le thème sombre dans le dashboard */
        .dashboard-container {
          background-color: var(--background);
          color: var(--foreground);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .dashboard-card {
          background-color: var(--card);
          border-color: var(--border);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        .dashboard-input {
          background-color: var(--input);
          border-color: var(--border);
          color: var(--foreground);
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
      `}</style>
    <div className="min-h-screen dashboard-container">
      {/* Header */}
      <header className="border-b w-full overflow-x-hidden py-2 sm:py-0 dashboard-card">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full overflow-x-auto">
          <div className="flex flex-wrap justify-between items-center h-auto min-h-[44px] gap-1 sm:gap-0">
            <div className="flex items-center min-w-0 gap-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                BE STRONG
              </h1>
              {/* Supprimé - plus d'indicateur de statut de connexion */}
            </div>
            <div className="flex items-center flex-nowrap gap-2 sm:gap-4 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent">
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 relative"
                  title="Messages & Notifications"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setSelectedNotification(null);
                  }}
                >
                  <MessageCircle className="w-6 h-6" />
                  {notifUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
                      {notifUnread}
                    </span>
                  )}
                </button>
                {/* Liste notifications */}
                {notifOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay sombre */}
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-50"
                      onClick={() => setNotifOpen(false)}
                    />
                    
                    {/* Popup */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-96 max-h-[80vh] overflow-hidden">
                      {/* En-tête */}
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">💬 Messages & Notifications</span>
                          <button 
                            onClick={() => setNotifOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      {/* Contenu */}
                      <div className="max-h-96 overflow-y-auto">
                    {notifLoading ? (
                          <div className="p-6 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                            Chargement...
                          </div>
                    ) : notifError ? (
                          <div className="p-6 text-center text-red-500">
                            ❌ {notifError}
                          </div>
                    ) : notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            📭 Aucune notification
                          </div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((n) => (
                              <li 
                                key={n.id} 
                                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!n.lu ? 'bg-pink-50 dark:bg-pink-900/20 border-l-4 border-pink-500' : 'border-l-4 border-transparent'}`}
                                onClick={() => handleNotificationClick(n)}
                          >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm text-gray-900 dark:text-white ${!n.lu ? 'font-bold' : ''} leading-relaxed whitespace-normal break-words`}>
                                      {n.message.length > 100 ? `${n.message.substring(0, 100)}...` : n.message}
                              </div>
                            </div>
                                  <div className="flex flex-col items-end ml-2">
                                    <span className="text-xs text-gray-400 mb-1">{new Date(n.date).toLocaleString()}</span>
                                    {!n.lu && (
                                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                    )}
                              </div>
                                </div>
                          </li>
                        ))}
                      </ul>
                    )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal pour afficher le détail de la notification */}
              {selectedNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notification
                      </h3>
                      <button 
                        onClick={closeDetail}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap break-words mb-4">
                      {selectedNotification.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {new Date(selectedNotification.date).toLocaleString()}
                    </div>
                    <button 
                      onClick={closeDetail}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
              
              {/* Fin notifications */}
              <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full min-w-0">
                <Coins className="w-4 h-4" />
                <span className="font-semibold text-xs truncate max-w-[48px]">{credits}</span>
                <button 
                  onClick={refreshCredits}
                  className="ml-1 p-0.5 hover:bg-yellow-600 rounded-full transition-colors"
                  title="Actualiser les crédits"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <Link href="/" className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-3 py-1 rounded-full font-medium transition-colors" title="Retour à l'accueil">Accueil</Link>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Paramètres"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={logoutAndClearAccess}
                className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Supprimé - plus de message d'alerte de connexion */}

      {/* Supprimé - plus d'indicateur de chargement initial */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-dashboard>
        {/* Navigation */}
        <nav className="flex space-x-2 sm:space-x-8 mb-4 sm:mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent -mx-2 sm:mx-0 px-2 sm:px-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "overview"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Vue d&apos;ensemble
          </button>
          <button
            onClick={() => setActiveTab("exchange")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "exchange"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Échanges
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "ai"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            <Brain className="w-4 h-4 mr-1" />
            IA
          </button>

          <button
            onClick={() => setActiveTab("boost")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "boost"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Boosting
          </button>
          <button
            onClick={() => setActiveTab("advertising")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "advertising"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Publicités
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 relative ${
              activeTab === "messages"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Messages
            {Object.values(unreadMessages).reduce((total, count) => total + count, 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
                {Object.values(unreadMessages).reduce((total, count) => total + count, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("creation")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "creation"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            <Target className="w-4 h-4 mr-1" />
            Création
          </button>

          <button
            onClick={() => setActiveTab("tiktok")}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-w-[120px] sm:min-w-0 ${
              activeTab === "tiktok"
                ? "bg-pink-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            TikTok IA
          </button>
        </nav>

        {activeTab === "overview" && (
          <div data-tab="overview" className="space-y-8">


            {/* Statistiques utilisateur */}
            <UserStats userId={user?.id} className="mb-6" />



            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab('exchange')} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                    <span>Consulter mes tâches en cours</span>
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setInviteModalOpen(true)} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-pink-400 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                    <span>Inviter un ami et gagnez 1000 crédits</span>
                    <Plus className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setActiveTab('messages')} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                    <span>Messagerie Instantanée</span>
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setNotifOpen(true)} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-400 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                    <span>Voir les notifications</span>
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-600 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                    <span>Modifier mon profil</span>
                    <Settings className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      refreshCredits();
                      fetchTasks();
                      showAlert('Données rafraîchies !', 'success');
                    }} 
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <span>Rafraîchir les données</span>
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button onClick={logoutAndClearAccess} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                    <span>Déconnexion rapide</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                    <button onClick={() => setShowSuggestionModal(true)} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      <span>Suggestions</span>
                      <Zap className="w-5 h-5" />
                    </button>
                    <button onClick={() => setActiveTab('ai')} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      <span>Assistant IA</span>
                      <Brain className="w-5 h-5" />
                    </button>
                    <a href="https://whatsapp.com/channel/0029Vb69KpVLo4hhz4Qnkm1m" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      <span>Rejoindre la communauté</span>
                      <Users className="w-5 h-5" />
                    </a>
                    <button onClick={() => setActiveTab('badges')} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      <span>Badges & Récompenses</span>
                      <Trophy className="w-5 h-5" />
                    </button>
                    <button onClick={() => setActiveTab('stats')} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      <span>Statistiques Avancées</span>
                      <BarChart3 className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <DynamicTikTokAIRecommendations />
            </div>
          </div>
        )}

        {/* Section Échange */}
        {activeTab === "exchange" && (
          <div data-tab="exchange" className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tâches d&apos;échange</h2>
            </div>
            
            {/* Formulaire de création de tâche */}
            <ExchangeTaskForm 
              showAlert={showAlert}
              onTaskCreated={() => {
                fetchTasks();
                refreshCredits(); // Rafraîchir les crédits après création
              }} 
            />
            {/* Liste des tâches */}
            <ExchangeTaskList
              tasks={tasks}
              onRefresh={fetchTasks}
              showOnlyMine={showOnlyMine}
              onNewTask={() => setShowOnlyMine(false)}
              showAlert={showAlert}
              showConfirm={showConfirm}
            />
          </div>
        )}



        {activeTab === "boost" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services de boosting</h2>
            
            {/* Notification de développement en cours */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">🚧 Service en cours de développement</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Les services de boosting payant ne sont pas encore opérationnels. 
                Notre équipe travaille actuellement sur cette fonctionnalité pour vous offrir 
                des services de qualité. En attendant, vous pouvez utiliser le système d&apos;échanges 
                organiques qui est entièrement fonctionnel !
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm">
                <Zap className="w-4 h-4" />
                <span>Bientôt disponible - Restez connectés !</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Followers</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Augmentez votre nombre d&apos;abonnés</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>100 followers</span>
                    <span className="font-semibold">€9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>500 followers</span>
                    <span className="font-semibold">€39.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1000 followers</span>
                    <span className="font-semibold">€69.99</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                  Commander
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vues</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Boostez vos vues vidéo</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>1000 vues</span>
                    <span className="font-semibold">€4.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5000 vues</span>
                    <span className="font-semibold">€19.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10000 vues</span>
                    <span className="font-semibold">€34.99</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                  Commander
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Likes</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Augmentez vos likes</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>100 likes</span>
                    <span className="font-semibold">€2.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>500 likes</span>
                    <span className="font-semibold">€9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1000 likes</span>
                    <span className="font-semibold">€16.99</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                  Commander
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "advertising" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Espace Publicités</h2>
            
            {/* Message principal pour les promoteurs */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Megaphone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">🎯 Espace Promoteurs</h3>
                  <p className="text-emerald-100 text-lg">Votre plateforme de publicité TikTok</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Publicité Ciblée
                  </h4>
                  <p className="text-emerald-100 leading-relaxed">
                    Diffusez vos publicités auprès d'une audience TikTok qualifiée et ciblée. 
                    Atteignez des milliers d'utilisateurs actifs qui correspondent à votre marché.
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Résultats Mesurables
                  </h4>
                  <p className="text-emerald-100 leading-relaxed">
                    Suivez en temps réel les performances de vos campagnes publicitaires. 
                    Analysez les clics, conversions et ROI pour optimiser vos investissements.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification de développement */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Construction className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">🚧 Système en Développement</h3>
                  <p className="text-amber-100 leading-relaxed mb-4">
                    Notre plateforme publicitaire est actuellement en cours de développement pour vous offrir 
                    une expérience exceptionnelle. Notre équipe travaille jour et nuit pour créer un système 
                    de publicité innovant et performant.
                  </p>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-amber-50">✨ Fonctionnalités à venir :</h4>
                    <ul className="space-y-2 text-amber-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-300" />
                        Création de campagnes publicitaires personnalisées
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-300" />
                        Ciblage avancé par âge, localisation et intérêts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-300" />
                        Tableau de bord analytique en temps réel
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-300" />
                        Système de paiement sécurisé et flexible
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-300" />
                        Support dédié pour les promoteurs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-yellow-300" />
                  <span className="font-semibold">Soyez informé du lancement !</span>
                </div>
                <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                  S'inscrire à la liste d'attente
                </button>
              </div>
            </div>

            {/* Avantages pour les promoteurs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Audience Qualifiée</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Accédez à une communauté TikTok active et engagée, parfaitement ciblée pour vos produits et services.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analytics Avancés</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Suivez vos performances avec des métriques détaillées et des rapports personnalisés pour optimiser vos campagnes.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ROI Garanti</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Maximisez votre retour sur investissement avec des tarifs compétitifs et des résultats mesurables.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Badges & Récompenses</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <BadgeSystem userId={user?.phone || ''} />
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques Avancées</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <AdvancedStats userId={user?.phone || ''} />
            </div>
          </div>
        )}

        {activeTab === "tiktok" && (
          <div className="space-y-6">
            <TikTokAnalytics />
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <TikTokSparkAdsManager businessId="your_business_id" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <TikTokLatencyInfo 
                dataType="video"
                realTimeFields={['item_id', 'create_time', 'thumbnail_url', 'share_url', 'embed_url', 'caption']}
                delayedFields={['video_views', 'likes', 'comments', 'shares', 'reach', 'video_duration', 'full_video_watched_rate', 'total_time_watched', 'average_time_watched', 'impression_sources', 'audience_countries']}
                lastUpdate={new Date().toISOString()}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <TikTokWebhookManager businessId="your_business_id" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <TikTokAuthTester />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <TikTokApiTester />
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div data-tab="messages" className="flex flex-col md:flex-row gap-6 h-[70vh]">
            {/* Liste des conversations */}
            <div className="w-full md:w-1/3 w-4/5 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto h-[80vh] md:h-auto">
              <div className="mb-4">
                <input
                  type="text"
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  placeholder="Indicatif+Numero"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                />
                <button onClick={handleSearchUser} className="mt-2 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">Nouvelle conversation</button>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Conversations</h4>
              <ul className="space-y-1 max-h-[60vh] md:max-h-none overflow-y-auto">
                {conversations.map(conv => (
                  <li key={conv}>
                    <button 
                      onClick={() => {
                        const safeConv = typeof conv === 'string' ? conv : '';
                        if (!safeConv) return;
                        setSelectedConv(safeConv);
                        setChatClosed(false);
                        // Réinitialiser le compteur de messages non lus pour cette conversation
                        setUnreadMessages(prev => {
                          const updated = {...prev};
                          delete updated[safeConv];
                          return updated;
                        });
                      }} 
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 relative ${selectedConv === conv ? 'bg-pink-100 dark:bg-pink-900/30 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {conv}
                      {unreadMessages[conv] && unreadMessages[conv] > 0 && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
                          {unreadMessages[conv]}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Fenêtre de chat */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 ${chatClosed ? 'hidden md:flex' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Chat avec {selectedConv}</h4>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      showConfirm("Voulez-vous vraiment supprimer cette conversation ?", () => {
                        // Filtrer les messages pour supprimer cette conversation
                        const filteredMessages = messages.filter(m => {
                          const from = typeof m.from === 'string' ? m.from : '';
                          const to = typeof m.to === 'string' ? m.to : '';
                          const userPhone = typeof user?.phone === 'string' ? user.phone : '';
                          const selConv = typeof selectedConv === 'string' ? selectedConv : '';
                          return (
                            (from === userPhone && to === selConv) ||
                            (from === selConv && to === userPhone)
                          );
                        });
                        setMessages(filteredMessages);
                        
                        // Mettre à jour le fichier messages.json via l'API
                        fetch('/api/messages/delete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            user: user?.phone,
                            contact: selectedConv
                          })
                        }).catch(err => console.error('Erreur lors de la suppression:', err));
                        
                        // Fermer la conversation
                        setSelectedConv(null);
                        setChatClosed(true);
                      });
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedConv(null);
                      setChatClosed(true);
                    }}
                    className="md:hidden bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-2" id="chat-messages">
                {loadingMessages ? <div>Chargement...</div> :
                  user && selectedConv ? (() => {
                    const filteredMessages = messages.filter(m => {
                      const from = typeof m.from === 'string' ? m.from : '';
                      const to = typeof m.to === 'string' ? m.to : '';
                      const userPhone = typeof user?.phone === 'string' ? user.phone : '';
                      const selConv = typeof selectedConv === 'string' ? selectedConv : '';
                      return (
                        (from === userPhone && to === selConv) ||
                        (from === selConv && to === userPhone)
                      );
                    });
                    return filteredMessages.map(m => {
                      const isFromMe = normalizePhone(m.from) === normalizePhone(user.phone);
                      return (
                        <div key={m.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`px-4 py-2 rounded-lg max-w-xs ${isFromMe ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{m.message}
                            <div className="text-xs text-right mt-1 opacity-60">{new Date(m.date).toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    });
                  })()
                  : <div>Sélectionnez une conversation.</div>
                }
              </div>
              {/* Formulaire d'envoi */}
              <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm"
                />
                <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm whitespace-nowrap">Envoyer</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div data-tab="ai" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-500" />
                Assistant IA BE STRONG
              </h2>
              <Link 
                href="/ai" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                IA Complète
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Widget IA Principal */}
              <div className="lg:col-span-2">
                <AIDashboardWidget userId={user?.id || 'default'} />
              </div>
              
              {/* Section IA existante améliorée */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-purple-500" />
                    Recommandations TikTok IA
                  </h3>
                  <DynamicTikTokAIRecommendations />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "creation" && (
          <div data-tab="creation" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Système de défis */}
              <ChallengeSystem userId={user?.id} />
              
              {/* Recommandations de contenu */}
              <ContentRecommendations userId={user?.id} />
            </div>
            
            {/* Planificateur de contenu */}
            <ContentScheduler userId={user?.id} />
          </div>
        )}
      </div>
      {/* Modal paramètres */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-pink-500" onClick={() => setSettingsOpen(false)} title="Fermer">
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Paramètres du compte</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone :</div>
              <div className="font-mono text-lg text-gray-900 dark:text-white">{user?.phone}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 mt-2">ID utilisateur :</div>
              <div className="font-mono text-xs text-gray-700 dark:text-gray-300">{user?.id}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 mt-2">Crédits :</div>
              <div className="font-semibold text-pink-600 dark:text-pink-400">{user?.credits}</div>
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <form onSubmit={handlePhoneChange} className="mb-4">
              <div className="font-semibold mb-2 text-gray-900 dark:text-white">Changer le numéro de téléphone</div>
              <div className="mb-2">
                <input
                  type="tel"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                  placeholder="Nouveau numéro (ex: +237655441122)"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  pattern="^\+[0-9]{10,15}$"
                  title="Format: +237655441122"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 mt-2 disabled:opacity-60"
                disabled={phoneLoading}
              >
                {phoneLoading ? "Changement..." : "Changer le numéro"}
              </button>
              {phoneResult && <div className={`mt-2 text-sm ${phoneResult.includes('succès') ? 'text-green-600' : 'text-red-500'}`}>{phoneResult}</div>}
            </form>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <form onSubmit={handlePwdChange} className="mb-4">
              <div className="font-semibold mb-2 text-gray-900 dark:text-white">Changer le mot de passe</div>
              <div className="relative mb-2">
                <input
                  type={showPwdOld ? "text" : "password"}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                  placeholder="Ancien mot de passe"
                  value={pwdOld}
                  onChange={e => setPwdOld(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwdOld(v => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPwdOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative mb-2">
                <input
                  type={showPwdNew ? "text" : "password"}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 pr-10"
                  placeholder="Nouveau mot de passe"
                  value={pwdNew}
                  onChange={e => setPwdNew(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwdNew(v => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPwdNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 mt-2 disabled:opacity-60"
                disabled={pwdLoading}
              >
                {pwdLoading ? "Changement..." : "Changer le mot de passe"}
              </button>
              {pwdResult && <div className={`mt-2 text-sm ${pwdResult.includes('succès') ? 'text-green-600' : 'text-red-500'}`}>{pwdResult}</div>}
            </form>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />

           
            <button
              onClick={logoutAndClearAccess}
              className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 mt-2"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
      {/* {showParrainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complétez votre pseudo</h2>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 mb-4"
              placeholder="Votre pseudo"
              value={newPseudo}
              onChange={e => setNewPseudo(e.target.value)}
              minLength={2}
              maxLength={30}
              required
            />
            <button
              onClick={handleSavePseudo}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 mt-2 disabled:opacity-60"
              disabled={!newPseudo.trim()}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )} */}
      <Script src="https://cdn.cinetpay.com/seamless/main.js" strategy="beforeInteractive" />
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-pink-500" onClick={() => setInviteModalOpen(false)} title="Fermer">×</button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Invitez un ami</h2>
            <label className="block mb-2 text-gray-700 dark:text-gray-200 font-medium">Votre code de parrainage</label>
            <input
              type="text"
              value={parrainCode}
              onChange={e => { setParrainCode(e.target.value); setCopied(false); }}
              placeholder="Entrez votre code de parrainage"
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 mb-4"
            />
            <button
              onClick={() => {
                if (parrainCode.trim()) {
                  const url = `${window.location.origin}/inscription?parrain=${encodeURIComponent(parrainCode.trim())}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                }
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-200 mb-2"
            >
              Copier le lien d'invitation
            </button>
            {copied && <p className="text-green-600 dark:text-green-400 text-center mt-2">Lien copié !</p>}
          </div>
        </div>
      )}
        {/* Affichage du compteur de jours restants sur la période d'essai gratuite EN BAS DE PAGE */}
        <div className="w-full flex flex-col items-center mt-12 mb-4">
        {hasDashboardAccess && dashboardAccessDaysLeft !== null && (
            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold blinking ${dashboardAccessDaysLeft <= 2 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}> 
              Accès admin : {dashboardAccessDaysLeft} jour{dashboardAccessDaysLeft > 1 ? 's' : ''} restant{dashboardAccessDaysLeft > 1 ? 's' : ''}
            </span>
          )}
          {freeTrialDaysLeft !== null && freeTrialDaysLeft > 0 && (
            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold blinking mt-2 ${freeTrialDaysLeft <= 2 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}> 
              Période d'essai : {freeTrialDaysLeft} jour{freeTrialDaysLeft > 1 ? 's' : ''} restant{freeTrialDaysLeft > 1 ? 's' : ''} sur 45
            </span>
          )}
    </div>
        {/* Modal Suggestions */}
        {showSuggestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md relative">
              <button onClick={() => setShowSuggestionModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl">×</button>
              <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">Envoyer une suggestion</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSuggestionLoading(true);
                setSuggestionError("");
                setSuggestionSuccess("");
                try {
                  const res = await fetch("/api/suggestions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nom: suggestionNom, numeroOuId: suggestionNumero, suggestion: suggestionText })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSuggestionSuccess("Merci pour votre suggestion !");
                    setSuggestionNom(""); setSuggestionNumero(""); setSuggestionText("");
                    setTimeout(() => { setShowSuggestionModal(false); setSuggestionSuccess(""); }, 2000);
                  } else {
                    setSuggestionError(data.error || "Erreur lors de l'envoi");
                  }
                } catch {
                  setSuggestionError("Erreur réseau");
                } finally {
                  setSuggestionLoading(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input type="text" value={suggestionNom} onChange={e => setSuggestionNom(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro ou ID</label>
                  <input type="text" value={suggestionNumero} onChange={e => setSuggestionNumero(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Suggestion</label>
                  <textarea value={suggestionText} onChange={e => setSuggestionText(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" rows={4} required />
                </div>
                {suggestionError && <div className="text-red-600 text-sm">{suggestionError}</div>}
                {suggestionSuccess && <div className="text-green-600 text-sm font-semibold">{suggestionSuccess}</div>}
                <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200" disabled={suggestionLoading}>
                  {suggestionLoading ? "Envoi..." : "Envoyer"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 

interface ExchangeTaskFormProps {
  onTaskCreated: () => void;
  showAlert: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}
function ExchangeTaskForm({ onTaskCreated, showAlert }: ExchangeTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [actionType, setActionType] = useState("LIKE");
  const [urlError, setUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utiliser l'utilisateur connecté
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // setLocalPseudo(currentUser.phone); // This variable is no longer used
    }
  }, []);

  async function handleSubmit() {
    console.log('🚀 handleSubmit appelée!');
    const form = formRef.current;
    if (!form) return;
    
    setIsSubmitting(true);
    
    try {
    const data = Object.fromEntries(new FormData(form));
    const url = String(data.url || "");
    
    // Validation lien TikTok - Accepter tous les formats TikTok
    if (!url.includes("tiktok.com")) {
      setUrlError("Le lien doit contenir tiktok.com");
      return;
    } else {
      setUrlError("");
    }
    
    // Vérifier que l'utilisateur est connecté
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showAlert("Vous devez être connecté pour créer une tâche.", "error");
      return;
    }
    
    // Vérifier les crédits de l'utilisateur (coût fixe de 1 crédit)
    if (currentUser.credits < 1) {
      showAlert(`Crédits insuffisants. Vous avez ${currentUser.credits} crédits, il vous faut 1 crédit pour créer une tâche.`, "error");
      return;
    }
    
      console.log('🔄 Création de tâche en cours...');
      const response = await fetch("/api/exchange/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.type,
        url: data.url,
        actionsRestantes: Number(data.actionsRestantes),
        createur: currentUser.phone,
      }),
    });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur création tâche:', response.status, errorText);
        showAlert(`Erreur lors de la création de la tâche: ${response.status} - ${errorText}`, "error");
        return;
      }
      
      const result = await response.json();
      console.log('✅ Tâche créée avec succès:', result);
      
    form.reset();
    onTaskCreated();
      showAlert('✅ Tâche créée avec succès !', "success");
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de la tâche:', error);
      showAlert(`Erreur lors de la création de la tâche: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Créer une tâche d&apos;échange</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type d&apos;action</label>
          <select id="type" name="type" value={actionType} onChange={e => setActionType(e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" title="Type d'action à filtrer">
            <option value="LIKE">Like</option>
            <option value="FOLLOW">Follow</option>
            <option value="COMMENT">Commentaire</option>
            <option value="SHARE">Partage</option>
          </select>
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            {actionType === "FOLLOW" ? "Lien du compte TikTok" : "Lien de la vidéo"}
          </label>
          <input
            id="url"
            name="url"
            type="url"
            required
            className={`w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 ${urlError ? 'border-red-500' : ''}`}
            placeholder={actionType === "FOLLOW" ? "https://www.tiktok.com/@votre_compte" : "https://www.tiktok.com/@user/video/123"}
            title={actionType === "FOLLOW" ? "Lien du compte TikTok" : "Lien de la vidéo"}
          />
          {urlError && (
            <p className="text-red-500 text-sm mt-1">{urlError}</p>
          )}
        </div>
        <div>
          <label htmlFor="actionsRestantes" className="block text-sm font-medium mb-1">Nombre d&apos;actions</label>
          <input id="actionsRestantes" name="actionsRestantes" type="number" min={1} required className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" title="Nombre d&apos;actions" />
        </div>
        <div className="md:col-span-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Nouveau système de crédits :</strong><br/>
              • Création de tâche : 1 crédit (peu importe le type)<br/>
              • Tâche effectuée : 5 crédits de gain
            </p>
          </div>
        </div>

      </div>
      <button 
        type="button" 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '🔄 Création...' : 'Créer la tâche'}
      </button>
    </form>
  );
}

interface ExchangeTaskListProps {
  tasks: ExchangeTask[];
  onRefresh: () => void;
  showOnlyMine?: boolean;
  onNewTask?: () => void;
  showAlert: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}
function ExchangeTaskList({ tasks, onRefresh, showOnlyMine, onNewTask, showAlert, showConfirm }: ExchangeTaskListProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [completerPseudo, setCompleterPseudo] = useState<string>("");

  // Fonction pour ouvrir les liens TikTok avec tracking
  const openTikTokLink = async (url: string, taskType: string, taskId: string) => {
    // Marquer la tâche comme "vue" par l'utilisateur
    setViewedTasks(prev => new Set([...prev, taskId]));
    
    // Détecter si on est sur Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      // Ouvre le lien dans l'app TikTok si installée, sinon dans le navigateur
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`;
      window.location.href = intentUrl;
        
      // Fallback navigateur après 1s si l'app n'est pas installée
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 1000);
    } else {
      // Sur iOS ou PC, ouvrir dans un nouvel onglet
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Récupère le pseudo du completeur depuis le localStorage au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pseudo-completeur");
      if (stored) setCompleterPseudo(stored);
    }
  }, []);

  // Sauvegarde le pseudo du completeur à chaque changement
  useEffect(() => {
    if (completerPseudo && typeof window !== "undefined") {
      localStorage.setItem("pseudo-completeur", completerPseudo);
    }
  }, [completerPseudo]);

  // Fonction pour rafraîchir le solde de crédits du completeur si c'est le même que le dashboard
  const refreshDashboardCredits = async (userId: string) => {
    if (!userId) return;
    if (typeof window !== "undefined") {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        // On déclenche un event custom pour demander au dashboard de rafraîchir les crédits
        window.dispatchEvent(new Event("refresh-credits"));
      }
    }
  };

  // Filtrage et tri : toujours afficher les tâches de l'utilisateur en premier
  const currentUser = getCurrentUser();
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  
  // Filtrer les tâches par type si un filtre est sélectionné
  let filteredTasks = tasks;
  if (filterType !== "ALL") {
    filteredTasks = tasks.filter(task => task.type === filterType);
  }
  
  let displayTasks = filteredTasks;
  let myTasks: ExchangeTask[] = [];
  let otherTasks: ExchangeTask[] = [];
  
  if (currentUser) {
    myTasks = filteredTasks.filter(t => norm(t.createur) === norm(currentUser.phone));
    otherTasks = filteredTasks.filter(t => norm(t.createur) !== norm(currentUser.phone));
    
    if (showOnlyMine) {
      displayTasks = [...myTasks, ...otherTasks];
    } else {
      // En mode normal, toujours trier : mes tâches en premier
      displayTasks = [...myTasks, ...otherTasks];
    }
  }



  // État pour stocker les tâches complétées
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  
  // État pour stocker les liens "Voir" cliqués par utilisateur
  const [viewedTasks, setViewedTasks] = useState<Set<string>>(new Set());

  // Fonction pour vérifier toutes les tâches complétées (optimisée)
  const checkCompletedTasks = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return;

    // Utiliser directement les données des tâches déjà chargées
    const userCompletions = new Set<string>();
    
    tasks.forEach((task: ExchangeTask) => {
      if (task.completions && task.completions.length > 0) {
        const hasCompleted = task.completions.some(comp => comp.userId === currentUser.id);
        if (hasCompleted) {
          userCompletions.add(task.id);
        }
      }
    });
    
    setCompletedTasks(userCompletions);
  }, [tasks]);

  // Vérifier les tâches complétées quand les tâches changent
  useEffect(() => {
    checkCompletedTasks();
  }, [checkCompletedTasks]);



  // Fonction pour rendre le bouton de complétion ou le statut (optimisée)
  const renderCompletionButtonOrStatus = useCallback((task: ExchangeTask) => {
    const currentUser = getCurrentUser();
    // Vérification rapide : d'abord l'état local, puis les données de la tâche
    const hasCompleted = completedTasks.has(task.id) || 
      (task.completions && task.completions.some(comp => comp.userId === currentUser?.id));
    const hasViewed = viewedTasks.has(task.id);

    if (hasCompleted) {
      return (
        <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded font-medium">
          ✅ Tâche effectuée
        </span>
      );
    }

    if (hasViewed) {
      return (
        <button 
          onClick={() => handleComplete(task.id)} 
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          J'ai fait l'action
        </button>
      );
    }

    return (
      <button 
        onClick={() => handleComplete(task.id)} 
        className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
        disabled
        title="Cliquez d'abord sur 'Voir' pour effectuer la tâche"
      >
        J'ai fait l'action
      </button>
    );
  }, [completedTasks, viewedTasks]);

  async function handleComplete(taskId: string) {
    // Vérifier si l'utilisateur a d'abord cliqué sur "Voir"
    if (!viewedTasks.has(taskId)) {
      showAlert("⚠️ Vous devez d'abord effectuer la tâche. Merci !", "warning");
      return;
    }

    // Utiliser l'ID de l'utilisateur connecté automatiquement
    const currentUser = getCurrentUser();
    let userId = currentUser?.id;
    if (!userId) {
      // Fallback : demander le pseudo si pas d'utilisateur connecté
      userId = prompt("Entrez votre pseudo ou identifiant (pour gagner les crédits)") || "";
      if (!userId) return;
      setCompleterPseudo(userId);
    }
    
    try {
      const response = await fetch(`/api/exchange/tasks/${taskId}/complete`, {
        method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    });
      
      const data = await response.json();
      if (data.error) {
        showAlert(data.error, "error");
      } else if (data.verified) {
        showAlert(`✅ ${data.message}\n💰 Vous avez gagné ${data.creditsEarned} crédits !`, "success");
        // Ajouter la tâche à la liste des tâches complétées
        setCompletedTasks(prev => new Set([...prev, taskId]));
        onRefresh();
        refreshDashboardCredits(userId);
      } else {
        showAlert(`❌ ${data.message}\n⚠️ L'action n'a pas pu être vérifiée automatiquement.`, "error");
        onRefresh();
      }
    } catch {
      console.error('Erreur lors de la complétion:', Error);
      showAlert("Erreur lors de la complétion de la tâche", "error");
    }
  }

  async function handleDelete(taskId: string) {
    // Récupérer l'utilisateur actuel
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showAlert('Vous devez être connecté pour supprimer une tâche', "error");
      return;
    }

    // Trouver la tâche pour vérifier le créateur
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      showAlert('Tâche non trouvée', "error");
      return;
    }

    // Vérifier si l'utilisateur est le créateur de la tâche
    const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
    const isCreator = norm(task.createur) === norm(currentUser.phone);
    
    if (!isCreator) {
      showAlert('Vous ne pouvez supprimer que vos propres tâches', "error");
      return;
    }

    showConfirm('Supprimer cette tâche ?', () => {
      fetch(`/api/exchange/tasks?id=${taskId}`, { method: 'DELETE' })
        .then(response => {
      if (response.ok) {
        onRefresh();
      } else {
            showAlert('Erreur lors de la suppression de la tâche', "error");
      }
        })
        .catch(() => {
      console.error('Erreur lors de la suppression:', Error);
          showAlert('Erreur lors de la suppression de la tâche', "error");
        });
    });
  }



  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Bouton Actualiser juste au-dessus du titre */}
      <div className="flex justify-end mb-3">
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tâches d&apos;échange disponibles</h3>
      
      {/* Note spécifique pour Android */}
      {typeof window !== 'undefined' && /Android/i.test(navigator.userAgent) && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            📱 <strong>NB:</strong> Veillez effectuer chaque tâche pour gagner vos crédits (click sur <span className="text-blue-600 dark:text-blue-400 font-bold">voir</span>)
          </p>
        </div>
      )}
      {/* Si showOnlyMine, bouton pour lancer une nouvelle tâche */}
      {showOnlyMine && (
        <button
          className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
          onClick={onNewTask}
        >Lancer une nouvelle tâche</button>
      )}
      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type d&apos;action</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" title="Type d&apos;action à filtrer">
            <option value="ALL">Tous</option>
            <option value="LIKE">Like</option>
            <option value="FOLLOW">Follow</option>
            <option value="COMMENT">Commentaire</option>
            <option value="SHARE">Partage</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="min-w-[600px] w-full text-xs sm:text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Vidéo</th>
              <th className="px-4 py-2 text-left">Crédits</th>
              <th className="px-4 py-2 text-left">Restant</th>
              <th className="px-4 py-2 text-left">Créateur</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Séparation visuelle entre mes tâches et celles des autres */}
            {showOnlyMine && myTasks.length > 0 && (
              <tr>
                <td colSpan={6} className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 font-semibold px-4 py-2 border-t border-b border-green-200 dark:border-green-800">Mes t&acirc;ches</td>
              </tr>
            )}
            {showOnlyMine && myTasks.map(task => (
              <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2">{task.type}</td>
                <td className="px-4 py-2"><a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300" onClick={(e) => { e.preventDefault(); openTikTokLink(task.url, task.type, task.id); }}>Voir</a></td>
                <td className="px-4 py-2">{task.credits}</td>
                <td className="px-4 py-2">{task.actionsRestantes}</td>
                <td className="px-4 py-2">{task.createur?.slice(0, 7)}</td>
                <td className="px-4 py-2 space-x-2">
                  {renderCompletionButtonOrStatus(task)}
                  <button onClick={() => handleDelete(task.id)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600">Supprimer</button>
                </td>
              </tr>
            ))}
            {showOnlyMine && otherTasks.length > 0 && (
              <tr>
                <td colSpan={6} className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold px-4 py-2 border-t border-b border-blue-200 dark:border-blue-800">T&acirc;ches des autres utilisateurs</td>
              </tr>
            )}
            {showOnlyMine && otherTasks.map(task => (
              <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2">{task.type}</td>
                <td className="px-4 py-2"><a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300" onClick={(e) => { e.preventDefault(); openTikTokLink(task.url, task.type, task.id); }}>Voir</a></td>
                <td className="px-4 py-2">{task.credits}</td>
                <td className="px-4 py-2">{task.actionsRestantes}</td>
                <td className="px-4 py-2">{task.createur?.slice(0, 7)}</td>
                <td className="px-4 py-2 space-x-2">
                  {renderCompletionButtonOrStatus(task)}
                </td>
              </tr>
            ))}
            {/* Cas normal avec séparation visuelle */}
            {!showOnlyMine && myTasks.length > 0 && (
              <tr>
                <td colSpan={6} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-200 font-semibold px-4 py-2 border-t border-b border-green-200 dark:border-green-800">
                  🎯 Mes tâches créées
                </td>
              </tr>
            )}
            {!showOnlyMine && myTasks.map(task => (
              <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50/30 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {task.type}
                  </span>
                </td>
                <td className="px-4 py-2"><a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300" onClick={(e) => { e.preventDefault(); openTikTokLink(task.url, task.type, task.id); }}>Voir</a></td>
                <td className="px-4 py-2">{task.credits}</td>
                <td className="px-4 py-2">{task.actionsRestantes}</td>
                <td className="px-4 py-2">
                  <span className="flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400 font-medium">Vous</span>
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  {renderCompletionButtonOrStatus(task)}
                  <button onClick={() => handleDelete(task.id)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600">Supprimer</button>
                </td>
              </tr>
            ))}
            {!showOnlyMine && otherTasks.length > 0 && (
              <tr>
                <td colSpan={6} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-200 font-semibold px-4 py-2 border-t border-b border-blue-200 dark:border-blue-800">
                  👥 Tâches des autres utilisateurs
                </td>
              </tr>
            )}
            {!showOnlyMine && otherTasks.map(task => (
              <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2">{task.type}</td>
                <td className="px-4 py-2"><a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300" onClick={(e) => { e.preventDefault(); openTikTokLink(task.url, task.type, task.id); }}>Voir</a></td>
                <td className="px-4 py-2">{task.credits}</td>
                <td className="px-4 py-2">{task.actionsRestantes}</td>
                <td className="px-4 py-2">{task.createur?.slice(0, 7)}</td>
                <td className="px-4 py-2 space-x-2">
                  {renderCompletionButtonOrStatus(task)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 

// Composant dynamique pour recommandations IA TikTok
function DynamicTikTokAIRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [advice, setAdvice] = useState<string>("");
  const [userTitle, setUserTitle] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  // Base de données de hashtags par catégorie
  const hashtagDatabase = {
    beauty: ["#beauty", "#makeup", "#skincare", "#beautytips", "#makeuptutorial", "#skincareroutine", "#beautyhacks", "#makeuplooks", "#beautyproducts", "#beautytrends"],
    fashion: ["#fashion", "#ootd", "#style", "#fashiontrends", "#fashionista", "#streetstyle", "#fashionblogger", "#fashioninspo", "#fashionstyle", "#fashiontips"],
    fitness: ["#fitness", "#workout", "#gym", "#exercise", "#fitnessmotivation", "#health", "#training", "#fitnessgoals", "#workoutmotivation", "#fitnesslifestyle"],
    food: ["#food", "#foodie", "#cooking", "#recipe", "#foodphotography", "#delicious", "#foodblogger", "#homemade", "#foodporn", "#foodlover"],
    travel: ["#travel", "#wanderlust", "#traveling", "#travelphotography", "#travelblogger", "#adventure", "#explore", "#travelingram", "#traveltheworld", "#traveling"],
    tech: ["#tech", "#technology", "#gadgets", "#innovation", "#technews", "#smartphone", "#laptop", "#techreview", "#techlife", "#techtrends"],
    gaming: ["#gaming", "#gamer", "#videogames", "#streamer", "#esports", "#gamingcommunity", "#gaminglife", "#gamingchannel", "#gamingyoutube", "#gamingcontent"],
    business: ["#business", "#entrepreneur", "#startup", "#success", "#motivation", "#entrepreneurship", "#businessowner", "#smallbusiness", "#businessmindset", "#entrepreneurlife"],
    comedy: ["#comedy", "#funny", "#humor", "#jokes", "#laugh", "#comedyvideo", "#funnyvideos", "#comedycontent", "#humorvideo", "#funnycontent"],
    education: ["#education", "#learning", "#study", "#knowledge", "#educational", "#learn", "#studytips", "#educationcontent", "#learningvideos", "#educationalcontent"]
  };

  // Fonction pour analyser le titre et générer des hashtags pertinents
  const analyzeTitle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    let category = "general";
    let specificHashtags: string[] = [];
    let captivatingTitle = "";

    // Analyse intelligente du titre et génération de titre captivant
    if (lowerTitle.includes("makeup") || lowerTitle.includes("beauty") || lowerTitle.includes("skincare")) {
      category = "beauty";
      specificHashtags = ["#beautyhacks", "#makeuptutorial", "#skincareroutine", "#beautytips", "#makeuplooks", "#beautyproducts", "#beautytrends", "#makeupartist", "#beautyinfluencer", "#beautylifestyle"];
      captivatingTitle = `✨ ${title} | Routine beauté qui va te faire briller ✨`;
    } else if (lowerTitle.includes("outfit") || lowerTitle.includes("fashion") || lowerTitle.includes("style")) {
      category = "fashion";
      specificHashtags = ["#ootd", "#fashiontrends", "#styleinspo", "#fashionista", "#streetstyle", "#fashionblogger", "#fashionstyle", "#fashiontips", "#fashionlover", "#fashiondaily"];
      captivatingTitle = `👗 ${title} | Style qui va te faire tourner les têtes 👗`;
    } else if (lowerTitle.includes("workout") || lowerTitle.includes("fitness") || lowerTitle.includes("exercise")) {
      category = "fitness";
      specificHashtags = ["#fitnessmotivation", "#workout", "#healthylifestyle", "#gym", "#exercise", "#training", "#fitnessgoals", "#workoutmotivation", "#fitnesslifestyle", "#strong"];
      captivatingTitle = `💪 ${title} | Défi fitness qui va te transformer 💪`;
    } else if (lowerTitle.includes("food") || lowerTitle.includes("recipe") || lowerTitle.includes("cooking")) {
      category = "food";
      specificHashtags = ["#foodie", "#recipe", "#cooking", "#foodphotography", "#delicious", "#foodblogger", "#homemade", "#foodporn", "#foodlover", "#chef"];
      captivatingTitle = `🍽️ ${title} | Recette qui va te faire saliver 🍽️`;
    } else if (lowerTitle.includes("travel") || lowerTitle.includes("trip") || lowerTitle.includes("vacation")) {
      category = "travel";
      specificHashtags = ["#travel", "#wanderlust", "#travelphotography", "#travelblogger", "#adventure", "#explore", "#travelingram", "#traveltheworld", "#traveling", "#vacation"];
      captivatingTitle = `✈️ ${title} | Aventure qui va te faire rêver ✈️`;
    } else if (lowerTitle.includes("tech") || lowerTitle.includes("gadget") || lowerTitle.includes("review")) {
      category = "tech";
      specificHashtags = ["#tech", "#gadgets", "#techreview", "#technology", "#innovation", "#smartphone", "#laptop", "#techlife", "#techtrends", "#geek"];
      captivatingTitle = `📱 ${title} | Tech qui va te faire halluciner 📱`;
    } else if (lowerTitle.includes("game") || lowerTitle.includes("gaming")) {
      category = "gaming";
      specificHashtags = ["#gaming", "#gamer", "#videogames", "#streamer", "#esports", "#gamingcommunity", "#gaminglife", "#gamingchannel", "#gamingyoutube", "#gamingcontent"];
      captivatingTitle = `🎮 ${title} | Gaming qui va te faire vibrer 🎮`;
    } else if (lowerTitle.includes("business") || lowerTitle.includes("entrepreneur")) {
      category = "business";
      specificHashtags = ["#business", "#entrepreneur", "#success", "#startup", "#motivation", "#entrepreneurship", "#businessowner", "#smallbusiness", "#businessmindset", "#entrepreneurlife"];
      captivatingTitle = `💼 ${title} | Business qui va te faire réussir 💼`;
    } else if (lowerTitle.includes("funny") || lowerTitle.includes("comedy") || lowerTitle.includes("joke")) {
      category = "comedy";
      specificHashtags = ["#comedy", "#funny", "#humor", "#jokes", "#laugh", "#comedyvideo", "#funnyvideos", "#comedycontent", "#humorvideo", "#funnycontent"];
      captivatingTitle = `😂 ${title} | Humour qui va te faire mourir de rire 😂`;
    } else if (lowerTitle.includes("learn") || lowerTitle.includes("study") || lowerTitle.includes("education")) {
      category = "education";
      specificHashtags = ["#education", "#learning", "#studytips", "#knowledge", "#educational", "#learn", "#educationcontent", "#learningvideos", "#educationalcontent", "#student"];
      captivatingTitle = `📚 ${title} | Apprentissage qui va te faire grandir 📚`;
    } else {
      // Titre générique captivant
      specificHashtags = ["#viral", "#trending", "#fyp", "#tiktok", "#foryou", "#content", "#creator", "#socialmedia", "#digital", "#online"];
      captivatingTitle = `🔥 ${title} | Contenu qui va faire le buzz 🔥`;
    }

    // Combiner hashtags spécifiques + génériques + tendance
    const categoryHashtags = hashtagDatabase[category as keyof typeof hashtagDatabase] || hashtagDatabase.beauty;
    const trendingHashtags = ["#fyp", "#viral", "#trending", "#tiktok", "#foryou"];
    
    // Combiner et supprimer les doublons
    const allHashtags = [...specificHashtags, ...categoryHashtags.slice(0, 5), ...trendingHashtags];
    const uniqueHashtags = [...new Set(allHashtags)];
    
    return {
      hashtags: uniqueHashtags,
      captivatingTitle: captivatingTitle
    };
  };

  // Fonction pour obtenir seulement les hashtags (compatibilité)
  const getHashtagsOnly = (title: string) => {
    const result = analyzeTitle(title);
    return result.hashtags;
  };

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Générer des hashtags basés sur le titre de l'utilisateur
      let generatedHashtags: string[] = [];
      let analysis = "";

      if (userTitle.trim()) {
        const analysisResult = analyzeTitle(userTitle);
        generatedHashtags = analysisResult.hashtags;
        const captivatingTitle = analysisResult.captivatingTitle;
        
        analysis = `🎯 Analyse IA pour "${userTitle}":\n\n`;
        analysis += `📝 Titre captivant suggéré:\n`;
        analysis += `"${captivatingTitle}"\n\n`;
        analysis += `📊 Catégorie détectée: ${userTitle.toLowerCase().includes("makeup") ? "Beauté" : userTitle.toLowerCase().includes("fashion") ? "Mode" : userTitle.toLowerCase().includes("fitness") ? "Fitness" : userTitle.toLowerCase().includes("food") ? "Food" : userTitle.toLowerCase().includes("travel") ? "Travel" : userTitle.toLowerCase().includes("tech") ? "Tech" : userTitle.toLowerCase().includes("game") ? "Gaming" : userTitle.toLowerCase().includes("business") ? "Business" : userTitle.toLowerCase().includes("funny") ? "Comedy" : userTitle.toLowerCase().includes("learn") ? "Education" : "Général"}\n`;
        analysis += `⏰ Meilleur moment: 18h-21h (heure locale)\n`;
        analysis += `📈 Conseils: Utilisez 3-5 hashtags, mixez populaire et niche\n`;
        analysis += `🎬 Format: Vidéo verticale, 15-60 secondes\n`;
        analysis += `💡 Astuce: Ajoutez des sous-titres pour +40% d'engagement\n`;
        analysis += `🔥 Potentiel viral: Élevé avec ce titre et ces hashtags`;
      } else {
        // Hashtags tendance génériques avec rotation
        const allTrendingHashtags = [
          "#fyp", "#viral", "#trending", "#tiktok", "#foryou", "#spring", "#ootd", "#fitcheck", "#nailinspo", "#jobsearch", "#sidehustles", "#snacks", "#mealprep", "#mentalhealthcare", "#garden", "#plantsoftiktok", "#craftideas", "#nycphotography", "#breakingnews", "#frenchbulldog", "#nba", "#headphones", "#beachvibes", "#summer", "#vibes", "#aesthetic", "#lifestyle", "#daily", "#routine", "#morning", "#night", "#weekend", "#mood", "#energy", "#positive", "#motivation", "#inspiration", "#creative", "#art", "#music", "#dance", "#challenge", "#trend", "#popular", "#famous", "#celebrity", "#influencer", "#content", "#creator", "#socialmedia", "#digital", "#online", "#community", "#friends", "#family", "#love", "#life", "#happy", "#smile", "#fun", "#enjoy", "#relax", "#chill", "#cozy", "#comfortable", "#style", "#fashion", "#beauty", "#makeup", "#skincare", "#hair", "#nails", "#outfit", "#look", "#photo", "#picture", "#video", "#reel", "#story", "#post", "#share", "#like", "#comment", "#follow", "#subscribe", "#support", "#love", "#care", "#help", "#give", "#giveaway", "#contest", "#win", "#prize", "#gift", "#surprise", "#special", "#unique", "#different", "#new", "#fresh", "#clean", "#pure", "#natural", "#organic", "#healthy", "#fit", "#strong", "#powerful", "#amazing", "#incredible", "#wow", "#omg", "#crazy", "#insane", "#wild", "#fire", "#hot", "#cool", "#awesome", "#fantastic", "#perfect", "#best", "#top", "#number1", "#winner", "#champion", "#king", "#queen", "#boss", "#leader", "#star", "#icon", "#legend", "#hero", "#savior", "#angel", "#goddess", "#princess", "#prince", "#royal", "#noble", "#elite", "#premium", "#luxury", "#expensive", "#rich", "#wealthy", "#successful", "#prosperous", "#thriving", "#flourishing", "#blooming", "#growing", "#developing", "#progressing", "#advancing", "#improving", "#enhancing", "#upgrading", "#evolving", "#transforming", "#changing", "#adapting", "#adjusting", "#modifying", "#altering", "#varying", "#diversifying", "#expanding", "#extending", "#broadening", "#widening", "#enlarging", "#increasing", "#multiplying", "#doubling", "#tripling", "#quadrupling", "#quintupling", "#sextupling", "#septupling", "#octupling", "#nonupling", "#decupling"
        ];
        
        // Mélanger et sélectionner 12 hashtags aléatoires uniques
        const shuffled = allTrendingHashtags.sort(() => 0.5 - Math.random());
        const uniqueShuffled = [...new Set(shuffled)];
        generatedHashtags = uniqueShuffled.slice(0, 12);
        
        analysis = "🔥 Hashtags TikTok tendance actualisés:\n\n";
        analysis += `⏰ Meilleur moment: 18h-21h (heure locale)\n`;
        analysis += `📈 Conseils: Utilisez les hashtags tendance pour maximiser votre portée\n`;
        analysis += `🎬 Format: Vidéo verticale, 15-60 secondes\n`;
        analysis += `💡 Astuce: Participez aux challenges populaires pour +60% de visibilité\n`;
        analysis += `🔄 Actualisé: ${new Date().toLocaleTimeString()}`;
      }

      setHashtags(generatedHashtags);
      setAiAnalysis(analysis);
      setAdvice(`<a href='https://metricool.com/trending-tiktok-hashtags/' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 dark:text-blue-300'>Consultez les tendances TikTok en temps réel</a>`);
    } catch {
      setError("Impossible de récupérer les tendances TikTok en temps réel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🤖 IA TikTok Intelligente</h3>
        <button 
          onClick={() => {
            setUserTitle("");
            fetchTrends();
          }} 
          className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Champ de titre pour l'analyse IA */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-white">🎯 Entrez votre titre TikTok :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={userTitle}
            onChange={(e) => setUserTitle(e.target.value)}
            placeholder="Ex: Mon routine makeup du matin, Mon outfit du jour, Mon workout..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              if (userTitle.trim()) {
                setLoading(true);
                setError("");
                try {
                  const analysisResult = analyzeTitle(userTitle);
                  const generatedHashtags = analysisResult.hashtags;
                  const captivatingTitle = analysisResult.captivatingTitle;
                  let analysis = `🎯 Analyse IA pour "${userTitle}":\n\n`;
                  analysis += `📝 Titre captivant suggéré:\n`;
                  analysis += `"${captivatingTitle}"\n\n`;
                  analysis += `📊 Catégorie détectée: ${userTitle.toLowerCase().includes("makeup") ? "Beauté" : userTitle.toLowerCase().includes("fashion") ? "Mode" : userTitle.toLowerCase().includes("fitness") ? "Fitness" : userTitle.toLowerCase().includes("food") ? "Food" : userTitle.toLowerCase().includes("travel") ? "Travel" : userTitle.toLowerCase().includes("tech") ? "Tech" : userTitle.toLowerCase().includes("game") ? "Gaming" : userTitle.toLowerCase().includes("business") ? "Business" : userTitle.toLowerCase().includes("funny") ? "Comedy" : userTitle.toLowerCase().includes("learn") ? "Education" : "Général"}\n`;
                  analysis += `⏰ Meilleur moment: 18h-21h (heure locale)\n`;
                  analysis += `📈 Conseils: Utilisez 3-5 hashtags, mixez populaire et niche\n`;
                  analysis += `🎬 Format: Vidéo verticale, 15-60 secondes\n`;
                  analysis += `💡 Astuce: Ajoutez des sous-titres pour +40% d'engagement\n`;
                  analysis += `🔥 Potentiel viral: Élevé avec ce titre et ces hashtags`;
                  setHashtags(generatedHashtags);
                  setAiAnalysis(analysis);
                  setAdvice(`<a href='https://metricool.com/trending-tiktok-hashtags/' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 dark:text-blue-300'>Consultez les tendances TikTok en temps réel</a>`);
                } catch {
                  setError("Erreur lors de l'analyse IA");
                } finally {
                  setLoading(false);
                }
              }
            }}
            disabled={loading || !userTitle.trim()}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Génération..." : "Générer"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-blue-500 py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          L'IA analyse votre contenu...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-6">❌ {error}</div>
      ) : (
        <>
          {/* Analyse IA */}
          {aiAnalysis && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">🧠 Analyse IA :</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
          )}

          {/* Hashtags générés */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {userTitle ? "🎯 Hashtags personnalisés :" : "🔥 Hashtags TikTok tendance :"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span 
                  key={`${tag}-${index}`}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer hover:scale-105 ${
                    index < 3 ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-200' : 
                    index < 8 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200' : 
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200'
                  }`}
                  title={index < 3 ? "Hashtag spécifique" : index < 8 ? "Hashtag de catégorie" : "Hashtag tendance"}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Conseils supplémentaires */}
          <div className="flex items-start gap-2">
            <Target className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">💡 Ressources :</p>
              <p className="text-xs text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: advice }} />
            </div>
          </div>
        </>
      )}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-pink-500" /> Conseils pratiques pour percer sur TikTok
        </h4>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-2">
          <li>Publiez régulièrement (1 à 2 vidéos par jour pour maximiser l'algorithme).</li>
          <li>Soignez les 3 premières secondes : captez l'attention dès le début.</li>
          <li>Utilisez les sons et musiques tendance du moment.</li>
          <li>Participez aux challenges et trends populaires.</li>
          <li>Ajoutez des sous-titres et du texte pour renforcer le message.</li>
          <li>Privilégiez la vidéo verticale, lumineuse et de bonne qualité.</li>
          <li>Racontez une histoire ou partagez une astuce concrète.</li>
          <li>Interagissez avec votre audience (répondez aux commentaires, posez des questions).</li>
          <li>Utilisez 3 à 5 hashtags pertinents (dont 1 ou 2 très populaires et 1 de niche).</li>
          <li>Analysez vos statistiques pour comprendre ce qui fonctionne et ajuster votre contenu.</li>
        </ul>
      </div>
    </div>
  );
}