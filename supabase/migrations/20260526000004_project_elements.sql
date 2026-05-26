create table public.project_elements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  type_element text not null check (type_element in (
    'upper_cabinet', 'lower_cabinet', 'drawer',
    'worktop', 'backsplash', 'island', 'side_panel', 'hood_casing'
  )),
  masque_json jsonb,
  reference_id uuid references public.references(id) on delete set null,
  surface_m2 numeric(6,2),
  created_at timestamptz default now()
);

alter table public.project_elements enable row level security;

create policy "Un utilisateur accède aux éléments de ses projets"
  on public.project_elements for all
  using (
    exists (
      select 1 from public.projects
      where id = project_id and user_id = auth.uid()
    )
  );

create index project_elements_project_id_idx on public.project_elements(project_id);
