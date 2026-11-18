import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Page } from "@/components/Page";
import { Button, Card, InputField, SectionTitle } from "@/components/ui";
import { createRentalContract } from "@/services/contracts";
import {
  buildContractPdfHtml,
  downloadContractPdf,
} from "@/services/contractPdf";
import { listClients } from "@/services/clients";
import { listProperties } from "@/services/properties";
import { useAuth } from "@/context/AuthContext";
import { colors as themeColors } from "@/theme/colors";

type RecordItem = {
  id: number | string;
  nome?: string;
  name?: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade_uf?: string;
  cidadeUf?: string;
  cidade?: string;
  estado?: string;
  nacionalidade?: string;
  profissao?: string;
  estado_civil?: string;
  telefone?: string;
  email?: string;
  caracteristicas?: string;
  tipo?: string;
};

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidISODate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  return (
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() + 1 === Number(match[2]) &&
    date.getUTCDate() === Number(match[3])
  );
};

const initialForm = {
  inquilino: "",
  imovel: "",
  prazo_meses: "",
  valor_aluguel: "",
  dia_vencimento: "",
  valor_caucao: "",
  multa_infracao: "",
  multa_rescisao: "",
  cidade_assinatura: "",
  estado_assinatura: "",
  data_inicio: getToday(),
  data_assinatura: getToday(),
  sem_caucao: false,
  sem_multa_infracao: false,
  sem_multa_rescisao: false,
};

type FormState = typeof initialForm;

const parseMoney = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "");

  if (!normalized) return 0;

  // Aceita, por exemplo, 1500,00 ou 1.500,00.
  const normalizedNumber = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;

  return Number(normalizedNumber);
};

