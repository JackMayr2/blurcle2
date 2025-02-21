import React from 'react';
import { UserTier } from '@/types/auth';

interface PricingProps {
    selectedTier?: UserTier;
    onSelect: (tier: UserTier) => void;
}

const PricingTable: React.FC<PricingProps> = ({ selectedTier, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Implement your pricing table UI here */}
        </div>
    );
};

export default PricingTable; 