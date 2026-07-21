# Template Audit

## ArtDecoTemplate.tsx
**Wrapper Classes:** `bg-[#1a1a1a] text-[#d4af37] font-serif selection:bg-[#d4af37] selection:text-black pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-4 sm:inset-6 md:inset-8 lg:inset-12 border-[4px] border-[#d4af37]/40 pointer-events-none" />
                <div className="absolute inset-8 sm:inset-10 md:inset-12 lg:inset-16 border-[1px] border-[#d4af37]/20 pointer-events-none" />

                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="z-10 text-center bg-black/80 backdrop-blur-md p-8 sm:p-12 md:p-16 lg:p-24 border border-[#d4af37]/30 max-w-5xl shadow-[0_0_100px_rgba(212,175,55,0.1)]">
                    <span className="text-xs uppercase tracking-[1em] font-black opacity-60 mb-8 sm:mb-10 md:mb-12 lg:mb-12 block">THE GREAT CELEBRATION</span>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl mb-8 leading-none tracking-widest uppercase">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic normal-case block my-8">&</span>
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="w-40 sm:w-48 md:w-56 h-[2px] bg-[#d4af37] mx-auto mb-8 sm:mb-10 md:mb-12" />
                    <p className="text-xl sm:text-2xl tracking-[0.5em] font-light uppercase">{new Date(wedding.wedding_date).getFullYear()}</p>
                    <div className="mt-12 sm:mt-16">
                        <a href="#rsvp" className="px-10 py-5 bg-[#d4af37] text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-xl">Join The Party</a>
                    </div>
                </motion.div>
            </section>
```

## BohoTemplate.tsx
**Wrapper Classes:** `bg-[#fcf8f1] text-[#5d2e0a] font-serif relative pb-24 selection:bg-[#8b4513]/20 overflow-x-hidden`

**Hero Section:**
```tsx
<section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative py-20">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Hero Text Content */}
                    <div className="lg:col-span-7 z-10 text-center lg:text-left order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.8em] font-black opacity-40 mb-6 block">WILD & FREE LOVE</span>
                            
                            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] mb-8 leading-[0.85] text-[#5d2e0a] italic font-serif">
                                {wedding.bride_name.split(' ')[0]} 
                                <span className="block text-3xl sm:text-4xl lg:text-5xl font-light not-italic opacity-20 my-4 lg:my-0 lg:ml-20 tracking-tighter">&</span> 
                                <span className="lg:ml-32 block">{wedding.groom_name.split(' ')[0]}</span>
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-6 mt-12 lg:mt-16 items-center lg:items-start">
                                <motion.a 
                                    href="#rsvp" 
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-12 py-5 bg-[#8b4513] text-[#fcf8f1] rounded-full font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-[#8b4513]/20 transition-all hover:bg-[#5d2e0a]"
                                >
                                    Join The Adventure
                                </motion.a>
                                <div className="text-center lg:text-left">
                                    <p className="text-sm uppercase tracking-widest opacity-60 font-bold">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">{wedding.venue_name}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image / Frame */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="relative group"
                        >
                            {/* Decorative Frame Overlays */}
                            <div className="absolute -inset-4 border border-[#8b4513]/10 rounded-[4rem] group-hover:rotate-3 transition-transform duration-1000" />
                            <div className="absolute -inset-8 border border-[#8b4513]/5 rounded-[5rem] group-hover:-rotate-3 transition-transform duration-1000 delay-75" />
                            
                            <div className="aspect-[4/5] w-full rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-2xl relative z-10">
                                <img 
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'} 
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    loading="eager"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" 
                                />
                                <div className="absolute inset-0 bg-[#8b4513]/10 mix-blend-multiply opacity-30 group-hover:opacity-0 transition-opacity duration-1000" />
                            </div>

                            {/* Floating Badge */}
                            <motion.div 
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#5d2e0a] rounded-full flex items-center justify-center text-[#fcf8f1] p-6 text-center z-20 shadow-2xl rotate-12"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-tighter leading-tight italic">Together Forever</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20"
                >
                    <div className="w-px h-20 bg-[#8b4513]" />
                </motion.div>
            </section>
```

## CinematicTemplate.tsx
**Wrapper Classes:** `bg-black text-white font-sans selection:bg-primary/50 overflow-hidden pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen relative flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 3 }} className="absolute inset-0">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover grayscale brightness-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                </motion.div>

                <div className="z-10 text-center px-4 sm:px-6 max-w-6xl">
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-xs sm:text-sm uppercase tracking-[1em] font-black mb-8 sm:mb-10 md:mb-12 opacity-60">A QUICKWEDS ORIGINAL PRODUCTION</motion.p>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-serif leading-none tracking-tighter mb-8 sm:mb-10 md:mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic text-primary">&amp;</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="flex gap-4 sm:gap-6 md:gap-8 justify-center items-center">
                        <div className="w-12 sm:w-16 md:w-24 h-[1px] bg-white/20" />
                        <p className="text-lg sm:text-xl md:text-2xl font-serif italic">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="w-12 sm:w-16 md:w-24 h-[1px] bg-white/20" />
                    </motion.div>
                </div>
            </section>
```

## ClassicTemplate.tsx
**Wrapper Classes:** `absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60`

