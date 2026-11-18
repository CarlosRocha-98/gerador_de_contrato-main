import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { http } from "@/services/http";
import type {
  Cliente,
  ContratoAluguel,
  ContratoServico,
  PerfilUsuario,
} from "@/types/api";

type ContractPdfSection = {
  heading: string;
  paragraphs: string[];
};

type ContractPdfDocument = {
  title: string;
  sections: ContractPdfSection[];
  signatureDate: string;
  signers: string[];
};

function valueOrFallback(
  value: string | number | undefined,
  fallback = "Não informado",
) {
  return value === undefined || value === "" ? fallback : String(value);
}

function formatDate(value: string | undefined) {
  if (!value) return "Não informada";
  const date = value.slice(0, 10).split("-");
  return date.length === 3 ? `${date[2]}/${date[1]}/${date[0]}` : value;
}

function formatMoney(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : `R$ ${value}`;
}

function personAddress(person: Cliente | PerfilUsuario) {
  const street = [person.rua, person.numero].filter(Boolean).join(", ");
  return [
    street,
    person.bairro,
    [person.cidade, person.estado].filter(Boolean).join("/"),
    person.cep ? `CEP ${person.cep}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function rentalOwnerText(owner?: PerfilUsuario) {
  if (!owner) return "LOCADOR: Não informado.";
  return `LOCADOR: ${valueOrFallback(owner.nome)}, ${valueOrFallback(owner.nacionalidade)}, ${valueOrFallback(owner.profissao)}, ${valueOrFallback(owner.estado_civil)}, RG ${valueOrFallback(owner.rg)} ${valueOrFallback(owner.orgao_expedidor)}, CPF ${valueOrFallback(owner.cpf)}, residente em ${personAddress(owner) || "endereço não informado"}.`;
}

export function buildRentalContractPdfHtml(contract: ContratoAluguel) {
  const tenant = contract.inquilino_detail;
  const property = contract.imovel_detail;
  const tenantName = tenant?.nome || `Cliente ${contract.inquilino}`;
  const propertyAddress = property
    ? [property.endereco, property.numero, property.bairro, property.cidade_uf]
        .filter(Boolean)
        .join(", ")
    : `Imóvel ${contract.imovel}`;
  const signatureDate = `${valueOrFallback(contract.cidade_assinatura)}, ${valueOrFallback(contract.estado_assinatura)}, ${formatDate(contract.data_assinatura)}.`;

  return buildContractPdfHtml({
    title: "CONTRATO DE LOCAÇÃO",
    sections: [
      {
        heading: "IDENTIFICAÇÃO DAS PARTES",
        paragraphs: [
          rentalOwnerText(contract.proprietario_detail),
          `LOCATÁRIO: ${tenantName}${tenant?.cpf ? `, CPF ${tenant.cpf}` : ""}${tenant?.nacionalidade ? `. Nacionalidade: ${tenant.nacionalidade}` : ""}${tenant?.profissao ? `. Profissão: ${tenant.profissao}` : ""}${tenant?.estado_civil ? `. Estado civil: ${tenant.estado_civil}` : ""}.`,
        ],
      },
      {
        heading: "1. DO IMÓVEL",
        paragraphs: [
          `O imóvel objeto desta locação está situado em ${propertyAddress || "endereço não informado"}${property?.tipo ? `. Tipo: ${property.tipo}` : ""}${property?.caracteristicas ? `. Características: ${property.caracteristicas}` : ""}.`,
        ],
      },
      {
        heading: "2. DO PRAZO",
        paragraphs: [
          `O prazo previsto para a locação é de ${contract.prazo_meses} meses, com início em ${formatDate(contract.data_inicio)}.`,
        ],
      },
      {
        heading: "3. DO ALUGUEL E VENCIMENTO",
        paragraphs: [
          `O aluguel mensal é de ${formatMoney(contract.valor_aluguel)}, com vencimento no dia ${contract.dia_vencimento} de cada mês.`,
        ],
      },
      {
        heading: "4. DA CAUÇÃO",
        paragraphs: [
          contract.sem_caucao
            ? "As partes indicam que não haverá cobrança de caução."
            : `O valor da caução informado é de ${formatMoney(contract.valor_caucao)}.`,
        ],
      },
      {
        heading: "5. DAS MULTAS",
        paragraphs: [
          `Multa por infração: ${contract.sem_multa_infracao ? "isenta" : formatMoney(contract.multa_infracao)}.\nMulta por rescisão: ${contract.sem_multa_rescisao ? "isenta" : formatMoney(contract.multa_rescisao)}.`,
        ],
      },
      { heading: "6. DO LOCAL E DATA", paragraphs: [signatureDate] },
    ],
    signatureDate,
    signers: [contract.proprietario_detail?.nome || "LOCADOR", tenantName],
  });
}

export function buildServiceContractPdfHtml(contract: ContratoServico) {
  const contractor = contract.contratante_detail;
  const provider = contract.prestador_detail;
  const contractorAddress = contractor ? personAddress(contractor) : "";
  const providerAddress = provider ? personAddress(provider) : "";
  const city = contractor?.cidade || "Cidade não informada";
  const state = contractor?.estado || "UF";
  const signatureDate =
    "Local e data da assinatura não foram armazenados neste contrato.";
  const executionPlace = contract.executa_nas_dependencias
    ? `Os serviços serão executados nas dependências da CONTRATANTE, situadas em ${valueOrFallback(contract.local_execucao)}.`
    : `Os serviços serão executados fora das dependências da CONTRATANTE, no seguinte local: ${valueOrFallback(contract.local_execucao)}.`;
  const cancellation = Number(contract.multa_rescisao) > 0
    ? `Em caso de rescisão antecipada por qualquer das partes, sem justa causa, deverá ser paga à outra parte uma multa no valor de ${formatMoney(contract.multa_rescisao)}.`
    : "Não há valor de multa por rescisão armazenado neste contrato.";
  const subsidiaryResponsibility = contract.responsabilidade_subsidiaria
    ? "A CONTRATANTE poderá responder subsidiariamente pelas obrigações trabalhistas do PRESTADOR, nos termos da legislação aplicável."
    : "O PRESTADOR será exclusivamente responsável por suas obrigações trabalhistas, fiscais e previdenciárias.";

  return buildContractPdfHtml({
    title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS",
    sections: [
      {
        heading: "IDENTIFICAÇÃO DAS PARTES",
        paragraphs: [
          `CONTRATANTE: ${contractor?.nome || "Não informado"}, CPF ${valueOrFallback(contractor?.cpf)}, residente em ${contractorAddress || "endereço não informado"}.`,
          `PRESTADOR: ${provider?.nome || `Prestador ${contract.prestador}`}, ${valueOrFallback(provider?.nacionalidade)}, ${valueOrFallback(provider?.profissao)}, ${valueOrFallback(provider?.estado_civil)}, CPF ${valueOrFallback(provider?.cpf)}, residente em ${providerAddress || "endereço não informado"}.`,
          "As partes acima identificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes:",
        ],
      },
      {
        heading: "Cláusula 1ª – DO OBJETO DO CONTRATO",
        paragraphs: [
          `O presente contrato tem por objeto a prestação de serviços de ${contract.tipo_servico}, conforme especificado a seguir:`,
          contract.especificacao_servico,
        ],
      },
      {
        heading: "Cláusula 2ª – DAS ATIVIDADES CONTRATADAS",
        paragraphs: [
          "As seguintes atividades deverão ser executadas pelo PRESTADOR:",
          contract.atividades_contratadas,
        ],
      },
      {
        heading: "Cláusula 3ª – DO MOTIVO DA CONTRATAÇÃO",
        paragraphs: [contract.motivo_contratacao],
      },
      {
        heading: "Cláusula 4ª – DO PRAZO",
        paragraphs: [
          `O presente contrato vigorará pelo prazo de ${contract.prazo_meses} meses, com início em ${formatDate(contract.data_inicio)} e término em ${formatDate(contract.data_termino)}.`,
        ],
      },
      {
        heading: "Cláusula 5ª – DO LOCAL DE EXECUÇÃO",
        paragraphs: [executionPlace],
      },
      {
        heading: "Cláusula 6ª – DA REMUNERAÇÃO E FORMA DE PAGAMENTO",
        paragraphs: [
          `Pela prestação dos serviços, a CONTRATANTE pagará ao PRESTADOR o valor mensal de ${formatMoney(contract.valor_mensal)}, de forma ${contract.forma_pagamento}, com vencimento no dia ${contract.dia_vencimento} de cada mês.`,
          `§ 1º. O não pagamento na data acordada sujeitará a CONTRATANTE ao pagamento de multa de ${formatMoney(contract.multa_atraso)}, além de juros de 1% ao mês sobre o valor em atraso.`,
        ],
      },
      {
        heading: "Cláusula 7ª – DAS DISPOSIÇÕES DE SEGURANÇA, HIGIENE E SALUBRIDADE",
        paragraphs: [
          contract.disposicoes_seguranca,
          "Parágrafo único. O PRESTADOR é o responsável pelo cumprimento das normas de segurança do trabalho aplicáveis à atividade prestada.",
        ],
      },
      {
        heading: "Cláusula 8ª – DA RESCISÃO",
        paragraphs: [cancellation],
      },
      {
        heading: "Cláusula 9ª – DA RESPONSABILIDADE SUBSIDIÁRIA",
        paragraphs: [subsidiaryResponsibility],
      },
      {
        heading: "Cláusula 10ª – DO FORO",
        paragraphs: [
          `As partes elegem o foro da comarca de ${city}/${state} para dirimir quaisquer controvérsias oriundas do presente contrato.`,
        ],
      },
    ],
    signatureDate,
    signers: ["CONTRATANTE", provider?.nome || "PRESTADOR"],
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildContractPdfHtml(document: ContractPdfDocument) {
  const sections = document.sections
    .map(
      (section) => `
        <h3>${escapeHtml(section.heading)}</h3>
        ${section.paragraphs
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("")}
      `,
    )
    .join("");
  const signatures = document.signers
    .map(
      (signer) => `
        <div class="signature-line">
          <hr />
          <p>${escapeHtml(signer)}</p>
        </div>
      `,
    )
    .join("");

  return `
    <h2>${escapeHtml(document.title)}</h2>
    ${sections}
    <p>${escapeHtml(document.signatureDate)}</p>
    <div class="signature-lines">${signatures}</div>
  `;
}

function pdfFilename(title: string) {
  const safeTitle =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "Contrato";
  return `${safeTitle}.pdf`;
}

async function getApiErrorMessage(error: any) {
  const data = error?.response?.data;
  let responseText: string | null = null;

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    responseText = await data.text();
  } else if (data instanceof ArrayBuffer) {
    responseText = new TextDecoder().decode(data);
  } else if (typeof data === "string") {
    responseText = data;
  }

  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      if (typeof parsed?.detail === "string") {
        return parsed.detail;
      }
    } catch {
      return responseText;
    }
  }

  return error?.message || "Não foi possível gerar o PDF do contrato.";
}

export async function downloadContractPdf(html: string, title: string) {
  const filename = pdfFilename(title);

  try {
    if (Platform.OS === "web") {
      const response = await http.post<Blob>(
        "/api/contratos/gerar-pdf/",
        { html, titulo: filename.replace(/\.pdf$/i, "") },
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    const response = await http.post<ArrayBuffer>(
      "/api/contratos/gerar-pdf/",
      { html, titulo: filename.replace(/\.pdf$/i, "") },
      { responseType: "arraybuffer" },
    );
    const file = new File(Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(new Uint8Array(response.data));

    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("O compartilhamento de arquivos não está disponível.");
    }

    await Sharing.shareAsync(file.uri, {
      dialogTitle: "Salvar ou compartilhar contrato",
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
  } catch (error: any) {
    throw new Error(await getApiErrorMessage(error));
  }
}
