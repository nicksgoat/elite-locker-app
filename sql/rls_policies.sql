-- Elite Locker RLS Policies

-- Profiles table policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Exercises table policies
CREATE POLICY "Exercises are viewable by everyone"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own exercises"
  ON exercises FOR DELETE
  USING (created_by = auth.uid());

-- Workouts table policies
CREATE POLICY "Public workouts are viewable by everyone"
  ON workouts FOR SELECT
  USING (
    is_paid = false OR 
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_favorites
      WHERE user_favorites.user_id = auth.uid()
      AND user_favorites.content_id = id
      AND user_favorites.content_type = 'workout'
    )
  );

CREATE POLICY "Authenticated users can create workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (author_id = auth.uid());

-- Workout exercises table policies
CREATE POLICY "Workout exercises are viewable with parent workout"
  ON workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND (
        workouts.is_paid = false OR 
        workouts.author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_favorites
          WHERE user_favorites.user_id = auth.uid()
          AND user_favorites.content_id = workouts.id
          AND user_favorites.content_type = 'workout'
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create workout exercises"
  ON workout_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout exercises"
  ON workout_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout exercises"
  ON workout_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  );

-- Exercise sets table policies
CREATE POLICY "Exercise sets are viewable with parent workout"
  ON exercise_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND (
        workouts.is_paid = false OR 
        workouts.author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_favorites
          WHERE user_favorites.user_id = auth.uid()
          AND user_favorites.content_id = workouts.id
          AND user_favorites.content_type = 'workout'
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create exercise sets"
  ON exercise_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND workouts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercise sets"
  ON exercise_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND workouts.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND workouts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercise sets"
  ON exercise_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND workouts.author_id = auth.uid()
    )
  );

-- Programs table policies
CREATE POLICY "Public programs are viewable by everyone"
  ON programs FOR SELECT
  USING (
    is_paid = false OR 
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_favorites
      WHERE user_favorites.user_id = auth.uid()
      AND user_favorites.content_id = id
      AND user_favorites.content_type = 'program'
    )
  );

CREATE POLICY "Authenticated users can create programs"
  ON programs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own programs"
  ON programs FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own programs"
  ON programs FOR DELETE
  USING (author_id = auth.uid());

-- Clubs table policies
CREATE POLICY "Public clubs are viewable by everyone"
  ON clubs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create clubs"
  ON clubs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Club owners can update their clubs"
  ON clubs FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Club owners can delete their clubs"
  ON clubs FOR DELETE
  USING (owner_id = auth.uid());

-- Posts table policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (
    club_id IS NULL OR
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id
      AND (
        clubs.is_paid = false OR
        clubs.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM club_members
          WHERE club_members.club_id = clubs.id
          AND club_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      club_id IS NULL OR
      EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.id = club_id
        AND (
          clubs.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = clubs.id
            AND club_members.user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (author_id = auth.uid());

-- Comments table policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id
      AND (
        posts.club_id IS NULL OR
        EXISTS (
          SELECT 1 FROM clubs
          WHERE clubs.id = posts.club_id
          AND (
            clubs.is_paid = false OR
            clubs.owner_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM club_members
              WHERE club_members.club_id = clubs.id
              AND club_members.user_id = auth.uid()
            )
          )
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid());