**Hero Section:**
```tsx
<section className="h-screen relative flex items-center justify-center overflow-hidden">
                {wedding.hero_image ? (
                    <img
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                        alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                        loading="eager"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover brightness-75 scale-105"
                    />
                ) : (
                    <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: motifColor + '20' }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative text-center text-white z-10 px-4 sm:px-6"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.span 
                            variants={itemVariants}
                            className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-6 sm:mb-7 md:mb-8 block opacity-80"
                        >
                            The Wedding of
                        </motion.span>
                        
                        <motion.h1 
                            variants={itemVariants}
                            className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-serif mb-8 sm:mb-10 md:mb-12 leading-tight"
                        >
                            {wedding.bride_name} <br />
                            <span 
                                className="text-xl sm:text-3xl md:text-5xl italic font-light serif"
                                style={{ color: motifColor }}
                            >
                                &
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </motion.h1>
                        
                        <motion.div 
                            variants={itemVariants}
                            className="w-12 sm:w-16 md:w-20 h-[1px] mx-auto mb-8 sm:mb-10 md:mb-12"
                            style={{ backgroundColor: motifColor }}
                        />
                        
                        <motion.p 
                            variants={itemVariants}
                            className="text-lg sm:text-xl md:text-2xl font-serif italic tracking-wide"
                        >
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </motion.p>
                    </motion.div>
                </motion.div>
                
                <motion.div 
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </motion.div>
            </section>
```

## EditorialTemplate.tsx
**Wrapper Classes:** `bg-[#f7f3ee] pb-24 text-[#201c19]`

**Hero Section:**
```tsx
<section className="relative min-h-screen overflow-hidden px-5 py-10 md:px-10">
                    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9 }}
                            className="relative min-h-[58vh] overflow-hidden bg-black lg:min-h-full"
                        >
                            <img
                                src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                loading="eager"
                                decoding="async"
                                className="h-full w-full object-cover opacity-90"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white md:p-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.42em] opacity-70">Wedding photography edition</p>
                                <p className="mt-3 max-w-lg font-serif text-2xl italic leading-tight md:text-4xl">
                                    {wedding.quote || 'Every frame, a quiet promise.'}
                                </p>
                            </div>
                        </motion.div>
                        <div className="flex flex-col justify-between border-y border-[#201c19]/15 py-8 lg:py-12">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#201c19]/50">Issue 01</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#201c19]/50">{new Date(wedding.wedding_date).getFullYear()}</p>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.9, delay: 0.15 }}
                                className="py-12"
                            >
                                {wedding.logo_initials && (
                                    <MonogramMark
                                        initials={wedding.logo_initials}
                                        brideName={wedding.bride_name}
                                        groomName={wedding.groom_name}
                                        shape={wedding.logo_shape || 'minimal'}
                                        color="#201c19"
                                        motifColor={wedding.motif_color}
                                        fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                                        size="sm"
                                        className="mb-8"
                                    />
                                )}
                                <h1 className="font-serif text-5xl leading-[0.86] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                                    {wedding.bride_name.split(' ')[0]}
                                    <span className="block font-light italic text-primary">&</span>
                                    {wedding.groom_name.split(' ')[0]}
                                </h1>
                                <p className="mt-8 max-w-md text-base leading-7 text-[#5d554f]">
                                    {wedding.story || 'A visual invitation to a day of vows, gathering, and beautifully kept memories.'}
                                </p>
                            </motion.div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-primary">Date and place</p>
                                    <p className="mt-2 font-serif text-2xl italic">
                                        {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-[#5d554f]">{wedding.venue_name}</p>
                                </div>
                                <a href="#rsvp" className="inline-flex min-h-[48px] items-center justify-center bg-[#201c19] px-7 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary">
                                    RSVP
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
```

## EleganceTemplate.tsx
**Wrapper Classes:** `bg-[#faf9f6] text-[#3d3d3d] font-serif relative pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} className="z-10 bg-white/40 backdrop-blur-sm p-8 sm:p-12 md:p-16 lg:p-20 shadow-2xl border border-white relative">
                    <div className="absolute -top-6 -left-6 w-12 sm:w-16 h-12 sm:h-16 border-t-2 border-l-2 border-primary/40" />
                    <div className="absolute -bottom-6 -right-6 w-12 sm:w-16 h-12 sm:h-16 border-b-2 border-r-2 border-primary/40" />

                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-[#1a1a1a] mb-8 leading-tight tracking-tight uppercase">
                        {wedding.bride_name} <br />
                        <span className="text-xl sm:text-2xl md:text-3xl lg:text-3xl italic font-light lowercase text-primary my-6 sm:my-8 block">&</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="w-16 h-[1px] bg-primary/30 mx-auto mb-8 sm:mb-10 md:mb-12" />
                    <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-serif italic mb-12 sm:mb-16 opacity-60">The honor of your presence is requested at our wedding celebration.</p>
                    
                    <a href="#rsvp" className="px-12 py-4 bg-[#1a1a1a] text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all shadow-lg min-h-[44px] flex items-center justify-center">Kindly Respond</a>
                </motion.div>
            </section>
```

## ElopementTemplate.tsx
**Wrapper Classes:** `bg-neutral text-stone-700 font-serif relative pb-24 selection:bg-stone-200`

**Hero Section:**
```tsx
<section className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden bg-white">
                <div className="absolute inset-0 opacity-40 mix-blend-multiply transition-opacity group-hover:opacity-60">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="z-10 text-center max-w-2xl px-4 sm:px-6">
                    <span className="text-xs uppercase tracking-[0.6em] font-bold opacity-40 mb-8 block">Just The Two Of Us</span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif mb-8 text-stone-900 drop-shadow-sm leading-[0.9]">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="italic opacity-30 font-light">&</span> <br />
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <p className="text-xl sm:text-2xl italic opacity-60 mb-12">A quiet union, a loud devotion. We chose forever, just us two.</p>
                    <div className="flex gap-4 sm:gap-6 justify-center">
                        <a href="#rsvp" className="px-8 sm:px-10 py-3 min-h-[44px] flex items-center justify-center bg-stone-900 text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-stone-700 transition-colors">See Our Story</a>
                    </div>
                </motion.div>
            </section>
```

