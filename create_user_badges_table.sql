-- Table pour stocker les badges gagnés par les utilisateurs
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);

-- RLS (Row Level Security) pour user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (lecture de leurs propres badges)
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub'::uuid);

-- Politique pour les admins (lecture de tous les badges)
CREATE POLICY "Admins can view all badges" ON user_badges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.jwt() ->> 'sub'::uuid
            AND users.has_admin_access = true
        )
    );

-- Fonction pour mettre à jour automatiquement created_at
CREATE OR REPLACE FUNCTION update_user_badges_created_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour created_at automatiquement
CREATE TRIGGER update_user_badges_created_at
    BEFORE UPDATE ON user_badges
    FOR EACH ROW
    EXECUTE FUNCTION update_user_badges_created_at(); 