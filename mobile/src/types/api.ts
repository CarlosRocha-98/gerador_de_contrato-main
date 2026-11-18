export type TokenPair = {
  access: string;
  refresh: string;
};

export type PerfilUsuario = {
  usuario_id: number;
  username: string;
  email: string;
  nome: string;
  nacionalidade: string;
  profissao: string;
  estado_civil: string;
  rg: string;
  orgao_expedidor: string;
  cpf: string;
  telefone: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  criado_em: string;
};

export type Cliente = {
  id: number;
  usuario: number;
  nome: string;
  nacionalidade: string;
  profissao: string;
  estado_civil: string;
  rg: string;
  orgao_expedidor: string;
  cpf: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  criado_em: string;
};

export type Imovel = {
  id: number;
  usuario: number;
  endereco: string;
  numero: string;
  bairro: string;
  cidade_uf: string;
  tipo: string;
  caracteristicas: string;
  criado_em: string;
};

export type ContratoAluguel = {
  id: number;
  usuario: number;
  inquilino: number;
  inquilino_detail?: Cliente;
  proprietario_detail?: PerfilUsuario;
  imovel: number;
  imovel_detail?: Imovel;
  prazo_meses: number;
  valor_aluguel: string;
  dia_vencimento: number;
  valor_caucao: string;
  multa_infracao: string;
  multa_rescisao: string;
  cidade_assinatura: string;
  estado_assinatura: string;
  data_inicio: string;
  data_assinatura: string;
  sem_caucao: boolean;
  sem_multa_infracao: boolean;
  sem_multa_rescisao: boolean;
  criado_em: string;
};

export type ContratoServico = {
  id: number;
  usuario: number;
  prestador: number;
  prestador_detail?: Cliente;
  contratante_detail?: PerfilUsuario;
  tipo_servico: string;
  especificacao_servico: string;
  atividades_contratadas: string;
  motivo_contratacao: string;
  data_inicio: string;
  data_termino: string;
  prazo_meses: number;
  valor_mensal: string;
  forma_pagamento: string;
  dia_vencimento: number;
  local_execucao: string;
  executa_nas_dependencias: boolean;
  disposicoes_seguranca: string;
  multa_atraso: string;
  multa_rescisao: string;
  responsabilidade_subsidiaria: boolean;
  criado_em: string;
};

export type ApiValidationError = Record<string, string[] | string> & {
  detail?: string;
  non_field_errors?: string[];
};

export type ContractSummary = {
  id: number;
  tipo: 'aluguel' | 'servico';
  titulo: string;
  subtitulo: string;
  valor: string;
  data: string;
};

export type AuthState = {
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  profile: PerfilUsuario | null;
};