const formatMoney = (value: string | number) => {
  const number = typeof value === "number" ? value : parseMoney(value);

  if (!Number.isFinite(number)) return "R$ 0,00";

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatDate = (value: string) => {
  if (!value) return "Não informada";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return value;
};

const formatDatePtBR = (dateStr: string) => {
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
};

export function RentalForm() {
  const navigation = useNavigation();
  const auth = useAuth();

  const [form, setForm] = useState<FormState>({ ...initialForm });
  const [clients, setClients] = useState<RecordItem[]>([]);
  const [properties, setProperties] = useState<RecordItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [clientListVisible, setClientListVisible] = useState(false);
  const [propertyListVisible, setPropertyListVisible] = useState(false);

  const selectedClient = clients.find(
    (item) => String(item.id) === form.inquilino,
  );

  const selectedProperty = properties.find(
    (item) => String(item.id) === form.imovel,
  );

  const locador: any = auth.profile;

  const loadData = async (showSuccess = false) => {
    setLoading(true);

    try {
      const [clientData, propertyData] = await Promise.all([
        listClients(),
        listProperties(),
      ]);

      setClients(clientData);
      setProperties(propertyData);
      if (showSuccess) {
        Alert.alert(
          "Cadastros atualizados",
          "A lista de clientes e imóveis foi atualizada.",
        );
      }
    } catch (error: any) {
      Alert.alert("Erro", getCadastroErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setValue = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const formatAddress = (item: RecordItem) =>
    [
      item.endereco || item.rua,
      item.numero ? `nº ${item.numero}` : "",
      item.bairro,
      item.cidade_uf || item.cidadeUf ||
        [item.cidade, item.estado].filter(Boolean).join("/"),
    ]
      .filter(Boolean)
      .join(", ");

  const validateForm = () => {
    const requiredFields: [keyof FormState, string][] = [
      ["inquilino", "Selecione o inquilino."],
      ["imovel", "Selecione o imóvel."],
      ["prazo_meses", "Informe o prazo do contrato."],
      ["valor_aluguel", "Informe o valor do aluguel."],
      ["dia_vencimento", "Informe o dia de vencimento."],
      ["data_inicio", "Informe a data de início."],
      ["data_assinatura", "Informe a data de assinatura."],
      ["cidade_assinatura", "Informe a cidade da assinatura."],
      ["estado_assinatura", "Informe o estado da assinatura."],
    ];

    const missing = requiredFields.find(
      ([key]) => !String(form[key]).trim(),
    );

    if (missing) {
      Alert.alert("Atenção", missing[1]);
      return false;
    }

    if (!selectedClient) {
      Alert.alert("Atenção", "O inquilino selecionado não foi encontrado.");
      return false;
    }

    if (!selectedProperty) {
      Alert.alert("Atenção", "O imóvel selecionado não foi encontrado.");
      return false;
    }

    const prazo = Number(form.prazo_meses);
    const vencimento = Number(form.dia_vencimento);
    const aluguel = parseMoney(form.valor_aluguel);

    if (!Number.isInteger(prazo) || prazo <= 0) {
      Alert.alert("Atenção", "Informe um prazo válido em meses.");
      return false;
    }

    if (
      !Number.isInteger(vencimento) ||
      vencimento < 1 ||
      vencimento > 31
    ) {
      Alert.alert("Atenção", "O vencimento deve estar entre 1 e 31.");
      return false;
    }

    if (!Number.isFinite(aluguel) || aluguel <= 0) {
      Alert.alert("Atenção", "Informe um valor de aluguel válido.");
      return false;
    }

    const optionalAmounts: Array<[string, string, boolean]> = [
      ["valor_caucao", "caução", form.sem_caucao],
      ["multa_infracao", "multa por infração", form.sem_multa_infracao],
      ["multa_rescisao", "multa por rescisão", form.sem_multa_rescisao],
    ];

    for (const [key, label, isExempt] of optionalAmounts) {
      const value = form[key as keyof FormState];
      if (!isExempt && value && typeof value === "string") {
        const amount = parseMoney(value);
        if (!Number.isFinite(amount) || amount < 0) {
          Alert.alert("Atenção", `Informe um valor de ${label} válido.`);
          return false;
        }
      }
    }

    if (!isValidISODate(form.data_inicio)) {
      Alert.alert(
        "Atenção",
        "Informe uma data de início válida no formato AAAA-MM-DD.",
      );
      return false;
    }

    if (!isValidISODate(form.data_assinatura)) {
      Alert.alert(
        "Atenção",
        "Informe uma data de assinatura válida no formato AAAA-MM-DD.",
      );
      return false;
    }

    if (form.estado_assinatura.trim().length !== 2) {
      Alert.alert(
        "Atenção",
        "Informe a sigla do estado com duas letras, por exemplo SP.",
      );
      return false;
    }

    if (saving) {
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (saving || !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await createRentalContract({
        prazo_meses: Number(form.prazo_meses),
        dia_vencimento: Number(form.dia_vencimento),
        valor_aluguel: parseMoney(form.valor_aluguel),
        valor_caucao: form.sem_caucao
          ? 0
          : parseMoney(form.valor_caucao),
        multa_infracao: form.sem_multa_infracao
          ? 0
          : parseMoney(form.multa_infracao),
        multa_rescisao: form.sem_multa_rescisao
          ? 0
          : parseMoney(form.multa_rescisao),
        inquilino: Number(form.inquilino),
        imovel: Number(form.imovel),
        cidade_assinatura: form.cidade_assinatura.trim(),
        estado_assinatura: form.estado_assinatura.trim().toUpperCase(),
        data_inicio: form.data_inicio,
        data_assinatura: form.data_assinatura,
        sem_caucao: form.sem_caucao,
        sem_multa_infracao: form.sem_multa_infracao,
        sem_multa_rescisao: form.sem_multa_rescisao,
      });

      Alert.alert("Sucesso", "Contrato de aluguel salvo.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const data = error?.response?.data;
      const message =
        data?.detail ||
        (data && typeof data === "object"
          ? Object.entries(data)
              .map(([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
              )
              .join("\n")
          : null) ||
        (!error?.response
          ? "Não foi possível conectar ao backend. Verifique a conexão e tente novamente."
          : "Não foi possível salvar o contrato de aluguel.");

      Alert.alert("Erro ao salvar", message);
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (pdfSaving || !validateForm()) {
      return;
    }

    const clientName =
      selectedClient?.nome || selectedClient?.name || "Não informado";
    const propertyAddress = selectedProperty
      ? formatAddress(selectedProperty) || "Endereço não informado"
      : "Endereço não informado";

    setPdfSaving(true);
    try {
      const html = buildContractPdfHtml({
        title: "CONTRATO DE LOCAÇÃO",
        sections: [
          {
            heading: "IDENTIFICAÇÃO DAS PARTES",
            paragraphs: [
              `LOCADOR: ${locadorTexto()}`,
              `LOCATÁRIO: ${clientName}${
                selectedClient?.cpf ? `, CPF ${selectedClient.cpf}` : ""
              }.${
                selectedClient?.nacionalidade
                  ? ` Nacionalidade: ${selectedClient.nacionalidade}.`
                  : ""
              }${
                selectedClient?.profissao
                  ? ` Profissão: ${selectedClient.profissao}.`
                  : ""
              }${
                selectedClient?.estado_civil
                  ? ` Estado civil: ${selectedClient.estado_civil}.`
                  : ""
              }`,
            ],
          },
          {
            heading: "1. DO IMÓVEL",
            paragraphs: [
              `O imóvel objeto desta locação está situado em ${propertyAddress}.${
                selectedProperty?.tipo ? ` Tipo: ${selectedProperty.tipo}.` : ""
              }${
                selectedProperty?.caracteristicas
                  ? ` Características: ${selectedProperty.caracteristicas}.`
                  : ""
              }`,
            ],
          },
          {
            heading: "2. DO PRAZO",
            paragraphs: [
              `O prazo previsto para a locação é de ${form.prazo_meses} meses, com início em ${formatDatePtBR(form.data_inicio)}.`,
            ],
          },
          {
            heading: "3. DO ALUGUEL E VENCIMENTO",
            paragraphs: [
              `O aluguel mensal é de ${formatMoney(form.valor_aluguel)}, com vencimento no dia ${form.dia_vencimento} de cada mês.`,
            ],
          },
          {
            heading: "4. DA CAUÇÃO",
            paragraphs: [
              form.sem_caucao
                ? "As partes indicam que não haverá cobrança de caução."
                : `O valor da caução informado é de ${formatMoney(form.valor_caucao)}.`,
            ],
          },
          {
            heading: "5. DAS MULTAS",
            paragraphs: [
              `Multa por infração: ${
                form.sem_multa_infracao
                  ? "isenta"
                  : formatMoney(form.multa_infracao)
              }.\nMulta por rescisão: ${
                form.sem_multa_rescisao
                  ? "isenta"
                  : formatMoney(form.multa_rescisao)
              }.`,
            ],
          },
          {
            heading: "6. DO LOCAL E DATA",
            paragraphs: [
              `${form.cidade_assinatura}, ${form.estado_assinatura.toUpperCase()}, ${formatDatePtBR(form.data_assinatura)}.`,
            ],
          },
        ],
        signatureDate: `${form.cidade_assinatura}, ${form.estado_assinatura.toUpperCase()}, ${formatDatePtBR(form.data_assinatura)}.`,
        signers: [locador?.nome || "LOCADOR", clientName],
      });
      await downloadContractPdf(html, "Contrato_de_Locacao");
    } catch (error: any) {
      Alert.alert(
        "Erro ao gerar PDF",
        error?.message || "Não foi possível gerar o PDF do contrato.",
      );
    } finally {
      setPdfSaving(false);
    }
  };

  const renderSwitch = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#E94560" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const fieldValue = (value: any) =>
    value && String(value).trim() ? String(value) : "______________";

  const locadorTexto = () => {
    if (!locador?.nome) {
      return "Os dados do LOCADOR não estão disponíveis no seu perfil.";
    }
    const partes: string[] = [];
    partes.push(fieldValue(locador.nome));
    if (locador.nacionalidade) partes.push(fieldValue(locador.nacionalidade));
    if (locador.profissao) partes.push(fieldValue(locador.profissao));
    if (locador.estado_civil) partes.push(fieldValue(locador.estado_civil));
    if (locador.cpf) partes.push(`C.P.F. nº ${fieldValue(locador.cpf)}`);

    let endereco = "";
    if (locador.rua) endereco += `residente na ${fieldValue(locador.rua)}`;
    if (locador.numero) endereco += `, nº ${fieldValue(locador.numero)}`;
    if (locador.bairro) endereco += `, bairro ${fieldValue(locador.bairro)}`;
    if (locador.cidade || locador.estado) {
      endereco += `, ${fieldValue(locador.cidade)}/${fieldValue(locador.estado)}`;
    }
    if (locador.cep) endereco += `, CEP: ${fieldValue(locador.cep)}`;

    return `${partes.join(", ")}${endereco ? ", " + endereco : ""}.`;
  };

  const renderPreview = () => {
    if (!selectedClient || !selectedProperty) {
      return (
        <Text style={styles.helper}>
          Selecione um inquilino e um imóvel para visualizar o resumo do
          contrato.
        </Text>
      );
    }

    const clientName =
      selectedClient.nome || selectedClient.name || "Não informado";

    const propertyAddress =
      formatAddress(selectedProperty) || "Endereço não informado";

    return (
      <View style={styles.paper}>
        <Text style={styles.documentTitle}>CONTRATO DE LOCAÇÃO</Text>

        <Text style={styles.documentParagraph}>
          <Text style={styles.documentBold}>LOCADOR: </Text>
          {locadorTexto()}
        </Text>

        <Text style={styles.documentParagraph}>
          <Text style={styles.documentBold}>LOCATÁRIO: </Text>
          {clientName}
          {selectedClient.cpf ? `, CPF ${selectedClient.cpf}` : ""}.
          {selectedClient.nacionalidade
            ? ` Nacionalidade: ${selectedClient.nacionalidade}.`
            : ""}
          {selectedClient.profissao
            ? ` Profissão: ${selectedClient.profissao}.`
            : ""}
          {selectedClient.estado_civil
            ? ` Estado civil: ${selectedClient.estado_civil}.`
            : ""}
        </Text>

        <Text style={styles.documentSection}>1. DO IMÓVEL</Text>
        <Text style={styles.documentParagraph}>
          O imóvel objeto desta locação está situado em {propertyAddress}.
          {selectedProperty.tipo
            ? ` Tipo: ${selectedProperty.tipo}.`
            : ""}
          {selectedProperty.caracteristicas
            ? ` Características: ${selectedProperty.caracteristicas}.`
            : ""}
        </Text>

        <Text style={styles.documentSection}>2. DO PRAZO</Text>
        <Text style={styles.documentParagraph}>
          O prazo previsto para a locação é de {form.prazo_meses || "___"}{" "}
          meses, com início em {formatDatePtBR(form.data_inicio)}.
        </Text>

        <Text style={styles.documentSection}>3. DO ALUGUEL E VENCIMENTO</Text>
        <Text style={styles.documentParagraph}>
          O aluguel mensal é de {formatMoney(form.valor_aluguel)}, com
          vencimento no dia {form.dia_vencimento || "___"} de cada mês.
        </Text>

        <Text style={styles.documentSection}>4. DA CAUÇÃO</Text>
        <Text style={styles.documentParagraph}>
          {form.sem_caucao
            ? "As partes indicam que não haverá cobrança de caução."
            : `O valor da caução informado é de ${formatMoney(
                form.valor_caucao,
              )}.`}
        </Text>

        <Text style={styles.documentSection}>5. DAS MULTAS</Text>
        <Text style={styles.documentParagraph}>
          Multa por infração:{" "}
          {form.sem_multa_infracao
            ? "isenta"
            : formatMoney(form.multa_infracao)}.
          {"\n"}
          Multa por rescisão:{" "}
          {form.sem_multa_rescisao
            ? "isenta"
            : formatMoney(form.multa_rescisao)}.
        </Text>

        <Text style={styles.documentSection}>6. DO LOCAL E DATA</Text>
        <Text style={styles.documentParagraph}>
          {form.cidade_assinatura || "Cidade"}, {form.estado_assinatura || "UF"},
          {" "}{formatDatePtBR(form.data_assinatura)}.
        </Text>

        <View style={styles.signatureArea}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureName}>
              {locador?.nome || "LOCADOR"}
            </Text>
            <Text style={styles.signatureHint}>LOCADOR — Assinatura</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureName}>{clientName}</Text>
            <Text style={styles.signatureHint}>LOCATÁRIO — Assinatura</Text>
          </View>
        </View>

        <Text style={styles.previewDisclaimer}>
          Esta é uma pré-visualização resumida dos dados preenchidos, não o
          documento jurídico completo. Confira as cláusulas e os dados antes
          de formalizar a locação.
        </Text>
      </View>
    );
  };

  return (
    <Page
      title="Contrato de aluguel"
      subtitle="Preencha as informações da locação residencial ou comercial."
    >
      <Card>
        <SectionTitle
          title="Partes e imóvel"
          subtitle="Selecione os cadastros que farão parte do contrato."
        />

        <Text style={styles.label}>Inquilino *</Text>
        <Button
          label={
            selectedClient
              ? selectedClient.nome ||
                selectedClient.name ||
                "Cliente selecionado"
              : "Selecionar cliente"
          }
          variant="secondary"
          onPress={() => setClientListVisible(!clientListVisible)}
        />

        {clientListVisible && (
          <View style={styles.selectionList}>
            {loading ? (
              <Text style={styles.helper}>Carregando clientes...</Text>
            ) : clients.length === 0 ? (
              <Text style={styles.helper}>Nenhum cliente cadastrado.</Text>
            ) : (
              clients.map((client) => (
                <Pressable
                  key={String(client.id)}
                  style={[
                    styles.selectionItem,
                    form.inquilino === String(client.id) &&
                      styles.selectionItemSelected,
                  ]}
                  onPress={() => {
                    setValue("inquilino", String(client.id));
                    setClientListVisible(false);
                  }}
                >
                  <Text style={styles.itemTitle}>
                    {client.nome || client.name || "Cliente sem nome"}
                  </Text>
                  {!!client.cpf && (
                    <Text style={styles.helper}>CPF: {client.cpf}</Text>
                  )}
                </Pressable>
              ))
            )}
          </View>
        )}

        {selectedClient && (
          <View style={styles.details}>
            <Text style={styles.detailText}>
              Nacionalidade: {selectedClient.nacionalidade || "Não informada"}
            </Text>
            <Text style={styles.detailText}>
              Profissão: {selectedClient.profissao || "Não informada"}
            </Text>
            <Text style={styles.detailText}>
              Estado civil: {selectedClient.estado_civil || "Não informado"}
            </Text>
            <Text style={styles.detailText}>
              Endereço: {formatAddress(selectedClient) || "Não informado"}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Imóvel *</Text>
        <Button
          label={
            selectedProperty
              ? formatAddress(selectedProperty) || "Imóvel selecionado"
              : "Selecionar imóvel"
          }
          variant="secondary"
          onPress={() => setPropertyListVisible(!propertyListVisible)}
        />

        {propertyListVisible && (
          <View style={styles.selectionList}>
            {loading ? (
              <Text style={styles.helper}>Carregando imóveis...</Text>
            ) : properties.length === 0 ? (
              <Text style={styles.helper}>Nenhum imóvel cadastrado.</Text>
            ) : (
              properties.map((property) => (
                <Pressable
                  key={String(property.id)}
                  style={[
                    styles.selectionItem,
                    form.imovel === String(property.id) &&
                      styles.selectionItemSelected,
                  ]}
                  onPress={() => {
                    setValue("imovel", String(property.id));
                    setPropertyListVisible(false);
                  }}
                >
                  <Text style={styles.itemTitle}>
                    {formatAddress(property) || "Imóvel sem endereço"}
                  </Text>
                  {!!property.tipo && (
                    <Text style={styles.helper}>Tipo: {property.tipo}</Text>
                  )}
                  {!!property.caracteristicas && (
                    <Text style={styles.helper}>
                      {property.caracteristicas}
                    </Text>
                  )}
                </Pressable>
              ))
            )}
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.detailText}>
            Endereço:{" "}
            {selectedProperty
              ? formatAddress(selectedProperty)
              : "Selecione um imóvel"}
          </Text>
          {!!selectedProperty?.caracteristicas && (
            <Text style={styles.detailText}>
              Características: {selectedProperty.caracteristicas}
            </Text>
          )}
        </View>

        <Button
          label="Atualizar cadastros"
          variant="secondary"
          onPress={() => void loadData(true)}
          loading={loading}
        />
      </Card>

      <Card>
        <SectionTitle
          title="Condições do contrato"
          subtitle="Defina o prazo, valores e penalidades."
        />

        <InputField
          label="Prazo em meses *"
          value={form.prazo_meses}
          onChangeText={(text) => setValue("prazo_meses", text)}
          keyboardType="numeric"
        />

        <InputField
          label="Data de início *"
          value={form.data_inicio}
          onChangeText={(text) => setValue("data_inicio", text)}
          placeholder="AAAA-MM-DD"
        />

        <InputField
          label="Valor mensal do aluguel *"
          value={form.valor_aluguel}
          onChangeText={(text) => setValue("valor_aluguel", text)}
          keyboardType="decimal-pad"
          placeholder="Ex.: 1500,00"
        />

        <InputField
          label="Dia de vencimento *"
          value={form.dia_vencimento}
          onChangeText={(text) => setValue("dia_vencimento", text)}
          keyboardType="numeric"
          placeholder="De 1 a 31"
        />

        {renderSwitch("Sem caução", form.sem_caucao, (value) => {
          setValue("sem_caucao", value);
          if (value) setValue("valor_caucao", "");
        })}

        <InputField
          label="Valor da caução"
          value={form.valor_caucao}
          onChangeText={(text) => setValue("valor_caucao", text)}
          keyboardType="decimal-pad"
          editable={!form.sem_caucao}
          placeholder={form.sem_caucao ? "Isento" : "Ex.: 1500,00"}
        />

        {renderSwitch(
          "Sem multa por infração",
          form.sem_multa_infracao,
          (value) => {
            setValue("sem_multa_infracao", value);
            if (value) setValue("multa_infracao", "");
          },
        )}

        <InputField
          label="Multa por infração"
          value={form.multa_infracao}
          onChangeText={(text) => setValue("multa_infracao", text)}
          keyboardType="decimal-pad"
          editable={!form.sem_multa_infracao}
          placeholder={form.sem_multa_infracao ? "Isento" : "Valor da multa"}
        />

        {renderSwitch(
          "Sem multa por rescisão",
          form.sem_multa_rescisao,
          (value) => {
            setValue("sem_multa_rescisao", value);
            if (value) setValue("multa_rescisao", "");
          },
        )}

        <InputField
          label="Multa por rescisão"
          value={form.multa_rescisao}
          onChangeText={(text) => setValue("multa_rescisao", text)}
          keyboardType="decimal-pad"
          editable={!form.sem_multa_rescisao}
          placeholder={form.sem_multa_rescisao ? "Isento" : "Valor da multa"}
        />
      </Card>

      <Card>
        <SectionTitle
          title="Assinatura"
          subtitle="Informe o local e a data de assinatura."
        />

        <InputField
          label="Cidade da assinatura *"
          value={form.cidade_assinatura}
          onChangeText={(text) => setValue("cidade_assinatura", text)}
        />

        <InputField
          label="Estado da assinatura *"
          value={form.estado_assinatura}
          onChangeText={(text) =>
            setValue("estado_assinatura", text.toUpperCase())
          }
          maxLength={2}
          autoCapitalize="characters"
          placeholder="Ex.: SP"
        />

        <InputField
          label="Data de assinatura *"
          value={form.data_assinatura}
          onChangeText={(text) => setValue("data_assinatura", text)}
          placeholder="AAAA-MM-DD"
        />

        <Button
          label={previewVisible ? "Ocultar pré-visualização" : "Pré-visualizar contrato"}
          variant="secondary"
          onPress={() => {
            if (validateForm()) setPreviewVisible(!previewVisible);
          }}
        />
      </Card>

      {previewVisible && (
        <Card>
          <SectionTitle
            title="Pré-visualização"
            subtitle="Confira os dados antes de salvar."
          />
          {renderPreview()}
        </Card>
      )}

      <Card>
        <Button
          label="Baixar contrato em PDF"
          variant="secondary"
          onPress={downloadPdf}
          loading={pdfSaving}
          style={{ marginBottom: 10 }}
        />
        <Button
          label="Salvar contrato"
          onPress={submit}
          loading={saving}
        />

        <View style={styles.backButton}>
          <Button
            label="Voltar"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </Card>
    </Page>
  );
}

function getCadastroErrorMessage(error: any) {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (!error?.response) {
    return "Não foi possível conectar ao backend. Verifique se ele está ativo e tente novamente.";
  }

  return "Não foi possível atualizar os clientes e imóveis. Tente novamente.";
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: themeColors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  selectionList: {
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },
  selectionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  selectionItemSelected: {
    backgroundColor: "#FDF0F2",
    borderLeftWidth: 3,
    borderLeftColor: "#E94560",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  helper: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  details: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 5,
  },
  switchRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: themeColors.text,
  },

  // ── "Folha de papel" — prévia do contrato com fundo branco ──────
  paper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginTop: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#E94560",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a2332",
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  documentSection: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    marginTop: 20,
    marginBottom: 10,
  },
  documentParagraph: {
    fontSize: 13,
    lineHeight: 22,
    color: "#444444",
    marginBottom: 10,
    textAlign: "justify",
  },
  documentBold: {
    fontWeight: "700",
    color: "#333333",
  },
  signatureArea: {
    marginTop: 32,
    gap: 32,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#333333",
    paddingTop: 8,
    alignItems: "center",
  },
  signatureName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  signatureHint: {
    fontSize: 11,
    color: "#666666",
    marginTop: 4,
  },
  previewDisclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: "#92400E",
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  backButton: {
    marginTop: 10,
  },
});