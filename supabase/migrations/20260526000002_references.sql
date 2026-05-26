create table public.references (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom_commercial text,
  collection text,
  famille_secondaire text,
  finition text,
  couleur_dominante text,
  texture_url text,
  texture_hd_url text,
  fiche_technique_url text,
  created_at timestamptz default now()
);

alter table public.references enable row level security;

create policy "Catalogue lisible par tous les utilisateurs authentifiés"
  on public.references for select
  to authenticated
  using (true);

create index references_collection_idx on public.references(collection);
create index references_famille_secondaire_idx on public.references(famille_secondaire);