## FilmTemplate.tsx
**Wrapper Classes:** `bg-[#1a1a1a] text-[#ddd] font-mono relative pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center px-4 sm:px-6 relative">
                {/* Film Strip Borders */}
                <div className="absolute top-0 left-0 w-full h-8 sm:h-10 md:h-12 bg-black border-b border-white/20 flex gap-2 sm:gap-3 md:gap-4 overflow-hidden px-2 sm:px-3 md:px-4">
                    {Array(20).fill(0).map((_, i) => <div key={i} className="w-6 sm:w-7 md:w-8 h-5 sm:h-5 md:h-6 bg-white/10 rounded-sm mt-2 sm:mt-2 md:mt-3 flex-shrink-0" />)}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-8 sm:h-10 md:h-12 bg-black border-t border-white/20 flex gap-2 sm:gap-3 md:gap-4 overflow-hidden px-2 sm:px-3 md:px-4">
                    {Array(20).fill(0).map((_, i) => <div key={i} className="w-6 sm:w-7 md:w-8 h-5 sm:h-5 md:h-6 bg-white/10 rounded-sm mt-2 sm:mt-2 md:mt-3 flex-shrink-0" />)}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black p-3 sm:p-4 pb-12 sm:pb-14 md:pb-16 pt-3 sm:pt-4 max-w-lg w-full shadow-2xl rotate-1"
                >
                    <div className="aspect-[4/5] bg-[#222] mb-3 sm:mb-4 relative overflow-hidden group">
                        <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 contrast-125" />
                        <div className="absolute top-4 right-4 text-[10px] text-red-500 font-bold animate-pulse">● REC</div>
                    </div>
                    <div className="text-center font-serif text-black bg-white p-6 sm:p-7 md:p-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tighter">{wedding.bride_name} + {wedding.groom_name}</h1>
                        <p className="text-xs sm:text-xs md:text-sm uppercase tracking-widest border-t border-black/10 pt-3 sm:pt-4 mt-3 sm:pt-4">{new Date(wedding.wedding_date).toDateString()}</p>
                    </div>
                </motion.div>

                <a href="#rsvp" className="mt-8 sm:mt-10 md:mt-12 px-6 sm:px-8 py-3 min-h-[44px] flex items-center justify-center bg-red-600 text-white rounded-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Action! (RSVP)</a>
            </section>
```

## GardenTemplate.tsx
**Wrapper Classes:** `bg-[#f0f7f4] text-[#2d6a4f] font-serif relative pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10">
                <div className="border-[1px] border-[#2d6a4f]/20 p-3 sm:p-4 rounded-t-full">
                    <div className="border-[1px] border-[#2d6a4f]/40 p-8 sm:p-12 pt-20 sm:pt-24 md:pt-32 rounded-t-full relative bg-white/60 backdrop-blur-sm shadow-xl">
                        <div className="absolute top-8 sm:top-10 md:top-12 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl animate-bounce">🌿</div>

                        <p className="uppercase tracking-[0.3em] text-xs font-bold text-[#52b788] mb-6 sm:mb-8">Join the Wedding of</p>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif text-[#1b4332] mb-6 sm:mb-8">
                            {wedding.bride_name} <br /><span className="text-2xl sm:text-2xl md:text-3xl italic font-light text-[#40916c]">&</span><br /> {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-xl italic text-[#40916c] mb-8 sm:mb-10 md:mb-12">Under the open sky</p>

                        <div className="mx-auto w-40 sm:w-44 md:w-48 h-40 sm:h-44 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-8 sm:mb-10 md:mb-12">
                            <img src={wedding.couple_photo || wedding.hero_image || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover" />
                        </div>

                        <a href="#rsvp" className="px-8 sm:px-10 py-3 min-h-[44px] flex items-center justify-center rounded-full bg-[#2d6a4f] text-white font-bold hover:bg-[#1b4332] shadow-lg shadow-[#2d6a4f]/20 transition-all transform hover:-translate-y-1">
                            Save the Date
                        </a>
                    </div>
                </div>
            </section>
```

## GlitchTemplate.tsx
**Wrapper Classes:** `bg-black text-green-400 font-mono min-h-screen relative pb-24 selection:bg-green-400 selection:text-black`

**Hero Section:**
```tsx
<section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
                <div className="max-w-6xl z-10">
                    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0 }} className="border-l-4 border-green-400 pl-4 sm:pl-6 md:pl-8 mb-8 sm:mb-10 md:mb-12">
                        <p className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 typing-effect w-fit">INITIALIZING UNION PROTOCOL...</p>
                        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 mb-3 sm:mb-4 leading-none tracking-tighter filter hue-rotate-90 animate-pulse">
                            {wedding.bride_name}<br />{wedding.groom_name}
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 opacity-80 text-xs">
                        <div className="border border-green-400/30 p-3 sm:p-4">
                            <p className="opacity-50 mb-1">DATE_TIME</p>
                            <p className="text-xs sm:text-sm">{wedding.wedding_date}</p>
                        </div>
                        <div className="border border-green-400/30 p-3 sm:p-4">
                            <p className="opacity-50 mb-1">LOCATION_DATA</p>
                            <p className="text-xs sm:text-sm">{wedding.venue_name}</p>
                        </div>
                    </div>

                    <a href="#rsvp" className="inline-block px-6 sm:px-8 py-3 min-h-[44px] flex items-center bg-green-400 text-black font-black uppercase hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all skew-x-[-12deg]">
                        <span className="inline-block skew-x-[12deg]">Confirm_Presence</span>
                    </a>
                </div>

                <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-30 mix-blend-screen pointer-events-none">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover filter contrast-150 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent" />
                </div>
            </section>
```

