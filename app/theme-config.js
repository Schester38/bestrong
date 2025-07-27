// Configuration des couleurs et thème BE STRONG
export const themeConfig = {
  // Couleurs principales
  primary: {
    // Couleur principale (actuellement rose-violet)
    gradient: 'from-pink-500 to-purple-600',
    solid: '#ec4899', // rose-500
    light: '#f9a8d4', // rose-300
    dark: '#be185d', // rose-700
  },
  
  // Couleurs alternatives (à choisir)
  alternatives: {
    blue: {
      gradient: 'from-blue-500 to-indigo-600',
      solid: '#3b82f6',
      light: '#93c5fd',
      dark: '#1d4ed8',
    },
    green: {
      gradient: 'from-green-500 to-emerald-600',
      solid: '#10b981',
      light: '#6ee7b7',
      dark: '#047857',
    },
    orange: {
      gradient: 'from-orange-500 to-red-600',
      solid: '#f97316',
      light: '#fdba74',
      dark: '#dc2626',
    },
    purple: {
      gradient: 'from-purple-500 to-violet-600',
      solid: '#8b5cf6',
      light: '#c4b5fd',
      dark: '#7c3aed',
    },
  },
  
  // Couleurs de fond
  background: {
    primary: 'bg-gradient-to-br from-gray-900 to-gray-800',
    secondary: 'bg-white/80 backdrop-blur-md',
    dark: 'bg-gray-900/80',
  },
  
  // Typographie
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    heading: 'font-bold',
    body: 'font-medium',
  },
  
  // Bordures et ombres
  borders: {
    radius: 'rounded-full',
    border: 'border-gray-300 dark:border-gray-600',
  },
  
  // Animations
  animations: {
    transition: 'transition-all duration-200',
    hover: 'hover:shadow-lg',
  }
};

// Exemples de thèmes prédéfinis
export const themes = {
  default: {
    name: 'Rose-Violet (Actuel)',
    primary: themeConfig.primary,
    background: themeConfig.background,
  },
  blue: {
    name: 'Bleu Professionnel',
    primary: themeConfig.alternatives.blue,
    background: {
      primary: 'bg-gradient-to-br from-blue-900 to-indigo-800',
      secondary: 'bg-white/80 backdrop-blur-md',
      dark: 'bg-blue-900/80',
    },
  },
  green: {
    name: 'Vert Nature',
    primary: themeConfig.alternatives.green,
    background: {
      primary: 'bg-gradient-to-br from-green-900 to-emerald-800',
      secondary: 'bg-white/80 backdrop-blur-md',
      dark: 'bg-green-900/80',
    },
  },
  orange: {
    name: 'Orange Énergique',
    primary: themeConfig.alternatives.orange,
    background: {
      primary: 'bg-gradient-to-br from-orange-900 to-red-800',
      secondary: 'bg-white/80 backdrop-blur-md',
      dark: 'bg-orange-900/80',
    },
  },
  purple: {
    name: 'Violet Royal',
    primary: themeConfig.alternatives.purple,
    background: {
      primary: 'bg-gradient-to-br from-purple-900 to-violet-800',
      secondary: 'bg-white/80 backdrop-blur-md',
      dark: 'bg-purple-900/80',
    },
  },
}; 