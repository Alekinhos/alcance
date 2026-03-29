-- Adiciona suporte a eventos recorrentes
alter table eventos add column recorrente boolean not null default false;
alter table eventos add column frequencia text check (frequencia in ('semanal', 'quinzenal', 'mensal'));
alter table eventos add column data_fim_recorrencia date;
