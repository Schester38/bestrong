-- Création de la table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('task', 'achievement', 'reminder', 'social', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS (Row Level Security) pour les notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (lecture et écriture de leurs propres notifications)
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (user_id = auth.jwt() ->> 'sub'::uuid);

-- Politique pour les admins (lecture de toutes les notifications)
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.jwt() ->> 'sub'::uuid
            AND users.has_admin_access = true
        )
    );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Création de la table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- RLS (Row Level Security) pour les messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (lecture et écriture de leurs messages)
CREATE POLICY "Users can manage their own messages" ON messages
    FOR ALL USING (
        sender_id = auth.jwt() ->> 'sub'::uuid OR 
        receiver_id = auth.jwt() ->> 'sub'::uuid
    );

-- Politique pour les admins (lecture de tous les messages)
CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.jwt() ->> 'sub'::uuid
            AND users.has_admin_access = true
        )
    );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- Création de la table des contacts de messages
CREATE TABLE IF NOT EXISTS message_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id VARCHAR(100) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_avatar TEXT,
    contact_type VARCHAR(50) DEFAULT 'user' CHECK (contact_type IN ('user', 'support', 'admin', 'community')),
    is_online BOOLEAN DEFAULT false,
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contact_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_contacts_user_id ON message_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_message_contacts_last_message_at ON message_contacts(last_message_at);

-- RLS (Row Level Security) pour les contacts de messages
ALTER TABLE message_contacts ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (lecture et écriture de leurs contacts)
CREATE POLICY "Users can manage their own message contacts" ON message_contacts
    FOR ALL USING (user_id = auth.jwt() ->> 'sub'::uuid);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_message_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_message_contacts_updated_at
    BEFORE UPDATE ON message_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_message_contacts_updated_at();

-- Insertion de contacts par défaut pour tous les utilisateurs
-- Cette fonction sera appelée lors de la création d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION create_default_message_contacts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO message_contacts (user_id, contact_id, contact_name, contact_type, is_online)
    VALUES 
        (NEW.id, 'support', 'Support BE STRONG', 'support', true),
        (NEW.id, 'community', 'Communauté TikTok', 'community', true),
        (NEW.id, 'admin', 'Admin Gadar', 'admin', false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement les contacts par défaut
CREATE TRIGGER create_default_contacts_on_user_creation
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_message_contacts(); 