create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  nom text not null,
  photo_originale_url text,
  photo_finale_url text,
  statut text default 'draft' check (statut in ('draft', 'completed', 'sent')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Un utilisateur lit ses propres projets"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Un utilisateur crée ses propres projets"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Un utilisateur modifie ses propres projets"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Un utilisateur supprime ses propres projets"
  on public.projects for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();
