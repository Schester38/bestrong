"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const [confirm, setConfirm] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    show: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlert({ show: true, message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirm({
      show: true,
      message,
      onConfirm: () => {
        setConfirm(prev => ({ ...prev, show: false }));
        onConfirm();
      },
      onCancel: () => {
        setConfirm(prev => ({ ...prev, show: false }));
        onCancel?.();
      }
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500 hover:bg-green-600';
      case 'error': return 'bg-red-500 hover:bg-red-600';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Alert Modal */}
      {alert.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getAlertIcon(alert.type)}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {alert.type === 'success' ? 'Succès' : 
                 alert.type === 'error' ? 'Erreur' : 
                 alert.type === 'warning' ? 'Attention' : 'Information'}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
              {alert.message}
            </p>
            <button
              onClick={closeAlert}
              className={`w-full text-white py-2 px-4 rounded-lg font-semibold transition-colors ${getAlertColor(alert.type)}`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">❓</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmation
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {confirm.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirm.onCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirm.onConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
} 