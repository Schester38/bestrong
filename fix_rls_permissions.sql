-- =====================================================
-- CORRECTION DES PERMISSIONS RLS POUR LA TABLE ABONNEMENTS
-- =====================================================
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Vérifier l'état actuel de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'abonnements';

-- 2. Vérifier les politiques existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'abonnements';

-- 3. Supprimer toutes les politiques existantes (si elles existent)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON abonnements;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON abonnements;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON abonnements;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON abonnements;

-- 4. Désactiver temporairement RLS pour les tests
ALTER TABLE abonnements DISABLE ROW LEVEL SECURITY;

-- 5. Tester l'accès sans RLS
SELECT COUNT(*) FROM abonnements;

-- 6. Réactiver RLS
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- 7. Créer des politiques plus permissives pour le développement
-- Politique pour permettre la lecture à tous (temporaire)
CREATE POLICY "Allow all reads" ON abonnements
    FOR SELECT USING (true);

-- Politique pour permettre l'insertion (temporaire)
CREATE POLICY "Allow all inserts" ON abonnements
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour (temporaire)
CREATE POLICY "Allow all updates" ON abonnements
    FOR UPDATE USING (true);

-- 8. Vérifier que les nouvelles politiques sont créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'abonnements';

-- 9. Tester l'accès avec les nouvelles politiques
SELECT COUNT(*) FROM abonnements;

-- 10. Insérer une donnée de test pour vérifier
INSERT INTO abonnements (id, user_id, type, status, start_date, created_at)
VALUES (
    'test-rls-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'test-user-rls',
    'dashboard_access',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 11. Vérifier que l'insertion a fonctionné
SELECT * FROM abonnements WHERE id LIKE 'test-rls-%';

-- 12. Nettoyer les données de test
DELETE FROM abonnements WHERE id LIKE 'test-rls-%'; 