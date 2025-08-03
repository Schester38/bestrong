'use client';

import React from 'react';
import { 
  Clock, 
  Zap, 
  AlertTriangle, 
  Info,
  TrendingUp,
  Eye,
  Users,
  Globe,
  BarChart3
} from 'lucide-react';

interface LatencyInfoProps {
  dataType: 'business' | 'video';
  realTimeFields: string[];
  delayedFields: string[];
  lastUpdate?: string;
}

export default function TikTokLatencyInfo({ 
  dataType, 
  realTimeFields, 
  delayedFields, 
  lastUpdate 
}: LatencyInfoProps) {
  const getFieldIcon = (field: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      username: <Users className="w-4 h-4" />,
      display_name: <Users className="w-4 h-4" />,
      profile_image: <Eye className="w-4 h-4" />,
      followers_count: <TrendingUp className="w-4 h-4" />,
      video_views: <Eye className="w-4 h-4" />,
      likes: <TrendingUp className="w-4 h-4" />,
      comments: <BarChart3 className="w-4 h-4" />,
      shares: <BarChart3 className="w-4 h-4" />,
      audience_countries: <Globe className="w-4 h-4" />,
      item_id: <Info className="w-4 h-4" />,
      create_time: <Clock className="w-4 h-4" />,
      thumbnail_url: <Eye className="w-4 h-4" />,
      share_url: <Info className="w-4 h-4" />,
      embed_url: <Info className="w-4 h-4" />,
      caption: <Info className="w-4 h-4" />
    };
    return iconMap[field] || <Info className="w-4 h-4" />;
  };

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center space-x-3">
        <Clock className="w-6 h-6 text-blue-500" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Informations de Latence - {dataType === 'business' ? 'Compte Business' : 'Vidéos'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestion intelligente des données selon leur latence
          </p>
        </div>
      </div>

      {/* Données en temps réel */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-green-500" />
          <h5 className="font-medium text-green-900 dark:text-green-100">
            Données en Temps Réel
          </h5>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Aucune latence
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {realTimeFields.map((field) => (
            <div key={field} className="flex items-center space-x-2 text-sm">
              {getFieldIcon(field)}
              <span className="text-green-800 dark:text-green-200">
                {formatFieldName(field)}
              </span>
            </div>
          ))}
        </div>
        {lastUpdate && (
          <div className="mt-3 text-xs text-green-700 dark:text-green-300">
            Dernière mise à jour : {new Date(lastUpdate).toLocaleString('fr-FR')}
          </div>
        )}
      </div>

      {/* Données avec latence */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h5 className="font-medium text-yellow-900 dark:text-yellow-100">
            Données avec Latence
          </h5>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            24-48h
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {delayedFields.map((field) => (
            <div key={field} className="flex items-center space-x-2 text-sm">
              {getFieldIcon(field)}
              <span className="text-yellow-800 dark:text-yellow-200">
                {formatFieldName(field)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-300">
          ⚠️ Ces données peuvent avoir un délai de 24 à 48 heures (UTC)
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Recommandations d'Optimisation
            </h5>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• <strong>Cache en temps réel :</strong> Mettre en cache les données sans latence</p>
              <p>• <strong>Actualisation différée :</strong> Actualiser les données avec latence toutes les 24h</p>
              <p>• <strong>Indicateurs visuels :</strong> Différencier les données récentes des données anciennes</p>
              <p>• <strong>Gestion d'erreur :</strong> Gérer les cas où les données ne sont pas encore disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau de référence */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
          Tableau de Référence - Latence des Données
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                  Endpoint
                </th>
                <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                  Champs
                </th>
                <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                  Latence
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  /business/get/
                </td>
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  username, display_name, profile_image, followers_count
                </td>
                <td className="py-2">
                  <span className="text-green-600 dark:text-green-400">Aucune</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  /business/get/
                </td>
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  audience_countries, likes, comments, shares, profile_views
                </td>
                <td className="py-2">
                  <span className="text-yellow-600 dark:text-yellow-400">24-48h</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  /business/video/list/
                </td>
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  item_id, create_time, thumbnail_url, share_url, caption
                </td>
                <td className="py-2">
                  <span className="text-green-600 dark:text-green-400">Aucune</span>
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  /business/video/list/
                </td>
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  video_views, likes, comments, shares, reach, audience_countries
                </td>
                <td className="py-2">
                  <span className="text-yellow-600 dark:text-yellow-400">24-48h</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 