'use client';

import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Settings, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
  RefreshCw,
  Copy,
  ExternalLink,
  Info,
  Zap
} from 'lucide-react';

interface WebhookEvent {
  type: string;
  publish_id: string;
  post_id?: string;
  reason?: string;
  timestamp: string;
  user_openid: string;
}

interface TikTokWebhookManagerProps {
  businessId: string;
}

export default function TikTokWebhookManager({ businessId }: TikTokWebhookManagerProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  // Événements supportés
  const supportedEvents = [
    {
      type: 'post.publish.failed',
      name: 'Publication échouée',
      description: 'La publication a échoué en raison de violations de contraintes',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      color: 'text-red-600'
    },
    {
      type: 'post.publish.complete',
      name: 'Publication terminée',
      description: 'La publication a été téléchargée et traitée avec succès',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      color: 'text-green-600'
    },
    {
      type: 'post.publish.publicly_available',
      name: 'Publication publique',
      description: 'La publication est maintenant disponible au public',
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      color: 'text-blue-600'
    },
    {
      type: 'post.publish.no_longer_publicly_available',
      name: 'Publication privée',
      description: 'La publication n\'est plus accessible au public',
      icon: <Lock className="w-5 h-5 text-yellow-500" />,
      color: 'text-yellow-600'
    }
  ];

  // Configurer le webhook
  const configureWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/webhook/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          webhook_secret: webhookSecret
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Webhook configuré avec succès');
        setIsConfigured(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la configuration');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Générer une URL de webhook
  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin;
    const webhookUrl = `${baseUrl}/api/tiktok/webhook/receive`;
    setWebhookUrl(webhookUrl);
  };

  // Copier l'URL du webhook
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setSuccess('URL du webhook copiée dans le presse-papiers');
  };

  // Générer un secret
  const generateSecret = () => {
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setWebhookSecret(secret);
  };

  // Simuler un événement webhook (pour les tests)
  const simulateWebhookEvent = (eventType: string) => {
    const mockEvent: WebhookEvent = {
      type: eventType,
      publish_id: `test_${Date.now()}`,
      post_id: eventType.includes('publicly') ? `post_${Date.now()}` : undefined,
      reason: eventType === 'post.publish.failed' ? 'file_format_check_failed' : undefined,
      timestamp: new Date().toISOString(),
      user_openid: 'test_user_openid'
    };

    setEvents(prev => [mockEvent, ...prev.slice(0, 9)]); // Garder les 10 derniers
    setSuccess(`Événement ${eventType} simulé`);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const getEventIcon = (eventType: string) => {
    const event = supportedEvents.find(e => e.type === eventType);
    return event?.icon || <Info className="w-4 h-4" />;
  };

  const getEventColor = (eventType: string) => {
    const event = supportedEvents.find(e => e.type === eventType);
    return event?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestion des Webhooks TikTok
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configurez les webhooks pour recevoir des notifications en temps réel
          </p>
        </div>
        <Webhook className="w-6 h-6 text-pink-500" />
      </div>

      {/* Messages d'erreur/succès */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Configuration du webhook */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Configuration du Webhook
        </h4>
        
        <div className="space-y-4">
          {/* URL du webhook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL du Webhook
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://votre-domaine.com/api/tiktok/webhook/receive"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={generateWebhookUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Générer
              </button>
              <button
                onClick={copyWebhookUrl}
                disabled={!webhookUrl}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secret du webhook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secret du Webhook (optionnel)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Secret pour signer les webhooks"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={generateSecret}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Générer
              </button>
            </div>
          </div>

          {/* Bouton de configuration */}
          <button
            onClick={configureWebhook}
            disabled={loading || !webhookUrl}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Configuration en cours...
              </>
            ) : (
              <>
                <Webhook className="w-4 h-4 mr-2" />
                Configurer le Webhook
              </>
            )}
          </button>
        </div>
      </div>

      {/* Événements supportés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Événements Supportés
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportedEvents.map((event) => (
            <div
              key={event.type}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-2">
                {event.icon}
                <h5 className={`font-medium ${event.color}`}>
                  {event.name}
                </h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {event.description}
              </p>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {event.type}
                </code>
                <button
                  onClick={() => simulateWebhookEvent(event.type)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Tester
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Événements récents */}
      {events.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Événements Récents
          </h4>
          
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className={`font-medium ${getEventColor(event.type)}`}>
                        {event.type}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {event.publish_id}
                  </div>
                </div>
                {event.reason && (
                  <div className="mt-2 text-xs text-red-600">
                    Raison: {event.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Comment fonctionnent les webhooks ?
            </h5>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• TikTok envoie des notifications en temps réel à votre URL</p>
              <p>• Les événements incluent le statut des publications</p>
              <p>• Configurez votre URL pour recevoir ces notifications</p>
              <p>• Utilisez le secret pour sécuriser les webhooks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 