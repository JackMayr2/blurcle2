import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { UserRole, UserTier } from '@/types/auth';
import PricingTable from '@/components/pricing/PricingTable';

interface PricingTier {
    name: string;
    tier: UserTier;
    price: string;
    features: string[];
    buttonText: string;
    recommended?: boolean;
}

const PRICING_TIERS: Record<UserRole, PricingTier[]> = {
    district: [
        {
            name: 'Free Trial',
            tier: 'trial',
            price: '$0/month',
            features: [
                'AI-powered content generation',
                'Basic document management',
                'Single district support',
                '14-day trial period'
            ],
            buttonText: 'Start Free Trial'
        },
        {
            name: 'Premium',
            tier: 'premium',
            price: '$199/month',
            features: [
                'Everything in Free Trial',
                'Advanced analytics',
                'Priority support',
                'Custom templates',
                'Unlimited storage'
            ],
            buttonText: 'Choose Premium',
            recommended: true
        }
    ],
    consultant: [
        {
            name: 'Free Trial',
            tier: 'trial',
            price: '$0/month',
            features: [
                'Manage up to 3 districts',
                'Basic content generation',
                'Standard templates',
                '14-day trial period'
            ],
            buttonText: 'Start Free Trial'
        },
        {
            name: 'Premium',
            tier: 'premium',
            price: '$499/month',
            features: [
                'Unlimited districts',
                'Advanced AI features',
                'Custom branding',
                'Priority support',
                'Analytics dashboard'
            ],
            buttonText: 'Choose Premium',
            recommended: true
        }
    ]
};

export default function SignUpFlow() {
    const [step, setStep] = useState<'role' | 'pricing' | 'details'>('role');
    const [role, setRole] = useState<UserRole>();
    const [tier, setTier] = useState<UserTier>();
    const [organizationName, setOrganizationName] = useState('');

    const handleRoleSelection = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setStep('pricing');
    };

    const handleTierSelection = (selectedTier: UserTier) => {
        setTier(selectedTier);
        setStep('details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Store selection in session storage for post-auth processing
        sessionStorage.setItem('signupData', JSON.stringify({
            role,
            tier,
            organizationName
        }));

        // Proceed with Google sign in
        await signIn('google', { callbackUrl: '/onboarding' });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {step === 'role' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome to Blurcle</h2>
                        <p className="mt-4 text-lg text-gray-600">Let's get started! First, tell us about your role.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => handleRoleSelection('district')}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                        >
                            <h3 className="text-xl font-semibold">School District</h3>
                            <p className="mt-2 text-gray-600">I manage communications for my school district</p>
                        </button>
                        <button
                            onClick={() => handleRoleSelection('consultant')}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                        >
                            <h3 className="text-xl font-semibold">Communications Consultant</h3>
                            <p className="mt-2 text-gray-600">I manage communications for multiple districts</p>
                        </button>
                    </div>
                </div>
            )}

            {step === 'pricing' && role && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
                        <p className="mt-4 text-lg text-gray-600">Select the plan that best fits your needs</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {PRICING_TIERS[role].map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative p-8 border-2 rounded-lg ${tier.recommended ? 'border-indigo-500' : 'border-gray-200'
                                    }`}
                            >
                                {tier.recommended && (
                                    <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-indigo-500 text-white text-sm rounded-full">
                                        Recommended
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold">{tier.name}</h3>
                                <p className="mt-4 text-3xl font-bold">{tier.price}</p>
                                <ul className="mt-6 space-y-4">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleTierSelection(tier.tier)}
                                    className={`mt-8 w-full py-3 px-4 rounded-md ${tier.recommended
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                                        }`}
                                >
                                    {tier.buttonText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 'details' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Almost There!</h2>
                        <p className="mt-4 text-lg text-gray-600">Just a few more details before we get started</p>
                    </div>
                    <div>
                        <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                            {role === 'district' ? 'District Name' : 'Organization Name'}
                        </label>
                        <input
                            type="text"
                            id="organizationName"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Continue with Google
                    </button>
                </form>
            )}
        </div>
    );
} 