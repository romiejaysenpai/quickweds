'use client';

import { motion } from 'framer-motion';
import type { Wedding } from '@/types/wedding';

interface GiftSectionProps {
    wedding: Wedding;
    invert?: boolean;
}

export default function GiftSection({ wedding, invert = false }: GiftSectionProps) {
    if (!wedding.gift_bank && !wedding.gift_qr_image && !wedding.gift_account_number) return null;

    let registryLinks: { title: string; url: string }[] = [];
    let cashFunds: { title: string; description?: string; targetAmount: number; currency?: string; current?: number }[] = [];
    let paymentLinks: { title: string; url: string }[] = [];

    try {
        if (wedding.gift_registry_links) registryLinks = typeof wedding.gift_registry_links === 'string' ? JSON.parse(wedding.gift_registry_links) : wedding.gift_registry_links;
        if (wedding.cash_funds) cashFunds = typeof wedding.cash_funds === 'string' ? JSON.parse(wedding.cash_funds) : wedding.cash_funds;
        if (wedding.payment_links) paymentLinks = typeof wedding.payment_links === 'string' ? JSON.parse(wedding.payment_links) : wedding.payment_links;
    } catch { }

    const template = wedding.template || 'classic';
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = ['midnight', 'cinematic', 'royal', 'urban', 'glitch', 'film', 'artdeco'].includes(template) || invert;
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);

    const cardClass = isSharp 
        ? `border border-white/20 shadow-none ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-none` 
        : isVintage
        ? `border-[4px] double border-primary/20 bg-white/50 backdrop-blur-2xl shadow-xl rounded-sm`
        : `rounded-[2rem] md:rounded-[3rem] ${isDark ? 'bg-white/10 backdrop-blur-2xl border border-white/20' : 'bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-primary/5'}`;

    return (
        <section className={`py-24 md:py-32 px-4 md:px-6 relative z-10 ${isDark ? 'text-white' : 'text-[#4A4444]'}`}>
            <div className="max-w-5xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: isSharp ? 0 : 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={isSharp ? { duration: 0.8, ease: "easeOut" } : { duration: 1 }}
                    className="text-center mb-16"
                >
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block opacity-80">With Love</span>
                    <h2 className={`text-5xl md:text-6xl font-serif mb-6 ${isDark ? 'text-white' : 'text-[#4A4444]'}`}>Gift Registry</h2>
                    <p className={`text-lg md:text-xl leading-relaxed ${isDark ? 'text-white/80' : 'text-[#4A4444]/80'} font-serif italic max-w-2xl mx-auto`}>
                        Your presence is the greatest gift of all. However, if you wish to honor us with a gift, a contribution towards our future together would be appreciated.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
                    <div className="flex-1 space-y-6 w-full">
                        {/* Bank Details */}
                        {(wedding.gift_bank || wedding.gift_account_name || wedding.gift_account_number) && (
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={`p-6 md:p-10 ${cardClass}`}
                            >
                                <div className="space-y-6">
                                    {wedding.gift_bank && (
                                        <div>
                                            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-50 mb-1">Bank / App</p>
                                            <p className="text-xl md:text-2xl font-bold">{wedding.gift_bank}</p>
                                        </div>
                                    )}
                                    {wedding.gift_account_name && (
                                        <div>
                                            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-50 mb-1">Account Name</p>
                                            <p className="text-xl md:text-2xl font-serif">{wedding.gift_account_name}</p>
                                        </div>
                                    )}
                                    {wedding.gift_account_number && (
                                        <div>
                                            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-50 mb-1">Account Number</p>
                                            <p className="font-mono text-xl md:text-2xl tracking-wider select-all">{wedding.gift_account_number}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Registry Links */}
                        {registryLinks.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={`p-6 md:p-10 ${cardClass}`}
                            >
                                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-50 mb-6">Gift Registries</p>
                                <div className="space-y-3">
                                    {registryLinks.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className={`flex items-center justify-between p-5 ${isSharp ? 'border border-white/20 hover:bg-white/5' : 'bg-primary/10 hover:bg-primary/20 rounded-2xl border border-primary/10'} transition-colors group`}>
                                            <span className="font-bold text-sm md:text-base">{link.title}</span>
                                            <span className="text-primary text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-50 group-hover:opacity-100 transition-opacity">Visit &rarr;</span>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* QR Code Column */}
                    {wedding.gift_qr_image && (
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-96 shrink-0"
                        >
                            <div className={`p-6 md:p-10 ${cardClass}`}>
                                <div className={`aspect-square overflow-hidden bg-white/50 flex items-center justify-center border-2 border-white relative group ${isSharp ? 'rounded-none' : 'rounded-3xl'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    <img src={wedding.gift_qr_image} alt="Payment QR Code" className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <p className="text-center mt-8 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-50">Scan to Send Gift</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
