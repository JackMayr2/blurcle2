import { UserTier } from '../../types/auth';

interface PricingProps {
    selectedTier?: UserTier; // Changed from SubscriptionTier
    onSelect: (tier: UserTier) => void;
} 