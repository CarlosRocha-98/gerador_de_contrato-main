import { requestJson, sendJson } from './http';
import { clearTokens, setTokens } from './tokenStore';
import type { PerfilUsuario, TokenPair } from '@/types/api';

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  nome?: string;
  cpf?: string;
  telefone?: string;
  nacionalidade?: string;
  profissao?: string;
  estado_civil?: string;
  rg?: string;
  orgao_expedidor?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
};

export async function login(payload: LoginPayload) {
  const tokens = await sendJson<TokenPair>('/api/token/', payload);
  await setTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function register(payload: RegisterPayload) {
  return sendJson('/api/register/', payload);
}

export async function getProfile() {
  return requestJson<PerfilUsuario>('/api/perfil/');
}

export async function updateProfile(payload: Partial<PerfilUsuario>) {
  return sendJson<PerfilUsuario>('/api/perfil/', payload, 'put');
}

export async function logout() {
  await clearTokens();
}