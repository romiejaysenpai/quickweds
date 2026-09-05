'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { landingTemplatePreviews } from '@/lib/landing-templates';
import { useAuth } from '@/context/AuthContext';

export default function TemplatesPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-neutral text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-10 text-center sm:mb-16">
          <div className="mx-auto mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Design Catalog</span>
          </div>
          <h1 className="font-serif text-3xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Find the design that feels <span className="text-primary">like your day.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            Start with a polished layout, then make it entirely your own with your story, photos, schedule, and RSVP details. All templates are 100% free.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {landingTemplatePreviews.map((template) => (
            <article
              key={template.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:rounded-[1.75rem]"
            >
              <Link
                href={user ? `/builder?template=${template.id}` : '/login'}
                className="flex flex-col h-full"
                aria-label={`Start building with the ${template.name} template`}
              >
                <div className="relative shrink-0 aspect-[4/5] overflow-hidden bg-[#fffaf7]">
                  <Image
                    src={template.image}
                    alt={`${template.name} preview`}
                    fill
                    sizes="(max-width: 639px) calc(50vw - 1rem), (max-width: 1023px) calc(50vw - 2rem), 300px"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute bottom-2 left-2 hidden items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-primary opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-4 sm:left-4 sm:inline-flex sm:px-3 sm:py-2 sm:text-[10px]">
                    Use this template <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-3 sm:flex-row sm:items-start sm:gap-3 sm:p-5">
                  <div className="min-w-0">
                    <p className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-primary/65 sm:text-[10px] sm:tracking-[0.18em]">{template.mood}</p>
                    <h2 className="mt-0.5 font-serif text-[11px] font-bold leading-tight text-foreground sm:mt-1 sm:text-xl">{template.name}</h2>
                  </div>
                  <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1 sm:block sm:h-5 sm:w-5" />
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center sm:mt-20">
          <Link href={user ? '/builder' : '/login'} className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover sm:text-base">
            Explore more templates
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
