# UI Components

This directory contains reusable UI components that can be used throughout the application. These components are designed to be flexible, accessible, and consistent with the application's design system.

## Usage

Import the components you need from the UI components directory:

```typescript
import { Button, LoadingSpinner, ErrorMessage, Skeleton } from '@/components/ui';

// Use the components in your JSX
<Button variant="primary" isLoading={isLoading}>
  Submit
</Button>
```

## Available Components

### Button

A flexible button component with different variants and loading state.

```tsx
<Button
  variant="primary" // 'primary', 'secondary', or 'danger'
  isLoading={false} // Show loading spinner
  disabled={false}  // Disable the button
  className=""      // Additional CSS classes
  onClick={handleClick}
>
  Button Text
</Button>
```

### LoadingSpinner

A simple loading spinner component.

```tsx
<LoadingSpinner className="h-8 w-8" />
```

### ErrorMessage

A component for displaying error messages with an optional retry button.

```tsx
<ErrorMessage
  title="Error Title"       // Optional title
  message="Error message"   // Error message
  onRetry={handleRetry}     // Optional retry function
  className=""              // Additional CSS classes
/>
```

### Skeleton

A component for displaying loading placeholders.

```tsx
<Skeleton
  width="100%"           // Width of the skeleton
  height="1rem"          // Height of the skeleton
  borderRadius="0.25rem" // Border radius
  animate={true}         // Whether to animate the skeleton
  className=""           // Additional CSS classes
/>

// For text placeholders with multiple lines
<SkeletonText
  lines={3}              // Number of lines
  width="100%"           // Width of the skeleton
  height="1rem"          // Height of each line
  className=""           // Additional CSS classes
/>
```

### Modal

A modal component for displaying content in a dialog.

```tsx
<Modal
  isOpen={isOpen}           // Whether the modal is open
  onClose={handleClose}     // Function to call when the modal is closed
  title="Modal Title"       // Modal title
  className=""              // Additional CSS classes
>
  Modal content goes here
</Modal>
```

## Creating a New Component

To create a new UI component:

1. Create a new file in the `components/ui` directory (e.g., `MyComponent.tsx`)
2. Implement your component using React and TypeScript
3. Export your component as a named export
4. Add your component to the `index.ts` file

Example:

```tsx
// components/ui/MyComponent.tsx
import React, { memo } from 'react';
import { BaseProps } from '@/types';

interface MyComponentProps extends BaseProps {
  // Component-specific props
  label: string;
}

export const MyComponent: React.FC<MyComponentProps> = memo(({
  label,
  className = '',
  children,
}) => {
  return (
    <div className={`my-component ${className}`}>
      <span>{label}</span>
      {children}
    </div>
  );
});

MyComponent.displayName = 'MyComponent';

export default MyComponent;

// components/ui/index.ts
export * from './MyComponent';
```

## Best Practices

- Use the `BaseProps` interface for consistent prop types
- Use React.memo for performance optimization
- Add a displayName for better debugging
- Make components responsive and accessible
- Use TypeScript for better type safety and autocompletion
- Document your components with JSDoc comments
- Keep components focused on a single responsibility
- Use Tailwind CSS for styling 