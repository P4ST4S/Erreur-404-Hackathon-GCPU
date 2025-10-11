# Frontend - shadcn/ui Integration

Modern React application built with TypeScript, TailwindCSS v4, and shadcn/ui component library.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **next-themes** - Theme management (light/dark mode)
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Main header with navigation and theme toggle
│   │   │   ├── Footer.tsx        # Footer with links and social media
│   │   │   ├── Sidebar.tsx       # Collapsible sidebar (desktop)
│   │   │   └── Layout.tsx        # Main layout wrapper
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── separator.tsx
│   │   │   └── sheet.tsx
│   │   └── theme-provider.tsx    # Theme context provider
│   ├── lib/
│   │   └── utils.ts              # Utility functions (cn helper)
│   ├── globals.css               # Global styles and CSS variables
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # App entry point
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite configuration
```

## Features

### Layout Components

#### Header
- Responsive navigation
- Theme toggle (light/dark mode)
- Mobile menu button
- Navigation links

#### Sidebar
- Collapsible sidebar (desktop only)
- Icon-only collapsed view
- Active link highlighting
- User profile section

#### Footer
- Multi-column layout
- Company/product links
- Social media links
- Responsive design

#### Layout
- Combines Header, Sidebar, and Footer
- Mobile sheet menu
- Flexible content area

### Design System

#### Theme
- Light and dark mode support
- System preference detection
- HSL color system for easy customization
- CSS variables for theming

#### Colors
- `background` / `foreground` - Base colors
- `primary` / `secondary` - Brand colors
- `muted` / `accent` - UI accents
- `destructive` - Error states
- `border` / `ring` - Borders and focus rings

#### Components
All components are:
- Fully typed with TypeScript
- Accessible (WCAG compliant)
- Responsive
- Themeable
- Well-documented

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Runs the app in development mode at [http://localhost:5173](http://localhost:5173)

### Build

```bash
pnpm build
```

Builds the app for production to `dist/`

### Preview

```bash
pnpm preview
```

Preview the production build locally

## Usage

### Using the Layout

```tsx
import { Layout } from '@/components/layout/Layout';

function App() {
  return (
    <Layout>
      <h1>Your page content</h1>
    </Layout>
  );
}
```

### Using shadcn/ui Components

```tsx
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Separator className="my-4" />
      <Button variant="outline" size="sm">Cancel</Button>
    </div>
  );
}
```

### Path Aliases

The project uses `@` as a path alias for `src/`:

```tsx
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

## Adding More Components

To add additional shadcn/ui components, manually create them in `src/components/ui/` following the shadcn/ui documentation and examples.

Common components to add:
- Card
- Dialog
- Dropdown Menu
- Form
- Input
- Select
- Tabs
- Toast

## Customization

### Colors

Edit the CSS variables in `src/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Your brand color */
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Border Radius

Adjust the global border radius:

```css
:root {
  --radius: 0.5rem;  /* Default radius */
}
```

### Fonts

Update font settings in `src/globals.css` or `tailwind.config.ts`.

## Code Style

- All code is in English
- Comprehensive TypeScript types
- JSDoc comments for functions and components
- Responsive and accessible design
- Clean, maintainable code structure

## License

Private project for Erreur 404 Team
