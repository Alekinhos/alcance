-- =====================================================
-- Schema inicial da Igreja Alcance
-- =====================================================

-- Tipos ENUM
create type papel_usuario as enum ('admin', 'pastor', 'lider', 'membro');
create type tipo_evento as enum ('culto', 'reuniao', 'retiro', 'outro');
create type tipo_transacao as enum ('dizimo', 'oferta', 'doacao', 'outro');

-- =====================================================
-- Tabela: profiles
-- =====================================================
create table profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  nome        text not null,
  email       text not null unique,
  telefone    text,
  endereco    text,
  foto_url    text,
  papel       papel_usuario not null default 'membro',
  data_batismo date,
  grupo       text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- Policies para profiles
create policy "Usuários autenticados podem ver todos os perfis"
  on profiles for select
  to authenticated
  using (true);

create policy "Usuário pode atualizar seu próprio perfil"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admin e pastor podem inserir perfis"
  on profiles for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin pode deletar perfis"
  on profiles for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel = 'admin'
    )
  );

-- =====================================================
-- Tabela: eventos
-- =====================================================
create table eventos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descricao   text,
  data        date not null,
  hora        time,
  local       text,
  tipo        tipo_evento not null default 'culto',
  criado_por  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table eventos enable row level security;

-- Qualquer pessoa (incluindo anônimos) pode ler eventos
create policy "Eventos são públicos"
  on eventos for select
  using (true);

create policy "Admin, pastor e lider podem criar eventos"
  on eventos for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin, pastor e lider podem editar eventos"
  on eventos for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin e pastor podem deletar eventos"
  on eventos for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

-- =====================================================
-- Tabela: transacoes
-- =====================================================
create table transacoes (
  id          uuid primary key default gen_random_uuid(),
  tipo        tipo_transacao not null,
  valor       numeric(10, 2) not null check (valor > 0),
  descricao   text,
  membro_id   uuid references profiles(id) on delete set null,
  data        date not null,
  criado_por  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table transacoes enable row level security;

-- Apenas admin e pastor podem ver transações
create policy "Admin e pastor podem ver transações"
  on transacoes for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin e pastor podem criar transações"
  on transacoes for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin e pastor podem editar transações"
  on transacoes for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin pode deletar transações"
  on transacoes for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel = 'admin'
    )
  );

-- =====================================================
-- Tabela: posts
-- =====================================================
create table posts (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  conteudo    text not null,
  autor_id    uuid references profiles(id) on delete set null,
  tags        text[],
  capa_url    text,
  publicado   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table posts enable row level security;

-- Posts publicados são públicos
create policy "Posts publicados são públicos"
  on posts for select
  using (publicado = true);

-- Usuários autenticados com permissão podem ver todos (incluindo rascunhos)
create policy "Admin, pastor e lider podem ver todos os posts"
  on posts for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin, pastor e lider podem criar posts"
  on posts for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin, pastor e lider podem editar posts"
  on posts for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin e pastor podem deletar posts"
  on posts for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

-- =====================================================
-- Trigger: atualizar updated_at em posts
-- =====================================================
create or replace function atualizar_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on posts
  for each row execute function atualizar_updated_at();

-- =====================================================
-- Trigger: criar perfil automaticamente no signup
-- =====================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
