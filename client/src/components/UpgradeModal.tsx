import React from 'react';
import { X, Lock, Check, ArrowRight } from 'lucide-react';
import { TierConfig } from '../utils/accessControl';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    requiredTier: TierConfig;
    upgradeOptions: TierConfig[];
    currentTier: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    featureName,
    requiredTier,
    upgradeOptions,
    currentTier
}) => {
    if (!isOpen) return null;

    const handleUpgrade = (tier: TierConfig) => {
        // Navigate to pricing page with selected tier query param
        // In a real app, this might go directly to checkout
        window.location.href = `/pricing?plan=${tier.name.toLowerCase()}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl max-w-2xl w-full shadow-2xl border border-slate-800">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Upgrade Required</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Unlock {featureName} with a higher tier plan
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Current Limitation */}
                <div className="p-6 bg-slate-800/30 border-b border-slate-800">
                    <p className="text-slate-300">
                        You're currently on the <span className="font-semibold text-white">{currentTier || 'Basic'}</span> plan.
                        To access <span className="font-semibold text-teal-400">{featureName}</span>, you need
                        at least the <span className="font-semibold text-orange-400">{requiredTier.name}</span> plan.
                    </p>
                </div>

                {/* Upgrade Options */}
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Choose Your Plan
                    </h3>

                    {upgradeOptions.map((tier) => (
                        <div
                            key={tier.name}
                            className="border border-slate-700 rounded-lg p-5 hover:border-teal-500 transition-all cursor-pointer group bg-slate-950/50"
                            onClick={() => handleUpgrade(tier)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h4 className="text-xl font-bold text-white">{tier.name}</h4>
                                        {tier.price > 0 && (
                                            <span className="text-2xl font-bold text-teal-400">
                                                ${tier.price}
                                                <span className="text-sm text-slate-400">/month</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {tier.features.slice(0, 6).map((feature) => (
                                            <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="capitalize">{feature.replace('-', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="ml-4 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all group-hover:scale-105">
                                    Upgrade Now
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {upgradeOptions.length === 0 && (
                        <div className="text-center p-4 text-slate-400">
                            Contact support to upgrade to Enterprise.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-800/30 border-t border-slate-800">
                    <p className="text-sm text-slate-400 text-center">
                        Need help choosing? <a href="/contact" className="text-teal-400 hover:underline">Contact our support team</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
