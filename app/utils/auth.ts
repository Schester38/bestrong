export interface User {
  id: string;
  phone: string;
  credits: number;
  pseudo?: string;
  createdAt: string;
  updatedAt: string;
  dateInscription?: string;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  // Essayer d'abord 'currentUser' (nouveau format)
  let userStr = localStorage.getItem('currentUser');
  if (!userStr) {
    // Fallback vers 'user' (ancien format)
    userStr = localStorage.getItem('user');
  }
  
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');
  window.location.href = '/';
}

export function requireAuth(): User {
  const user = getCurrentUser();
  if (!user) {
    logout();
    throw new Error('Utilisateur non authentifié');
  }
  return user;
} 