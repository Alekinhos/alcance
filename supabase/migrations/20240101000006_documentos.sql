-- =====================================================
-- Bucket de storage para documentos
-- =====================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos',
  'documentos',
  true,
  10485760, -- 10MB
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

-- Políticas de storage: qualquer autenticado pode ler, admin/pastor/lider podem escrever/deletar
create policy "Autenticados podem ler documentos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos');

create policy "Admin, pastor e lider podem fazer upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documentos'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin e pastor podem deletar arquivos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documentos'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

-- =====================================================
-- Tabela: documentos
-- =====================================================
create table documentos (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  descricao     text,
  categoria     text not null check (categoria in ('ata', 'contrato', 'estatuto', 'relatorio', 'outro')),
  arquivo_url   text not null,
  arquivo_path  text not null,
  arquivo_nome  text not null,
  arquivo_tamanho bigint,
  arquivo_tipo  text,
  criado_por    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table documentos enable row level security;

create policy "Autenticados podem ver documentos"
  on documentos for select
  to authenticated
  using (true);

create policy "Admin, pastor e lider podem criar documentos"
  on documentos for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );

create policy "Admin e pastor podem deletar documentos"
  on documentos for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );
