-- =====================================================
-- SCHEMA COMPLET POUR L'APPLICATION BE STRONG
-- =====================================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits INTEGER DEFAULT 150,
    pseudo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dashboard_access BOOLEAN DEFAULT true,
    payment_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Table des tâches d'échange
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    credits INTEGER DEFAULT 1,
    actions_restantes INTEGER DEFAULT 1,
    createur TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Table des complétions de tâches
CREATE TABLE IF NOT EXISTS task_completions (
    id TEXT PRIMARY KEY,
    exchange_task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (exchange_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des suggestions
CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_processed BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des activités
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des commandes de boost
CREATE TABLE IF NOT EXISTS boost_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des statistiques de l'application
CREATE TABLE IF NOT EXISTS app_stats (
    id TEXT PRIMARY KEY,
    user_count INTEGER DEFAULT 1787,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS abonnements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index sur les numéros de téléphone
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Index sur les créateurs de tâches
CREATE INDEX IF NOT EXISTS idx_tasks_createur ON tasks(createur);

-- Index sur les complétions de tâches
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(exchange_task_id);

-- Index sur les messages
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Index sur les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Index sur les activités
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insérer les statistiques initiales
INSERT INTO app_stats (id, user_count, last_updated)
VALUES ('main', 1787, NOW())
ON CONFLICT (id) DO UPDATE SET 
    user_count = EXCLUDED.user_count,
    last_updated = NOW();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (lecture de leur propre profil)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

-- Politique pour les tâches (lecture publique, écriture par le créateur)
CREATE POLICY "Tasks are viewable by everyone" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Tasks can be created by authenticated users" ON tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour les complétions de tâches
CREATE POLICY "Task completions are viewable by everyone" ON task_completions
    FOR SELECT USING (true);

CREATE POLICY "Task completions can be created by authenticated users" ON task_completions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour les messages (utilisateur peut voir ses propres messages)
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Politique pour les notifications (utilisateur peut voir ses propres notifications)
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Politique pour les statistiques (lecture publique)
CREATE POLICY "App stats are viewable by everyone" ON app_stats
    FOR SELECT USING (true);

-- =====================================================
-- FONCTIONS UTILES
-- =====================================================

-- Fonction pour incrémenter le compteur d'utilisateurs
CREATE OR REPLACE FUNCTION increment_user_count()
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE app_stats 
    SET user_count = user_count + 1, last_updated = NOW()
    WHERE id = 'main'
    RETURNING user_count INTO new_count;
    
    RETURN COALESCE(new_count, 1);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour décrémenter les crédits d'un utilisateur
CREATE OR REPLACE FUNCTION decrement_user_credits(user_id_param TEXT, amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT credits INTO current_credits FROM users WHERE id = user_id_param;
    
    IF current_credits >= amount THEN
        UPDATE users SET credits = credits - amount WHERE id = user_id_param;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql; 