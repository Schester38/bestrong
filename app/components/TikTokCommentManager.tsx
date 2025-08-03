'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Heart, 
  HeartOff, 
  Eye, 
  EyeOff, 
  Trash2,
  Reply,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface Comment {
  comment_id: string;
  text: string;
  create_time: string;
  like_count: number;
  reply_count: number;
  is_hidden: boolean;
  user: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  replies: Reply[];
}

interface Reply {
  comment_id: string;
  text: string;
  create_time: string;
  like_count: number;
  is_hidden: boolean;
  user: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface TikTokCommentManagerProps {
  videoId: string;
  businessId: string;
}

export default function TikTokCommentManager({ videoId, businessId }: TikTokCommentManagerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les commentaires
  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tiktok/comment/list?video_id=${videoId}&include_replies=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        setError('Erreur lors du chargement des commentaires');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau commentaire
  const createComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          video_id: videoId,
          text: newComment
        })
      });

      if (response.ok) {
        setSuccess('Commentaire créé avec succès');
        setNewComment('');
        loadComments();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Répondre à un commentaire
  const replyToComment = async (commentId: string) => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/comment/reply/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          video_id: videoId,
          comment_id: commentId,
          text: replyText
        })
      });

      if (response.ok) {
        setSuccess('Réponse créée avec succès');
        setReplyText('');
        setReplyingTo(null);
        loadComments();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création de la réponse');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Liker/Unliker un commentaire
  const toggleLike = async (commentId: string, currentLiked: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/comment/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: currentLiked ? 'UNLIKE' : 'LIKE'
        })
      });

      if (response.ok) {
        loadComments();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Cacher/Afficher un commentaire
  const toggleHide = async (commentId: string, isHidden: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/comment/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          video_id: videoId,
          comment_id: commentId,
          action: isHidden ? 'UNHIDE' : 'HIDE'
        })
      });

      if (response.ok) {
        loadComments();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un commentaire
  const deleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/comment/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          video_id: videoId,
          comment_id: commentId
        })
      });

      if (response.ok) {
        setSuccess('Commentaire supprimé avec succès');
        loadComments();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestion des Commentaires
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez les commentaires de votre vidéo TikTok
          </p>
        </div>
        <button
          onClick={loadComments}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
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

      {/* Formulaire de nouveau commentaire */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Ajouter un commentaire
        </h4>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre commentaire..."
            maxLength={150}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={createComment}
            disabled={loading || !newComment.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {newComment.length}/150 caractères
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun commentaire pour le moment.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.comment_id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${
                comment.is_hidden ? 'opacity-60' : ''
              }`}
            >
              {/* Commentaire principal */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user.display_name || comment.user.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.create_time)}
                    </span>
                    {comment.is_hidden && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Caché
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {comment.text}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleLike(comment.comment_id, false)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{comment.like_count}</span>
                    </button>
                    
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span className="text-sm">Répondre</span>
                    </button>
                    
                    <button
                      onClick={() => toggleHide(comment.comment_id, comment.is_hidden)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-yellow-500 transition-colors"
                    >
                      {comment.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="text-sm">{comment.is_hidden ? 'Afficher' : 'Cacher'}</span>
                    </button>
                    
                    <button
                      onClick={() => deleteComment(comment.comment_id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Supprimer</span>
                    </button>
                  </div>

                  {/* Formulaire de réponse */}
                  {replyingTo === comment.comment_id && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Écrivez votre réponse..."
                          maxLength={150}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => replyToComment(comment.comment_id)}
                          disabled={loading || !replyText.trim()}
                          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                        >
                          Répondre
                        </button>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Réponses */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.comment_id}
                          className={`ml-8 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                            reply.is_hidden ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {reply.user.display_name || reply.user.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.create_time)}
                            </span>
                            {reply.is_hidden && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Caché
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                            {reply.text}
                          </p>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleLike(reply.comment_id, false)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors text-xs"
                            >
                              <Heart className="w-3 h-3" />
                              <span>{reply.like_count}</span>
                            </button>
                            <button
                              onClick={() => toggleHide(reply.comment_id, reply.is_hidden)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-yellow-500 transition-colors text-xs"
                            >
                              {reply.is_hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{reply.is_hidden ? 'Afficher' : 'Cacher'}</span>
                            </button>
                            <button
                              onClick={() => deleteComment(reply.comment_id)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 