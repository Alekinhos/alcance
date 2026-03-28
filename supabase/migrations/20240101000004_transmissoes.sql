-- =====================================================
-- Tabela: transmissoes
-- =====================================================
create table transmissoes (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descricao   text,
  youtube_url text not null,
  ao_vivo     boolean not null default false,
  data        date not null,
  criado_por  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table transmissoes enable row level security;

-- Transmissões são públicas para leitura
create policy "Transmissões são públicas"
  on transmissoes for select
  using (true);

create policy "Admin, pastor e lider podem criar transmissões"
  on transmissoes for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin, pastor e lider podem editar transmissões"
  on transmissoes for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin e pastor podem deletar transmissões"
  on transmissoes for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );
