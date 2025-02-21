import { UserTier } from '@/types/auth';  // Using path alias

interface PricingProps {
    selectedTier?: UserTier;
    onSelect: (tier: UserTier) => void;
}

export const PricingTable: React.FC<PricingProps> = ({ selectedTier, onSelect }) => {
    // Implementation
}; 