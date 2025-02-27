# Custom React Hooks

This directory contains custom React hooks that can be used throughout the application. These hooks encapsulate reusable stateful logic to make components cleaner and more focused.

## Usage

Import the hooks you need from the hooks directory:

```typescript
import { useApi, useFetch, useUser, useAuth } from '@/hooks';

// Use the hooks in your components
const { user, isLoading, error } = useUser();
```

## Available Hooks

### useApi

A flexible hook for making API requests with proper loading, error, and data states.

```typescript
const {
  data,
  error,
  isLoading,
  execute,
  setData,
  reset
} = useApi(apiFunction, options);

// Execute the API call with arguments
await execute(arg1, arg2);
```

Options:
- `initialData`: Initial data to use before the API call completes
- `onSuccess`: Callback function to run when the API call succeeds
- `onError`: Callback function to run when the API call fails

### useFetch

A hook that automatically executes an API request on component mount.

```typescript
const {
  data,
  error,
  isLoading,
  execute: refetch,
  setData,
  reset
} = useFetch(apiFunction, options);
```

Options:
- `initialData`: Initial data to use before the API call completes
- `onSuccess`: Callback function to run when the API call succeeds
- `onError`: Callback function to run when the API call fails
- `skipInitialFetch`: Whether to skip the initial fetch on mount

### useUser

A hook for fetching and managing user data.

```typescript
const {
  user,
  isLoading,
  error,
  refetch,
  updateProfile,
  completeOnboarding
} = useUser();

// Update the user's profile
await updateProfile({ name: 'New Name' });
```

### useAuth

A hook for handling authentication and role-based access control.

```typescript
const { session, isLoading, isAuthenticated } = useAuth(requiredRole);
```

## Creating a New Hook

To create a new hook:

1. Create a new file in the `hooks` directory (e.g., `useMyFeature.ts`)
2. Implement your hook using React's built-in hooks
3. Export your hook as a named export
4. Add your hook to the `index.ts` file

Example:

```typescript
// hooks/useMyFeature.ts
import { useState, useEffect } from 'react';

export function useMyFeature(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Effect logic here
  }, [initialValue]);
  
  return { value, setValue };
}

// hooks/index.ts
export { useMyFeature } from './useMyFeature';
```

## Best Practices

- Keep hooks focused on a single responsibility
- Use TypeScript for better type safety and autocompletion
- Handle loading and error states properly
- Clean up effects to prevent memory leaks
- Document your hooks with JSDoc comments
- Use the useCallback hook for functions that are passed to child components
- Use the useMemo hook for expensive calculations 