## LuxuryTemplate.tsx
**Wrapper Classes:** `bg-[#fbf7ef] text-[#2b2520] font-serif selection:bg-[#b9975b] selection:text-white pb-24`

**Hero Section:**
```tsx
<section className="relative min-h-screen overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(185,151,91,0.10)_1px,transparent_1px),linear-gradient(rgba(185,151,91,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
                    <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="order-2 lg:order-1"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#b9975b]">
                                Planners of a beautiful day
                            </p>
                            <h1 className="mt-8 text-5xl leading-[0.92] text-[#241f1b] sm:text-6xl md:text-7xl lg:text-8xl">
                                {wedding.bride_name}
                                <span className="block text-[0.55em] italic leading-none text-[#b9975b]">&</span>
                                {wedding.groom_name}
                            </h1>
                            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.24em] text-[#6f645b]">
                                <span>{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span className="h-px w-12 bg-[#b9975b]" />
                                <span>{wedding.venue_name}</span>
                            </div>
                            <p className="mt-8 max-w-xl text-lg leading-8 text-[#6f645b]">
                                {wedding.story || 'An elegant celebration shaped with intention, beauty, and every thoughtful detail in place.'}
                            </p>
                            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                                <a href="#rsvp" className="inline-flex min-h-[48px] items-center justify-center bg-[#2b2520] px-8 text-xs font-bold uppercase tracking-[0.28em] text-white transition-all hover:bg-[#b9975b]">
                                    RSVP
                                </a>
                                <a href="#details" className="inline-flex min-h-[48px] items-center justify-center border border-[#b9975b]/50 px-8 text-xs font-bold uppercase tracking-[0.28em] text-[#2b2520] transition-all hover:border-[#2b2520]">
                                    Details
                                </a>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2 }}
                            className="order-1 lg:order-2"
                        >
                            <div className="relative mx-auto aspect-[4/5] max-h-[760px] overflow-hidden border border-[#b9975b]/25 bg-white p-3 shadow-[0_40px_120px_rgba(43,37,32,0.16)]">
                                <img
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    loading="eager"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute -bottom-px -left-px bg-[#fbf7ef] px-6 py-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b9975b]">Est. {new Date(wedding.wedding_date).getFullYear()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
```

## MidnightTemplate.tsx
**Wrapper Classes:** `bg-[#0f0f0f] text-[#cfb53b] relative overflow-hidden pb-24 font-serif`

**Hero Section:**
```tsx
<section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
                <div className="flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 border-r border-[#cfb53b]/10 bg-gradient-to-b from-[#0f0f0f] to-[#151515]">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <span className="text-xs font-black tracking-[0.5em] uppercase text-[#cfb53b]/60 mb-8 block">The Celebration</span>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-white mb-8 leading-tight">
                            {wedding.bride_name} <br />
                            <span className="text-2xl sm:text-3xl md:text-4xl italic text-[#cfb53b] font-light">&</span><br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-serif italic text-white/60 mb-8 sm:mb-10 md:mb-12 lg:mb-12 max-w-md">
                            Join us for an evening of elegance, love, and starlight.
                        </p>
                        <a href="#rsvp" className="px-6 sm:px-8 md:px-10 lg:px-10 py-3 sm:py-4 md:py-4 lg:py-4 min-h-[44px] flex items-center border border-[#cfb53b] text-[#cfb53b] hover:bg-[#cfb53b] hover:text-black transition-all uppercase text-xs font-black tracking-[0.2em]">RSVP Now</a>
                    </motion.div>
                </div>
                <div className="relative h-[50vh] lg:h-auto">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0f0f0f]" />
                </div>
            </section>
```

## MinimalTemplate.tsx
**Wrapper Classes:** `bg-white text-neutral-800 pb-24`

**Hero Section:**
```tsx
<section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
                
                <div className="max-w-4xl text-center px-4 sm:px-6 md:px-12 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 1.5 }}
                    >
                        <motion.p 
                            className="text-xs uppercase tracking-[0.5em] font-medium mb-8 sm:mb-10 md:mb-12"
                            style={{ color: motifColor }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            Save the Date
                        </motion.p>
                        
                        <motion.h1 
                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-tight text-neutral-900 mb-10 sm:mb-12 md:mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            {wedding.bride_name} <br />
                            <span 
                                className="font-light italic serif ml-0 sm:ml-2 md:ml-4"
                                style={{ color: motifColor }}
                            >
                                &
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </motion.h1>
                        
                        <motion.div 
                            className="w-16 sm:w-20 md:w-24 h-[1px] mx-auto mb-10 sm:mb-12 md:mb-16"
                            style={{ backgroundColor: motifColor }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        />
                        
                        <motion.p 
                            className="text-lg sm:text-xl md:text-2xl font-light tracking-widest uppercase text-neutral-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                        >
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </motion.p>
                        
                        <motion.p
                            className="text-base sm:text-lg font-light text-neutral-400 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.8 }}
                        >
                            {wedding.venue_name}
                        </motion.p>
                    </motion.div>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-30" style={{ backgroundColor: motifColor }} />
                </div>
            </section>
```

