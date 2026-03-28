export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PapelUsuario = 'admin' | 'pastor' | 'lider' | 'membro'
export type TipoEvento = 'culto' | 'reuniao' | 'retiro' | 'outro'
export type TipoTransacao = 'dizimo' | 'oferta' | 'doacao' | 'outro'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          endereco: string | null
          foto_url: string | null
          papel: PapelUsuario
          data_batismo: string | null
          grupo: string | null
          created_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          telefone?: string | null
          endereco?: string | null
          foto_url?: string | null
          papel?: PapelUsuario
          data_batismo?: string | null
          grupo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          endereco?: string | null
          foto_url?: string | null
          papel?: PapelUsuario
          data_batismo?: string | null
          grupo?: string | null
          created_at?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          data: string
          hora: string | null
          local: string | null
          tipo: TipoEvento
          recorrente: boolean
          frequencia: 'semanal' | 'quinzenal' | 'mensal' | null
          data_fim_recorrencia: string | null
          criado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          data: string
          hora?: string | null
          local?: string | null
          tipo?: TipoEvento
          recorrente?: boolean
          frequencia?: 'semanal' | 'quinzenal' | 'mensal' | null
          data_fim_recorrencia?: string | null
          criado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          data?: string
          hora?: string | null
          local?: string | null
          tipo?: TipoEvento
          recorrente?: boolean
          frequencia?: 'semanal' | 'quinzenal' | 'mensal' | null
          data_fim_recorrencia?: string | null
          criado_por?: string | null
          created_at?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          id: string
          tipo: TipoTransacao
          valor: number
          descricao: string | null
          membro_id: string | null
          data: string
          criado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tipo: TipoTransacao
          valor: number
          descricao?: string | null
          membro_id?: string | null
          data: string
          criado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tipo?: TipoTransacao
          valor?: number
          descricao?: string | null
          membro_id?: string | null
          data?: string
          criado_por?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transacoes_membro_id_fkey'
            columns: ['membro_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transacoes_criado_por_fkey'
            columns: ['criado_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts: {
        Row: {
          id: string
          titulo: string
          conteudo: string
          autor_id: string | null
          tags: string[] | null
          capa_url: string | null
          publicado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          conteudo: string
          autor_id?: string | null
          tags?: string[] | null
          capa_url?: string | null
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          conteudo?: string
          autor_id?: string | null
          tags?: string[] | null
          capa_url?: string | null
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_autor_id_fkey'
            columns: ['autor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      convites: {
        Row: {
          id: string
          codigo: string
          usado: boolean
          usado_por: string | null
          criado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          codigo: string
          usado?: boolean
          usado_por?: string | null
          criado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          usado?: boolean
          usado_por?: string | null
          criado_por?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      papel_usuario: PapelUsuario
      tipo_evento: TipoEvento
      tipo_transacao: TipoTransacao
    }
    CompositeTypes: { [_ in never]: never }
  }
}

// Tipos de conveniência
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Evento = Database['public']['Tables']['eventos']['Row']
export type Transacao = Database['public']['Tables']['transacoes']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Convite = Database['public']['Tables']['convites']['Row']
