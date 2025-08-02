-- Tables pour les fonctionnalités avancées de BE STRONG

-- Table des défis
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('content', 'engagement', 'social', 'growth')),
  reward_credits INTEGER NOT NULL DEFAULT 0,
  reward_experience INTEGER NOT NULL DEFAULT 0,
  reward_badge VARCHAR(100),
  target_value INTEGER NOT NULL DEFAULT 1,
  deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de progression des défis par utilisateur
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Table des recommandations de contenu
CREATE TABLE IF NOT EXISTS content_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'post', 'story', 'reel')),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('trending', 'viral', 'niche', 'educational')),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_views INTEGER NOT NULL DEFAULT 0,
  estimated_engagement DECIMAL(5,2) NOT NULL DEFAULT 0,
  time_to_create INTEGER NOT NULL DEFAULT 0, -- en minutes
  trending_score INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  best_time_to_post VARCHAR(50),
  inspiration TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du contenu planifié
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'post', 'story', 'reel')),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  hashtags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  notes TEXT,
  auto_post BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_completed ON user_challenges(is_completed);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_user_id ON scheduled_content(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_date ON scheduled_content(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_recommendations_platform ON content_recommendations(platform);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON content_recommendations(category);

-- Fonctions pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_recommendations_updated_at BEFORE UPDATE ON content_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_content_updated_at BEFORE UPDATE ON scheduled_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;

-- Politiques pour les défis (lecture publique, écriture admin)
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Challenges are insertable by admin" ON challenges FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Challenges are updatable by admin" ON challenges FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Challenges are deletable by admin" ON challenges FOR DELETE USING (auth.role() = 'admin');

-- Politiques pour user_challenges (utilisateur voit ses propres données)
CREATE POLICY "Users can view their own challenge progress" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenge progress" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge progress" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own challenge progress" ON user_challenges FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les recommandations (lecture publique)
CREATE POLICY "Recommendations are viewable by everyone" ON content_recommendations FOR SELECT USING (true);
CREATE POLICY "Recommendations are insertable by admin" ON content_recommendations FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Recommendations are updatable by admin" ON content_recommendations FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Recommendations are deletable by admin" ON content_recommendations FOR DELETE USING (auth.role() = 'admin');

-- Politiques pour scheduled_content (utilisateur voit ses propres données)
CREATE POLICY "Users can view their own scheduled content" ON scheduled_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scheduled content" ON scheduled_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scheduled content" ON scheduled_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scheduled content" ON scheduled_content FOR DELETE USING (auth.uid() = user_id);

-- Données d'exemple pour les défis
INSERT INTO challenges (title, description, type, difficulty, category, reward_credits, reward_experience, target_value) VALUES
('Créateur du jour', 'Publiez 3 contenus de qualité aujourd''hui', 'daily', 'medium', 'content', 50, 100, 3),
('Engagement boost', 'Obtenez 100 interactions sur vos posts', 'daily', 'hard', 'engagement', 75, 150, 100),
('Stratège social', 'Gagnez 500 nouveaux followers cette semaine', 'weekly', 'expert', 'growth', 200, 500, 500),
('Viral Master', 'Créez un contenu qui atteint 10k vues', 'special', 'expert', 'content', 500, 1000, 1),
('Consistance quotidienne', 'Publiez du contenu pendant 7 jours consécutifs', 'weekly', 'medium', 'content', 150, 300, 7),
('Community builder', 'Répondez à 50 commentaires cette semaine', 'weekly', 'medium', 'social', 100, 200, 50);

-- Données d'exemple pour les recommandations
INSERT INTO content_recommendations (title, description, type, platform, category, difficulty, estimated_views, estimated_engagement, time_to_create, trending_score, tags, hashtags, best_time_to_post) VALUES
('Tutoriel Makeup Avant/Après', 'Montrez une transformation spectaculaire avec des produits abordables', 'video', 'tiktok', 'trending', 'medium', 50000, 8.5, 45, 95, ARRAY['makeup', 'transformation', 'beauty', 'tutorial'], ARRAY['#makeup', '#transformation', '#beautyhack', '#tutorial'], '19:00-21:00'),
('Recette Rapide 5 Minutes', 'Préparez un plat délicieux en moins de 5 minutes', 'reel', 'instagram', 'viral', 'easy', 75000, 9.2, 30, 88, ARRAY['food', 'recipe', 'quick', 'easy'], ARRAY['#recipe', '#quickmeal', '#foodie', '#easyrecipe'], '12:00-14:00'),
('Conseils Fitness Débutant', 'Guide complet pour commencer le fitness à la maison', 'video', 'youtube', 'educational', 'hard', 25000, 7.8, 120, 72, ARRAY['fitness', 'beginner', 'workout', 'health'], ARRAY['#fitness', '#beginner', '#workout', '#health'], '07:00-09:00'),
('Life Hack Organisation', 'Astuce simple pour organiser votre espace de travail', 'post', 'tiktok', 'niche', 'easy', 35000, 6.5, 20, 65, ARRAY['organization', 'lifehack', 'productivity', 'tips'], ARRAY['#organization', '#lifehack', '#productivity', '#tips'], '10:00-12:00'); 