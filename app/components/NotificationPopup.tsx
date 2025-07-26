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

  return (
    <div className="relative inline-block">
      <button
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
        className="bg-none border-none cursor-pointer text-2xl text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
      >
        {/* Icône cloche simple en SVG */}
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg min-w-[300px] max-w-[400px] z-50 p-4">
          <button 
            onClick={() => setOpen(false)} 
            className="float-right bg-none border-none text-lg cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
          <div className="clear-both" />
          <h4 className="text-gray-900 dark:text-white font-semibold mb-3 mt-2">Notifications</h4>
          
          {loading ? (
            <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300">Aucune notification</div>
          ) : (
            <ul className="list-none p-0 m-0 max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <li 
                  key={n.id} 
                  className="py-3 px-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className={`${n.lu ? 'font-normal' : 'font-bold'} text-gray-900 dark:text-white text-sm leading-relaxed whitespace-normal break-words`}>
                    {n.message.length > 100 ? `${n.message.substring(0, 100)}...` : n.message}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(n.date).toLocaleString()}
                  </div>
                  {!n.lu && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}