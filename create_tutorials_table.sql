-- Création de la table des tutoriels
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB DEFAULT '[]',
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'new', 'premium')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tutorials_active ON tutorials(is_active);
CREATE INDEX IF NOT EXISTS idx_tutorials_audience ON tutorials(target_audience);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON tutorials(created_at);

-- RLS (Row Level Security) - Seuls les admins peuvent modifier
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (lecture et écriture)
CREATE POLICY "Admins can manage tutorials" ON tutorials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.phone = auth.jwt() ->> 'phone' 
            AND users.has_admin_access = true
        )
    );

-- Politique pour tous les utilisateurs (lecture seule des tutoriels actifs)
CREATE POLICY "Users can view active tutorials" ON tutorials
    FOR SELECT USING (is_active = true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_tutorials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_tutorials_updated_at
    BEFORE UPDATE ON tutorials
    FOR EACH ROW
    EXECUTE FUNCTION update_tutorials_updated_at();

-- Insertion de tutoriels par défaut
INSERT INTO tutorials (name, description, steps, target_audience, is_active) VALUES
(
    'Tutoriel de bienvenue',
    'Guide d''introduction pour les nouveaux utilisateurs',
    '[
        {
            "id": "welcome",
            "title": "Bienvenue sur BE STRONG !",
            "description": "Découvrez comment utiliser notre plateforme pour maximiser votre présence TikTok.",
            "position": "bottom",
            "order": 1
        },
        {
            "id": "features",
            "title": "Fonctionnalités principales",
            "description": "Explorez nos outils de création de contenu, d''analyse et de gamification.",
            "target": ".features-section",
            "position": "top",
            "order": 2
        },
        {
            "id": "dashboard",
            "title": "Tableau de bord",
            "description": "Accédez à vos statistiques, badges et tâches depuis le tableau de bord.",
            "target": "a[href=\"/dashboard\"]",
            "position": "bottom",
            "order": 3
        }
    ]'::jsonb,
    'new',
    true
),
(
    'Fonctionnalités avancées',
    'Guide pour les utilisateurs expérimentés',
    '[
        {
            "id": "stats",
            "title": "Statistiques avancées",
            "description": "Apprenez à analyser vos performances en détail.",
            "target": ".stats-section",
            "position": "top",
            "order": 1
        },
        {
            "id": "badges",
            "title": "Système de badges",
            "description": "Découvrez comment gagner des badges et récompenses.",
            "target": ".badges-section",
            "position": "bottom",
            "order": 2
        }
    ]'::jsonb,
    'premium',
    true
); 