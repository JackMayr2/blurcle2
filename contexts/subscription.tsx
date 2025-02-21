import { UserTier } from '../types/auth';

interface SubscriptionContextType {
    currentTier: UserTier; // Changed from SubscriptionTier
    // ... other properties
} 