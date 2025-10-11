import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile, WorkoutPlan } from '@/types/workout';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const profile: UserProfile = await req.json();

    // Build the prompt for Claude
    const workoutPreferenceInfo = profile.workoutPreferenceMode === 'sessions_per_week'
      ? `Sessions Per Week: ${profile.sessionsPerWeek}, Time Per Session: ${profile.timePerSession} minutes`
      : `Total Hours Per Week: ${profile.totalHoursPerWeek} hours (distribute optimally)`;

    const prompt = `You are an expert personal trainer and fitness coach. Create a personalized workout plan based on the following user profile:

**User Profile:**
- Gender: ${profile.gender}
- Age: ${profile.age} years
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Fitness Level: ${profile.fitnessLevel}
- Primary Goal: ${profile.goal}
${profile.secondaryGoal ? `- Secondary Goal: ${profile.secondaryGoal}` : ''}
- Available Equipment: ${profile.equipment.join(', ')}
- ${workoutPreferenceInfo}
${profile.limitations ? `- Physical Limitations: ${profile.limitations}` : ''}
${profile.preferredTechniques && profile.preferredTechniques.length > 0 ? `- Preferred Training Techniques: ${profile.preferredTechniques.join(', ')}` : ''}
${profile.favoriteExercises && profile.favoriteExercises.length > 0 ? `- Favorite Exercises to Prioritize: ${profile.favoriteExercises.join(', ')}` : ''}

Create a comprehensive workout plan that:
1. Is tailored to their fitness level and goals${profile.secondaryGoal ? ' (balancing both primary and secondary goals)' : ''}
2. Uses only the available equipment
3. Fits within their time constraints
4. Accounts for any physical limitations
5. Provides proper exercise progression
6. Includes warm-up and cool-down recommendations
7. Incorporates preferred training techniques if specified
8. Includes detailed execution instructions for each exercise (tempo, speed, form cues)
9. Provides realistic time estimates for each exercise and total session duration

Return the workout plan as a valid JSON object with this exact structure:
{
  "title": "Plan title",
  "description": "Brief description of the plan approach",
  "sessions": [
    {
      "dayNumber": 1,
      "dayName": "Full Body Strength",
      "totalDurationMinutes": 60,
      "intensity": "moderate",
      "targetMuscleGroups": ["Chest", "Back", "Legs"],
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "8-10",
          "rest": "60 seconds",
          "executionInstructions": "Push up explosively in 1 second, lower slowly for 3 seconds",
          "durationMinutes": 8,
          "notes": "Optional form tips or modifications",
          "demoMedia": {
            "type": "link",
            "url": "https://example.com/exercise-demo"
          }
        }
      ]
    }
  ],
  "tips": [
    "Helpful tip 1",
    "Helpful tip 2"
  ]
}

**Important Instructions:**
- Return ONLY the JSON object, no additional text or markdown formatting
- ALWAYS include "totalDurationMinutes" for each session (calculate based on exercises, sets, rest periods)
- ALWAYS include "intensity" for each session: "low", "moderate", "high", or "very_high"
- ALWAYS include "targetMuscleGroups" array for each session (e.g., ["Chest", "Triceps", "Shoulders"])
- ALWAYS include "durationMinutes" for each exercise (sets × reps × tempo + rest periods)
- ALWAYS include "executionInstructions" for each exercise with specific tempo/speed guidance (e.g., "2 seconds up, 3 seconds down")
- Include "demoMedia" with links to reputable exercise demonstration resources when possible
- Ensure all durations are realistic and account for transition time between exercises
- Prioritize the user's favorite exercises when applicable`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response content
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    let workoutPlan: WorkoutPlan;
    try {
      // Remove any markdown code blocks if present
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      workoutPlan = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse workout plan from AI response');
    }

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan. Please try again.' },
      { status: 500 }
    );
  }
}
