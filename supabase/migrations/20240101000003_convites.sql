-- =====================================================
-- Tabela: convites
-- =====================================================
create table convites (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,
  usado       boolean not null default false,
  usado_por   uuid references profiles(id) on delete set null,
  criado_por  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table convites enable row level security;

-- Apenas admin e pastor gerenciam convites
create policy "Admin e pastor podem ver convites"
  on convites for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin e pastor podem criar convites"
  on convites for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin e pastor podem deletar convites"
  on convites for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

-- Qualquer pessoa pode verificar se um código é válido (para o cadastro público)
create policy "Qualquer um pode verificar código de convite"
  on convites for select
  using (true);
