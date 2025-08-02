-- =====================================================
-- RENOMMAGE DE LA TABLE ABONNEMENT VERS ABONNEMENTS
-- =====================================================
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Vérifier que la table 'abonnement' existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('abonnement', 'abonnements');

-- 2. Renommer la table de 'abonnement' vers 'abonnements'
ALTER TABLE abonnement RENAME TO abonnements;

-- 3. Vérifier que le renommage a fonctionné
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'abonnements';

-- 4. Vérifier la structure de la table renommée
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'abonnements'
ORDER BY ordinal_position;

-- 5. Tester l'accès à la table renommée
SELECT COUNT(*) FROM abonnements;

-- 6. Vérifier les politiques RLS (si elles existent)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'abonnements'; 