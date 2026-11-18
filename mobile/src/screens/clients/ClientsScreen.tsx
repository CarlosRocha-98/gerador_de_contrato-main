import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Page } from "@/components/Page";
import {
  Button,
  Card,
  EmptyState,
  InputField,
  SelectField,
  SectionTitle,
} from "@/components/ui";
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
} from "@/services/clients";
import type { Cliente } from "@/types/api";
import { colors, spacing } from "@/theme/colors";
import { formatDate } from "@/utils/format";

const initialForm = {
  nome: "",
  nacionalidade: "",
  profissao: "",
  estado_civil: "",
  cpf: "",
  rg: "",
  orgao_expedidor: "",
  telefone: "",
  email: "",
  rua: "",
  numero: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
};

const ESTADO_CIVIL_OPTIONS = [
  { value: "", label: "Selecione o estado civil" },
  { value: "Solteiro(a)", label: "Solteiro(a)" },
  { value: "Casado(a)", label: "Casado(a)" },
  { value: "Divorciado(a)", label: "Divorciado(a)" },
  { value: "Viúvo(a)", label: "Viúvo(a)" },
];

const UF_OPTIONS = [
  { value: "", label: "Selecione o estado (UF)" },
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapá" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceará" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espírito Santo" },
  { value: "GO", label: "GO - Goiás" },
  { value: "MA", label: "MA - Maranhão" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Pará" },
  { value: "PB", label: "PB - Paraíba" },
  { value: "PR", label: "PR - Paraná" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piauí" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondônia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - São Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
];

export function ClientsScreen() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listClients());
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.detail ||
          "Não foi possível carregar os clientes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const submit = async () => {
    if (saving) {
      return;
    }

    const wasEditing = editingId !== null;

    if (!form.nome.trim() || !form.cpf.trim()) {
      Alert.alert("Atenção", "Nome e CPF são obrigatórios.");
      return;
    }

    if (!form.estado_civil) {
      Alert.alert("Atenção", "Selecione o estado civil.");
      return;
    }

    if (!form.estado) {
      Alert.alert("Atenção", "Selecione o estado (UF).");
      return;
    }

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateClient(editingId, form);
      } else {
        await createClient(form);
      }
      reset();
      await load();
      Alert.alert(
        wasEditing ? "Cliente atualizado" : "Cliente salvo",
        wasEditing
          ? "Os dados do cliente foram atualizados."
          : "O cliente foi cadastrado com sucesso.",
      );
    } catch (error: any) {
      Alert.alert(
        "Erro ao salvar",
        getClientErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: Cliente) => {
    setEditingId(item.id);
    setForm({
      nome: item.nome || "",
      nacionalidade: item.nacionalidade || "",
      profissao: item.profissao || "",
      estado_civil: item.estado_civil || "",
      cpf: item.cpf || "",
      rg: item.rg || "",
      orgao_expedidor: item.orgao_expedidor || "",
      telefone: item.telefone || "",
      email: item.email || "",
      rua: item.rua || "",
      numero: item.numero || "",
      bairro: item.bairro || "",
      cep: item.cep || "",
      cidade: item.cidade || "",
      estado: item.estado || "",
    });
  };

  const remove = async (id: number) => {
    Alert.alert("Excluir cliente", "Deseja realmente excluir este cliente?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(id);
            await load();
          } catch (error: any) {
            Alert.alert(
              "Erro ao excluir",
              getClientErrorMessage(error, "excluir"),
            );
          }
        },
      },
    ]);
  };

  return (
    <Page
      title="Cadastro de Cliente"
      subtitle="Preencha os dados locador ou locatário."
    >
      <Card>
        <InputField
          label="Nome Completo/ Razão Social"
          value={form.nome}
          onChangeText={(text) => update("nome", text)}
        />
        <InputField
          label="Nacionalidade"
          value={form.nacionalidade}
          onChangeText={(text) => update("nacionalidade", text)}
        />
        <InputField
          label="Profissão"
          value={form.profissao}
          onChangeText={(text) => update("profissao", text)}
        />
        <SelectField
          label="Estado Civil"
          value={form.estado_civil}
          placeholder="Selecione o estado civil"
          options={ESTADO_CIVIL_OPTIONS}
          onValueChange={(value) => update("estado_civil", value)}
        />
        <InputField
          label="CPF"
          value={form.cpf}
          onChangeText={(text) => update("cpf", text)}
          keyboardType="numeric"
        />
        <InputField
          label="RG"
          value={form.rg}
          onChangeText={(text) => update("rg", text)}
        />
        <InputField
          label="Órgão Expedidor"
          value={form.orgao_expedidor}
          onChangeText={(text) => update("orgao_expedidor", text)}
        />
        <InputField
          label="Telefone"
          value={form.telefone}
          onChangeText={(text) => update("telefone", text)}
          keyboardType="phone-pad"
        />
        <InputField
          label="E-mail"
          value={form.email}
          onChangeText={(text) => update("email", text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <InputField
          label="Rua"
          value={form.rua}
          onChangeText={(text) => update("rua", text)}
        />
        <InputField
          label="Número"
          value={form.numero}
          onChangeText={(text) => update("numero", text)}
        />
        <InputField
          label="Bairro"
          value={form.bairro}
          onChangeText={(text) => update("bairro", text)}
        />
        <InputField
          label="CEP"
          value={form.cep}
          onChangeText={(text) => update("cep", text)}
          keyboardType="numeric"
        />
        <InputField
          label="Cidade"
          value={form.cidade}
          onChangeText={(text) => update("cidade", text)}
        />
        <SelectField
          label="Estado (UF)"
          value={form.estado}
          placeholder="Selecione o estado (UF)"
          options={UF_OPTIONS}
          onValueChange={(value) => update("estado", value)}
        />
        <View style={styles.row}>
          <Button
            label={editingId ? "Atualizar" : "Salvar"}
            onPress={submit}
            loading={saving}
            style={styles.flex}
          />
          {editingId !== null ? (
            <Button
              label="Cancelar"
              onPress={reset}
              variant="secondary"
              style={styles.flex}
            />
          ) : null}
        </View>
      </Card>
      <Card>
        <SectionTitle title="Clientes cadastrados" />
        {loading ? (
          <EmptyState title="Carregando clientes..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum cliente cadastrado"
            subtitle="Os clientes salvos aparecerão aqui."
          />
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              <Text style={styles.itemMeta}>CPF: {item.cpf}</Text>
              {item.telefone ? (
                <Text style={styles.itemMeta}>Telefone: {item.telefone}</Text>
              ) : null}
              {item.email ? (
                <Text style={styles.itemMeta}>E-mail: {item.email}</Text>
              ) : null}
              <Text style={styles.itemMeta}>
                Criado em: {formatDate(item.criado_em)}
              </Text>
              <View style={styles.row}>
                <Button
                  label="Editar"
                  onPress={() => startEdit(item)}
                  variant="secondary"
                  style={styles.flex}
                />
                <Button
                  label="Excluir"
                  onPress={() => remove(item.id)}
                  variant="secondary"
                  style={styles.flex}
                />
              </View>
            </View>
          ))
        )}
      </Card>
    </Page>
  );
}

function getClientErrorMessage(error: any, action = "salvar") {
  const data = error?.response?.data;
  if (!data) {
    return `Não foi possível ${action} o cliente. Verifique a conexão com o backend e tente novamente.`;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  const fieldLabels: Record<string, string> = {
    nome: "Nome",
    cpf: "CPF",
    email: "E-mail",
    estado_civil: "Estado civil",
    estado: "Estado (UF)",
  };
  const messages = Object.entries(data)
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value[0] : value;
      return typeof message === "string"
        ? `${fieldLabels[field] || field}: ${message}`
        : null;
    })
    .filter(Boolean);

  return messages.length > 0
    ? messages.join("\n")
    : `Não foi possível ${action} o cliente.`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  item: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  itemMeta: {
    color: colors.muted,
  },
});
