-- Elite Locker Seed Data

-- Insert mock users
INSERT INTO profiles (id, username, full_name, avatar_url, bio, followers_count, following_count)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'devonallen', 'Devon Allen', 'devon_allen/profile.jpg', 'Olympic Hurdler & NFL Wide Receiver. World-class athlete pushing boundaries in track and football. 🏃‍♂️🏈', 245000, 1250),
  ('00000000-0000-0000-0000-000000000002', 'sarahfit', 'Sarah Williams', 'https://randomuser.me/api/portraits/women/44.jpg', 'Personal trainer & wellness advocate', 3500, 420),
  ('00000000-0000-0000-0000-000000000003', 'mikefit', 'Mike Chen', 'https://randomuser.me/api/portraits/men/67.jpg', 'Bodybuilder & lifestyle coach', 2200, 310);

-- Insert mock exercises
INSERT INTO exercises (id, name, muscle_groups, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000101', 'Bench Press', ARRAY['chest', 'triceps', 'shoulders'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000102', 'Squat', ARRAY['quads', 'glutes', 'hamstrings'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000103', 'Deadlift', ARRAY['back', 'hamstrings', 'glutes'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000104', 'Pull Up', ARRAY['back', 'biceps', 'shoulders'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000105', 'Overhead Press', ARRAY['shoulders', 'triceps'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000106', 'Bicep Curl', ARRAY['biceps'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000107', 'Tricep Extension', ARRAY['triceps'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000108', 'Leg Press', ARRAY['quads', 'glutes'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000109', 'Lateral Raise', ARRAY['shoulders'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000110', 'Leg Curl', ARRAY['hamstrings'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000111', 'Hurdle Drills', ARRAY['quads', 'hamstrings', 'calves'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000112', 'Sprint Intervals', ARRAY['quads', 'hamstrings', 'calves', 'core'], '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000113', 'Box Jumps', ARRAY['quads', 'glutes', 'calves'], '00000000-0000-0000-0000-000000000001');

-- Insert mock programs
INSERT INTO programs (id, title, description, level, duration, author_id, is_paid, price, thumbnail_url, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000201', 'Elite Hurdle Technique', 'Master the technical aspects of hurdle racing with this comprehensive program designed by Olympic hurdler Devon Allen', 'advanced', 8, '00000000-0000-0000-0000-000000000001', TRUE, 79.99, 'devon_allen/hurdle_program.jpg', '2023-05-01', '2023-05-10'),
  ('00000000-0000-0000-0000-000000000202', 'NFL Receiver Training', 'Develop the skills, speed, and agility needed to excel as a wide receiver with this program from Devon Allen, who balances both track and NFL careers', 'advanced', 12, '00000000-0000-0000-0000-000000000001', TRUE, 89.99, 'devon_allen/nfl_program.jpg', '2023-04-15', '2023-04-28'),
  ('00000000-0000-0000-0000-000000000203', 'Track Athlete Strength', 'Build the foundational strength needed for track and field events with this program focusing on power and explosiveness', 'intermediate', 6, '00000000-0000-0000-0000-000000000001', FALSE, NULL, 'devon_allen/strength_program.jpg', '2023-03-10', '2023-03-15');

-- Insert mock user program progress
INSERT INTO user_program_progress (id, user_id, program_id, status, progress, current_week, start_date, completed_workouts, total_workouts)
VALUES 
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000201', 'active', 35, 3, '2023-05-15', 8, 24),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 'active', 75, 9, '2023-03-10', 27, 36),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000203', 'completed', 100, 6, '2023-01-05', 18, 18);

-- Insert mock clubs
INSERT INTO clubs (id, name, description, owner_id, is_paid, price, banner_image_url, profile_image_url, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000401', 'Elite Hurdlers', 'A community for competitive hurdlers and track athletes looking to improve their technique, speed, and performance', '00000000-0000-0000-0000-000000000001', TRUE, 14.99, 'devon_allen/elite_hurdlers_banner.jpg', 'devon_allen/elite_hurdlers_profile.jpg', '2023-01-15', '2023-06-01'),
  ('00000000-0000-0000-0000-000000000402', 'NFL Training Lab', 'Training strategies, drills, and workouts for football players at all levels', '00000000-0000-0000-0000-000000000001', FALSE, NULL, 'devon_allen/nfl_training_banner.jpg', 'devon_allen/nfl_training_profile.jpg', '2023-02-20', '2023-05-15'),
  ('00000000-0000-0000-0000-000000000403', 'Track & Field Pros', 'Connect with professional track and field athletes, share training tips, and discuss competition strategies', '00000000-0000-0000-0000-000000000001', TRUE, 9.99, 'devon_allen/track_field_banner.jpg', 'devon_allen/track_field_profile.jpg', '2023-03-05', '2023-04-10');

-- Insert mock club members
INSERT INTO club_members (club_id, user_id, is_admin)
VALUES 
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', TRUE),
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000002', FALSE),
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000003', FALSE),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', TRUE),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000002', FALSE),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', TRUE),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000003', FALSE);

-- Insert mock workouts
INSERT INTO workouts (id, title, description, is_template, author_id, date, duration, notes, is_complete, is_paid, price, club_id, thumbnail_url, level, category)
VALUES 
  ('00000000-0000-0000-0000-000000000501', 'Hurdle Technique Session', 'Focus on hurdle technique and form', FALSE, '00000000-0000-0000-0000-000000000001', '2023-06-10 14:30:00', 3600, 'Great session today, really felt improvements in my technique', TRUE, FALSE, NULL, '00000000-0000-0000-0000-000000000401', 'devon_allen/hurdle_workout.jpg', 'advanced', 'track'),
  ('00000000-0000-0000-0000-000000000502', 'Speed & Agility', 'Workout focused on improving speed and agility for football', FALSE, '00000000-0000-0000-0000-000000000001', '2023-06-08 09:15:00', 2700, 'Focused on quick direction changes and acceleration', TRUE, FALSE, NULL, '00000000-0000-0000-0000-000000000402', 'devon_allen/speed_workout.jpg', 'advanced', 'football'),
  ('00000000-0000-0000-0000-000000000503', 'Lower Body Strength', 'Building strength in the legs and posterior chain', TRUE, '00000000-0000-0000-0000-000000000001', NULL, 3600, 'Template for lower body strength training', FALSE, TRUE, 4.99, NULL, 'devon_allen/strength_workout.jpg', 'intermediate', 'strength'),
  ('00000000-0000-0000-0000-000000000504', 'Track Athlete HIIT', 'High-intensity interval training designed for track athletes', TRUE, '00000000-0000-0000-0000-000000000001', NULL, 1800, 'Template for HIIT workouts', FALSE, FALSE, NULL, NULL, 'devon_allen/hiit_workout.jpg', 'advanced', 'hiit');

-- Insert mock workout exercises
INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
VALUES 
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000111', 0),
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000112', 1),
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000113', 2),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000112', 0),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000113', 1),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000102', 0),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000103', 1),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000108', 2),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000110', 3),
  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000112', 0),
  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000113', 1);

-- Insert mock posts
INSERT INTO posts (id, author_id, club_id, content, image_urls, created_at, updated_at, like_count, comment_count)
VALUES 
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Just finished a killer hurdle session! 10x110m hurdles with full recovery. Working on maintaining speed between hurdles 8-10. #TrackLife #Hurdles', ARRAY['devon_allen/hurdle_training.jpg'], '2023-06-10 14:30:00', '2023-06-10 14:30:00', 3245, 178),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000402', 'Route running drills today. Working on creating separation at the top of routes. #NFL #WideReceiver', ARRAY['devon_allen/route_running.jpg'], '2023-06-08 10:15:00', '2023-06-08 10:15:00', 2876, 143),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000403', 'Track season is approaching! Who else is getting excited? Share your goals for the upcoming season below. #TrackAndField #Goals', ARRAY[], '2023-06-05 16:45:00', '2023-06-05 16:45:00', 1987, 256);

-- Insert mock comments
INSERT INTO comments (post_id, author_id, content, created_at, like_count)
VALUES 
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000002', 'Amazing session! What's your strategy for maintaining speed over the last few hurdles?', '2023-06-10 14:45:00', 87),
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000003', 'Looking strong! How many sessions like this do you do per week?', '2023-06-10 15:10:00', 64),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000002', 'Your footwork is incredible! Any tips for improving change of direction?', '2023-06-08 10:30:00', 56),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000003', 'Aiming to PR in the 400m this season! Been working on my endurance all winter.', '2023-06-05 17:00:00', 43);

