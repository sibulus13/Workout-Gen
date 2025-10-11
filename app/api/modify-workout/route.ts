import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { WorkoutPlan } from '@/types/workout';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ModifyWorkoutRequest {
  currentPlan: WorkoutPlan;
  modification: string;
  chatHistory: Message[];
}

export async function POST(request: Request) {
  try {
    const { currentPlan, modification, chatHistory }: ModifyWorkoutRequest = await request.json();

    // Build conversation history
    const conversationHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    // Create the system prompt
    const systemPrompt = `You are an expert fitness AI assistant helping users modify their workout plans.

Current workout plan:
${JSON.stringify(currentPlan, null, 2)}

Your task is to:
1. Understand the user's modification request
2. Make appropriate changes to the workout plan
3. Explain what you changed and why
4. Return the modified workout plan in valid JSON format

When modifying the plan:
- Keep the overall structure intact unless specifically asked to change it
- Maintain proper exercise form and safety guidelines
- Consider the user's fitness level and goals
- Provide clear explanations for your changes

Response format:
First, provide a natural language explanation of the changes you made.
Then, provide the complete modified workout plan as a JSON object starting with {MODIFIED_PLAN} and ending with {/MODIFIED_PLAN}.

Example response:
I've made the following changes to your workout plan:
- Changed Day 1 bench press from 4 sets to 5 sets
- Added pull-ups to Day 2

{MODIFIED_PLAN}
{
  "title": "Updated Workout Plan",
  "description": "...",
  "sessions": [...]
}
{/MODIFIED_PLAN}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: modification
        }
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract the modified plan from the response
    let updatedPlan: WorkoutPlan | null = null;
    const planMatch = responseText.match(/\{MODIFIED_PLAN\}([\s\S]*?)\{\/MODIFIED_PLAN\}/);

    if (planMatch) {
      try {
        updatedPlan = JSON.parse(planMatch[1].trim());
      } catch (parseError) {
        console.error('Failed to parse modified plan:', parseError);
      }
    }

    // Extract the explanation (everything before {MODIFIED_PLAN})
    let explanation = responseText;
    if (planMatch) {
      explanation = responseText.substring(0, planMatch.index).trim();
    }

    return NextResponse.json({
      response: explanation || responseText,
      updatedPlan: updatedPlan
    });

  } catch (error) {
    console.error('Error modifying workout:', error);
    return NextResponse.json(
      { error: 'Failed to modify workout plan' },
      { status: 500 }
    );
  }
}
