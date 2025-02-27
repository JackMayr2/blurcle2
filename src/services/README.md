# API Services

This directory contains service modules that handle API communication with the backend. Each service is organized by feature and provides typed functions for making API requests.

## Usage

Import the services you need from the services directory:

```typescript
import { userService, districtService, contentService } from '@/services';

// Use the services in your components
const { data, error } = await userService.getCurrentUser();
```

## Available Services

### User Service

Functions for managing user data:

- `getCurrentUser()` - Get the current user's profile
- `updateUserProfile(data)` - Update the current user's profile
- `checkGoogleToken()` - Check if Google token is valid and refresh if needed
- `completeOnboarding(data)` - Complete user onboarding

### District Service

Functions for managing district data:

- `getDistrict(id)` - Get district by ID
- `getConsultantDistricts()` - Get all districts for a consultant
- `createDistrict(data)` - Create a new district
- `updateDistrict(id, data)` - Update a district
- `deleteDistrict(id)` - Delete a district

### Content Service

Functions for content generation and management:

- `generateContent(params)` - Generate content using the OpenAI API
- `saveContentToDrive(content, fileName, folderId)` - Save content to Google Drive

## Creating a New Service

To create a new service:

1. Create a new file in the `services` directory (e.g., `myFeature.ts`)
2. Import the API utilities: `import { api } from '@/lib/api';`
3. Define your service functions with proper types
4. Export an object with all your service functions
5. Add your service to the `index.ts` file

Example:

```typescript
// services/myFeature.ts
import { api } from '@/lib/api';
import { MyFeatureData } from '@/types';

export async function getMyFeatureData(id: string) {
  return api.get<MyFeatureData>(`/api/my-feature/${id}`);
}

export const myFeatureService = {
  getMyFeatureData
};

// services/index.ts
export * from './myFeature';
```

## Best Practices

- Always use proper TypeScript types for request and response data
- Handle errors gracefully using the ApiResponse type
- Keep service functions small and focused on a single responsibility
- Use the API utilities (`get`, `post`, `put`, `delete`) for all requests
- Document your service functions with JSDoc comments 