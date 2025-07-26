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

// Test de connexion
supabase.from('users').select('count').limit(1).then(
  (result) => {
    console.log('Test de connexion Supabase:', result.error ? 'ÉCHEC' : 'SUCCÈS')
    if (result.error) {
      console.error('Erreur de connexion:', result.error)
    }
  }
) 