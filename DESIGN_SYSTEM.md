# Design System Guide

## Color Palette

### Minimalist Monochrome Theme
- **Background**: Light gray (#fafafa) / Dark (#0a0a0a)
- **Foreground**: Black (#0a0a0a) / White (#fafafa)
- **Accent**: Black / White (inverted in dark mode)
- **Borders**: Light gray (#e5e5e5) / Dark gray (#262626)

## CSS Custom Properties

All components should use CSS custom properties instead of hard-coded colors:

```css
/* Instead of blue-500, use: */
background: var(--accent);

/* Instead of gray-300, use: */
border-color: var(--input-border);

/* Instead of text-gray-600, use: */
color: var(--muted);
```

## Component Classes

### Buttons
```jsx
// Primary button (black background)
<button className="btn btn-primary">Click Me</button>

// Secondary button (gray background)
<button className="btn btn-secondary">Cancel</button>

// Destructive button (red)
<button className="btn btn-destructive">Delete</button>
```

### Inputs
```jsx
<input className="input" type="text" />
<select className="input">...</select>
<textarea className="input" />
```

### Cards
```jsx
<div className="card p-6">Card content</div>
<div className="card card-hover p-4">Hoverable card</div>
```

### Selection Items (Radio/Checkbox style)
```jsx
<div className={`selectable ${isSelected ? 'selected' : ''}`}>
  <div className={`radio-indicator ${isSelected ? 'checked' : ''}`}>
    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
  </div>
  <div>Selection content</div>
</div>
```

### Progress Indicators
```jsx
<div className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
  {isCompleted ? '✓' : stepNumber}
</div>
<div className={`progress-line ${isCompleted ? 'completed' : ''}`} />
```

## Migration Guide

### Replace All Blue Colors
- `blue-500`, `blue-600`, `blue-700` → `var(--accent)`
- `bg-blue-50` → `var(--selected-bg)`
- `border-blue-500` → `var(--selected-border)`
- `text-blue-600` → `var(--accent)`
- `hover:bg-blue-700` → `var(--accent-hover)`
- `focus:ring-blue-500` → `border-color: var(--input-focus)`

### Replace All Gray Colors
- `bg-gray-100` → `var(--muted-bg)`
- `bg-gray-200` → `var(--muted-hover)`
- `border-gray-300` → `var(--input-border)`
- `text-gray-600` → `var(--muted)`
- `bg-white` → `var(--card)`
- `border-gray-200` → `var(--card-border)`

### Replace All Green Colors (Progress)
- `bg-green-500` → `var(--accent)` (progress uses accent color now)
- `bg-green-100` → `var(--selected-bg)`
- `border-green-300` → `var(--input-border)`

### Simplify Borders and Shadows
- `rounded-lg` → `rounded`
- `shadow-lg` → remove (use `border` only)
- `shadow-xl` → remove (use `border` only)

## Component-Specific Updates

### WorkoutForm
1. Replace all input focus rings: `focus:ring-2 focus:ring-blue-500` → just let `.input` class handle it
2. Update all selection boxes to use `.selectable` and `.selected`
3. Update progress indicators to use `.progress-step` and `.progress-line`
4. Replace spinner colors: `border-blue-600` → `border-[--accent]`
5. Update all buttons to use `.btn` classes

### WorkoutDisplay
1. Replace intensity badges from colorful to monochrome
2. Update export buttons to use `.btn` classes
3. Simplify exercise cards with minimal borders
4. Replace all color-coded elements with monochrome variants

## Typography
- Font: Inter (modern, clean sans-serif)
- Weight: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Use `font-medium` instead of `font-semibold` for most UI elements
- Use `tracking-tight` for large headings

## Spacing
- Use consistent spacing: `gap-4`, `px-6`, `py-4`
- Card padding: `p-6` or `p-4`
- Form spacing: `space-y-6` or `space-y-4`
- Button padding: `py-2.5 px-4`
