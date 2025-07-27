-- Création de la table app_stats pour stocker les statistiques de l'application
CREATE TABLE IF NOT EXISTS app_stats (
    id TEXT PRIMARY KEY,
    user_count INTEGER DEFAULT 1787,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer l'enregistrement initial si il n'existe pas
INSERT INTO app_stats (id, user_count, last_updated)
VALUES ('main', 1787, NOW())
ON CONFLICT (id) DO NOTHING; 