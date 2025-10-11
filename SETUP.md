# Setup Guide

## Quick Start

### 1. Set up your Anthropic API Key

Create a `.env.local` file in the root directory:

```bash
ANTHROPIC_API_KEY=your_actual_api_key_here
```

You can get an API key from [Anthropic Console](https://console.anthropic.com/)

### 2. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your Git repository
5. Vercel will auto-detect Next.js configuration
6. Add environment variable:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key
7. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Add environment variable
vercel env add ANTHROPIC_API_KEY production

# Deploy to production
vercel --prod
```

## Environment Variables

Required for the app to function:

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude AI

## Testing Locally

1. Make sure `.env.local` is created with your API key
2. Run `npm run dev`
3. Fill out the workout form
4. Click "Generate Workout Plan"
5. Wait for the AI to create your personalized plan

## Troubleshooting

### "Failed to generate workout plan" error
- Check that your `.env.local` file exists and has the correct API key
- Verify your Anthropic API key is valid
- Check the browser console for detailed error messages

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Delete `.next` folder and `node_modules`, then run `npm install` again

### Styling issues
- Make sure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `layout.tsx`

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Next Steps

After the MVP is working, you can move on to the Alpha release features:
- Favorite exercise selector
- Rotation duration input
- Session summaries with duration and intensity
- Export functionality (JSON, CSV)

See [README.md](README.md) for the full roadmap.
