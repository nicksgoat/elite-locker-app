-- Create RLS policies for programs
DROP POLICY IF EXISTS "Programs are viewable by everyone" ON api.programs;
CREATE POLICY "Programs are viewable by everyone" ON api.programs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create programs" ON api.programs;
CREATE POLICY "Authenticated users can create programs" ON api.programs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own programs" ON api.programs;
CREATE POLICY "Users can update their own programs" ON api.programs FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own programs" ON api.programs;
CREATE POLICY "Users can delete their own programs" ON api.programs FOR DELETE USING (author_id = auth.uid());

-- Create RLS policies for program_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON api.program_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON api.program_subscriptions FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON api.program_subscriptions;
CREATE POLICY "Authenticated users can create subscriptions" ON api.program_subscriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON api.program_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON api.program_subscriptions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON api.program_subscriptions;
CREATE POLICY "Users can delete their own subscriptions" ON api.program_subscriptions FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for training_maxes
DROP POLICY IF EXISTS "Users can view their own training maxes" ON api.training_maxes;
CREATE POLICY "Users can view their own training maxes" ON api.training_maxes FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create training maxes" ON api.training_maxes;
CREATE POLICY "Authenticated users can create training maxes" ON api.training_maxes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own training maxes" ON api.training_maxes;
CREATE POLICY "Users can update their own training maxes" ON api.training_maxes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own training maxes" ON api.training_maxes;
CREATE POLICY "Users can delete their own training maxes" ON api.training_maxes FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for completed_workouts
DROP POLICY IF EXISTS "Users can view their own completed workouts" ON api.completed_workouts;
CREATE POLICY "Users can view their own completed workouts" ON api.completed_workouts FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create completed workouts" ON api.completed_workouts;
CREATE POLICY "Authenticated users can create completed workouts" ON api.completed_workouts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own completed workouts" ON api.completed_workouts;
CREATE POLICY "Users can update their own completed workouts" ON api.completed_workouts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own completed workouts" ON api.completed_workouts;
CREATE POLICY "Users can delete their own completed workouts" ON api.completed_workouts FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for exercises
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON api.exercises;
CREATE POLICY "Exercises are viewable by everyone" ON api.exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create exercises" ON api.exercises;
CREATE POLICY "Authenticated users can create exercises" ON api.exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own exercises" ON api.exercises;
CREATE POLICY "Users can update their own exercises" ON api.exercises FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own exercises" ON api.exercises;
CREATE POLICY "Users can delete their own exercises" ON api.exercises FOR DELETE USING (created_by = auth.uid());

-- Create RLS policies for workouts
DROP POLICY IF EXISTS "Workouts are viewable by everyone" ON api.workouts;
CREATE POLICY "Workouts are viewable by everyone" ON api.workouts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create workouts" ON api.workouts;
CREATE POLICY "Authenticated users can create workouts" ON api.workouts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own workouts" ON api.workouts;
CREATE POLICY "Users can update their own workouts" ON api.workouts FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own workouts" ON api.workouts;
CREATE POLICY "Users can delete their own workouts" ON api.workouts FOR DELETE USING (author_id = auth.uid());

-- Create RLS policies for workout_exercises
DROP POLICY IF EXISTS "Workout exercises are viewable by everyone" ON api.workout_exercises;
CREATE POLICY "Workout exercises are viewable by everyone" ON api.workout_exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create workout exercises" ON api.workout_exercises;
CREATE POLICY "Authenticated users can create workout exercises" ON api.workout_exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own workout exercises" ON api.workout_exercises;
CREATE POLICY "Users can update their own workout exercises" ON api.workout_exercises FOR UPDATE 
USING (EXISTS (SELECT 1 FROM api.workouts WHERE workouts.id = workout_id AND workouts.author_id = auth.uid())) 
WITH CHECK (EXISTS (SELECT 1 FROM api.workouts WHERE workouts.id = workout_id AND workouts.author_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own workout exercises" ON api.workout_exercises;
CREATE POLICY "Users can delete their own workout exercises" ON api.workout_exercises FOR DELETE 
USING (EXISTS (SELECT 1 FROM api.workouts WHERE workouts.id = workout_id AND workouts.author_id = auth.uid()));
