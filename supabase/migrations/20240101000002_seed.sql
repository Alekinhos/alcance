-- =====================================================
-- Seed: dados de exemplo para desenvolvimento
-- =====================================================

-- Nota: Os usuários precisam ser criados primeiro via Supabase Auth
-- Este seed insere perfis diretamente para testes locais
-- Em produção, use o trigger on_auth_user_created

-- Eventos de exemplo
insert into eventos (titulo, descricao, data, hora, local, tipo) values
  ('Culto de Domingo', 'Culto principal da semana com louvor e pregação', current_date + 7, '10:00', 'Templo Principal', 'culto'),
  ('Reunião de Líderes', 'Encontro mensal dos líderes de célula', current_date + 10, '19:30', 'Sala de Reuniões', 'reuniao'),
  ('Retiro de Jovens', 'Retiro espiritual para jovens da igreja', current_date + 30, '08:00', 'Sítio Águas Vivas', 'retiro'),
  ('Culto de Quarta', 'Culto de edificação e oração', current_date + 3, '19:30', 'Templo Principal', 'culto'),
  ('Encontro de Casais', 'Evento especial para casais da igreja', current_date + 15, '18:00', 'Salão Social', 'outro');
