# AI Workout Plan Generator

An AI-powered web application that generates personalized workout plans based on your fitness goals, level, and available equipment. Built with Next.js, TypeScript, and Anthropic's Claude AI.

## Features

### Core Features
- ✅ Personalized workout plan generation
- ✅ User profile input (age, gender, height, weight)
- ✅ Fitness level and goal selection
- ✅ Equipment availability configuration
- ✅ Customizable session frequency and duration
- ✅ Physical limitations support
- ✅ Responsive design with dark mode
- ✅ Detailed exercise instructions with sets, reps, and rest periods
- ✅ Profile management (save, load, delete profiles)
- ✅ Multi-step paginated questionnaire
- ✅ Training technique preferences (HIIT, supersets, etc.)
- ✅ Exercise execution instructions with tempo guidance
- ✅ Duration estimates for exercises and sessions

### Alpha Release
- ✅ Favorite exercise selector
- ✅ Session summaries with duration and intensity levels
- ✅ Target muscle group indicators
- ✅ Export functionality (JSON, CSV, TXT)
- ✅ Horizontal scrollable workout display
- ✅ Automatic workout plan persistence
- ✅ Auto-load last generated plan on return
- ✅ Plan timestamp tracking
- ✅ Secondary fitness goal selector

### Beta Release (Current)
- ✅ Side-by-side chat interface for workout adjustments
- ✅ Toggleable chat panel that slides in from the right
- ✅ Natural language plan modifications via AI
- ✅ PDF export with professional formatting
- ✅ Save/load workout history (up to 20 plans)
- ✅ Rename and manage saved workouts
- ✅ Seamless switching between plan view and history

### Upcoming Features

#### Production Release
- Hevy API integration for workout logging
- Progress tracking with charts and analytics
- User accounts with cloud sync
- Advanced analytics and insights
- Mobile app companion
- Social features (share workouts, follow trainers)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd workout-gen
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment on Vercel

### Quick Deploy

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [Vercel](https://vercel.com) and sign in

3. Click "Add New Project" and import your repository

4. Configure environment variables:
   - Add `ANTHROPIC_API_KEY` with your API key

5. Click "Deploy"

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
```

## How to Use

1. **Generate a Workout Plan**
   - Fill out the 4-step questionnaire with your profile, goals, and preferences
   - Click "Generate Workout Plan" to create your personalized plan
   - Your plan is automatically saved

2. **View Your Plan**
   - Browse through your workout sessions in the horizontal scrollable view
   - Export your plan as PDF, JSON, CSV, or TXT
   - See exercise details, execution instructions, and duration estimates

3. **Modify Your Plan (Beta)**
   - Click "Modify Plan" button to open the chat panel on the right side
   - The chat panel slides in while you view your workout plan
   - Make changes using natural language:
     - "Add pull-ups to Day 2"
     - "Change the bench press from 4 sets to 5 sets"
     - "Replace squats with leg press"
   - The AI will update your plan in real-time and explain the changes
   - Close the chat panel when done to see your full workout

4. **Browse History (Beta)**
   - Click the "History" button to view your saved workouts
   - Access your last 20 workout plans
   - Rename saved workouts for easy identification
   - Load any previous plan with one click
   - Delete old plans you no longer need

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude 3.5 Sonnet
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

## Project Structure

```
workout-gen/
├── app/
│   ├── api/
│   │   ├── generate-workout/     # API route for AI generation
│   │   └── modify-workout/       # API route for chat modifications
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page with tabbed interface
├── components/
│   ├── WorkoutForm.tsx           # 4-step paginated profile form
│   ├── WorkoutDisplay.tsx        # Horizontal scrollable workout display
│   ├── WorkoutChat.tsx           # Chat interface for plan modifications
│   └── WorkoutHistory.tsx        # Workout history management
├── lib/
│   ├── profileStorage.ts         # LocalStorage profile management
│   ├── workoutPlanStorage.ts     # LocalStorage workout plan persistence
│   └── workoutHistoryStorage.ts  # LocalStorage workout history management
├── types/
│   └── workout.ts                # TypeScript type definitions
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Disclaimer

This application provides general fitness information and should not replace professional medical advice. Always consult with a healthcare professional before starting any new exercise program.
