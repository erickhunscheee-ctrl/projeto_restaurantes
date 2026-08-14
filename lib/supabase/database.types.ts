export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          criado_em: string
          endereco: string
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          numero: string | null
          padrao: boolean
          rotulo: string
          rua: string | null
          user_id: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          criado_em?: string
          endereco: string
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          numero?: string | null
          padrao?: boolean
          rotulo: string
          rua?: string | null
          user_id: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          criado_em?: string
          endereco?: string
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          numero?: string | null
          padrao?: boolean
          rotulo?: string
          rua?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          id: string
          image_url: string | null
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          image_url?: string | null
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          image_url?: string | null
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      dish_options: {
        Row: {
          criado_em: string
          dish_id: string
          grupo: string
          id: string
          nome: string
          ordem: number
          preco_adicional: number
          selecao_max: number
          selecao_min: number
        }
        Insert: {
          criado_em?: string
          dish_id: string
          grupo: string
          id?: string
          nome: string
          ordem?: number
          preco_adicional?: number
          selecao_max?: number
          selecao_min?: number
        }
        Update: {
          criado_em?: string
          dish_id?: string
          grupo?: string
          id?: string
          nome?: string
          ordem?: number
          preco_adicional?: number
          selecao_max?: number
          selecao_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "dish_options_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          atualizado_em: string
          categoria: string | null
          criado_em: string
          disponivel_hoje: boolean
          establishment_id: string
          icone_split: number
          id: string
          nome: string
          preco_base: number
        }
        Insert: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          disponivel_hoje?: boolean
          establishment_id: string
          icone_split?: number
          id?: string
          nome: string
          preco_base: number
        }
        Update: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          disponivel_hoje?: boolean
          establishment_id?: string
          icone_split?: number
          id?: string
          nome?: string
          preco_base?: number
        }
        Relationships: [
          {
            foreignKeyName: "dishes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_categories: {
        Row: {
          category_id: string
          criado_em: string
          establishment_id: string
        }
        Insert: {
          category_id: string
          criado_em?: string
          establishment_id: string
        }
        Update: {
          category_id?: string
          criado_em?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_categories_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishments: {
        Row: {
          atualizado_em: string
          avatar_cor: string | null
          avatar_iniciais: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          criado_em: string
          distancia_km: number | null
          endereco: string | null
          estado: string | null
          foto_url: string | null
          horario_abertura: string | null
          horario_fechamento: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          nota_media: number
          numero: string | null
          owner_id: string
          status: string
          telefone: string | null
          tipo_cozinha: string
          whatsapp_telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          avatar_cor?: string | null
          avatar_iniciais?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          criado_em?: string
          distancia_km?: number | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          nota_media?: number
          numero?: string | null
          owner_id: string
          status?: string
          telefone?: string | null
          tipo_cozinha?: string
          whatsapp_telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          avatar_cor?: string | null
          avatar_iniciais?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          criado_em?: string
          distancia_km?: number | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          nota_media?: number
          numero?: string | null
          owner_id?: string
          status?: string
          telefone?: string | null
          tipo_cozinha?: string
          whatsapp_telefone?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          criado_em: string
          dish_id: string
          id: string
          observacoes: string | null
          opcoes_selecionadas: Json
          order_id: string
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          criado_em?: string
          dish_id: string
          id?: string
          observacoes?: string | null
          opcoes_selecionadas?: Json
          order_id: string
          preco_unitario: number
          quantidade?: number
        }
        Update: {
          criado_em?: string
          dish_id?: string
          id?: string
          observacoes?: string | null
          opcoes_selecionadas?: Json
          order_id?: string
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          atualizado_em: string
          criado_em: string
          endereco_entrega: string
          establishment_id: string
          forma_pagamento: string
          id: string
          previsao_entrega: string | null
          status: string
          subtotal: number
          taxa_entrega: number
          total: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          endereco_entrega: string
          establishment_id: string
          forma_pagamento?: string
          id?: string
          previsao_entrega?: string | null
          status?: string
          subtotal?: number
          taxa_entrega?: number
          total?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          endereco_entrega?: string
          establishment_id?: string
          forma_pagamento?: string
          id?: string
          previsao_entrega?: string | null
          status?: string
          subtotal?: number
          taxa_entrega?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otp_challenges: {
        Row: {
          codigo_hash: string
          criado_em: string
          enviado_em: string
          expira_em: string
          nome: string
          telefone: string
          tentativas: number
        }
        Insert: {
          codigo_hash: string
          criado_em?: string
          enviado_em?: string
          expira_em: string
          nome: string
          telefone: string
          tentativas?: number
        }
        Update: {
          codigo_hash?: string
          criado_em?: string
          enviado_em?: string
          expira_em?: string
          nome?: string
          telefone?: string
          tentativas?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          atualizado_em: string
          criado_em: string
          endereco_padrao: string | null
          id: string
          nome: string
          notificacoes_ativas: boolean
          role: string
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          endereco_padrao?: string | null
          id: string
          nome: string
          notificacoes_ativas?: boolean
          role?: string
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          endereco_padrao?: string | null
          id?: string
          nome?: string
          notificacoes_ativas?: boolean
          role?: string
          telefone?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          order_id: string | null
          status: string
          tipo: string
          valor: number
          wallet_id: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          order_id?: string | null
          status: string
          tipo: string
          valor: number
          wallet_id: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          order_id?: string | null
          status?: string
          tipo?: string
          valor?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          a_receber: number
          atualizado_em: string
          establishment_id: string
          id: string
          recebido_hoje: number
          saldo_disponivel: number
        }
        Insert: {
          a_receber?: number
          atualizado_em?: string
          establishment_id: string
          id?: string
          recebido_hoje?: number
          saldo_disponivel?: number
        }
        Update: {
          a_receber?: number
          atualizado_em?: string
          establishment_id?: string
          id?: string
          recebido_hoje?: number
          saldo_disponivel?: number
        }
        Relationships: [
          {
            foreignKeyName: "wallets_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: true
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sacar_saldo: { Args: { valor_saque: number }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
