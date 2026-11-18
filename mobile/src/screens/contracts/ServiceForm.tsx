import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Page } from "@/components/Page";
import { Button, Card, InputField, SectionTitle } from "@/components/ui";
import { createServiceContract } from "@/services/contracts";
import {
  buildContractPdfHtml,
  downloadContractPdf,
} from "@/services/contractPdf";
import { listClients } from "@/services/clients";
import { useAuth } from "@/context/AuthContext";
import { colors as themeColors } from "@/theme/colors";

type Client = {
  id: number | string;
  nome?: string;
  name?: string;
  razao_social?: string;
  cpf?: string;
  cnpj?: string;
  nacionalidade?: string;
  profissao?: string;
  estado_civil?: string;
  estadoCivil?: string;
  telefone?: string;
  email?: string;
  rua?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  [key: string]: unknown;
};

const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
];

const initialForm = {
  // Contratante
  cont_nome: "",
  cont_nacionalidade: "",
  cont_profissao: "",
  cont_estado_civil: "Solteiro(a)",
  cont_cpf: "",
  cont_telefone: "",
  cont_endereco: "",
  cont_numero: "",
  cont_bairro: "",
  cont_cep: "",
  cont_cidade: "",
  cont_estado: "",

  // Prestador
  prest_nome: "",
  prest_nacionalidade: "",
  prest_profissao: "",
  prest_estado_civil: "",
  prest_cpf: "",
  prest_telefone: "",
  prest_email: "",
  prest_endereco: "",
  prest_numero: "",
  prest_bairro: "",
  prest_cep: "",
  prest_cidade: "",
  prest_estado: "",

  // Serviço
  tipo_servico: "",
  especificacao_servico: "",
  atividades_contratadas: "",
  motivo_contratacao: "",
  local_execucao: "",
  executa_nas_dependencias: true,
  disposicoes_seguranca: "",

  // Condições
  prazo_meses: "",
  data_inicio: "",
  data_termino: "",
  valor_mensal: "",
  forma_pagamento: "",
  dia_vencimento: "",
  multa_atraso: "",
  multa_rescisao: "",
  sem_multa_rescisao: false,
  responsabilidade_subsidiaria: true,

  // Assinatura
  assinatura_cidade: "",
  assinatura_estado: "",
  data_assinatura: "",
};

type FormKey = keyof typeof initialForm;

const colors = {
  primary: "#e94560",
  primaryDark: "#c73a52",
  dark: "#1a2332",
  text: "#333333",
  muted: "#666666",
  border: "#dddddd",
};

function formatDatePtBR(dateStr: string) {
  if (!dateStr) return "______________";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const m = parseInt(parts[1], 10) - 1;
  if (m < 0 || m > 11) return dateStr;
  return `${parseInt(parts[2], 10)} de ${months[m]} de ${parts[0]}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEstadoCivil(value?: string) {
  const normalized = value
    ?.trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!normalized) return "";
  if (normalized.startsWith("solteir")) return "Solteiro(a)";
  if (normalized.startsWith("casad")) return "Casado(a)";
  if (normalized.startsWith("divorciad")) return "Divorciado(a)";
  if (normalized.startsWith("viuv")) return "Viúvo(a)";

  return ESTADOS_CIVIS.find(
    (status) => status.toLocaleLowerCase("pt-BR") === normalized,
  ) || "";
}

export function ServiceForm() {
  const navigation = useNavigation<any>();
  const auth = useAuth();

  const [form, setForm] = useState(initialForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedContratanteId, setSelectedContratanteId] = useState<
    number | string | null
  >(null);
  const [prestadorBloqueado, setPrestadorBloqueado] = useState(false);

  // ── Carrega clientes ────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    listClients()
      .then((result) => {
        if (active) setClients(result as Client[]);
      })
      .catch(() => {
        if (active) {
          Alert.alert("Erro", "Não foi possível carregar os clientes.");
        }
      })
      .finally(() => {
        if (active) setLoadingClients(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // ── Preenche prestador a partir do perfil logado ────────────────────
  useEffect(() => {
    const p: any = auth.profile;
    if (!p) return;
    setForm((current) => ({
      ...current,
      prest_nome: p.nome ?? current.prest_nome,
      prest_nacionalidade: p.nacionalidade ?? current.prest_nacionalidade,
      prest_profissao: p.profissao ?? current.prest_profissao,
      prest_estado_civil:
        normalizeEstadoCivil(p.estado_civil) || current.prest_estado_civil,
      prest_cpf: p.cpf ?? current.prest_cpf,
      prest_telefone: p.telefone ?? current.prest_telefone,
      prest_email: p.email ?? current.prest_email,
      prest_endereco: p.rua ?? current.prest_endereco,
      prest_numero: p.numero ?? current.prest_numero,
      prest_bairro: p.bairro ?? current.prest_bairro,
      prest_cep: p.cep ?? current.prest_cep,
      prest_cidade: p.cidade ?? current.prest_cidade,
      prest_estado: p.estado ?? current.prest_estado,
    }));
    if (p.nome) setPrestadorBloqueado(true);
  }, [auth.profile]);

  // ── Auto-preenche datas com hoje ────────────────────────────────────
  useEffect(() => {
    const hoje = todayISO();
    setForm((current) => ({
      ...current,
      data_inicio: current.data_inicio || hoje,
      data_termino: current.data_termino || hoje,
      data_assinatura: current.data_assinatura || hoje,
    }));
  }, []);

  const setValue = (key: FormKey, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }) as typeof initialForm);
  };

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      const name = client.nome || client.name || client.razao_social || "";
      const document = client.cpf || client.cnpj || "";
      return (
        String(name).toLowerCase().includes(query) ||
        String(document).toLowerCase().includes(query) ||
        String(client.telefone || "").toLowerCase().includes(query) ||
        String(client.id).includes(query)
      );
    });
  }, [clients, search]);

  const applyClientToContratante = (c: Client) => {
    setForm((current) => ({
      ...current,
      cont_nome: (c.nome || c.name || c.razao_social || "") as string,
      cont_nacionalidade: (c.nacionalidade || "") as string,
      cont_profissao: (c.profissao || "") as string,
      cont_estado_civil:
        ((c.estado_civil || c.estadoCivil) as string) || "Solteiro(a)",
      cont_cpf: (c.cpf || c.cnpj || "") as string,
      cont_telefone: (c.telefone || "") as string,
      cont_endereco: (c.rua || c.endereco || "") as string,
      cont_numero: (c.numero || "") as string,
      cont_bairro: (c.bairro || "") as string,
      cont_cep: (c.cep || "") as string,
      cont_cidade: (c.cidade || "") as string,
      cont_estado: (c.estado || "") as string,
    }));
    setSelectedContratanteId(c.id);
  };

  const validateForm = () => {
    const obrigatorios: Array<[string, string]> = [
      [form.prest_nome, "Nome do prestador"],
      [form.prest_cpf, "CPF do prestador"],
      [form.cont_nome, "Nome do contratante"],
      [form.cont_cpf, "CPF do contratante"],
      [form.tipo_servico, "Tipo de serviço"],
      [form.especificacao_servico, "Especificação do serviço"],
      [form.atividades_contratadas, "Atividades contratadas"],
      [form.disposicoes_seguranca, "Disposições de segurança"], // 👈 OBRIGATÓRIO
      [form.prazo_meses, "Prazo (meses)"],
      [form.valor_mensal, "Valor mensal"],
      [form.data_inicio, "Data de início"],
      [form.data_termino, "Data de término"],
      [form.assinatura_cidade, "Cidade de assinatura"],
      [form.assinatura_estado, "Estado de assinatura"],
    ];

    const faltando = obrigatorios
      .filter(([valor]) => !String(valor || "").trim())
      .map(([, label]) => label);

    if (faltando.length > 0) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha os campos:\n\n• " + faltando.join("\n• "),
      );
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await createServiceContract({
        prestador: selectedContratanteId
          ? Number(selectedContratanteId)
          : undefined,
        tipo_servico: form.tipo_servico,
        especificacao_servico: form.especificacao_servico,
        atividades_contratadas: form.atividades_contratadas,
        motivo_contratacao: form.motivo_contratacao,
        data_inicio: form.data_inicio,
        data_termino: form.data_termino,
        prazo_meses: Number(form.prazo_meses) || 1,
        valor_mensal:
          Number(String(form.valor_mensal).replace(",", ".")) || 0,
        forma_pagamento: form.forma_pagamento,
        dia_vencimento: Number(form.dia_vencimento) || 10,
        local_execucao: form.local_execucao,
        executa_nas_dependencias: form.executa_nas_dependencias,
        disposicoes_seguranca: form.disposicoes_seguranca,
        multa_atraso:
          Number(String(form.multa_atraso).replace(",", ".")) || 0,
        multa_rescisao:
          Number(String(form.multa_rescisao).replace(",", ".")) || 0,
        responsabilidade_subsidiaria: form.responsabilidade_subsidiaria,
      } as any);

      Alert.alert("Sucesso", "Contrato de serviço salvo.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.log("ERRO CONTRATO:", {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config,
      });
      Alert.alert(
        "Erro ao salvar",
        JSON.stringify({
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (pdfSaving || !validateForm()) return;

    setPdfSaving(true);
    try {
      const html = buildContractPdfHtml({
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS",
        sections: [
          {
            heading: "IDENTIFICAÇÃO DAS PARTES CONTRATANTES",
            paragraphs: [
              `CONTRATANTE: ${fieldValue(form.cont_nome)}, ${fieldValue(form.cont_nacionalidade)}, ${fieldValue(form.cont_profissao)}, ${fieldValue(form.cont_estado_civil)}, C.P.F. nº ${fieldValue(form.cont_cpf)}, residente na ${fieldValue(form.cont_endereco)}, nº ${fieldValue(form.cont_numero)}, bairro ${fieldValue(form.cont_bairro)}, ${fieldValue(form.cont_cidade)}/${fieldValue(form.cont_estado)}, CEP: ${fieldValue(form.cont_cep)}.`,
              `PRESTADOR: ${fieldValue(form.prest_nome)}, ${fieldValue(form.prest_nacionalidade)}, ${fieldValue(form.prest_profissao)}, ${fieldValue(form.prest_estado_civil)}, C.P.F. nº ${fieldValue(form.prest_cpf)}, residente na ${fieldValue(form.prest_endereco)}, nº ${fieldValue(form.prest_numero)}, bairro ${fieldValue(form.prest_bairro)}, ${fieldValue(form.prest_cidade)}/${fieldValue(form.prest_estado)}, CEP: ${fieldValue(form.prest_cep)}.`,
              "As partes acima identificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes:",
            ],
          },
          {
            heading: "Cláusula 1ª – DO OBJETO DO CONTRATO",
            paragraphs: [
              `O presente contrato tem por objeto a prestação de serviços de ${fieldValue(form.tipo_servico)}, conforme especificado a seguir:`,
              fieldValue(form.especificacao_servico),
            ],
          },
          {
            heading: "Cláusula 2ª – DAS ATIVIDADES CONTRATADAS",
            paragraphs: [
              "As seguintes atividades deverão ser executadas pelo PRESTADOR:",
              fieldValue(form.atividades_contratadas),
            ],
          },
          {
            heading: "Cláusula 3ª – DO MOTIVO DA CONTRATAÇÃO",
            paragraphs: [fieldValue(form.motivo_contratacao)],
          },
          {
            heading: "Cláusula 4ª – DO PRAZO",
            paragraphs: [
              `O presente contrato vigorará pelo prazo de ${fieldValue(form.prazo_meses)} meses, com início em ${formatDatePtBR(form.data_inicio)} e término em ${formatDatePtBR(form.data_termino)}.`,
            ],
          },
          {
            heading: "Cláusula 5ª – DO LOCAL DE EXECUÇÃO",
            paragraphs: [localExecucaoTexto],
          },
          {
            heading: "Cláusula 6ª – DA REMUNERAÇÃO E FORMA DE PAGAMENTO",
            paragraphs: [
              `Pela prestação dos serviços, a CONTRATANTE pagará ao PRESTADOR o valor mensal de R$ ${fieldValue(form.valor_mensal)}, de forma ${fieldValue(form.forma_pagamento)}, com vencimento no dia ${fieldValue(form.dia_vencimento)} de cada mês.`,
              `§ 1º. O não pagamento na data acordada sujeitará a CONTRATANTE ao pagamento de multa de R$ ${fieldValue(form.multa_atraso)}, além de juros de 1% ao mês sobre o valor em atraso.`,
            ],
          },
          {
            heading:
              "Cláusula 7ª – DAS DISPOSIÇÕES DE SEGURANÇA, HIGIENE E SALUBRIDADE",
            paragraphs: [
              fieldValue(form.disposicoes_seguranca),
              "Parágrafo único. O PRESTADOR é o responsável pelo cumprimento das normas de segurança do trabalho aplicáveis à atividade prestada.",
            ],
          },
          {
            heading: "Cláusula 8ª – DA RESCISÃO",
            paragraphs: [rescisaoTexto],
          },
          {
            heading: "Cláusula 9ª – DA RESPONSABILIDADE SUBSIDIÁRIA",
            paragraphs: [responsabilidadeTexto],
          },
          {
            heading: "Cláusula 10ª – DO FORO",
            paragraphs: [
              `As partes elegem o foro da comarca de ${fieldValue(form.assinatura_cidade)}/${fieldValue(form.assinatura_estado)} para dirimir quaisquer controvérsias oriundas do presente contrato.`,
            ],
          },
        ],
        signatureDate: `${fieldValue(form.assinatura_cidade)}, ${fieldValue(form.assinatura_estado)}, ${formatDatePtBR(form.data_assinatura)}.`,
        signers: ["CONTRATANTE", "PRESTADOR"],
      });
      await downloadContractPdf(html, "Contrato_de_Servicos");
    } catch (error: any) {
      Alert.alert(
        "Erro ao gerar PDF",
        error?.message || "Não foi possível gerar o PDF do contrato.",
      );
    } finally {
      setPdfSaving(false);
    }
  };

  const clearForm = () => {
    Alert.alert("Limpar formulário", "Deseja apagar os dados preenchidos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpar",
        style: "destructive",
        onPress: () => {
          const hoje = todayISO();
          const p: any = auth.profile;
          setForm({
            ...initialForm,
            prest_nome: p?.nome ?? "",
            prest_nacionalidade: p?.nacionalidade ?? "",
            prest_profissao: p?.profissao ?? "",
            prest_estado_civil: normalizeEstadoCivil(p?.estado_civil),
            prest_cpf: p?.cpf ?? "",
            prest_telefone: p?.telefone ?? "",
            prest_email: p?.email ?? "",
            prest_endereco: p?.rua ?? "",
            prest_numero: p?.numero ?? "",
            prest_bairro: p?.bairro ?? "",
            prest_cep: p?.cep ?? "",
            prest_cidade: p?.cidade ?? "",
            prest_estado: p?.estado ?? "",
            data_inicio: hoje,
            data_termino: hoje,
            data_assinatura: hoje,
          });
          setSelectedContratanteId(null);
          setPreviewVisible(false);
        },
      },
    ]);
  };

  // ── Helpers de render ──────────────────────────────────────────────
  const renderTextField = (
    key: FormKey,
    label: string,
    options: {
      multiline?: boolean;
      keyboardType?: "default" | "numeric" | "decimal-pad";
      placeholder?: string;
      helperText?: string;
      editable?: boolean;
    } = {},
  ) => (
    <InputField
      key={key}
      label={label}
      value={String(form[key] ?? "")}
      onChangeText={(value) => setValue(key, value)}
      multiline={options.multiline}
      numberOfLines={options.multiline ? 3 : undefined}
      keyboardType={options.keyboardType}
      placeholder={options.placeholder}
      helperText={options.helperText}
      editable={options.editable !== false}
    />
  );

  const renderEstadoCivil = (
    key: FormKey,
    label: string,
    options: { disabled?: boolean } = {},
  ) => (
    <View key={key} style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {ESTADOS_CIVIS.map((opt) => {
          const active = form[key] === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => !options.disabled && setValue(key, opt)}
              disabled={options.disabled}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? "#fdeef1" : "#fafafa",
                opacity: options.disabled ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: active ? colors.primaryDark : colors.muted,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderToggle = (
    key:
      | "executa_nas_dependencias"
      | "responsabilidade_subsidiaria"
      | "sem_multa_rescisao",
    label: string,
  ) => (
    <Pressable
      key={key}
      onPress={() => {
        const next = !form[key];
        setValue(key, next);
        if (key === "sem_multa_rescisao" && next) {
          setValue("multa_rescisao", "");
        }
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: form[key] }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 10,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: form[key] ? colors.primary : colors.border,
          backgroundColor: form[key] ? colors.primary : "#ffffff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {form[key] && (
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>✓</Text>
        )}
      </View>
      <Text style={{ flex: 1, color: themeColors.text, fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );

  const fieldValue = (value: string) =>
    value && value.trim() ? value : "______________";

  const localExecucaoTexto = form.executa_nas_dependencias
    ? `Os serviços serão executados nas dependências da CONTRATANTE, situadas em ${fieldValue(
        form.local_execucao,
      )}.`
    : `Os serviços serão executados fora das dependências da CONTRATANTE, no seguinte local: ${fieldValue(
        form.local_execucao,
      )}.`;

  const rescisaoTexto = form.sem_multa_rescisao
    ? "As partes podem rescindir o presente contrato a qualquer momento, sem ônus para nenhuma das partes, mediante aviso prévio de 30 (trinta) dias."
    : `Em caso de rescisão antecipada por qualquer das partes, sem justa causa, deverá ser paga à outra parte uma multa no valor de R$ ${fieldValue(
        form.multa_rescisao,
      )}.`;

  const responsabilidadeTexto = form.responsabilidade_subsidiaria
    ? "A CONTRATANTE responde subsidiariamente pelas obrigações trabalhistas e previdenciárias decorrentes da execução deste contrato, nos termos da legislação vigente."
    : "A CONTRATANTE não responde subsidiariamente pelas obrigações trabalhistas e previdenciárias do PRESTADOR, sendo este o único responsável pelo cumprimento dessas obrigações.";

  return (
    <Page
      title="Contrato de Prestação de Serviços"
      subtitle="Preencha os dados para gerar o contrato."
    >
      {/* ── Dados do Contratante ─────────────────────────────────── */}
      <Card>
        <SectionTitle
          title="Dados do Contratante"
          subtitle="Preencha manualmente ou escolha um cliente cadastrado."
        />

        <View style={{ marginBottom: 14 }}>
          <Button
            label="Selecionar Cliente Cadastrado"
            variant="secondary"
            onPress={() => {
              setSearch("");
              setClientModalVisible(true);
            }}
          />
        </View>

        {renderTextField("cont_nome", "Nome completo", {
          placeholder: "Ex: João da Silva",
        })}
        {renderTextField("cont_nacionalidade", "Nacionalidade", {
          placeholder: "Brasileiro(a)",
        })}
        {renderTextField("cont_profissao", "Profissão", {
          placeholder: "Ex: Empresário",
        })}
        {renderEstadoCivil("cont_estado_civil", "Estado civil")}
        {renderTextField("cont_cpf", "CPF", {
          placeholder: "000.000.000-00",
        })}
        {renderTextField("cont_telefone", "Telefone", {
          placeholder: "(11) 99999-0000",
        })}
        {renderTextField("cont_endereco", "Endereço (rua/av)", {
          placeholder: "Ex: Rua das Flores",
        })}
        {renderTextField("cont_numero", "Número", { placeholder: "123" })}
        {renderTextField("cont_bairro", "Bairro", { placeholder: "Centro" })}
        {renderTextField("cont_cep", "CEP", { placeholder: "00000-000" })}
        {renderTextField("cont_cidade", "Cidade", {
          placeholder: "São Paulo",
        })}
        {renderTextField("cont_estado", "Estado", { placeholder: "SP" })}
      </Card>

      {/* ── Dados do Prestador (bloqueados) ──────────────────────── */}
      <Card>
        <SectionTitle
          title="Dados do Prestador de Serviços"
          subtitle={
            prestadorBloqueado
              ? "Preenchido automaticamente pelo seu perfil."
              : "Preencha os dados de quem vai prestar o serviço."
          }
        />

        {renderTextField("prest_nome", "Nome completo", {
          placeholder: "Ex: Maria Oliveira",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_nacionalidade", "Nacionalidade", {
          placeholder: "Brasileiro(a)",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_profissao", "Profissão", {
          placeholder: "Ex: Técnico",
          editable: !prestadorBloqueado,
        })}
        {renderEstadoCivil("prest_estado_civil", "Estado civil", {
          disabled:
            prestadorBloqueado &&
            Boolean(normalizeEstadoCivil(auth.profile?.estado_civil)),
        })}
        {renderTextField("prest_cpf", "CPF", {
          placeholder: "000.000.000-00",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_telefone", "Telefone", {
          placeholder: "(11) 98888-0000",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_email", "E-mail", {
          placeholder: "prestador@email.com",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_endereco", "Endereço atual (rua/av)", {
          placeholder: "Ex: Av. Brasil",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_numero", "Número", {
          placeholder: "456",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_bairro", "Bairro", {
          placeholder: "Jardins",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_cep", "CEP", {
          placeholder: "00000-000",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_cidade", "Cidade", {
          placeholder: "São Paulo",
          editable: !prestadorBloqueado,
        })}
        {renderTextField("prest_estado", "Estado", {
          placeholder: "SP",
          editable: !prestadorBloqueado,
        })}
      </Card>

      {/* ── Dados do Serviço ─────────────────────────────────────── */}
      <Card>
        <SectionTitle
          title="Dados do Serviço"
          subtitle="Descreva o serviço e as atividades contratadas."
        />

        {renderTextField("tipo_servico", "Tipo de serviço", {
          placeholder: "Ex: Limpeza, Segurança, Manutenção",
        })}
        {renderTextField("especificacao_servico", "Especificação do serviço", {
          multiline: true,
          placeholder: "Descrição detalhada do serviço a ser prestado",
        })}
        {renderTextField("atividades_contratadas", "Atividades contratadas", {
          multiline: true,
          placeholder:
            "Definição clara das atividades a serem executadas pelo prestador",
        })}
        {renderTextField("motivo_contratacao", "Motivo da contratação", {
          multiline: true,
          placeholder: "Justificativa da necessidade do serviço",
        })}
        {renderTextField("local_execucao", "Local de execução", {
          placeholder:
            "Ex: Dependências da contratante, Rua das Flores, 123",
        })}

        {renderToggle(
          "executa_nas_dependencias",
          "Serviço executado nas dependências da contratante",
        )}

        {renderTextField(
          "disposicoes_seguranca",
          "Disposições de segurança, higiene e salubridade",
          {
            multiline: true,
            placeholder:
              "Ex: O prestador deverá utilizar EPI adequados e seguir as normas de segurança vigentes...",
          },
        )}
      </Card>

      {/* ── Condições do Contrato ────────────────────────────────── */}
      <Card>
        <SectionTitle
          title="Condições do Contrato"
          subtitle="Defina a vigência e as condições de pagamento."
        />

        {renderTextField("prazo_meses", "Prazo (meses)", {
          keyboardType: "numeric",
          placeholder: "12",
        })}
        {renderTextField("data_inicio", "Data de início", {
          placeholder: "AAAA-MM-DD",
        })}
        {renderTextField("data_termino", "Data de término", {
          placeholder: "AAAA-MM-DD",
        })}
        {renderTextField("valor_mensal", "Valor mensal (R$)", {
          keyboardType: "decimal-pad",
          placeholder: "2000.00",
        })}
        {renderTextField("forma_pagamento", "Forma de pagamento", {
          placeholder: "Ex: Mensal, Quinzenal",
        })}
        {renderTextField("dia_vencimento", "Dia do vencimento", {
          keyboardType: "numeric",
          placeholder: "1 a 31",
        })}
        {renderTextField("multa_atraso", "Multa por atraso (R$)", {
          keyboardType: "decimal-pad",
          placeholder: "200.00",
        })}
        {renderTextField("multa_rescisao", "Multa por rescisão (R$)", {
          keyboardType: "decimal-pad",
          placeholder: "1000.00",
          editable: !form.sem_multa_rescisao,
          helperText: form.sem_multa_rescisao
            ? "Desabilitado: sem multa por rescisão"
            : undefined,
        })}

        {renderToggle("sem_multa_rescisao", "Sem multa por rescisão")}
        {renderToggle(
          "responsabilidade_subsidiaria",
          "Responsabilidade subsidiária da contratante",
        )}
      </Card>

      {/* ── Local e Data da Assinatura ───────────────────────────── */}
      <Card>
        <SectionTitle
          title="Local e Data da Assinatura"
          subtitle="Onde e quando o contrato está sendo firmado."
        />

        {renderTextField("assinatura_cidade", "Cidade", {
          placeholder: "São Paulo",
        })}
        {renderTextField("assinatura_estado", "Estado", {
          placeholder: "SP",
        })}
        {renderTextField("data_assinatura", "Data da assinatura", {
          placeholder: "AAAA-MM-DD",
        })}
      </Card>

      {/* ── Ações ────────────────────────────────────────────────── */}
      <Card>
        <View style={{ gap: 10 }}>
          <Button
            label={previewVisible ? "Ocultar prévia" : "Visualizar contrato"}
            variant="secondary"
            onPress={() => setPreviewVisible((c) => !c)}
          />
          <Button
            label="Baixar contrato em PDF"
            variant="secondary"
            onPress={downloadPdf}
            loading={pdfSaving}
          />
          <Button label="Salvar Contrato" onPress={submit} loading={saving} />
          <Button
            label="Limpar Formulário"
            variant="secondary"
            onPress={clearForm}
          />
          <Button
            label="← Voltar"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </Card>

      {/* ── Prévia do Contrato (único bloco com fundo branco) ────── */}
      {previewVisible && (
        <Card>
          <SectionTitle
            title="Prévia do contrato"
            subtitle="Confira os dados preenchidos antes de salvar."
          />

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              padding: 20,
              marginTop: 4,
              borderLeftWidth: 5,
              borderLeftColor: "#e94560",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.dark,
                textAlign: "center",
                textDecorationLine: "underline",
                marginBottom: 20,
                letterSpacing: 0.5,
              }}
            >
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS
            </Text>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: colors.text,
                textDecorationLine: "underline",
                marginBottom: 14,
              }}
            >
              IDENTIFICAÇÃO DAS PARTES CONTRATANTES
            </Text>

            <Text style={previewParagraph}>
              <Text style={previewBold}>CONTRATANTE: </Text>
              {fieldValue(form.cont_nome)}, {fieldValue(form.cont_nacionalidade)}
              , {fieldValue(form.cont_profissao)},{" "}
              {fieldValue(form.cont_estado_civil)}, C.P.F. nº{" "}
              {fieldValue(form.cont_cpf)}, residente na{" "}
              {fieldValue(form.cont_endereco)}, nº{" "}
              {fieldValue(form.cont_numero)}, bairro{" "}
              {fieldValue(form.cont_bairro)}, {fieldValue(form.cont_cidade)}/
              {fieldValue(form.cont_estado)}, CEP: {fieldValue(form.cont_cep)}.
            </Text>

            <Text style={previewParagraph}>
              <Text style={previewBold}>PRESTADOR: </Text>
              {fieldValue(form.prest_nome)},{" "}
              {fieldValue(form.prest_nacionalidade)},{" "}
              {fieldValue(form.prest_profissao)},{" "}
              {fieldValue(form.prest_estado_civil)}, C.P.F. nº{" "}
              {fieldValue(form.prest_cpf)}, residente na{" "}
              {fieldValue(form.prest_endereco)}, nº{" "}
              {fieldValue(form.prest_numero)}, bairro{" "}
              {fieldValue(form.prest_bairro)}, {fieldValue(form.prest_cidade)}/
              {fieldValue(form.prest_estado)}, CEP:{" "}
              {fieldValue(form.prest_cep)}.
            </Text>

            <Text style={previewParagraph}>
              As partes acima identificadas celebram o presente{" "}
              <Text style={previewBold}>
                Contrato de Prestação de Serviços
              </Text>
              , que se regerá pelas cláusulas seguintes:
            </Text>

            <Text style={previewClause}>
              Cláusula 1ª – DO OBJETO DO CONTRATO
            </Text>
            <Text style={previewParagraph}>
              O presente contrato tem por objeto a prestação de serviços de{" "}
              {fieldValue(form.tipo_servico)}, conforme especificado a seguir:
            </Text>
            <Text style={previewParagraph}>
              {fieldValue(form.especificacao_servico)}
            </Text>

            <Text style={previewClause}>
              Cláusula 2ª – DAS ATIVIDADES CONTRATADAS
            </Text>
            <Text style={previewParagraph}>
              As seguintes atividades deverão ser executadas pelo PRESTADOR:
            </Text>
            <Text style={previewParagraph}>
              {fieldValue(form.atividades_contratadas)}
            </Text>

            <Text style={previewClause}>
              Cláusula 3ª – DO MOTIVO DA CONTRATAÇÃO
            </Text>
            <Text style={previewParagraph}>
              {fieldValue(form.motivo_contratacao)}
            </Text>

            <Text style={previewClause}>Cláusula 4ª – DO PRAZO</Text>
            <Text style={previewParagraph}>
              O presente contrato vigorará pelo prazo de{" "}
              {fieldValue(form.prazo_meses)} meses, com início em{" "}
              {formatDatePtBR(form.data_inicio)} e término em{" "}
              {formatDatePtBR(form.data_termino)}.
            </Text>

            <Text style={previewClause}>
              Cláusula 5ª – DO LOCAL DE EXECUÇÃO
            </Text>
            <Text style={previewParagraph}>{localExecucaoTexto}</Text>

            <Text style={previewClause}>
              Cláusula 6ª – DA REMUNERAÇÃO E FORMA DE PAGAMENTO
            </Text>
            <Text style={previewParagraph}>
              Pela prestação dos serviços, a CONTRATANTE pagará ao PRESTADOR o
              valor mensal de R$ {fieldValue(form.valor_mensal)}, de forma{" "}
              {fieldValue(form.forma_pagamento)}, com vencimento no dia{" "}
              {fieldValue(form.dia_vencimento)} de cada mês.
            </Text>
            <Text style={previewParagraph}>
              § 1º. O não pagamento na data acordada sujeitará a CONTRATANTE ao
              pagamento de multa de R$ {fieldValue(form.multa_atraso)}, além de
              juros de 1% ao mês sobre o valor em atraso.
            </Text>

            <Text style={previewClause}>
              Cláusula 7ª – DAS DISPOSIÇÕES DE SEGURANÇA, HIGIENE E
              SALUBRIDADE
            </Text>
            <Text style={previewParagraph}>
              {fieldValue(form.disposicoes_seguranca)}
            </Text>
            <Text style={previewParagraph}>
              Parágrafo único. O PRESTADOR é o responsável pelo cumprimento das
              normas de segurança do trabalho aplicáveis à atividade prestada.
            </Text>

            <Text style={previewClause}>Cláusula 8ª – DA RESCISÃO</Text>
            <Text style={previewParagraph}>{rescisaoTexto}</Text>

            <Text style={previewClause}>
              Cláusula 9ª – DA RESPONSABILIDADE SUBSIDIÁRIA
            </Text>
            <Text style={previewParagraph}>{responsabilidadeTexto}</Text>

            <Text style={previewClause}>Cláusula 10ª – DO FORO</Text>
            <Text style={previewParagraph}>
              As partes elegem o foro da comarca de{" "}
              {fieldValue(form.assinatura_cidade)}/
              {fieldValue(form.assinatura_estado)} para dirimir quaisquer
              controvérsias oriundas do presente contrato.
            </Text>

            <View style={{ marginTop: 30, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#444", marginBottom: 30 }}>
                {fieldValue(form.assinatura_cidade)},{" "}
                {fieldValue(form.assinatura_estado)},{" "}
                {formatDatePtBR(form.data_assinatura)}.
              </Text>

              <View style={{ flexDirection: "row", gap: 30, width: "100%" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#333",
                      width: "100%",
                      marginBottom: 8,
                    }}
                  />
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: "#333" }}
                  >
                    CONTRATANTE
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#333",
                      width: "100%",
                      marginBottom: 8,
                    }}
                  />
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: "#333" }}
                  >
                    PRESTADOR
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* ── Modal: Selecionar Cliente (Contratante) ──────────────── */}
      <Modal
        visible={clientModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClientModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 20,
              height: "80%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.dark,
                marginBottom: 14,
              }}
            >
              Selecionar Cliente
            </Text>

            <InputField
              label="Buscar por nome, CPF ou telefone"
              value={search}
              onChangeText={setSearch}
            />

            {loadingClients ? (
              <Text style={{ padding: 16, color: colors.muted }}>
                Carregando clientes...
              </Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                {filteredClients.map((client) => {
                  const name =
                    client.nome ||
                    client.name ||
                    client.razao_social ||
                    `Cliente #${client.id}`;
                  const document = client.cpf || client.cnpj;

                  return (
                    <Pressable
                      key={String(client.id)}
                      onPress={() => {
                        applyClientToContratante(client);
                        setClientModalVisible(false);
                      }}
                      style={{
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eeeeee",
                      }}
                    >
                      <Text
                        style={{
                          color: colors.dark,
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        {name}
                      </Text>
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {document ? `CPF: ${document}` : `ID: ${client.id}`}
                        {client.telefone ? ` • ${client.telefone}` : ""}
                        {client.cidade
                          ? ` • ${client.cidade}/${client.estado ?? ""}`
                          : ""}
                      </Text>
                    </Pressable>
                  );
                })}

                {filteredClients.length === 0 && (
                  <Text
                    style={{
                      paddingVertical: 24,
                      color: colors.muted,
                      textAlign: "center",
                    }}
                  >
                    Nenhum cliente encontrado.
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={{ marginTop: 12 }}>
              <Button
                label="Fechar"
                variant="secondary"
                onPress={() => setClientModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

// ── Estilos da prévia (fora do componente) ──────────────────────────
const previewParagraph = {
  fontSize: 13,
  lineHeight: 22,
  color: "#444",
  textAlign: "justify" as const,
  marginBottom: 10,
};

const previewBold = {
  fontWeight: "700" as const,
};

const previewClause = {
  fontSize: 14,
  fontWeight: "700" as const,
  color: "#333",
  marginTop: 20,
  marginBottom: 10,
};