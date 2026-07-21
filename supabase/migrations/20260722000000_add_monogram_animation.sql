-- Existing weddings keep their static mark until a Pro user chooses an animation.
alter table public.weddings
    add column if not exists logo_animation text not null default 'none';

update public.weddings
set logo_animation = 'none'
where logo_animation is null;

alter table public.weddings
    alter column logo_animation set default 'none',
    alter column logo_animation set not null;

alter table public.weddings
    drop constraint if exists weddings_logo_animation_check;

alter table public.weddings
    add constraint weddings_logo_animation_check
    check (logo_animation in ('none', 'draw', 'bloom', 'shimmer', 'float', 'reveal'));
