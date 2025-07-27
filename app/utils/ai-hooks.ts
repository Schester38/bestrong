import { useState, useCallback } from 'react';
import { beStrongAI } from './ai-features';

// Hook pour l'analyse IA
export const useAIAnalysis = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (userId: string, content?: string, category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await beStrongAI.getCompleteAnalysis(userId, content);
      setAnalysis(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse IA';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analysis,
    loading,
    error,
    runAnalysis,
    clearError: () => setError(null)
  };
};

// Hook pour les suggestions de contenu
export const useContentSuggestions = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await beStrongAI.getPersonalizedRecommendations(userId);
      setSuggestions(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération des suggestions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearError: () => setError(null)
  };
};

// Hook pour l'optimisation de contenu
export const useContentOptimization = () => {
  const [optimization, setOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeContent = useCallback(async (content: string, category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await beStrongAI.optimizeContent(content, category);
      setOptimization(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'optimisation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    optimization,
    loading,
    error,
    optimizeContent,
    clearError: () => setError(null)
  };
};

// Hook pour les hashtags
export const useHashtagGeneration = () => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHashtags = useCallback(async (content: string, category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category })
      });
      
      const data = await response.json();
      if (data.success) {
        setHashtags(data.hashtags);
        return data.hashtags;
      } else {
        throw new Error(data.error || 'Erreur lors de la génération des hashtags');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération des hashtags';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hashtags,
    loading,
    error,
    generateHashtags,
    clearError: () => setError(null)
  };
};

// Hook pour les heures de posting
export const usePostingTimes = () => {
  const [postingTimes, setPostingTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOptimalTimes = useCallback(async (userTimezone: string = 'Europe/Paris') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'temp_user', userTimezone })
      });
      
      const data = await response.json();
      if (data.success) {
        setPostingTimes(data.analysis.bestPostingTimes);
        return data.analysis.bestPostingTimes;
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des heures optimales');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des heures optimales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    postingTimes,
    loading,
    error,
    getOptimalTimes,
    clearError: () => setError(null)
  };
};

// Hook utilitaire pour copier dans le presse-papiers
export const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      return false;
    }
  }, []);

  return {
    copied,
    copyToClipboard
  };
}; 