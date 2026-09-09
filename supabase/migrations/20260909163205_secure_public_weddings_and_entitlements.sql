begin;

-- Checkout writes these fields, but older production schemas may predate them.
alter table public.weddings add column if not exists stripe_checkout_session_id text;
alter table public.weddings add column if not exists plan_type text;

-- Public invitation pages are served by the application's allowlisted server
-- serializer. The base weddings table also contains private contact, billing,
-- and collaborator data and must never be directly readable anonymously.
revoke all on table public.weddings from anon;

drop policy if exists "Public can view weddings" on public.weddings;
drop policy if exists "anyone_can_view_weddings" on public.weddings;
drop policy if exists "Authenticated can view weddings" on public.weddings;

-- Remove a legacy policy that let any signed-in account manage an orphaned
-- wedding. Existing owner and collaborator policies remain the authority.
drop policy if exists "auth_manage_weddings" on public.weddings;

create or replace function public.quickweds_protect_wedding_entitlements()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.is_premium := false;
      new.payment_status := null;
      new.payment_amount := null;
      new.stripe_payment_intent_id := null;
      new.stripe_checkout_session_id := null;
      new.plan_type := null;
    elsif new.is_premium is distinct from old.is_premium
       or new.payment_status is distinct from old.payment_status
       or new.payment_amount is distinct from old.payment_amount
       or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
       or new.stripe_checkout_session_id is distinct from old.stripe_checkout_session_id
       or new.plan_type is distinct from old.plan_type then
      raise exception 'Wedding entitlement fields are server-managed' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists quickweds_protect_wedding_entitlements on public.weddings;
create trigger quickweds_protect_wedding_entitlements
before insert or update on public.weddings
for each row execute function public.quickweds_protect_wedding_entitlements();

create or replace function public.quickweds_protect_account_entitlements()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.is_pro := false;
      new.payment_status := null;
      new.payment_amount := null;
      new.stripe_payment_intent_id := null;
      new.stripe_checkout_session_id := null;
      new.pro_unlocked_at := null;
      new.plan_type := null;
    elsif new.is_pro is distinct from old.is_pro
       or new.payment_status is distinct from old.payment_status
       or new.payment_amount is distinct from old.payment_amount
       or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
       or new.stripe_checkout_session_id is distinct from old.stripe_checkout_session_id
       or new.pro_unlocked_at is distinct from old.pro_unlocked_at
       or new.plan_type is distinct from old.plan_type then
      raise exception 'Account entitlement fields are server-managed' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists quickweds_protect_account_entitlements on public.user_app_profiles;
create trigger quickweds_protect_account_entitlements
before insert or update on public.user_app_profiles
for each row execute function public.quickweds_protect_account_entitlements();

revoke all on function public.quickweds_protect_wedding_entitlements() from public, anon, authenticated;
revoke all on function public.quickweds_protect_account_entitlements() from public, anon, authenticated;

commit;
