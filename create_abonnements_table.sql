-- =====================================================
-- CRÉATION DE LA TABLE ABONNEMENTS
-- =====================================================
-- Copiez ce script et exécutez-le dans le SQL Editor de Supabase

-- Création de la table abonnements
CREATE TABLE IF NOT EXISTS abonnements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_abonnements_user_id ON abonnements(user_id);
CREATE INDEX IF NOT EXISTS idx_abonnements_status ON abonnements(status);

-- Activer RLS (Row Level Security)
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- Politique pour les abonnements (utilisateur peut voir ses propres abonnements)
CREATE POLICY "Users can view own subscriptions" ON abonnements
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own subscriptions" ON abonnements
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON abonnements
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Insérer un abonnement de test (optionnel)
INSERT INTO abonnements (id, user_id, type, status, start_date, created_at)
VALUES (
    'test-subscription-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'test-user-id',
    'premium',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Vérifier que la table a été créée
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'abonnements' 
ORDER BY ordinal_position; 