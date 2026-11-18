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
  createProperty,
  deleteProperty,
  listProperties,
  updateProperty,
} from "@/services/properties";
import type { Imovel } from "@/types/api";
import { formatDate } from "@/utils/format";


const COLORS = {
  background: "#161E2E",
  card: "#1D293B",
  input: "#374151",
  inputBorder: "#4B5563",
  coral: "#EE4D61",
  white: "#FFFFFF",
  text: "#D1D5DB",
  muted: "#9CA3AF",
  border: "#334155",
  danger: "#F87171",
};

const initialForm = {
  endereco: "",
  numero: "",
  bairro: "",
  cidade_uf: "",
  tipo: "",
  caracteristicas: "",
};

const TIPO_OPTIONS = [
  { value: "Apartamento", label: "Apartamento" },
  { value: "Casa", label: "Casa" },
  { value: "Comercial", label: "Comercial" },
];

export function PropertiesScreen() {
  const [items, setItems] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      setItems(await listProperties());
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.detail ||
          "Não foi possível carregar os imóveis.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setDropdownOpen(false);
  };

  const submit = async () => {
    if (saving) {
      return;
    }

    const wasEditing = editingId !== null;

    if (!form.endereco.trim() || !form.numero.trim() || !form.cidade_uf.trim()) {
      Alert.alert("Atenção", "Endereço, número e cidade/UF são obrigatórios.");
      return;
    }

    if (!form.bairro.trim() || !form.tipo) {
      Alert.alert("Atenção", "Bairro e tipo do imóvel são obrigatórios.");
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateProperty(editingId, form);
      } else {
        await createProperty(form);
      }

      reset();
      await load();
      Alert.alert(
        wasEditing ? "Imóvel atualizado" : "Imóvel salvo",
        wasEditing
          ? "Os dados do imóvel foram atualizados."
          : "O imóvel foi cadastrado com sucesso.",
      );
    } catch (error: any) {
      Alert.alert(
        "Erro ao salvar",
        getPropertyErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: Imovel) => {
    setEditingId(item.id);
    setForm({
      endereco: item.endereco || "",
      numero: item.numero || "",
      bairro: item.bairro || "",
      cidade_uf: item.cidade_uf || "",
      tipo: item.tipo || "",
      caracteristicas: item.caracteristicas || "",
    });
    setDropdownOpen(false);
  };

  const remove = (id: number) => {
    Alert.alert("Excluir imóvel", "Deseja realmente excluir este imóvel?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(id);
            await load();
          } catch (error: any) {
            Alert.alert(
              "Erro ao excluir",
              getPropertyErrorMessage(error, "excluir"),
            );
          }
        },
      },
    ]);
  };

  return (
    <Page
      title="Registrar Imóvel"
      subtitle="Preencha os dados do imóvel para o contrato."
    >
      <Card>
        <SectionTitle title={editingId ? "Editar imóvel" : "DADOS DO IMÓVEL"} />
        <InputField
          label="Endereço do imóvel(rua/av)"
          value={form.endereco}
          onChangeText={(text) => update("endereco", text)}
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
          label="Cidade/UF"
          value={form.cidade_uf}
          onChangeText={(text) => update("cidade_uf", text)}
        />
        <SelectField
          label="Tipo"
          value={form.tipo}
          placeholder="Selecione o tipo..."
          options={TIPO_OPTIONS}
          onValueChange={(value) => update("tipo", value)}
        />
        <InputField
          label="Características"
          value={form.caracteristicas}
          onChangeText={(text) => update("caracteristicas", text)}
          helperText="Ex.: Apartamento com 2 quartos, 1 banheiro, sala, cozinha..."
          multiline
          numberOfLines={4}
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
        <SectionTitle title="Imóveis cadastrados" />
        {loading ? (
          <EmptyState title="Carregando imóveis..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum imóvel cadastrado"
            subtitle="Os imóveis salvos aparecerão aqui."
          />
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemTitle}>{item.endereco}</Text>
              <Text style={styles.itemMeta}>
                {item.numero} - {item.bairro}
              </Text>
              <Text style={styles.itemMeta}>{item.cidade_uf}</Text>
              {item.tipo ? (
                <Text style={styles.itemMeta}>Tipo: {item.tipo}</Text>
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

function getPropertyErrorMessage(error: any, action = "salvar") {
  const data = error?.response?.data;
  if (!data) {
    return `Não foi possível ${action} o imóvel. Verifique a conexão com o backend e tente novamente.`;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  const fieldLabels: Record<string, string> = {
    endereco: "Endereço",
    numero: "Número",
    bairro: "Bairro",
    cidade_uf: "Cidade/UF",
    tipo: "Tipo",
    caracteristicas: "Características",
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
    : `Não foi possível ${action} o imóvel.`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 17,
  },
  backText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: COLORS.white,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 18,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 23,
  },
  sectionBar: {
    width: 3,
    height: 19,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
  },
  sectionTitle: {
    color: COLORS.coral,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  field: {
    flex: 1,
    marginBottom: 18,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    minHeight: 49,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
  },
  textArea: {
    minHeight: 112,
    paddingTop: 13,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
    minWidth: 0,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 4,
  },
  itemTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  itemMeta: {
    color: COLORS.muted,
  },
  select: {
    minHeight: 49,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectActive: {
    borderColor: COLORS.coral,
    borderWidth: 1.5,
  },
  selectText: {
    color: COLORS.white,
    fontSize: 14,
  },
  placeholder: {
    color: COLORS.muted,
  },
  chevron: {
    color: COLORS.text,
    fontSize: 21,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: COLORS.input,
    borderColor: COLORS.coral,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  option: {
    minHeight: 45,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
});
