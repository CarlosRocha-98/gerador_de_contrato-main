import { requestJson, sendJson } from './http';
import type { Imovel } from '@/types/api';

export type ImovelPayload = Omit<Imovel, 'id' | 'usuario' | 'criado_em'>;

export async function listProperties() {
  return requestJson<Imovel[]>('/api/imoveis/');
}

export async function createProperty(payload: Partial<ImovelPayload>) {
  return sendJson<Imovel>('/api/imoveis/', payload);
}

export async function updateProperty(id: number, payload: Partial<ImovelPayload>) {
  return sendJson<Imovel>(`/api/imoveis/${id}/`, payload, 'put');
}

export async function deleteProperty(id: number) {
  await sendJson(`/api/imoveis/${id}/`, {}, 'delete');
}