## RomanticTemplate.tsx
**Wrapper Classes:** `relative bg-[#fff8f5] pb-24 font-serif text-[#55373b] selection:bg-[#b97983]/20`

**Hero Section:**
```tsx
<section className="relative min-h-screen overflow-hidden px-5 py-12">
                    <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(185,121,131,0.20),transparent_62%)]" />
                    <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="text-center lg:text-left"
                        >
                            <Heart className="mx-auto mb-8 h-10 w-10 fill-[#b97983] text-[#b97983] lg:mx-0" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#b97983]">Romantic estate celebration</p>
                            <h1 className="mt-8 text-5xl leading-[0.95] text-[#55373b] sm:text-6xl md:text-7xl">
                                {wedding.bride_name}
                                <span className="block text-[0.55em] font-light italic text-[#b97983]">&</span>
                                {wedding.groom_name}
                            </h1>
                            <p className="mx-auto mt-8 max-w-lg text-lg italic leading-8 text-[#816066] lg:mx-0">
                                {wedding.quote || 'Cordially invited to a tender evening of vows, dinner, and dancing.'}
                            </p>
                            <a href="#rsvp" className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#b97983] px-8 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-[0_18px_45px_rgba(185,121,131,0.25)] transition-all hover:bg-[#55373b]">
                                RSVP
                            </a>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.1 }}
                            className="relative"
                        >
                            <div className="mx-auto aspect-[5/6] max-h-[740px] overflow-hidden rounded-t-full border border-[#b97983]/25 bg-white p-3 shadow-[0_35px_100px_rgba(85,55,59,0.14)]">
                                <img
                                    src={wedding.hero_image || wedding.couple_photo || '/logo.png'}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                                    loading="eager"
                                    decoding="async"
                                    className="h-full w-full rounded-t-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-5 left-1/2 w-[82%] -translate-x-1/2 bg-white/88 px-6 py-5 text-center shadow-[0_20px_60px_rgba(85,55,59,0.12)] backdrop-blur">
                                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#b97983]">
                                    {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="mt-1 text-sm text-[#816066]">{wedding.venue_name}</p>
                            </div>
                        </motion.div>
                    </div>
                </section>
```

## RoyalTemplate.tsx
**Wrapper Classes:** `bg-[#121212] text-[#f2d0a4] relative overflow-hidden min-h-screen font-serif`

**Hero Section:**
```tsx
<section className="min-h-screen py-20 relative overflow-hidden flex items-center justify-center border-b border-primary/20">
                {wedding.teaser_video ? (
                    <video src={wedding.teaser_video} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125" autoPlay muted loop />
                ) : (
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]" />

                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="z-10 text-center max-w-6xl px-4 sm:px-6 md:px-8 lg:px-8 py-6 sm:py-12 md:py-16 lg:py-24 border-[4px] border-primary/20 m-4 sm:m-6 md:m-8 lg:m-12 bg-black/40 backdrop-blur-sm relative"
                >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#121212] rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                        {wedding.logo_initials ? (
                            <MonogramMark
                                initials={wedding.logo_initials}
                                brideName={wedding.bride_name}
                                groomName={wedding.groom_name}
                                shape={wedding.logo_shape || 'crest'}
                                color={wedding.logo_color || wedding.motif_color}
                    motifColor={wedding.motif_color}
                                fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                                size="sm"
                                inverted
                            />
                        ) : (
                            <Heart className="w-12 h-12 text-primary fill-primary" />
                        )}
                    </div>

                    <span className="text-xs uppercase tracking-[1em] font-black opacity-60 mb-12 block">BY ROYAL PROCLAMATION</span>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[8rem] font-serif border-y-2 border-primary/40 py-8 sm:py-12 md:py-16 lg:py-16 mb-8 sm:mb-12 md:mb-16 lg:mb-16 leading-tight tracking-[0.05em] uppercase">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic normal-case block my-4 sm:my-8 md:my-12 lg:my-12 tracking-widest">and</span>
                        {wedding.groom_name}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl font-serif italic mb-8 sm:mb-10 md:mb-12 lg:mb-12 max-w-3xl mx-auto opacity-80">His Majesty & Her Royal Highness cordially invite you to witness the union of two royal houses</p>
                    <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center justify-center mb-8 sm:mb-12 md:mb-16 lg:mb-16">
                        <div className="w-24 h-[1px] bg-primary/40" />
                        <p className="text-sm uppercase tracking-[1em] font-black">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="w-24 h-[1px] bg-primary/40" />
                    </div>
                </motion.div>
            </section>
```

## RSVPFocusTemplate.tsx
**Wrapper Classes:** `bg-white pb-24`

**Hero Section:**
```tsx
<section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white" />
                {wedding.hero_image && (
                    <img 
                        src={wedding.hero_image || wedding.couple_photo || '/logo.png'} 
                        alt=""
                        loading="eager"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover opacity-10" 
                    />
                )}
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative text-center z-10 px-4 sm:px-6 md:px-12 max-w-4xl"
                >
                    <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10" style={{ color: motifColor }}>
                        You&apos;re Invited
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-neutral-900 mb-10 sm:mb-12 md:mb-16 leading-tight">
                        {wedding.bride_name} <br />
                        <span className="text-xl sm:text-2xl md:text-3xl italic font-light" style={{ color: motifColor }}>&</span>{' '}
                        <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-20 sm:w-24 h-[1px] mx-auto mb-10 sm:mb-12" style={{ backgroundColor: motifColor }} />
                    <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-neutral-600 mb-12 sm:mb-14">
                        {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                    <p className="text-base sm:text-lg font-light text-neutral-500 mb-16 sm:mb-20">
                        at {wedding.venue_name}
                    </p>
                    <div className="mt-8">
                        <a 
                            href="#rsvp" 
                            className="inline-flex items-center justify-center px-12 sm:px-16 py-5 sm:py-6 font-bold uppercase tracking-widest text-sm sm:text-base hover:scale-105 transition-all shadow-xl min-h-[56px]"
                            style={{ backgroundColor: motifColor, color: 'white' }}
                        >
                            RSVP Here
                        </a>
                    </div>
                    <p className="text-sm font-light text-neutral-400 mt-8 sm:mt-10">
                        Your presence is our greatest gift
                    </p>
                </motion.div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-30" style={{ backgroundColor: motifColor }} />
                </div>
            </section>
```

## RusticTemplate.tsx
**Wrapper Classes:** `bg-[#f5ebe0] text-[#5e503f] font-serif relative pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
                <div className="absolute inset-4 border-[1px] border-[#5e503f]/20 pointer-events-none" />
                <div className="absolute inset-6 border-[1px] border-[#5e503f]/20 pointer-events-none" />

                <div className="text-center max-w-4xl z-10">
                    <div className="w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 mx-auto mb-6 sm:mb-7 md:mb-8 opacity-40">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </div>
                    <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-4 sm:mb-5 md:mb-6">We&apos;re getting married</p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl mb-6 sm:mb-7 md:mb-8 font-black text-[#8d7966] drop-shadow-sm">
                        {wedding.bride_name.split(' ')[0]} & {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 border-y border-[#5e503f]/20 py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
                        <span className="text-lg sm:text-xl md:text-2xl">{new Date(wedding.wedding_date).toLocaleDateString()}</span>
                        <span className="w-2 h-2 rounded-full bg-[#5e503f]/40 hidden sm:block" />
                        <span className="text-lg sm:text-xl md:text-2xl">{wedding.venue_name}</span>
                    </div>
                    <div className="mt-8 sm:mt-10 md:mt-12">
                        <a href="#rsvp" className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-4 min-h-[44px] flex items-center justify-center bg-[#5e503f] text-[#f5ebe0] rounded-lg font-bold tracking-widest uppercase hover:bg-[#493e31] transition-colors shadow-lg">RSVP</a>
                    </div>
                </div>
            </section>
```

## SakuraTemplate.tsx
**Wrapper Classes:** `bg-[#fff0f5] text-[#8e405a] relative font-serif`

**Hero Section:**
```tsx
<section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
                <div className="w-32 sm:w-40 md:w-56 lg:w-72 h-32 sm:h-40 md:h-56 lg:h-72 bg-gradient-to-br from-pink-200/40 to-transparent rounded-full absolute -top-24 -left-24 blur-3xl animate-pulse" />
                <div className="w-24 sm:w-32 md:w-48 lg:w-64 h-24 sm:h-32 md:h-48 lg:h-64 bg-gradient-to-tl from-pink-300/30 to-transparent rounded-full absolute bottom-0 right-0 blur-3xl" />

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-white/60 backdrop-blur-sm p-6 sm:p-8 md:p-16 lg:p-24 rounded-[3rem] border border-white max-w-4xl shadow-xl">
                    <div className="absolute top-6 left-6 text-2xl sm:text-3xl md:text-4xl lg:text-4xl opacity-50">🌸</div>

                    <p className="font-serif italic text-lg sm:text-xl md:text-2xl lg:text-2xl text-[#8e405a]/60 mb-4 sm:mb-5 md:mb-6 lg:mb-6">Blossoming Love</p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif text-[#8e405a] mb-8 leading-none">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl block my-4 font-sans font-light uppercase tracking-widest text-[#8e405a]/40">and</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="inline-block border-y border-[#8e405a]/20 py-3 sm:py-4 md:py-4 lg:py-4 px-6 sm:px-8 md:px-12 lg:px-12 mb-8 sm:mb-10 md:mb-12 lg:mb-12">
                        <p className="font-serif text-lg sm:text-lg md:text-xl lg:text-xl tracking-widest uppercase">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="w-40 sm:w-48 md:w-56 lg:w-64 h-40 sm:h-48 md:h-56 lg:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-12">
                        <img src={wedding.couple_photo || wedding.hero_image || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover" />
                    </div>

                    <a href="#rsvp" className="px-6 sm:px-8 md:px-10 lg:px-10 py-3 sm:py-4 md:py-4 lg:py-4 min-h-[44px] flex items-center justify-center bg-[#ffb7c5] text-white rounded-2xl font-bold hover:bg-[#ff9eb0] transition-colors shadow-lg shadow-pink-200">
                        Join Our Celebration
                    </a>
                </motion.div>
            </section>
```

## TimelineTemplate.tsx
**Wrapper Classes:** `bg-white font-serif pb-24`

