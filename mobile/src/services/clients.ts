import { requestJson, sendJson } from './http';
import type { Cliente } from '@/types/api';

export type ClientePayload = Omit<Cliente, 'id' | 'usuario' | 'criado_em'>;

export async function listClients() {
  return requestJson<Cliente[]>('/api/clientes/');
}

export async function createClient(payload: Partial<ClientePayload>) {
  return sendJson<Cliente>('/api/clientes/', payload);
}

export async function updateClient(id: number, payload: Partial<ClientePayload>) {
  return sendJson<Cliente>(`/api/clientes/${id}/`, payload, 'put');
}

export async function deleteClient(id: number) {
  await sendJson(`/api/clientes/${id}/`, {}, 'delete');
}