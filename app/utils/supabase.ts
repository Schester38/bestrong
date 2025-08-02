import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== CONFIGURATION SUPABASE ===')
console.log('URL:', supabaseUrl)
console.log('Key (premiers caractères):', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Manquante')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test de connexion amélioré
export async function testSupabaseConnection() {
  try {
    const result = await supabase.from('users').select('count').limit(1)
    if (result.error) {
      console.error('❌ Erreur de connexion Supabase:', result.error.message)
      
      // Messages d'erreur spécifiques
      if (result.error.message.includes('JWT')) {
        console.error('🔑 Problème avec les clés d\'API - Vérifiez vos variables d\'environnement')
      } else if (result.error.message.includes('timeout') || result.error.message.includes('network')) {
        console.error('🌐 Problème de réseau ou projet en pause - Vérifiez le statut de votre projet Supabase')
      } else if (result.error.message.includes('relation') || result.error.message.includes('table')) {
        console.error('📊 Table manquante - Exécutez l\'initialisation des tables')
      }
      
      return { success: false, error: result.error }
    } else {
      console.log('✅ Connexion Supabase réussie')
      return { success: true }
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error)
    return { success: false, error }
  }
}

// Test de connexion au démarrage
testSupabaseConnection() 