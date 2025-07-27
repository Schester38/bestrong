'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Hash, Clock, TrendingUp, Music, Filter, Sparkles, BarChart3, Zap, Target, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function AIDashboardWidget({ userId }: { userId: string }) {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [postingTimes, setPostingTimes] = useState<string[]>([]);
  const [trendingAnalysis, setTrendingAnalysis] = useState<any>(null);
  const [musicSuggestions, setMusicSuggestions] = useState<string[]>([]);
  const [filterSuggestions, setFilterSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('hashtags');
  const [lastUpdated, setLastUpdated] = useState<{ [key: string]: Date }>({});

  const generateHashtags = async () => {
    console.log('🔄 Génération de hashtags...');
    console.log('📍 URL appelée:', '/api/ai/hashtags');
    console.log('📤 Données envoyées:', { content: 'Contenu TikTok', category: 'lifestyle' });
    setLoading(true);
    try {
      const response = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Contenu TikTok', category: 'lifestyle' })
      });
      console.log('📡 Status de la réponse:', response.status);
      console.log('📡 Headers de la réponse:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📊 Réponse hashtags complète:', data);
      console.log('📊 data.success:', data.success);
      console.log('📊 data.hashtags:', data.hashtags);
      console.log('📊 data.data:', data.data);
      
      if (data.success && (data.hashtags || data.data)) {
        const hashtagsToSet = data.hashtags || data.data;
        setHashtags(hashtagsToSet);
        setLastUpdated(prev => ({ ...prev, hashtags: new Date() }));
        console.log('✅ Hashtags mis à jour:', hashtagsToSet);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        const defaultHashtags = ['#fyp', '#foryou', '#viral', '#trending', '#tiktok', '#shorts', '#reels'];
        setHashtags(defaultHashtags);
        setLastUpdated(prev => ({ ...prev, hashtags: new Date() }));
        console.log('⚠️ Utilisation des hashtags par défaut:', defaultHashtags);
      }
    } catch (error) {
      console.error('❌ Erreur hashtags:', error);
      // Valeurs par défaut en cas d'erreur
      const defaultHashtags = ['#fyp', '#foryou', '#viral', '#trending', '#tiktok', '#shorts', '#reels'];
      setHashtags(defaultHashtags);
      setLastUpdated(prev => ({ ...prev, hashtags: new Date() }));
      console.log('🔄 Utilisation des hashtags par défaut après erreur:', defaultHashtags);
    } finally {
      setLoading(false);
      console.log('🏁 Génération de hashtags terminée');
    }
  };

  const getPostingTimes = async () => {
    console.log('🔄 Récupération des heures optimales...');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      console.log('📊 Réponse heures:', data);
      if (data.success && data.analysis && data.analysis.bestPostingTimes) {
        setPostingTimes(data.analysis.bestPostingTimes);
        setLastUpdated(prev => ({ ...prev, times: new Date() }));
        console.log('✅ Heures mises à jour:', data.analysis.bestPostingTimes);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        const defaultTimes = ['18:00', '19:00', '20:00', '21:00', '22:00'];
        setPostingTimes(defaultTimes);
        setLastUpdated(prev => ({ ...prev, times: new Date() }));
        console.log('⚠️ Utilisation des heures par défaut:', defaultTimes);
      }
    } catch (error) {
      console.error('❌ Erreur heures:', error);
      // Valeurs par défaut en cas d'erreur
      const defaultTimes = ['18:00', '19:00', '20:00', '21:00', '22:00'];
      setPostingTimes(defaultTimes);
      setLastUpdated(prev => ({ ...prev, times: new Date() }));
      console.log('🔄 Utilisation des heures par défaut après erreur:', defaultTimes);
    } finally {
      setLoading(false);
      console.log('🏁 Récupération des heures terminée');
    }
  };

  const getTrendingAnalysis = async () => {
    console.log('🔄 Récupération des tendances...');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/trending');
      const data = await response.json();
      console.log('📊 Réponse tendances:', data);
      if (data.success && data.data) {
        setTrendingAnalysis(data.data);
        setLastUpdated(prev => ({ ...prev, trending: new Date() }));
        console.log('✅ Tendances mises à jour:', data.data);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        const defaultTrending = {
          trendingHashtags: ['#fyp', '#foryou', '#viral', '#trending'],
          viralSounds: ['Viral Sound 1', 'Trending Beat'],
          popularFilters: ['Vintage', 'Retro', 'Neon'],
          emergingTrends: ['AI content', 'Sustainability']
        };
        setTrendingAnalysis(defaultTrending);
        setLastUpdated(prev => ({ ...prev, trending: new Date() }));
        console.log('⚠️ Utilisation des tendances par défaut:', defaultTrending);
      }
    } catch (error) {
      console.error('❌ Erreur tendances:', error);
      // Valeurs par défaut en cas d'erreur
      const defaultTrending = {
        trendingHashtags: ['#fyp', '#foryou', '#viral', '#trending'],
        viralSounds: ['Viral Sound 1', 'Trending Beat'],
        popularFilters: ['Vintage', 'Retro', 'Neon'],
        emergingTrends: ['AI content', 'Sustainability']
      };
      setTrendingAnalysis(defaultTrending);
      setLastUpdated(prev => ({ ...prev, trending: new Date() }));
      console.log('🔄 Utilisation des tendances par défaut après erreur:', defaultTrending);
    } finally {
      setLoading(false);
      console.log('🏁 Récupération des tendances terminée');
    }
  };

  const getMusicSuggestions = async () => {
    console.log('🔄 Génération de suggestions musicales...');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/music-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Contenu TikTok lifestyle', mood: 'energetic' })
      });
      const data = await response.json();
      console.log('📊 Réponse musique:', data);
      if (data.success && data.suggestions) {
        setMusicSuggestions(data.suggestions);
        setLastUpdated(prev => ({ ...prev, music: new Date() }));
        console.log('✅ Suggestions musicales mises à jour:', data.suggestions);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        const defaultMusic = [
          'TikTok Viral Song 2024', 'Trending Beat', 'Popular Remix', 'Dance Challenge Music',
          'Motivation Mix', 'Workout Beat', 'Chill Vibes', 'Energy Boost', 'Focus Music',
          'Party Anthem', 'Relaxing Tunes', 'Upbeat Rhythm'
        ];
        setMusicSuggestions(defaultMusic);
        setLastUpdated(prev => ({ ...prev, music: new Date() }));
        console.log('⚠️ Utilisation des suggestions musicales par défaut:', defaultMusic);
      }
    } catch (error) {
      console.error('❌ Erreur musique:', error);
      // Valeurs par défaut en cas d'erreur
      const defaultMusic = [
        'TikTok Viral Song 2024', 'Trending Beat', 'Popular Remix', 'Dance Challenge Music',
        'Motivation Mix', 'Workout Beat', 'Chill Vibes', 'Energy Boost', 'Focus Music',
        'Party Anthem', 'Relaxing Tunes', 'Upbeat Rhythm'
      ];
      setMusicSuggestions(defaultMusic);
      setLastUpdated(prev => ({ ...prev, music: new Date() }));
      console.log('🔄 Utilisation des suggestions musicales par défaut après erreur:', defaultMusic);
    } finally {
      setLoading(false);
      console.log('🏁 Génération de suggestions musicales terminée');
    }
  };

  const getFilterSuggestions = async () => {
    console.log('🔄 Génération de suggestions de filtres...');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/filter-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Contenu TikTok lifestyle' })
      });
      const data = await response.json();
      console.log('📊 Réponse filtres:', data);
      if (data.success && data.suggestions) {
        setFilterSuggestions(data.suggestions);
        setLastUpdated(prev => ({ ...prev, filters: new Date() }));
        console.log('✅ Suggestions de filtres mises à jour:', data.suggestions);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        const defaultFilters = [
          'Vintage', 'Retro', 'Neon', 'Glamour', 'Natural', 'Warm', 'Cool', 'Bright',
          'Moody', 'Clean', 'Artistic', 'Professional', 'Bold', 'Soft', 'Dramatic'
        ];
        setFilterSuggestions(defaultFilters);
        setLastUpdated(prev => ({ ...prev, filters: new Date() }));
        console.log('⚠️ Utilisation des filtres par défaut:', defaultFilters);
      }
    } catch (error) {
      console.error('❌ Erreur filtres:', error);
      // Valeurs par défaut en cas d'erreur
      const defaultFilters = [
        'Vintage', 'Retro', 'Neon', 'Glamour', 'Natural', 'Warm', 'Cool', 'Bright',
        'Moody', 'Clean', 'Artistic', 'Professional', 'Bold', 'Soft', 'Dramatic'
      ];
      setFilterSuggestions(defaultFilters);
      setLastUpdated(prev => ({ ...prev, filters: new Date() }));
      console.log('🔄 Utilisation des filtres par défaut après erreur:', defaultFilters);
    } finally {
      setLoading(false);
      console.log('🏁 Génération de suggestions de filtres terminée');
    }
  };

  useEffect(() => {
    generateHashtags();
    getPostingTimes();
    getTrendingAnalysis();
    getMusicSuggestions(); // Add this line to fetch music suggestions
    getFilterSuggestions(); // Add this line to fetch filter suggestions
  }, []);

  const features = [
    { id: 'hashtags', name: 'Hashtags', icon: Hash, color: 'purple' },
    { id: 'times', name: 'Heures', icon: Clock, color: 'green' },
    { id: 'trending', name: 'Tendances', icon: TrendingUp, color: 'blue' },
    { id: 'music', name: 'Musique', icon: Music, color: 'pink' },
    { id: 'filters', name: 'Filtres', icon: Filter, color: 'orange' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Assistant IA
        </h3>
        <Link 
          href="/ai" 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 text-sm"
        >
          IA Complète
        </Link>
      </div>

      {/* Navigation des fonctionnalités */}
      <div className="flex flex-wrap gap-1 mb-4">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className={`flex items-center gap-1 px-4 py-3 rounded-lg text-sm font-medium transition-all min-w-[80px] justify-center ${
              activeFeature === feature.id
                ? `bg-${feature.color}-500 text-white shadow-lg scale-105`
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <feature.icon className="w-4 h-4" />
            <span className="hidden md:inline">{feature.name}</span>
            <span className="md:hidden text-xs">
              {feature.id === 'hashtags' && 'Tags'}
              {feature.id === 'times' && 'Heures'}
              {feature.id === 'trending' && 'Trends'}
              {feature.id === 'music' && 'Music'}
              {feature.id === 'filters' && 'Filtres'}
            </span>
          </button>
        ))}
      </div>

      {/* Contenu dynamique */}
      <div className="space-y-4">
        {activeFeature === 'hashtags' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-500" />
                Hashtags Recommandés
                {lastUpdated.hashtags && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    ✓ Mis à jour
                  </span>
                )}
              </h4>
              <button
                onClick={() => {
                  console.log('🎯 Bouton Actualiser hashtags cliqué !');
                  generateHashtags();
                }}
                disabled={loading}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="hidden md:inline">Génération...</span>
                    <span className="md:hidden text-xs">...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden md:inline">Actualiser</span>
                    <span className="md:hidden text-xs">Rafraîchir</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(hashtags || []).slice(0, 8).map((hashtag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs"
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeFeature === 'times' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                Heures Optimales
                {lastUpdated.times && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    ✓ Mis à jour
                  </span>
                )}
              </h4>
              <button
                onClick={getPostingTimes}
                disabled={loading}
                className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="hidden md:inline">Actualisation...</span>
                    <span className="md:hidden text-xs">...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span className="hidden md:inline">Actualiser</span>
                    <span className="md:hidden text-xs">Rafraîchir</span>
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(postingTimes || []).slice(0, 6).map((time, index) => (
                <div
                  key={index}
                  className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-center text-sm font-medium"
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeFeature === 'trending' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Tendances Actuelles
                {lastUpdated.trending && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    ✓ Mis à jour
                  </span>
                )}
              </h4>
              <button
                onClick={getTrendingAnalysis}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="hidden md:inline">Actualisation...</span>
                    <span className="md:hidden text-xs">...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden md:inline">Actualiser</span>
                    <span className="md:hidden text-xs">Rafraîchir</span>
                  </>
                )}
              </button>
            </div>
            {trendingAnalysis && (
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-2">Hashtags Tendances:</h5>
                  <div className="flex flex-wrap gap-1">
                    {(trendingAnalysis.trendingHashtags || []).slice(0, 4).map((hashtag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded text-xs"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Sons Viraux:</h5>
                  <div className="space-y-1">
                    {(trendingAnalysis.viralSounds || []).slice(0, 2).map((sound: string, index: number) => (
                      <div key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                        {sound}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeFeature === 'music' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-pink-500" />
                Suggestions Musicales
                {lastUpdated.music && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    ✓ Mis à jour
                  </span>
                )}
              </h4>
              <button
                onClick={getMusicSuggestions}
                disabled={loading}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                    <span className="hidden md:inline">Génération...</span>
                    <span className="md:hidden text-xs">...</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span className="hidden md:inline">Actualiser</span>
                    <span className="md:hidden text-xs">Rafraîchir</span>
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(musicSuggestions || []).slice(0, 4).map((music, index) => (
                <div key={index} className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-4 py-3 rounded-lg text-sm text-center">
                  {music}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeFeature === 'filters' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                Filtres Populaires
                {lastUpdated.filters && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    ✓ Mis à jour
                  </span>
                )}
              </h4>
              <button
                onClick={getFilterSuggestions}
                disabled={loading}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                    <span className="hidden md:inline">Génération...</span>
                    <span className="md:hidden text-xs">...</span>
                  </>
                ) : (
                  <>
                    <Filter className="w-4 h-4" />
                    <span className="hidden md:inline">Actualiser</span>
                    <span className="md:hidden text-xs">Rafraîchir</span>
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(filterSuggestions || []).slice(0, 4).map((filter, index) => (
                <div key={index} className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-4 py-3 rounded-lg text-sm text-center">
                  {filter}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          {activeFeature === 'hashtags' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">92%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Pertinence Hashtags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+45%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Portée Estimée</div>
              </div>
            </>
          )}
          
          {activeFeature === 'times' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Optimisation Horaires</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">+38%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Engagement Prédit</div>
              </div>
            </>
          )}
          
          {activeFeature === 'trending' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">94%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tendance Actuelle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">+52%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Viralité Potentielle</div>
              </div>
            </>
          )}
          
          {activeFeature === 'music' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">87%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Compatibilité Musicale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+41%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Rétention Auditive</div>
              </div>
            </>
          )}
          
          {activeFeature === 'filters' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">91%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Qualité Visuelle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">+47%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Impact Esthétique</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-4 space-y-2">
        <Link 
          href="/ai" 
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 text-center block"
        >
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Découvrir Plus d'IA
        </Link>
      </div>
    </div>
  );
} 