import { useState, useEffect } from "react";

type Notification = {
  id: string;
  message: string;
  date: string;
  lu: boolean;
};

export default function NotificationPopup() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Récupérer userId depuis localStorage
  const getUserId = () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          return parsed.phone || parsed.userId || parsed.id;
        } catch {
          return user;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (open) {
      const userId = getUserId();
      if (!userId) {
        setNotifications([]);
        setError("Utilisateur non connecté");
        return;
      }
      setLoading(true);
      setError("");
      fetch(`/api/admin/notifications?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          } else {
            setNotifications([]);
            setError("Erreur lors du chargement");
          }
        })
        .catch(() => setError("Erreur réseau"))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Récupérer userId depuis localStorage
      const user = localStorage.getItem("currentUser");
      let userId = null;
      if (user) {
        try {
          const parsed = JSON.parse(user);
          userId = parsed.phone || parsed.userId || parsed.id;
        } catch {
          userId = user;
        }
      }
      
      if (!userId) {
        console.error('Utilisateur non connecté');
        return;
      }

      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifId: notificationId, userId })
      });
      if (!response.ok) {
        console.error('Erreur API lors du marquage comme lu:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.lu) {
      // Marquer comme lu immédiatement dans l'état local
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, lu: true } : n)
      );
      // Appeler l'API en arrière-plan
      markAsRead(notification.id);
    }
  };

  const closeDetail = () => {
    setSelectedNotification(null);
  };

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.lu).length;

  return (
    <div className="relative inline-block">
      <button
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
        className="relative bg-none border-none cursor-pointer text-2xl text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 transform hover:scale-110"
      >
        {/* Icône cloche moderne avec animation */}
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-all duration-300">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {/* Badge pour notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <div className="absolute right-0 mt-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-2xl min-w-[350px] max-w-[450px] z-50 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-top-2">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <h4 className="font-bold text-lg">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="bg-white bg-opacity-20 text-white text-xs font-bold rounded-full px-2 py-1">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 border-none text-white text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Contenu */}
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20" className="mx-auto mb-3">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <p className="text-lg font-medium">Aucune notification</p>
                  <p className="text-sm">Vous êtes à jour !</p>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.map((n, index) => (
                    <li 
                      key={n.id} 
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 ${
                        !n.lu ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(n)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icône de notification */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          !n.lu 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm leading-relaxed whitespace-normal break-words ${
                            n.lu 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-white font-medium'
                          }`}>
                            {n.message.length > 120 ? `${n.message.substring(0, 120)}...` : n.message}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(n.date).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {!n.lu && (
                              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal moderne pour afficher le détail de la notification */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 animate-in zoom-in-95">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Notification</h3>
                    <p className="text-sm opacity-90">Détails du message</p>
                  </div>
                </div>
                <button 
                  onClick={closeDetail}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 border-none text-white text-2xl cursor-pointer w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Contenu du modal */}
            <div className="p-6">
              <div className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap break-words mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                {selectedNotification.message}
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  📅 {new Date(selectedNotification.date).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {!selectedNotification.lu && (
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full px-3 py-1">
                    Nouveau
                  </span>
                )}
              </div>
              <button 
                onClick={closeDetail}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}