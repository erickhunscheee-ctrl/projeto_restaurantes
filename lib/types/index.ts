export type Establishment = {
  id: string;
  nome: string;
  tipo_cozinha: "caseira" | "fit" | "vegana" | "outra";
  distancia_km: number | null;
  nota_media: number;
  horario_abertura: string | null;
  horario_fechamento: string | null;
  status: "aberto" | "fechado";
  foto_url: string | null;
  avatar_iniciais: string | null;
  avatar_cor: string | null;
  whatsapp_telefone?: string | null;
};

export type Category = {
  id: string;
  nome: string;
  slug: string;
  image_url: string | null;
  ordem: number;
  ativo: boolean;
};

export type Dish = {
  id: string;
  establishment_id: string;
  nome: string;
  preco_base: number;
  categoria: string | null;
  disponivel_hoje: boolean;
  icone_split: number;
};

export type DishOption = {
  id: string;
  dish_id: string;
  grupo: "proteina" | "acompanhamento" | "extra";
  nome: string;
  preco_adicional: number;
  selecao_min: number;
  selecao_max: number;
};

export type OrderStatus = "recebido" | "preparando" | "a_caminho" | "entregue";

export type Order = {
  id: string;
  user_id: string;
  establishment_id: string;
  status: OrderStatus;
  endereco_entrega: string;
  forma_pagamento: string;
  subtotal: number;
  taxa_entrega: number;
  total: number;
  criado_em: string;
  previsao_entrega: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  dish_id: string;
  quantidade: number;
  opcoes_selecionadas: { dish_option_id: string; nome: string; preco_adicional: number }[];
  observacoes: string | null;
  preco_unitario: number;
};

export type Wallet = {
  id: string;
  establishment_id: string;
  saldo_disponivel: number;
  recebido_hoje: number;
  a_receber: number;
};

export type Profile = {
  id: string;
  nome: string;
  telefone: string | null;
  endereco_padrao: string | null;
  notificacoes_ativas: boolean;
  role?: "cliente" | "restaurante";
};

export type Address = {
  id: string;
  user_id: string;
  rotulo: string;
  endereco: string;
  padrao: boolean;
  criado_em: string;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number | null;
  longitude: number | null;
};

// Item de carrinho local (antes de virar Order/OrderItem no banco)
export type CartItem = {
  dish_id: string;
  dish_nome: string;
  establishment_id: string;
  quantidade: number;
  opcoes_selecionadas: { dish_option_id: string; nome: string; preco_adicional: number }[];
  observacoes: string;
  preco_unitario: number;
};
