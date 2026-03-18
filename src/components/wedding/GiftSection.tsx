'use client';

import type { Wedding } from '@/types/wedding';

interface GiftSectionProps {
    wedding: Wedding;
    invert?: boolean;
}

export default function GiftSection({ wedding, invert = false }: GiftSectionProps) {
    if (!wedding.gift_bank && !wedding.gift_qr_image && !wedding.gift_account_number) return null;

    // Parse enhanced gift fields
    let registryLinks: { title: string; url: string }[] = [];
    let cashFunds: { title: string; description?: string; targetAmount: number; currency?: string; current?: number }[] = [];
    let paymentLinks: { title: string; url: string }[] = [];

    try {
        if (wedding.gift_registry_links) registryLinks = typeof wedding.gift_registry_links === 'string' ? JSON.parse(wedding.gift_registry_links) : wedding.gift_registry_links;
        if (wedding.cash_funds) cashFunds = typeof wedding.cash_funds === 'string' ? JSON.parse(wedding.cash_funds) : wedding.cash_funds;
        if (wedding.payment_links) paymentLinks = typeof wedding.payment_links === 'string' ? JSON.parse(wedding.payment_links) : wedding.payment_links;
    } catch { }

    return (
        <section className={`py-24 px-6 ${invert ? 'bg-[#1a1a1a] text-white' : 'bg-neutral/50 text-[#4A4444]'}`}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block opacity-60">With Love</span>
                    <h2 className={`text-4xl md:text-5xl font-serif mb-4 ${invert ? 'text-white' : 'text-[#4A4444]'}`}>Gift Registry</h2>
                    <p className={`text-lg leading-relaxed ${invert ? 'text-white/60' : 'text-text-secondary'} font-serif italic max-w-xl mx-auto`}>
                        Your presence is the greatest gift of all. However, if you wish to honor us with a gift, a contribution towards our future together would be appreciated.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="flex-1 space-y-6">
                        {/* Bank Details */}
                        <div className={`p-8 rounded-3xl ${invert ? 'bg-white/5 border border-white/10' : 'bg-white soft-shadow border border-primary/5'}`}>
                            <div className="space-y-4">
                                {wedding.gift_bank && (
                                    <div>
                                        <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">Bank / App</p>
                                        <p className="text-xl font-bold">{wedding.gift_bank}</p>
                                    </div>
                                )}
                                {wedding.gift_account_name && (
                                    <div>
                                        <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">Account Name</p>
                                        <p className="text-xl font-serif">{wedding.gift_account_name}</p>
                                    </div>
                                )}
                                {wedding.gift_account_number && (
                                    <div>
                                        <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">Account Number</p>
                                        <p className="font-mono text-xl tracking-wider select-all">{wedding.gift_account_number}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Registry Links */}
                        {registryLinks.length > 0 && (
                            <div className={`p-8 rounded-3xl ${invert ? 'bg-white/5 border border-white/10' : 'bg-white soft-shadow border border-primary/5'}`}>
                                <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-4">Gift Registries</p>
                                <div className="space-y-3">
                                    {registryLinks.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors group">
                                            <span className="font-bold">{link.title}</span>
                                            <span className="text-primary text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Visit →</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cash Funds */}
                        {cashFunds.length > 0 && (
                            <div className={`p-8 rounded-3xl ${invert ? 'bg-white/5 border border-white/10' : 'bg-white soft-shadow border border-primary/5'}`}>
                                <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-4">Cash Funds</p>
                                <div className="space-y-6">
                                    {cashFunds.map((fund, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between mb-2">
                                                <div>
                                                    <span className="font-bold block">{fund.title}</span>
                                                    {fund.description && <span className="text-sm opacity-60 block">{fund.description}</span>}
                                                </div>
                                                <span className="text-sm opacity-60 mt-1">{fund.currency || '$'}{fund.current || 0} / {fund.currency || '$'}{fund.targetAmount}</span>
                                            </div>
                                            <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(((fund.current || 0) / fund.targetAmount) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Links */}
                        {paymentLinks.length > 0 && (
                            <div className={`p-8 rounded-3xl ${invert ? 'bg-white/5 border border-white/10' : 'bg-white soft-shadow border border-primary/5'}`}>
                                <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-4">Send a Gift</p>
                                <div className="flex flex-wrap gap-3">
                                    {paymentLinks.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="px-6 py-3 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors">
                                            {link.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* QR Code */}
                    {wedding.gift_qr_image && (
                        <div className="w-full md:w-80 shrink-0">
                            <div className={`p-6 rounded-3xl ${invert ? 'bg-white text-black' : 'bg-white soft-shadow'}`}>
                                <div className="aspect-square rounded-xl overflow-hidden bg-neutral flex items-center justify-center border border-border">
                                    <img src={wedding.gift_qr_image} alt="Payment QR Code" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-center mt-6 text-xs uppercase tracking-widest font-bold opacity-40">Scan to Send Gift</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