-- Insert mock events
INSERT INTO events (id, title, description, location, date, duration, max_attendees, current_attendees, club_id, host_id, is_paid, price, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000701', 'Hurdle Technique Masterclass', 'Join Olympic hurdler Devon Allen for an in-depth masterclass on hurdle technique, race strategy, and training methods', 'Nike World Headquarters, Beaverton, OR', '2023-07-15 09:00:00', 180, 50, 42, '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', TRUE, 99.00, '2023-06-01'),
  ('00000000-0000-0000-0000-000000000702', 'NFL Combine Prep Workshop', 'Learn how to prepare for NFL combine tests with Devon Allen, who successfully transitioned from track to football', 'Eagles Training Facility, Philadelphia, PA', '2023-08-10 10:00:00', 240, 30, 18, '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', TRUE, 149.00, '2023-06-05'),
  ('00000000-0000-0000-0000-000000000703', 'Track & Field Q&A Session', 'Open Q&A session with professional track athletes. Bring your questions about training, competition, and the professional track life', 'Virtual Zoom Meeting', '2023-07-01 18:00:00', 90, 100, 73, '00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', FALSE, NULL, '2023-06-10');

-- Insert mock event attendees
INSERT INTO event_attendees (event_id, user_id)
VALUES 
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000003');

-- Insert mock user follows
INSERT INTO user_follows (follower_id, following_id)
VALUES 
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Insert mock user favorites
INSERT INTO user_favorites (user_id, content_id, content_type)
VALUES 
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', 'exercise'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000503', 'workout'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000201', 'program'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000102', 'exercise'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000504', 'workout');

-- Update member counts for clubs
UPDATE clubs
SET member_count = (
  SELECT COUNT(*) FROM club_members WHERE club_members.club_id = clubs.id
);

-- Update post counts for clubs
UPDATE clubs
SET post_count = (
  SELECT COUNT(*) FROM posts WHERE posts.club_id = clubs.id
);
