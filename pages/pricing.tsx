import { PricingTable } from '@/components/pricing/PricingTable';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Choose the plan that best fits your needs
                    </p>
                </div>
                <div className="mt-16">
                    <PricingTable
                        onSelect={(tier) => console.log('Selected tier:', tier)}
                    />
                </div>
            </div>
        </div>
    );
} 