import { EXERCISE_LIBRARY } from '@/components/ui/ExerciseLibraryModal';

/**
 * Processes natural language input to generate a structured workout using OpenAI's API.
 * 
 * @param {string} input - Natural language description of the workout
 * @returns {Promise<Object>} - Structured workout data
 */
export const processWorkoutInput = async (input) => {
  try {
    // Check if we should use OpenAI or fallback to local processing
    if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      return await processWithOpenAI(input);
    } else {
      console.warn('OpenAI API key not found, using fallback local processing');
      return processLocally(input);
    }
  } catch (error) {
    console.error('Error processing workout input:', error);
    // Fallback to local processing if OpenAI fails
    return processLocally(input);
  }
};

/**
 * Process the workout description using OpenAI's API
 */
const processWithOpenAI = async (input) => {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    // Extract available exercise names for context
    const availableExercises = EXERCISE_LIBRARY.map(ex => ex.name);
    
    // Create a system prompt that explains what we need
    const systemPrompt = `You are a fitness expert AI that creates structured workout plans. 
    Convert the user's natural language workout description into a structured workout plan.
    Only use exercises from this list: ${availableExercises.join(', ')}.
    
    For each exercise, extract:
    - Name (must match exactly one from the list)
    - Sets (default to 3 if not specified)
    - Target reps or time (default to "10-12" if not specified)
    - Rest time in seconds (default to 60 if not specified)
    
    Also extract:
    - A name for the workout
    - Categorize it based on the exercises (e.g., "Upper Body", "Lower Body", "Full Body", "Core", etc.)
    
    Return the result as a JSON object with this structure:
    {
      "name": "Workout Name",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "targetReps": "10-12",
          "restTime": 60
        }
      ],
      "categories": ["Category1", "Category2"]
    }`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${data.error?.message || 'Unknown error'}`);
    }
    
    // Extract the JSON from the response
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }
    
    // Extract the JSON object from the content (it might be wrapped in backticks or text)
    const jsonMatch = content.match(/```json\n([\s\S]*?)```/) || content.match(/{[\s\S]*?}/);
    let workoutPlan;
    
    if (jsonMatch) {
      const jsonString = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
      workoutPlan = JSON.parse(jsonString);
    } else {
      try {
        // Try to parse the entire content as JSON
        workoutPlan = JSON.parse(content);
      } catch (e) {
        throw new Error('Could not parse OpenAI response as JSON');
      }
    }
    
    // Validate and enhance the workout plan with additional details
    const exercises = workoutPlan.exercises.map(ex => {
      // Find the exercise in our library to get additional details
      const libraryExercise = EXERCISE_LIBRARY.find(e => e.name === ex.name);
      
      if (!libraryExercise) {
        // If not found exactly, try case-insensitive matching
        const closestMatch = EXERCISE_LIBRARY.find(e => 
          e.name.toLowerCase() === ex.name.toLowerCase()
        );
        
        if (closestMatch) {
          return {
            ...closestMatch,
            sets: ex.sets || 3,
            targetReps: ex.targetReps || '10-12',
            restTime: ex.restTime || 60
          };
        }
        
        // Fallback to a generic exercise with the name from OpenAI
        return {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: ex.name,
          sets: ex.sets || 3,
          targetReps: ex.targetReps || '10-12',
          restTime: ex.restTime || 60
        };
      }
      
      return {
        ...libraryExercise,
        sets: ex.sets || libraryExercise.sets || 3,
        targetReps: ex.targetReps || libraryExercise.targetReps || '10-12',
        restTime: ex.restTime || libraryExercise.restTime || 60
      };
    });
    
    return {
      name: workoutPlan.name || 'My Workout',
      exercises,
      date: new Date().toISOString(),
      duration: estimateWorkoutDuration(exercises),
      categories: workoutPlan.categories || categorizeWorkout(exercises),
    };
  } catch (error) {
    console.error('Error processing with OpenAI:', error);
    throw error;
  }
};

/**
 * Process the workout description locally (fallback)
 */
const processLocally = async (input) => {
  // Extract workout name
  let workoutName = extractWorkoutName(input) || 'My Workout';
  
  // Extract exercises
  const exercises = extractExercises(input);
  
  return {
    name: workoutName,
    exercises,
    date: new Date().toISOString(),
    duration: estimateWorkoutDuration(exercises),
    categories: categorizeWorkout(exercises),
  };
};

/**
 * Extracts workout name from the input text
 */
const extractWorkoutName = (input) => {
  // Basic regex to look for "workout name:" pattern
  const nameMatch = input.match(/(?:workout|routine|session)(?:\s+name)?(?:\s*:)?\s+([^,.\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  
  // Check for common workout names
  const commonWorkouts = [
    { pattern: /upper\s*body/i, name: 'Upper Body Workout' },
    { pattern: /lower\s*body/i, name: 'Lower Body Workout' },
    { pattern: /full\s*body/i, name: 'Full Body Workout' },
    { pattern: /push/i, name: 'Push Workout' },
    { pattern: /pull/i, name: 'Pull Workout' },
    { pattern: /leg/i, name: 'Leg Day' },
    { pattern: /cardio/i, name: 'Cardio Session' },
    { pattern: /core/i, name: 'Core Strength' },
    { pattern: /hiit/i, name: 'HIIT Workout' },
  ];
  
  for (const workout of commonWorkouts) {
    if (workout.pattern.test(input)) {
      return workout.name;
    }
  }
  
  return null;
};

/**
 * Extracts exercises from input text by matching against exercise library
 */
const extractExercises = (input) => {
  const exercises = [];
  const lines = input.split(/[\n,.]+/).map(line => line.trim()).filter(Boolean);
  
  // First pass: Directly match exercise names from our library
  EXERCISE_LIBRARY.forEach(libraryExercise => {
    const exerciseRegex = new RegExp(`\\b${libraryExercise.name.replace(/\(|\)|\[|\]/g, '\\$&')}\\b`, 'i');
    
    if (exerciseRegex.test(input)) {
      // Try to find sets, reps information near the exercise name
      const matchedLine = lines.find(line => exerciseRegex.test(line));
      let sets = 3; // Default
      let targetReps = '10-12'; // Default
      
      if (matchedLine) {
        // Look for sets and reps pattern
        const setsMatch = matchedLine.match(/(\d+)\s*(?:sets|set)/i);
        if (setsMatch) sets = parseInt(setsMatch[1]);
        
        const repsMatch = matchedLine.match(/(\d+)(?:-(\d+))?\s*(?:reps|rep)/i);
        if (repsMatch) {
          if (repsMatch[2]) {
            targetReps = `${repsMatch[1]}-${repsMatch[2]}`;
          } else {
            targetReps = repsMatch[1];
          }
        }
      }
      
      exercises.push({
        ...libraryExercise,
        sets: sets || libraryExercise.sets,
        targetReps: targetReps || libraryExercise.targetReps,
      });
    }
  });
  
  // Second pass: Check if there are exercises not directly matched but inferred
  const commonSynonyms = {
    'bench': 'Barbell Bench Press',
    'squat': 'Barbell Squat',
    'deadlift': 'Deadlift',
    'curl': 'Dumbbell Bicep Curl',
    'press': 'Overhead Press',
    'row': 'Barbell Row',
    'pullup': 'Pull-up',
    'pull up': 'Pull-up',
    'pushup': 'Push-up',
    'push up': 'Push-up',
    'lunge': 'Lunges',
    'crunch': 'Crunch',
    'plank': 'Plank',
  };
  
  Object.entries(commonSynonyms).forEach(([synonym, exerciseName]) => {
    if (!exercises.some(e => e.name === exerciseName) && new RegExp(`\\b${synonym}\\b`, 'i').test(input)) {
      const matchedExercise = EXERCISE_LIBRARY.find(e => e.name === exerciseName);
      if (matchedExercise) {
        exercises.push({ ...matchedExercise });
      }
    }
  });
  
  return exercises;
};

/**
 * Estimate the workout duration based on exercises
 */
const estimateWorkoutDuration = (exercises) => {
  if (!exercises.length) return 0;
  
  // Basic estimation: 
  // Each set takes ~1 minute + rest time between sets
  let totalMinutes = 0;
  
  exercises.forEach(exercise => {
    const setsCount = exercise.sets || 3;
    const restTime = exercise.restTime || 60; // Rest time in seconds
    
    // Time for the sets (in minutes) + rest time (convert from seconds to minutes)
    totalMinutes += setsCount + (setsCount - 1) * (restTime / 60);
  });
  
  // Add 5 minutes for warm-up
  totalMinutes += 5;
  
  return Math.round(totalMinutes * 60); // Return in seconds
};

/**
 * Categorize the workout based on the exercises
 */
const categorizeWorkout = (exercises) => {
  const categories = new Set();
  
  exercises.forEach(exercise => {
    if (exercise.category) {
      categories.add(exercise.category);
    }
  });
  
  if (categories.size === 0) {
    return ['General'];
  }
  
  return Array.from(categories);
}; 