'use client'

import { useSectionContext } from '@/context/SectionContext';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const { sections } = useSectionContext();
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all registered sections
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
        sectionRefs.current.set(section.id, element);
      }
    });

    return () => {
      observer.disconnect();
      sectionRefs.current.clear();
    };
  }, [sections]);

  if (isHomePage) return null;

  return (
    <header className="z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="QuickWeds Logo" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-6">
            {sections.map(section => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors 
                         ${activeSection === section.id 
                           ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                           : 'text-text-secondary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
              >
                {section.title}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-text-secondary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;