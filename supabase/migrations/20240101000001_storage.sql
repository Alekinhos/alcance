-- =====================================================
-- Configuração do Storage
-- =====================================================

-- Bucket para fotos de membros
insert into storage.buckets (id, name, public)
values ('membros', 'membros', true);

-- Bucket para imagens do blog
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true);

-- Policies para bucket membros
create policy "Fotos de membros são públicas"
  on storage.objects for select
  using (bucket_id = 'membros');

create policy "Admin e pastor podem fazer upload de fotos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'membros'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

create policy "Admin e pastor podem atualizar fotos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'membros'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor')
    )
  );

-- Policies para bucket blog
create policy "Imagens do blog são públicas"
  on storage.objects for select
  using (bucket_id = 'blog');

create policy "Admin, pastor e lider podem fazer upload no blog"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and papel in ('admin', 'pastor', 'lider')
    )
  );