**Hero Section:**
```tsx
<section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />
                
                <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2" style={{ borderColor: motifColor + '40' }} />
                <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2" style={{ borderColor: motifColor + '40' }} />
                
                <div className="relative text-center z-10 px-4 sm:px-6 md:px-12 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        <p className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10 md:mb-12" style={{ color: motifColor }}>
                            Our Love Story
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-neutral-900 mb-10 sm:mb-12 md:mb-16 leading-tight">
                            {wedding.bride_name} <br />
                            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl italic font-light" style={{ color: motifColor }}>&</span>{' '}
                            <br />
                            {wedding.groom_name}
                        </h1>
                        <div className="w-20 sm:w-24 md:w-32 h-[1px] mx-auto mb-10 sm:mb-12 md:mb-16" style={{ backgroundColor: motifColor }} />
                        <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-neutral-600">
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                        <p className="text-base sm:text-lg md:text-xl font-light text-neutral-400 mt-4">
                            {wedding.venue_name}
                        </p>
                    </motion.div>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </div>
            </section>
```

## TraditionalTemplate.tsx
**Wrapper Classes:** `bg-neutral-50 text-neutral-700 font-serif relative pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative">
                <div className="absolute inset-8 sm:inset-12 md:inset-16 border border-neutral-200 pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1 }} 
                    className="z-10 bg-white p-8 sm:p-12 md:p-16 lg:p-24 shadow-sm border border-neutral-100"
                >
                    <motion.p 
                        className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-8 sm:mb-10 md:mb-12"
                        style={{ color: motifColor }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        The Marriage of
                    </motion.p>
                    
                    <motion.h1 
                        className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-neutral-800 mb-8 sm:mb-10 md:mb-12 border-y border-neutral-200 py-12 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        {wedding.bride_name} <br />
                        <span 
                            className="text-2xl sm:text-2xl md:text-3xl italic font-light my-6 sm:my-8 md:my-10 block"
                            style={{ color: motifColor }}
                        >
                            &amp;
                        </span>
                        {wedding.groom_name}
                    </motion.h1>
                    
                    <motion.div 
                        className="space-y-4 sm:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        <p className="text-xl sm:text-2xl tracking-[0.2em] font-light">
                            {new Date(wedding.wedding_date).toLocaleDateString()}
                        </p>
                        <p className="text-lg sm:text-xl italic text-neutral-400">
                            {wedding.venue_name}
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        className="mt-12 sm:mt-16"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <a 
                            href="#rsvp" 
                            className="inline-flex items-center justify-center px-10 py-4 border-2 font-bold uppercase tracking-widest text-xs min-h-[44px] hover:text-white transition-all"
                            style={{ borderColor: motifColor, color: motifColor }}
                        >
                            Request RSVP
                        </a>
                    </motion.div>
                </motion.div>
            </section>
```

## TropicalTemplate.tsx
**Wrapper Classes:** `bg-[#e0f2f1] text-[#00695c] relative pb-24 font-serif`

**Hero Section:**
```tsx
<section className="min-h-screen py-20 flex flex-col items-center justify-center relative overflow-hidden group">
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 opacity-20 pointer-events-none"
                >
                    <svg viewBox="0 0 200 200" className="fill-current"><path d="M100 0 C120 40 160 80 200 100 C160 120 120 160 100 200 C80 160 40 120 0 100 C40 80 80 40 100 0" /></svg>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="text-center z-10 px-4 sm:px-6">
                    <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 sm:mb-10 md:mb-12 lg:mb-12 animate-float">🏝️</div>
                    <span className="text-xs uppercase tracking-[1em] font-black mb-8 block opacity-40">OUR PARADISE FOUND</span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl lg:text-[14vw] font-serif mb-8 sm:mb-10 md:mb-12 lg:mb-12 tracking-tighter leading-[0.7] text-[#004d40]">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="text-2xl sm:text-3xl md:text-4xl align-middle italic text-primary">&</span> <br />
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="p-1 px-6 sm:px-8 md:px-12 lg:px-12 border-4 border-[#00695c] inline-block mb-8 sm:mb-10 md:mb-16 lg:mb-16 relative group-hover:bg-[#00695c] group-hover:text-white transition-all duration-500">
                        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-serif py-2 sm:py-3 md:py-4 lg:py-4">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <br />
                    <motion.a
                        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,105,92,0.2)" }}
                        href="#rsvp"
                        className="px-8 sm:px-12 md:px-20 lg:px-20 py-3 sm:py-4 md:py-6 lg:py-6 min-h-[44px] flex items-center justify-center bg-[#00695c] text-white rounded-full font-black tracking-widest uppercase text-xs"
                    >
                        Pack Your Bags
                    </motion.a>
                </motion.div>

                {/* Wave Bottom Decoration */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-20">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 sm:h-24 md:h-32 lg:h-32 fill-[#00695c]"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" /></svg>
                </div>
            </section>
```

## UrbanTemplate.tsx
**Wrapper Classes:** `bg-[#111] text-white selection:bg-primary/50 font-sans`

