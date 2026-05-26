create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  company text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Un utilisateur lit son propre profil"
  on public.users for select
  using (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.users for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
