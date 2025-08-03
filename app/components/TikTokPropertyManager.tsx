'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Link, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
  Upload,
  Settings
} from 'lucide-react';

interface Property {
  property_id: string;
  property_type: 'domain' | 'url_prefix';
  property_value: string;
  property_status: number;
  status_text: string;
  is_verified: boolean;
  created_time: string;
  updated_time: string;
}

export default function TikTokPropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertyType, setPropertyType] = useState<'domain' | 'url_prefix'>('domain');
  const [propertyValue, setPropertyValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les propriétés existantes
  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/property/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      } else {
        setError('Erreur lors du chargement des propriétés');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une nouvelle propriété
  const addProperty = async () => {
    if (!propertyValue.trim()) {
      setError('Veuillez entrer une valeur');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tiktok/property/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`
        },
        body: JSON.stringify({
          property_type: propertyType,
          property_value: propertyValue
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Propriété ajoutée avec succès');
        setPropertyValue('');
        setShowAddForm(false);
        loadProperties();
        
        // Afficher les instructions de vérification
        if (propertyType === 'domain') {
          alert(`Pour vérifier votre domaine, ajoutez un enregistrement TXT DNS avec la valeur : ${data.signature}`);
        } else {
          alert(`Pour vérifier votre URL prefix, téléchargez un fichier nommé "${data.file_name}" contenant : ${data.signature}`);
        }
      } else {
        setError(data.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier une propriété
  const verifyProperty = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/property/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`
        },
        body: JSON.stringify({ property_id: propertyId })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.is_verified) {
          setSuccess('Propriété vérifiée avec succès !');
        } else {
          setError('Propriété non vérifiée. Veuillez compléter la vérification.');
        }
        loadProperties();
      } else {
        setError(data.error || 'Erreur lors de la vérification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 0:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 2:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestion des Propriétés URL
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez vos domaines et URLs vérifiés pour publier des vidéos
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une propriété
        </button>
      </div>

      {/* Messages d'erreur/succès */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
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

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Ajouter une nouvelle propriété
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de propriété
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPropertyType('domain')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    propertyType === 'domain'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Domaine</div>
                      <div className="text-xs text-gray-500">exemple.com</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPropertyType('url_prefix')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    propertyType === 'url_prefix'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Link className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">URL Prefix</div>
                      <div className="text-xs text-gray-500">https://exemple.com/videos/</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {propertyType === 'domain' ? 'Domaine' : 'URL Prefix'}
              </label>
              <input
                type="text"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                placeholder={propertyType === 'domain' ? 'exemple.com' : 'https://exemple.com/videos/'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addProperty}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Ajout en cours...
                  </div>
                ) : (
                  'Ajouter la propriété'
                )}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des propriétés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Propriétés configurées
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Aucune propriété configurée. Ajoutez votre premier domaine ou URL prefix.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.property_id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {property.property_type === 'domain' ? (
                        <Globe className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Link className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {property.property_value}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.property_type === 'domain' ? 'Domaine' : 'URL Prefix'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(property.property_status)}
                      <span className={`text-sm font-medium ${
                        property.is_verified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {property.status_text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Ajouté le {new Date(property.created_time).toLocaleDateString()}
                    </div>
                    {!property.is_verified && (
                      <button
                        onClick={() => verifyProperty(property.property_id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Vérifier
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Comment vérifier vos propriétés ?
            </h5>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Pour les domaines :</strong> Ajoutez un enregistrement TXT DNS avec la signature fournie.</p>
              <p><strong>Pour les URL prefixes :</strong> Téléchargez un fichier de vérification à l'URL spécifiée.</p>
              <p><strong>Important :</strong> Seules les URLs vérifiées peuvent être utilisées pour publier des vidéos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 