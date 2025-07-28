-- Créer la table task_tracking pour le système de vérification des tâches
CREATE TABLE IF NOT EXISTS public.task_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_url TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('LIKE', 'FOLLOW', 'COMMENT', 'SHARE')),
    clicked_view BOOLEAN DEFAULT FALSE,
    left_app BOOLEAN DEFAULT FALSE,
    returned_to_app BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_task_tracking_user_id ON public.task_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tracking_status ON public.task_tracking(status);
CREATE INDEX IF NOT EXISTS idx_task_tracking_created_at ON public.task_tracking(created_at);

-- Activer RLS (Row Level Security)
ALTER TABLE public.task_tracking ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres trackings
CREATE POLICY "Users can view their own task tracking" ON public.task_tracking
    FOR SELECT USING (auth.uid()::text = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres trackings
CREATE POLICY "Users can create their own task tracking" ON public.task_tracking
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres trackings
CREATE POLICY "Users can update their own task tracking" ON public.task_tracking
    FOR UPDATE USING (auth.uid()::text = user_id); 