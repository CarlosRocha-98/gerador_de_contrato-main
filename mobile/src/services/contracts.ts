import { requestJson, sendJson } from './http';
import type { ContratoAluguel, ContratoServico } from '@/types/api';

export type ContratoAluguelPayload = Omit<
  ContratoAluguel,
  | 'id'
  | 'usuario'
  | 'criado_em'
  | 'valor_aluguel'
  | 'valor_caucao'
  | 'multa_infracao'
  | 'multa_rescisao'
> & {
  valor_aluguel: number;
  valor_caucao: number;
  multa_infracao: number;
  multa_rescisao: number;
};
export type ContratoServicoPayload = Omit<ContratoServico, 'id' | 'usuario' | 'criado_em'>;

export async function listRentalContracts() {
  return requestJson<ContratoAluguel[]>('/api/contratoaluguel/');
}

export async function listServiceContracts() {
  return requestJson<ContratoServico[]>('/api/contratoservico/');
}

export async function createRentalContract(payload: ContratoAluguelPayload) {
  return sendJson<ContratoAluguel>('/api/contratoaluguel/', payload);
}

export async function createServiceContract(payload: Partial<ContratoServicoPayload>) {
  return sendJson<ContratoServico>('/api/contratoservico/', payload);
}

export async function deleteRentalContract(id: number) {
  await sendJson(`/api/contratoaluguel/${id}/`, {}, 'delete');
}

export async function deleteServiceContract(id: number) {
  await sendJson(`/api/contratoservico/${id}/`, {}, 'delete');
}