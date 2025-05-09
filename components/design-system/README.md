# Elite Locker Design System

This directory contains the Elite Locker design system - a collection of reusable UI components, design tokens, and patterns that ensure consistency across the application.

## Directory Structure

- `tokens/` - Design tokens (colors, typography, spacing)
- `primitives/` - Basic UI components (text, view, buttons, inputs)
- `cards/` - Card components
- `layouts/` - Layout components
- `feedback/` - Feedback components (modals, toasts)
- `navigation/` - Navigation components
- `utils/` - Utility functions and hooks

## Usage

Import components from the design system:

```tsx
import { Button } from '@/components/design-system/primitives/Button';
import { WorkoutCard } from '@/components/design-system/cards/WorkoutCard';
```

## Design Tokens

Design tokens are the visual design atoms of the design system. They're used to maintain a consistent visual language.

```tsx
import { colors, typography, spacing } from '@/components/design-system/tokens';
```

## Components

Each component is documented with its props and usage examples in its respective file.
