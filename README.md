# AI Workout Plan Generator

An AI-powered web application that generates personalized workout plans based on your fitness goals, level, and available equipment. Built with Next.js, TypeScript, and Anthropic's Claude AI.

## Features

### MVP (Current Release)
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

### Alpha Release (Current)
- ✅ Favorite exercise selector
- ✅ Session summaries with duration and intensity levels
- ✅ Target muscle group indicators
- ✅ Export functionality (JSON, CSV, TXT)
- ✅ Horizontal scrollable workout display
- ✅ Automatic workout plan persistence
- ✅ Auto-load last generated plan on return
- ✅ Plan timestamp tracking
- ✅ Secondary fitness goal selector

### Upcoming Features

#### Beta Release
- Chat interface for workout adjustments
- Natural language plan modifications
- PDF export
- Save/load workout history

#### Beta Release
- Chat interface for workout adjustments
- Natural language plan modifications
- PDF export
- Save/load workout history

#### Production Release
- Hevy API integration
- Progress tracking
- User accounts
- Advanced analytics

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

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude 3.5 Sonnet
- **Deployment**: Vercel

## Project Structure

```
workout-gen/
├── app/
│   ├── api/generate-workout/    # API route for AI generation
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── WorkoutForm.tsx          # 4-step paginated profile form
│   └── WorkoutDisplay.tsx       # Horizontal scrollable workout display
├── lib/
│   ├── profileStorage.ts        # LocalStorage profile management
│   └── workoutPlanStorage.ts    # LocalStorage workout plan persistence
├── types/
│   └── workout.ts               # TypeScript type definitions
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Disclaimer

This application provides general fitness information and should not replace professional medical advice. Always consult with a healthcare professional before starting any new exercise program.
