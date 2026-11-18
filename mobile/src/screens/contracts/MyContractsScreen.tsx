import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Button, Card } from "@/components/ui";
import {
  deleteRentalContract,
  deleteServiceContract,
  listRentalContracts,
  listServiceContracts,
} from "@/services/contracts";
import {
  buildRentalContractPdfHtml,
  buildServiceContractPdfHtml,
  downloadContractPdf,
} from "@/services/contractPdf";
import type {
  ContractSummary,
  ContratoAluguel,
  ContratoServico,
} from "@/types/api";
import { colors, radius, spacing } from "@/theme/colors";
import { formatCurrency, formatDate } from "@/utils/format";

export function MyContractsScreen() {
  const [rentalContracts, setRentalContracts] = useState<ContratoAluguel[]>([]);
  const [serviceContracts, setServiceContracts] = useState<ContratoServico[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        try {
          const [rentals, services] = await Promise.all([
            listRentalContracts(),
            listServiceContracts(),
          ]);
          if (active) {
            setRentalContracts(rentals);
            setServiceContracts(services);
          }
        } catch (error: any) {
          Alert.alert(
            "Erro",
            error?.response?.data?.detail ||
              "Não foi possível carregar os contratos.",
          );
        } finally {
          if (active) setLoading(false);
        }
      };

      void load();
      return () => {
        active = false;
      };
    }, []),
  );

  const summaries = useMemo<ContractSummary[]>(() => {
    const rental = rentalContracts.map((item) => ({
      id: item.id,
      tipo: "aluguel" as const,
      titulo: `Aluguel #${item.id}`,
      subtitulo: `${
        item.inquilino_detail?.nome || `Cliente ${item.inquilino}`
      } | ${item.imovel_detail?.endereco || `Imóvel ${item.imovel}`}`,
      valor: formatCurrency(item.valor_aluguel),
      data: formatDate(item.criado_em),
    }));

    const services = serviceContracts.map((item) => ({
      id: item.id,
      tipo: "servico" as const,
      titulo: `Serviço #${item.id}`,
      subtitulo: `${item.tipo_servico} | ${
        item.prestador_detail?.nome || `Prestador ${item.prestador}`
      }`,
      valor: formatCurrency(item.valor_mensal),
      data: formatDate(item.criado_em),
    }));

    return [...rental, ...services].sort((a, b) => b.id - a.id);
  }, [rentalContracts, serviceContracts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return summaries;

    return summaries.filter((item) => {
      const content = `${item.titulo} ${item.subtitulo}`.toLowerCase();
      return content.includes(query);
    });
  }, [search, summaries]);

  const downloadContract = async (item: ContractSummary) => {
    const key = `${item.tipo}-${item.id}`;
    setDownloadingKey(key);
    try {
      const rental = rentalContracts.find(
        (contract) => contract.id === item.id,
      );
      const service = serviceContracts.find(
        (contract) => contract.id === item.id,
      );
      const html = item.tipo === "aluguel"
        ? rental
          ? buildRentalContractPdfHtml(rental)
          : null
        : service
          ? buildServiceContractPdfHtml(service)
          : null;
      if (!html) {
        throw new Error("Não foi possível localizar os dados deste contrato.");
      }
      await downloadContractPdf(
        html,
        `${item.tipo === "aluguel" ? "Contrato_de_Locacao" : "Contrato_de_Servicos"}_${item.id}`,
      );
    } catch (error: any) {
      Alert.alert(
        "Erro ao gerar PDF",
        error?.message || "Não foi possível gerar o PDF do contrato.",
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  const deleteContract = (item: ContractSummary) => {
    Alert.alert(
      "Excluir contrato",
      `Deseja realmente excluir ${item.titulo.toLowerCase()}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: () => {
            const key = `${item.tipo}-${item.id}`;
            setDeletingKey(key);
            const remove =
              item.tipo === "aluguel"
                ? deleteRentalContract(item.id)
                : deleteServiceContract(item.id);
            void remove
              .then(() => {
                if (item.tipo === "aluguel") {
                  setRentalContracts((current) =>
                    current.filter((contract) => contract.id !== item.id),
                  );
                } else {
                  setServiceContracts((current) =>
                    current.filter((contract) => contract.id !== item.id),
                  );
                }
              })
              .catch((error: any) => {
                Alert.alert(
                  "Erro ao excluir",
                  error?.response?.data?.detail ||
                    error?.message ||
                    "Não foi possível excluir o contrato.",
                );
              })
              .finally(() => setDeletingKey(null));
          },
        },
      ],
    );
  };

  const renderContracts = (items: ContractSummary[]) =>
    items.length === 0 ? (
      <Text style={styles.emptyText}>Nenhum contrato encontrado.</Text>
    ) : (
      items.map((item) => {
        const key = `${item.tipo}-${item.id}`;
        return (
          <Card key={key} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.titulo}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitulo}</Text>
            <Text style={styles.itemMeta}>Valor: {item.valor}</Text>
            <Text style={styles.itemMeta}>Criado em: {item.data}</Text>
            <View style={styles.actions}>
              <Button
                label="Baixar PDF"
                variant="secondary"
                loading={downloadingKey === key}
                onPress={() => void downloadContract(item)}
                style={styles.actionButton}
              />
              <Button
                label="Excluir"
                variant="secondary"
                loading={deletingKey === key}
                onPress={() => deleteContract(item)}
                style={styles.actionButton}
              />
            </View>
          </Card>
        );
      })
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.title}>Meus Contratos</Text>
          <Text style={styles.subtitle}>
            Baixe ou exclua os contratos que você já salvou.
          </Text>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Contratos Recentes</Text>
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar contratos..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            autoCapitalize="none"
          />

          {loading ? (
            <Text style={styles.emptyText}>Carregando contratos...</Text>
          ) : (
            <View style={styles.resultsContainer}>
              <View style={styles.contractSection}>
                <Text style={styles.typeTitle}>Contratos de aluguel</Text>
                {renderContracts(
                  filtered.filter((item) => item.tipo === "aluguel"),
                )}
              </View>
              <View style={styles.contractSection}>
                <Text style={styles.typeTitle}>Contratos de serviços</Text>
                {renderContracts(
                  filtered.filter((item) => item.tipo === "servico"),
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  panel: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.text,
    opacity: 0.85,
    fontSize: 15,
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
  },
  searchInput: {
    width: "100%",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    fontSize: 18,
  },
  resultsContainer: {
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  contractSection: {
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  typeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    paddingTop: spacing.sm,
  },
  itemSubtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  itemMeta: {
    color: colors.text,
    fontSize: 13,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
});
