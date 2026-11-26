'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Book, Video, Camera, Star, Heart, LayoutDashboard, UsersRound } from 'lucide-react';

interface GuideItemBase {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  mediaUrl: string;
  videoUrl?: string;
}

interface GuideItemStep extends GuideItemBase {
  steps: string[];
}

interface GuideItemTemplate extends GuideItemBase {
  templates: Array<{ name: string; description: string }>;
}

interface GuideItemFeature extends GuideItemBase {
  features: string[];
}

type GuideItem = GuideItemStep | GuideItemTemplate | GuideItemFeature;

const guideSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    items: [
      {
        id: 'create-site',
        title: 'Step 1: Create Your Wedding Site',
        description: 'Start by clicking "Create Free Site" on our landing page. This takes you to our Intelligent Builder where you can bring your wedding vision to life.',
        steps: [
          'Click "Create Free Site" on the landing page',
          'Enter your names as a couple',
          'Select your wedding date and time',
          'Add your venue name and address with Google Maps link',
        ],
        mediaType: 'screenshot',
        mediaUrl: '/uploads/guide/create-site-step1.png',
      },
    ],
  },
  {
    id: 'personalize',
    title: 'Personalize Your Story',
    icon: Heart,
    items: [
      {
        id: 'our-story',
        title: 'Step 2: Share Your Journey',
        description: 'Add personal touches that make your wedding site uniquely yours. Your story matters, and this is where you share it with your guests.',
        steps: [
          'Write "Our Story" - how you met and fell in love',
          'Add a meaningful wedding quote that defines your relationship',
          'Create a custom hashtag (e.g., #SterlingUnion2026) for social media',
        ],
        mediaType: 'screenshot',
        mediaUrl: '/uploads/guide/personalize-story.png',
      },
    ],
  },
  {
    id: 'aesthetic',
    title: 'Choose Your Aesthetic',
    icon: Star,
    items: [
      {
        id: 'select-template',
        title: 'Step 3: Select a Template',
        description: 'We offer a variety of designer templates, each designed to capture a different wedding style. Choose the one that reflects your personality and wedding vibe.',
        templates: [
          { name: 'Royal', description: 'Grand, palace-like elegance' },
          { name: 'Editorial', description: 'Sleek, modern magazine style' },
          { name: 'Vintage', description: 'Timeless romance with classic textures' },
          { name: 'Minimal', description: 'Clean and sophisticated simplicity' },
        ],
        mediaType: 'carousel',
        mediaUrl: '/uploads/guide/template-selection.png',
      },
      {
        id: 'pick-motif',
        title: 'Step 4: Pick Your Motif Color',
        description: 'Select a motif color that will be used for buttons, accents, and icons throughout your site. This ensures a perfectly cohesive look that matches your wedding colors.',
        mediaType: 'screenshot',
        mediaUrl: '/uploads/guide/color-picker.png',
      },
    ],
  },
  {
    id: 'media',
    title: 'Add Your Media',
    icon: Camera,
    items: [
      {
        id: 'hero-image',
        title: 'Step 5: Choose Your Hero Image',
        description: 'This is the first thing guests will see when they visit your site. Make it count with a beautiful, high-quality photo of you both that captures your connection.',
        steps: [
          'Upload a high-resolution couple photo',
          'Ensure good lighting and composition',
          'Crop to highlight both of you clearly',
        ],
        mediaType: 'screenshot',
        mediaUrl: '/uploads/guide/hero-image-upload.png',
      },
      {
        id: 'gallery',
        title: 'Step 6: Build Your Gallery',
        description: 'Share up to 10 photos that showcase your journey together. These photos will appear in your wedding website gallery section.',
        steps: [
          'Select diverse photos from your relationship',
          'Mix candid moments with posed shots',
          'Include photos from different seasons and locations',
          'Upload your Gift QR Code for digital gifting',
        ],
        mediaType: 'carousel',
        mediaUrl: '/uploads/guide/gallery-upload.png',
      },
    ],
  },
  {
    id: 'guests',
    title: 'Manage Your Guests (Dashboard)',
    icon: UsersRound,
    items: [
      {
        id: 'rsvp-tracking',
        title: 'Step 7: Track RSVPs in Real-Time',
        description: 'Once your site is live, manage everything from your Planner Dashboard. See who\'s coming and keep track of all details in one place.',
        features: [
          'RSVP Tracking: See responses in real-time',
          'Guest List: Add plus-ones and manage dietary requirements',
          'Task Manager: Built-in checklist for vendor confirmations',
          'Budget Tracker: Keep deposits and balances in sync',
        ],
        mediaType: 'screenshot',
        mediaUrl: '/uploads/guide/dashboard-overview.png',
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Features & Pro Tips',
    icon: LayoutDashboard,
    items: [
      {
        id: 'floating-nav',
        title: 'Pro Tip: Floating Navigation',
        description: 'Your generated page includes a sleek Floating Dock at the bottom, allowing guests to jump between "Story", "Gallery", and "RSVP" effortlessly on mobile devices.',
        mediaType: 'video',
        videoUrl: 'https://www.youtube.com/embed/example-navigation',
      },
      {
        id: 'mobile-first',
        title: 'Pro Tip: Mobile First Design',
        description: 'Your site is automatically optimized for mobile. Over 70% of guests will visit from their phones, so we ensure it looks stunning on every device.',
        mediaType: 'screenshot',
        mediaUrl: '/uploads/guide/mobile-preview.png',
      },
      {
        id: 'admin-alerts',
        title: 'Pro Tip: Admin Alerts',
        description: 'You\'ll receive instant email notifications every time someone RSVPs, so you never miss an update from your guests.',
        mediaType: 'video',
        videoUrl: 'https://www.youtube.com/embed/example-notifications',
      },
    ],
  },
];

export function GuideSections() {
  const [activeSection, setActiveSection] = useState('getting-started');

  useEffect(() => {
    const handleScroll = () => {
      const sections = guideSections.map(section => section.id);
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="glass rounded-2xl p-4">
                <h3 className="font-serif text-lg font-bold text-foreground mb-4">On this page</h3>
                <nav className="space-y-1">
                  {guideSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-text-secondary hover:bg-neutral hover:text-foreground'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${activeSection === section.id ? 'text-primary' : 'text-text-secondary'}`} />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pb-16">
            {/* Mobile Tabs */}
            <div className="lg:hidden sticky top-16 z-10 mb-6">
              <div className="glass rounded-xl p-1 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {guideSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                          activeSection === section.id
                            ? 'bg-primary text-white'
                            : 'bg-transparent text-text-secondary hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Guide Sections */}
            <div className="space-y-24">
              {guideSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                  className="scroll-mt-20"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                        {section.title}
                      </h2>
                      <p className="text-text-secondary mt-1">
                        Follow these steps to make the most of your wedding planning experience.
                      </p>
                    </div>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-16">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                        className="grid lg:grid-cols-2 gap-8 items-center"
                      >
                        {/* Content */}
                        <div className={itemIndex % 2 === 1 ? 'lg:order-2' : ''}>
                          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
                            {item.title}
                          </h3>
                          <p className="text-text-secondary leading-relaxed mb-6">
                            {item.description}
                          </p>

                          {/* Steps List */}
                          {'steps' in item && item.steps && (
                            <div className="space-y-3 mb-6">
                              <h4 className="font-bold text-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Steps to Follow:
                              </h4>
                              <ul className="space-y-2">
                                {item.steps.map((step, idx) => (
                                  <li key={idx} className="flex items-start gap-3 pl-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="text-text-secondary pt-0.5">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Features List */}
                          {'features' in item && item.features && (
                            <div className="space-y-3 mb-6">
                              <h4 className="font-bold text-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Key Features:
                              </h4>
                              <ul className="space-y-2">
                                {item.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-3 pl-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-text-secondary">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Templates List */}
                          {'templates' in item && item.templates && (
                            <div className="mb-6">
                              <h4 className="font-bold text-foreground mb-3">Available Templates:</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {item.templates.map((template, idx) => (
                                  <div key={idx} className="glass rounded-xl p-3 border border-border hover:border-primary transition-all">
                                    <div className="font-bold text-foreground">{template.name}</div>
                                    <div className="text-sm text-text-secondary mt-1">{template.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Star className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-bold text-foreground">Pro Tip</p>
                                <p className="text-sm text-text-secondary">
                                  Take your time with each step. Your wedding website is a reflection of your love story!
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                         {/* Media (Screenshot/Video/Carousel) */}
                         <div className={itemIndex % 2 === 1 ? 'lg:order-1' : ''}>
                           {item.mediaType === 'video' && 'videoUrl' in item ? (
                             <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
                               <div className="absolute inset-0 bg-gradient-to-tr from-neutral to-neutral/80 flex items-center justify-center">
                                 <Link
                                   href={item.videoUrl || '#'}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="group relative"
                                 >
                                   <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-all group-hover:scale-110 shadow-lg shadow-primary/30">
                                     <Play className="w-8 h-8 text-white ml-1" />
                                   </div>
                                 </Link>
                                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50"></div>
                               </div>
                               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                 <p className="text-white text-sm font-medium">Video Walkthrough</p>
                               </div>
                             </div>
                           ) : item.mediaType === 'carousel' ? (
                            <div className="glass rounded-2xl p-1 shadow-xl border border-border">
                              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral">
                                <div className="absolute inset-0 flex items-center justify-center text-text-secondary/50">
                                  <div className="text-center">
                                    <Camera className="w-12 h-12 mx-auto mb-2" />
                                    <p>Screenshot Preview</p>
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                  <p className="text-white text-sm font-medium">{item.title} Preview</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="glass rounded-2xl p-1 shadow-xl border border-border">
                              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral">
                                <div className="absolute inset-0 flex items-center justify-center text-text-secondary/50">
                                  <div className="text-center">
                                    <Camera className="w-12 h-12 mx-auto mb-2" />
                                    <p>Screenshot Preview</p>
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                  <p className="text-white text-sm font-medium">{item.title} Example</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