**Hero Section:**
```tsx
<section className="min-h-screen py-20 flex bg-black relative group">
                <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    src={wedding.hero_image}
                    className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-[10s]"
                />
                <div className="z-10 px-4 sm:px-6 md:px-12 lg:px-32 py-12 sm:py-16 md:py-24 lg:py-32 flex flex-col justify-between w-full relative">
                    <div className="flex justify-between items-start border-b border-white/10 pb-6 sm:pb-8 md:pb-12 lg:pb-12">
                        <div className="space-y-2">
                            <p className="font-mono text-xs uppercase tracking-[0.5em] text-primary">Access Level: VIP</p>
                            <p className="font-mono text-xs uppercase tracking-widest opacity-40">Serial No. {wedding.id.slice(0, 8)}</p>
                        </div>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                            <Heart className="w-8 sm:w-10 md:w-12 lg:w-12 h-8 sm:h-10 md:h-12 lg:h-12 text-primary" />
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-3xl sm:text-4xl md:text-8xl lg:text-[15vw] font-black uppercase leading-[0.75] mb-8 sm:mb-10 md:mb-12 lg:mb-12 tracking-tighter mix-blend-difference">
                            {wedding.bride_name.split(' ')[0]}<br />
                            <span className="text-primary">+</span><br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>
                        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 font-mono text-xs sm:text-sm md:text-sm lg:text-sm uppercase tracking-[0.3em] bg-black/50 backdrop-blur-md p-4 sm:p-5 md:p-6 lg:p-6 border-l-4 border-primary inline-flex">
                            <p>[ DATE: {new Date(wedding.wedding_date).toLocaleDateString()} ]</p>
                            <p>[ LOG: {wedding.venue_name} ]</p>
                        </div>
                    </motion.div>

                    <div className="flex justify-end">
                        <a href="#rsvp" className="text-primary hover:text-white transition-all text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter hover:tracking-widest duration-500 min-h-[44px] flex items-center">
                            ENTER EVENT →
                        </a>
                    </div>
                </div>
            </section>
```

## VintageTemplate.tsx
**Wrapper Classes:** `bg-[#fdfbf6] text-[#5d544b] font-serif relative pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-24 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative overflow-hidden">
                <div className="absolute inset-8 border-[0.5px] border-[#5d544b]/20 pointer-events-none rounded-[2rem]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <p className="uppercase tracking-[0.4em] text-xs font-bold mb-8 sm:mb-10 md:mb-12 opacity-40">
                        Together with their families
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-9xl mb-8 sm:mb-10 md:mb-12 text-[#433c35] drop-shadow-sm">
                        {wedding.bride_name} <br />
                        <span className="text-2xl sm:text-2xl md:text-3xl italic font-light opacity-30 my-4 sm:my-5 md:my-6 block">
                            &
                        </span>
                        {wedding.groom_name}
                    </h1>
                    <div className="inline-block border-y border-[#5d544b]/20 py-6 sm:py-7 md:py-8 px-12 sm:px-14 md:px-16 bg-white/30 backdrop-blur-sm rounded-lg">
                        <p className="text-lg sm:text-lg md:text-lg tracking-widest lowercase font-light italic mb-1 sm:mb-2">
                            at the sunset of
                        </p>
                        <p className="text-2xl sm:text-2xl md:text-3xl uppercase tracking-[0.2em] font-bold">
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </motion.div>
            </section>
```

## VogueTemplate.tsx
**Wrapper Classes:** `bg-white text-black font-sans selection:bg-black selection:text-white pb-24`

**Hero Section:**
```tsx
<section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[60vh] md:h-full order-2 md:order-1">
                    <img src={wedding.hero_image || wedding.couple_photo || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                </div>
                <div className="flex flex-col justify-between px-4 sm:px-6 md:px-24 py-12 sm:py-16 md:py-24 order-1 md:order-2 bg-white">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1">The Edition</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Vol. 01</span>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-9xl font-serif leading-[0.85] -ml-0 sm:-ml-1 md:-ml-2 mb-6 sm:mb-7 md:mb-8 mix-blend-difference">
                            {wedding.bride_name.split(' ')[0]} <br />
                            <span className="font-sans font-light italic ml-0 sm:ml-6 md:ml-12 text-2xl sm:text-3xl md:text-6xl opacity-50">&</span> <br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>

                        <div className="flex gap-4 sm:gap-6 md:gap-8 items-end mt-8 sm:mt-10 md:mt-12">
                            <div className="flex-1 border-t border-black pt-3 sm:pt-4 md:pt-4">
                                <p className="text-xs font-bold uppercase tracking-widest mb-2">Ceremony</p>
                                <p className="text-lg sm:text-lg md:text-xl font-serif italic">{wedding.wedding_date}</p>
                            </div>
                            <a href="#rsvp" className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 min-h-[44px] bg-black text-white rounded-full flex items-center justify-center text-xs font-bold uppercase tracking-widest hover:scale-110 transition-transform flex-shrink-0">
                                RSVP
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
```

## WhimsicalTemplate.tsx
**Wrapper Classes:** `bg-[#fff9fc] text-[#e3a6c1] relative overflow-hidden pb-24 font-serif`

**Hero Section:**
```tsx
<section className="min-h-screen py-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                    <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-16 relative group">
                        <div className="w-40 sm:w-48 md:w-56 lg:w-64 h-40 sm:h-48 md:h-56 lg:h-64 rounded-full border-[12px] border-white shadow-2xl overflow-hidden mx-auto rotate-6 group-hover:rotate-0 transition-transform duration-700">
                            <img src={wedding.couple_photo || wedding.hero_image || '/logo.png'} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" decoding="async" className="w-full h-full object-cover scale-125" />
                        </div>
                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl lg:text-[12vw] font-serif leading-none tracking-tighter text-[#4A4444] mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                        Magic is <br />
                        <span className="text-primary italic">Real</span>
                    </h1>
                    <p className="text-3xl font-serif italic text-primary/60 mb-12">{wedding.bride_name.split(' ')[0]} & {wedding.groom_name.split(' ')[0]}</p>
                    <motion.a
                        whileHover={{ scale: 1.1, rotate: -2 }}
                        href="#rsvp"
                        className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 min-h-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white font-black tracking-widest uppercase text-xs shadow-[0_10px_30px_rgba(227,166,193,0.4)]"
                    >
                        Count Me In!
                    </motion.a>
                </motion.div>
            </section>
```

