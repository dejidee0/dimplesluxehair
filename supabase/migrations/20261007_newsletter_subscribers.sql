create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Public can join newsletter" on public.newsletter_subscribers;
create policy "Public can join newsletter"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (
    status = 'subscribed'
    and source = 'homepage'
    and char_length(email) between 5 and 254
    and email like '%@%.%'
  );

comment on table public.newsletter_subscribers is 'Dimplesluxe marketing mailing-list signups. Public visitors may insert only; reads remain private.';
