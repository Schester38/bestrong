-- =====================================================
-- CORRECTION DE LA TABLE ABONNEMENTS
-- =====================================================
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Supprimer la table si elle existe (attention aux données !)
DROP TABLE IF EXISTS abonnements CASCADE;

-- 2. Recréer la table avec la bonne structure
CREATE TABLE abonnements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'dashboard_access',
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index
CREATE INDEX idx_abonnements_user_id ON abonnements(user_id);
CREATE INDEX idx_abonnements_status ON abonnements(status);
CREATE INDEX idx_abonnements_type ON abonnements(type);

-- 4. Activer RLS
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
CREATE POLICY "Users can view own subscriptions" ON abonnements
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own subscriptions" ON abonnements
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON abonnements
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 6. Politique pour l'admin (lecture de tous les abonnements)
CREATE POLICY "Admin can view all subscriptions" ON abonnements
    FOR SELECT USING (auth.role() = 'service_role');

-- 7. Insérer une donnée de test
INSERT INTO abonnements (id, user_id, type, status, start_date, created_at)
VALUES (
    'test-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'test-user-id',
    'dashboard_access',
    'active',
    NOW(),
    NOW()
);

-- 8. Vérifier que la table a été créée
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'abonnements' 
ORDER BY ordinal_position;

-- 9. Vérifier les politiques RLS
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

-- 10. Tester l'accès
SELECT * FROM abonnements LIMIT 5; 