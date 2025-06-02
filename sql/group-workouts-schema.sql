-- Group Workouts and Invitations Schema

-- Workout Invitations Table
CREATE TABLE IF NOT EXISTS workout_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invited_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Prevent duplicate invitations
    UNIQUE(workout_id, invited_user_id)
);

-- Workout Participants Table (for group workouts)
CREATE TABLE IF NOT EXISTS workout_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('owner', 'participant', 'observer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
    
    -- Prevent duplicate participants
    UNIQUE(workout_id, user_id)
);

-- Group Workout Sessions Table (for real-time sync)
CREATE TABLE IF NOT EXISTS group_workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    session_code VARCHAR(10) UNIQUE NOT NULL, -- Short code for easy joining
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Session settings
    settings JSONB DEFAULT '{
        "allow_spectators": true,
        "sync_rest_timers": true,
        "share_progress": true,
        "voice_chat_enabled": false
    }'::jsonb
);

-- Real-time workout updates for group sync
CREATE TABLE IF NOT EXISTS group_workout_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES group_workout_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id UUID,
    set_number INTEGER,
    update_type VARCHAR(50) NOT NULL, -- 'set_completed', 'exercise_started', 'rest_started', 'workout_paused', etc.
    data JSONB, -- Flexible data for different update types
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout achievements/milestones for group motivation
CREATE TABLE IF NOT EXISTS workout_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'pr_set', 'workout_completed', 'streak_milestone', etc.
    title VARCHAR(100) NOT NULL,
    description TEXT,
    data JSONB, -- Achievement-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_invitations_invited_user ON workout_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_workout_invitations_workout ON workout_invitations(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_invitations_status ON workout_invitations(status);
CREATE INDEX IF NOT EXISTS idx_workout_participants_workout ON workout_participants(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_participants_user ON workout_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_group_workout_sessions_code ON group_workout_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_group_workout_sessions_active ON group_workout_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_group_workout_updates_session ON group_workout_updates(session_id);
CREATE INDEX IF NOT EXISTS idx_group_workout_updates_created_at ON group_workout_updates(created_at);

-- RLS Policies

-- Workout Invitations
ALTER TABLE workout_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invitations" ON workout_invitations
    FOR SELECT USING (invited_user_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Users can create invitations for their workouts" ON workout_invitations
    FOR INSERT WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update their own invitations" ON workout_invitations
    FOR UPDATE USING (invited_user_id = auth.uid() OR inviter_id = auth.uid());

-- Workout Participants
ALTER TABLE workout_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of workouts they're part of" ON workout_participants
    FOR SELECT USING (
        user_id = auth.uid() OR 
        workout_id IN (
            SELECT workout_id FROM workout_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join workouts they're invited to" ON workout_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND (
            -- User is the workout owner
            workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid()) OR
            -- User has a pending/accepted invitation
            workout_id IN (
                SELECT workout_id FROM workout_invitations 
                WHERE invited_user_id = auth.uid() AND status IN ('pending', 'accepted')
            )
        )
    );

-- Group Workout Sessions
ALTER TABLE group_workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions they're part of" ON group_workout_sessions
    FOR SELECT USING (
        created_by = auth.uid() OR
        workout_id IN (
            SELECT workout_id FROM workout_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create sessions for their workouts" ON group_workout_sessions
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Session creators can update their sessions" ON group_workout_sessions
    FOR UPDATE USING (created_by = auth.uid());

-- Group Workout Updates
ALTER TABLE group_workout_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view updates from their sessions" ON group_workout_updates
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM group_workout_sessions 
            WHERE created_by = auth.uid() OR workout_id IN (
                SELECT workout_id FROM workout_participants WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create updates for sessions they're part of" ON group_workout_updates
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        session_id IN (
            SELECT id FROM group_workout_sessions 
            WHERE created_by = auth.uid() OR workout_id IN (
                SELECT workout_id FROM workout_participants WHERE user_id = auth.uid()
            )
        )
    );

-- Workout Achievements
ALTER TABLE workout_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view achievements from their workouts" ON workout_achievements
    FOR SELECT USING (
        user_id = auth.uid() OR
        workout_id IN (
            SELECT workout_id FROM workout_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create achievements for their workouts" ON workout_achievements
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Functions for group workout management

-- Function to generate unique session codes
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    code VARCHAR(10);
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 6-character alphanumeric code
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM group_workout_sessions WHERE session_code = code) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE workout_invitations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update participant count in group sessions
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE group_workout_sessions 
        SET current_participants = current_participants + 1
        WHERE workout_id = NEW.workout_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE group_workout_sessions 
        SET current_participants = current_participants - 1
        WHERE workout_id = OLD.workout_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update participant counts
CREATE TRIGGER update_session_participants_trigger
    AFTER INSERT OR DELETE ON workout_participants
    FOR EACH ROW EXECUTE FUNCTION update_session_participant_count();

-- Sample data for testing
INSERT INTO workout_invitations (workout_id, inviter_id, invited_user_id, message) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Join me for a killer leg day!'),
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Let''s crush this workout together!')
ON CONFLICT (workout_id, invited_user_id) DO NOTHING;
