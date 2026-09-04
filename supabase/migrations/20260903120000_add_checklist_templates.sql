-- QuickWeds Wedding Day Checklist Templates.
--
-- Adds a reusable checklist template library plus per-wedding source tracking and
-- box-packing item fields on planner_tasks. This migration is purely additive:
-- existing planner_tasks rows and checklist behavior are preserved.
--
-- Tables added:
--   checklist_templates                 shared library metadata
--   checklist_template_sections         grouped item sections (e.g. Emergency kit)
--   checklist_template_items            template line items
--   wedding_checklist_template_additions  per-wedding add history (duplicate prevention)

create extension if not exists pgcrypto with schema extensions;

-- ============================================================================
-- 1. Template library tables
-- ============================================================================

create table if not exists public.checklist_templates (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    name text not null,
    description text not null default '',
    category text not null default 'wedding-day',
    supports_box_packing boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.checklist_templates is
    'Shared wedding-day checklist templates. Reusable across all weddings.';
comment on column public.checklist_templates.supports_box_packing is
    'Enables the box packing workflow (statuses prepared/packed/handed/used).';

create table if not exists public.checklist_template_sections (
    id uuid primary key default gen_random_uuid(),
    template_id uuid not null references public.checklist_templates(id) on delete cascade,
    section_key text not null,
    name text not null,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique (template_id, section_key)
);

comment on table public.checklist_template_sections is
    'Named sections within a checklist template (e.g. Emergency kit, Gadgets).';

create table if not exists public.checklist_template_items (
    id uuid primary key default gen_random_uuid(),
    template_id uuid not null references public.checklist_templates(id) on delete cascade,
    section_id uuid references public.checklist_template_sections(id) on delete cascade,
    item_key text not null,
    title text not null,
    description text not null default '',
    notes text,
    is_optional boolean not null default false,
    quantity numeric not null default 1,
    assigned_person text,
    location text,
    not_included boolean not null default false,
    due_offset_days integer check (due_offset_days is null or due_offset_days between 0 and 365),
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique (template_id, item_key)
);

comment on table public.checklist_template_items is
    'Line items inside a checklist template with template-default assignment/labels.';
comment on column public.checklist_template_items.not_included is
    'Item is part of the day but intentionally NOT packed inside its named box.';
comment on column public.checklist_template_items.due_offset_days is
    'Suggested due date offset in days before the wedding date (0 = wedding day).';
-- ============================================================================
-- 2. planner_tasks: box-packing + template source fields
-- ============================================================================

alter table public.planner_tasks
    add column if not exists is_optional boolean not null default false,
    add column if not exists quantity numeric not null default 1,
    add column if not exists responsible_person text,
    add column if not exists location text,
    add column if not exists not_included boolean not null default false,
    add column if not exists source_template_id uuid,
    add column if not exists source_template_key text,
    add column if not exists box_status text not null default 'not_started',
    add column if not exists sort_order integer not null default 0;

alter table public.planner_tasks
    drop constraint if exists planner_tasks_box_status_check;

alter table public.planner_tasks
    add constraint planner_tasks_box_status_check
    check (box_status in ('not_started', 'prepared', 'packed', 'handed', 'used'));

comment on column public.planner_tasks.is_optional is
    'Optional checklist item copied from a template.';
comment on column public.planner_tasks.quantity is
    'Item quantity copied from a template.';
comment on column public.planner_tasks.responsible_person is
    'Person/role responsible for this item.';
comment on column public.planner_tasks.location is
    'Container/location such as Bride''s Box.';
comment on column public.planner_tasks.not_included is
    'Intentionally not packed inside the box.';
comment on column public.planner_tasks.source_template_id is
    'Template id this checklist item was copied from (nullable; copied items are free to edit).';
comment on column public.planner_tasks.source_template_key is
    'Template key this checklist item was copied from.';
comment on column public.planner_tasks.box_status is
    'Box packing workflow status: not_started, prepared, packed, handed, used.';

create index if not exists idx_planner_tasks_source_template on public.planner_tasks(source_template_id);
create index if not exists idx_planner_tasks_box_status on public.planner_tasks(box_status);

create table if not exists public.wedding_checklist_template_additions (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    template_id uuid not null references public.checklist_templates(id) on delete cascade,
    checklist_name text not null default '',
    added_by_user_id uuid references auth.users(id) on delete set null,
    add_count integer not null default 1,
    first_added_at timestamptz not null default now(),
    last_added_at timestamptz not null default now(),
    unique (wedding_id, template_id)
);

-- ============================================================================
-- 3. RLS: templates are shared reference data; additions are wedding-scoped.
-- ============================================================================

alter table public.checklist_templates enable row level security;
alter table public.checklist_template_sections enable row level security;
alter table public.checklist_template_items enable row level security;
alter table public.wedding_checklist_template_additions enable row level security;

-- Templates are intentionally shared across all weddings. Only active templates
-- are exposed and none of these tables contain per-wedding data.
drop policy if exists "anyone_can_view_active_checklist_templates" on public.checklist_templates;
create policy "anyone_can_view_active_checklist_templates"
on public.checklist_templates
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "anyone_can_view_checklist_template_sections" on public.checklist_template_sections;
create policy "anyone_can_view_checklist_template_sections"
on public.checklist_template_sections
for select
to anon, authenticated
using (exists (
    select 1 from public.checklist_templates t
    where t.id = checklist_template_sections.template_id and t.is_active = true
));

drop policy if exists "anyone_can_view_checklist_template_items" on public.checklist_template_items;
create policy "anyone_can_view_checklist_template_items"
on public.checklist_template_items
for select
to anon, authenticated
using (exists (
    select 1 from public.checklist_templates t
    where t.id = checklist_template_items.template_id and t.is_active = true
));

-- Per-wedding add history: owners and accepted collaborators. These rows only
-- track which template was added; actual planner data stays in planner_tasks.
drop policy if exists "owners_can_view_checklist_template_additions" on public.wedding_checklist_template_additions;
create policy "owners_can_view_checklist_template_additions"
on public.wedding_checklist_template_additions
for select
to authenticated
using (wedding_id in (select id from public.weddings where user_id = auth.uid()));

drop policy if exists "collaborators_can_view_checklist_template_additions" on public.wedding_checklist_template_additions;
create policy "collaborators_can_view_checklist_template_additions"
on public.wedding_checklist_template_additions
for select
to authenticated
using (public.quickweds_is_collaborator(wedding_id, auth.uid()));

drop policy if exists "owners_can_insert_checklist_template_additions" on public.wedding_checklist_template_additions;
create policy "owners_can_insert_checklist_template_additions"
on public.wedding_checklist_template_additions
for insert
to authenticated
with check (wedding_id in (select id from public.weddings where user_id = auth.uid()));

drop policy if exists "collaborators_can_insert_checklist_template_additions" on public.wedding_checklist_template_additions;
create policy "collaborators_can_insert_checklist_template_additions"
on public.wedding_checklist_template_additions
for insert
to authenticated
with check (public.quickweds_is_collaborator(wedding_id, auth.uid()));

drop policy if exists "owners_can_update_checklist_template_additions" on public.wedding_checklist_template_additions;
create policy "owners_can_update_checklist_template_additions"
on public.wedding_checklist_template_additions
for update
to authenticated
using (wedding_id in (select id from public.weddings where user_id = auth.uid()))
with check (wedding_id in (select id from public.weddings where user_id = auth.uid()));

drop policy if exists "collaborators_can_update_checklist_template_additions" on public.wedding_checklist_template_additions;
create policy "collaborators_can_update_checklist_template_additions"
on public.wedding_checklist_template_additions
for update
to authenticated
using (public.quickweds_is_collaborator(wedding_id, auth.uid()))
with check (public.quickweds_is_collaborator(wedding_id, auth.uid()));

-- ============================================================================
-- 4. Collaborator helper (idempotent; used by the additions RLS policies).
-- ============================================================================

create or replace function public.quickweds_is_collaborator(w_id text, u_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    user_email text;
begin
    select email into user_email from auth.users where id = u_id;

    return exists (
        select 1
        from public.wedding_collaborators
        where wedding_id = w_id
        and lower(email) = lower(user_email)
        and status = 'accepted'
    );
end;
$$;

-- ============================================================================
-- 5. Grants (default public schema grants already apply; keep explicit).
-- ============================================================================

grant select on table public.checklist_templates to anon, authenticated;
grant select on table public.checklist_template_sections to anon, authenticated;
grant select on table public.checklist_template_items to anon, authenticated;
grant select, insert, update, delete on table public.wedding_checklist_template_additions to authenticated;

revoke truncate, references, trigger on table public.wedding_checklist_template_additions from authenticated;

notify pgrst, 'reload schema';

comment on table public.wedding_checklist_template_additions is
    'Tracks which templates were added to a wedding to prevent accidental duplicates.';

create index if not exists idx_checklist_template_sections_template on public.checklist_template_sections(template_id);
create index if not exists idx_checklist_template_items_template on public.checklist_template_items(template_id);
create index if not exists idx_checklist_template_items_section on public.checklist_template_items(section_id);
create index if not exists idx_checklist_template_additions_wedding on public.wedding_checklist_template_additions(wedding_id);
-- ============================================================================
-- 6. Seed data: the Wedding Day Checklist Templates library.
-- ============================================================================

insert into public.checklist_templates (key, name, description, category, supports_box_packing) values
('brides-box', 'Bride''s Box', 'Everything the bride needs on the big day - from gown details to emergency kit, retouch kit, and gadgets, ready to hand to your point persons.', 'wedding-day', true),
('grooms-box', 'Groom''s Box', 'The groom''s day-of essentials: attire details, emergency kit, retouch kit, and gadgets packed and ready.', 'wedding-day', true),
('ceremony-box', 'Ceremony Box', 'Ceremony must-haves: arras, cord, veil, candles, marriage license, and every detail your officiant or coordinator will need.', 'wedding-day', true),
('reception-box', 'Reception Box', 'Reception-day items for games, souvenirs, grand entrances, and capturing photos and video.', 'wedding-day', true),
('prep-snacks', 'Prep Snacks', 'Keep family, entourage, and suppliers fueled during prep with snacks, hot drinks, and supplies.', 'wedding-day', true),
('gifts-parents-entourage', 'Gifts for Parents and Entourage', 'A flexible gift checklist you can tailor with your own rows for sponsors, the Reverend, and suppliers.', 'wedding-day', false),
('general-wedding-gifts', 'General Wedding Gifts', 'A simple gift checklist for principal sponsors, the Reverend, and supplier tokens.', 'wedding-day', false),
('master-box', 'Master Box', 'The coordinator''s supply box: snacks, drinks, disposables, and clean-up gear for the whole wedding day.', 'wedding-day', true)
on conflict (key) do update set
    name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    supports_box_packing = excluded.supports_box_packing,
    updated_at = now();

insert into public.checklist_template_sections (template_id, section_key, name, sort_order)
select t.id, s.section_key, s.name, s.sort_order
from (values
    ('brides-box', 'general', 'General', 0),
    ('brides-box', 'emergency_kit', 'Emergency Kit', 1),
    ('brides-box', 'retouch_kit', 'Retouch Kit', 2),
    ('brides-box', 'gadgets', 'Gadgets', 3),
    ('grooms-box', 'general', 'General', 0),
    ('grooms-box', 'emergency_kit', 'Emergency Kit', 1),
    ('grooms-box', 'retouch_kit', 'Retouch Kit', 2),
    ('grooms-box', 'gadgets', 'Gadgets', 3),
    ('ceremony-box', 'general', 'General', 0),
    ('reception-box', 'general', 'General', 0),
    ('reception-box', 'game_prizes', 'Game Prizes', 1),
    ('prep-snacks', 'general', 'General', 0),
    ('gifts-parents-entourage', 'general', 'General', 0),
    ('general-wedding-gifts', 'general', 'General', 0),
    ('master-box', 'general', 'General', 0)
) as s(template_key, section_key, name, sort_order)
join public.checklist_templates t on t.key = s.template_key
on conflict (template_id, section_key) do update set
    name = excluded.name,
    sort_order = excluded.sort_order;
-- ---- 6.1 Bride's Box items (General) ---------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('brides-box', 'general', 'bb-gown-petticoat', 'Gown and petticoat', '', '', false, 1, null, 'Bride''s Box', true, 1, 1),
    ('brides-box', 'general', 'bb-long-veil', 'Long veil', '', '', false, 1, 'Ms. Rose', 'Bride''s Box', false, 1, 2),
    ('brides-box', 'general', 'bb-sandals', 'Sandals', '', '', false, 1, null, 'Bride''s Box', false, 7, 3),
    ('brides-box', 'general', 'bb-backup-sandals', 'Backup/prep sandals', '', '', true, 1, null, 'Bride''s Box', false, 7, 4),
    ('brides-box', 'general', 'bb-prep-dress', 'Prep dress', '', '', false, 1, null, 'Bride''s Box', false, 7, 5),
    ('brides-box', 'general', 'bb-perfume-personal', 'Perfume - personal use', '', 'Personal use', false, 1, null, 'Bride''s Box', false, 7, 6),
    ('brides-box', 'general', 'bb-perfume-photoshoot', 'Perfume - photoshoot only', '', 'Photoshoot only', false, 1, null, 'Bride''s Box', false, 7, 7),
    ('brides-box', 'general', 'bb-earrings', 'Earrings', '', '', false, 1, null, 'Bride''s Box', false, 7, 8),
    ('brides-box', 'general', 'bb-bracelet', 'Bracelet', '', '', false, 1, null, 'Bride''s Box', false, 7, 9),
    ('brides-box', 'general', 'bb-wedding-rings', 'Wedding rings', '', '', false, 1, null, 'Bride''s Box', false, 1, 10),
    ('brides-box', 'general', 'bb-engagement-ring', 'Engagement ring', '', '', false, 1, null, 'Bride''s Box', false, 1, 11),
    ('brides-box', 'general', 'bb-invitation', 'Invitation - 1 pc', '', '', false, 1, null, 'Bride''s Box', false, 7, 12),
    ('brides-box', 'general', 'bb-vow', 'Vow', '', '', false, 1, null, 'Bride''s Box', false, 1, 13),
    ('brides-box', 'general', 'bb-cash-payments', 'Cash payments', '', 'For cash gifts and final payments', false, 1, null, 'Bride''s Box', false, 1, 14),
    ('brides-box', 'general', 'bb-medicines', 'Medicines', '', '', false, 1, null, 'Bride''s Box', false, 7, 15),
    ('brides-box', 'general', 'bb-bridal-bag', 'Bridal bag', '', 'For cash gifts', false, 1, null, 'Bride''s Box', false, 7, 16),
    ('brides-box', 'general', 'bb-hankies', 'Hankies', '', '', false, 1, null, 'Bride''s Box', false, 30, 17),
    ('brides-box', 'general', 'bb-toiletries', 'Toiletries', '', '', false, 1, null, 'Bride''s Box', false, 30, 18),
    ('brides-box', 'general', 'bb-tumbler', 'Tumbler', '', '', false, 1, null, 'Bride''s Box', false, 7, 19),
    ('brides-box', 'general', 'bb-straw', 'Straw', '', '', false, 1, null, 'Bride''s Box', false, 7, 20),
    ('brides-box', 'general', 'bb-steamer', 'Steamer', '', '', false, 1, null, 'Bride''s Box', false, 30, 21),
    ('brides-box', 'general', 'bb-undergarments', 'Undergarments', '', '', false, 1, null, 'Bride''s Box', false, 30, 22),
    ('brides-box', 'general', 'bb-backup-undergarments', 'Backup undergarments', '', '', true, 1, null, 'Bride''s Box', false, 30, 23),
    ('brides-box', 'general', 'bb-contracts-folder', 'Contracts folder', '', 'Supplier contracts and receipts', false, 1, null, 'Bride''s Box', false, 7, 24),
    ('brides-box', 'general', 'bb-snacks', 'Snacks', '', '', false, 1, null, 'Bride''s Box', false, 30, 25)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.2 Bride's Box items (Emergency kit, Retouch kit, Gadgets) -----------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('brides-box', 'emergency_kit', 'bb-ek-sewing-kit', 'Sewing kit', '', '', false, 1, null, 'Emergency kit', false, 30, 1),
    ('brides-box', 'emergency_kit', 'bb-ek-fashion-tape', 'Fashion tape', '', '', false, 1, null, 'Emergency kit', false, 30, 2),
    ('brides-box', 'emergency_kit', 'bb-ek-lint-roller', 'Lint roller', '', '', false, 1, null, 'Emergency kit', false, 30, 3),
    ('brides-box', 'emergency_kit', 'bb-ek-shoe-glue', 'Shoe glue', '', '', false, 1, null, 'Emergency kit', false, 30, 4),
    ('brides-box', 'emergency_kit', 'bb-ek-heel-protect-tape', 'Heel protect tape', '', '', false, 1, null, 'Emergency kit', false, 30, 5),
    ('brides-box', 'emergency_kit', 'bb-ek-tide-pen', 'Tide-to-go pen', '', '', false, 1, null, 'Emergency kit', false, 30, 6),
    ('brides-box', 'retouch_kit', 'bb-rk-oil-film', 'Oil film', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 1),
    ('brides-box', 'retouch_kit', 'bb-rk-tissue', 'Tissue', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 2),
    ('brides-box', 'retouch_kit', 'bb-rk-wipes', 'Wipes', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 3),
    ('brides-box', 'retouch_kit', 'bb-rk-lipstick', 'Lipstick', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 4),
    ('brides-box', 'retouch_kit', 'bb-rk-mini-perfume', 'Mini perfume', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 5),
    ('brides-box', 'retouch_kit', 'bb-rk-mint', 'Mint', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 6),
    ('brides-box', 'retouch_kit', 'bb-rk-mouth-spray', 'Mouth spray', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 7),
    ('brides-box', 'retouch_kit', 'bb-rk-alcohol', 'Alcohol', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 8),
    ('brides-box', 'retouch_kit', 'bb-rk-floss', 'Floss', '', '', false, 1, 'Maid of Honor', 'Retouch kit', false, 30, 9),
    ('brides-box', 'gadgets', 'bb-gd-charger', 'Charger', '', '', false, 1, null, 'Gadgets', false, 30, 1),
    ('brides-box', 'gadgets', 'bb-gd-phone', 'Phone', '', '', false, 1, 'Maid of Honor', 'Gadgets', false, 30, 2),
    ('brides-box', 'gadgets', 'bb-gd-mini-fan', 'Mini fan', '', '', false, 1, null, 'Gadgets', false, 30, 3),
    ('brides-box', 'gadgets', 'bb-gd-power-bank', 'Power bank', '', '', true, 1, null, 'Gadgets', false, 30, 4)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.3 Groom's Box items ------------------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('grooms-box', 'general', 'gb-shoes', 'Shoes', '', '', false, 1, null, 'Groom''s Box', false, 7, 1),
    ('grooms-box', 'general', 'gb-watch', 'Watch', '', '', false, 1, null, 'Groom''s Box', false, 1, 2),
    ('grooms-box', 'general', 'gb-socks', 'Socks', '', '', false, 1, null, 'Groom''s Box', false, 7, 3),
    ('grooms-box', 'general', 'gb-hankies', 'Hankies', '', '', false, 1, null, 'Groom''s Box', false, 30, 4),
    ('grooms-box', 'general', 'gb-perfume-personal', 'Perfume - personal use', '', 'Personal use', false, 1, null, 'Groom''s Box', false, 7, 5),
    ('grooms-box', 'general', 'gb-perfume-photoshoot', 'Perfume - photoshoot only', '', 'Photoshoot only', false, 1, null, 'Groom''s Box', false, 7, 6),
    ('grooms-box', 'general', 'gb-invitation', 'Invitation - 1 pc', '', '', false, 1, null, 'Groom''s Box', false, 7, 7),
    ('grooms-box', 'general', 'gb-vow', 'Vow', '', '', false, 1, null, 'Groom''s Box', false, 1, 8),
    ('grooms-box', 'general', 'gb-undergarments', 'Undergarments', '', '', false, 1, null, 'Groom''s Box', false, 30, 9),
    ('grooms-box', 'general', 'gb-backup-undergarments', 'Backup undergarments', '', '', true, 1, null, 'Groom''s Box', false, 30, 10),
    ('grooms-box', 'general', 'gb-toiletries', 'Toiletries', '', '', false, 1, null, 'Groom''s Box', false, 30, 11),
    ('grooms-box', 'general', 'gb-steamer', 'Steamer', '', '', false, 1, null, 'Groom''s Box', false, 30, 12),
    ('grooms-box', 'general', 'gb-snacks', 'Snacks', '', '', false, 1, null, 'Groom''s Box', false, 30, 13),
    ('grooms-box', 'general', 'gb-belt', 'Belt', '', '', false, 1, null, 'Groom''s Box', false, 7, 14),
    ('grooms-box', 'emergency_kit', 'gb-ek-lint-roller', 'Lint roller', '', '', false, 1, null, 'Emergency kit', false, 30, 1),
    ('grooms-box', 'emergency_kit', 'gb-ek-shoe-glue', 'Shoe glue', '', '', false, 1, null, 'Emergency kit', false, 30, 2),
    ('grooms-box', 'emergency_kit', 'gb-ek-heel-protect-tape', 'Heel protect tape', '', '', false, 1, null, 'Emergency kit', false, 30, 3),
    ('grooms-box', 'emergency_kit', 'gb-ek-tide-pen', 'Tide-to-go pen', '', '', false, 1, null, 'Emergency kit', false, 30, 4),
    ('grooms-box', 'retouch_kit', 'gb-rk-oil-film', 'Oil film', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 1),
    ('grooms-box', 'retouch_kit', 'gb-rk-tissue', 'Tissue', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 2),
    ('grooms-box', 'retouch_kit', 'gb-rk-mint', 'Mint', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 3),
    ('grooms-box', 'retouch_kit', 'gb-rk-mini-perfume', 'Mini perfume', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 4),
    ('grooms-box', 'retouch_kit', 'gb-rk-mouth-spray', 'Mouth spray', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 5),
    ('grooms-box', 'retouch_kit', 'gb-rk-lip-balm', 'Lip balm', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 6),
    ('grooms-box', 'retouch_kit', 'gb-rk-floss', 'Floss', '', '', false, 1, 'Best Man', 'Retouch kit', false, 30, 7),
    ('grooms-box', 'gadgets', 'gb-gd-charger', 'Charger', '', '', false, 1, null, 'Gadgets', false, 30, 1),
    ('grooms-box', 'gadgets', 'gb-gd-phone', 'Phone', '', '', false, 1, 'Best Man', 'Gadgets', false, 30, 2),
    ('grooms-box', 'gadgets', 'gb-gd-mini-fan', 'Mini fan', '', '', false, 1, null, 'Gadgets', false, 30, 3)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.4 Ceremony Box items -----------------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('ceremony-box', 'general', 'cb-arras', 'Arras with coins', '', '', false, 1, null, 'Ceremony Box', false, 7, 1),
    ('ceremony-box', 'general', 'cb-bible', 'Bible', '', '', false, 1, null, 'Ceremony Box', false, 7, 2),
    ('ceremony-box', 'general', 'cb-short-veil', 'Short veil', '', '', false, 1, null, 'Ceremony Box', false, 7, 3),
    ('ceremony-box', 'general', 'cb-cord', 'Cord', '', '', false, 1, null, 'Ceremony Box', false, 7, 4),
    ('ceremony-box', 'general', 'cb-candles', 'Candles', '', '', false, 1, null, 'Ceremony Box', false, 7, 5),
    ('ceremony-box', 'general', 'cb-matches', 'Matches', '', '', false, 1, null, 'Ceremony Box', false, 7, 6),
    ('ceremony-box', 'general', 'cb-petals', 'Petals - for recession', '', 'Recession', false, 1, null, 'Ceremony Box', false, 1, 7),
    ('ceremony-box', 'general', 'cb-wands', 'Wands - for recession', '', 'Recession', false, 1, null, 'Ceremony Box', false, 1, 8),
    ('ceremony-box', 'general', 'cb-marriage-license', 'Marriage license', '', '', false, 1, null, 'Ceremony Box', false, 1, 9),
    ('ceremony-box', 'general', 'cb-pens', 'Pens', '', '', false, 1, null, 'Ceremony Box', false, 7, 10),
    ('ceremony-box', 'general', 'cb-unplugged-sign', 'Unplugged ceremony sign/chart', '', 'Not included in the box', false, 1, null, 'Ceremony Box', true, 1, 11),
    ('ceremony-box', 'general', 'cb-seat-chart', 'Seat chart', '', 'Not included in the box', false, 1, null, 'Ceremony Box', true, 1, 12)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.5 Reception Box items ----------------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('reception-box', 'general', 'rb-guest-souvenirs', 'Guest souvenirs', '', '', false, 1, null, 'Reception Box', false, 7, 1),
    ('reception-box', 'general', 'rb-money-envelope', 'Money envelope', '', '', false, 1, null, 'Reception Box', false, 7, 2),
    ('reception-box', 'general', 'rb-pens', 'Pens', '', '', false, 1, null, 'Reception Box', false, 7, 3),
    ('reception-box', 'general', 'rb-scratch-cards', 'Scratch cards', '', '', false, 1, null, 'Reception Box', false, 7, 4),
    ('reception-box', 'general', 'rb-menu-cards', 'Menu cards', '', '', false, 1, null, 'Reception Box', false, 7, 5),
    ('reception-box', 'general', 'rb-place-cards', 'Place cards', '', '', false, 1, null, 'Reception Box', false, 7, 6),
    ('reception-box', 'general', 'rb-led-candles', 'LED candles', '', '', false, 1, 'Ms. Rose', 'Reception Box', false, 1, 7),
    ('reception-box', 'general', 'rb-led-light-sticks', 'LED light sticks', '10 pcs - for entourage grand entrance', 'Entourage grand entrance', false, 10, null, 'Reception Box', false, 1, 8),
    ('reception-box', 'general', 'rb-throw-petals', 'Throw petals', 'For the couple''s grand entrance', 'Grand entrance', false, 1, null, 'Reception Box', false, 1, 9),
    ('reception-box', 'general', 'rb-sunglasses', 'Sunglasses', 'For reception entrance and family dance', 'Reception entrance + family dance', false, 1, null, 'Reception Box', false, 1, 10),
    ('reception-box', 'general', 'rb-petal-poppers', 'Petal poppers', 'For the couple''s first dance', 'First dance', false, 1, null, 'Reception Box', false, 1, 11),
    ('reception-box', 'general', 'rb-hard-drive', 'Hard drive', 'For photos and video', 'Photos and video', false, 1, null, 'Reception Box', false, 1, 12),
    ('reception-box', 'game_prizes', 'rb-gp-ampao', 'Ampao', '', 'Game prize', false, 4, null, 'Game prizes', false, 7, 1),
    ('reception-box', 'game_prizes', 'rb-gp-pepero', 'Pepero', '', 'Game prize', false, 9, null, 'Game prizes', false, 7, 2),
    ('reception-box', 'game_prizes', 'rb-gp-raffle-prizes', 'Raffle prizes', '', 'Game prize', false, 9, null, 'Game prizes', false, 7, 3),
    ('reception-box', 'game_prizes', 'rb-gp-rice', 'Sacks of rice', '', 'Not included in the box', false, 5, null, 'Game prizes', true, 7, 4)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.6 Prep Snacks items ------------------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('prep-snacks', 'general', 'ps-hankies-mints', 'Hankies and mints', 'Distribute during prep', 'Distribution', false, 1, null, 'Prep Snacks', false, 30, 1),
    ('prep-snacks', 'general', 'ps-coffee', 'Coffee', '', '', false, 1, null, 'Prep Snacks', false, 30, 2),
    ('prep-snacks', 'general', 'ps-milo', 'Milo', '', '', false, 1, null, 'Prep Snacks', false, 30, 3),
    ('prep-snacks', 'general', 'ps-kettle', 'Electric kettle', 'For hot drinks', 'Hot drinks', false, 1, null, 'Prep Snacks', false, 30, 4),
    ('prep-snacks', 'general', 'ps-paper-cups', 'Paper cups', '', '', false, 1, null, 'Prep Snacks', false, 30, 5),
    ('prep-snacks', 'general', 'ps-utensils', 'Utensils', '', '', false, 1, null, 'Prep Snacks', false, 30, 6),
    ('prep-snacks', 'general', 'ps-stirrers', 'Stirrers', '', '', false, 1, null, 'Prep Snacks', false, 30, 7),
    ('prep-snacks', 'general', 'ps-tissue', 'Tissue', '', '', false, 1, null, 'Prep Snacks', false, 30, 8),
    ('prep-snacks', 'general', 'ps-wipes', 'Wipes', '', '', false, 1, null, 'Prep Snacks', false, 30, 9),
    ('prep-snacks', 'general', 'ps-garbage-bags', 'Garbage bags', '', '', false, 1, null, 'Prep Snacks', false, 30, 10),
    ('prep-snacks', 'general', 'ps-eco-bags', 'Eco bags', '', '', false, 1, null, 'Prep Snacks', false, 30, 11),
    ('prep-snacks', 'general', 'ps-food-containers', 'Food containers', 'For leftovers', 'Leftovers', false, 1, null, 'Prep Snacks', false, 30, 12),
    ('prep-snacks', 'general', 'ps-scissors', 'Scissors', '', '', false, 1, null, 'Prep Snacks', false, 30, 13),
    ('prep-snacks', 'general', 'ps-ziplock-bags', 'Ziplock bags', '', '', false, 1, null, 'Prep Snacks', false, 30, 14),
    ('prep-snacks', 'general', 'ps-hand-soap', 'Hand soap', '', '', false, 1, null, 'Prep Snacks', false, 30, 15),
    ('prep-snacks', 'general', 'ps-pens', 'Pens', '', '', false, 1, null, 'Prep Snacks', false, 30, 16),
    ('prep-snacks', 'general', 'ps-adapter', 'Adapter', '', '', false, 1, null, 'Prep Snacks', false, 30, 17)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.7 Gifts for Parents and Entourage items ----------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('gifts-parents-entourage', 'general', 'gpe-sponsors', 'Gifts for principal sponsors', 'Add one row per principal sponsor gift', 'Flexible checklist template', false, 1, null, 'Gifts', false, 14, 1),
    ('gifts-parents-entourage', 'general', 'gpe-reverend', 'Gift for Reverend', '', '', false, 1, null, 'Gifts', false, 14, 2),
    ('gifts-parents-entourage', 'general', 'gpe-suppliers', 'Small tokens for suppliers', '', '', false, 1, null, 'Gifts', false, 14, 3)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;

-- ---- 6.8 General Wedding Gifts items --------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('general-wedding-gifts', 'general', 'gwg-sponsors', 'Gifts for principal sponsors', '', '', false, 1, null, 'Gifts', false, 14, 1),
    ('general-wedding-gifts', 'general', 'gwg-reverend', 'Gift for Reverend', '', '', false, 1, null, 'Gifts', false, 14, 2),
    ('general-wedding-gifts', 'general', 'gwg-suppliers', 'Small tokens for suppliers', '', '', false, 1, null, 'Gifts', false, 14, 3)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;
-- ---- 6.9 Master Box items -------------------------------------------------

insert into public.checklist_template_items (
    template_id, section_id, item_key, title, description, notes, is_optional,
    quantity, assigned_person, location, not_included, due_offset_days, sort_order
)
select t.id, s.id, i.item_key, i.title, i.description, i.notes, i.is_optional,
       i.quantity, i.assigned_person, i.location, i.not_included, i.due_offset_days, i.sort_order
from (values
    ('master-box', 'general', 'mb-hankies-mints', 'Hankies and mints', 'For entourage and family', 'Distribute during prep', false, 1, null, 'Master Box', false, 30, 1),
    ('master-box', 'general', 'mb-coffee-milo', 'Coffee and Milo', '', '', false, 1, null, 'Master Box', false, 30, 2),
    ('master-box', 'general', 'mb-kettle', 'Electric kettle', 'For hot drinks', 'Hot drinks', false, 1, null, 'Master Box', false, 30, 3),
    ('master-box', 'general', 'mb-dispensables', 'Paper cups, utensils, and stirrers', '', '', false, 1, null, 'Master Box', false, 30, 4),
    ('master-box', 'general', 'mb-tissue', 'Tissue', '', '', false, 1, null, 'Master Box', false, 30, 5),
    ('master-box', 'general', 'mb-wipes', 'Wipes', '', '', false, 1, null, 'Master Box', false, 30, 6),
    ('master-box', 'general', 'mb-garbage-bags', 'Garbage bags', '', '', false, 1, null, 'Master Box', false, 30, 7),
    ('master-box', 'general', 'mb-eco-bags', 'Eco bags', '', '', false, 1, null, 'Master Box', false, 30, 8),
    ('master-box', 'general', 'mb-food-containers', 'Food containers', 'For leftovers', 'Leftovers', false, 1, null, 'Master Box', false, 30, 9),
    ('master-box', 'general', 'mb-scissors', 'Scissors', '', '', false, 1, null, 'Master Box', false, 30, 10),
    ('master-box', 'general', 'mb-ziplock-bags', 'Ziplock bags', '', '', false, 1, null, 'Master Box', false, 30, 11),
    ('master-box', 'general', 'mb-hand-soap', 'Hand soap', '', '', false, 1, null, 'Master Box', false, 30, 12),
    ('master-box', 'general', 'mb-pens', 'Pens', '', '', false, 1, null, 'Master Box', false, 30, 13),
    ('master-box', 'general', 'mb-adapter', 'Adapter', '', '', false, 1, null, 'Master Box', false, 30, 14)
) as i(template_key, section_key, item_key, title, description, notes, is_optional, quantity, assigned_person, location, not_included, due_offset_days, sort_order)
join public.checklist_templates t on t.key = i.template_key
left join public.checklist_template_sections s on s.template_id = t.id and s.section_key = i.section_key
on conflict (template_id, item_key) do update set
    title = excluded.title,
    description = excluded.description,
    notes = excluded.notes,
    is_optional = excluded.is_optional,
    quantity = excluded.quantity,
    assigned_person = excluded.assigned_person,
    location = excluded.location,
    not_included = excluded.not_included,
    due_offset_days = excluded.due_offset_days,
    sort_order = excluded.sort_order,
    section_id = excluded.section_id;

notify pgrst, 'reload schema';