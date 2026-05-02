-- QuickWeds timeline and FAQ support
-- Run this in the Supabase SQL editor before publishing weddings with the optional FAQ builder step.

alter table public.weddings
    add column if not exists faq_items jsonb not null default '[]'::jsonb;

comment on column public.weddings.faq_items is
    'Optional landing-page FAQ entries saved from the builder. Shape: [{ "question": "...", "answer": "..." }]';
